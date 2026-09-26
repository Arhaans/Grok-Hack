import React, { useState } from 'react';
import { Search, Clock, User, X, ArrowRight } from 'lucide-react';
import { JOURNAL_ARTICLES } from '../data/journal';

export const JournalView = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [journalQuery, setJournalQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  const categories = ['All', 'Skin Education', 'Ingredients 101', 'Routine Guides'];

  const filteredArticles = JOURNAL_ARTICLES.filter((a) => {
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch = a.title.toLowerCase().includes(journalQuery.toLowerCase()) ||
                          a.excerpt.toLowerCase().includes(journalQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredArticle = JOURNAL_ARTICLES[0];

  return (
    <div className="journal-view section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <span className="subtitle">Dermatological Insights</span>
          <h1 className="heading-lg" style={{ marginTop: '8px', marginBottom: '12px' }}>
            The PRISM Journal
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Explore evidence-based guides on barrier function, botanical active ingredients, and skin restoration routines.
          </p>
        </div>

        {/* Featured Article Banner */}
        {featuredArticle && (
          <div
            className="card-white"
            onClick={() => setActiveArticle(featuredArticle)}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '40px',
              overflow: 'hidden',
              marginBottom: '60px',
              cursor: 'pointer'
            }}
          >
            <div style={{ aspectRatio: '16/9', backgroundColor: 'var(--color-sage-light)', overflow: 'hidden' }}>
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="badge badge-sage" style={{ alignSelf: 'flex-start', marginBottom: '12px' }}>
                Featured Editorial
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 600, marginBottom: '12px', lineHeight: 1.2 }}>
                {featuredArticle.title}
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                {featuredArticle.excerpt}
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', display: 'flex', gap: '16px' }}>
                <span><User size={13} style={{ display: 'inline' }} /> {featuredArticle.author}</span>
                <span><Clock size={13} style={{ display: 'inline' }} /> {featuredArticle.readTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          {/* Categories */}
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
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sage)' }} />
            <input
              type="text"
              placeholder="Search journal articles..."
              value={journalQuery}
              onChange={(e) => setJournalQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: '0.85rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-white)'
              }}
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="card-white"
              onClick={() => setActiveArticle(article)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              <div style={{ aspectRatio: '16/10', backgroundColor: 'var(--color-sage-light)', overflow: 'hidden' }}>
                <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-sage)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {article.category} • {article.readTime}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.3 }}>
                  {article.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
                  {article.excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  <span>Read Full Article</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Article Detail Drawer Modal */}
      {activeArticle && (
        <div className="modal-backdrop" onClick={() => setActiveArticle(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '780px',
              maxHeight: '85vh',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflowY: 'auto',
              margin: '20px',
              padding: '40px',
              border: '1px solid var(--color-border)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setActiveArticle(null)}
              className="btn-icon"
              style={{ position: 'absolute', top: '20px', right: '20px' }}
            >
              <X size={20} />
            </button>

            <span className="badge badge-sage" style={{ marginBottom: '12px' }}>{activeArticle.category}</span>
            <h1 className="heading-lg" style={{ marginBottom: '12px' }}>{activeArticle.title}</h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              By {activeArticle.author} • Published {activeArticle.date} • {activeArticle.readTime}
            </div>

            <img
              src={activeArticle.image}
              alt={activeArticle.title}
              style={{ width: '100%', height: '340px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '28px' }}
            />

            <div
              style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--color-text)', whiteSpace: 'pre-line' }}
            >
              {activeArticle.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
