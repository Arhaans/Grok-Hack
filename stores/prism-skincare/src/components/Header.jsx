import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Search, ShoppingBag, Heart, Menu, X, Sparkles, Sun, Moon } from 'lucide-react';

export const Header = () => {
  const {
    currentView,
    navigateToView,
    cartItemCount,
    wishlist,
    setIsCartOpen,
    setIsSearchOpen,
    setIsQuizOpen,
    themeMode,
    toggleThemeMode
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Shop', view: 'shop' },
    { label: 'Best Sellers', view: 'shop' },
    { label: 'About', view: 'about' },
    { label: 'Journal', view: 'journal' },
    { label: 'Contact', view: 'contact' }
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        width: '100%',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Announcement Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-text)',
          color: 'var(--color-bg)',
          padding: '8px 16px',
          fontSize: '0.76rem',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <Sparkles size={13} style={{ color: 'var(--color-sage)' }} />
        <span>Complimentary Express Shipping on orders over $75 &nbsp;|&nbsp; 3 Luxury Botanical Samples Included</span>
      </div>

      {/* Main Sticky Navbar */}
      <nav
        style={{
          backgroundColor: isScrolled || currentView !== 'home' ? 'var(--color-bg)' : 'var(--color-bg)',
          borderBottom: isScrolled ? '1px solid var(--color-border)' : '1px solid transparent',
          boxShadow: isScrolled ? 'var(--shadow-sm)' : 'none',
          padding: '16px 0',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', cursor: 'pointer' }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Nav Links */}
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => navigateToView(link.view)}
                style={{
                  fontSize: '0.88rem',
                  fontWeight: currentView === link.view ? 600 : 500,
                  letterSpacing: '0.04em',
                  color: currentView === link.view ? 'var(--color-text)' : 'var(--color-text-muted)',
                  padding: '4px 0',
                  borderBottom: currentView === link.view ? '2px solid var(--color-sage)' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Logo */}
          <button
            onClick={() => navigateToView('home')}
            style={{
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.85rem',
                fontWeight: 500,
                letterSpacing: '0.18em',
                lineHeight: 1,
                color: 'var(--color-text)'
              }}
            >
              PRISM
            </div>
            <div
              style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--color-sage)',
                marginTop: '2px'
              }}
            >
              SKINCARE
            </div>
          </button>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* AM / PM Theme Switcher */}
            <button
              onClick={toggleThemeMode}
              className="btn-icon"
              title={themeMode === 'am' ? 'Switch to PM Repair Theme' : 'Switch to AM Dew Theme'}
              style={{ border: '1px solid var(--color-border)', width: '38px', height: '38px' }}
            >
              {themeMode === 'am' ? <Sun size={18} style={{ color: '#d35400' }} /> : <Moon size={18} style={{ color: 'var(--color-sage)' }} />}
            </button>

            {/* Routine Finder Quiz Button */}
            <button
              onClick={() => setIsQuizOpen(true)}
              className="desktop-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                border: '1px solid var(--color-sage)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-sage-hover)',
                backgroundColor: 'var(--color-sage-light)',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={14} />
              <span>Routine Quiz</span>
            </button>

            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="btn-icon"
              aria-label="Search catalogue"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigateToView('shop')}
              className="btn-icon"
              style={{ position: 'relative' }}
              aria-label="View wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'var(--color-sage)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Drawer Toggle */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-icon"
              style={{ position: 'relative' }}
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'var(--color-text)',
                    color: 'var(--color-bg)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: 'var(--color-bg)',
              borderTop: '1px solid var(--color-border)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  navigateToView(link.view);
                  setMobileMenuOpen(false);
                }}
                style={{
                  textAlign: 'left',
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 500,
                  color: 'var(--color-text)'
                }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setIsQuizOpen(true);
                setMobileMenuOpen(false);
              }}
              className="btn btn-sage"
            >
              <Sparkles size={16} /> Take Routine Quiz
            </button>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 920px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
        }
      `}</style>
    </header>
  );
};
