import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Sparkles, Gift } from 'lucide-react';

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountRate,
    discountAmount,
    promoCode,
    promoError,
    applyPromoCode,
    isFreeShipping,
    amountForFreeShipping,
    freeShippingThreshold,
    shippingCost,
    giftPackaging,
    setGiftPackaging,
    giftNote,
    setGiftNote,
    giftPackagingCost,
    total,
    navigateToView
  } = useShop();

  const [inputCode, setInputCode] = useState('');

  if (!isCartOpen) return null;

  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="modal-backdrop" onClick={() => setIsCartOpen(false)}>
      <div
        className="drawer-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'var(--color-bg)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h2 className="heading-md" style={{ fontSize: '1.4rem' }}>Your Shopping Bag</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {cart.length} {cart.length === 1 ? 'item' : 'items'} selected
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="btn-icon"
            aria-label="Close bag drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div
          style={{
            backgroundColor: 'var(--color-sage-light)',
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '8px',
              color: 'var(--color-text)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} style={{ color: 'var(--color-sage)' }} />
              {isFreeShipping ? (
                <span style={{ color: 'var(--color-sage-hover)' }}>You unlocked Free Express Shipping!</span>
              ) : (
                <span>Add <strong>${amountForFreeShipping.toFixed(2)}</strong> more for Free Shipping</span>
              )}
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>

          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--color-border)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progressPercentage}%`,
                height: '100%',
                backgroundColor: 'var(--color-sage)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--color-text-muted)'
              }}
            >
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '12px' }}>
                Your shopping bag is empty
              </p>
              <p style={{ fontSize: '0.88rem', marginBottom: '24px' }}>
                Explore our botanical lipid serums and restorative cleansers.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigateToView('shop');
                }}
                className="btn btn-primary"
              >
                Shop Best Sellers
              </button>
            </div>
          ) : (
            <>
              {cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.size}-${idx}`}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid var(--color-border)'
                  }}
                >
                  {/* Product Thumbnail */}
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: 'var(--color-white)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: '1px solid var(--color-border)',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Product Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1.05rem',
                          fontWeight: 600,
                          lineHeight: 1.2
                        }}
                      >
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(idx)}
                        style={{ color: 'var(--color-text-light)', cursor: 'pointer', padding: '2px' }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Size: {item.size}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '12px'
                      }}
                    >
                      {/* Quantity Selector */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-white)'
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          style={{ padding: '6px 10px', cursor: 'pointer' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ padding: '0 8px', fontSize: '0.82rem', fontWeight: 600 }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          style={{ padding: '6px 10px', cursor: 'pointer' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Luxury Keepsake Box & Handwritten Note Toggle */}
              <div
                style={{
                  backgroundColor: 'var(--color-white)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={giftPackaging}
                    onChange={(e) => setGiftPackaging(e.target.checked)}
                    style={{ accentColor: 'var(--color-sage)', width: '16px', height: '16px' }}
                  />
                  <Gift size={16} style={{ color: 'var(--color-sage)' }} />
                  <span>Add Luxury Engraved Keepsake Box &amp; Calligraphy Gift Note (+$12)</span>
                </label>

                {giftPackaging && (
                  <div style={{ marginTop: '12px' }}>
                    <textarea
                      rows={2}
                      placeholder="Enter your custom handwritten gift message..."
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg)',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Summary */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '24px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)'
            }}
          >
            {/* Promo Code Input */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Tag
                    size={14}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Promo code (e.g. PRISM15)"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 34px',
                      fontSize: '0.82rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg)'
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    applyPromoCode(inputCode);
                    setInputCode('');
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '10px 16px', fontSize: '0.78rem' }}
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <div style={{ fontSize: '0.75rem', color: '#c0392b', marginTop: '4px' }}>
                  {promoError}
                </div>
              )}
              {promoCode && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-sage)', marginTop: '4px', fontWeight: 600 }}>
                  Active Promo Code: {promoCode} (15% OFF)
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {giftPackagingCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                  <span>Luxury Keepsake Box</span>
                  <span>+${giftPackagingCost.toFixed(2)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-sage)' }}>
                  <span>Discount ({(discountRate * 100)}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Estimated Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--color-border)',
                  marginTop: '4px'
                }}
              >
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                navigateToView('checkout');
              }}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px', padding: '16px' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            {/* Guarantee Tag */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                marginTop: '12px'
              }}
            >
              <ShieldCheck size={14} style={{ color: 'var(--color-sage)' }} />
              <span>30-Day Money Back Guarantee &amp; Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
