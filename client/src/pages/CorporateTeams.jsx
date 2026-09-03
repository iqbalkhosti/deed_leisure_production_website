import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Shield, TrendingUp, Users, Award, Zap } from 'lucide-react';
import ChatBot from '../components/ChatBot';
import QuoteForm from '../components/QuoteForm';
import useSeo from '../hooks/useSeo';

export default function CorporateTeams() {
  useSeo({
    title: 'Custom apparel for corporate teams',
    description: 'Branded staff kits, conference merch, and bulk pricing with invoicing your finance team will accept.',
    path: '/corporate-teams',
  });


  const benefits = [
    {
      icon: Shield,
      title: 'Premium Quality',
      description: 'Professional-grade apparel that represents your brand'
    },
    {
      icon: Zap,
      title: 'Bulk Pricing',
      description: 'Competitive rates for corporate orders of all sizes'
    },
    {
      icon: Award,
      title: 'Brand Consistency',
      description: 'Pantone matching and brand guideline adherence'
    },
    {
      icon: TrendingUp,
      title: 'Account Management',
      description: 'Dedicated support for repeat orders and campaigns'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm mb-6">
              <Briefcase className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm font-medium text-gray-700">For Corporate Teams</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Professional Apparel for Teams That Mean Business
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Elevate your company culture with premium custom apparel. From team uniforms to 
              branded swag, we deliver quality that reflects your professional standards.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#enterprise-quote"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Request Enterprise Quote
              </a>
              <Link 
                to="/products"
                className="px-6 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                View Products →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Companies Choose Us</h2>
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

      {/* Use cases */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Perfect For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Team Uniforms</h3>
              <p className="text-gray-600">
                Professional attire for customer-facing teams, events, and daily operations
              </p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Corporate Swag</h3>
              <p className="text-gray-600">
                Branded merchandise for clients, events, and employee appreciation
              </p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Event Apparel</h3>
              <p className="text-gray-600">
                Custom gear for conferences, trade shows, and company retreats
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Enterprise Process</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Consultation</h3>
                  <p className="text-gray-600">
                    Meet with our team to discuss your requirements, brand guidelines, and goals
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Design & Approval</h3>
                  <p className="text-gray-600">
                    Review digital mockups and samples before full production begins
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold mb-2">Production & Delivery</h3>
                  <p className="text-gray-600">
                    Quality-controlled manufacturing with flexible fulfillment options
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise quote form */}
      <section className="py-16 bg-gray-50" id="enterprise-quote">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Request Enterprise Quote</h2>
            
            <QuoteForm
              source="Corporate teams"
              organizationLabel="Company name"
              messageLabel="What do you need?"
              messagePlaceholder="Staff kits, event merch, brand colours to match, and your deadline."
              submitLabel="Request corporate pricing"
            />
          </div>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
