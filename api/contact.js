import {
  cleanText, guardMethod, isConfigured, isEmail, notConfigured,
  readJsonBody, reference, sendMail,
} from './_lib/mail.js';

export default async function handler(req, res) {
  if (!guardMethod(req, res)) return undefined;

  const body = readJsonBody(req);
  const name = cleanText(body.name, 100);
  const email = cleanText(body.email, 254).toLowerCase();
  const phone = cleanText(body.phone, 40);
  const organization = cleanText(body.organization, 120);
  const product = cleanText(body.product, 80);
  const quantity = cleanText(body.quantity, 40);
  const deadline = cleanText(body.deadline, 60);
  const message = cleanText(body.message, 3000);

  // Bots fill every field they find; a real visitor never sees this one.
  if (cleanText(body.website, 100)) return res.status(201).json({ ok: true, reference: reference() });

  if (!name || !isEmail(email) || !message) {
    return res.status(400).json({ error: 'Please provide your name, a valid email, and a short message.' });
  }
  if (!isConfigured()) return notConfigured(res);

  const ticket = reference();
  const rows = [
    ['Reference', ticket],
    ['Name', name],
    ['Email', email],
    ['Phone', phone || 'Not provided'],
    ['Organization', organization || 'Not provided'],
    ['Interested in', product || 'Not specified'],
    ['Estimated quantity', quantity || 'Not provided'],
    ['Needed by', deadline || 'Not specified'],
    ['Message', message],
  ];

  try {
    await sendMail({
      subject: `Quote request ${ticket} — ${name}`,
      replyTo: email,
      rows,
      intro: 'New quote request from the website',
    });
  } catch (error) {
    console.error('[contact]', error.message);
    return res.status(502).json({
      error: 'We could not send your message just now. Please try again in a moment.',
      fallback: 'mailto',
      diagnostic: error.upstream ?? { message: String(error.message).slice(0, 200) },
    });
  }

  return res.status(201).json({ ok: true, reference: ticket });
}
