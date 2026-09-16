import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Linkedin } from 'lucide-react';
import ChatBot from '../components/ChatBot';
import useSeo from '../hooks/useSeo';
import { mailtoQuote } from '../data/site';

export default function OurTeam() {
  useSeo({
    title: 'About us',
    description: 'The people behind Deed Leisure — a small custom apparel shop serving clubs, teams, and businesses in Durham Region and the GTA.',
    path: '/our-team',
  });

  // Sample team members data
  const teamMembers = [
    {
      name: 'Iqbal Khosti',
      role: 'Founder & Operations Director',
      bio: 'With over 3 years in the apparel industry, Iqbal founded the company with a vision to create high-quality custom apparel that tells a story.',
      image: '/team/iqbal.jpg',
      email: 'info@deedleisure.ca',
      linkedin: 'https://linkedin.com/in/iqbalkhosti'
    },
    {
      name: 'Kevin Massey',
      role: 'Chief Relations Officer',
      bio: 'Kevin brings his experience in client relations and business development to strengthen our partnerships and drive growth.',
      image: '/team/kevin.jpg',
      email: 'partnerships@deedleisure.ca',
      linkedin: 'https://www.linkedin.com/in/kevintheinnovator/'
    },
    {
      name: 'Jedrek Martin',
      role: 'Chief Financial Officer',
      bio: 'Jedrek manages our financial operations, ensuring we maintain fiscal responsibility while supporting strategic growth initiatives.',
      image: '/team/jedrek.jpg',
      email: 'jed@pksportswear.ca',
      linkedin: 'https://www.linkedin.com/in/jedrekmartin/'
    },
  
  ];

  // Company values
  const values = [
    {
      title: 'Quality First',
      description: 'We never compromise on materials or printing methods. Every item meets our high standards before leaving our facility.'
    },
    {
      title: 'Creative Excellence',
      description: 'We push the boundaries of design to create apparel that truly stands out and represents your brand or team.'
    },
    {
      title: 'Sustainable Practices',
      description: 'We\'re committed to reducing our environmental impact through eco-friendly materials and responsible production.'
    },
    {
      title: 'Customer Partnership',
      description: 'We view every client relationship as a partnership, working together to achieve the best possible outcome.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Team</h1>
            <p className="text-lg text-gray-600 mb-8">
              Three of us, based in Durham Region, handling everything from artwork to the boxes
              that land on your doorstep.
            </p>
            <img
              src="/team/group.jpg"
              alt="The Deed Leisure team together in the shop"
              width="1400"
              height="1050"
              className="mx-auto w-full max-w-2xl rounded-2xl shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Team members */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                {/* Circular avatar */}
                <div className="relative mb-4 h-28 w-28 flex-shrink-0 overflow-hidden rounded-full bg-primary/10 ring-4 ring-primary/20">
                  <span className="absolute inset-0 grid place-items-center text-2xl font-semibold text-primary" aria-hidden="true">
                    {member.name.split(' ').map((part) => part[0]).join('')}
                  </span>
                  <img
                    src={member.image}
                    alt={member.name}
                    width="600"
                    height="600"
                    loading="lazy"
                    decoding="async"
                    className="relative h-full w-full object-cover"
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-0.5">{member.name}</h3>
                <p className="text-primary font-medium text-sm mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
                <div className="flex space-x-3 mt-auto">
                  <a
                    href={`mailto:${member.email}`}
                    className="text-gray-400 hover:text-primary transition-colors"
                    aria-label={`Email ${member.name}`}
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                    aria-label={`${member.name}'s LinkedIn`}
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value) => (
              <div 
                key={value.title}
                className="bg-white rounded-2xl p-8 shadow-sm"
              >
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-primary/10 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
              <p className="text-lg text-gray-600 mb-8">
                We're always looking for talented individuals who are passionate about design, apparel, and creating exceptional customer experiences.
              </p>
              <a
                href={mailtoQuote('Working with Deed Leisure')}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Send us your portfolio
              </a>
            </div>
          </div>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
