import {
  cleanText, dataUrlAttachment, guardMethod, isConfigured, isEmail,
  notConfigured, readJsonBody, reference, sendMail,
} from './_lib/mail.js';

// The platform rejects request bodies over 4.5 MB before this handler runs, so
// the studio sends the mockup as JPEG and caps artwork uploads to stay inside it.

export default async function handler(req, res) {
  if (!guardMethod(req, res)) return undefined;

  const body = readJsonBody(req);
  const contact = body.contact ?? {};
  const design = body.design ?? {};

  const name = cleanText(contact.name, 100);
  const email = cleanText(contact.email, 254).toLowerCase();
  const phone = cleanText(contact.phone, 40);
  const organization = cleanText(contact.organization, 120);
  const quantity = cleanText(contact.quantity, 40);
  const notes = cleanText(contact.notes, 2000);

  const product = cleanText(design.product, 60);
  const colour = cleanText(design.color, 60);
  const side = cleanText(design.side, 20);
  const placement = cleanText(design.placement, 120);
  const text = cleanText(design.text, 160);
  const font = cleanText(design.font, 80);

  const mockup = dataUrlAttachment(design.mockupDataUrl, 'mockup');
  const artwork = dataUrlAttachment(design.artworkDataUrl, 'artwork');

  if (!name || !isEmail(email) || !product || !placement) {
    return res.status(400).json({ error: 'Please provide your name, a valid email, and a product placement.' });
  }
  if (!mockup) {
    return res.status(400).json({ error: 'The mockup image could not be attached. Please try again.' });
  }
  if (!isConfigured()) return notConfigured(res);

  const ticket = reference();
  const rows = [
    ['Reference', ticket],
    ['Name', name],
    ['Email', email],
    ['Phone', phone || 'Not provided'],
    ['Organization', organization || 'Not provided'],
    ['Estimated quantity', quantity || 'Not provided'],
    ['Product', product],
    ['Colour', colour || 'Not specified'],
    ['View', side || 'Not specified'],
    ['Placement', placement],
    ['Text', text || 'None'],
    ['Font', font || 'Not applicable'],
    ['Notes', notes || 'None'],
  ];

  try {
    await sendMail({
      subject: `Mockup request ${ticket} — ${product}`,
      replyTo: email,
      rows,
      intro: 'New Design Studio mockup request',
      attachments: [mockup, artwork],
    });
  } catch (error) {
    console.error('[design-request]', error.message);
    return res.status(502).json({
      error: 'We could not send your request just now. Please try again in a moment.',
      fallback: 'mailto',
    });
  }

  return res.status(201).json({ ok: true, reference: ticket });
}
