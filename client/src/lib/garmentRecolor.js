/**
 * Garment recolouring for the Design Studio.
 *
 * The mockup photos are white garments shot on a pure-white background. To show
 * any other colour we need to know which pixels are fabric, then tint only those
 * while keeping the photo's own shading, folds, and seams.
 *
 * Separating fabric from backdrop is the hard part: both are near-white. Two
 * signals do it reliably:
 *
 *   1. Brightness — the backdrop is at or near 255.
 *   2. Flatness   — the backdrop is *perfectly* flat (zero local variation),
 *                   while even a blown-out fabric highlight carries weave
 *                   texture. Seeding the flood fill from flat pixels only stops
 *                   it from escaping along a bright hem into the garment.
 *
 * So: flood-fill the backdrop from the frame edge through flat, bright pixels;
 * erode first to break one-pixel bridges, then dilate back (bounded by the
 * brightness test) so the silhouette lands on the real edge rather than a few
 * pixels inside it. Feather the result for anti-aliasing.
 *
 * Masks are expensive-ish (~50 ms) but depend only on the photo, so they are
 * computed once per image and cached; recolouring is cheap and cached per
 * colour. Everything runs in the browser — no pre-baked mask assets to keep in
 * sync, so dropping a new product photo into /public/mockups just works.
 */

// Backdrop must be at least this bright (max of R,G,B).
const BRIGHT_THRESHOLD = 250;
// ...and vary by no more than this across its 3x3 neighbourhood.
const FLATNESS_TOLERANCE = 1;
// Radii scale with the image so a smaller photo is not over-eroded.
const ERODE_FRACTION = 1 / 500; // ~2px at 1000px wide — breaks thin bridges
const DILATE_FRACTION = 7 / 1000; // ~7px — reclaims the anti-aliased rim
// Fabric luminance mapped to "full colour". Below the very brightest specular
// highlights, so mid-tones keep their depth instead of washing out.
const LUMINANCE_PERCENTILE = 0.88;
const HIGHLIGHT_CEILING = 1.3; // clamp for luminance / reference
const HIGHLIGHT_LIFT = 0.35; // how much specular highlight survives tinting

const garmentCache = new Map(); // src -> Promise<Garment>
const recolorCache = new Map(); // `${src}|${hex}` -> HTMLCanvasElement
const RECOLOR_CACHE_LIMIT = 24;

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

function parseHex(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** Summed-area table so box windows cost O(1) each regardless of radius. */
function integralOf(flags, width, height) {
  // One extra row/column of zeroes removes the bounds checks from the hot loop.
  const sum = new Int32Array((width + 1) * (height + 1));
  for (let y = 0; y < height; y += 1) {
    let rowSum = 0;
    const row = y * width;
    const out = (y + 1) * (width + 1);
    const prev = y * (width + 1);
    for (let x = 0; x < width; x += 1) {
      rowSum += flags[row + x];
      sum[out + x + 1] = sum[prev + x + 1] + rowSum;
    }
  }
  return sum;
}

/**
 * Box morphology on a binary mask. `mode` 'erode' keeps a pixel only when the
 * whole window is set; 'dilate' keeps it when any of the window is. Windows are
 * clipped at the frame, and compared against the clipped area, so the border
 * behaves like an open edge rather than an artificial wall.
 */
function morph(flags, width, height, radius, mode) {
  if (radius < 1) return flags;
  const sum = integralOf(flags, width, height);
  const out = new Uint8Array(width * height);
  const stride = width + 1;
  for (let y = 0; y < height; y += 1) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(height, y + radius + 1);
    const top = y0 * stride;
    const bottom = y1 * stride;
    for (let x = 0; x < width; x += 1) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width, x + radius + 1);
      const count = sum[bottom + x1] - sum[bottom + x0] - sum[top + x1] + sum[top + x0];
      out[y * width + x] = mode === 'erode'
        ? (count === (x1 - x0) * (y1 - y0) ? 1 : 0)
        : (count > 0 ? 1 : 0);
    }
  }
  return out;
}

/** 4-connected flood fill inwards from every frame edge pixel. */
function floodFromEdges(candidate, width, height) {
  const filled = new Uint8Array(width * height);
  const stack = new Int32Array(width * height);
  let top = 0;

  const push = (index) => {
    if (candidate[index] && !filled[index]) {
      filled[index] = 1;
      stack[top] = index;
      top += 1;
    }
  };

  for (let x = 0; x < width; x += 1) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    push(y * width);
    push(y * width + width - 1);
  }

  while (top > 0) {
    top -= 1;
    const index = stack[top];
    const x = index % width;
    if (x > 0) push(index - 1);
    if (x < width - 1) push(index + 1);
    if (index >= width) push(index - width);
    if (index < (height - 1) * width) push(index + width);
  }
  return filled;
}

/** Separable [1,2,1] blur, run twice — a cheap stand-in for a ~1px Gaussian. */
function feather(mask, width, height, passes = 2) {
  let current = mask;
  for (let pass = 0; pass < passes; pass += 1) {
    const horizontal = new Float32Array(width * height);
    for (let y = 0; y < height; y += 1) {
      const row = y * width;
      for (let x = 0; x < width; x += 1) {
        const left = current[row + Math.max(0, x - 1)];
        const right = current[row + Math.min(width - 1, x + 1)];
        horizontal[row + x] = (left + 2 * current[row + x] + right) / 4;
      }
    }
    const vertical = new Float32Array(width * height);
    for (let y = 0; y < height; y += 1) {
      const up = Math.max(0, y - 1) * width;
      const down = Math.min(height - 1, y + 1) * width;
      const row = y * width;
      for (let x = 0; x < width; x += 1) {
        vertical[row + x] = (horizontal[up + x] + 2 * horizontal[row + x] + horizontal[down + x]) / 4;
      }
    }
    current = vertical;
  }
  return current;
}

