import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import ScrollReveal from '../components/ScrollReveal';
import WaveDivider from '../components/WaveDivider';

const stats = [
  { num: '63M+', label: 'Deaf & Mute People in India' },
  { num: '8.4M', label: 'ISL Users in India' },
  { num: '250', label: 'ISL Translators in India' },
];

const models = [
  { 
    version: 'Alphanet v1.2', name: 'Alphanet', 
    sub: 'Alphabets Only', status: 'soon', icon: '🔠',
    desc: 'Specialized for recognizing individual letters. Ideal for spelling names and addresses.'
  },
  { 
    version: 'Lexnet v2.0', name: 'Lexnet', 
    sub: 'Words Only', status: 'active', icon: '📝',
    desc: 'Optimized for 100+ everyday ISL words. Our most popular model for daily conversations.'
  },
  { 
    version: 'SignBridge Net', name: 'SignBridge Net', 
    sub: 'Alphabets + Words', status: 'soon', icon: '🧠',
    desc: 'The ultimate hybrid model combining alphabet precision with word fluidity.'
  },
];

const features = [
  { title: 'Lightning Fast', desc: 'Experience seamless translations at 30fps, optimized for modest hardware.', icon: '⚡' },
  { title: 'Privacy Native', desc: 'Complete on-device processing. We never see your video; it stays in your browser.', icon: '🛡️' },
  { title: 'Precision Trained', desc: 'Over 41,000 high-fidelity samples processed to ensure unmatched accuracy.', icon: '🎯' },
];

const useCases = [
  { title: 'Healthcare', desc: 'Breaking barriers in doctor-patient consultations and emergency services.', icon: '🏥' },
  { title: 'Education', desc: 'Empowering inclusive learning environments in schools and digital classrooms.', icon: '🎓' },
  { title: 'Public Services', desc: 'Improving accessibility in banks, transport hubs, and government offices.', icon: '🏛️' },
  { title: 'Social Integration', desc: 'Enabling effortless communication with family, friends, and the community.', icon: '🤝' },
];

const objectives = [
  { title: 'Inclusive Communication', desc: 'Creating a world where sign language is understood by everyone, instantly.', icon: '🤝' },
  { title: 'Digital Accessibility', desc: 'Providing world-class AI tools to the 63M+ hearing-impaired people in India.', icon: '📱' },
  { title: 'Language Preservation', desc: 'Documenting and digitizing the rich linguistic heritage of Indian Sign Language.', icon: '🏛️' },
  { title: 'AI for Social Good', desc: 'Using advanced neural networks to solve real-world accessibility challenges.', icon: '✨' },
];

