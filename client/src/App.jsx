import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Products from './pages/Products';
import OurTeam from './pages/OurTeam';
import OurProcess from './pages/OurProcess';
import OntarioTechClubs from './pages/OntarioTechClubs';
import StudentClubs from './pages/StudentClubs';
import CorporateTeams from './pages/CorporateTeams';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import NotFound from './pages/NotFound';

// The studio pulls in the recolouring engine and canvas work — worth splitting
// out so the marketing pages stay light.
const DesignStudio = lazy(() => import('./pages/DesignStudio'));

const Fallback = (
  <div className="flex min-h-screen items-center justify-center text-gray-500">Loading…</div>
);

/** Browsers restore scroll on history navigation; a new route should start at the top. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function PublicLayout() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* The studio is a full-screen tool with its own header. */}
        <Route
          path="/design-studio"
          element={<Suspense fallback={Fallback}><DesignStudio /></Suspense>}
        />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/our-process" element={<OurProcess />} />
          <Route path="/our-team" element={<OurTeam />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/student-clubs" element={<StudentClubs />} />
          <Route path="/corporate-teams" element={<CorporateTeams />} />
          <Route path="/ontario-tech-clubs" element={<OntarioTechClubs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
