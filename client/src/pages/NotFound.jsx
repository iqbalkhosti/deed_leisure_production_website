import React from 'react';
import { Link } from 'react-router-dom';
import useSeo from '../hooks/useSeo';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  useSeo({
    title: 'Page not found',
    description: 'That page does not exist. Head back to the home page or get in touch.',
    path: '/404',
  });

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-200 mb-6">404</h1>
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/" 
              className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <Link 
              to="/contact" 
              className="flex items-center px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Search className="w-5 h-5 mr-2" />
              Help Me Find It
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}