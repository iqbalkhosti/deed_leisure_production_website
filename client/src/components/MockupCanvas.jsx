import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const PRODUCT_ASSETS = {
  tshirt: {
    front: '/mockups/gildan-64000/front.jpg',
    back: '/mockups/gildan-64000/back.jpg',
  },
  hoodie: {
    front: '/mockups/hoodie/front.jpg',
    back: '/mockups/hoodie/back.jpg',
  },
  polo: {
    front: '/mockups/polo/front.jpg',
    back: '/mockups/polo/back.jpg',
  },
  tote: {
    front: '/mockups/tote/front.jpg',
    back: '/mockups/tote/back.jpg',
  },
};

const PRODUCT_MASKS = {
  tshirt: {
    front: [[.38, .088], [.62, .088], [.80, .156], [.955, .35], [.78, .425], [.746, .345], [.746, .92], [.254, .92], [.254, .345], [.22, .425], [.045, .35], [.20, .156]],
    back: [[.39, .075], [.61, .075], [.775, .15], [.955, .35], [.78, .425], [.745, .34], [.725, .90], [.62, .93], [.38, .93], [.275, .90], [.255, .34], [.22, .425], [.045, .35], [.225, .15]],
  },
  hoodie: {
    points: [[.37, .08], [.63, .08], [.79, .17], [.94, .41], [.84, .48], [.76, .40], [.75, .94], [.25, .94], [.24, .40], [.16, .48], [.06, .41], [.21, .17]],
  },
  polo: {
    points: [[.37, .08], [.63, .08], [.80, .18], [.95, .35], [.80, .43], [.72, .34], [.71, .94], [.29, .94], [.28, .34], [.20, .43], [.05, .35], [.20, .18]],
  },
};

function assetSources(product, side, colorSlug) {
  const folder = product === 'tshirt' ? 'gildan-64000' : product;
  const base = PRODUCT_ASSETS[product]?.[side];
  return [`/mockups/${folder}/${colorSlug}/${side}.jpg`, base].filter(Boolean);
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function productLabel(product) {
  return {
    tshirt: 'Gildan Softstyle 64000 T-Shirt',
    hoodie: 'Gildan Heavy Blend Hoodie',
    polo: 'M&O Ring-Spun Piqué Polo',
    tote: 'Tote Bag',
  }[product] ?? 'Product';
}

function FallbackGarment({ product, color }) {
  const tote = product === 'tote';
  return (
    <svg viewBox="0 0 100 125" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs><filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity=".22" /></filter><linearGradient id="fabric" x1="0" x2="1" y1="0" y2="1"><stop stopColor="white" stopOpacity=".18" /><stop offset="1" stopColor="black" stopOpacity=".12" /></linearGradient></defs>
      {tote ? <g filter="url(#shadow)"><path d="M24 32h52l-5 68H29z" fill={color} /><path d="M36 34c0-20 28-20 28 0" fill="none" stroke={color} strokeWidth="5" /><path d="M24 32h52l-5 68H29z" fill="url(#fabric)" /></g> : <g filter="url(#shadow)"><path d="M36 14c4 7 24 7 28 0l15 10 13 25-15 10-6-15v63H29V44l-6 16L8 50l13-25z" fill={color} /><path d="M36 14c4 7 24 7 28 0l15 10 13 25-15 10-6-15v63H29V44l-6 16L8 50l13-25z" fill="url(#fabric)" /></g>}
    </svg>
  );
}

function bounded(value) {
  return Math.min(92, Math.max(8, value));
}

function tintGarment(context, product, side, color, width, height) {
  const productMask = PRODUCT_MASKS[product];
  const mask = productMask?.[side] ?? productMask;
  const points = Array.isArray(mask) ? mask : mask?.points;
  if (!points || color === '#ffffff') return;
  context.save();
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(width * x, height * y);
    else context.lineTo(width * x, height * y);
  });
  context.closePath();
  context.clip();
  context.globalCompositeOperation = 'multiply';
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
  context.restore();
}

function drawMockupPhoto(context, image, product, side, color, width, height, shouldTint) {
  context.drawImage(image, 0, 0, width, height);
  if (shouldTint) tintGarment(context, product, side, color, width, height);
}

