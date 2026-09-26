import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowRight, ShieldCheck, Leaf, Heart, Recycle } from 'lucide-react';

export const Footer = () => {
  const { navigateToView, addToast } = useShop();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      addToast(`Thank you for subscribing! Your 15% discount code is PRISM15.`, 'Welcome to PRISM');
      setEmail('');
    }
  };

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        color: 'var(--color-text)',
        borderTop: '1px solid var(--color-border)',
        paddingTop: '80px',
        paddingBottom: '40px'
      }}
    >
      <div className="container">
        
        {/* Brand Value Pillars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '30px',
            paddingBottom: '60px',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          {[
            { icon: <ShieldCheck size={24} />, title: 'Dermatologist Tested', desc: 'Hypoallergenic & clinically verified formulas' },
            { icon: <Heart size={24} />, title: '100% Cruelty-Free', desc: 'Leaping Bunny certified, never tested on animals' },
            { icon: <Leaf size={24} />, title: 'Clean Bio-Botanicals', desc: 'Pure plant actives sourced sustainably worldwide' },
            { icon: <Recycle size={24} />, title: 'Recyclable Glass', desc: 'FSC certified paper and infinitely recyclable packaging' }
          ].map((pillar, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--color-sage)', flexShrink: 0 }}>{pillar.icon}</div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>{pillar.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Footer Links & Newsletter */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
            gap: '40px',
            padding: '60px 0',
            borderBottom: '1px solid var(--color-border)'
          }}
          className="footer-grid"
        >
          {/* Brand Col */}
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 500, letterSpacing: '0.15em', marginBottom: '4px' }}>
              PRISM
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.3em', color: 'var(--color-sage)', textTransform: 'uppercase', marginBottom: '16px' }}>
              SKINCARE, REFINED BY NATURE
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', maxWidth: '320px', lineHeight: 1.6 }}>
              Crafted in small botanical batches to restore, nourish, and elevate your daily skin ritual. Clean science meets timeless luxury.
            </p>
          </div>

          {/* Nav Links */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', color: 'var(--color-sage)' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><button onClick={() => navigateToView('shop')} style={{ color: 'var(--color-text-muted)' }}>Shop All Formulas</button></li>
              <li><button onClick={() => navigateToView('shop')} style={{ color: 'var(--color-text-muted)' }}>Best Sellers</button></li>
              <li><button onClick={() => navigateToView('about')} style={{ color: 'var(--color-text-muted)' }}>Our Botanical Story</button></li>
              <li><button onClick={() => navigateToView('journal')} style={{ color: 'var(--color-text-muted)' }}>Skin Journal</button></li>
            </ul>
          </div>

          {/* Concierge */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', color: 'var(--color-sage)' }}>
              Customer Care
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><button onClick={() => navigateToView('contact')} style={{ color: 'var(--color-text-muted)' }}>Contact Concierge</button></li>
              <li><button onClick={() => navigateToView('contact')} style={{ color: 'var(--color-text-muted)' }}>Shipping &amp; Delivery</button></li>
              <li><button onClick={() => navigateToView('contact')} style={{ color: 'var(--color-text-muted)' }}>Returns &amp; Guarantee</button></li>
              <li><button onClick={() => navigateToView('contact')} style={{ color: 'var(--color-text-muted)' }}>FAQ</button></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', color: 'var(--color-sage)' }}>
              Join The PRISM Circle
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Receive 15% off your first order plus early access to new botanical harvests.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  fontSize: '0.85rem',
                  border: '1px solid var(--color-border-dark)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-white)'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 18px' }} aria-label="Subscribe">
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Sub-footer Copyright */}
        <div style={{ paddingTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
          <div>
            &copy; {new Date().getFullYear()} Prism Skincare Ltd. All rights reserved. Portfolio Showcase Project.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Accessibility</span>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
};
