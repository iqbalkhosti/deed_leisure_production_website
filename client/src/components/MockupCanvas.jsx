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

function assetSources(product, side, colorSlug) {
  const folder = product === 'tshirt' ? 'gildan-64000' : product;
  const base = PRODUCT_ASSETS[product]?.[side];
  return [`/mockups/${folder}/${colorSlug}/${side}.jpg`, base].filter(Boolean);
}

const TSHIRT_MASK = 'polygon(38% 9%, 62% 9%, 76% 16%, 95% 35%, 80% 44%, 72% 34%, 72% 92%, 28% 92%, 28% 34%, 20% 44%, 5% 35%, 24% 16%)';

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
    hoodie: 'Hoodie',
    polo: 'Polo',
    tote: 'Tote Bag',
  }[product] ?? 'Product';
}

function FallbackGarment({ product, color }) {
  const tote = product === 'tote';
  const polo = product === 'polo';
  const hoodie = product === 'hoodie';

  return (
    <svg viewBox="0 0 100 125" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity=".22" /></filter>
        <linearGradient id="fabric" x1="0" x2="1" y1="0" y2="1"><stop stopColor="white" stopOpacity=".18" /><stop offset="1" stopColor="black" stopOpacity=".12" /></linearGradient>
      </defs>
      {tote ? (
        <g filter="url(#shadow)">
          <path d="M24 32h52l-5 68H29z" fill={color} />
          <path d="M36 34c0-20 28-20 28 0" fill="none" stroke={color} strokeWidth="5" />
          <path d="M24 32h52l-5 68H29z" fill="url(#fabric)" />
        </g>
      ) : (
        <g filter="url(#shadow)">
          <path d={hoodie ? 'M35 15c5 7 25 7 30 0l14 9 12 26-14 10-6-15v62H29V45l-6 15-14-10 12-26z' : 'M36 14c4 7 24 7 28 0l15 10 13 25-15 10-6-15v63H29V44l-6 16L8 50l13-25z'} fill={color} />
          {polo && <path d="M43 15l7 10 7-10m-7 10v14" fill="none" stroke="rgba(0,0,0,.28)" strokeWidth="1.5" />}
          {hoodie && <path d="M37 16c3 15 23 15 26 0M46 29l4 8m4-8-4 8" fill="none" stroke="rgba(0,0,0,.28)" strokeWidth="1.5" />}
          <path d={hoodie ? 'M35 15c5 7 25 7 30 0l14 9 12 26-14 10-6-15v62H29V45l-6 15-14-10 12-26z' : 'M36 14c4 7 24 7 28 0l15 10 13 25-15 10-6-15v63H29V44l-6 16L8 50l13-25z'} fill="url(#fabric)" />
        </g>
      )}
    </svg>
  );
}

function bounded(value) {
  return Math.min(92, Math.max(8, value));
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
  onPositionChange,
}, ref) {
  const previewRef = useRef(null);
  const dragRef = useRef(null);
  const sources = assetSources(product, side, colorSlug);
  const [assetIndex, setAssetIndex] = useState(0);
  const asset = sources[assetIndex];
  const isPhotoMockup = Boolean(asset);

  useEffect(() => {
    setAssetIndex(0);
  }, [product, side, colorSlug]);

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
        context.drawImage(mockup, 0, 0, width, height);

        if (garmentColor !== '#ffffff' && product === 'tshirt') {
          context.save();
          context.beginPath();
          context.moveTo(width * .38, height * .09);
          context.lineTo(width * .62, height * .09);
          context.lineTo(width * .76, height * .16);
          context.lineTo(width * .95, height * .35);
          context.lineTo(width * .80, height * .44);
          context.lineTo(width * .72, height * .34);
          context.lineTo(width * .72, height * .92);
          context.lineTo(width * .28, height * .92);
          context.lineTo(width * .28, height * .34);
          context.lineTo(width * .20, height * .44);
          context.lineTo(width * .05, height * .35);
          context.lineTo(width * .24, height * .16);
          context.closePath();
          context.clip();
          context.globalCompositeOperation = 'multiply';
          context.fillStyle = garmentColor;
          context.fillRect(0, 0, width, height);
          context.restore();
        }
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

      return canvas.toDataURL('image/png');
    },
  }), [asset, designImage, designScale, garmentColor, placement, position, product, rotation]);

  const startDrag = (event) => {
    if (!designImage || !previewRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, ...position };
  };

  const drag = (event) => {
    if (!dragRef.current || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    onPositionChange({
      x: bounded(dragRef.current.x + ((event.clientX - dragRef.current.pointerX) / rect.width) * 100),
      y: bounded(dragRef.current.y + ((event.clientY - dragRef.current.pointerY) / rect.height) * 100),
    });
  };

  const endDrag = () => { dragRef.current = null; };
  const artWidth = placement.width * designScale;
  const artHeight = placement.height * designScale;

  return (
    <div className="mx-auto w-full max-w-[600px]">
      <div
        ref={previewRef}
        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 shadow-inner"
        aria-label={`${productLabel(product)} ${side} mockup`}
      >
        {isPhotoMockup ? (
          <>
            <img src={asset} alt={`${productLabel(product)} ${side} view`} className="absolute inset-0 h-full w-full object-cover" onError={() => setAssetIndex((current) => current + 1)} />
            {garmentColor !== '#ffffff' && product === 'tshirt' ? (
              <span className="pointer-events-none absolute inset-0 mix-blend-multiply" style={{ backgroundColor: garmentColor, clipPath: TSHIRT_MASK }} />
            ) : null}
          </>
        ) : (
          <>
            <FallbackGarment product={product} color={garmentColor} />
            <div className="absolute inset-x-8 bottom-5 rounded-lg bg-white/90 px-3 py-2 text-center text-xs text-slate-600 shadow-sm">
              Add <code className="font-mono">public/mockups/{product === 'tshirt' ? 'gildan-64000' : product}/{colorSlug}/{side}.jpg</code> for this photo mockup.
            </div>
          </>
        )}

        <div
          className="pointer-events-none absolute border-2 border-dashed border-primary/70 bg-primary/10"
          style={{
            left: `${placement.x - placement.width / 2}%`,
            top: `${placement.y - placement.height / 2}%`,
            width: `${placement.width}%`,
            height: `${placement.height}%`,
          }}
        >
          <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">{placement.name} · up to {placement.size}</span>
        </div>

        {designImage ? (
          <img
            src={designImage}
            alt="Your uploaded artwork"
            draggable="false"
            onPointerDown={startDrag}
            onPointerMove={drag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="absolute z-10 max-h-none cursor-grab select-none object-contain touch-none active:cursor-grabbing"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${artWidth}%`,
              height: `${artHeight}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
          />
        ) : null}
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Drag your artwork to fine-tune its position. The dashed zone marks the standard maximum decoration area.</p>
    </div>
  );
});

export default MockupCanvas;
