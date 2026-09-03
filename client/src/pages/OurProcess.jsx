import React from 'react';
import { Link } from 'react-router-dom';
import useSeo from '../hooks/useSeo';
import { MessageSquare, Palette, CheckCircle, Package, Clock, BarChart } from 'lucide-react';
import ChatBot from '../components/ChatBot';

export default function OurProcess() {
  useSeo({
    title: 'How it works',
    description: 'From first conversation to delivered boxes: how a custom apparel order runs at Deed Leisure, and what we need from you at each step.',
    path: '/our-process',
  });

  // Process steps
  const processSteps = [
    {
      icon: MessageSquare,
      title: 'Consultation',
      description: 'We start by understanding your needs, timeline, and vision. This can be done via email, phone, or an in-person meeting.',
      timeframe: '1-2 days'
    },
    {
      icon: Palette,
      title: 'Design & Mockups',
        description: 'Our design team creates digital mockups of your apparel, incorporating your logo or custom artwork. Revisions are included until you\'re completely satisfied.',
      timeframe: '3-5 days'
    },
    {
      icon: CheckCircle,
      title: 'Approval & Production',
      description: 'Once you approve the final design, we move to production. This includes preparing the artwork for printing and setting up the manufacturing process.',
      timeframe: '1-2 days'
    },
    {
      icon: Package,
      title: 'Printing & Quality Control',
      description: 'Your apparel is printed using your chosen method. Each item undergoes thorough quality checks to ensure it meets our standards.',
      timeframe: '5-10 days'
    },
    {
      icon: Clock,
      title: 'Delivery',
      description: 'Your finished products are carefully packaged and delivered to your specified location. We provide tracking information so you can monitor the shipment.',
      timeframe: '2-5 days'
    }
  ];

  // FAQs about the process
  const processFaqs = [
    {
      question: 'How long does the entire process take?',
      answer: 'From initial consultation to delivery, the process typically takes 2-3 weeks. Rush orders may be available for an additional fee, with delivery in as little as 7-10 business days.'
    },
    {
      question: 'Can I make changes after approving the design?',
      answer: 'Minor changes can sometimes be accommodated before production begins. Once production starts, changes are not possible. We recommend thoroughly reviewing your design before final approval.'
    },
    {
      question: 'Do you provide samples before full production?',
      answer: 'Yes, we can provide pre-production samples for a nominal fee, which is credited toward your final order when you proceed with production.'
    },
    {
      question: 'What if I\'m not satisfied with the final product?',
      answer: 'Customer satisfaction is our priority. If there are any issues with the quality or execution of your order, please contact us within 7 days of receipt, and we\'ll work to make it right.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Process</h1>
            <p className="text-lg text-gray-600">
              We've streamlined our approach to custom apparel to ensure a smooth, transparent experience from concept to delivery. Here's how we bring your vision to life.
            </p>
          </div>
        </div>
      </section>

      {/* Process timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {processSteps.map((step, index) => (
              <div key={step.title} className="relative">
                {/* Timeline connector */}
                {index < processSteps.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200" />
                )}
                
                <div className="flex gap-8 mb-12">
                  {/* Icon */}
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">Step {index + 1}: {step.title}</h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{step.timeframe}</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Track Record</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-8 h-8 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <p className="text-gray-600">On-time delivery rate</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <p className="text-gray-600">Customer satisfaction</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <p className="text-gray-600">Items produced annually</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">24h</div>
              <p className="text-gray-600">Average response time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Process FAQs</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {processFaqs.map((faq) => (
                <div 
                  key={faq.question}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-primary/10 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Let's bring your custom apparel vision to life. Our team is ready to guide you through every step of the process.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/design-studio" 
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Start Designing
              </Link>
              <Link 
                to="/contact" 
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
