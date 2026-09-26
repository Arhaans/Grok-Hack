import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Star, Heart, ArrowRight } from 'lucide-react';

export const QuickViewModal = ({ product: propProduct, onClose: propOnClose }) => {
  const { 
    quickViewProduct, 
    closeQuickView, 
    addToCart, 
    toggleWishlist, 
    wishlist, 
    navigateToView 
  } = useShop();

  const product = propProduct || quickViewProduct;
  const handleClose = propOnClose || closeQuickView;

  const [selectedSizeObj, setSelectedSizeObj] = useState(null);

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSizeObj(product.sizes[product.sizes.length - 1]);
      } else {
        setSelectedSizeObj({ size: 'Standard', price: product.price });
      }
    }
  }, [product]);

  if (!product) return null;

  const currentPrice = selectedSizeObj ? selectedSizeObj.price : product.price;
  const currentSize = selectedSizeObj ? selectedSizeObj.size : 'Standard';
  const isWishlisted = wishlist?.includes(product.id);

  return (
    <div className="modal-backdrop" onClick={handleClose} style={{ padding: '20px' }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.22)',
          overflowY: 'auto',
          margin: 'auto',
          border: '1px solid var(--color-border)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <button
          onClick={handleClose}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            backgroundColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--color-border)'
          }}
          aria-label="Close Quick View"
        >
          <X size={18} />
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'stretch'
          }}
        >
          {/* Image Column - Uncropped & Perfectly Framed */}
          <div
            style={{
              backgroundColor: 'var(--color-card-img-bg, #F5F4EF)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 24px',
              position: 'relative',
              minHeight: '380px'
            }}
          >
            <span
              className="badge badge-dark"
              style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 2 }}
            >
              {product.tag || 'Botanical Formula'}
            </span>

            {/* Un-hidden Wishlist Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 2,
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              aria-label="Toggle Wishlist"
            >
              <Heart
                size={18}
                style={{
                  color: isWishlisted ? '#e74c3c' : 'var(--color-text)',
                  fill: isWishlisted ? '#e74c3c' : 'none'
                }}
              />
            </button>

            <img
              src={product.image}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '340px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.1))',
                transition: 'transform 0.3s ease'
              }}
            />

            {product.subtitle && (
              <span
                style={{
                  marginTop: '16px',
                  fontSize: '0.78rem',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}
              >
                {product.subtitle}
              </span>
            )}
          </div>

          {/* Details Column */}
          <div
            style={{
              padding: '32px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-sage)' }}>
                {product.category || 'Skincare'}
              </span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.25 }}>
              {product.name}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--color-gold)', marginBottom: '14px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '6px', fontWeight: 600 }}>
                {product.rating || '4.9'} ({product.reviewCount || 120} Reviews)
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              {product.description}
            </p>

            {/* Size Selector Pills */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Select Volume / Size:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.sizes.map((s) => {
                    const isSelected = selectedSizeObj?.size === s.size;
                    return (
                      <button
                        key={s.size}
                        type="button"
                        onClick={() => setSelectedSizeObj(s)}
                        style={{
                          padding: '8px 14px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--color-text)' : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? 'var(--color-white)' : 'transparent',
                          color: 'var(--color-text)',
                          cursor: 'pointer',
                          boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {s.size} — ${s.price}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Banner */}
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-serif)', marginBottom: '20px', color: 'var(--color-text)' }}>
              ${currentPrice}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  addToCart(product, currentSize, 1);
                  handleClose();
                }}
                className="btn btn-primary btn-glow"
                style={{ width: '100%', padding: '14px', fontSize: '0.9rem', fontWeight: 700 }}
              >
                Add To Bag — ${currentPrice}
              </button>

              <button
                onClick={() => {
                  handleClose();
                  navigateToView('product', product.id);
                }}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Full Clinical Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
