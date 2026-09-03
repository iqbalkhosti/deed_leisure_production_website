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
      name: 'Alex Johnson',
      role: 'Founder & Creative Director',
      bio: 'With over 15 years in the apparel industry, Alex founded the company with a vision to create high-quality custom apparel that tells a story.',
      image: '/team/alex.jpg',
      email: 'alex@apparelbrand.com',
      linkedin: 'https://linkedin.com/in/alexjohnson'
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Design',
      bio: 'Sarah brings her background in fashion design and digital illustration to create stunning, print-ready artwork for our clients.',
      image: '/team/sarah.jpg',
      email: 'sarah@apparelbrand.com',
      linkedin: 'https://linkedin.com/in/sarahchen'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Production Manager',
      bio: 'Michael ensures every order is produced to our exacting standards, overseeing the printing, quality control, and fulfillment processes.',
      image: '/team/michael.jpg',
      email: 'michael@apparelbrand.com',
      linkedin: 'https://linkedin.com/in/michaelrodriguez'
    },
    {
      name: 'Jamie Taylor',
      role: 'Client Success Manager',
      bio: 'Jamie works directly with clients to understand their needs and guide them through the design and ordering process.',
      image: '/team/jamie.jpg',
      email: 'jamie@apparelbrand.com',
      linkedin: 'https://linkedin.com/in/jamietaylor'
    },
    {
      name: 'Priya Patel',
      role: 'Marketing Specialist',
      bio: 'Priya handles our digital presence, content creation, and helps clients showcase their custom apparel through various channels.',
      image: '/team/priya.jpg',
      email: 'priya@apparelbrand.com',
      linkedin: 'https://linkedin.com/in/priyapatel'
    },
    {
      name: 'David Wilson',
      role: 'Technical Designer',
      bio: 'David specializes in preparing artwork for various printing methods, ensuring designs look their best on every product.',
      image: '/team/david.jpg',
      email: 'david@apparelbrand.com',
      linkedin: 'https://linkedin.com/in/davidwilson'
    }
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
            <p className="text-lg text-gray-600">
              Meet the passionate individuals behind your custom apparel. Our diverse team brings together expertise in design, production, and customer service to deliver exceptional results.
            </p>
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
                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/20 mb-4 flex-shrink-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/200x200/e0e7ff/4f46e5?text=${member.name.split(' ').map(n => n[0]).join('')}`;
                    }}
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
