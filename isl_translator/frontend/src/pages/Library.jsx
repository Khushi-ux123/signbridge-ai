import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import ScrollReveal from '../components/ScrollReveal';

export default function Library() {
  const [signs, setSigns] = useState([]);
  const [filteredSigns, setFilteredSigns] = useState([]);
  const [search, setSearch] = useState('');
  const [flipped, setFlipped] = useState({});
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetch('/api/library')
      .then(r => r.json())
      .then(data => {
        setSigns(data.signs || []);
        setFilteredSigns(data.signs || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let filtered = signs;
    if (category !== 'All') {
      filtered = filtered.filter(s => s.category === category);
    }
    if (search) {
      filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredSigns(filtered);
  }, [search, category, signs]);

  const handleFlip = (name) => {
    setFlipped(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const categories = ['All', 'Alphabet', 'Number', 'Word'];

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="section section-center" style={{ paddingTop: 140, paddingBottom: 40 }}>
        <ScrollReveal>
          <h1 className="section-title">
            ISL <span className="hero-gradient">Library</span>
          </h1>
          <p className="section-sub">
            Explore our interactive visual dictionary. Click on any sign to view its detailed description and context.
          </p>
        </ScrollReveal>
      </section>

      {/* Search + Filter */}
      <div className="container" style={{ paddingBottom: 40 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <input
            type="text"
            placeholder="Search signs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 300px',
              background: 'rgba(30,41,59,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '12px 20px',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  background: category === cat ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'rgba(30,41,59,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <a href="/translate" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
              ⚡ Go to Translator
            </button>
          </a>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)', margin: '0 48px' }} />

      {/* Cards Grid */}
      <div className="section" style={{ paddingTop: 40 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 24,
        }}>
          {filteredSigns.map((sign, i) => (
            <ScrollReveal key={sign.name + i} delay={i * 0.02}>
              <motion.div
                onClick={() => handleFlip(sign.name)}
                style={{
                  position: 'relative',
                  height: 320,
                  perspective: 1000,
                  cursor: 'pointer',
                }}
              >
                <motion.div
                  animate={{ rotateY: flipped[sign.name] ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Front */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      background: 'rgba(30,41,59,0.3)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 16,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ flex: 1, overflow: 'hidden', background: '#000' }}>
                      <img
                        src={sign.image}
                        alt={sign.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>
                        {sign.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {sign.category}
                      </div>
                      <div style={{ marginTop: 8, fontSize: '0.7rem', color: '#6366f1', fontWeight: 600 }}>
                        📖 CLICK TO LEARN
                      </div>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      borderRadius: 16,
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✅</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                      {sign.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#a5b4fc', marginBottom: 16, lineHeight: 1.6 }}>
                      {sign.category === 'Alphabet' && `The letter "${sign.name}" in Indian Sign Language`}
                      {sign.category === 'Number' && `The number "${sign.name}" in Indian Sign Language`}
                      {sign.category === 'Word' && `The word "${sign.name}" in Indian Sign Language`}
                    </div>
                    <div style={{
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      color: '#22c55e',
                      fontWeight: 700,
                    }}>
                      READY FOR DETECTION
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {filteredSigns.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>No signs found</div>
            <div style={{ fontSize: '0.9rem', marginTop: 8 }}>Try a different search or category</div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
