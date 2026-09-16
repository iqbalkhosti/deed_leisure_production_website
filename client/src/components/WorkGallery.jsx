import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { WORK } from '../data/work';

/**
 * Photos of real orders.
 *
 * The images are mixed portrait and landscape straight off a phone, so each
 * one sits in a fixed square and is cropped by `object-cover` rather than
 * letting the grid go ragged. Everything below the first row is lazy-loaded,
 * and every tile reserves its space via `aspect-square` so nothing reflows as
 * the pictures arrive.
 */
export default function WorkGallery({ limit }) {
  const items = limit ? WORK.slice(0, limit) : WORK;

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Work we&apos;ve shipped</h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
            Clubs, councils, and teams we&apos;ve printed and embroidered for. Yours could be next.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.src} className="group">
              <figure>
                <div className={`aspect-square overflow-hidden rounded-2xl shadow-sm ${item.fit === 'contain' ? 'bg-white p-3' : 'bg-gray-100'}`}>
                  <img
                    src={item.src}
                    alt={item.alt}
                    width="1100"
                    height="1100"
                    // The first row is above the fold on most screens; the rest
                    // can wait until the visitor scrolls to them.
                    loading={index < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                    className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${item.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                  />
                </div>
                <figcaption className="mt-2.5 text-sm text-gray-600">{item.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            to="/contact"
            className="group inline-flex items-center rounded-xl bg-primary px-7 py-3.5 font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Start your order
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