function ProductPhoto({ asset, product, side, garmentColor, shouldTint, onError }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      drawMockupPhoto(context, image, product, side, garmentColor, canvas.width, canvas.height, shouldTint);
    };
    image.onerror = () => {
      if (!cancelled) onError();
    };
    image.src = asset;
    return () => { cancelled = true; };
  }, [asset, garmentColor, onError, product, shouldTint, side]);

  return <canvas ref={canvasRef} role="img" aria-label={`${productLabel(product)} ${side} view`} className="absolute inset-0 h-full w-full object-cover" />;
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
  colorSlug,
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
  const sources = assetSources(product, side, colorSlug);
  const [assetIndex, setAssetIndex] = useState(0);
  const asset = sources[assetIndex];
  const isPhotoMockup = Boolean(asset);
  const hasText = Boolean(textValue?.trim());
  const usesColorSpecificPhoto = assetIndex === 0 && colorSlug !== 'white';

  useEffect(() => { setAssetIndex(0); }, [product, side, colorSlug]);

  useImperativeHandle(ref, () => ({
    async toDataUrl() {
      const width = 1200;
      const height = 1500;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      context.fillStyle = '#f8fafc';
      context.fillRect(0, 0, width, height);

      try {
        const mockup = await loadImage(asset);
        drawMockupPhoto(context, mockup, product, side, garmentColor, width, height, !usesColorSpecificPhoto);
      } catch {
        context.fillStyle = garmentColor;
        context.fillRect(width * .27, height * .15, width * .46, height * .72);
      }

      if (designImage) {
        const art = await loadImage(designImage);
        const maxWidth = width * (placement.width / 100) * designScale;
        const maxHeight = height * (placement.height / 100) * designScale;
        const ratio = Math.min(maxWidth / art.naturalWidth, maxHeight / art.naturalHeight);
        const artWidth = art.naturalWidth * ratio;
        const artHeight = art.naturalHeight * ratio;
        context.save();
        context.translate(width * (position.x / 100), height * (position.y / 100));
        context.rotate((rotation * Math.PI) / 180);
        context.drawImage(art, -artWidth / 2, -artHeight / 2, artWidth, artHeight);
        context.restore();
      }

      if (hasText) {
        const fontSize = textSize * 2;
        context.save();
        context.font = `700 ${fontSize}px ${textFont}`;
        context.fillStyle = textColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const lines = wrapText(context, textValue.trim(), width * (placement.width / 100) * 1.2);
        const lineHeight = fontSize * 1.15;
        const firstLineY = height * (textPosition.y / 100) - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, index) => context.fillText(line, width * (textPosition.x / 100), firstLineY + index * lineHeight));
        context.restore();
      }

      return canvas.toDataURL('image/png');
    },
  }), [asset, designImage, designScale, garmentColor, hasText, placement, position, product, rotation, side, textColor, textFont, textPosition, textSize, textValue, usesColorSpecificPhoto]);

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
  const nudgeText = (event) => {
    const nudges = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };
    const nudge = nudges[event.key];
    if (!nudge) return;
    event.preventDefault();
    onActiveLayerChange('text');
    onTextPositionChange({ x: bounded(textPosition.x + nudge.x), y: bounded(textPosition.y + nudge.y) });
  };
  const artWidth = placement.width * designScale;
  const artHeight = placement.height * designScale;

  return (
    <div className="mx-auto w-full max-w-[600px]">
      <div ref={previewRef} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 shadow-inner" aria-label={`${productLabel(product)} ${side} mockup`}>
        {isPhotoMockup ? <>
          <ProductPhoto asset={asset} product={product} side={side} garmentColor={garmentColor} shouldTint={!usesColorSpecificPhoto} onError={() => setAssetIndex((current) => current + 1)} />
        </> : <><FallbackGarment product={product} color={garmentColor} /><div className="absolute inset-x-8 bottom-5 rounded-lg bg-white/90 px-3 py-2 text-center text-xs text-slate-600 shadow-sm">Add <code className="font-mono">public/mockups/{product === 'tshirt' ? 'gildan-64000' : product}/{colorSlug}/{side}.jpg</code> for this photo mockup.</div></>}

        <div className="pointer-events-none absolute border-2 border-dashed border-primary/70 bg-primary/10" style={{ left: `${placement.x - placement.width / 2}%`, top: `${placement.y - placement.height / 2}%`, width: `${placement.width}%`, height: `${placement.height}%` }}><span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">{placement.name} · up to {placement.size}</span></div>

        {designImage ? <img src={designImage} alt="Your uploaded artwork" draggable="false" onPointerDown={(event) => startDrag(event, 'art')} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag} className={`absolute z-10 max-h-none cursor-grab select-none object-contain touch-none active:cursor-grabbing ${activeLayer === 'art' ? 'outline outline-2 outline-primary/70 outline-offset-2' : ''}`} style={{ left: `${position.x}%`, top: `${position.y}%`, width: `${artWidth}%`, height: `${artHeight}%`, transform: `translate(-50%, -50%) rotate(${rotation}deg)` }} /> : null}
        {hasText ? <div role="button" tabIndex="0" aria-label="Move text. Use arrow keys for precise placement." onPointerDown={(event) => startDrag(event, 'text')} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={nudgeText} className={`absolute z-20 w-[48%] cursor-grab select-none whitespace-pre-wrap break-words px-1 text-center font-bold leading-tight touch-none active:cursor-grabbing ${activeLayer === 'text' ? 'outline outline-2 outline-primary/70 outline-offset-2' : ''}`} style={{ left: `${textPosition.x}%`, top: `${textPosition.y}%`, color: textColor, fontFamily: textFont, fontSize: `${textSize}px`, transform: 'translate(-50%, -50%)' }}>{textValue}</div> : null}
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Drag your artwork or text to fine-tune its position. The dashed zone marks the standard maximum decoration area.</p>
    </div>
  );
});

export default MockupCanvas;
