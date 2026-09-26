import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

export const RitualTimerModal = () => {
  const { isMeditationOpen, setIsMeditationOpen } = useShop();

  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  if (!isMeditationOpen) return null;

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(60);
  };

  const getStepGuide = () => {
    if (timeLeft > 45) {
      return { step: 'Step 1: Awakening', action: 'Warm 3-4 drops of serum between palms. Inhale the natural botanical scent deeply.' };
    } else if (timeLeft > 25) {
      return { step: 'Step 2: Lymphatic Sweep', action: 'Gently press palms into cheeks, forehead, and neck using slow, upward gliding motions.' };
    } else if (timeLeft > 0) {
      return { step: 'Step 3: Cellular Seal', action: 'Use fingertips to tap lightly around orbital bone and jawline. Cup face to lock in bio-lipids.' };
    } else {
      return { step: 'Ritual Complete', action: 'Your skin barrier is sealed and nourished. Take a moment of calm.' };
    }
  };

  const currentGuide = getStepGuide();
  const progressPercentage = ((60 - timeLeft) / 60) * 100;

  return (
    <div className="modal-backdrop" onClick={() => setIsMeditationOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          margin: '20px',
          padding: '40px',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <button
          onClick={() => setIsMeditationOpen(false)}
          className="btn-icon"
          style={{ position: 'absolute', top: '16px', right: '16px' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-sage)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
          <Sparkles size={14} /> Guided Skin Ritual
        </div>

        <h2 className="heading-md" style={{ marginBottom: '6px' }}>60-Second Facial Massage</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
          Restorative micro-massage technique to boost micro-circulation and active serum penetration.
        </p>

        {/* Pulsing Timer Circle */}
        <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 32px auto' }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="90" cy="90" r="80" stroke="var(--color-border)" strokeWidth="6" fill="none" />
            <circle
              cx="90"
              cy="90"
              r="80"
              stroke="var(--color-sage)"
              strokeWidth="6"
              fill="none"
              strokeDasharray="502"
              strokeDashoffset={502 - (502 * progressPercentage) / 100}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', fontWeight: 500, lineHeight: 1 }}>
              {timeLeft}s
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {isRunning ? 'Breathe' : 'Ready'}
            </div>
          </div>
        </div>

        {/* Step Text Box */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            marginBottom: '28px'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '4px' }}>
            {currentGuide.step}
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
            {currentGuide.action}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="btn btn-primary"
            style={{ padding: '12px 28px' }}
          >
            {isRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Begin Ritual</>}
          </button>

          <button onClick={resetTimer} className="btn btn-secondary" style={{ padding: '12px 20px' }}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};
