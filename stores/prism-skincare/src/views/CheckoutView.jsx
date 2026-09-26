import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, Lock, ArrowLeft } from 'lucide-react';

export const CheckoutView = () => {
  const {
    cart,
    subtotal,
    discountAmount,
    shippingCost,
    total,
    navigateToView
  } = useShop();

  const [step, setStep] = useState(1); // 1: Info & Shipping, 2: Payment, 3: Confirmation
  const [formData, setFormData] = useState({
    email: 'sophia@example.com',
    firstName: 'Sophia',
    lastName: 'Miller',
    address: '450 Lexington Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10017',
    cardNumber: '4532 •••• •••• 8892',
    expDate: '09/28',
    cvc: '382'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleCompleteOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setOrderId(`VEL-${Math.floor(10000 + Math.random() * 90000)}`);
      setStep(3); // Confirmation screen
    }, 1200);
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="section-padding" style={{ textCenter: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 className="heading-md" style={{ marginBottom: '16px' }}>Your Shopping Bag is Empty</h2>
          <button onClick={() => navigateToView('shop')} className="btn btn-primary">
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-view section-padding" style={{ backgroundColor: 'var(--color-bg)', minHeight: '90vh' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Back Link */}
        <button
          onClick={() => navigateToView('shop')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            marginBottom: '32px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Return to Store
        </button>

        {/* Step 3: Order Confirmation Screen */}
        {step === 3 ? (
          <div
            className="card-white"
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              padding: '48px',
              textAlign: 'center'
            }}
          >
            <CheckCircle2 size={64} style={{ color: 'var(--color-sage)', marginBottom: '20px' }} />
            <span className="badge badge-sage" style={{ marginBottom: '12px' }}>Order Confirmed</span>
            <h1 className="heading-lg" style={{ marginBottom: '8px' }}>
              Thank You For Your Order
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              Order Reference: <strong style={{ color: 'var(--color-text)' }}>#{orderId}</strong>
            </p>

            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
                marginBottom: '32px',
                border: '1px solid var(--color-border)',
                fontSize: '0.88rem'
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '12px' }}>Delivery Details:</div>
              <div>Recipient: {formData.firstName} {formData.lastName}</div>
              <div>Address: {formData.address}, {formData.city}, {formData.state} {formData.zip}</div>
              <div>Estimated Delivery: <strong>3 Business Days (Express Shipping)</strong></div>
              <div>Confirmation sent to: <strong>{formData.email}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => navigateToView('shop')} className="btn btn-primary">
                Continue Shopping
              </button>
              <button onClick={() => navigateToView('home')} className="btn btn-secondary">
                Return Home
              </button>
            </div>
          </div>
        ) : (
          /* Step 1 & 2: Checkout Form & Summary Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: '40px'
            }}
            className="hero-grid"
          >
            {/* Form Steps */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span className={`badge ${step === 1 ? 'badge-dark' : 'badge-outline'}`}>1. Shipping &amp; Details</span>
                <span>&rarr;</span>
                <span className={`badge ${step === 2 ? 'badge-dark' : 'badge-outline'}`}>2. Payment</span>
              </div>

              {step === 1 ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(2);
                  }}
                  className="card-white"
                  style={{ padding: '36px' }}
                >
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '20px' }}>
                    Shipping &amp; Contact Details
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                        Email Address for Order Tracking *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                          style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '16px' }}>
                      Continue To Payment
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Payment */
                <form
                  onSubmit={handleCompleteOrder}
                  className="card-white"
                  style={{ padding: '36px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>
                      Payment Method
                    </h2>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-sage)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={14} /> 256-Bit SSL Encrypted
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                        Card Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                          Expiry (MM/YY) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.expDate}
                          onChange={(e) => setFormData({ ...formData, expDate: e.target.value })}
                          style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                          CVC Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.cvc}
                          onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                          style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="btn btn-primary"
                        style={{ flex: 2, padding: '16px' }}
                      >
                        {isProcessing ? 'Processing Order...' : `Pay $${total.toFixed(2)}`}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Sidebar Order Summary */}
            <div className="card-white" style={{ padding: '30px', height: 'fit-content' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '20px' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={item.product.image} alt={item.product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{item.product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Qty: {item.quantity} • {item.size}</div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-sage)' }}>
                    <span>Promo Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Express Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '8px' }}>
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
