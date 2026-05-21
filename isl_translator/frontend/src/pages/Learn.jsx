import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import ScrollReveal from '../components/ScrollReveal';

// ── Module definitions ────────────────────────────────────────────────────────
const modules = [
  {
    id: 'alphabets',
    title: 'ISL Alphabet',
    desc: 'Learn all 26 hand shapes used in Indian Sign Language fingerspelling',
    icon: '🔤',
    difficulty: 'Beginner',
    category: 'Alphabets',
    signs: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
  },
  {
    id: 'numbers',
    title: 'Numbers 0–9',
    desc: 'Count from 0 to 9 in Indian Sign Language',
    icon: '🔢',
    difficulty: 'Beginner',
    category: 'Number',
    signs: ['0','1','2','3','4','5','6','7','8','9'],
  },
  {
    id: 'greetings',
    title: 'Basic Greetings',
    desc: 'Namaste, Good Morning, Thanks, Sorry and more',
    icon: '👋',
    difficulty: 'Beginner',
    category: 'BasicWords',
    signs: ['Namsaste','Morning','Afternoon','Evening','Night','Good','Thanks','Sorry','Please'],
  },
  {
    id: 'days',
    title: 'Days of the Week',
    desc: 'Monday through Sunday in ISL',
    icon: '📅',
    difficulty: 'Beginner',
    category: 'BasicWords',
    signs: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  },
  {
    id: 'words',
    title: 'Common Words',
    desc: 'Beautiful, Home, Child, Married and everyday vocabulary',
    icon: '💬',
    difficulty: 'Intermediate',
    category: 'BasicWords',
    signs: ['Beautiful','Home','Child','Merried'],
  },
];

const steps = [
  { step: '01', title: 'Camera Access',    desc: 'Your browser camera captures video frames in real-time', icon: '📷' },
  { step: '02', title: 'Hand Detection',   desc: 'MediaPipe extracts 21 keypoints per hand for precise tracking', icon: '🖐️' },
  { step: '03', title: 'CNN Inference',    desc: 'MobileNetV2 classifies the sign from a single frame', icon: '🧠' },
  { step: '04', title: 'Landmark Overlay', desc: 'Hand skeleton drawn live on canvas over the camera feed', icon: '📊' },
  { step: '05', title: 'Text Output',      desc: 'Recognized sign shown with confidence score and spoken aloud', icon: '💬' },
];

