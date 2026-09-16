import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Instagram, Linkedin, Clock } from 'lucide-react';
import site from '../data/site';

const TikTokIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.84-2.48V9.75a5.79 5.79 0 1 0 4.93 5.73V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.24-1.48Z" />
  </svg>
);

const SOCIAL_ICONS = { Instagram, LinkedIn: Linkedin, TikTok: TikTokIcon };

const NAV = [
  { to: '/products', label: 'Products & pricing' },
  { to: '/design-studio', label: 'Design Studio' },
  { to: '/our-process', label: 'How it works' },
  { to: '/faq', label: 'FAQ' },
  { to: '/our-team', label: 'About us' },
  { to: '/contact', label: 'Get a quote' },
];

const AUDIENCES = [
  { to: '/student-clubs', label: 'Student clubs' },
  { to: '/corporate-teams', label: 'Corporate teams' },
  { to: '/ontario-tech-clubs', label: 'Ontario Tech clubs' },
];

export default function Footer() {
  return (
    // The mobile action bar sits at the very bottom, so pad past it on phones.
    <footer className="bg-gray-900 pb-24 pt-16 text-white md:pb-8">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="mb-4 flex items-center gap-2.5 text-xl font-bold">
              <img src="/logo-light.png" alt="" width="343" height="400" className="h-9 w-auto" />
              {site.name}
            </h2>
            <p className="mb-6 text-gray-400">{site.description}</p>
            <div className="flex space-x-4">
              {site.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.platform] ?? Instagram;
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 transition-colors hover:text-white"
                    aria-label={`${site.name} on ${social.platform}`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold">Explore</h2>
            <ul className="space-y-2">
              {NAV.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold">Who we work with</h2>
            <ul className="space-y-2">
              {AUDIENCES.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold">Get in touch</h2>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <MapPin className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>
                  {site.address.locality}, {site.address.region}
                  <br />
                  Serving {site.serviceArea}
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 flex-shrink-0" />
                <a href={`mailto:${site.email}`} className="transition-colors hover:text-white">
                  {site.email}
                </a>
              </li>
              {site.phone ? (
                <li className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 flex-shrink-0" />
                  <a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`} className="transition-colors hover:text-white">
                    {site.phone}
                  </a>
                </li>
              ) : null}
              <li className="flex items-start">
                <Clock className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>
                  {site.hours.map((entry) => (
                    <span key={entry.days} className="block">
                      {entry.days}: {entry.time}
                    </span>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
