import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import site from '../data/site';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/our-process', label: 'How it works' },
  { to: '/faq', label: 'FAQ' },
  { to: '/our-team', label: 'About' },
];

const desktopLink = ({ isActive }) => (
  isActive
    ? 'text-primary font-semibold'
    : 'text-gray-700 hover:text-primary transition-colors'
);

const mobileLink = ({ isActive }) => (
  `block rounded-lg px-4 py-2.5 ${isActive ? 'bg-primary/10 font-semibold text-primary' : 'text-gray-700 hover:bg-gray-100'}`
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  // A tap on a link inside the sheet changes the route; close it either way.
  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 transition-colors hover:text-primary">
              <img
                src="/logo.png"
                alt=""
                width="343"
                height="400"
                className="h-8 w-auto"
              />
              {site.name}
            </Link>

            <div className="ml-10 hidden flex-1 items-center justify-between md:flex">
              <div className="flex gap-6">
                {LINKS.map((link) => (
                  <NavLink key={link.to} to={link.to} end={link.end} className={desktopLink}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <NavLink
                  to="/design-studio"
                  className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                >
                  Design Studio
                </NavLink>
                <NavLink
                  to="/contact"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Get a quote
                </NavLink>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className="text-gray-700 hover:text-primary md:hidden"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen ? (
          <div id="mobile-menu" className="border-t border-gray-200 bg-white md:hidden">
            <div className="container mx-auto space-y-1 px-4 py-3">
              {LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={mobileLink}>
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/contact" className={mobileLink}>Contact</NavLink>
            </div>
          </div>
        ) : null}
      </nav>

      {/* Thumb-reach actions on phones. The spacer below keeps the bar from
          covering the last of the page content. */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 bg-white md:hidden">
        <NavLink to="/design-studio" className="flex-1 bg-gray-800 py-3 text-center text-sm font-medium text-white">
          Design Studio
        </NavLink>
        <NavLink to="/contact" className="flex-1 bg-primary py-3 text-center text-sm font-medium text-white">
          Get a quote
        </NavLink>
      </div>
    </>
  );
}
