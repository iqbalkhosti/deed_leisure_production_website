import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BadgeDollarSign, Clock, Sparkles, Calendar, CheckCircle } from 'lucide-react';
import ChatBot from '../components/ChatBot';
import QuoteForm from '../components/QuoteForm';
import useSeo from '../hooks/useSeo';
import site from '../data/site';

export default function StudentClubs() {
  useSeo({
    title: 'Custom apparel for student clubs',
    description: 'Club pricing, small minimums, and turnaround that fits a semester. Custom tees, hoodies, and polos for student organizations.',
    path: '/student-clubs',
  });


  const benefits = [
    {
      icon: BadgeDollarSign,
      title: 'Student Pricing',
      description: 'Special discounts for student organizations and clubs'
    },
    {
      icon: Clock,
      title: 'Quick Turnaround',
      description: 'Fast production to meet your event deadlines'
    },
    {
      icon: Sparkles,
      title: 'Free Design Help',
      description: 'Our designers help bring your club vision to life'
    },
    {
      icon: CheckCircle,
      title: 'Low Minimums',
      description: `Start at ${site.minimumOrder} pieces — sized for a small exec team, not a warehouse`
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm mb-6">
              <Users className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium text-gray-700">For Student Clubs</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Custom Apparel for Your Club
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Unite your members with custom merch that shows your club spirit. 
              From frosh week to graduation, we've got you covered.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#quote"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Get a Quote
              </a>
              <Link 
                to="/ontario-tech-clubs"
                className="px-6 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                Ontario Tech Clubs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Clubs Love Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const IconComponent = benefit.icon;
              return (
                <div key={benefit.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Book a Meeting</h3>
                  <p className="text-gray-600">Schedule a quick call to discuss your club's needs, timeline, and budget</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Design</h3>
                  <p className="text-gray-600">Upload your logo or work with our team to create something unique</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Deliver</h3>
                  <p className="text-gray-600">Get your orders ready in time for your events, meetings, or giveaways</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote form */}
      <section className="py-16" id="quote">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Get Your Club Quote</h2>
            
            <QuoteForm
              source="Student clubs"
              organizationLabel="Club name"
              messageLabel="Tell us about your order"
              messagePlaceholder="Which products, rough sizes, whether you have artwork, and the event date."
              submitLabel="Get club pricing"
            />
          </div>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
