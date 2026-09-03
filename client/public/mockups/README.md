# Design Studio mockup photos

One front and one back JPG per product:

```
gildan-64000/front.jpg   gildan-64000/back.jpg
hoodie/front.jpg         hoodie/back.jpg
polo/front.jpg           polo/back.jpg
```

**There are no per-colour folders.** Colours are rendered from these photos at
runtime, so adding a colour costs nothing — see "How garment colours work" in
the root README.

For the masking to work, a photo needs:

- a **pure white** background (255, 255, 255) reaching every frame edge,
- a **white or very light** garment, so tinting has its full range,
- a visible edge between garment and backdrop. A blown-out hem that merges into
  the background gets cut slightly short.

Around 1000×1250 keeps the mask build fast and the export sharp.

To add a product: drop the two files in a new folder here, add the product to
`client/src/data/catalog.js`, and map its id to this folder in `PRODUCT_ASSETS`
in `client/src/components/MockupCanvas.jsx`.
