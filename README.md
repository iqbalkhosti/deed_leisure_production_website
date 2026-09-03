# Deed Leisure

Marketing site and Design Studio for a small custom-apparel business. Static
React front end plus two serverless functions for the enquiry forms — no
database, no accounts, no payment processing. It deploys to Vercel as-is.

---

## Run it

```bash
npm --prefix client install
npm --prefix client run dev
```

The site is then at <http://localhost:3000>. That serves the React app only;
the `/api` functions need the Vercel CLI:

```bash
npx vercel dev
```

Build a production bundle:

```bash
npm run build
```

---

## What's here

```
client/                     React + Vite front end
  public/mockups/           Product photos — white garment on white background
  src/
    components/
      MockupCanvas.jsx      The Design Studio preview and PNG export
      GarmentShowcase.jsx   Live recoloured product photo used on marketing pages
      QuoteForm.jsx         The one enquiry form, shared by every audience page
    data/
      site.js               Business details — edit these, not the components
      catalog.js            Products, prices, colours, decoration methods
      faq.json              FAQ page and the chatbot's answers
    hooks/useSeo.js         Per-page title, description, canonical URL
    lib/
      garmentRecolor.js     Fabric masking and colour rendering
      api.js               Form submission
    pages/                  One file per route (routes are wired in App.jsx)
  scripts/generate-sitemap.mjs   Runs on prebuild, writes public/sitemap.xml

api/                        Vercel serverless functions
  contact.js                POST /api/contact         — quote requests
  design-request.js         POST /api/design-request   — mockup + artwork
  _lib/mail.js              Validation, escaping, Resend delivery
```

---

## Deploying

1. Import the repository in Vercel. `vercel.json` already sets the build
   command, output directory, SPA rewrite, and cache headers — accept them.
2. Add the environment variables below.
3. Point your domain at the project, then update `site.url` in
   `client/src/data/site.js` and the absolute URLs in `client/index.html` and
   `client/scripts/generate-sitemap.mjs` if the domain differs.

### Environment variables

Copy `.env.example`. All of them are optional, but without the first two the
forms cannot send email.

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key. Without it the forms return a friendly message and offer a `mailto:` link instead, so enquiries still reach you. |
| `MAIL_FROM` | Verified sender, e.g. `Deed Leisure <hello@deedleisure.ca>`. The domain must be verified in Resend. |
| `MAIL_TO` | Where enquiries are delivered. Defaults to `CONTACT_EMAIL`. |
| `CONTACT_EMAIL` | Public address shown in fallback messages. |
| `SITE_URL` | Base URL for the generated sitemap. Defaults to `https://deedleisure.ca`. |

Email goes through [Resend](https://resend.com) over plain `fetch`, so the
functions have no npm dependencies and no install step.

---

## The Design Studio

`/design-studio` lets a visitor put artwork and text on a garment, position it
inside the standard decoration area, download a PNG, and send the mockup to you
with their contact details.

### How garment colours work

The mockup photos are **white garments on a pure-white background**. Rather than
shipping a photo per colourway, the studio derives a fabric mask at runtime and
tints only those pixels, so the photo's folds, seams, and shadows survive.

Telling fabric from backdrop is the hard part, since both are near-white. Two
signals do it:

- **Brightness** — the backdrop sits at or near 255.
- **Flatness** — the backdrop is *perfectly* flat, while even a blown-out fabric
  highlight carries weave texture. Seeding the flood fill from flat pixels only
  is what stops it escaping along a bright sleeve hem into the garment.

So `garmentRecolor.js` floods the backdrop inward from the frame edge through
flat, bright pixels; erodes first to break one-pixel bridges and dilates back
(bounded by the brightness test) so the silhouette lands on the real edge; then
feathers for anti-aliasing.

Masks cost roughly 120 ms and depend only on the photo, so they are built once
per image and cached. Recolouring is about 50 ms and is cached per colour.

### Adding a product photo

Drop a front and back JPG in:

```
client/public/mockups/<folder>/front.jpg
client/public/mockups/<folder>/back.jpg
```

Then add the product to `PRODUCTS` in `client/src/data/catalog.js` and map its
id to the folder in `PRODUCT_ASSETS` in `client/src/components/MockupCanvas.jsx`.
Colours work automatically — there is nothing to pre-render.

For the masking to work the photo needs:

- a **pure white** background (255, 255, 255) that reaches every frame edge,
- a **white or very light** garment, so tinting has full range,
- a visible edge between garment and backdrop; a blown-out hem that merges into
  the background will be cut slightly short.

Roughly 1000×1250 keeps the mask build fast and the export sharp.

---

## Changing business details

Almost everything a small business needs to edit lives in two files:

- `client/src/data/site.js` — name, email, phone, address, hours, socials,
  minimum order, turnaround. Leave `phone` blank and it is hidden everywhere.
- `client/src/data/catalog.js` — products, starting prices, fabrics, colours,
  decoration methods.

Prices are rendered through `Intl.NumberFormat` in CAD.

---

## Forms

Both endpoints validate input, escape HTML before it reaches the email body,
carry a honeypot field against bots, and set `Reply-To` to the customer so
replying goes straight back to them. Every submission returns a reference like
`DL-20260903-A1B2C3` that the customer sees and the email carries.

Artwork uploads are capped at 2.5 MB and the mockup is attached as JPEG, because
the request body has to stay under the platform's 4.5 MB limit. A realistic
worst case measures about 3.2 MB.

---

## Not included

Deliberately left out until the business needs them: customer accounts, a
marketplace or storefront, online payments, and an admin dashboard. Adding any
of them means introducing a database and an auth provider, which is a larger
change than this codebase currently carries.
