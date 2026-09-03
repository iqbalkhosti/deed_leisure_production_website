import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import ChatBot from '../components/ChatBot';
import useSeo from '../hooks/useSeo';
import site from '../data/site';
import faq from '../data/faq.json';

export default function Faq() {
  useSeo({
    title: 'Frequently asked questions',
    description: `Minimums, turnaround, fabrics, artwork formats, and pricing for custom apparel from ${site.name}.`,
    path: '/faq',
  });

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-blue-50 py-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Frequently asked questions</h1>
          <p className="mt-3 text-lg text-gray-600">
            Minimums, timelines, fabrics, and artwork — the things people ask before they order.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto max-w-3xl px-4">
          <dl className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
            {faq.map((entry) => (
              <div key={entry.question} className="p-6">
                <dt className="text-lg font-semibold text-gray-900">{entry.question}</dt>
                <dd className="mt-2 text-gray-600">{entry.answer}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 rounded-2xl bg-gray-900 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Still deciding?</h2>
            <p className="mx-auto mt-2 max-w-xl text-gray-300">
              Send us the details and we&apos;ll come back with pricing, fabric options, and a
              realistic date — usually within one business day.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Request a quote
              </Link>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/20"
              >
                <Mail className="h-4 w-4" />
                {site.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
