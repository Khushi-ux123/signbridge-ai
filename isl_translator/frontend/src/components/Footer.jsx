import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      position: 'relative', overflow: 'hidden',
      padding: '80px 48px 32px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      background: '#020617', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '3fr 2fr 2fr 3fr',
        gap: '40px', maxWidth: '1280px', margin: '0 auto',
        position: 'relative', zIndex: 10,
      }}>
        {/* Brand Column */}
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(to bottom right, #3b82f6, #9333ea)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: '1.25rem',
            }}>S</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em', color: '#f8fafc' }}>SignBridge</div>
          </Link>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '24px', fontWeight: 500 }}>
            Breaking communication barriers with advanced, privacy-first Indian Sign Language AI. Processing happens 100% on your device—making the world accessible, securely.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['📷', '💼', '🐙'].map((icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.1, backgroundColor: '#3b82f6', color: '#fff', borderColor: 'transparent' }}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8', transition: 'all 0.3s', textDecoration: 'none', fontSize: '1.1rem',
                }}
              >{icon}</motion.a>
            ))}
          </div>
        </div>

        {/* Product Column */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
            ⚡ Product
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Live Translator (Sign to Text)', to: '/translate' },
              { label: 'Text to Sign AI', to: '#' },
              { label: 'ISL Dictionary', to: '/library' },
              { label: 'Research Models', to: '/dashboard' },
              { label: 'How it Works', to: '/learn' },
            ].map((item, i) => (
              <li key={i}>
                <Link to={item.to} style={{
                  color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'color 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#94a3b8'}
                >{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
            Company
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {['About Us', 'Blog & Updates', 'Project Gallery', 'Pricing & Services'].map((item, i) => (
              <li key={i}>
                <a href="#" style={{
                  color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#94a3b8'}
                >{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Stay Updated Column */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
            Stay Updated
          </div>
          <div style={{
            background: 'rgba(30,41,59,0.3)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px',
            padding: '20px', marginBottom: '24px',
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '12px', fontWeight: 500 }}>
              Join our newsletter for AI updates & beta access.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Enter email address"
                style={{
                  flex: 1, background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                  padding: '10px 12px', color: '#fff', fontSize: '0.875rem', outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <motion.button
                whileHover={{ backgroundColor: '#2563eb' }}
                style={{
                  background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '0 16px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem',
                }}
              >→</motion.button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✉️</div>
              khushi905sharma@gmail.com
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>📍</div>
              Mumbai, Maharashtra, India
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div style={{
        marginTop: '64px', paddingTop: '32px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
          © 2026 SignBridge AI. Built with ❤️ by Team VNRR.
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Terms of Service', '🛡️ Privacy Policy', 'Cookies Policy'].map((item, i) => (
            <a key={i} href="#" style={{
              color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = '#3b82f6'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}
            >{item}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
