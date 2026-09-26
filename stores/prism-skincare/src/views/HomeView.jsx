import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Sparkles, 
  ArrowRight, 
  Star, 
  Heart, 
  Check, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ThumbsUp 
} from 'lucide-react';
import { JOURNAL_ARTICLES } from '../data/journal';
import { PRODUCTS } from '../data/products';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { BespokeBundleBuilder } from '../components/BespokeBundleBuilder';
import { SourcingRegistry } from '../components/SourcingRegistry';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const HomeView = () => {
  const { PRODUCTS, navigateToView, addToCart, toggleWishlist, wishlist, openQuickView, addToast } = useShop();
  useScrollReveal();

  const bestSellers = PRODUCTS.slice(0, 4);

  const [selectedReviewCategory, setSelectedReviewCategory] = useState('All');
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [helpfulVotes, setHelpfulVotes] = useState({ 0: 142, 1: 89, 2: 110, 3: 94, 4: 76 });
  const [votedMap, setVotedMap] = useState({});

  const reviews = [
    {
      id: 0,
      author: 'Sophia M.',
      role: 'Verified Devotee • NYC',
      title: 'My skin barrier was saved in 10 days',
      text: 'After over-exfoliating with acids, my face was red, burning, and tight. The Barrier Repair Serum completely healed my skin. It feels like silk and sinks in effortlessly.',
      rating: 5,
      productName: 'The Botanical Barrier Repair Serum',
      productId: 'barrier-repair-serum',
      category: 'Barrier Repair',
      skinProfile: 'Dry & Reactive Skin • Age 32',
      verified: true
    },
    {
      id: 1,
      author: 'Dr. Clara Thorne',
      role: 'Board-Certified Dermatologist • London',
      title: 'I recommend PRISM to all my sensitive clients',
      text: 'The 3:1:1 lipid ratio in their formulas is backed by genuine dermatological science. No unnecessary fragrance, no harsh filler—just pure skin-identical nourishment.',
      rating: 5,
      productName: 'Ceramide Peptide Cream',
      productId: 'ceramide-peptide-cream',
      category: 'Dermatologist Approved',
      skinProfile: 'Dermatology Panel Member',
      verified: true
    },
    {
      id: 2,
      author: 'Julian K.',
      role: 'Verified Devotee • San Francisco',
      title: 'The Velvet Cleansing Balm is unmatched',
      text: 'Melts off waterproof SPF in seconds without leaving a greasy film or stinging my eyes. My evening routine feels like a 5-star spa ritual every night.',
      rating: 5,
      productName: 'Velvet Cleansing Balm',
      productId: 'velvet-cleansing-balm',
      category: 'Cleansing Rituals',
      skinProfile: 'Combination Skin • Age 29',
      verified: true
    },
    {
      id: 3,
      author: 'Elena Rostova',
      role: 'Verified Devotee • Paris',
      title: 'Woke up with glass skin elasticity',
      text: 'The Bio-Retinol Night Oil is pure magic. Zero irritation compared to standard retinol, and my fine lines look visibly softer after just 3 weeks of nocturnal use.',
      rating: 5,
      productName: 'Bio-Retinol Night Oil',
      productId: 'bio-retinol-night-oil',
      category: 'Nocturnal Repair',
      skinProfile: 'Mature & Dehydrated • Age 41',
      verified: true
    },
    {
      id: 4,
      author: 'Marcus Chen',
      role: 'Verified Devotee • Tokyo',
      title: 'Weightless hydration for acne-prone skin',
      text: 'Most barrier creams cause me breakouts, but the Cloud Foam & Barrier Serum duo calm my active redness without any heavy residue. Cannot live without it!',
      rating: 5,
      productName: 'Cloud Foam Cleanser',
      productId: 'cloud-foam-cleanser',
      category: 'Sensitive Skin',
      skinProfile: 'Acne-Prone & Sensitive • Age 27',
      verified: true
    }
  ];

  return (
    <div className="home-view">
      
      {/* 1. Hero Section */}
      <section
        style={{
          backgroundColor: 'var(--color-bg)',
          paddingTop: '60px',
          paddingBottom: '80px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Ambient Background Orbs */}
        <div className="orb-container">
          <div className="orb orb-sage orb-1" />
          <div className="orb orb-gold orb-2" />
          <div className="orb orb-sage orb-3" />
        </div>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px',
              alignItems: 'center'
            }}
            className="hero-grid"
          >
            {/* Hero Text */}
            <div style={{ zIndex: 2 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-sage)',
                  marginBottom: '24px'
                }}
              >
                <Sparkles size={14} /> Botanical Lipid Science
              </div>

              <h1 className="heading-xl hero-headline" style={{ marginBottom: '24px' }}>
                Skincare, refined by nature.
              </h1>

              <p
                className="hero-subtext"
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '36px',
                  maxWidth: '520px'
                }}
              >
                Intensive bio-botanical formulations engineered to repair compromised barriers, restore deep hydration, and elevate your daily ritual.
              </p>

              <div className="hero-cta" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigateToView('shop')}
                  className="btn btn-primary btn-glow ripple-btn"
                  style={{ padding: '16px 36px' }}
                >
                  <span>Shop The Collection</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigateToView('about')}
                  className="btn btn-secondary"
                  style={{ padding: '16px 28px' }}
                >
                  <span>Discover Our Story</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div style={{ marginTop: '48px', display: 'flex', gap: '24px', opacity: 0.85, fontSize: '0.82rem' }}>
                <div><strong>4.9 ★★★★★</strong> (2,400+ 5-Star Reviews)</div>
                <div>•</div>
                <div>Dermatologist Approved</div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="hero-image" style={{ position: 'relative' }}>
              <div
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-white)',
                  position: 'relative'
                }}
              >
                <img
                  src="/images/hero_serum.png"
                  alt="PRISM Botanical Barrier Repair Serum"
                  style={{ width: '100%', height: '540px', objectFit: 'cover' }}
                />

                {/* Floating Product Highlight Card */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '24px',
                    right: '24px',
                    backgroundColor: 'var(--color-white)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-sage)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Flagship Formula
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      The Botanical Barrier Repair Serum
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      ${PRODUCTS[0].price} • 50ml / 1.7 fl oz
                    </div>
                  </div>
                  <button
                    onClick={() => navigateToView('product', 'barrier-repair-serum')}
                    className="btn btn-primary"
                    style={{ padding: '10px 18px', fontSize: '0.78rem' }}
                  >
                    Inspect Formula
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Infinite Editorial High-Contrast Marquee Ticker */}
      <div className="marquee-container">
        <div className="marquee-content">
          {[...Array(4)].map((_, idx) => (
            <React.Fragment key={idx}>
              <span className="marquee-item">Cold-Pressed Bio-Botanicals</span>
              <span className="marquee-item">100% Clean Science</span>
              <span className="marquee-item">Dermatologist Formulated</span>
              <span className="marquee-item">Clinically Verified Barrier Repair</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 2. Brand Benefits Bar (Clean White Card Container) */}
      <section style={{ backgroundColor: 'var(--color-bg)', padding: '40px 0' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '24px 32px',
              boxShadow: 'var(--shadow-sm)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              textAlign: 'center'
            }}
          >
            {[
              'Dermatologist Tested',
              '100% Cruelty-Free',
              'Clean Bio-Botanicals',
              'Recyclable Glass'
            ].map((text, i) => (
              <div
                key={i}
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Check size={16} style={{ color: 'var(--color-sage)' }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Best Sellers Section */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '48px',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <span className="subtitle">Curated Icons</span>
              <h2 className="heading-lg reveal" style={{ marginTop: '4px' }}>Best Selling Rituals</h2>
            </div>
            <button onClick={() => navigateToView('shop')} className="btn btn-secondary">
              <span>Explore All Formulas</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Product Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '30px'
            }}
          >
            {bestSellers.map((product, idx) => (
              <div key={product.id} className={`card-white card-glow reveal delay-${idx + 1}`} style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Product Image */}
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    backgroundColor: 'var(--color-card-img-bg)',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigateToView('product', product.id)}
                  className="img-zoom-wrap"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                  />

                  {/* Badge */}
                  <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                    <span className="badge badge-dark">{product.tag}</span>
                  </div>

                  {/* Quick View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openQuickView(product);
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      backgroundColor: 'var(--color-text)',
                      color: 'var(--color-bg)',
                      borderRadius: 'var(--radius-full)',
                      padding: '6px 14px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <Eye size={12} /> Quick View
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-white)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    aria-label="Save to wishlist"
                  >
                    <Heart
                      size={18}
                      style={{
                        color: wishlist.includes(product.id) ? '#e74c3c' : 'var(--color-text)',
                        fill: wishlist.includes(product.id) ? '#e74c3c' : 'none'
                      }}
                    />
                  </button>
                </div>

                {/* Card Info */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-gold)', marginBottom: '8px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: '4px' }}>({product.reviewCount})</span>
                  </div>

                  <h3
                    onClick={() => navigateToView('product', product.id)}
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      marginBottom: '4px',
                      cursor: 'pointer',
                      lineHeight: 1.2
                    }}
                  >
                    {product.name}
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px', flex: 1 }}>
                    {product.purpose}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div className="price" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      ${product.price}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn btn-sage"
                      style={{ padding: '10px 18px', fontSize: '0.78rem' }}
                    >
                      Quick Add
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Interactive Bespoke Routine Bundle Builder Configurator */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container">
          <BespokeBundleBuilder />
        </div>
      </section>

      {/* 5. Interactive Before/After Clinical Drag Slider */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px auto' }}>
            <span className="subtitle">Clinical Trial Lens</span>
            <h2 className="heading-lg" style={{ marginTop: '4px' }}>Interactive Barrier Restoration</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
              Drag the lens slider below to inspect 14-day lipid restoration in an independent clinical panel trial:
            </p>
          </div>

          <BeforeAfterSlider />
        </div>
      </section>

      {/* 6. Botanical Origins & Lab Batch Lookup */}
      <SourcingRegistry />

      {/* 7. Customer Testimonials Carousel & Clinical Reviews */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg)', position: 'relative' }}>
        <div className="container">
          
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 36px auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '16px' }}>
              <Star size={13} fill="currentColor" style={{ color: 'var(--color-gold)' }} />
              <span>4.9 / 5.0 Rating • 2,480+ Clinical Devotee Reviews</span>
            </div>

            <h2 className="heading-lg" style={{ marginTop: '4px', marginBottom: '12px' }}>
              Loved by Thousands of Skin Devotees
            </h2>

            <p style={{ fontSize: '0.98rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Real results from verified customers and dermatologists repairing compromised skin barriers.
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
            {['All', 'Barrier Repair', 'Cleansing Rituals', 'Dermatologist Approved', 'Nocturnal Repair', 'Sensitive Skin'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedReviewCategory(cat);
                  setActiveReviewIdx(0);
                }}
                style={{
                  padding: '8px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: selectedReviewCategory === cat ? 'var(--color-text)' : 'var(--color-white)',
                  color: selectedReviewCategory === cat ? 'var(--color-white)' : 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: selectedReviewCategory === cat ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Review Card & Slider Wrapper */}
          {(() => {
            const filtered = reviews.filter(r => selectedReviewCategory === 'All' || r.category === selectedReviewCategory);
            const currentReview = filtered[activeReviewIdx % filtered.length] || reviews[0];
            const linkedProduct = PRODUCTS.find(p => p.id === currentReview.productId) || PRODUCTS[0];
            const isVoted = votedMap[currentReview.id];

            return (
              <div style={{ maxWidth: '840px', margin: '0 auto', position: 'relative' }}>
                
                {/* Side Navigation Buttons (Desktop) */}
                <button
                  type="button"
                  onClick={() => setActiveReviewIdx((prev) => (prev === 0 ? filtered.length - 1 : prev - 1))}
                  style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                  aria-label="Previous review"
                >
                  <ChevronLeft size={22} style={{ color: 'var(--color-text)' }} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveReviewIdx((prev) => (prev + 1) % filtered.length)}
                  style={{
                    position: 'absolute',
                    right: '-24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                  aria-label="Next review"
                >
                  <ChevronRight size={22} style={{ color: 'var(--color-text)' }} />
                </button>

                {/* Main Luxury Testimonial Card */}
                <div
                  className="card-white"
                  style={{
                    padding: '44px 48px',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.06)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {/* Top Bar: Stars + Category Pill */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px', color: 'var(--color-gold)' }}>
                      {[...Array(currentReview.rating)].map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                      ))}
                    </div>

                    <span className="badge badge-dark">
                      {currentReview.category}
                    </span>
                  </div>

                  {/* Review Headline */}
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 600, marginBottom: '16px', lineHeight: 1.3, color: 'var(--color-text)' }}>
                    "{currentReview.title}"
                  </h3>

                  {/* Review Body Text */}
                  <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: '28px', fontStyle: 'italic' }}>
                    "{currentReview.text}"
                  </p>

                  {/* Author & Verified Info */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingTop: '20px', borderTop: '1px solid var(--color-border-light, #F0EFEA)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                        <span>{currentReview.author}</span>
                        <CheckCircle2 size={16} style={{ color: 'var(--color-sage)' }} />
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {currentReview.role} • <span style={{ color: 'var(--color-sage)', fontWeight: 600 }}>{currentReview.skinProfile}</span>
                      </div>
                    </div>

                    {/* Helpful Vote Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isVoted) return;
                        setVotedMap((prev) => ({ ...prev, [currentReview.id]: true }));
                        setHelpfulVotes((prev) => ({ ...prev, [currentReview.id]: (prev[currentReview.id] || 0) + 1 }));
                        addToast('Thank you for voting this review as helpful.', 'Feedback Recorded');
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: isVoted ? 'var(--color-sage-light)' : 'var(--color-white)',
                        color: isVoted ? 'var(--color-sage-dark)' : 'var(--color-text)',
                        cursor: isVoted ? 'default' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ThumbsUp size={13} style={{ color: isVoted ? 'var(--color-sage)' : 'currentColor' }} />
                      <span>Helpful ({helpfulVotes[currentReview.id] || 120})</span>
                    </button>
                  </div>

                  {/* Interactive Linked Product Bar */}
                  {linkedProduct && (
                    <div
                      style={{
                        marginTop: '24px',
                        padding: '12px 18px',
                        backgroundColor: 'var(--color-card-img-bg, #F5F4EF)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={linkedProduct.image}
                          alt={linkedProduct.name}
                          style={{ width: '42px', height: '42px', objectFit: 'contain', backgroundColor: '#FFF', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)' }}>
                            Reviewed Formula:
                          </div>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text)' }}>
                            {linkedProduct.name} — <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>${linkedProduct.price}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openQuickView(linkedProduct)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={12} /> Quick View Formula
                      </button>
                    </div>
                  )}

                </div>

                {/* Dot Pagination & Slide Counter */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    0{((activeReviewIdx % filtered.length) + 1)} / 0{filtered.length}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {filtered.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveReviewIdx(i)}
                        style={{
                          width: i === (activeReviewIdx % filtered.length) ? '28px' : '8px',
                          height: '8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: i === (activeReviewIdx % filtered.length) ? 'var(--color-text)' : 'var(--color-border-dark)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          border: 'none'
                        }}
                        aria-label={`Go to review ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      </section>

      {/* 8. Skincare Journal Section */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="subtitle">Editorial &amp; Science</span>
              <h2 className="heading-lg" style={{ marginTop: '4px' }}>The PRISM Journal</h2>
            </div>
            <button onClick={() => navigateToView('journal')} className="btn btn-secondary">
              Read All Articles
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
            {JOURNAL_ARTICLES.map((article) => (
              <div
                key={article.id}
                className="card-white"
                onClick={() => navigateToView('journal')}
                style={{ cursor: 'pointer', overflow: 'hidden' }}
              >
                <div style={{ aspectRatio: '16/10', backgroundColor: 'var(--color-card-img-bg)', overflow: 'hidden' }}>
                  <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-sage)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {article.category} • {article.readTime}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.3 }}>
                    {article.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {article.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
