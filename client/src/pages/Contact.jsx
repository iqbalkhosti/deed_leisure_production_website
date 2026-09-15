import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Clock, CheckCircle2, Palette } from 'lucide-react';
import ChatBot from '../components/ChatBot';
import useSeo from '../hooks/useSeo';
import site, { mailtoQuote } from '../data/site';
import { PRODUCTS } from '../data/catalog';
import { submitContactRequest, ApiError } from '../lib/api';

const EMPTY = {
  name: '', email: '', phone: '', organization: '',
  product: '', quantity: '', deadline: '', message: '', website: '',
};

const field = 'mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export default function Contact() {
  useSeo({
    title: 'Get a quote',
    description: `Tell us what you need and ${site.name} will come back with pricing and a timeline, usually within one business day.`,
    path: '/contact',
  });

  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ status: 'idle', error: '', offerMailto: false, reference: '' });

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setState({ status: 'sending', error: '', offerMailto: false, reference: '' });
    try {
      const result = await submitContactRequest(form);
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
      <div className="min-h-screen bg-white">
        <div className="container mx-auto max-w-xl px-4 py-24 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-5 text-3xl font-bold">Thanks — we&apos;ve got it</h1>
          <p className="mt-3 text-gray-600">
            We reply with pricing and a realistic timeline within one business day. Your reference
            number is below in case you need to follow up.
          </p>
          <p className="mt-4 font-mono text-lg font-bold text-primary">{state.reference}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/design-studio" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90">
              <Palette className="h-4 w-4" /> Mock something up while you wait
            </Link>
            <Link to="/" className="inline-flex items-center justify-center rounded-lg border-2 border-gray-200 px-6 py-3 font-semibold text-gray-800 hover:border-gray-400">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-blue-50 py-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Get a quote</h1>
          <p className="mt-3 text-lg text-gray-600">
            Tell us what you&apos;re after. The more you can share about quantity and timing, the
            more accurate our first number will be.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto grid max-w-5xl gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Name <span aria-hidden="true" className="text-red-500">*</span>
                <input required value={form.name} onChange={update('name')} autoComplete="name" className={field} />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Email <span aria-hidden="true" className="text-red-500">*</span>
                <input required type="email" value={form.email} onChange={update('email')} autoComplete="email" className={field} />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Phone <span className="font-normal text-gray-400">(optional)</span>
                <input type="tel" value={form.phone} onChange={update('phone')} autoComplete="tel" className={field} />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Club or company <span className="font-normal text-gray-400">(optional)</span>
                <input value={form.organization} onChange={update('organization')} autoComplete="organization" className={field} />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <label className="text-sm font-medium text-gray-700">
                Product
                <select value={form.product} onChange={update('product')} className={`${field} bg-white`}>
                  <option value="">Not sure yet</option>
                  {PRODUCTS.map((product) => (
                    <option key={product.id} value={product.name}>{product.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                Quantity
                <input
                  value={form.quantity}
                  onChange={update('quantity')}
                  inputMode="numeric"
                  placeholder="Any quantity"
                  className={field}
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Needed by
                <input type="date" value={form.deadline} onChange={update('deadline')} className={field} />
              </label>
            </div>

            <label className="block text-sm font-medium text-gray-700">
              What are you making? <span aria-hidden="true" className="text-red-500">*</span>
              <textarea
                required
                rows="5"
                value={form.message}
                onChange={update('message')}
                placeholder="Sizes, colours, where the logo goes, whether you already have artwork — anything helps."
                className={`${field} resize-y`}
              />
            </label>

            {/* Honeypot: hidden from people, irresistible to bots. */}
            <input
              type="text"
              name="website"
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
                    <a className="font-semibold underline" href={mailtoQuote('Quote request')}>
                      Email us directly at {site.email}
                    </a>
                    {' '}and we&apos;ll pick it up straight away.
                  </p>
                ) : null}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={state.status === 'sending'}
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3.5 font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
            >
              {state.status === 'sending' ? 'Sending…' : 'Send request'}
            </button>
          </form>

          <aside className="space-y-6 lg:border-l lg:border-gray-100 lg:pl-8">
            <div>
              <h2 className="font-semibold text-gray-900">Reach us directly</h2>
              <ul className="mt-3 space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <a href={`mailto:${site.email}`} className="hover:text-primary">{site.email}</a>
                </li>
                {site.phone ? (
                  <li className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`} className="hover:text-primary">{site.phone}</a>
                  </li>
                ) : null}
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>{site.address.locality}, {site.address.region} — serving {site.serviceArea}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>
                    {site.hours.map((entry) => (
                      <span key={entry.days} className="block">{entry.days}: {entry.time}</span>
                    ))}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-blue-50 p-5">
              <h2 className="font-semibold text-gray-900">Already have artwork?</h2>
              <p className="mt-2 text-sm text-gray-600">
                Drop it into the Design Studio, place it on the garment, and send the mockup
                straight to us — it saves a round of back and forth.
              </p>
              <Link to="/design-studio" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <Palette className="h-4 w-4" /> Open the Design Studio
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
