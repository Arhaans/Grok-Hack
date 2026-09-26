import React from 'react';
import { useShop } from '../context/ShopContext';
import { Search, X, ArrowRight } from 'lucide-react';
import { JOURNAL_ARTICLES } from '../data/journal';

export const SearchModal = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    PRODUCTS,
    navigateToView
  } = useShop();

  if (!isSearchOpen) return null;

  const filteredProducts = searchQuery.trim() === '' ? [] : PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.keyIngredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredArticles = searchQuery.trim() === '' ? [] : JOURNAL_ARTICLES.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularTags = ['Barrier Repair Serum', 'Cleansers', 'Night Oil', 'Centella', 'Bakuchiol', 'Ceramides'];

  return (
    <div className="modal-backdrop" onClick={() => setIsSearchOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          margin: '20px',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <Search size={22} style={{ color: 'var(--color-sage)' }} />
          <input
            type="text"
            autoFocus
            placeholder="Search PRISM formulas, active ingredients, or skincare guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1.1rem',
              fontFamily: 'var(--font-sans)',
              backgroundColor: 'transparent',
              color: 'var(--color-text)'
            }}
          />
          <button
            onClick={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
            }}
            className="btn-icon"
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results Container */}
        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {searchQuery.trim() === '' ? (
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--color-text-muted)',
                  marginBottom: '12px'
                }}
              >
                Popular Searches
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-white)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Product Results */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--color-sage)',
                    marginBottom: '12px'
                  }}
                >
                  Formulas ({filteredProducts.length})
                </div>

                {filteredProducts.length === 0 ? (
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                    No skincare formulas found matching "{searchQuery}".
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigateToView('product', product.id);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '12px',
                          backgroundColor: 'var(--color-white)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 600 }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            {product.category} • ${product.price}
                          </div>
                        </div>
                        <ArrowRight size={16} style={{ color: 'var(--color-sage)' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Journal Results */}
              {filteredArticles.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--color-sage)',
                      marginBottom: '12px'
                    }}
                  >
                    Journal Articles ({filteredArticles.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredArticles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigateToView('journal');
                        }}
                        style={{
                          padding: '12px',
                          backgroundColor: 'var(--color-white)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{article.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          {article.category} • {article.readTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
