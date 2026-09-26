import React, { useState } from 'react';
import { MapPin, CheckCircle, Award } from 'lucide-react';

export const SourcingRegistry = () => {
  const [activeOrigin, setActiveOrigin] = useState('centella');
  const [batchCode, setBatchCode] = useState('');
  const [verifiedReport, setVerifiedReport] = useState(null);

  const origins = {
    centella: {
      location: 'Ambanja, Madagascar',
      botanical: 'Centella Asiatica (Wild Harvest)',
      potency: '99.4% Active Madecassoside',
      desc: 'Sustainably hand-harvested by local cooperative farming collectives in northwestern Madagascar. Cold-extracted within 6 hours of harvest.'
    },
    rice: {
      location: 'Niigata Prefecture, Japan',
      botanical: 'Oryza Sativa Ferment',
      potency: 'Enriched in Kojic & Amino Acids',
      desc: 'Fermented for 14 days in traditional wooden vats using pure alpine spring water, yielding bio-compatible skin brightening enzymes.'
    },
    squalane: {
      location: 'Andalusia, Spain',
      botanical: 'Olea Europaea Squalane',
      potency: '100% Plant Biocompatible',
      desc: 'Hydrogenated olive-derived lipid that perfectly mirrors human sebum, restoring stratum corneum barrier integrity without clogging pores.'
    }
  };

  const handleVerifyBatch = (e) => {
    e.preventDefault();
    if (batchCode.trim()) {
      setVerifiedReport({
        code: batchCode.trim().toUpperCase(),
        date: 'July 2026',
        purity: '99.8% Certified Bio-Active Purity',
        microbial: 'Zero Contaminants • Pass',
        heavyMetals: 'Undetectable (<0.001 ppm) • Pass',
        ph: '5.45 (Optimal Stratum Corneum Level)'
      });
    }
  };

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)' }}>
      <div className="container">
        
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px auto' }}>
          <span className="subtitle">Traceability &amp; Ethics</span>
          <h2 className="heading-lg" style={{ marginTop: '4px', marginBottom: '12px' }}>
            Botanical Origin &amp; Lab Registry
          </h2>
          <p style={{ fontSize: '0.98rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Every batch of Prism Skincare formulas is traceable to its origin harvest and verified by 3rd-party independent laboratories.
          </p>
        </div>

        {/* 2 Column Origin Map & Batch Search */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }} className="hero-grid">
          
          {/* Left Origin Tabs */}
          <div className="card-white" style={{ padding: '36px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '20px' }}>
              Global Botanical Origins
            </h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {Object.keys(origins).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveOrigin(key)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: activeOrigin === key ? 'var(--color-text)' : 'var(--color-bg)',
                    color: activeOrigin === key ? 'var(--color-bg)' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer'
                  }}
                >
                  {origins[key].botanical.split(' ')[0]}
                </button>
              ))}
            </div>

            <div style={{ backgroundColor: 'var(--color-bg)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-sage)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px' }}>
                <MapPin size={16} /> {origins[activeOrigin].location}
              </div>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px' }}>
                {origins[activeOrigin].botanical}
              </h4>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-sage-hover)', marginBottom: '12px' }}>
                Purity Benchmark: {origins[activeOrigin].potency}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {origins[activeOrigin].desc}
              </p>
            </div>
          </div>

          {/* Right Batch Verification Form */}
          <div className="card-white" style={{ padding: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-sage)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Award size={16} /> Lab Certificate Lookup
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '12px' }}>
              Verify Your Product Batch
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Enter the 5-digit batch number printed on the bottom of your bottle (e.g. <code>#047-A</code>):
            </p>

            <form onSubmit={handleVerifyBatch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                required
                placeholder="e.g. 047-A"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: '0.88rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg)'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.78rem' }}>
                Verify Batch
              </button>
            </form>

            {verifiedReport && (
              <div style={{ backgroundColor: 'var(--color-sage-light)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--color-sage-hover)', marginBottom: '10px' }}>
                  <CheckCircle size={16} /> Batch #{verifiedReport.code} Verified Valid
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--color-text)' }}>
                  <div>Harvest Date: <strong>{verifiedReport.date}</strong></div>
                  <div>Bio-Purity: <strong>{verifiedReport.purity}</strong></div>
                  <div>Microbial Screen: <strong>{verifiedReport.microbial}</strong></div>
                  <div>Heavy Metals Screen: <strong>{verifiedReport.heavyMetals}</strong></div>
                  <div>pH Level: <strong>{verifiedReport.ph}</strong></div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
