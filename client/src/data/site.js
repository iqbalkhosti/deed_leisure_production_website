// ─── Single source of truth for business details ─────────────────────────────
// Everything a small business needs to change after launch lives here. Update
// these values and they propagate to the navbar, footer, contact page, email
// links, and the SEO/social metadata.

export const site = {
  name: 'Deed Leisure',
  tagline: 'Custom apparel for clubs, teams, and small businesses',
  description:
    'Custom apparel for student clubs, teams, and small businesses in the Greater Toronto Area. Screen printing, embroidery, and DTF — designed with you, printed locally.',
  url: 'https://deedleisure.ca',

  email: 'info@deedleisure.ca',
  phone: '',            // e.g. '+1 (905) 555-0134' — leave blank to hide
  address: {
    locality: 'Oshawa',
    region: 'ON',
    country: 'Canada',
  },
  serviceArea: 'Durham Region & the Greater Toronto Area',

  hours: [
    { days: 'Monday – Friday', time: '9:00 am – 6:00 pm' },
    { days: 'Saturday', time: 'By appointment' },
    { days: 'Sunday', time: 'Closed' },
  ],

  socials: [
    { platform: 'Instagram', handle: '@deedleisure', url: 'https://instagram.com/deedleisure' },
    { platform: 'TikTok', handle: '@deedleisure', url: 'https://tiktok.com/@deedleisure' },
    { platform: 'LinkedIn', handle: 'Deed Leisure', url: 'https://linkedin.com/company/deedleisure' },
  ],

  // Shown across the site so buyers know what to expect before they ask.
  minimumOrder: 12,
  standardTurnaround: '2–3 weeks after artwork approval',
  rushTurnaround: '7–10 business days',
};

export const mailtoQuote = (subject = 'Custom apparel enquiry') =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;

export default site;
