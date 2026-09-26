import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, Check, Gift } from 'lucide-react';

export const BespokeBundleBuilder = () => {
  const { PRODUCTS, addToCart } = useShop();

  const cleansers = PRODUCTS.filter(p => p.category === 'Cleansers');
  const serums = PRODUCTS.filter(p => p.category === 'Serums');
  const moisturizers = PRODUCTS.filter(p => p.category === 'Moisturizers' || p.category === 'Sets');

  const [selectedCleanser, setSelectedCleanser] = useState(cleansers[0]);
  const [selectedSerum, setSelectedSerum] = useState(serums[0]);
  const [selectedMoisturizer, setSelectedMoisturizer] = useState(moisturizers[0]);

  const rawSubtotal = selectedCleanser.price + selectedSerum.price + selectedMoisturizer.price;
  const bundleDiscountRate = 0.15;
  const bundleSavings = rawSubtotal * bundleDiscountRate;
  const bundleTotal = rawSubtotal - bundleSavings;

  const handleAddBundleToCart = () => {
    addToCart(selectedCleanser);
    addToCart(selectedSerum);
    addToCart(selectedMoisturizer);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        padding: '40px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-sage)', letterSpacing: '0.12em', marginBottom: '6px' }}>
          <Sparkles size={14} /> Custom Ritual Atelier
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 500, marginBottom: '8px' }}>
          Build Your Bespoke 3-Step Routine
        </h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', maxWidth: '540px', margin: '0 auto' }}>
          Select 1 Cleanser, 1 Active Serum, and 1 Moisture Seal. Automatically save 15% + receive a complimentary luxury unboxing keepsake box.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '36px' }} className="hero-grid">
        
        {/* Step 1: Cleanser */}
        <div style={{ backgroundColor: 'var(--color-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '12px' }}>
            Step 1: Purify
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cleansers.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedCleanser(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedCleanser.id === p.id ? 'var(--color-white)' : 'transparent',
                  border: selectedCleanser.id === p.id ? '2px solid var(--color-text)' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>{p.name}</div>
                  <div className="price" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>${p.price}</div>
                </div>
                {selectedCleanser.id === p.id && <Check size={16} style={{ color: 'var(--color-sage)' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Serum */}
        <div style={{ backgroundColor: 'var(--color-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '12px' }}>
            Step 2: Repair
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {serums.slice(0, 2).map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedSerum(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedSerum.id === p.id ? 'var(--color-white)' : 'transparent',
                  border: selectedSerum.id === p.id ? '2px solid var(--color-text)' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>{p.name}</div>
                  <div className="price" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>${p.price}</div>
                </div>
                {selectedSerum.id === p.id && <Check size={16} style={{ color: 'var(--color-sage)' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Moisture */}
        <div style={{ backgroundColor: 'var(--color-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '12px' }}>
            Step 3: Moisture Seal
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {moisturizers.slice(0, 2).map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedMoisturizer(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedMoisturizer.id === p.id ? 'var(--color-white)' : 'transparent',
                  border: selectedMoisturizer.id === p.id ? '2px solid var(--color-text)' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>{p.name}</div>
                  <div className="price" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>${p.price}</div>
                </div>
                {selectedMoisturizer.id === p.id && <Check size={16} style={{ color: 'var(--color-sage)' }} />}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Summary Footer */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-sage)', fontWeight: 600 }}>
            <Gift size={16} /> Complimentary Keepsake Gift Box Included
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="price" style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', fontFamily: 'var(--font-sans)' }}>
              ${rawSubtotal.toFixed(2)}
            </div>
            <div className="price" style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-sans)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              ${bundleTotal.toFixed(2)} <span style={{ fontSize: '0.78rem', color: 'var(--color-sage)', fontWeight: 600 }}> (Save 15%)</span>
            </div>
          </div>

          <button onClick={handleAddBundleToCart} className="btn btn-primary" style={{ padding: '16px 32px' }}>
            <Sparkles size={16} /> Add Bespoke Ritual to Bag
          </button>
        </div>
      </div>

    </div>
  );
};
