import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import PageWrapper from '../components/PageWrapper';
import ScrollReveal from '../components/ScrollReveal';

// Hand connection pairs for drawing skeleton
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17]
];

const CAPTURE_WIDTH = 640;
const CAPTURE_HEIGHT = 480;
const CAPTURE_ASPECT = `${CAPTURE_WIDTH} / ${CAPTURE_HEIGHT}`;

function drawLandmarks(ctx, landmarks, w, h) {
  if (!landmarks) return;

  // MediaPipe gives normalized coords in the ORIGINAL (unmirrored) frame.
  // The video element is CSS-mirrored (scaleX(-1)), so we must mirror x too.
  const px = (x) => (1 - x) * w;
  const py = (y) => y * h;

  const drawHand = (points, lineColor, dotColor) => {
    if (!points || points.length < 21) return;

    // Draw skeleton lines
    ctx.lineWidth = 2;
    ctx.strokeStyle = lineColor;
    HAND_CONNECTIONS.forEach(([a, b]) => {
      if (!points[a] || !points[b]) return;
      ctx.beginPath();
      ctx.moveTo(px(points[a][0]), py(points[a][1]));
      ctx.lineTo(px(points[b][0]), py(points[b][1]));
      ctx.stroke();
    });

    // Draw landmark dots
    points.forEach(([x, y], i) => {
      const isTip = [4, 8, 12, 16, 20].includes(i);
      ctx.beginPath();
      ctx.arc(px(x), py(y), isTip ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? dotColor : 'rgba(255,255,255,0.9)';
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  };

  drawHand(landmarks.right_hand, '#a855f7', '#e879f9');
  drawHand(landmarks.left_hand,  '#3b82f6', '#60a5fa');
  // NOTE: pose dots removed — they were appearing on face incorrectly
}

export default function Translate() {
  const [cameraOn, setCameraOn]             = useState(false);
  const [prediction, setPrediction]         = useState('');
  const [confidence, setConfidence]         = useState(0);
  const [sentence, setSentence]             = useState([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showSteps, setShowSteps]           = useState(true);
  const [wsStatus, setWsStatus]             = useState('disconnected');
  const [bufferProgress, setBufferProgress] = useState(0);
  const [statusMsg, setStatusMsg]           = useState('');

  const videoRef    = useRef(null);
  const captureRef  = useRef(null);   // hidden canvas for sending frames
  const overlayRef  = useRef(null);   // visible canvas for landmarks
  const wsRef       = useRef(null);
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (wsRef.current)        { wsRef.current.close(); wsRef.current = null; }
    if (streamRef.current)    { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current)     { videoRef.current.srcObject = null; }
    // Clear overlay
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d');
      ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    }
    setCameraOn(false);
    setPrediction('');
    setConfidence(0);
    setWsStatus('disconnected');
    setBufferProgress(0);
    setStatusMsg('');
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startSendingFrames = useCallback((ws) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const video   = videoRef.current;
      const capture = captureRef.current;
      if (!video || !capture || ws.readyState !== WebSocket.OPEN) return;
      if (!video.videoWidth) return;

      const ctx = capture.getContext('2d');
      capture.width  = CAPTURE_WIDTH;
      capture.height = CAPTURE_HEIGHT;
      // Send natural (unmirrored) frame — MediaPipe expects normal orientation
      ctx.drawImage(video, 0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);
      ws.send(capture.toDataURL('image/jpeg', 0.6));
    }, 100);
  }, []);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.error) return;

      if (typeof data.buffering === 'number' && data.buffer_needed) {
        setBufferProgress(Math.round((data.buffering / data.buffer_needed) * 100));
      }
      setPrediction(data.prediction || '');
      setConfidence(Math.round((data.confidence || 0) * 100));

      if (data.prediction && data.confidence > 0.7) {
        setSentence(prev => {
          const last = prev[prev.length - 1];
          if (last !== data.prediction) return [...prev.slice(-12), data.prediction];
          return prev;
        });
      }

      // Draw landmarks on overlay canvas
      const overlay = overlayRef.current;
      if (overlay && data.landmarks) {
        const ctx = overlay.getContext('2d');
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        drawLandmarks(ctx, data.landmarks, overlay.width, overlay.height);
      }
    } catch (e) { console.error('[ws] parse', e); }
  }, []);

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setShowSteps(false);
    setStatusMsg('Starting camera...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: CAPTURE_WIDTH },
          height: { ideal: CAPTURE_HEIGHT },
          aspectRatio: { ideal: CAPTURE_WIDTH / CAPTURE_HEIGHT },
          facingMode: 'user'
        }
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error('Video element not found');
      video.srcObject = stream;

      await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('Video timeout')), 10000);
        video.oncanplay = () => { clearTimeout(t); video.play().then(resolve).catch(reject); };
        video.onerror = reject;
      });

      setIsInitializing(false);
      setCameraOn(true);
      setStatusMsg('Connecting to AI...');

      const tryConnect = (url, fallback) => {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsStatus('connected');
          setStatusMsg('');
          ws.onmessage = handleMessage;
          startSendingFrames(ws);
        };
        ws.onerror = () => {
          if (fallback) tryConnect(fallback, null);
          else { setWsStatus('error'); setStatusMsg('❌ Cannot reach backend. Run: python server.py'); }
        };
        ws.onclose = () => { if (wsRef.current === ws) setWsStatus('disconnected'); };
      };

      tryConnect(`ws://${window.location.host}/ws`, 'ws://localhost:8000/ws');

    } catch (err) {
      setIsInitializing(false);
      setStatusMsg(`❌ ${err.message}`);
    }
  }, [handleMessage, startSendingFrames]);

  // Sync overlay canvas resolution with its rendered size
  useEffect(() => {
    if (!cameraOn) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const sync = () => {
      const rect = overlay.getBoundingClientRect();
      if (rect.width > 0) {
        overlay.width  = rect.width;
        overlay.height = rect.height;
      }
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(overlay);
    return () => ro.disconnect();
  }, [cameraOn]);

  const handleSpeak = () => {
    if (!sentence.length) return;
    const u = new SpeechSynthesisUtterance(sentence.join(' '));
    u.lang = 'en-IN';
    speechSynthesis.speak(u);
  };

  const steps = [
    { num: '01', title: 'Allow Camera',  desc: 'Grant permission to start the live stream.' },
    { num: '02', title: 'Position Self', desc: 'Ensure your hands are clearly visible in the frame.' },
    { num: '03', title: 'Sign Clearly',  desc: 'Perform ISL gestures at a steady pace.' },
    { num: '04', title: 'View Result',   desc: 'Watch the real-time translation appear below.' },
  ];

  const statusColor = { connected:'#22c55e', disconnected:'#94a3b8', error:'#ef4444' }[wsStatus];
  const statusLabel = { connected:'AI CONNECTED', disconnected:'DISCONNECTED', error:'ERROR' }[wsStatus];

  return (
    <PageWrapper>
      {/* Quick Start Overlay */}
      <AnimatePresence>
        {showSteps && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,zIndex:99999,background:'rgba(2,6,23,0.95)',
              backdropFilter:'blur(30px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
            <motion.div initial={{scale:0.95,opacity:0,y:30}} animate={{scale:1,opacity:1,y:0}}
              style={{maxWidth:700,width:'100%',background:'rgba(30,41,59,0.4)',
                border:'1px solid rgba(255,255,255,0.1)',borderRadius:40,padding:'56px 40px',
                textAlign:'center',boxShadow:'0 40px 100px -20px rgba(0,0,0,0.6)'}}>
              <div style={{width:60,height:60,borderRadius:18,background:'linear-gradient(135deg,#6366f1,#a855f7)',
                display:'flex',alignItems:'center',justifyContent:'center',
                margin:'0 auto 24px',fontSize:'1.5rem',color:'#fff',fontWeight:900}}>S</div>
              <h2 className="section-title" style={{fontSize:'2.5rem',marginBottom:12}}>
                Quick <span className="hero-gradient">Start Guide</span>
              </h2>
              <p style={{color:'#94a3b8',marginBottom:40,fontSize:'1.1rem'}}>
                Get ready to translate Indian Sign Language in seconds.
              </p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:32,marginBottom:48,textAlign:'left'}}>
                {steps.map((s,i) => (
                  <div key={i}>
                    <div style={{color:'#6366f1',fontWeight:800,fontSize:'0.8rem',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>Step {s.num}</div>
                    <h3 style={{color:'#fff',fontSize:'1.1rem',fontWeight:700,marginBottom:8}}>{s.title}</h3>
                    <p style={{color:'#94a3b8',fontSize:'0.85rem',lineHeight:1.5}}>{s.desc}</p>
                  </div>
                ))}
              </div>
              <button onClick={startCamera} className="btn-primary" style={{width:'100%'}}>
                Start Translating Now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="section section-center" style={{paddingTop:140,paddingBottom:40}}>
        <ScrollReveal>
          <div className="badge-green" style={{borderColor:`${statusColor}44`,color:statusColor,background:`${statusColor}11`}}>
            <div className="badge-dot" style={{background:statusColor}} />
            {statusLabel}
          </div>
          <h1 className="section-title">Live <span className="hero-gradient">Translator</span></h1>
          <p className="section-sub">Real-time Indian Sign Language detection powered by SignBridge AI.</p>
        </ScrollReveal>
      </section>

      {statusMsg && (
        <div style={{maxWidth:900,margin:'0 auto 24px',padding:'0 24px'}}>
          <div style={{background:wsStatus==='error'?'rgba(239,68,68,0.1)':'rgba(99,102,241,0.1)',
            border:`1px solid ${wsStatus==='error'?'rgba(239,68,68,0.3)':'rgba(99,102,241,0.3)'}`,
            borderRadius:12,padding:'14px 20px',
            color:wsStatus==='error'?'#ef4444':'#a5b4fc',fontSize:'0.9rem'}}>
            {statusMsg}
          </div>
        </div>
      )}

      {/* Main Layout: camera left + translator right */}
      <div className="container" style={{paddingBottom:120}}>
        <div style={{
          display:'grid',
          gridTemplateColumns:'1fr 380px',
          gap:24,
          alignItems:'start',
        }}>

          {/* ── LEFT: Camera ── */}
          <div style={{background:'rgba(15,23,42,0.4)',backdropFilter:'blur(40px)',
            borderRadius:28,border:'1px solid rgba(255,255,255,0.08)',
            overflow:'hidden',boxShadow:'0 24px 60px -20px rgba(0,0,0,0.5)'}}>

            {/* Video area */}
            <div style={{position:'relative',aspectRatio:'4/3',background:'#000'}}>

              <video ref={videoRef}
                style={{position:'absolute',inset:0,width:'100%',height:'100%',
                  objectFit:'cover',transform:'scaleX(-1)',opacity:cameraOn?1:0}}
                playsInline muted />
              <canvas ref={captureRef} style={{display:'none'}} />
              <canvas ref={overlayRef}
                style={{position:'absolute',inset:0,width:'100%',height:'100%',
                  pointerEvents:'none',zIndex:5,opacity:cameraOn?1:0}} />

              {/* LIVE badge */}
              {cameraOn && wsStatus==='connected' && (
                <div style={{position:'absolute',top:16,left:16,zIndex:10}}>
                  <div style={{background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',
                    padding:'6px 14px',borderRadius:100,border:'1px solid rgba(255,255,255,0.1)',
                    display:'flex',alignItems:'center',gap:8,
                    color:'#22c55e',fontSize:'0.75rem',fontWeight:800}}>
                    <div className="badge-dot" /> LIVE
                  </div>
                </div>
              )}

              {/* Idle */}
              {!cameraOn && !isInitializing && (
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',
                  justifyContent:'center',flexDirection:'column',zIndex:5}}>
                  <div style={{fontSize:'4rem',marginBottom:24,opacity:0.4}}>📸</div>
                  <button onClick={startCamera} className="btn-primary" style={{fontSize:'0.85rem',padding:'10px 20px'}}>
                    Enable Camera
                  </button>
                </div>
              )}

              {/* Initializing */}
              {isInitializing && (
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',
                  justifyContent:'center',flexDirection:'column',zIndex:5}}>
                  <div style={{width:44,height:44,border:'4px solid rgba(139,92,246,0.1)',
                    borderTopColor:'#8b5cf6',borderRadius:'50%',
                    animation:'spin 1s linear infinite',marginBottom:20}} />
                  <p style={{color:'#94a3b8',fontWeight:600,fontSize:'0.9rem'}}>Initializing…</p>
                </div>
              )}

              {/* End session */}
              {cameraOn && (
                <button onClick={stopCamera} style={{position:'absolute',top:16,right:16,
                  background:'rgba(239,68,68,0.15)',color:'#ef4444',
                  border:'1px solid rgba(239,68,68,0.3)',padding:'8px 16px',
                  borderRadius:10,fontSize:'0.8rem',fontWeight:700,cursor:'pointer',zIndex:10}}>
                  ✕ End
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT: Translator Panel ── */}
          <div style={{display:'flex',flexDirection:'column',gap:16}}>

            {/* Current prediction */}
            <div style={{background:'rgba(15,23,42,0.6)',backdropFilter:'blur(20px)',
              borderRadius:20,border:'1px solid rgba(255,255,255,0.08)',padding:24,
              minHeight:160,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              textAlign:'center'}}>
              <div style={{fontSize:'0.7rem',fontWeight:800,color:'#64748b',
                textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12}}>
                Current Sign
              </div>
              <AnimatePresence mode="wait">
                {prediction ? (
                  <motion.div key={prediction}
                    initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.8,opacity:0}}>
                    <div style={{fontSize:'3.5rem',fontWeight:900,color:'#fff',lineHeight:1}}>{prediction}</div>
                    <div style={{color:'#8b5cf6',fontSize:'0.8rem',fontWeight:700,marginTop:8}}>
                      {confidence}% confidence
                    </div>
                    <div style={{marginTop:10,height:3,background:'rgba(255,255,255,0.08)',borderRadius:2,width:120,margin:'10px auto 0'}}>
                      <div style={{height:'100%',width:`${confidence}%`,
                        background:confidence>80?'#22c55e':'#8b5cf6',borderRadius:2,transition:'width 0.3s'}} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}}>
                    <div style={{fontSize:'2.5rem',marginBottom:8,opacity:0.3}}>🤟</div>
                    <div style={{color:'#334155',fontSize:'0.9rem'}}>
                      {cameraOn ? 'Show a hand sign…' : 'Start camera to begin'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Transcription */}
            <div style={{background:'rgba(15,23,42,0.6)',backdropFilter:'blur(20px)',
              borderRadius:20,border:'1px solid rgba(255,255,255,0.08)',padding:24,flex:1}}>
              <div style={{fontSize:'0.7rem',fontWeight:800,color:'#64748b',
                textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12}}>
                Transcription
              </div>
              <div style={{minHeight:100,fontSize:'1.4rem',fontWeight:700,
                color:sentence.length>0?'#fff':'#334155',lineHeight:1.5,marginBottom:16}}>
                {sentence.length>0 ? sentence.join(' ') : 'Signs will appear here…'}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={handleSpeak} disabled={!sentence.length}
                  className="btn-secondary"
                  style={{flex:1,padding:'8px 12px',fontSize:'0.8rem',opacity:sentence.length?1:0.4}}>
                  🔊 Speak
                </button>
                <button onClick={()=>setSentence([])} disabled={!sentence.length}
                  className="btn-secondary"
                  style={{flex:1,padding:'8px 12px',fontSize:'0.8rem',opacity:sentence.length?1:0.4}}>
                  🗑 Clear
                </button>
              </div>
            </div>

            {/* Status */}
            <div style={{background:'rgba(15,23,42,0.4)',borderRadius:14,
              border:'1px solid rgba(255,255,255,0.05)',padding:'12px 16px',
              display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:statusColor,
                boxShadow:`0 0 8px ${statusColor}`}} />
              <span style={{fontSize:'0.78rem',fontWeight:600,color:statusColor}}>{statusLabel}</span>
              {!cameraOn && (
                <button onClick={startCamera} className="btn-primary"
                  style={{marginLeft:'auto',padding:'6px 16px',fontSize:'0.78rem'}}>
                  Start →
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
