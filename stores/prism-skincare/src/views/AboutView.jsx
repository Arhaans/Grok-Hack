import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, Leaf, Recycle } from 'lucide-react';

export const AboutView = () => {
  const { navigateToView } = useShop();

  return (
    <div className="about-view section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container">
        
        {/* Hero Banner */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px auto' }}>
          <span className="subtitle">Our Botanical Heritage</span>
          <h1 className="heading-xl" style={{ marginTop: '8px', marginBottom: '20px' }}>
            Where Bio-Science Meets Timeless Ritual.
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Prism Skincare was founded on a simple realization: true radiance doesn't come from aggressive peels or complex 12-step routines—it stems from a healthy, resilient skin barrier.
          </p>
        </div>

        {/* Founder Letter Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            marginBottom: '100px'
          }}
          className="hero-grid"
        >
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            <img
              src="/images/night_oil.png"
              alt="Dr. Elena Vance in PRISM Laboratory"
              style={{ width: '100%', height: '520px', objectFit: 'cover' }}
            />
          </div>

          <div>
            <span className="subtitle">Founder's Note</span>
            <h2 className="heading-lg" style={{ marginTop: '4px', marginBottom: '20px' }}>
              "Your skin doesn't need more products. It needs pure cellular alignment."
            </h2>

            <div style={{ fontSize: '0.98rem', color: 'var(--color-text-muted)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>
                "As a clinical dermatologist and biochemist, I spent years treating patients whose skin barriers were severely damaged by over-formulated products packed with synthetic fragrance and filler."
              </p>
              <p>
                "We founded PRISM to create biocompatible formulas using wild-harvested botanicals and skin-identical lipids. Each sachet and bottle is formulated to work in harmony with your skin's natural lipid structure."
              </p>
            </div>

            <div style={{ marginTop: '32px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600 }}>
                Dr. Elena Vance
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-sage)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Founder &amp; Chief Biochemist, Prism Skincare
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div style={{ marginBottom: '100px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="subtitle">Our Uncompromising Standards</span>
            <h2 className="heading-lg" style={{ marginTop: '4px' }}>The Three Pillars of PRISM</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {[
              {
                icon: <Leaf size={32} />,
                title: 'Clean Bio-Actives',
                desc: 'We cold-extract active polyphenols and ceramides without harsh chemical solvents, preserving 99.4% nutrient potency.'
              },
              {
                icon: <ShieldCheck size={32} />,
                title: 'Clinical Biocompatibility',
                desc: 'Every formula undergoes rigorous 3rd-party patch testing on sensitive skin panels. Zero artificial fragrance, silicone, or parabens.'
              },
              {
                icon: <Recycle size={32} />,
                title: 'Conscious Luxury',
                desc: 'Housed in UV-protective recyclable amber glass with FSC-certified paper packaging. 100% carbon-neutral fulfillment.'
              }
            ].map((pillar, i) => (
              <div key={i} className="card-white" style={{ padding: '40px 30px', textAlign: 'center' }}>
                <div style={{ color: 'var(--color-sage)', marginBottom: '20px', display: 'inline-block' }}>{pillar.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px' }}>{pillar.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Timeline */}
        <div style={{ maxWidth: '800px', margin: '0 auto 80px auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="subtitle">Our Journey</span>
            <h2 className="heading-lg" style={{ marginTop: '4px' }}>The PRISM Timeline</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {[
              { year: '2022', title: 'The Laboratory Breakthrough', desc: 'Dr. Elena Vance isolates the optimal 3:1:1 lipid ratio for rapid stratum corneum barrier repair.' },
              { year: '2023', title: 'Launch of Prism Skincare', desc: 'Debuted our flagship Botanical Barrier Repair Serum to critical acclaim from dermatologists worldwide.' },
              { year: '2024', title: 'Certified B-Corp & Zero-Waste Packaging', desc: 'Achieved 100% plastic-neutral certification and launched infinite refill recycling incentives.' },
              { year: '2026', title: 'Global Botanical Conservation', desc: 'Partnering with organic wild Centella growers to fund biodiversity preservation in Madagascar.' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, color: 'var(--color-sage)', minWidth: '90px' }}>
                  {item.year}
                </div>
                <div style={{ borderLeft: '2px solid var(--color-border)', paddingLeft: '24px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h2 className="heading-md" style={{ marginBottom: '12px' }}>Experience Refined Botanical Skincare</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Begin your skin restoration journey today with our curated best-sellers.
          </p>
          <button onClick={() => navigateToView('shop')} className="btn btn-primary">
            Explore Collection
          </button>
        </div>

      </div>
    </div>
  );
};