function buildGarment(image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, width, height);

  const pixels = width * height;
  const grey = new Uint8Array(pixels);
  const bright = new Uint8Array(pixels);
  const luminance = new Uint8Array(pixels);

  for (let i = 0; i < pixels; i += 1) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    grey[i] = (r * 77 + g * 151 + b * 28) >> 8;
    luminance[i] = (r + g + b) / 3;
    bright[i] = Math.max(r, g, b) >= BRIGHT_THRESHOLD ? 1 : 0;
  }

  // Flat = low 3x3 range. Pure backdrop scores 0; fabric weave never does.
  const flatBright = new Uint8Array(pixels);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (!bright[index]) continue;
      let min = 255;
      let max = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        const ny = Math.min(height - 1, Math.max(0, y + dy));
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          const value = grey[ny * width + nx];
          if (value < min) min = value;
          if (value > max) max = value;
        }
      }
      flatBright[index] = max - min <= FLATNESS_TOLERANCE ? 1 : 0;
    }
  }

  const erodeRadius = Math.max(1, Math.round(width * ERODE_FRACTION));
  const dilateRadius = Math.max(2, Math.round(width * DILATE_FRACTION));
  const seed = floodFromEdges(morph(flatBright, width, height, erodeRadius, 'erode'), width, height);
  const grown = morph(seed, width, height, dilateRadius, 'dilate');

  const coverage = new Float32Array(pixels);
  for (let i = 0; i < pixels; i += 1) {
    coverage[i] = grown[i] && bright[i] ? 0 : 1;
  }

  // Reference luminance: the 88th percentile of the fabric, via a histogram.
  const histogram = new Int32Array(256);
  let fabricCount = 0;
  for (let i = 0; i < pixels; i += 1) {
    if (coverage[i] > 0.5) {
      histogram[luminance[i]] += 1;
      fabricCount += 1;
    }
  }
  let reference = 235;
  if (fabricCount > 0) {
    const target = fabricCount * LUMINANCE_PERCENTILE;
    let running = 0;
    for (let value = 0; value < 256; value += 1) {
      running += histogram[value];
      if (running >= target) {
        reference = Math.max(1, value);
        break;
      }
    }
  }

  return {
    width,
    height,
    pixels: data,
    alpha: feather(coverage, width, height),
    reference: reference / 255,
    fabricRatio: fabricCount / pixels,
  };
}

/**
 * Load a mockup photo and derive its fabric mask. Cached per source, so
 * switching colours or flipping front/back never recomputes it.
 */
export function loadGarment(src) {
  if (!garmentCache.has(src)) {
    garmentCache.set(
      src,
      loadImage(src).then((image) => ({ image, ...buildGarment(image) })),
    );
  }
  return garmentCache.get(src);
}

function rememberRecolor(key, canvas) {
  recolorCache.set(key, canvas);
  if (recolorCache.size > RECOLOR_CACHE_LIMIT) {
    recolorCache.delete(recolorCache.keys().next().value);
  }
  return canvas;
}

/**
 * Tint a loaded garment to `hex`, keeping the photo's shading. Returns a canvas
 * sized to the source photo, safe to draw into a preview or an export.
 */
export function recolorGarment(garment, hex, src) {
  const key = `${src}|${hex.toLowerCase()}`;
  const cached = recolorCache.get(key);
  if (cached) return cached;

  const { width, height, pixels, alpha, reference } = garment;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const output = context.createImageData(width, height);
  const [red, green, blue] = parseHex(hex);
  const target = [red, green, blue];

  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;
    const cover = alpha[i];
    output.data[offset + 3] = 255;

    if (cover <= 0.002) {
      output.data[offset] = pixels[offset];
      output.data[offset + 1] = pixels[offset + 1];
      output.data[offset + 2] = pixels[offset + 2];
      continue;
    }

    const shade = (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 765;
    const normalised = Math.min(shade / reference, HIGHLIGHT_CEILING);
    const specular = Math.min(Math.max((normalised - 1) / (HIGHLIGHT_CEILING - 1), 0), 1) * HIGHLIGHT_LIFT;

    for (let channel = 0; channel < 3; channel += 1) {
      const shaded = Math.min(255, target[channel] * normalised);
      const tinted = shaded + (255 - shaded) * specular;
      output.data[offset + channel] = pixels[offset + channel] * (1 - cover) + tinted * cover;
    }
  }

  context.putImageData(output, 0, 0);
  return rememberRecolor(key, canvas);
}

/** True when the colour is close enough to the photo that tinting is pointless. */
export function isNearWhite(hex) {
  const [r, g, b] = parseHex(hex);
  return r >= 248 && g >= 248 && b >= 248;
}

/**
 * The one call the UI needs: give it a photo and a colour, get back something
 * drawable (the original image for white, a tinted canvas otherwise).
 */
export async function renderGarment(src, hex) {
  const garment = await loadGarment(src);
  if (isNearWhite(hex)) return garment.image;
  return recolorGarment(garment, hex, src);
}