const difficultyColors = {
  Beginner:     { bg: 'rgba(34,197,94,0.1)',   color: '#22c55e' },
  Intermediate: { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  Advanced:     { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
};

// ── Lesson Modal ──────────────────────────────────────────────────────────────
function LessonModal({ module, onClose, imageMap }) {
  const [current, setCurrent]       = useState(0);
  const [mode, setMode]             = useState('learn');
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [score, setScore]           = useState(0);
  const [quizDone, setQuizDone]     = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);

  const signs = module.signs;
  const sign  = signs[current];

  // Use image from API map, fallback to first available
  const imgUrl = imageMap[sign] || `/isl-images/${module.category}/${sign}/10.jpg`;

  // Generate quiz options
  useEffect(() => {
    if (mode === 'quiz') {
      const wrong = signs.filter(s => s !== sign).sort(() => Math.random() - 0.5).slice(0, 3);
      const opts  = [...wrong, sign].sort(() => Math.random() - 0.5);
      setQuizOptions(opts);
      setQuizAnswer(null);
    }
  }, [current, mode]);

  const next = () => {
    if (current < signs.length - 1) {
      setCurrent(c => c + 1);
      setQuizAnswer(null);
    } else {
      setQuizDone(true);
    }
  };

  const handleQuizAnswer = (ans) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(ans);
    if (ans === sign) setScore(s => s + 1);
    setTimeout(next, 1000);
  };

  const restart = () => {
    setCurrent(0); setScore(0); setQuizDone(false); setQuizAnswer(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: 600,
          background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 32, overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{module.icon} {module.title}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
              {current + 1} / {signs.length} signs
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => { setMode('learn'); restart(); }}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: mode === 'learn' ? 'rgba(99,102,241,0.2)' : 'transparent', color: mode === 'learn' ? '#a5b4fc' : '#94a3b8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              📖 Learn
            </button>
            <button
              onClick={() => { setMode('quiz'); restart(); }}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: mode === 'quiz' ? 'rgba(168,85,247,0.2)' : 'transparent', color: mode === 'quiz' ? '#c084fc' : '#94a3b8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              🎯 Quiz
            </button>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            animate={{ width: `${((current + 1) / signs.length) * 100}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#a855f7)', borderRadius: 2 }}
          />
        </div>

        {/* Content */}
        {quizDone ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>{score === signs.length ? '🏆' : score > signs.length / 2 ? '🎉' : '📚'}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              {score} / {signs.length}
            </div>
            <div style={{ color: '#94a3b8', marginBottom: 32 }}>
              {score === signs.length ? 'Perfect score! You mastered this module!' : score > signs.length / 2 ? 'Great job! Keep practicing!' : 'Keep learning — you\'ll get there!'}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={restart} className="btn-primary">Try Again</button>
              <button onClick={onClose} className="btn-secondary" style={{ padding: '10px 24px' }}>Close</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 32 }}>
            <AnimatePresence mode="wait">
              <motion.div key={current}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Sign image */}
                <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, background: '#000', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={imgUrl}
                    alt={sign}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', color: '#475569' }}>
                    <div style={{ fontSize: '4rem' }}>🤟</div>
                    <div style={{ fontSize: '0.9rem', marginTop: 8 }}>Image not available</div>
                  </div>
                </div>

                {mode === 'learn' ? (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>{sign}</div>
                      <div style={{ fontSize: '0.85rem', color: '#8b5cf6' }}>
                        {module.category === 'Alphabets' && `Letter "${sign}" in ISL`}
                        {module.category === 'Number' && `Number "${sign}" in ISL`}
                        {module.category === 'BasicWords' && `"${sign}" in ISL`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => current > 0 && setCurrent(c => c - 1)}
                        disabled={current === 0}
                        className="btn-secondary"
                        style={{ flex: 1, padding: '12px', opacity: current === 0 ? 0.4 : 1 }}>
                        ← Previous
                      </button>
                      <button onClick={next} className="btn-primary" style={{ flex: 2, padding: '12px' }}>
                        {current === signs.length - 1 ? '✓ Finish' : 'Next →'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8' }}>Which sign is this?</div>
                      {mode === 'quiz' && <div style={{ fontSize: '0.8rem', color: '#6366f1', marginTop: 4 }}>Score: {score}</div>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {quizOptions.map(opt => {
                        let bg = 'rgba(30,41,59,0.4)';
                        let border = 'rgba(255,255,255,0.08)';
                        let color = '#f8fafc';
                        if (quizAnswer !== null) {
                          if (opt === sign) { bg = 'rgba(34,197,94,0.15)'; border = 'rgba(34,197,94,0.4)'; color = '#22c55e'; }
                          else if (opt === quizAnswer) { bg = 'rgba(239,68,68,0.15)'; border = 'rgba(239,68,68,0.4)'; color = '#ef4444'; }
                        }
                        return (
                          <button key={opt} onClick={() => handleQuizAnswer(opt)}
                            style={{
                              padding: '14px', borderRadius: 12, border: `1px solid ${border}`,
                              background: bg, color, fontSize: '1.1rem', fontWeight: 700,
                              cursor: quizAnswer ? 'default' : 'pointer', transition: 'all 0.2s',
                            }}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main Learn Page ───────────────────────────────────────────────────────────
export default function Learn() {
  const [activeStep, setActiveStep]     = useState(0);
  const [activeModule, setActiveModule] = useState(null);
  const [imageMap, setImageMap]         = useState({});

  // Fetch real image paths from API
  useEffect(() => {
    fetch('/api/library')
      .then(r => r.json())
      .then(data => {
        const map = {};
        (data.signs || []).forEach(s => { map[s.name] = s.image; });
        setImageMap(map);
      })
      .catch(() => {});
  }, []);

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="section section-center" style={{ paddingTop: 140, paddingBottom: 40 }}>
        <ScrollReveal>
          <h1 className="section-title">
            SignBridge <span className="hero-gradient">Academy</span>
          </h1>
          <p className="section-sub">
            Interactive learning paths to master ISL vocabulary — with real images and built-in quizzes.
          </p>
        </ScrollReveal>
      </section>

      <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.3),transparent)', margin: '0 48px 60px' }} />

      {/* How It Works */}
      <div className="container" style={{ marginBottom: 80 }}>
        <ScrollReveal>
          <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 40, textAlign: 'center' }}>
            How It <span className="hero-gradient">Works</span>
          </h2>
        </ScrollReveal>
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Step list */}
          <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {steps.map((s, i) => (
              <motion.div key={i} onClick={() => setActiveStep(i)}
                animate={{
                  borderColor: activeStep === i ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.05)',
                  background: activeStep === i ? 'rgba(139,92,246,0.06)' : 'transparent',
                }}
                style={{ padding: '16px 20px', borderRadius: 14, border: '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: activeStep === i ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 900, color: '#fff',
                }}>{s.step}</div>
                <div style={{ fontWeight: 700, color: activeStep === i ? '#fff' : '#64748b' }}>{s.title}</div>
              </motion.div>
            ))}
          </div>

          {/* Step detail */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeStep}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{
                  background: 'rgba(30,41,59,0.3)', backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 48,
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: 24 }}>{steps[activeStep].icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Step {steps[activeStep].step}
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: 16 }}>{steps[activeStep].title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7 }}>{steps[activeStep].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.3),transparent)', margin: '0 48px 60px' }} />

      {/* Learning Modules */}
      <div className="container" style={{ paddingBottom: 120 }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: 12 }}>
              Learning <span className="hero-gradient">Modules</span>
            </h2>
            <p style={{ color: '#94a3b8' }}>Click "Start Now" to open an interactive lesson with real ISL images and a quiz</p>
          </div>
        </ScrollReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 24 }}>
          {modules.map((m, i) => (
            <ScrollReveal key={m.id} delay={i * 0.07}>
              <motion.div
                whileHover={{ borderColor: 'rgba(139,92,246,0.35)', translateY: -6, boxShadow: '0 16px 40px rgba(139,92,246,0.12)' }}
                style={{
                  background: 'rgba(30,41,59,0.3)', backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20,
                  padding: 28, display: 'flex', flexDirection: 'column',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: '2.5rem' }}>{m.icon}</div>
                  <span style={{
                    padding: '5px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 800,
                    background: difficultyColors[m.difficulty].bg,
                    color: difficultyColors[m.difficulty].color,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{m.difficulty}</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: 10 }}>{m.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, flex: 1, marginBottom: 24 }}>{m.desc}</p>

                {/* Signs preview */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {m.signs.slice(0, 8).map(s => (
                    <span key={s} style={{
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600,
                    }}>{s}</span>
                  ))}
                  {m.signs.length > 8 && (
                    <span style={{ fontSize: '0.75rem', color: '#475569', padding: '2px 8px' }}>+{m.signs.length - 8} more</span>
                  )}
                </div>

                <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                    {m.signs.length} Signs
                  </span>
                  <button
                    onClick={() => setActiveModule(m)}
                    className="btn-primary"
                    style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                  >
                    Start Now →
                  </button>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Lesson Modal */}
      <AnimatePresence>
        {activeModule && (
          <LessonModal module={activeModule} onClose={() => setActiveModule(null)} imageMap={imageMap} />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
