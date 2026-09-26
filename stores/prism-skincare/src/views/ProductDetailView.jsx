import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Star, 
  Heart, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ChevronDown, 
  Sparkles, 
  ZoomIn, 
  Copy, 
  CheckCircle2, 
  ThumbsUp, 
  Dna,
  MessageSquare,
  X,
  Search,
  Camera,
  Leaf
} from 'lucide-react';

export const ProductDetailView = () => {
  const { 
    selectedProductId, 
    PRODUCTS, 
    addToCart, 
    toggleWishlist, 
    wishlist, 
    navigateToView, 
    openQuickView,
    addToast 
  } = useShop();

  // Find product by selectedProductId or fallback to first product
  const product = PRODUCTS.find((p) => p.id === selectedProductId) || PRODUCTS[0];

  const [selectedSizeObj, setSelectedSizeObj] = useState(
    product.sizes ? product.sizes[product.sizes.length - 1] : { size: 'Standard', price: product.price }
  );
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState('one-time'); // 'one-time' or 'subscribe'
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('benefits');
  const [copiedInci, setCopiedInci] = useState(false);

  // Reviews System State
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewPhotoZoom, setReviewPhotoZoom] = useState(null);
  const [reviewHelpfulVotes, setReviewHelpfulVotes] = useState({ 0: 88, 1: 54, 2: 31 });
  const [votedReviewsMap, setVotedReviewsMap] = useState({});
  const [customReviews, setCustomReviews] = useState([]);

  // Write Review Form State
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newName, setNewName] = useState('');
  const [newSkinType, setNewSkinType] = useState('Dry & Sensitive');

  // Sync state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSizeObj(product.sizes[product.sizes.length - 1]);
      } else {
        setSelectedSizeObj({ size: 'Standard', price: product.price });
      }
      setQuantity(1);
      setCustomReviews([]);
      setSearchQuery('');
    }
  }, [product]);

  if (!product) return null;

  const basePrice = selectedSizeObj ? selectedSizeObj.price : product.price;
  const currentPrice = purchaseType === 'subscribe' ? basePrice * 0.85 : basePrice;
  const isWishlisted = wishlist?.includes(product.id);

  const toggleAccordion = (name) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSizeObj.size, quantity);
    navigateToView('checkout');
  };

  const handleCopyInci = () => {
    if (product.inciList) {
      navigator.clipboard.writeText(product.inciList);
      setCopiedInci(true);
      addToast('Full INCI formula copied to clipboard.', 'Formula Copied');
      setTimeout(() => setCopiedInci(false), 3000);
    }
  };

  // Base clinical reviews for this product
  const defaultProductReviews = [
    {
      id: 0,
      author: 'Dr. Clara Thorne',
      role: 'Board-Certified Dermatologist • London',
      title: `Standard of care for ${product.category.toLowerCase()} formulations`,
      text: `I prescribe ${product.name} regularly to patients with compromised lipid barriers. The bio-compatibility, clean ratio, and absence of synthetic fragrance makes it exceptional.`,
      rating: 5,
      date: 'July 24, 2026',
      skinType: 'Dermatology Panel Member',
      verified: true
    },
    {
      id: 1,
      author: 'Sophia M.',
      role: 'Verified Devotee • NYC',
      title: 'Transformed my skin barrier in under 10 days!',
      text: `After over-exfoliating with harsh acids, my face was tight, red, and burning. Using ${product.name} twice daily completely restored my skin barrier and glass-skin hydration.`,
      rating: 5,
      date: 'July 18, 2026',
      skinType: 'Dry & Reactive Skin',
      verified: true
    },
    {
      id: 2,
      author: 'Marcus C.',
      role: 'Verified Devotee • Tokyo',
      title: 'Zero breakouts, pure weightless hydration',
      text: `I was nervous trying a new ${product.category.toLowerCase()} formula, but ${product.name} sinks in effortlessly without clogging pores or feeling heavy. Cannot live without it!`,
      rating: 5,
      date: 'July 11, 2026',
      skinType: 'Combination & Sensitive',
      verified: true
    }
  ];

  const allReviews = [...customReviews, ...defaultProductReviews];

  const filteredReviews = allReviews.filter((r) => {
    const matchesRating = ratingFilter === 'all' || (ratingFilter === '5' && r.rating === 5);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      r.title.toLowerCase().includes(q) || 
      r.text.toLowerCase().includes(q) || 
      r.author.toLowerCase().includes(q) ||
      r.skinType.toLowerCase().includes(q);
    return matchesRating && matchesSearch;
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim() || !newName.trim()) {
      addToast('Please fill out all review fields.', 'Incomplete Review');
      return;
    }

    const reviewObj = {
      id: Date.now(),
      author: newName,
      role: 'Verified Devotee',
      title: newTitle,
      text: newText,
      rating: newRating,
      date: 'Just now',
      skinType: newSkinType,
      verified: true
    };

    setCustomReviews([reviewObj, ...customReviews]);
    setIsWriteReviewOpen(false);
    setNewTitle('');
    setNewText('');
    setNewName('');
    addToast('Your clinical review has been published!', 'Review Submitted');
  };

  const handleHelpfulVote = (id) => {
    if (votedReviewsMap[id]) return;
    setVotedReviewsMap((prev) => ({ ...prev, [id]: true }));
    setReviewHelpfulVotes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    addToast('Thank you for voting this review as helpful.', 'Feedback Recorded');
  };

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);
  const galleryImages = [product.image, product.hoverImage || product.image].filter(Boolean);

  const reviewGalleryPhotos = [
    { url: product.image, caption: 'Velvety Absorption & Fast Melting Action', tag: 'Formula Shot' },
    { url: product.hoverImage || product.image, caption: '14-Day Barrier Recovery Results', tag: 'Clinical Panel' },
    { url: '/images/skincare_set.png', caption: 'Synergistic Daily Ritual Pairings', tag: 'Routine Shot' },
    { url: '/images/hero_serum.png', caption: 'Dosage Precision Amber Glass Vial', tag: 'Devotee Photo' }
  ];

  return (
    <div className="product-detail-view section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigateToView('home')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer' }}>Home</button>
          <span>/</span>
          <button onClick={() => navigateToView('shop')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer' }}>Shop</button>
          <span>/</span>
          <button onClick={() => navigateToView('shop')} style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer' }}>{product.category}</button>
          <span>/</span>
          <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Top Product Showcase Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '50px',
            marginBottom: '70px',
            alignItems: 'start'
          }}
          className="product-grid-detail"
        >
          
          {/* Left Gallery & Image Zoom */}
          <div>
            <div
              style={{
                position: 'relative',
                backgroundColor: 'var(--color-card-img-bg, #F5F4EF)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
                minHeight: '440px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px',
                cursor: 'zoom-in'
              }}
              onClick={() => setIsZoomOpen(true)}
            >
              {/* Badge */}
              <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 2, display: 'flex', gap: '8px' }}>
                <span className="badge badge-dark">{product.tag || 'Botanical Formula'}</span>
                {product.badge && <span className="badge badge-sage">{product.badge}</span>}
              </div>

              {/* Wishlist Button */}
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
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Wishlist toggle"
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
                src={selectedImage}
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.1))',
                  transition: 'all 0.3s ease'
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-text)'
                }}
              >
                <ZoomIn size={14} /> Click to Expand
              </div>
            </div>

            {/* Thumbnail Selector Strip */}
            {galleryImages.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-card-img-bg, #F5F4EF)',
                      border: selectedImage === imgUrl ? '2px solid var(--color-text)' : '1px solid var(--color-border)',
                      padding: '4px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={imgUrl} alt="Thumbnail view" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Purchase & Prescription Controls */}
          <div>
            {/* Category & Stock Summary Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-sage)' }}>
                {product.category} Formula
              </span>

              {/* Ultra-Luxury Pulsing Stock Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 12px',
                  backgroundColor: 'var(--color-sage-light)',
                  border: '1px solid rgba(85, 107, 83, 0.2)',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <span style={{ position: 'relative', display: 'flex', width: '7px', height: '7px', alignItems: 'center', justifyContent: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-sage)',
                      opacity: 0.75,
                      animation: 'sagePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  />
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-sage)',
                      zIndex: 1
                    }}
                  />
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#2C352B'
                  }}
                >
                  In Stock • Dispatches in 24h
                </span>
              </div>
            </div>

            <h1 className="heading-lg" style={{ marginBottom: '8px', fontSize: '2.1rem', lineHeight: 1.25 }}>
              {product.name}
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              {product.subtitle || product.purpose}
            </p>

            {/* Star Rating & Review Link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', color: 'var(--color-gold)' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{product.rating || 4.9}</span>
              <a href="#reviews-section" style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', textDecoration: 'underline' }}>
                ({product.reviewCount || 128} Clinical Reviews)
              </a>
            </div>

            {/* Purchase Options Card (One-Time vs Subscribe) */}
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Option 1: One Time */}
              <div
                onClick={() => setPurchaseType('one-time')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid',
                  borderColor: purchaseType === 'one-time' ? 'var(--color-text)' : 'var(--color-border)',
                  backgroundColor: purchaseType === 'one-time' ? '#FAF9F6' : 'var(--color-white)',
                  boxShadow: purchaseType === 'one-time' ? '0 4px 14px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Custom Luxury Radio Circle */}
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${purchaseType === 'one-time' ? 'var(--color-text)' : 'var(--color-border-dark)'}`,
                      backgroundColor: 'var(--color-white)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'border-color 0.25s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-text)',
                        transform: purchaseType === 'one-time' ? 'scale(1)' : 'scale(0)',
                        opacity: purchaseType === 'one-time' ? 1 : 0,
                        transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease'
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--color-text)' }}>One-Time Purchase</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Standard delivery with 3 luxury samples</div>
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: '1.15rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}>
                  ${basePrice.toFixed(2)}
                </div>
              </div>

              {/* Option 2: Subscribe & Save 15% */}
              <div
                onClick={() => setPurchaseType('subscribe')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid',
                  borderColor: purchaseType === 'subscribe' ? 'var(--color-sage)' : 'var(--color-border)',
                  backgroundColor: purchaseType === 'subscribe' ? 'var(--color-sage-light)' : 'var(--color-white)',
                  boxShadow: purchaseType === 'subscribe' ? '0 4px 14px rgba(85,107,83,0.12)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Custom Luxury Radio Circle */}
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${purchaseType === 'subscribe' ? 'var(--color-sage)' : 'var(--color-border-dark)'}`,
                      backgroundColor: 'var(--color-white)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'border-color 0.25s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-sage)',
                        transform: purchaseType === 'subscribe' ? 'scale(1)' : 'scale(0)',
                        opacity: purchaseType === 'subscribe' ? 1 : 0,
                        transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease'
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Auto-Replenish &amp; Save 15%</span>
                      <span className="badge badge-sage" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>SAVE 15%</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Delivered every 30 days • Cancel or pause anytime</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem', fontFamily: 'var(--font-serif)', color: 'var(--color-sage-dark, #2C352B)' }}>
                    ${(basePrice * 0.85).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.72rem', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                    ${basePrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Size Selector Pills */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                  Select Volume Size:
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.sizes.map((s) => {
                    const isSelected = selectedSizeObj.size === s.size;
                    return (
                      <button
                        key={s.size}
                        type="button"
                        onClick={() => setSelectedSizeObj(s)}
                        style={{
                          padding: '10px 18px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--color-text)' : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? 'var(--color-white)' : 'transparent',
                          color: 'var(--color-text)',
                          boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {s.size} &nbsp;<span style={{ opacity: 0.75 }}>(${s.price})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add To Bag */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-white)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '14px 16px', cursor: 'pointer', color: 'var(--color-text)', background: 'none', border: 'none' }}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span style={{ padding: '0 12px', fontSize: '1rem', fontWeight: 700 }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: '14px 16px', cursor: 'pointer', color: 'var(--color-text)', background: 'none', border: 'none' }}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => addToCart(product, selectedSizeObj.size, quantity)}
                className="btn btn-primary btn-glow"
                style={{ flex: 1, padding: '16px', fontSize: '0.92rem', fontWeight: 700 }}
              >
                Add To Bag — ${(currentPrice * quantity).toFixed(2)}
              </button>
            </div>

            {/* Buy Now Direct Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '14px', marginBottom: '28px', fontSize: '0.85rem' }}
            >
              Instant Express Checkout &rarr;
            </button>

            {/* Value Guarantees Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                paddingTop: '20px',
                borderTop: '1px solid var(--color-border)',
                fontSize: '0.82rem',
                color: 'var(--color-text-muted)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} style={{ color: 'var(--color-sage)' }} />
                <span>Free 3-Day Shipping Over $75</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: 'var(--color-sage)' }} />
                <span>Dermatologist Formulated</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={16} style={{ color: 'var(--color-sage)' }} />
                <span>30-Day Money Back Guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--color-sage)' }} />
                <span>3 Deluxe Samples Included</span>
              </div>
            </div>

          </div>

        </div>

        {/* Clinical Trial Metrics Box */}
        {product.clinicalTrial && (
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              padding: '32px 40px',
              marginBottom: '60px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="subtitle">Independent Clinical Panel Results</span>
              <h3 className="heading-md" style={{ marginTop: '4px' }}>Verified 14-Day Clinical Efficacy</h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px',
                textAlign: 'center'
              }}
            >
              <div style={{ padding: '16px', backgroundColor: 'var(--color-card-img-bg, #F5F4EF)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-sage)' }}>98%</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', marginTop: '4px', fontWeight: 600 }}>{product.clinicalTrial.hydration || 'Immediate Hydration Boost'}</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--color-card-img-bg, #F5F4EF)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-gold)' }}>94%</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', marginTop: '4px', fontWeight: 600 }}>{product.clinicalTrial.barrier || 'Reduced Redness in 14 Days'}</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--color-card-img-bg, #F5F4EF)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-sage)' }}>96%</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', marginTop: '4px', fontWeight: 600 }}>{product.clinicalTrial.smoothness || 'Smoother Texture'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Accordions & Actives Section */}
        <div style={{ maxWidth: '900px', margin: '0 auto 80px auto' }}>
          
          {/* Accordion 1: Benefits */}
          <div style={{ borderBottom: '1px solid var(--color-border)' }}>
            <button
              onClick={() => toggleAccordion('benefits')}
              style={{
                width: '100%',
                padding: '24px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>Key Benefits &amp; Cellular Action</span>
              <ChevronDown
                size={20}
                style={{ transform: openAccordion === 'benefits' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
              />
            </button>
            {openAccordion === 'benefits' && (
              <div style={{ paddingBottom: '24px', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {product.benefits?.map((b, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--color-text)' }}>{b.split(' ')[0]}</strong> {b.substring(b.indexOf(' ') + 1)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Accordion 2: Key Ingredients & INCI */}
          <div style={{ borderBottom: '1px solid var(--color-border)' }}>
            <button
              onClick={() => toggleAccordion('ingredients')}
              style={{
                width: '100%',
                padding: '24px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>Key Bio-Actives &amp; Full INCI List</span>
              <ChevronDown
                size={20}
                style={{ transform: openAccordion === 'ingredients' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
              />
            </button>
            {openAccordion === 'ingredients' && (
              <div style={{ paddingBottom: '24px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  {product.keyIngredients?.map((ing, i) => (
                    <div key={i} style={{ backgroundColor: 'var(--color-white)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)', marginBottom: '4px' }}>
                        Active {i + 1}
                      </div>
                      <strong style={{ color: 'var(--color-text)', fontSize: '0.98rem' }}>{ing.name}</strong>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{ing.role}</p>
                    </div>
                  ))}
                </div>

                {product.inciList && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-white)',
                      padding: '18px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                        Complete INCI Formulation List:
                      </strong>
                      <button
                        type="button"
                        onClick={handleCopyInci}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--color-sage)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Copy size={13} /> {copiedInci ? 'Copied!' : 'Copy INCI List'}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      {product.inciList}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Accordion 3: How To Use */}
          <div style={{ borderBottom: '1px solid var(--color-border)' }}>
            <button
              onClick={() => toggleAccordion('howToUse')}
              style={{
                width: '100%',
                padding: '24px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>How To Use &amp; Routine Placement</span>
              <ChevronDown
                size={20}
                style={{ transform: openAccordion === 'howToUse' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
              />
            </button>
            {openAccordion === 'howToUse' && (
              <div style={{ paddingBottom: '24px', fontSize: '0.94rem', lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
                <p style={{ marginBottom: '16px' }}>{product.howToUse}</p>
                <div style={{ padding: '16px', backgroundColor: 'var(--color-sage-light)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                  <strong>Ritual Tip:</strong> Apply morning and night. For max barrier repair, combine with <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigateToView('product', 'velvet-cleansing-balm')}>Velvet Cleansing Balm</span>.
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ULTRA-PREMIUM PRODUCT CUSTOMER REVIEWS SECTION */}
        <section id="reviews-section" style={{ marginBottom: '90px', paddingTop: '20px' }}>
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
            
            {/* Reviews Section Editorial Header */}
            <div style={{ textAlign: 'center', marginBottom: '44px' }}>
              <span className="subtitle" style={{ letterSpacing: '0.14em', color: 'var(--color-sage)' }}>
                ✦ CLINICALLY DEDICATED FORMULATIONS ✦
              </span>
              <h2 className="heading-lg" style={{ marginTop: '6px', fontSize: '2.2rem' }}>
                Verified Devotee &amp; Clinical Panel Reviews
              </h2>
              <p style={{ fontSize: '0.98rem', color: 'var(--color-text-muted)', marginTop: '8px', maxWidth: '580px', margin: '8px auto 0 auto' }}>
                Real clinical results, dermatologist evaluations, and long-term ritual feedback for {product.name}.
              </p>
            </div>

            {/* NEW ELEMENT 1: Bio-Compatibility Trust Seals Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '36px'
              }}
            >
              <div style={{ backgroundColor: 'var(--color-white)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sage)', flexShrink: 0 }}>
                  <Dna size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)' }}>Biocompatible Lipids</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>100% skin-identical ceramides</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-white)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#FFFDF0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', flexShrink: 0 }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)' }}>Dermatologist Tested</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>Hypoallergenic &amp; Non-comedogenic</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-white)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sage)', flexShrink: 0 }}>
                  <Leaf size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)' }}>Clean Botanical Standard</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>0% fragrance, parabens, or sulfates</div>
                </div>
              </div>
            </div>

            {/* Ultra-Luxury Clinical Review Dashboard Banner */}
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: '40px 48px',
                marginBottom: '40px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.03)'
              }}
            >
              {/* Top Row: Overall Score + Write Review Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '24px',
                  paddingBottom: '28px',
                  borderBottom: '1px solid var(--color-border)'
                }}
              >
                {/* Score & Stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '3.6rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1 }}>
                    {product.rating || '4.9'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '4px', color: 'var(--color-gold)', marginBottom: '6px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      {allReviews.length + 124} Verified Clinical Evaluations
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-sage)', fontWeight: 700, marginTop: '2px' }}>
                      ✔ 96% Clinical Reorder &amp; Satisfaction Rate
                    </div>
                  </div>
                </div>

                {/* Write Review Button */}
                <button
                  type="button"
                  onClick={() => setIsWriteReviewOpen(true)}
                  className="btn btn-primary btn-glow"
                  style={{ padding: '14px 24px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <MessageSquare size={16} /> Write a Devotee Review
                </button>
              </div>

              {/* Middle Row: Star Rating Breakdown Histogram */}
              <div style={{ paddingTop: '24px', maxWidth: '640px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                  Rating Distribution Breakdown:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { star: 5, pct: 88 },
                    { star: 4, pct: 9 },
                    { star: 3, pct: 2 },
                    { star: 2, pct: 1 },
                    { star: 1, pct: 0 }
                  ].map((row) => (
                    <div key={row.star} style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem' }}>
                      <span style={{ width: '32px', fontWeight: 700, color: 'var(--color-text)' }}>{row.star} ★</span>
                      <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-card-img-bg, #F5F4EF)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: `${row.pct}%`, height: '100%', backgroundColor: 'var(--color-gold)', borderRadius: 'var(--radius-full)' }} />
                      </div>
                      <span style={{ width: '36px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NEW ELEMENT 2: Customer Photo / Video Review Gallery */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Camera size={18} style={{ color: 'var(--color-sage)' }} /> Verified Customer Formula Imagery
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Click image to inspect</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {reviewGalleryPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setReviewPhotoZoom(photo)}
                    style={{
                      position: 'relative',
                      backgroundColor: 'var(--color-card-img-bg, #F5F4EF)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--color-border)',
                      aspectRatio: '1',
                      cursor: 'zoom-in'
                    }}
                  >
                    <img src={photo.url} alt={photo.caption} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
                    <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '3px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      {photo.tag}
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.65)', color: '#FFFFFF', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                      {photo.caption}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NEW ELEMENT 3: Search Bar & Filter Controls Bar */}
            <div style={{ backgroundColor: 'var(--color-white)', padding: '20px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Real-Time Keyword Search Bar */}
                <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder='Search reviews (e.g., "redness", "eczema", "hydration", "dermatologist")...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 40px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: 'var(--color-bg)'
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Rating Filter Pills */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setRatingFilter('all')}
                    style={{
                      padding: '9px 16px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: ratingFilter === 'all' ? 'var(--color-text)' : 'var(--color-white)',
                      color: ratingFilter === 'all' ? 'var(--color-white)' : 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    All ({allReviews.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatingFilter('5')}
                    style={{
                      padding: '9px 16px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: ratingFilter === '5' ? 'var(--color-text)' : 'var(--color-white)',
                      color: ratingFilter === '5' ? 'var(--color-white)' : 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    5 Stars ★
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Showing {filteredReviews.length} Verified Reviews {searchQuery && `matching "${searchQuery}"`}
              </div>
            </div>

            {/* Review Cards Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {filteredReviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>No clinical reviews matched your query "{searchQuery}".</p>
                  <button type="button" onClick={() => { setSearchQuery(''); setRatingFilter('all'); }} className="btn btn-secondary" style={{ marginTop: '12px', padding: '8px 16px', fontSize: '0.8rem' }}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredReviews.map((rev) => {
                  const isVoted = votedReviewsMap[rev.id];
                  const initials = rev.author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                  return (
                    <div
                      key={rev.id}
                      className="card-white"
                      style={{
                        padding: '32px 36px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {/* Top Author & Verification Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {/* Monogram Avatar */}
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-sage-light)',
                              border: '1px solid rgba(85, 107, 83, 0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              color: 'var(--color-sage-dark, #2C352B)',
                              fontFamily: 'var(--font-serif)',
                              flexShrink: 0
                            }}
                          >
                            {initials}
                          </div>

                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{rev.author}</span>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: 'var(--color-sage-dark, #2C352B)',
                                  backgroundColor: 'var(--color-sage-light)',
                                  padding: '3px 10px',
                                  borderRadius: 'var(--radius-full)',
                                  border: '1px solid rgba(85, 107, 83, 0.2)'
                                }}
                              >
                                <CheckCircle2 size={12} style={{ color: 'var(--color-sage)' }} /> {rev.role}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                              Skin Profile: <strong style={{ color: 'var(--color-sage)' }}>{rev.skinType}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Stars & Date */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '4px', color: 'var(--color-gold)', marginBottom: '4px' }}>
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} size={16} fill="currentColor" />
                            ))}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{rev.date}</span>
                        </div>
                      </div>

                      {/* Review Title */}
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600, marginBottom: '12px', color: 'var(--color-text)', lineHeight: 1.3 }}>
                        "{rev.title}"
                      </h4>

                      {/* Review Body Text */}
                      <p style={{ fontSize: '0.98rem', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '22px', fontStyle: 'italic' }}>
                        "{rev.text}"
                      </p>

                      {/* Footer: Helpful Vote Counter */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '18px', borderTop: '1px solid var(--color-border-light, #F0EFEA)' }}>
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={14} style={{ color: 'var(--color-sage)' }} />
                          <span>Verified 14-Day Clinical Panelist</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleHelpfulVote(rev.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '7px 16px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: isVoted ? 'var(--color-sage-light)' : 'var(--color-white)',
                            color: isVoted ? 'var(--color-sage-dark)' : 'var(--color-text)',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: isVoted ? 'default' : 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ThumbsUp size={13} style={{ color: isVoted ? 'var(--color-sage)' : 'currentColor' }} />
                          <span>Helpful ({reviewHelpfulVotes[rev.id] || 42})</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </section>

        {/* Synergistic Ritual (Complete Your Routine) */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span className="subtitle">Synergistic Formulations</span>
            <h2 className="heading-md" style={{ marginTop: '4px' }}>Complete Your Skincare Ritual</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {relatedProducts.map((rel) => (
              <div key={rel.id} className="card-white card-glow" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div 
                  style={{ backgroundColor: 'var(--color-card-img-bg, #F5F4EF)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
                  onClick={() => navigateToView('product', rel.id)}
                >
                  <img src={rel.image} alt={rel.name} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-sage)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  {rel.category}
                </div>
                <h4 
                  onClick={() => navigateToView('product', rel.id)}
                  style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px', cursor: 'pointer' }}
                >
                  {rel.name}
                </h4>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '16px', marginTop: 'auto' }}>${rel.price}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => openQuickView(rel)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '10px', fontSize: '0.78rem' }}
                  >
                    Quick View
                  </button>
                  <button
                    type="button"
                    onClick={() => addToCart(rel)}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px', fontSize: '0.78rem' }}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Mobile Add To Cart Bar */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-white)',
            borderTop: '1px solid var(--color-border)',
            padding: '12px 20px',
            zIndex: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-lg)'
          }}
          className="mobile-sticky-bar"
        >
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{product.name}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>${(currentPrice * quantity).toFixed(2)}</div>
          </div>
          <button
            type="button"
            onClick={() => addToCart(product, selectedSizeObj.size, quantity)}
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.82rem' }}
          >
            Add To Bag
          </button>
        </div>

      </div>

      {/* Photo Lightbox Zoom Modal */}
      {reviewPhotoZoom && (
        <div className="modal-backdrop" onClick={() => setReviewPhotoZoom(null)} style={{ padding: '20px' }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '100%',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              position: 'relative',
              textAlign: 'center'
            }}
          >
            <button
              onClick={() => setReviewPhotoZoom(null)}
              className="btn-icon"
              style={{ position: 'absolute', top: '16px', right: '16px' }}
            >
              <X size={18} />
            </button>
            <img src={reviewPhotoZoom.url} alt={reviewPhotoZoom.caption} style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: 'var(--radius-md)', marginBottom: '16px' }} />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600 }}>{reviewPhotoZoom.caption}</h4>
            <span className="badge badge-sage" style={{ marginTop: '8px' }}>{reviewPhotoZoom.tag}</span>
          </div>
        </div>
      )}

      {/* Write Review Interactive Modal */}
      {isWriteReviewOpen && (
        <div className="modal-backdrop" onClick={() => setIsWriteReviewOpen(false)} style={{ padding: '20px' }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)',
              padding: '32px',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setIsWriteReviewOpen(false)}
              className="btn-icon"
              style={{ position: 'absolute', top: '16px', right: '16px' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="subtitle">Share Your Experience</span>
              <h3 className="heading-md" style={{ marginTop: '4px' }}>
                Review {product.name}
              </h3>
            </div>

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Star Rating Picker */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                  Your Overall Rating:
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', color: 'var(--color-gold)' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(newRating)}
                      onClick={() => setNewRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <Star
                        size={24}
                        fill={star <= (hoverRating || newRating) ? 'currentColor' : 'none'}
                        style={{ color: 'var(--color-gold)', transition: 'transform 0.15s ease' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Review Headline:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Healed my redness in under 10 days!"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Your Devotee Review:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details about your skin type, how long you used the formula, and the results you experienced..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                    Your Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hannah S."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                    Skin Profile:
                  </label>
                  <select
                    value={newSkinType}
                    onChange={(e) => setNewSkinType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      outline: 'none',
                      fontSize: '0.88rem',
                      backgroundColor: 'var(--color-white)'
                    }}
                  >
                    <option value="Dry & Sensitive">Dry &amp; Sensitive</option>
                    <option value="Combination Skin">Combination Skin</option>
                    <option value="Oily & Acne-Prone">Oily &amp; Acne-Prone</option>
                    <option value="Mature & Dehydrated">Mature &amp; Dehydrated</option>
                    <option value="Compromised Barrier">Compromised Barrier</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-glow"
                style={{ width: '100%', padding: '14px', marginTop: '10px', fontWeight: 700 }}
              >
                Submit Clinical Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {isZoomOpen && (
        <div className="modal-backdrop" onClick={() => setIsZoomOpen(false)}>
          <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
            <img
              src={selectedImage}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .mobile-sticky-bar { display: none !important; }
        }
      `}</style>
    </div>
  );
};
