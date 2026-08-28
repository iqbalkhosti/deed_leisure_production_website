import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const navLinkClass = ({ isActive }) =>
  isActive
    ? 'text-primary font-medium'
    : 'text-gray-700 hover:text-primary transition-colors';

const mobileNavLinkClass = ({ isActive }) =>
  `block py-2 px-4 rounded-lg ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, userRole, isAdmin, isExec, profileName, signOut } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const closeMenu = () => setIsMenuOpen(false);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  const dashboardPath = isAdmin ? '/admin' : isExec ? '/club' : '/listings';
  const dashboardLabel = isAdmin ? 'Admin Portal' : isExec ? 'Vendor Dashboard' : 'Marketplace';

  const roleLabel =
    userRole === 'admin' ? 'Admin'
    : userRole === 'club_exec' ? 'Vendor'
    : 'User';
  const displayName = profileName || user?.user_metadata?.full_name || 'Account';

  return (
    <nav className="sticky top-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-primary transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            Apparel
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-10">
            <div className="flex space-x-6">
              <NavLink to="/" end className={navLinkClass}>Home</NavLink>
              <NavLink to="/products" className={navLinkClass}>Products</NavLink>
              <NavLink to="/listings" className={navLinkClass}>Marketplace</NavLink>
              <NavLink to="/our-process" className={navLinkClass}>Our Process</NavLink>
              <NavLink to="/our-team" className={navLinkClass}>Our Team</NavLink>
            </div>

            <div className="flex items-center space-x-3">
              {user && (
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-400 hover:text-gray-900 px-4 py-2.5 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {dashboardLabel}
                </Link>
              )}
              <NavLink
                to="/design-studio"
                className="bg-gray-800 text-white hover:bg-gray-700 px-5 py-2.5 rounded-lg transition-colors font-medium text-sm"
              >
                Design Studio
              </NavLink>
              <NavLink
                to="/contact"
                className="bg-primary text-white hover:bg-primary/90 px-5 py-2.5 rounded-lg transition-colors font-medium text-sm"
              >
                Get a Quote
              </NavLink>

              {/* Auth section */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-gray-700 max-w-[100px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{roleLabel}</p>
                        <p className="text-sm text-gray-800 truncate mt-0.5">{displayName}</p>
                      </div>
                      <Link
                        to={dashboardPath}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        {dashboardLabel}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-400 px-4 py-2.5 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(o => !o)}
            className="md:hidden text-gray-700 hover:text-primary focus:outline-none"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <NavLink to="/" end className={mobileNavLinkClass} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/products" className={mobileNavLinkClass} onClick={closeMenu}>Products</NavLink>
            <NavLink to="/listings" className={mobileNavLinkClass} onClick={closeMenu}>Marketplace</NavLink>
            <NavLink to="/our-process" className={mobileNavLinkClass} onClick={closeMenu}>Our Process</NavLink>
            <NavLink to="/our-team" className={mobileNavLinkClass} onClick={closeMenu}>Our Team</NavLink>

            <div className="pt-3 border-t border-gray-100 mt-2 flex flex-col gap-2">
              <NavLink
                to="/design-studio"
                className="bg-gray-800 text-white hover:bg-gray-700 px-4 py-2.5 rounded-lg text-center font-medium text-sm"
                onClick={closeMenu}
              >
                Design Studio
              </NavLink>
              <NavLink
                to="/contact"
                className="bg-primary text-white hover:bg-primary/90 px-4 py-2.5 rounded-lg text-center font-medium text-sm"
                onClick={closeMenu}
              >
                Get a Quote
              </NavLink>

              {user ? (
                <div className="bg-gray-50 rounded-xl p-3 mt-1">
                  <p className="text-xs text-gray-400 mb-2">{roleLabel} · {displayName}</p>
                  <Link
                    to={dashboardPath}
                    onClick={closeMenu}
                    className="flex items-center gap-2 text-sm font-medium text-gray-800 py-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-500" />
                    {dashboardLabel}
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); closeMenu(); }}
                    className="flex items-center gap-2 text-sm font-medium text-red-600 py-1.5 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        <NavLink
          to="/design-studio"
          className="flex-1 bg-gray-800 text-white text-center py-3 font-medium text-sm"
        >
          Design Studio
        </NavLink>
        <NavLink
          to="/listings"
          className="flex-1 bg-primary/10 text-primary text-center py-3 font-medium text-sm"
        >
          Marketplace
        </NavLink>
        <NavLink
          to="/contact"
          className="flex-1 bg-primary text-white text-center py-3 font-medium text-sm"
        >
          Get a Quote
        </NavLink>
      </div>
    </nav>
  );
}
