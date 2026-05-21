import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import ScrollReveal from '../components/ScrollReveal';

const techStack = [
  { name: 'MediaPipe',   desc: 'Hand & pose landmark detection — 21 keypoints per hand for precise gesture tracking.',  icon: '🖐️', color: '#3b82f6' },
  { name: 'TensorFlow',  desc: 'MobileNetV2 CNN trained on 56 ISL classes for single-frame sign recognition.',           icon: '🧠', color: '#f59e0b' },
  { name: 'OpenCV',      desc: 'Real-time video processing, frame capture and image preprocessing pipeline.',            icon: '📸', color: '#22c55e' },
  { name: 'FastAPI',     desc: 'High-performance Python backend with WebSocket support for live frame streaming.',       icon: '⚡', color: '#8b5cf6' },
  { name: 'React + Vite',desc: 'Modern frontend with Framer Motion animations and real-time canvas landmark overlay.',   icon: '⚛️', color: '#06b6d4' },
  { name: 'WebSocket',   desc: 'Bidirectional real-time protocol — 10 frames/sec streaming from browser to server.',    icon: '🔌', color: '#ec4899' },
];

const timeline = [
  { phase: 'Dataset Collection',   desc: 'Gathered ISL images across 56 classes — Alphabets (A-Z), Numbers (0-9), Basic Words', status: 'done' },
  { phase: 'Model Training',       desc: 'Trained MobileNetV2 CNN with transfer learning — Phase 1 head, Phase 2 fine-tune',     status: 'done' },
  { phase: 'Backend Integration',  desc: 'FastAPI WebSocket server with subprocess MediaPipe worker to avoid protobuf conflicts', status: 'done' },
  { phase: 'Live Landmark Overlay',desc: 'Canvas overlay drawing hand skeleton + pose dots in real-time on camera feed',         status: 'done' },
  { phase: 'ISL Library',          desc: 'Interactive flip-card dictionary with real dataset images and search/filter',           status: 'done' },
  { phase: 'Sentence Builder',     desc: 'Combining detected signs into full sentences with text-to-speech output',               status: 'progress' },
  { phase: 'Word-level LSTM Model',desc: 'Sequence-based model for dynamic word gestures using 30-frame temporal sequences',      status: 'planned' },
];

