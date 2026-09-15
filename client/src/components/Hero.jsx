import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Palette, Truck, BadgeCheck } from 'lucide-react';
import GarmentShowcase from './GarmentShowcase';
import site from '../data/site';

const PROOF = [
  { icon: BadgeCheck, label: 'No minimum order' },
  { icon: Truck, label: site.standardTurnaround },
  { icon: Palette, label: 'Free mockup before you pay' },
];

export default function Hero() {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {site.serviceArea}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              Custom apparel your club or team will actually wear
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Tees, hoodies, and polos printed and embroidered to order. Design it yourself in
              seconds, or send us a sketch and we&apos;ll take it from there.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <Link
                to="/design-studio"
                className="group inline-flex items-center justify-center rounded-xl bg-primary px-7 py-3.5 font-semibold text-white shadow-md transition-colors hover:bg-primary/90 hover:shadow-lg"
              >
                Try the Design Studio
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border-2 border-gray-200 px-7 py-3.5 font-semibold text-gray-800 transition-colors hover:border-gray-400"
              >
                Get a quote
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 md:justify-start">
              {PROOF.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <GarmentShowcase
              product="hoodie"
              label="A custom hoodie previewed in several colours"
            />
            <p className="mt-3 text-center text-sm text-gray-500">
              Every colour here is rendered by the same engine that powers the Design Studio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
