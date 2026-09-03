import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Palette } from 'lucide-react';
import GarmentShowcase from '../components/GarmentShowcase';
import ChatBot from '../components/ChatBot';
import useSeo from '../hooks/useSeo';
import site from '../data/site';
import { PRODUCTS, DECORATION_METHODS, GARMENT_COLORS } from '../data/catalog';

const money = new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
});

export default function Products() {
  useSeo({
    title: 'Products & pricing',
    description: `T-shirts, hoodies, polos, hats, and bags with screen printing, DTF, and embroidery. Starting prices, fabrics, and minimums from ${site.name}.`,
    path: '/products',
  });

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-blue-50 py-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Products &amp; pricing</h1>
          <p className="mt-3 text-lg text-gray-600">
            Prices below are per piece at the {site.minimumOrder}-piece minimum with one decoration
            location, in Canadian dollars. Bigger runs and simpler artwork bring them down — we
            confirm every quote before anything is printed.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="grid gap-10">
            {PRODUCTS.map((product, index) => (
              <article
                key={product.id}
                className={`grid items-center gap-8 rounded-2xl border border-gray-100 p-6 shadow-sm md:grid-cols-[300px_minmax(0,1fr)] md:p-8 ${index % 2 ? 'md:[&>figure]:order-2' : ''}`}
              >
                {product.studio ? (
                  <GarmentShowcase
                    product={product.id}
                    colors={['#171717', '#172554', '#b91c1c', '#166534']}
                    interval={0}
                    label={`${product.name} — ${product.blank}`}
                  />
                ) : (
                  <figure className="grid aspect-[4/5] place-items-center rounded-2xl bg-gray-50 text-6xl" aria-hidden="true">
                    🧢
                  </figure>
                )}

                <div>
                  <h2 className="text-2xl font-bold">{product.name}</h2>
                  <p className="text-sm text-gray-500">{product.blank}</p>
                  <p className="mt-3 text-gray-600">{product.summary}</p>

                  <ul className="mt-4 space-y-2">
                    {product.specs.map((spec) => (
                      <li key={spec} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        {spec}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <p className="text-xl font-bold text-gray-900">
                      From {money.format(product.from)}
                      <span className="text-base font-normal text-gray-500"> / piece</span>
                    </p>
                    {product.studio ? (
                      <Link
                        to="/design-studio"
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
                      >
                        <Palette className="h-4 w-4" />
                        Mock it up
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    ) : (
                      <Link to="/contact" className="text-sm font-semibold text-primary">
                        Ask us for a mockup
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">How we decorate</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            We pick the method that suits your artwork and quantity, and tell you why.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {DECORATION_METHODS.map((method) => (
              <div key={method.name} className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">{method.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">Best for: {method.best}</p>
                <p className="mt-3 text-sm text-gray-600">{method.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold">Stock colours</h2>
          <p className="mt-3 text-gray-600">
            These are the shades you can preview in the Design Studio. Other colourways are usually
            available from the mill — ask and we&apos;ll check stock.
          </p>
          <ul className="mt-8 flex flex-wrap justify-center gap-6">
            {GARMENT_COLORS.map((color) => (
              <li key={color.slug} className="w-20">
                <span
                  className="mx-auto block h-14 w-14 rounded-full border border-gray-200 shadow-inner"
                  style={{ backgroundColor: color.value }}
                />
                <span className="mt-2 block text-xs text-gray-600">{color.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gray-900 py-14 text-white">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold">Ready for a real number?</h2>
          <p className="mt-3 text-gray-300">
            Send us quantity, sizes, and artwork and we&apos;ll come back with firm pricing and a
            date — usually within one business day.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/contact" className="rounded-lg bg-primary px-7 py-3.5 font-semibold text-white hover:bg-primary/90">
              Get a quote
            </Link>
            <Link to="/design-studio" className="rounded-lg border-2 border-white/20 bg-white/10 px-7 py-3.5 font-semibold text-white hover:bg-white/20">
              Build a mockup first
            </Link>
          </div>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
