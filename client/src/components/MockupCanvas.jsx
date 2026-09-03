import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { renderGarment, loadImage } from '../lib/garmentRecolor';

export const PRODUCT_ASSETS = {
  tshirt: { folder: 'gildan-64000', label: 'Gildan Softstyle 64000 T-Shirt' },
  hoodie: { folder: 'hoodie', label: 'Gildan Heavy Blend Hoodie' },
  polo: { folder: 'polo', label: 'M&O Ring-Spun Piqué Polo' },
};

const EXPORT_WIDTH = 1200;
const EXPORT_HEIGHT = 1500;

export function assetFor(product, side) {
  const folder = PRODUCT_ASSETS[product]?.folder;
  return folder ? `/mockups/${folder}/${side}.jpg` : null;
}

function productLabel(product) {
  return PRODUCT_ASSETS[product]?.label ?? 'Product';
}

function bounded(value) {
  return Math.min(92, Math.max(8, value));
}

function wrapText(context, value, maxWidth) {
  return value.split('\n').flatMap((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [''];
    return words.reduce((lines, word) => {
      const current = lines.at(-1);
      const next = current ? `${current} ${word}` : word;
      if (context.measureText(next).width > maxWidth && current) lines.push(word);
      else lines[lines.length - 1] = next;
      return lines;
    }, ['']);
  });
}

