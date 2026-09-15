import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import site, { mailtoQuote } from '../data/site';
import { submitContactRequest, ApiError } from '../lib/api';

/**
 * The enquiry form used on every audience page.
 *
 * One component so a lead is captured identically wherever it comes from, and
 * so a change to the fields or the failure handling only has to be made once.
 * `source` is passed through to the email subject line so the team can see
 * which page the enquiry came from.
 */

const QUANTITY_OPTIONS = ['1–11', '12–24', '25–49', '50–99', '100–249', '250+'];

const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const labelClass = 'mb-2 block font-medium text-gray-700';

export default function QuoteForm({
  source,
  organizationLabel = 'Organization',
  messageLabel = 'What do you need?',
  messagePlaceholder = 'Products, sizes, colours, artwork status, and when you need it.',
  submitLabel = 'Request a quote',
}) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', organization: '', quantity: '', deadline: '', message: '', website: '',
  });
  const [state, setState] = useState({ status: 'idle', error: '', offerMailto: false, reference: '' });

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setState({ status: 'sending', error: '', offerMailto: false, reference: '' });
    try {
      const result = await submitContactRequest({ ...form, product: source });
      setState({ status: 'success', error: '', offerMailto: false, reference: result.reference });
    } catch (error) {
      setState({
        status: 'idle',
        error: error.message || 'Something went wrong. Please try again.',
        offerMailto: error instanceof ApiError && error.fallback === 'mailto',
        reference: '',
      });
    }
  };

  if (state.status === 'success') {
    return (
      <div className="rounded-xl bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto h-10 w-10 text-emerald-500" />
        <h3 className="mt-3 text-lg font-semibold text-gray-900">Request received</h3>
        <p className="mt-2 text-gray-600">
          We&apos;ll reply with pricing and a timeline within one business day.
        </p>
        <p className="mt-3 font-mono text-sm font-bold text-primary">{state.reference}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor={`${source}-name`} className={labelClass}>Your name</label>
        <input id={`${source}-name`} required autoComplete="name" value={form.name} onChange={update('name')} className={inputClass} />
      </div>

      <div>
        <label htmlFor={`${source}-org`} className={labelClass}>{organizationLabel}</label>
        <input id={`${source}-org`} required autoComplete="organization" value={form.organization} onChange={update('organization')} className={inputClass} />
      </div>

      <div>
        <label htmlFor={`${source}-email`} className={labelClass}>Email</label>
        <input id={`${source}-email`} type="email" required autoComplete="email" value={form.email} onChange={update('email')} className={inputClass} />
      </div>

      <div>
        <label htmlFor={`${source}-phone`} className={labelClass}>
          Phone <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input id={`${source}-phone`} type="tel" autoComplete="tel" value={form.phone} onChange={update('phone')} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${source}-qty`} className={labelClass}>Quantity</label>
          <select id={`${source}-qty`} required value={form.quantity} onChange={update('quantity')} className={`${inputClass} bg-white`}>
            <option value="">Select quantity</option>
            {QUANTITY_OPTIONS.map((option) => <option key={option} value={option}>{option} pieces</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${source}-deadline`} className={labelClass}>
            Needed by <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input id={`${source}-deadline`} type="date" value={form.deadline} onChange={update('deadline')} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor={`${source}-message`} className={labelClass}>{messageLabel}</label>
        <textarea
          id={`${source}-message`}
          required
          rows="4"
          value={form.message}
          onChange={update('message')}
          placeholder={messagePlaceholder}
          className={`${inputClass} resize-y`}
        />
      </div>

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <input
        type="text"
        value={form.website}
        onChange={update('website')}
        tabIndex="-1"
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {state.error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <p>{state.error}</p>
          {state.offerMailto ? (
            <p className="mt-2">
              <a className="font-semibold underline" href={mailtoQuote(`Quote request — ${source}`)}>
                Email us at {site.email}
              </a>
              {' '}and we&apos;ll pick it up straight away.
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={state.status === 'sending'}
        className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {state.status === 'sending' ? 'Sending…' : submitLabel}
      </button>
    </form>
  );
}
