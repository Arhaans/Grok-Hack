import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  Sparkles, 
  Check, 
  ArrowLeft, 
  RefreshCw, 
  Droplets, 
  Sun, 
  ShieldCheck, 
  Wind, 
  Moon, 
  Sliders, 
  Clock, 
  ShieldAlert,
  Feather,
  Award,
  CheckCircle2,
  Dna
} from 'lucide-react';

export const SkincareQuiz = () => {
  const { isQuizOpen, setIsQuizOpen, PRODUCTS, addToCart } = useShop();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    skinType: '',
    concern: '',
    finish: ''
  });
  const [selectedInStep, setSelectedInStep] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(1); // 1, 2, or 3
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Generate 30 confetti particle configs for celebration
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#C9B078', '#556B53', '#E6D5B8', '#899481', '#D4AF37', '#768870'];
    const generated = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 94 + 3}%`,
      color: colors[i % colors.length],
      delay: `${Math.random() * 0.9}s`,
      size: `${Math.random() * 6 + 6}px`,
      aspect: Math.random() > 0.5 ? '1' : '1.8'
    }));
    setParticles(generated);
  }, []);

  if (!isQuizOpen) return null;

  const handleSelectOption = (key, value) => {
    setSelectedInStep(value);
    setAnswers((prev) => ({ ...prev, [key]: value }));

    // Short tactile delay so user sees and feels the active selected CSS state
    setTimeout(() => {
      setSelectedInStep(null);
      if (step < 3) {
        setStep(step + 1);
      } else {
        // Transitioning to Results: trigger multi-stage biochemistry analysis
        setIsAnalyzing(true);
        setAnalysisStage(1);
        setAnalysisProgress(15);

        // Stage 1 -> 2
        setTimeout(() => {
          setAnalysisStage(2);
          setAnalysisProgress(60);
        }, 800);

        // Stage 2 -> 3
        setTimeout(() => {
          setAnalysisStage(3);
          setAnalysisProgress(92);
        }, 1600);

        // Complete & Show Results with Celebration
        setTimeout(() => {
          setAnalysisProgress(100);
          setTimeout(() => {
            setIsAnalyzing(false);
            setStep(4);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3800);
          }, 300);
        }, 2400);
      }
    }, 320);
  };

  const handleGoBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const resetQuiz = () => {
    setStep(1);
    setAnswers({ skinType: '', concern: '', finish: '' });
    setSelectedInStep(null);
    setShowCelebration(false);
    setIsAnalyzing(false);
    setAnalysisStage(1);
    setAnalysisProgress(0);
  };

  // Routine Recommendation Logic
  const getRecommendedProducts = () => {
    let serum = PRODUCTS.find(p => p.id === 'barrier-repair-serum');
    let cleanser = PRODUCTS.find(p => p.id === 'velvet-cleansing-balm');
    let moisturizer = PRODUCTS.find(p => p.id === 'ceramide-peptide-cream');

    if (answers.skinType.includes('Oily')) {
      cleanser = PRODUCTS.find(p => p.id === 'cloud-foam-cleanser') || cleanser;
    }
    if (answers.concern.includes('Fine Lines')) {
      serum = PRODUCTS.find(p => p.id === 'bio-retinol-night-oil') || serum;
    }

    return [cleanser, serum, moisturizer];
  };

  const recommendedProducts = getRecommendedProducts();
  const routinePrice = recommendedProducts.reduce((acc, p) => acc + (p?.price || 0), 0);

  const addEntireRoutineToCart = () => {
    recommendedProducts.forEach((p) => {
      if (p) addToCart(p);
    });
    setIsQuizOpen(false);
  };

  // Step Progress Calculation: Step 1 = 0%, Step 2 = 33%, Step 3 = 67%, Results = 100%
  const progressPercent = step === 4 ? 100 : Math.round(((step - 1) / 3) * 100);

  return (
    <div className="modal-backdrop" onClick={() => setIsQuizOpen(false)} style={{ padding: '20px' }}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="quiz-modal-card"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* Celebration Particle Confetti Overlay */}
        {showCelebration && (
          <div className="celebration-overlay">
            {particles.map((p) => (
              <div
                key={p.id}
                className="confetti-particle"
                style={{
                  left: p.left,
                  backgroundColor: p.color,
                  animationDelay: p.delay,
                  width: p.size,
                  height: `calc(${p.size} * ${p.aspect})`
                }}
              />
            ))}
          </div>
        )}

        {/* Top Progress Bar */}
        <div className="quiz-progress-track">
          <div 
            className="quiz-progress-fill" 
            style={{ width: isAnalyzing ? `${analysisProgress}%` : `${progressPercent}%` }} 
          />
        </div>

        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {step > 1 && step <= 3 && !isAnalyzing && (
              <button 
                onClick={handleGoBack} 
                className="btn-icon" 
                style={{ width: '32px', height: '32px' }}
                aria-label="Back to previous question"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--color-sage)'
                }}
              >
                <Sparkles size={14} /> Routine Concierge
              </div>
              <h2 className="heading-md" style={{ marginTop: '2px', fontSize: '1.4rem' }}>
                {isAnalyzing 
                  ? 'Formulating Bespoke Prescription...'
                  : step <= 3 
                    ? `Step ${step} of 3: Find Your Ideal Ritual` 
                    : 'Your Custom PRISM Prescribed Ritual'
                }
              </h2>
            </div>
          </div>

          <button onClick={() => setIsQuizOpen(false)} className="btn-icon" aria-label="Close Quiz">
            <X size={20} />
          </button>
        </div>

        {/* Ultra-Premium Multi-Stage Biochemistry Formulation Loader */}
        {isAnalyzing && (
          <div className="formulating-loader-container">
            {/* Glowing Orbiting Rings & Icon */}
            <div className="luxury-pulse-orb">
              <div className="luxury-pulse-ring" />
              <div className="luxury-pulse-ring-outer" />
              {analysisStage === 1 && <ShieldCheck size={38} style={{ color: 'var(--color-sage)', transition: 'all 0.4s ease' }} />}
              {analysisStage === 2 && <Dna size={38} style={{ color: 'var(--color-gold)', transition: 'all 0.4s ease' }} />}
              {analysisStage === 3 && <Award size={38} style={{ color: 'var(--color-sage)', transition: 'all 0.4s ease' }} />}
            </div>

            {/* Dynamic Status Text */}
            <div className="formulating-status-text">
              {analysisStage === 1 && 'Analyzing Skin Barrier & Sensitivity Profile...'}
              {analysisStage === 2 && 'Calculating Biocompatible 3:1:1 Ceramide Ratio...'}
              {analysisStage === 3 && 'Prescribing 3-Step Botanical Ritual Solution...'}
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', maxWidth: '420px', lineHeight: 1.5 }}>
              Our biochemists match your unique profile against clean bio-actives for optimal lipid recovery.
            </p>

            {/* Step Status Badges */}
            <div className="formulating-step-pills">
              <div className={`formulating-pill ${analysisStage >= 1 ? (analysisStage > 1 ? 'completed' : 'active') : ''}`}>
                {analysisStage > 1 ? <CheckCircle2 size={14} style={{ color: 'var(--color-gold)' }} /> : <Sparkles size={14} />}
                <span>Lipid Profiling</span>
              </div>

              <div className={`formulating-pill ${analysisStage >= 2 ? (analysisStage > 2 ? 'completed' : 'active') : ''}`}>
                {analysisStage > 2 ? <CheckCircle2 size={14} style={{ color: 'var(--color-gold)' }} /> : <Dna size={14} />}
                <span>Ceramide Ratio</span>
              </div>

              <div className={`formulating-pill ${analysisStage >= 3 ? 'active' : ''}`}>
                <Award size={14} />
                <span>Ritual Prescription</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Skin Type */}
        {step === 1 && !isAnalyzing && (
          <div>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', marginBottom: '22px', lineHeight: 1.5 }}>
              How would you describe your skin's primary state throughout the day?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {[
                { 
                  title: 'Dry / Sensitive', 
                  desc: 'Tight feel, occasional redness, or reactive patches',
                  icon: <ShieldAlert size={20} />
                },
                { 
                  title: 'Oily / Combination', 
                  desc: 'Excess shine in T-zone with visible pore texture',
                  icon: <Droplets size={20} />
                },
                { 
                  title: 'Normal / Balanced', 
                  desc: 'Generally comfortable with rare breakouts',
                  icon: <Sparkles size={20} />
                },
                { 
                  title: 'Aging / Dehydrated', 
                  desc: 'Loss of plump elasticity and dryness lines',
                  icon: <Clock size={20} />
                }
              ].map((opt) => {
                const isSelected = selectedInStep === opt.title || answers.skinType === opt.title;
                return (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => handleSelectOption('skinType', opt.title)}
                    className={`quiz-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="quiz-option-icon">
                      {opt.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: '3px' }}>{opt.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{opt.desc}</div>
                    </div>
                    <div className="quiz-check-indicator">
                      {isSelected ? <Check size={13} /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Skin Concern */}
        {step === 2 && !isAnalyzing && (
          <div>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', marginBottom: '22px', lineHeight: 1.5 }}>
              What skin transformation is your top priority right now?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {[
                { 
                  title: 'Redness & Barrier Loss', 
                  desc: 'Calming sensitivity, repairing damage, and soothing flushing',
                  icon: <ShieldCheck size={20} />
                },
                { 
                  title: 'Dullness & Uneven Tone', 
                  desc: 'Restoring radiant natural glow and fading hyperpigmentation',
                  icon: <Sun size={20} />
                },
                { 
                  title: 'Fine Lines & Elasticity', 
                  desc: 'Firming contours and boosting nocturnal cellular repair',
                  icon: <Feather size={20} />
                },
                { 
                  title: 'Clogged Pores & Texture', 
                  desc: 'Refining pore clarity and balancing sebum production',
                  icon: <Sliders size={20} />
                }
              ].map((opt) => {
                const isSelected = selectedInStep === opt.title || answers.concern === opt.title;
                return (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => handleSelectOption('concern', opt.title)}
                    className={`quiz-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="quiz-option-icon">
                      {opt.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: '3px' }}>{opt.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{opt.desc}</div>
                    </div>
                    <div className="quiz-check-indicator">
                      {isSelected ? <Check size={13} /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Texture/Finish */}
        {step === 3 && !isAnalyzing && (
          <div>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', marginBottom: '22px', lineHeight: 1.5 }}>
              What finish do you prefer on your skin after applying moisturizer?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              {[
                { 
                  title: 'Velvety Dewy', 
                  desc: 'Luminous, glass-skin glow with soft moisture cushion',
                  icon: <Sparkles size={20} />
                },
                { 
                  title: 'Weightless Soft-Matte', 
                  desc: 'Instant absorption leaving zero residue or tackiness',
                  icon: <Wind size={20} />
                },
                { 
                  title: 'Rich Nocturnal Seal', 
                  desc: 'Deep nourishing lipids for overnight moisture recovery',
                  icon: <Moon size={20} />
                }
              ].map((opt) => {
                const isSelected = selectedInStep === opt.title || answers.finish === opt.title;
                return (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => handleSelectOption('finish', opt.title)}
                    className={`quiz-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="quiz-option-icon">
                      {opt.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: '3px' }}>{opt.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{opt.desc}</div>
                    </div>
                    <div className="quiz-check-indicator">
                      {isSelected ? <Check size={13} /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Results with Celebration Reveal */}
        {step === 4 && !isAnalyzing && (
          <div>
            {/* Celebration Badge Banner */}
            <div
              className="celebration-badge-pop"
              style={{
                backgroundColor: 'linear-gradient(135deg, var(--color-sage-light) 0%, #FFFFFF 100%)',
                border: '1px solid var(--color-gold)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 6px 20px rgba(201, 176, 120, 0.15)'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-gold)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Award size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-sage)' }}>
                  100% Biocompatible Match Prescribed
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--color-text)', lineHeight: 1.4 }}>
                  Curated for <strong>{answers.skinType || 'Balanced'}</strong> skin focusing on <strong>{answers.concern || 'Barrier Repair'}</strong>.
                </div>
              </div>
            </div>

            {/* Prescribed Products Grid with Staggered Fade Up */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {recommendedProducts.map((p, idx) => (
                <div
                  key={p ? p.id : idx}
                  className={`results-stagger-${idx + 1}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px 18px',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-sage)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {idx === 0 ? '1' : idx === 1 ? '2' : '3'}
                  </div>

                  <img
                    src={p?.image}
                    alt={p?.name}
                    style={{ width: '54px', height: '54px', objectFit: 'contain', backgroundColor: '#F5F4EF', padding: '4px', borderRadius: 'var(--radius-sm)' }}
                  />

                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)' }}>
                      {idx === 0 ? 'Step 1: Cleanse' : idx === 1 ? 'Step 2: Treat' : 'Step 3: Seal'}
                    </span>
                    <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>
                      {p?.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{p?.purpose}</div>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                    ${p?.price}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Complete Custom Routine: </span>
                <span style={{ fontWeight: 700, fontSize: '1.35rem', fontFamily: 'var(--font-serif)' }}>${routinePrice.toFixed(2)}</span>
              </div>
              <button 
                onClick={resetQuiz} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.82rem', 
                  fontWeight: 600,
                  color: 'var(--color-sage)', 
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none'
                }}
              >
                <RefreshCw size={14} /> Retake Quiz
              </button>
            </div>

            <button 
              onClick={addEntireRoutineToCart} 
              className="btn btn-primary btn-glow" 
              style={{ width: '100%', padding: '16px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Sparkles size={18} /> Add Custom Routine to Bag — ${routinePrice.toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
