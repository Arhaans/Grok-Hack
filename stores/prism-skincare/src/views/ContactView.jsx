import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Mail, Clock, MapPin, ChevronDown, CheckCircle, Send } from 'lucide-react';

export const ContactView = () => {
  const { addToast } = useShop();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Product Advice & Routine Consultation',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      addToast('Your message has been sent to our skincare concierge team.', 'Message Received');
    }
  };

  const faqs = [
    {
      q: 'How long does standard shipping take?',
      a: 'We offer free express 3-day delivery on all orders over $75 within the USA and Canada. Standard shipping takes 3-5 business days. International orders ship via DHL Express.'
    },
    {
      q: 'What is PRISM 30-Day Money-Back Guarantee?',
      a: 'If a formula does not suit your skin type or meet your expectations, return the product within 30 days of delivery for a full refund or complimentary concierge exchange.'
    },
    {
      q: 'Are PRISM products safe for pregnancy and sensitive eczema skin?',
      a: 'Yes. All formulas are dermatologist-tested, non-comedogenic, and 100% free of artificial fragrance, essential oil irritants, parabens, and phthalates. Our Barrier Repair Serum is specifically engineered for reactive skin.'
    },
    {
      q: 'How do I know which products to use morning vs. night?',
      a: 'We recommend using our Velvet Cleansing Balm and Bio-Retinol Night Oil in the PM, while applying the Barrier Repair Serum and Milk Toner both AM and PM.'
    }
  ];

  return (
    <div className="contact-view section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 60px auto' }}>
          <span className="subtitle">Skincare Concierge</span>
          <h1 className="heading-lg" style={{ marginTop: '8px', marginBottom: '12px' }}>
            We Are Here For Your Skin
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Have a question about ingredient compatibility or need routine advice? Our team of clinical estheticians is at your service.
          </p>
        </div>

        {/* Form & Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '60px',
            marginBottom: '100px'
          }}
          className="hero-grid"
        >
          {/* Left Form */}
          <div className="card-white" style={{ padding: '40px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, marginBottom: '24px' }}>
              Send a Direct Message
            </h3>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle size={48} style={{ color: 'var(--color-sage)', marginBottom: '16px' }} />
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, marginBottom: '8px' }}>
                  Thank You, {formData.name}
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                  Your message regarding <strong>"{formData.topic}"</strong> has been assigned to a senior esthetician. We will respond to <strong>{formData.email}</strong> within 24 business hours.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn btn-secondary">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Elena Vance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '0.9rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="elena@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '0.9rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '0.9rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Product Advice & Routine Consultation">Product Advice &amp; Routine Consultation</option>
                    <option value="Order Tracking & Shipping">Order Tracking &amp; Shipping</option>
                    <option value="Returns & Exchanges">Returns &amp; Exchanges</option>
                    <option value="Press & Wholesale">Press &amp; Wholesale</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="How can we help your skin today?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '0.9rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg)',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '16px' }}>
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* Right Direct Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="card-white" style={{ padding: '30px' }}>
              <Mail size={24} style={{ color: 'var(--color-sage)', marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Concierge Email</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>concierge@prismskincare.com</p>
            </div>

            <div className="card-white" style={{ padding: '30px' }}>
              <Clock size={24} style={{ color: 'var(--color-sage)', marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Response Guarantee</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Monday – Friday: 9am – 6pm EST.<br />
                All emails answered within 24 hours.
              </p>
            </div>

            <div className="card-white" style={{ padding: '30px' }}>
              <MapPin size={24} style={{ color: 'var(--color-sage)', marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Botanical Research Atelier</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                740 Fifth Avenue, Suite 1800<br />
                New York, NY 10019
              </p>
            </div>
          </div>

        </div>

        {/* FAQ Accordion Section */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="subtitle">Instant Answers</span>
            <h2 className="heading-md" style={{ marginTop: '4px' }}>Frequently Asked Questions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="card-white"
                style={{ overflow: 'hidden' }}
              >
                <button
                  onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    fontSize: '1.05rem',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: openFaqIdx === idx ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.3s',
                      color: 'var(--color-sage)'
                    }}
                  />
                </button>
                {openFaqIdx === idx && (
                  <div style={{ padding: '0 24px 20px 24px', fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
