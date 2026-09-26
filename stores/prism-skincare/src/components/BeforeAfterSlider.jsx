import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';

export const BeforeAfterSlider = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const [containerWidth, setContainerWidth] = useState(840);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div
        ref={containerRef}
        className="ba-container"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onClick={(e) => handleMove(e.clientX)}
        style={{
          cursor: 'ew-resize',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          aspectRatio: '16/10',
          backgroundColor: 'var(--color-sage-light)'
        }}
      >
        {/* Day 14: Restored Skin Image (Base Background) */}
        <img
          src="/images/skin_after.png"
          alt="Day 14 Restored Glass Skin Texture"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Day 0: Compromised Skin Image (Clipped Overlay with Fixed Matching Container Width) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${sliderPos}%`,
            overflow: 'hidden',
            borderRight: '3px solid #FFFFFF',
            zIndex: 2
          }}
        >
          <img
            src="/images/skin_before.png"
            alt="Day 0 Compromised Sensitive Flushed Skin Texture"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${containerWidth}px`,
              maxWidth: 'none',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <span
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              backgroundColor: 'rgba(29, 29, 27, 0.88)',
              color: '#FFFFFF',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              zIndex: 3
            }}
          >
            Day 0: Compromised Skin Barrier
          </span>
        </div>

        <span
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'var(--color-sage)',
            color: '#FFFFFF',
            padding: '6px 14px',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            zIndex: 3
          }}
        >
          Day 14: Restored Glass Skin
        </span>

        {/* Drag Slider Handle */}
        <div
          className="ba-slider-handle"
          style={{ left: `${sliderPos}%`, zIndex: 10 }}
        >
          <div className="ba-handle-button">
            <SlidersHorizontal size={16} />
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '12px' }}>
        &larr; Drag slider left or right to reveal skin barrier restoration without zooming &rarr;
      </div>
    </div>
  );
};
