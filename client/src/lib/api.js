/**
 * Form submission against the Vercel serverless functions in /api.
 *
 * Both endpoints are same-origin, so there is nothing to configure for local
 * `vercel dev` or production. When email delivery is not configured yet the
 * server answers 503 with `fallback: 'mailto'`, and the caller offers the
 * visitor a plain mailto link instead of losing the enquiry.
 */

export class ApiError extends Error {
  constructor(message, { status, fallback } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fallback = fallback;
  }
}

async function post(path, payload) {
  let response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiError('We could not reach our servers. Check your connection and try again.', {
      fallback: 'mailto',
    });
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(body.error ?? `Request failed (${response.status})`, {
      status: response.status,
      fallback: body.fallback,
    });
  }
  return body;
}

/** Send a Design Studio mockup, with the rendered PNG attached. */
export function submitDesignRequest(payload) {
  return post('/api/design-request', payload);
}

/** Send a general enquiry from the contact page. */
export function submitContactRequest(payload) {
  return post('/api/contact', payload);
}
