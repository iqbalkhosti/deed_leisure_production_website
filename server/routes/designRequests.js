import crypto from 'node:crypto';
import { Router } from 'express';

const router = Router();
const RECIPIENT = process.env.DESIGN_REQUEST_RECIPIENT || 'info@deedleisure.ca';
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

function cleanText(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character]));
}

function dataUrlAttachment(dataUrl, baseName) {
  if (typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const content = match[2];
  if (Buffer.byteLength(content, 'base64') > MAX_ATTACHMENT_BYTES) return null;
  return {
    content,
    filename: `${baseName}.${match[1] === 'image/jpeg' ? 'jpg' : 'png'}`,
    type: match[1],
    disposition: 'attachment',
  };
}

function requestReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `DL-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

router.post('/', async (req, res) => {
  const contact = req.body?.contact ?? {};
  const design = req.body?.design ?? {};
  const name = cleanText(contact.name, 100);
  const email = cleanText(contact.email, 254).toLowerCase();
  const phone = cleanText(contact.phone, 40);
  const organization = cleanText(contact.organization, 100);
  const notes = cleanText(contact.notes, 2000);
  const product = cleanText(design.product, 60);
  const color = cleanText(design.color, 60);
  const side = cleanText(design.side, 20);
  const placement = cleanText(design.placement, 80);
  const text = cleanText(design.text, 120);
  const font = cleanText(design.font, 80);
  const mockup = dataUrlAttachment(design.mockupDataUrl, 'design-studio-mockup');
  const artwork = dataUrlAttachment(design.artworkDataUrl, 'submitted-artwork');

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !product || !placement || !mockup) {
    return res.status(400).json({ error: 'Name, a valid email, product, placement, and a PNG mockup are required.' });
  }

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    return res.status(503).json({ error: 'Mockup request email is not configured yet. Please contact us directly at info@deedleisure.ca.' });
  }

  const reference = requestReference();
  const sgMail = (await import('@sendgrid/mail')).default;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const rows = [
    ['Request reference', reference],
    ['Name', name],
    ['Email', email],
    ['Phone', phone || 'Not provided'],
    ['Organization', organization || 'Not provided'],
    ['Product', product],
    ['Colour', color || 'Not specified'],
    ['View', side || 'Not specified'],
    ['Placement', placement],
    ['Text', text || 'None'],
    ['Text font', font || 'Not applicable'],
    ['Notes', notes || 'None'],
  ];
  const textContent = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const html = rows.map(([label, value]) => `<tr><td style="padding:6px 12px 6px 0;font-weight:600">${escapeHtml(label)}</td><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`).join('');

  try {
    await sgMail.send({
      to: RECIPIENT,
      from: process.env.SENDGRID_FROM_EMAIL,
      replyTo: { email, name },
      subject: `Mockup request ${reference} — ${product}`,
      text: `${textContent}\n\nThe final mockup and submitted artwork are attached.`,
      html: `<h2>New Design Studio request</h2><table>${html}</table><p>The final mockup and submitted artwork are attached.</p>`,
      attachments: [mockup, artwork].filter(Boolean),
    });
    return res.status(201).json({ ok: true, reference });
  } catch (error) {
    console.error('[design-request]', error.response?.body ?? error.message);
    return res.status(500).json({ error: 'We could not send your request. Please try again or email info@deedleisure.ca.' });
  }
});

export default router;
