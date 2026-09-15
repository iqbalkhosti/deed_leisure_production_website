/**
 * Shared helpers for the two form endpoints.
 *
 * Delivery goes through Resend's REST API over plain fetch — no npm dependency,
 * so the serverless functions have a zero-install cold start. Set two env vars
 * in the Vercel project and email starts working; leave them unset and the
 * endpoints report a `mailto` fallback that the UI turns into a normal email
 * link, so an unconfigured deploy still collects enquiries.
 *
 *   RESEND_API_KEY   Resend API key (https://resend.com → API Keys)
 *   MAIL_FROM        Verified sender, e.g. "Deed Leisure <hello@deedleisure.ca>"
 *   MAIL_TO          Optional. Where enquiries land. Defaults to CONTACT_EMAIL.
 *   CONTACT_EMAIL    Optional. Public address, also used as the last-resort To.
 */

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const contactEmail = () => process.env.CONTACT_EMAIL || 'info@deedleisure.ca';

export function readJsonBody(req) {
  // Vercel parses JSON bodies for us, but be tolerant of a raw string.
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body ?? {};
}

export function cleanText(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character]));
}

/** Turn a data: URL from the browser into a Resend attachment, or null. */
export function dataUrlAttachment(dataUrl, baseName) {
  if (typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|svg\+xml));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const [, mime, content] = match;
  if (Buffer.byteLength(content, 'base64') > MAX_ATTACHMENT_BYTES) return null;
  const extension = { 'image/jpeg': 'jpg', 'image/svg+xml': 'svg' }[mime] ?? 'png';
  return { filename: `${baseName}.${extension}`, content };
}

/** DL-20260903-A1B2C3 — short enough to read over the phone. */
export function reference() {
  const today = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DL-${today}-${random}`;
}

export function rowsToHtml(rows) {
  const cells = rows
    .map(([label, value]) => (
      `<tr><td style="padding:6px 16px 6px 0;font-weight:600;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>`
      + `<td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
    ))
    .join('');
  return `<table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">${cells}</table>`;
}

export function rowsToText(rows) {
  return rows.map(([label, value]) => `${label}: ${value}`).join('\n');
}

export function isConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

/**
 * Send through Resend. Throws on failure so the caller can answer 502 without
 * leaking provider details to the browser.
 */
export async function sendMail({ subject, replyTo, rows, intro, attachments = [] }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [process.env.MAIL_TO || contactEmail()],
      reply_to: replyTo,
      subject,
      text: `${intro}\n\n${rowsToText(rows)}`,
      html: `<h2 style="font-family:system-ui,sans-serif">${escapeHtml(intro)}</h2>${rowsToHtml(rows)}`,
      attachments: attachments.filter(Boolean),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    let parsed = {};
    try { parsed = JSON.parse(detail); } catch { /* non-JSON body */ }
    const error = new Error(`Resend responded ${response.status}: ${detail.slice(0, 500)}`);
    // Carried through to the API response. Whoever runs this site needs to be
    // able to tell "key is wrong" from "domain is not verified" without
    // hunting through platform logs; the provider's own wording is the only
    // thing that distinguishes them, and it describes configuration rather
    // than anything secret.
    error.upstream = {
      status: response.status,
      code: parsed.name ?? null,
      message: String(parsed.message ?? detail).slice(0, 200) || null,
    };
    throw error;
  }
  return response.json();
}

/** Reject anything that is not a JSON POST, and answer CORS preflights. */
export function guardMethod(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(204).end();
    return false;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ error: 'Method not allowed.' });
    return false;
  }
  return true;
}

export function notConfigured(res) {
  return res.status(503).json({
    error: `Online submission is not switched on yet. Please email us at ${contactEmail()} and we will pick it up right away.`,
    fallback: 'mailto',
    contact: contactEmail(),
  });
}
