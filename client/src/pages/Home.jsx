import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Briefcase, GraduationCap } from 'lucide-react';
import Hero from '../components/Hero';
import Steps from '../components/Steps';
import DesignStudioCTA from '../components/DesignStudioCTA';
import WorkGallery from '../components/WorkGallery';
import GarmentShowcase from '../components/GarmentShowcase';
import ChatBot from '../components/ChatBot';
import useSeo from '../hooks/useSeo';
import site from '../data/site';
import { PRODUCTS } from '../data/catalog';
import faq from '../data/faq.json';

const AUDIENCES = [
  {
    to: '/student-clubs',
    icon: Users,
    title: 'Student clubs',
    detail: 'Club pricing, no minimum order, and turnaround that fits a semester.',
  },
  {
    to: '/corporate-teams',
    icon: Briefcase,
    title: 'Corporate teams',
    detail: 'Branded staff kits, conference merch, and invoicing your finance team will accept.',
  },
  {
    to: '/ontario-tech-clubs',
    icon: GraduationCap,
    title: 'Ontario Tech clubs',
    detail: 'We work with societies on campus and know how their approval process runs.',
  },
];

export default function Home() {
  useSeo({
    title: null,
    description: site.description,
    path: '/',
  });

  return (
    <div className="min-h-screen">
      <Hero />
      <Steps />

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">What we print</h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
              Four staples, decorated however the artwork calls for it. No minimum
              order — tell us what you need and we&apos;ll price it.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((product) => (
              <article key={product.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                {product.studio ? (
                  <GarmentShowcase
                    product={product.id}
                    colors={['#171717', '#172554', '#b91c1c']}
                    interval={0}
                    label={`${product.name} mockup`}
                  />
                ) : (
                  <div className="grid aspect-[4/5] place-items-center rounded-2xl bg-gray-50 text-5xl" aria-hidden="true">
                    🧢
                  </div>
                )}
                <h3 className="mt-4 text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.blank}</p>
                <p className="mt-2 text-sm text-gray-600">{product.summary}</p>
                <Link to="/contact" className="mt-3 inline-block font-semibold text-primary hover:underline">
                  Reach out for pricing
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/products" className="group inline-flex items-center font-semibold text-primary">
              See full specs
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <WorkGallery />

      <DesignStudioCTA />

      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">Who we work with</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {AUDIENCES.map(({ to, icon: Icon, title, detail }) => (
              <Link
                key={to}
                to={to}
                className="group rounded-2xl bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Icon className="h-6 w-6 text-primary" />
                </span>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-gray-600">{detail}</p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">Common questions</h2>
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
            {faq.slice(0, 4).map((entry) => (
              <details key={entry.question} className="group p-5">
                <summary className="cursor-pointer list-none font-semibold marker:content-['']">
                  <span className="flex items-center justify-between gap-4">
                    {entry.question}
                    <span className="text-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-gray-600">{entry.answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/faq" className="group inline-flex items-center font-semibold text-primary">
              Read every question
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
