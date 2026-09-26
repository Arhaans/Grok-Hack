import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { MessageSquare, X, Send, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SkinConciergeChat = () => {
  const { navigateToView } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'concierge',
      text: 'Welcome to Prism Skincare Concierge. I am Dr. Elena Vance, Lead Biochemist. How may I assist your skin barrier today?',
      time: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const quickQuestions = [
    {
      q: 'Which formula treats redness & sensitivity?',
      a: 'Our Botanical Barrier Repair Serum is specifically engineered with 10% Centella Asiatica and 5% Niacinamide to soothe redness within 14 days.',
      productId: 'barrier-repair-serum'
    },
    {
      q: 'Is Bio-Retinol safe for daily PM use?',
      a: 'Yes! Unlike synthetic retinol, our 2% plant Bakuchiol oil induces zero peeling or photosensitivity, making it safe for daily evening use.',
      productId: 'bio-retinol-night-oil'
    },
    {
      q: 'How does the 30-Day Guarantee work?',
      a: 'If any formula does not suit your skin, simply email concierge@prismskincare.com for a complimentary replacement or 100% refund.'
    }
  ];

  const handleSend = (textToSend = null) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: query, time: 'Just now' };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Match response
    setTimeout(() => {
      let botResponse = 'Thank you for your message! Our senior estheticians will review your query. You can also take our 60-second Routine Finder Quiz for personalized recommendations.';
      let matchedProd = null;

      const matchedQ = quickQuestions.find(qq => qq.q.toLowerCase() === query.toLowerCase());
      if (matchedQ) {
        botResponse = matchedQ.a;
        matchedProd = matchedQ.productId;
      } else if (query.toLowerCase().includes('redness') || query.toLowerCase().includes('sensitive')) {
        botResponse = 'For reactive skin flare-ups and redness, we recommend pressing 3-4 drops of our Botanical Barrier Repair Serum twice daily.';
        matchedProd = 'barrier-repair-serum';
      } else if (query.toLowerCase().includes('cleanser') || query.toLowerCase().includes('cleanse')) {
        botResponse = 'Our Velvet Cleansing Balm melts away long-wear SPF and makeup while preserving natural intercellular lipids.';
        matchedProd = 'velvet-cleansing-balm';
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'concierge', text: botResponse, time: 'Just now', productId: matchedProd }
      ]);
    }, 600);
  };

  return (
    <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 1200 }}>
      {/* Outside Floating Contact Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 22px',
            backgroundColor: 'var(--color-text)',
            color: 'var(--color-white)',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 14px 36px rgba(0,0,0,0.22)',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <MessageSquare size={18} style={{ color: 'var(--color-sage)' }} />
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#2ecc71',
                boxShadow: '0 0 8px #2ecc71'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.02em' }}>Contact Advisory</span>
            <span style={{ fontSize: '0.68rem', opacity: 0.8, fontWeight: 500 }}>Live Skin Concierge</span>
          </div>
        </button>
      )}

      {/* Inside Chat Window - Reverted to Exact Original State */}
      {isOpen && (
        <div
          className="card-white"
          style={{
            width: '440px',
            height: '660px',
            maxHeight: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-white)'
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '20px 24px',
              backgroundColor: 'var(--color-text)',
              color: 'var(--color-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-border-dark)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-sage)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    border: '2px solid var(--color-bg)'
                  }}
                >
                  EV
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#2ecc71',
                    border: '2px solid var(--color-text)'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-bg)', lineHeight: 1.2 }}>
                    Dr. Elena Vance
                  </span>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-sage)' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-sage)', fontWeight: 500 }}>
                  Lead Biochemist &bull; Concierge Active
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-bg)',
                cursor: 'pointer',
                opacity: 0.8,
                padding: '4px'
              }}
              aria-label="Close Concierge"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              backgroundColor: 'var(--color-bg)'
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: msg.sender === 'user' ? 'var(--color-text)' : 'var(--color-white)',
                    color: msg.sender === 'user' ? 'var(--color-white)' : 'var(--color-text)',
                    fontSize: '0.92rem',
                    lineHeight: 1.5,
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {msg.text}
                </div>

                {/* Optional Product Prescription Link */}
                {msg.productId && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigateToView('product', msg.productId);
                    }}
                    className="btn btn-secondary"
                    style={{
                      marginTop: '8px',
                      padding: '8px 14px',
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Prescribed Formula Page <ArrowRight size={13} />
                  </button>
                )}

                <div
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '4px',
                    textAlign: msg.sender === 'user' ? 'right' : 'left'
                  }}
                >
                  {msg.time}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions */}
          <div
            style={{
              padding: '12px 24px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {quickQuestions.map((qq, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qq.q)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {qq.q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)',
              display: 'flex',
              gap: '12px'
            }}
          >
            <input
              type="text"
              placeholder="Ask Dr. Vance about your skin barrier..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                outline: 'none',
                fontSize: '0.88rem',
                backgroundColor: 'var(--color-bg)'
              }}
            />
            <button
              onClick={() => handleSend()}
              className="btn btn-primary"
              style={{
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              aria-label="Send Inquiry"
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