export default function Dashboard() {
  const [health, setHealth]   = useState(null);
  const [actions, setActions] = useState([]);

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setHealth).catch(() => {});
    fetch('/api/actions').then(r => r.json()).then(d => setActions(d.actions || [])).catch(() => {});
  }, []);

  const archLabel = {
    'rf_landmark': 'Random Forest',
    'cnn':         'CNN',
    'lstm':        'LSTM',
  }[health?.model] || '—';

  const metrics = [
    { value: actions.length || '—', label: 'Model Classes',  color: '#3b82f6', icon: '🎯' },
    { value: archLabel,              label: 'Architecture',   color: '#8b5cf6', icon: '🧠' },
    { value: '56',                   label: 'ISL Signs',      color: '#22c55e', icon: '🤟' },
    { value: health ? '🟢' : '🔴',  label: health ? 'Server Online' : 'Server Offline', color: health ? '#22c55e' : '#ef4444', icon: '⚡' },
  ];

  // Group classes by type
  const alphabets = actions.filter(a => a.length === 1 && a >= 'A' && a <= 'Z');
  const numbers   = actions.filter(a => !isNaN(a));
  const words     = actions.filter(a => a.length > 1 && isNaN(a));

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="section section-center" style={{ paddingTop: 140, paddingBottom: 40 }}>
        <ScrollReveal>
          <div className="badge-green">
            <div className="badge-dot" />
            LIVE SYSTEM STATUS
          </div>
          <h1 className="section-title">
            Performance <span className="hero-gradient">Dashboard</span>
          </h1>
          <p className="section-sub">
            Real-time model metrics, system health, and development progress.
          </p>
        </ScrollReveal>
      </section>

      <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.3),transparent)', margin: '0 48px 60px' }} />

      <div className="container" style={{ paddingBottom: 120 }}>

        {/* Metric Cards */}
        <ScrollReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24, marginBottom: 60 }}>
            {metrics.map((m, i) => (
              <motion.div key={i}
                whileHover={{ translateY: -6, boxShadow: `0 16px 40px ${m.color}22` }}
                style={{
                  background: 'rgba(10,15,36,0.6)', border: '1px solid #1e293b',
                  borderRadius: 16, padding: '32px 24px', textAlign: 'center',
                  position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${m.color},transparent)` }} />
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: m.color, marginBottom: 8, fontFamily: 'monospace' }}>{m.value}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{m.label}</div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Model Classes Breakdown */}
        {actions.length > 0 && (
          <ScrollReveal>
            <div style={{
              background: 'rgba(10,15,36,0.6)', border: '1px solid #1e293b',
              borderRadius: 20, padding: 32, marginBottom: 60,
            }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: 24 }}>
                🎯 Loaded Model Classes
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                {[
                  { label: 'Alphabets', items: alphabets, color: '#3b82f6' },
                  { label: 'Numbers',   items: numbers,   color: '#22c55e' },
                  { label: 'Words',     items: words,     color: '#8b5cf6' },
                ].map(({ label, items, color }) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                      {label} ({items.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {items.map(a => (
                        <span key={a} style={{
                          background: `${color}15`, border: `1px solid ${color}30`,
                          borderRadius: 6, padding: '3px 10px',
                          fontSize: '0.8rem', fontWeight: 600, color,
                        }}>{a}</span>
                      ))}
                      {items.length === 0 && <span style={{ color: '#475569', fontSize: '0.8rem' }}>None loaded</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Tech Stack */}
        <ScrollReveal>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: 32 }}>
            🛠️ Tech Stack
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 60 }}>
            {techStack.map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.07}>
                <motion.div
                  whileHover={{ borderColor: `${t.color}50`, translateY: -6, boxShadow: `0 12px 30px ${t.color}15` }}
                  style={{
                    background: 'rgba(30,41,59,0.3)', backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 16, padding: 24, transition: 'all 0.3s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${t.color}20`, border: `1px solid ${t.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    }}>{t.icon}</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>{t.name}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>{t.desc}</div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        {/* Development Timeline */}
        <ScrollReveal>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: 32 }}>
            🗓️ Development Timeline
          </h2>
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: 20, top: 0, bottom: 0, width: 2,
              background: 'linear-gradient(180deg,#6366f1,#a855f7,#475569)',
              borderRadius: 2,
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 56 }}>
              {timeline.map((t, i) => (
                <ScrollReveal key={i} delay={i * 0.07}>
                  <motion.div
                    whileHover={{ translateX: 4 }}
                    style={{
                      background: 'rgba(10,15,36,0.6)', border: '1px solid #1e293b',
                      borderRadius: 14, padding: '18px 24px',
                      display: 'flex', alignItems: 'center', gap: 20,
                      position: 'relative', transition: 'all 0.3s',
                    }}
                  >
                    {/* Dot on timeline */}
                    <div style={{
                      position: 'absolute', left: -44, width: 14, height: 14, borderRadius: '50%',
                      background: t.status === 'done' ? '#22c55e' : t.status === 'progress' ? '#f59e0b' : '#475569',
                      border: '2px solid #020817',
                      boxShadow: t.status === 'done' ? '0 0 10px rgba(34,197,94,0.5)' : t.status === 'progress' ? '0 0 10px rgba(245,158,11,0.5)' : 'none',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem', marginBottom: 4 }}>{t.phase}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.825rem', lineHeight: 1.5 }}>{t.desc}</div>
                    </div>
                    <span style={{
                      flexShrink: 0, padding: '4px 14px', borderRadius: 100,
                      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: t.status === 'done' ? 'rgba(34,197,94,0.1)' : t.status === 'progress' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
                      color: t.status === 'done' ? '#22c55e' : t.status === 'progress' ? '#f59e0b' : '#94a3b8',
                      border: `1px solid ${t.status === 'done' ? 'rgba(34,197,94,0.2)' : t.status === 'progress' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'}`,
                    }}>
                      {t.status === 'done' ? '✓ Done' : t.status === 'progress' ? '⟳ In Progress' : '○ Planned'}
                    </span>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

      </div>
    </PageWrapper>
  );
}
