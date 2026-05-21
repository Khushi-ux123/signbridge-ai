import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const PAGES = [
  { label: 'Home', path: '/' },
  { label: 'Translate', path: '/translate' },
  { label: 'Library', path: '/library' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Learn', path: '/learn' },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        background: scrolled ? 'rgba(2, 8, 23, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
        padding: '0 48px', height: '80px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.4s ease',
      }}
    >
      {/* Brand */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc',
            letterSpacing: '-0.04em', cursor: 'pointer',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: '1.1rem',
            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.5)'
          }}>S</div>
          SignBridge
        </motion.div>
      </Link>

      {/* Nav Links (Centered) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '6px',
        borderRadius: '100px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        {PAGES.map(({ label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <motion.div
                style={{
                  padding: '10px 20px', borderRadius: '100px',
                  fontSize: '0.9rem', fontWeight: 600,
                  color: isActive ? '#fff' : '#94a3b8',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                }}
              >
                <span style={{ position: 'relative', zIndex: 2 }}>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-pill"
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '100px',
                      zIndex: 1
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* CTA Button */}
      <Link to="/translate" style={{ textDecoration: 'none' }}>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: '#fff', fontWeight: 700,
            padding: '12px 24px', borderRadius: '12px', fontSize: '0.9rem',
            cursor: 'pointer', border: 'none',
            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.3s',
          }}
        >
          Get Started
        </motion.button>
      </Link>
    </motion.nav>
  );
}
