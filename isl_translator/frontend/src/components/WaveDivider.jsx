import { motion } from 'framer-motion';

export default function WaveDivider({ children }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Top Wave */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, 
        height: '120px', zIndex: 10, pointerEvents: 'none',
        transform: 'translateY(-100%)'
      }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <motion.path
            initial={{ d: "M0,120 C240,120 480,0 720,0 C960,0 1200,120 1440,120 L1440,120 L0,120 Z" }}
            animate={{ 
              d: [
                "M0,120 C240,100 480,20 720,20 C960,20 1200,100 1440,120 L1440,120 L0,120 Z",
                "M0,120 C240,120 480,0 720,0 C960,0 1200,120 1440,120 L1440,120 L0,120 Z",
                "M0,120 C240,100 480,20 720,20 C960,20 1200,100 1440,120 L1440,120 L0,120 Z"
              ] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            fill="#030712"
            fillOpacity="1"
          />
          <motion.path
            initial={{ d: "M0,120 C240,80 480,40 720,40 C960,40 1200,80 1440,120 L1440,120 L0,120 Z" }}
            animate={{ 
              d: [
                "M0,120 C240,60 480,30 720,30 C960,30 1200,60 1440,120 L1440,120 L0,120 Z",
                "M0,120 C240,80 480,40 720,40 C960,40 1200,80 1440,120 L1440,120 L0,120 Z",
                "M0,120 C240,60 480,30 720,30 C960,30 1200,60 1440,120 L1440,120 L0,120 Z"
              ] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            fill="rgba(139, 92, 246, 0.08)"
          />
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* Bottom Wave */}
      <div style={{ 
        position: 'absolute', bottom: 0, left: 0, right: 0, 
        height: '120px', zIndex: 10, pointerEvents: 'none',
        transform: 'translateY(100%) rotate(180deg)'
      }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <motion.path
            initial={{ d: "M0,120 C240,120 480,0 720,0 C960,0 1200,120 1440,120 L1440,120 L0,120 Z" }}
            animate={{ 
              d: [
                "M0,120 C240,100 480,20 720,20 C960,20 1200,100 1440,120 L1440,120 L0,120 Z",
                "M0,120 C240,120 480,0 720,0 C960,0 1200,120 1440,120 L1440,120 L0,120 Z",
                "M0,120 C240,100 480,20 720,20 C960,20 1200,100 1440,120 L1440,120 L0,120 Z"
              ] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            fill="#030712"
            fillOpacity="1"
          />
          <motion.path
            initial={{ d: "M0,120 C240,80 480,40 720,40 C960,40 1200,80 1440,120 L1440,120 L0,120 Z" }}
            animate={{ 
              d: [
                "M0,120 C240,60 480,30 720,30 C960,30 1200,60 1440,120 L1440,120 L0,120 Z",
                "M0,120 C240,80 480,40 720,40 C960,40 1200,80 1440,120 L1440,120 L0,120 Z",
                "M0,120 C240,60 480,30 720,30 C960,30 1200,60 1440,120 L1440,120 L0,120 Z"
              ] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            fill="rgba(139, 92, 246, 0.08)"
          />
        </svg>
      </div>
    </div>
  );
}


