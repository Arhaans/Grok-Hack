import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Star, Heart, SlidersHorizontal, Eye } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const ShopView = () => {
  const { PRODUCTS, navigateToView, addToCart, toggleWishlist, wishlist, openQuickView } = useShop();
  useScrollReveal();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const categories = ['All', 'Cleansers', 'Serums', 'Moisturizers', 'Sets'];

  // Filtering
  let filteredProducts = PRODUCTS.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  // Sorting
  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="shop-view section-padding" style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh' }}>
      <div className="container">
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <span className="subtitle">The PRISM Collection</span>
          <h1 className="heading-lg" style={{ marginTop: '8px', marginBottom: '12px' }}>
            Botanical Skincare Formulas
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Every formula is biocompatible, free of artificial fragrance, and engineered to strengthen skin barrier integrity.
          </p>
        </div>

        {/* Filter Bar & Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '24px',
            marginBottom: '40px',
            borderBottom: '1px solid var(--color-border)',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: selectedCategory === cat ? 'var(--color-text)' : 'var(--color-white)',
                  color: selectedCategory === cat ? 'var(--color-white)' : 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} style={{ color: 'var(--color-sage)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-white)',
                color: 'var(--color-text)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="featured">Featured Collection</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '30px'
          }}
        >
          {filteredProducts.map((product) => (
            <div key={product.id} className="card-white card-glow reveal-scale" style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* Image Container with Hover Swap */}
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  backgroundColor: 'var(--color-sage-light)',
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
                    transition: 'transform 0.4s ease'
                  }}
                />

                {/* Badge Tag */}
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
                    boxShadow: 'var(--shadow-sm)',
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
                      color: wishlist.includes(product.id) ? '#e74c3c' : 'var(--color-text)',
                      fill: wishlist.includes(product.id) ? '#e74c3c' : 'none'
                    }}
                  />
                </button>
              </div>

              {/* Product Info */}
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
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    marginBottom: '4px',
                    cursor: 'pointer',
                    lineHeight: 1.2
                  }}
                >
                  {product.name}
                </h3>

                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '16px', flex: 1 }}>
                  {product.subtitle || product.purpose}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
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
    </div>
  );
};
