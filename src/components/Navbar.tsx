import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingBag, Lock, LogOut, Settings, User } from 'lucide-react';
import { ActiveView, CartItem } from '../types';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (loggedIn: boolean) => void;
  siteConfig?: any;
  currentPageSlug?: string;
  setCurrentPageSlug?: (slug: string) => void;
  onNavigateToShop?: (cat: string) => void;
}

export default function Navbar({
  activeView,
  setActiveView,
  cart,
  setIsCartOpen,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  siteConfig = {},
  currentPageSlug = '',
  setCurrentPageSlug,
  onNavigateToShop,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Login modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleNavClick = (target: string) => {
    if (target.startsWith('page:')) {
      const pageSlug = target.replace('page:', '');
      if (setCurrentPageSlug) {
        setCurrentPageSlug(pageSlug);
      }
      setActiveView('page');
    } else if (target.startsWith('shop:')) {
      const categoryId = target.replace('shop:', '');
      if (onNavigateToShop) {
        onNavigateToShop(categoryId);
      } else {
        setActiveView('shop');
      }
    } else {
      if (target === 'shop' && onNavigateToShop) {
        onNavigateToShop('all');
      } else {
        setActiveView(target as ActiveView);
      }
    }
    setMobileMenuOpen(false);
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const targetEmail = 'therishx@gmail.com';
    const targetPassword = 'Jesus@9664808@';

    if (loginEmail.trim().toLowerCase() === targetEmail && loginPassword === targetPassword) {
      setIsAdminLoggedIn(true);
      setIsLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setActiveView('admin');
    } else {
      setLoginError('The email or password you entered is incorrect.');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setActiveView('home');
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-charcoal text-warm-white py-2 text-center overflow-hidden relative z-50">
        <div className="flex justify-center items-center gap-2 w-full font-sans text-[11px] md:text-xs font-medium tracking-wide">
          <span className="flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-sage" />
            Free UK Delivery on orders over £50
          </span>
          <span className="mx-2 opacity-35">|</span>
          <span>30-Day Hassle-Free Returns</span>
          <span className="mx-2 opacity-35 hidden md:inline">|</span>
          <span className="hidden md:inline text-sand">Crafted for Healthy Hip Development</span>
        </div>
      </div>

      {/* TopAppBar Header */}
      <header className="bg-warm-white/90 backdrop-blur-xl border-b border-sand/20 sticky top-0 w-full z-40 transition-all duration-300">
        <div className="flex justify-between items-center w-full px-5 md:px-16 py-4 max-w-7xl mx-auto">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-charcoal hover:text-sage transition-colors duration-300 active:scale-95 p-1 md:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <button
              onClick={() => handleNavClick('home')}
              className="font-serif text-xl md:text-2xl font-bold tracking-tight text-charcoal transition-opacity hover:opacity-90 cursor-pointer"
            >
              Baby Dwelling
            </button>
          </div>

          {/* Center: Desktop Navigation Links with animated indicator */}
          <nav className="hidden md:flex items-center gap-8 relative">
            {(siteConfig.navigation || [
              { label: 'Our Story', target: 'home' },
              { label: 'Shop All', target: 'shop' },
              { label: 'Signature Heritage', target: 'detail' }
            ]).map((navItem: any, index: number) => {
              const isPageActive = navItem.target.startsWith('page:') && activeView === 'page' && currentPageSlug === navItem.target.replace('page:', '');
              const isShopActive = navItem.target === 'shop' && activeView === 'shop';
              const isHomeActive = navItem.target === 'home' && activeView === 'home';
              const isDetailActive = navItem.target === 'detail' && activeView === 'detail';
              const isSeoActive = navItem.target === 'seo' && activeView === 'seo';
              const isActive = isPageActive || isShopActive || isHomeActive || isDetailActive || isSeoActive;
              return (
                <button
                  key={index}
                  onClick={() => handleNavClick(navItem.target)}
                  className={`font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 relative py-2 cursor-pointer ${
                    isActive
                      ? 'text-charcoal font-bold'
                      : 'text-charcoal/60 hover:text-charcoal'
                  }`}
                >
                  {navItem.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            {/* Admin Dashboard Link if logged in */}
            {isAdminLoggedIn && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 relative py-2 cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'admin' ? 'text-[#008060] font-bold' : 'text-[#008060]/75 hover:text-[#008060]'
                }`}
              >
                <Settings size={12} className="animate-spin-slow" />
                <span>Shopify Admin</span>
              </button>
            )}
          </nav>

          {/* Right: Actions (Interactive Cart Drawer Trigger & Admin Login Button) */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Interactive Cart Button with dynamic badge counter */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-charcoal hover:text-sage transition-all duration-300 active:scale-95 p-2 rounded-full hover:bg-light-beige/50 flex items-center gap-1 cursor-pointer"
              aria-label="View Cart"
            >
              <div className="relative">
                <ShoppingBag size={19} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 bg-terracotta text-warm-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-sans font-bold shadow-sm"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className="hidden lg:inline text-xs font-sans font-semibold tracking-wider uppercase ml-1">Cart</span>
            </button>

            {/* Admin Login Button - just beside the cart */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1.5 border-l border-sand/35 pl-2">
                <button
                  onClick={() => handleNavClick('admin')}
                  className="p-2 text-charcoal hover:text-[#008060] rounded-full hover:bg-light-beige/50 transition-colors cursor-pointer"
                  title="Shopify Admin Portal"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-charcoal hover:text-red-500 rounded-full hover:bg-light-beige/50 transition-colors cursor-pointer"
                  title="Logout Admin"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-charcoal hover:text-terracotta transition-all duration-300 active:scale-95 p-2 rounded-full hover:bg-light-beige/50 flex items-center gap-1 cursor-pointer border-l border-sand/35 pl-3"
                title="Admin Login"
              >
                <Lock size={18} />
                <span className="hidden lg:inline text-xs font-sans font-semibold tracking-wider uppercase ml-1">Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Sliding Responsive Mobile Drawer Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden w-full bg-warm-white border-b border-sand/20 overflow-hidden relative z-50"
            >
              <div className="flex flex-col px-6 py-6 gap-5">
                {(siteConfig.navigation || [
                  { label: 'Our Story', target: 'home' },
                  { label: 'Shop All', target: 'shop' },
                  { label: 'Signature Heritage', target: 'detail' }
                ]).map((navItem: any, index: number) => {
                  const isPageActive = navItem.target.startsWith('page:') && activeView === 'page' && currentPageSlug === navItem.target.replace('page:', '');
                  const isShopActive = navItem.target === 'shop' && activeView === 'shop';
                  const isHomeActive = navItem.target === 'home' && activeView === 'home';
                  const isDetailActive = navItem.target === 'detail' && activeView === 'detail';
                  const isSeoActive = navItem.target === 'seo' && activeView === 'seo';
                  const isActive = isPageActive || isShopActive || isHomeActive || isDetailActive || isSeoActive;
                  return (
                    <button
                      key={index}
                      onClick={() => handleNavClick(navItem.target)}
                      className={`text-left font-sans text-xs font-semibold tracking-wider uppercase py-2 border-b border-sand/10 flex justify-between items-center cursor-pointer ${
                        isActive ? 'text-terracotta' : 'text-charcoal'
                      }`}
                    >
                      <span>{navItem.label}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-terracotta" />}
                    </button>
                  );
                })}

                {/* Mobile Admin Link */}
                {isAdminLoggedIn && (
                  <>
                    <button
                      onClick={() => handleNavClick('admin')}
                      className={`text-left font-sans text-sm font-bold tracking-wider uppercase py-2 border-b border-sand/10 flex justify-between items-center cursor-pointer text-[#008060] ${
                        activeView === 'admin' ? 'text-[#008060]' : 'text-[#008060]/85'
                      }`}
                    >
                      <span>Shopify Admin Panel</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#008060]" />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-left font-sans text-xs font-semibold tracking-wider uppercase py-2 border-b border-sand/10 flex justify-between items-center cursor-pointer text-red-500 hover:text-red-600"
                    >
                      <span>Log Out Admin</span>
                      <LogOut size={14} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Admin Login Modal Overlay */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-5">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-warm-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-sand/30 relative text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setLoginError('');
                }}
                className="absolute top-6 right-6 text-charcoal/40 hover:text-charcoal p-1.5 hover:bg-light-beige/50 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col gap-2 mb-6">
                <div className="w-12 h-12 bg-light-beige rounded-2xl flex items-center justify-center text-terracotta shadow-sm mb-1">
                  <Lock size={22} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-charcoal">Shopify Admin Access</h3>
                <p className="font-sans text-xs text-charcoal/50">Enter authorized credentials to modify Baby Dwelling storefront sections.</p>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3 mb-4 font-sans font-medium">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-semibold text-charcoal/70 flex items-center gap-1">
                    <User size={13} /> Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="therishx@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="p-3.5 rounded-xl border border-sand/40 bg-white text-charcoal font-sans text-xs outline-none focus:border-terracotta transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-semibold text-charcoal/70 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Lock size={13} /> Password</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-terracotta hover:underline focus:outline-none"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter security key"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="p-3.5 rounded-xl border border-sand/40 bg-white text-charcoal font-sans text-xs outline-none focus:border-terracotta transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 mt-2 bg-charcoal text-warm-white font-sans text-xs font-semibold tracking-wider uppercase rounded-xl shadow-md hover:bg-charcoal/95 active:scale-95 transition-all cursor-pointer text-center"
                >
                  Authorize &amp; Sign In
                </button>
              </form>

              {/* Secure reminder text */}
              <p className="text-[10px] text-center text-charcoal/30 mt-6 leading-relaxed">
                Security notice: Connection is sandboxed and encrypted. Authorizations expire automatically on closing.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
