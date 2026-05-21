import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Translate from './pages/Translate';
import Library from './pages/Library';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/translate" element={<Translate />} />
        <Route path="/library" element={<Library />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/learn" element={<Learn />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ minHeight: '100vh' }}>
        <AnimatedRoutes />
      </main>
      <Footer />
    </Router>
  );
}

export default App;
