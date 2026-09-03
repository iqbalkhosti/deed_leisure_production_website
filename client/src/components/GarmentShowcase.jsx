import React, { useEffect, useRef, useState } from 'react';
import { renderGarment } from '../lib/garmentRecolor';
import { GARMENT_COLORS } from '../data/catalog';

/**
 * A live product photo, tinted through the same engine the Design Studio uses.
 *
 * Two reasons to render rather than ship a folder of colourways: the marketing
 * pages stay in step with the studio automatically, and every colour costs
 * nothing extra to serve.
 */
export default function GarmentShowcase({
  product = 'tshirt',
  side = 'front',
  colors = ['#171717', '#172554', '#b91c1c', '#166534'],
  interval = 2600,
  className = '',
  label,
}) {
  const canvasRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const src = `/mockups/${product === 'tshirt' ? 'gildan-64000' : product}/${side}.jpg`;
  // Depend on the colour string, not the array — callers pass array literals.
  const activeColor = colors[index] ?? '#ffffff';

  useEffect(() => {
    // interval <= 0 means "let the visitor click through the swatches instead".
    if (colors.length < 2 || interval <= 0) return undefined;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % colors.length), interval);
    return () => clearInterval(timer);
  }, [colors.length, interval]);

  useEffect(() => {
    let cancelled = false;
    renderGarment(src, activeColor)
      .then((source) => {
        if (cancelled || !canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = source.naturalWidth ?? source.width;
        canvas.height = source.naturalHeight ?? source.height;
        canvas.getContext('2d').drawImage(source, 0, 0);
        setReady(true);
      })
      .catch(() => { /* Leave the placeholder in place if the photo is missing. */ });
    return () => { cancelled = true; };
  }, [src, activeColor]);

  const swatchName = GARMENT_COLORS.find((color) => color.value === activeColor)?.name;

  return (
    <figure className={`relative ${className}`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label ?? `Custom ${product} shown in ${swatchName ?? 'a range of colours'}`}
          className={`h-full w-full object-contain transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      {colors.length > 1 ? (
        <figcaption className="mt-4 flex items-center justify-center gap-2">
          {colors.map((color, position) => (
            <button
              key={color}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={GARMENT_COLORS.find((entry) => entry.value === color)?.name ?? color}
              aria-pressed={position === index}
              className={`h-5 w-5 rounded-full border-2 transition ${position === index ? 'scale-110 border-primary' : 'border-slate-300 hover:scale-105'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </figcaption>
      ) : null}
    </figure>
  );
}
