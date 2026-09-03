import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shirt, Sparkles, Smile, Upload, Clock, BadgeDollarSign, CheckCircle } from 'lucide-react';
import ChatBot from '../components/ChatBot';
import QuoteForm from '../components/QuoteForm';
import useSeo from '../hooks/useSeo';

export default function OntarioTechClubs() {
  useSeo({
    title: 'Custom apparel for Ontario Tech clubs',
    description: 'We work with Ontario Tech societies and know how campus approvals run. Club pricing on tees, hoodies, and polos.',
    path: '/ontario-tech-clubs',
  });


  // Club-specific steps
  const clubSteps = [
    {
      title: 'Pick your canvas',
      description: 'Choose from our premium apparel options with special bulk pricing for Ontario Tech clubs.',
      icon: Shirt
    },
    {
      title: 'Get creative',
      description: 'Upload your club logo or work with our design team to create something unique.',
      icon: Sparkles
    },
    {
      title: 'Make them proud',
      description: 'Receive high-quality custom apparel that your club members will love to wear.',
      icon: Smile
    }
  ];

  // Club benefits
  const clubBenefits = [
    {
      icon: BadgeDollarSign,
      title: 'Special Club Pricing',
      description: 'Exclusive discounts for Ontario Tech clubs and societies on bulk orders.'
    },
    {
      icon: Clock,
      title: 'Priority Production',
      description: 'Expedited timelines to meet your club events and deadlines.'
    },
    {
      icon: CheckCircle,
      title: 'Quality Guarantee',
      description: 'Premium materials and printing methods for apparel that lasts.'
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: 'A club specialist to help with your order from design to delivery.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Ontario Tech Clubs & Societies</h1>
            <p className="text-lg text-gray-600 mb-8">
              Custom apparel solutions designed specifically for Ontario Tech University clubs, teams, and student organizations. Get premium quality at special bulk pricing.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#club-quote"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Get a Club Quote
              </a>
              <Link 
                to="/products"
                className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                See Club Examples
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works for clubs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works for Clubs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make the process simple so you can focus on what matters - your club activities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {clubSteps.map((step, index) => {
              const IconComponent = step.icon;
              
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Club benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Club Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubBenefits.map((benefit) => {
              const IconComponent = benefit.icon;
              
              return (
                <div 
                  key={benefit.title}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
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

      {/* Club quote form */}
      <section className="py-16" id="club-quote">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Get a Club Quote</h2>
            
            <QuoteForm
              source="Ontario Tech clubs"
              organizationLabel="Club or society name"
              messageLabel="Tell us about your order"
              messagePlaceholder="Which products, rough sizes, artwork status, and when you need them on campus."
              submitLabel="Get club pricing"
            />
          </div>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
