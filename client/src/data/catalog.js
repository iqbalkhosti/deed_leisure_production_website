// ─── Product catalogue ───────────────────────────────────────────────────────
// Shared by the Products page, the Design Studio, and the home page showcase so
// a garment or colour is described in exactly one place.

export const GARMENT_COLORS = [
  { name: 'White', slug: 'white', value: '#ffffff', dark: false },
  { name: 'Black', slug: 'black', value: '#171717', dark: true },
  { name: 'Navy', slug: 'navy', value: '#172554', dark: true },
  { name: 'Sport Grey', slug: 'sport-grey', value: '#b7bbc2', dark: false },
  { name: 'Red', slug: 'red', value: '#b91c1c', dark: true },
  { name: 'Royal', slug: 'royal', value: '#1d4ed8', dark: true },
  { name: 'Forest', slug: 'forest', value: '#166534', dark: true },
  { name: 'Maroon', slug: 'maroon', value: '#7f1d1d', dark: true },
];

/**
 * No prices here on purpose. Cost depends on quantity, decoration method, and
 * colour count, so a published figure would be wrong more often than right —
 * every product points people at a quote instead.
 */
export const PRODUCTS = [
  {
    id: 'tshirt',
    name: 'T-Shirt',
    blank: 'Gildan Softstyle 64000',
    summary: 'Ring-spun cotton with a soft hand feel. The default for club merch and events.',
    specs: ['100% ring-spun cotton, 4.5 oz', 'Unisex XS–3XL', 'Screen print, DTF, or embroidery'],
    studio: true,
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    blank: 'Gildan Heavy Blend 18500',
    summary: 'Heavyweight fleece that holds a bold print. The piece people actually keep wearing.',
    specs: ['50/50 cotton-poly, 8.0 oz', 'Unisex S–3XL', 'Screen print, DTF, or embroidery'],
    studio: true,
  },
  {
    id: 'polo',
    name: 'Polo',
    blank: 'M&O Ring-Spun Piqué 7002',
    summary: 'Structured piqué for exec teams, conference staff, and anything semi-formal.',
    specs: ['100% ring-spun cotton piqué', 'Unisex S–2XL', 'Embroidery recommended'],
    studio: true,
  },
  {
    id: 'headwear',
    name: 'Hats & bags',
    blank: 'Caps, beanies, totes, duffels',
    summary: 'Curved and structured items we mock up with you, since seams affect placement.',
    specs: ['Structured and unstructured caps', 'Cotton totes and duffels', 'Embroidery or heat transfer'],
    studio: false,
  },
];

export const DECORATION_METHODS = [
  {
    name: 'Screen printing',
    best: 'Larger runs, one to four solid colours',
    detail: 'The lowest per-piece cost once you pass about 24 items, and the most durable finish for simple, bold artwork.',
  },
  {
    name: 'DTF transfer',
    best: 'Small runs and full-colour artwork',
    detail: 'Prints photographic detail and unlimited colours with no screen setup, so short runs stay affordable.',
  },
  {
    name: 'Embroidery',
    best: 'Polos, hats, and left-chest logos',
    detail: 'Stitched thread that reads as premium. Priced by stitch count rather than colour count.',
  },
];

export default PRODUCTS;