export default function Home() {
  return (
    <PageWrapper>
      {/* 1. First Slide (Hero): Impactful entry */}
      <section className="section section-center" style={{ paddingTop: '180px', paddingBottom: '100px' }}>
        <div className="container section-center">
          <ScrollReveal>
            <div className="badge-green"><div className="badge-dot" />Empowering Silence</div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="section-title">Bridging the <span className="hero-gradient">Silence</span><br />Through AI <span className="hero-gradient">Precision</span></h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="section-sub">Experience the future of accessibility with SignBridge—the premier real-time Indian Sign Language translator built for a truly inclusive world.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div style={{ display: 'flex', gap: '20px', marginTop: '48px' }}>
              <Link to="/translate"><button className="btn-primary">Launch Live Translator</button></Link>
              <Link to="/learn"><button className="btn-secondary">Academy Guide</button></Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. Stat Cards: Immediate visual proof */}
      <section style={{ paddingBottom: '120px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', justifyContent: 'center' }}>
            {stats.map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="feature-card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '48px 24px' }}>
                  <div style={{ fontSize: '4.5rem', fontWeight: 900, background: 'linear-gradient(to bottom, #fff, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px' }}>{s.num}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{s.label}</h3>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SignBridge Models: Specialized neural engines */}
      <WaveDivider height={90} opacity1={0.12} opacity2={0.06}>
        <div style={{ background: 'rgba(15, 23, 42, 0.25)', padding: '120px 0' }}>
          <div className="container">
            <ScrollReveal><div className="section-center" style={{ marginBottom: '80px' }}><h2 className="section-title">Neural Engine Variants</h2><p className="section-sub">High-fidelity models optimized for specific linguistic contexts.</p></div></ScrollReveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px' }}>
              {models.map((m, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="feature-card" style={{ padding: '48px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', border: m.status === 'active' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid var(--border)' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '24px', filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))' }}>{m.icon}</div>
                    <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>{m.name}</h3>
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px' }}>{m.version} • {m.sub}</p>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, marginBottom: '40px', flex: 1 }}>{m.desc}</p>
                    <button className={m.status === 'active' ? "btn-primary" : "btn-secondary"} style={{ width: '100%', padding: '16px', fontSize: '1rem' }} disabled={m.status !== 'active'}>{m.status === 'active' ? 'Launch Engine' : 'Coming Soon'}</button>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </WaveDivider>

      {/* 4. Why Choose SignBridge: Detailed feature breakdown */}
      <section className="section">
        <div className="container">
          <ScrollReveal><div className="section-center" style={{ marginBottom: '80px' }}><h2 className="section-title">Why SignBridge?</h2><p className="section-sub">Combining high-speed neural processing with uncompromising privacy standards.</p></div></ScrollReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px' }}>
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="feature-card" style={{ padding: '48px' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '28px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '20px' }}>{f.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.8 }}>{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. About Indian Sign Language: Non-interactive detailed section */}
      <WaveDivider height={90} opacity1={0.12} opacity2={0.06}>
        <div style={{ background: 'rgba(15, 23, 42, 0.25)', padding: '140px 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '80px', alignItems: 'center' }}>
              <ScrollReveal>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '16px' }}>Linguistic Heritage</div>
                <h2 className="section-title" style={{ fontSize: '3.8rem', textAlign: 'left' }}>The Complexity of <span className="hero-gradient">ISL</span></h2>
                <div style={{ color: '#94a3b8', fontSize: '1.15rem', lineHeight: 1.8, margin: '32px 0', textAlign: 'left' }}>
                  <p>Indian Sign Language (ISL) is not a visual representation of spoken English or Hindi. It is a complete, natural language with its own sophisticated syntax, grammar, and regional dialects used by millions across the subcontinent.</p>
                  <p style={{ marginTop: '20px' }}>Unlike many Western sign languages, ISL utilizes both one-handed and two-handed signs, combined with intricate facial expressions (non-manual markers) that change the entire meaning of a sentence. Our AI models are specifically trained to respect these linguistic nuances.</p>
                </div>
                <div style={{ display: 'flex', gap: '24px', marginTop: '48px' }}>
                   <div style={{ borderLeft: '4px solid #8b5cf6', paddingLeft: '24px' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>26</div>
                      <div style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 800, textTransform: 'uppercase' }}>Unique Alphabets</div>
                   </div>
                   <div style={{ borderLeft: '4px solid #a855f7', paddingLeft: '24px' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>10,000+</div>
                      <div style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 800, textTransform: 'uppercase' }}>Core Signs</div>
                   </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                 <div style={{ position: 'relative' }}>
                   <div style={{ position: 'absolute', inset: '-20px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: -1 }} />
                   <div style={{ aspectRatio: '4/3', borderRadius: '48px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10rem', backdropFilter: 'blur(20px)' }}>🇮🇳</div>
                 </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </WaveDivider>

      {/* 6. Use Cases: Comprehensive grid */}
      <section className="section">
        <div className="container">
          <ScrollReveal><div className="section-center" style={{ marginBottom: '80px' }}><h2 className="section-title">Real-World Impact</h2><p className="section-sub">Deploying SignBridge technology across critical infrastructure and social sectors.</p></div></ScrollReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {useCases.map((u, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="feature-card" style={{ padding: '40px', borderBottom: '4px solid rgba(139, 92, 246, 0.2)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '24px' }}>{u.icon}</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '16px' }}>{u.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7 }}>{u.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Our Objectives: Clear pillar mission */}
      <WaveDivider height={90} opacity1={0.12} opacity2={0.06}>
        <div style={{ background: 'rgba(15, 23, 42, 0.25)', padding: '120px 0' }}>
          <div className="container">
            <ScrollReveal><div className="section-center" style={{ marginBottom: '80px' }}><h2 className="section-title">Our Objectives</h2><p className="section-sub">The four pillars of our mission to revolutionize communication.</p></div></ScrollReveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
              {objectives.map((obj, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="feature-card" style={{ padding: '48px', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '24px', opacity: 0.8 }}>{obj.icon}</div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>{obj.title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.8 }}>{obj.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </WaveDivider>

      {/* 8. Experience Div: High-glow gradient CTA */}
      <section className="section" style={{ paddingBottom: '160px' }}>
         <div className="container">
            <ScrollReveal>
              <div className="high-glow-section section-center">
                <h2 className="section-title" style={{ color: '#fff', fontSize: 'clamp(2.5rem, 8vw, 5rem)', marginBottom: '32px' }}>Experience SignBridge</h2>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.4rem', marginBottom: '56px', maxWidth: '800px', fontWeight: 500 }}>Join the movement towards a more accessible India. Start translating in real-time now.</p>
                <Link to="/translate"><button className="btn-primary" style={{ background: '#fff', color: '#000', padding: '24px 80px', fontSize: '1.3rem', borderRadius: '20px', fontWeight: 900, boxShadow: '0 20px 50px rgba(255,255,255,0.2)' }}>Launch Translator →</button></Link>
              </div>
            </ScrollReveal>
         </div>
      </section>
    </PageWrapper>
  );
}