const MockupCanvas = forwardRef(function MockupCanvas({
  product,
  side,
  garmentColor,
  designImage,
  placement,
  position,
  designScale,
  rotation,
  textValue,
  textFont,
  textColor,
  textSize,
  textPosition,
  activeLayer,
  onPositionChange,
  onTextPositionChange,
  onActiveLayerChange,
}, ref) {
  const previewRef = useRef(null);
  const dragRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const asset = assetFor(product, side);
  const hasText = Boolean(textValue?.trim());

  // Paint the (recoloured) garment photo into the preview canvas. The mask
  // behind renderGarment is cached per photo, so only the first paint of a
  // given product/side does real work.
  useEffect(() => {
    let cancelled = false;
    if (!asset) {
      setStatus('missing');
      return undefined;
    }
    setStatus('loading');
    renderGarment(asset, garmentColor)
      .then((source) => {
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const width = source.naturalWidth ?? source.width;
        const height = source.naturalHeight ?? source.height;
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, width, height);
        context.drawImage(source, 0, 0);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('missing');
      });
    return () => { cancelled = true; };
  }, [asset, garmentColor]);

  useImperativeHandle(ref, () => ({
    /**
     * Flattened image of exactly what the preview shows, at print-review size.
     * PNG for the customer's download; JPEG when it has to travel inside a
     * request body, where Vercel caps us at 4.5 MB.
     */
    async toDataUrl({ format = 'image/png', quality = 0.92 } = {}) {
      const canvas = document.createElement('canvas');
      canvas.width = EXPORT_WIDTH;
      canvas.height = EXPORT_HEIGHT;
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

      if (asset) {
        try {
          const source = await renderGarment(asset, garmentColor);
          context.drawImage(source, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
        } catch {
          // Fall through to a plain background rather than failing the export.
        }
      }

      if (designImage) {
        const art = await loadImage(designImage);
        const maxWidth = EXPORT_WIDTH * (placement.width / 100) * designScale;
        const maxHeight = EXPORT_HEIGHT * (placement.height / 100) * designScale;
        const ratio = Math.min(maxWidth / art.naturalWidth, maxHeight / art.naturalHeight);
        const artWidth = art.naturalWidth * ratio;
        const artHeight = art.naturalHeight * ratio;
        context.save();
        context.translate(EXPORT_WIDTH * (position.x / 100), EXPORT_HEIGHT * (position.y / 100));
        context.rotate((rotation * Math.PI) / 180);
        context.drawImage(art, -artWidth / 2, -artHeight / 2, artWidth, artHeight);
        context.restore();
      }

      if (hasText) {
        // Text is sized in CSS pixels against the preview box, which is capped
        // at 600px but narrower on small screens. Scale by the box's real width
        // so the export matches what the customer approved, whatever the device.
        const previewWidth = previewRef.current?.getBoundingClientRect().width || 600;
        const fontSize = textSize * (EXPORT_WIDTH / previewWidth);
        context.save();
        context.font = `700 ${fontSize}px ${textFont}`;
        context.fillStyle = textColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const lines = wrapText(context, textValue.trim(), EXPORT_WIDTH * 0.48);
        const lineHeight = fontSize * 1.15;
        const firstLineY = EXPORT_HEIGHT * (textPosition.y / 100) - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, index) => (
          context.fillText(line, EXPORT_WIDTH * (textPosition.x / 100), firstLineY + index * lineHeight)
        ));
        context.restore();
      }

      return canvas.toDataURL(format, quality);
    },
  }), [asset, designImage, designScale, garmentColor, hasText, placement, position, rotation,
    textColor, textFont, textPosition, textSize, textValue]);

  const startDrag = (event, layer) => {
    const currentPosition = layer === 'text' ? textPosition : position;
    if (!currentPosition || !previewRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    onActiveLayerChange(layer);
    dragRef.current = { layer, pointerX: event.clientX, pointerY: event.clientY, ...currentPosition };
  };

  const drag = (event) => {
    if (!dragRef.current || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const nextPosition = {
      x: bounded(dragRef.current.x + ((event.clientX - dragRef.current.pointerX) / rect.width) * 100),
      y: bounded(dragRef.current.y + ((event.clientY - dragRef.current.pointerY) / rect.height) * 100),
    };
    if (dragRef.current.layer === 'text') onTextPositionChange(nextPosition);
    else onPositionChange(nextPosition);
  };

  const endDrag = () => { dragRef.current = null; };

  const nudge = (event, layer) => {
    const moves = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    onActiveLayerChange(layer);
    const current = layer === 'text' ? textPosition : position;
    const next = { x: bounded(current.x + move.x), y: bounded(current.y + move.y) };
    if (layer === 'text') onTextPositionChange(next);
    else onPositionChange(next);
  };

  const artWidth = placement.width * designScale;
  const artHeight = placement.height * designScale;

  return (
    <div className="mx-auto w-full max-w-[600px]">
      <div
        ref={previewRef}
        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-inner ring-1 ring-slate-200"
        aria-label={`${productLabel(product)} ${side} mockup`}
      >
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        />

        {status === 'loading' ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-50">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
            <span className="sr-only">Preparing the mockup</span>
          </div>
        ) : null}

        {status === 'missing' ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-50 p-6 text-center text-sm text-slate-500">
            <p>
              No product photo for this view yet. Add
              {' '}
              <code className="font-mono text-xs">public/mockups/{PRODUCT_ASSETS[product]?.folder ?? product}/{side}.jpg</code>
              {' '}
              to enable it.
            </p>
          </div>
        ) : null}

        <div
          className="pointer-events-none absolute border-2 border-dashed border-primary/70 bg-primary/10"
          style={{
            left: `${placement.x - placement.width / 2}%`,
            top: `${placement.y - placement.height / 2}%`,
            width: `${placement.width}%`,
            height: `${placement.height}%`,
          }}
        >
          {/* The full dimensions overflow a phone-width preview, so keep them
              for the roomier layouts and show just the placement on small screens. */}
          <span className="absolute -top-6 left-0 max-w-full truncate rounded bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            {placement.name}
            <span className="hidden sm:inline"> · up to {placement.size}</span>
          </span>
        </div>

        {designImage ? (
          <img
            src={designImage}
            alt="Your uploaded artwork"
            draggable="false"
            role="button"
            tabIndex="0"
            aria-label="Move artwork. Use arrow keys for precise placement."
            onPointerDown={(event) => startDrag(event, 'art')}
            onPointerMove={drag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={(event) => nudge(event, 'art')}
            className={`absolute z-10 max-h-none cursor-grab select-none object-contain touch-none active:cursor-grabbing ${activeLayer === 'art' ? 'outline outline-2 outline-primary/70 outline-offset-2' : ''}`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${artWidth}%`,
              height: `${artHeight}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
          />
        ) : null}

        {hasText ? (
          <div
            role="button"
            tabIndex="0"
            aria-label="Move text. Use arrow keys for precise placement."
            onPointerDown={(event) => startDrag(event, 'text')}
            onPointerMove={drag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={(event) => nudge(event, 'text')}
            className={`absolute z-20 w-[48%] cursor-grab select-none whitespace-pre-wrap break-words px-1 text-center font-bold leading-tight touch-none active:cursor-grabbing ${activeLayer === 'text' ? 'outline outline-2 outline-primary/70 outline-offset-2' : ''}`}
            style={{
              left: `${textPosition.x}%`,
              top: `${textPosition.y}%`,
              color: textColor,
              fontFamily: textFont,
              fontSize: `${textSize}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {textValue}
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        Drag your artwork or text to fine-tune its position, or select it and nudge with the arrow keys.
        The dashed zone marks the standard maximum decoration area.
      </p>
    </div>
  );
});

export default MockupCanvas;
