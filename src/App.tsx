import React, { Component, useState, useEffect, useRef } from 'react';
import { 
  Film, 
  Search, 
  Download, 
  ShieldCheck, 
  Loader2, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink, 
  ChevronRight, 
  Clock, 
  ArrowLeft, 
  FileVideo, 
  Sparkles, 
  Server, 
  CheckCircle2, 
  Database, 
  Cpu,
  Tv,
  Eye,
  Calendar,
  Layers,
  HardDrive,
  Check,
  Info,
  Key,
  DatabaseZap,
  RefreshCw,
  Sliders,
  AlertCircle,
  Pencil,
  BarChart3,
  TrendingUp,
  Share2,
  Send,
  MessageSquare,
  Smartphone,
  User,
  Lock,
  LogIn,
  LogOut
} from 'lucide-react';
import { CinemoodDB, MovieLink } from './db';

// Simple Alert Component for in-app floating notifications
interface Notification {
  message: string;
  type: 'success' | 'info' | 'error';
  id: string;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  public state: { hasError: boolean, error: Error | null };
  public props: { children: React.ReactNode };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="bg-neutral-900 border border-red-500/20 rounded-xl p-8 max-w-md w-full space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-400" />
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
            <h1 className="text-lg font-black font-semibold uppercase tracking-wider text-rose-400">System Gateway Exception</h1>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              An unexpected rendering thread error was intercepted by the diagnostic interface.
            </p>
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 text-left max-h-40 overflow-y-auto">
              <pre className="text-[10px] text-rose-300 font-mono whitespace-pre-wrap">{this.state.error?.message || this.state.error?.toString()}</pre>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.hash = '#/';
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-400 text-neutral-955 font-bold text-xs uppercase tracking-wider transition duration-350 cursor-pointer"
            >
              Reset Database & Re-Initialize
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  // --- Routing & Navigation State ---
  // Supported hashes: '#/', '#/admin', '#/admin/create', '#/<custom-slug>'
  const [currentHash, setCurrentHash] = useState<string>(window.location.hash || '#/');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // --- Auth & Admin Session State ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('isAdminLoggedIn') === 'true');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- Database & Catalog State ---
  const [moviesList, setMoviesList] = useState<MovieLink[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieLink | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gatewayInput, setGatewayInput] = useState('');

  // --- Notification System ---
  const [notifications, setNotifications] = useState<Notification[]>([]);


  // --- Countdown & Verification Engine States ---
  const [countdown, setCountdown] = useState<number>(10);
  const [timerStage, setTimerStage] = useState<'idle' | 'counting' | 'ready' | 'verifying' | 'unlocked'>('idle');
  const [verificationProgress, setVerificationProgress] = useState<number>(0);
  const [verificationNodes, setVerificationNodes] = useState<string[]>([]);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activePolicyModal, setActivePolicyModal] = useState<'privacy' | 'dmca' | 'contact' | null>(null);
  const [heroParticles] = useState(() => 
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 1.5,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5
    }))
  );
  const countdownIntervalRef = useRef<NodeJS.Timeout|null>(null);
  const verificationTimeoutRef = useRef<NodeJS.Timeout|null>(null);

  // Trigger floating notifications
  const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Listen to Window Routing changes to manage Single-Page Routes (Hash & Pathnames)
  useEffect(() => {
    const handleNavigation = () => {
      let hash = window.location.hash || '#/';
      
      // Check absolute pathname first for standard /[slug] dynamic format
      const pathname = window.location.pathname;
      const cleanPath = pathname.replace(/^\//, '').trim();
      
      // Handle the requested route overrides directly
      if (cleanPath === 'admin') {
        window.location.hash = '#/admin';
        hash = '#/admin';
      } else if (cleanPath === 'create' || cleanPath === 'admin/create') {
        window.location.hash = '#/admin/create';
        hash = '#/admin/create';
      } else if (cleanPath === 'manage-links') {
        window.location.hash = '#/admin';
        hash = '#/admin';
      } else if (hash === '#/create' || hash === '#/manage-links') {
        // Support hash variants of the requested routes as well
        window.location.hash = hash === '#/create' ? '#/admin/create' : '#/admin';
        hash = hash === '#/create' ? '#/admin/create' : '#/admin';
      }

      setCurrentHash(hash);
      
      let candidateSlug: string | null = null;
      
      if (cleanPath && cleanPath !== 'index.html' && cleanPath !== 'index.css' && cleanPath !== '/' && cleanPath !== 'admin' && cleanPath !== 'create' && cleanPath !== 'manage-links') {
        candidateSlug = cleanPath;
      } else if (hash && hash !== '#/' && hash !== '#/admin' && hash !== '#/admin/create' && hash !== '#/create' && hash !== '#/manage-links') {
        candidateSlug = hash.replace(/^#\//, '').replace(/^movie\//, '');
      }

      if (candidateSlug) {
        setActiveSlug(candidateSlug);
      } else {
        setActiveSlug(null);
        setSelectedMovie(null);
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    
    // Trigger initially
    handleNavigation();

    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  // Fetch movies catalog and synchronize admin session from localStorage
  const fetchMoviesAndSession = async () => {
    setLoading(true);
    // 1. Sync session state with localStorage
    const localSess = localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsLoggedIn(localSess);

    try {
      // 2. Fetch movies list
      const items = await CinemoodDB.getAllMovies();
      setMoviesList(items);
    } catch (err) {
      console.error('Failed to load movie items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const items = await CinemoodDB.getAllMovies();
      setMoviesList(items);
    } catch (err) {
      console.error('Failed to load movie items:', err);
    }
  };

  useEffect(() => {
    fetchMoviesAndSession();
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);



  // Load a movie details view once a slug matches
  useEffect(() => {
    const resolveMovie = async () => {
      if (activeSlug) {
        setLoading(true);
        try {
          const matched = await CinemoodDB.getMovieBySlug(activeSlug);
          if (matched) {
            setSelectedMovie(matched);
            // Increment views on load
            await CinemoodDB.incrementViews(matched.id);
            // Refresh main statistics silently
            fetchMovies();
            
            // Auto start the secure link verification countdown
            resetCountdownTimer();
            startCountdownTimer();
          } else {
            setSelectedMovie(null);
          }
        } catch (e) {
          console.error(e);
          setSelectedMovie(null);
        } finally {
          setLoading(false);
        }
      }
    };

    resolveMovie();
  }, [activeSlug]);

  // Dynamically configure Meta Headers, Page Titles, and SEO Tags for Shareability and Indexing
  useEffect(() => {
    if (selectedMovie) {
      const titleStr = selectedMovie.title || "Untitled File";
      const yearStr = selectedMovie.is_kara_special ? "" : (selectedMovie.year || "");
      const sizeStr = selectedMovie.is_kara_special ? "" : (selectedMovie.size_gb || "");
      const qualityStr = selectedMovie.is_kara_special ? "" : (selectedMovie.quality || "");
      const posterStr = selectedMovie.poster_url || "";

      if (selectedMovie.is_kara_special) {
        document.title = `${titleStr} - Secure Download Portal`;
      } else {
        document.title = `${titleStr} ${yearStr ? `(${yearStr})` : ""} Premium Direct Download - Cinemood Drive`;
      }
      
      const updateMetaTag = (attributeName: string, attributeValue: string, contentValue: string) => {
        let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attributeName, attributeValue);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', contentValue);
      };

      if (selectedMovie.is_kara_special) {
        updateMetaTag('name', 'description', `Secure multi-threaded high-speed gateway connection to fetch "${titleStr}". Bypass transit checks.`);
      } else {
        updateMetaTag('name', 'description', `Instant high speed secure decrypted direct bypass fetch for ${titleStr} ${yearStr ? `(${yearStr})` : ""}. Size: ${sizeStr}, Video: ${qualityStr}.`);
      }
      updateMetaTag('property', 'og:title', `${titleStr} Premium Direct Stream - Cinemood`);
      updateMetaTag('property', 'og:description', `Unlock safe decrypted cloud storage nodes and direct multi-threaded streams for ${titleStr}.`);
      updateMetaTag('property', 'og:image', posterStr);
      updateMetaTag('property', 'og:url', window.location.href);
      updateMetaTag('name', 'twitter:card', 'summary_large_image');
    } else {
      document.title = 'Cinemood Drive - Premium Direct Cinematic Link Portal & Magnet Generator';
    }
  }, [selectedMovie]);

  // Dynamically load Monetag Popunder script on public slug pages only, once per session
  useEffect(() => {
    if (activeSlug && !sessionStorage.getItem('monetag_popunder_loaded')) {
      try {
        const s = document.createElement('script');
        s.dataset.zone = '11069724';
        s.src = 'https://al5sm.com/tag.min.js';
        s.async = true;
        const target = [document.documentElement, document.body].filter(Boolean).pop();
        if (target) {
          target.appendChild(s);
          sessionStorage.setItem('monetag_popunder_loaded', 'true');
          console.log('Monetag popunder initialized silently in background.');
        }
      } catch (err) {
        console.error('Failed to load Monetag popunder:', err);
      }
    }
  }, [activeSlug]);

  // --- Admin Login & Session Authenticator Handlers ---
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const correctEmail = 'aljihadhasan220@gmail.com';
      const correctPassword = '45684522';

      if (loginEmail.trim().toLowerCase() === correctEmail && loginPassword === correctPassword) {
        setIsLoggedIn(true);
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('cinemood_admin_token', 'local-admin-secure-token-bypass-55923984234');
        setShowLoginModal(false);
        setLoginEmail('');
        setLoginPassword('');
        notify('Security handshake validated! Access granted.', 'success');
        
        // Reload movies with newly authorized context
        fetchMovies();
        
        // After login: Redirect to admin dashboard.
        window.location.hash = '#/admin';
      } else {
        notify('Invalid administrative credentials. Access denied.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('Security login gateway is temporarily inaccessible.', 'error');
    }
  };

  const handleAdminLogout = async () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('cinemood_admin_token');
    notify('Safe shutdown logged. Session terminated.', 'info');
    window.location.hash = '#/';
  };

  // Copy URL action helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notify('Link copied to clipboard! Share it with audience.', 'success');
  };

  // --- Countdown Timer Logic ---
  const startCountdownTimer = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setTimerStage('counting');
    setTimerActive(true);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          setTimerStage('ready');
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetCountdownTimer = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
    setCountdown(10);
    setTimerStage('idle');
    setTimerActive(false);
    setVerificationProgress(0);
    setVerificationNodes([]);
  };

  // --- Immersive P2P Key Verification Animation Steps ---
  const startSecureVerification = () => {
    setTimerStage('verifying');
    setVerificationProgress(0);
    setVerificationNodes(['[INIT] Initiating security bypass sequence...']);

    // Step-by-step console simulation logs conforming to user requirements
    const steps = [
      { prg: 25, node: 'Generating Secure Access...' },
      { prg: 50, node: 'Scanning File Integrity...' },
      { prg: 75, node: 'Checking Human Verification...' },
      { prg: 100, node: 'Unlocking Download Access...' }
    ];

    let currentStepIndex = 0;

    const runVerificationInterval = () => {
      if (currentStepIndex < steps.length) {
        const next = steps[currentStepIndex];
        verificationTimeoutRef.current = setTimeout(() => {
          setVerificationProgress(next.prg);
          setVerificationNodes((prev) => [...prev, `[${next.prg}%] ${next.node}`]);
          currentStepIndex++;
          runVerificationInterval();
        }, 1100);
      } else {
        // Complete
        setTimerStage('unlocked');
        notify('Decryption protocol finalized! Targeted link successfully unlocked.', 'success');
        
        // Count dynamic analytics downloads metric automatically when unlocked
        if (selectedMovie) {
          CinemoodDB.incrementDownloads(selectedMovie.id);
          fetchMovies();
        }
      }
    };

    runVerificationInterval();
  };

  // Build generated absolute link to preview
  const getShareableUrl = (slug: string) => {
    const defaultUrl = window.location.origin + window.location.pathname;
    return `${defaultUrl}#/${slug}`;
  };

  const shareOnTwitter = (title: string, slug: string) => {
    const url = getShareableUrl(slug);
    const text = `Get premium high-speed access to "${title}" on Cinemood Drive:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnTelegram = (title: string, slug: string) => {
    const url = getShareableUrl(slug);
    const text = `High-speed download link for "${title}" on Cinemood Drive:`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnWhatsApp = (title: string, slug: string) => {
    const url = getShareableUrl(slug);
    const text = `Stream & download "${title}" bypassed on Cinemood Drive: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Search filter
  const filteredMovies = moviesList.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-neutral-900 overflow-x-hidden relative">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(6,182,212,0.3); border-color: rgba(6,182,212,0.3); }
          50% { box-shadow: 0 0 20px rgba(6,182,212,0.6); border-color: rgba(6,182,212,0.5); }
        }
        @keyframes pulse-emerald {
          0%, 100% { box-shadow: 0 0 8px rgba(16,185,129,0.3); border-color: rgba(16,185,129,0.3); }
          50% { box-shadow: 0 0 20px rgba(16,185,129,0.6); border-color: rgba(16,185,129,0.5); }
        }
        @keyframes slide-right {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes scan-glow {
          0% { top: 0%; opacity: 0.1; }
          50% { opacity: 0.8; }
          100% { top: 100%; opacity: 0.1; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2.2s infinite ease-in-out;
        }
        .animate-pulse-emerald {
          animation: pulse-emerald 2.2s infinite ease-in-out;
        }
        .animate-slide-right {
          animation: slide-right 1.3s ease-out forwards;
        }
        @keyframes custom-float {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.15; }
          50% { transform: translateY(-40px) translateX(25px) scale(1.2); opacity: 0.5; }
        }
        .animate-scan-line {
          animation: scan-glow 2.5s infinite linear;
        }
        .animate-custom-float {
          animation: custom-float 10s infinite ease-in-out;
        }
      `}</style>
      
      {/* Premium Cinematic Entry Splash Screen */}
      {showSplash && (
        <div className="fixed inset-0 bg-neutral-950 z-[99999] flex flex-col items-center justify-center p-6 space-y-6 animate-fade-in transition-all duration-550 ease-out">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />
          
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl border border-cyan-500/30 bg-neutral-900 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.25)] animate-pulse-glow">
              <Film className="w-8 h-8 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div className="text-center space-y-1.5">
            <h2 className="text-lg font-black tracking-[0.25em] text-white uppercase font-sans">CINEMOOD DRIVE</h2>
            <p className="text-[9px] text-neutral-500 font-mono tracking-widest uppercase">Initializing Secure Bypass Gateways...</p>
          </div>

          {/* Cinematic Loading Progress Bar */}
          <div className="w-48 h-1 bg-neutral-900 rounded-full overflow-hidden border border-neutral-850 p-[1px]">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 animate-slide-right rounded-full bg-[size:200%_auto]" />
          </div>
        </div>
      )}

      {/* Optimized Ambient Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_-10%,rgba(6,182,212,0.1),rgba(0,0,0,0))] pointer-events-none z-0" />

      {/* Floating Notifications UI */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 transition-all duration-300 animate-slide-in ${
              n.type === 'success' 
                ? 'bg-cyan-950/85 border-cyan-500/50 text-cyan-200' 
                : n.type === 'error'
                  ? 'bg-red-950/85 border-red-500/50 text-red-200'
                  : 'bg-neutral-900/90 border-neutral-700/50 text-neutral-200'
            }`}
          >
            {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />}
            {n.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {n.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
            <p className="text-sm font-medium leading-relaxed">{n.message}</p>
          </div>
        ))}
      </div>

      {/* Modern High-End Cinematic Navigation Header */}
      <header className="sticky top-0 z-30 bg-neutral-950/70 backdrop-blur-lg border-b border-neutral-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
          {selectedMovie?.is_kara_special ? (
            <div className="flex items-center gap-2 sm:gap-3 select-none">
              <div className="relative bg-neutral-950 p-1.5 sm:p-2 rounded-lg border border-cyan-500/30 flex items-center justify-center">
                <Film className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-neutral-50 to-neutral-200 bg-clip-text text-transparent">
                    CINEMOOD
                  </span>
                  <span className="bg-neutral-900 text-cyan-400 border border-cyan-500/30 font-semibold px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] tracking-widest uppercase shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                    DRIVE
                  </span>
                </div>
                <p className="text-[8px] sm:text-[9.5px] text-neutral-400 tracking-wide font-mono leading-none mt-0.5">Bypass Traffic • Ultra High Speed CDN</p>
              </div>
            </div>
          ) : (
            <a 
              href="#/" 
              onClick={() => { window.location.hash = '#/'; }} 
              className="flex items-center gap-2 sm:gap-3 group focus:outline-none"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-lg blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
                <div className="relative bg-neutral-950 p-1.5 sm:p-2 rounded-lg border border-cyan-500/30 flex items-center justify-center">
                  <Film className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-cyan-400 group-hover:rotate-12 transition-all duration-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-neutral-50 to-neutral-200 bg-clip-text text-transparent">
                    CINEMOOD
                  </span>
                  <span className="bg-neutral-900 text-cyan-400 border border-cyan-500/30 font-semibold px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] tracking-widest uppercase shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                    DRIVE
                  </span>
                </div>
                <p className="text-[8px] sm:text-[9.5px] text-neutral-400 tracking-wide font-mono leading-none mt-0.5">Bypass Traffic • Ultra High Speed CDN</p>
              </div>
            </a>
          )}

          {!activeSlug && (
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <a 
                  href="#/" 
                  onClick={() => { window.location.hash = '#/'; }} 
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    currentHash === '#/' || activeSlug
                      ? 'text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 font-bold' 
                      : 'text-neutral-400 hover:text-neutral-100'
                  }`}
                >
                  Gallery
                </a>
                
                {!isLoggedIn ? (
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-neutral-450 hover:text-neutral-100 transition flex items-center gap-1.5 cursor-pointer bg-transparent border border-transparent hover:border-neutral-800"
                  >
                    <Sliders className="w-4 h-4" />
                    Console
                  </button>
                ) : (
                  <>
                    <a 
                      href="#/admin" 
                      onClick={() => { window.location.hash = '#/admin'; }} 
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                        currentHash.startsWith('#/admin') 
                          ? 'text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 font-bold' 
                          : 'text-neutral-400 hover:text-neutral-100'
                      }`}
                    >
                      <Sliders className="w-4 h-4" />
                      Console
                    </a>
                    <button 
                      onClick={handleAdminLogout}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/10 transition flex items-center gap-1 cursor-pointer bg-transparent border border-red-500/15"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 relative z-10">        {/* ==================== 1. DISCOVER / GALLERY VIEW ==================== */}
        {(currentHash === '#/' && !activeSlug) && (
          <div className="space-y-10 animate-fade-in pb-8">
            
            {/* SECTION 1: High-Tech Secure Gateway Hero Area */}
            <section className="relative rounded-2xl overflow-hidden border border-neutral-900 bg-neutral-900/15 backdrop-blur-xl p-5 sm:p-8 lg:p-10 text-center space-y-6 shadow-2xl">
              
              {/* Pulsing deep radial neon background glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none z-0" />
              
              {/* Floating particles background container */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {heroParticles.map((pt) => (
                  <div
                    key={pt.id}
                    className="absolute bg-cyan-400/30 rounded-full blur-[0.5px] animate-custom-float"
                    style={{
                      left: `${pt.left}%`,
                      top: `${pt.top}%`,
                      width: `${pt.size}px`,
                      height: `${pt.size}px`,
                      animationDelay: `${pt.delay}s`,
                      animationDuration: `${pt.duration}s`
                    }}
                  />
                ))}
              </div>

              {/* Sparkles pill banner */}
              <div className="relative z-10 inline-flex items-center gap-1.5 bg-cyan-950/45 border border-cyan-500/20 rounded-full px-3 py-1 text-[10px] sm:text-xs text-cyan-400 font-mono tracking-wider animate-pulse-glow max-w-full">
                <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
                Premium Cyber Bypass & Secure Outbound Redirect
              </div>

              {/* Large Cinemood Drive Logo & Title */}
              <div className="relative z-10 space-y-2.5">
                <div className="flex items-center justify-center gap-2.5">
                  <div className="p-2 sm:p-2.5 bg-neutral-900/90 border border-cyan-500/35 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <Film className="w-6.5 h-6.5 sm:w-8 sm:h-8 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
                      CINEMOOD <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-mono">DRIVE</span>
                    </h1>
                    <p className="text-[9px] sm:text-[10px] text-cyan-500/80 uppercase font-mono tracking-[0.2em] font-semibold mt-0.5">Decentralized High-Speed Redirect Engine</p>
                  </div>
                </div>
                
                <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
                  The ultimate advertisement-bypassed direct stream & magnet redirect portal. Easily protect and compile your outbound bypass nodes.
                </p>
              </div>

              {/* HIGH-TECH SECURE ACCESS SYSTEM GATEWAY */}
              <div className="relative z-10 max-w-lg mx-auto space-y-4 pt-2">
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      if (isLoggedIn) {
                        window.location.hash = '#/admin';
                      } else {
                        setShowLoginModal(true);
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-neutral-950 font-black text-xs uppercase tracking-[0.15em] transition duration-300 flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.25)] w-full sm:w-auto cursor-pointer border border-cyan-400/20 group hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] hover:scale-[1.01] transform"
                  >
                    <Sliders className="w-3.5 h-3.5 text-neutral-950" /> Admin Console
                  </button>
                </div>

                {/* Active Channels Fast-Jump Chips */}
                <div className="pt-1.5 text-left space-y-1 bg-neutral-950/20 p-3 sm:p-3.5 rounded-xl border border-neutral-900/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest leading-none">⚡ ACTIVE REDIRECT CHANNELS:</span>
                    <button 
                      onClick={() => {
                        if (isLoggedIn) {
                          window.location.hash = '#/admin';
                        } else {
                          setShowLoginModal(true);
                        }
                      }}
                      className="text-[9px] font-mono text-cyan-400/80 hover:text-cyan-400 hover:underline bg-transparent border-none cursor-pointer focus:outline-none"
                    >
                      Manage All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {moviesList.filter(m => !m.is_kara_special).slice(0, 6).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          window.location.hash = `#/${m.slug}`;
                          notify(`Resolving Outbound Access to "${m.title}"...`, 'info');
                        }}
                        className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-950 border border-neutral-850 hover:border-cyan-500/40 text-neutral-400 hover:text-white font-mono text-[9px] sm:text-[10px] transition-all duration-300 flex items-center gap-1 group cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:animate-ping" />
                        /{m.slug}
                      </button>
                    ))}
                    {moviesList.length === 0 && (
                      <div className="text-[9px] sm:text-[10px] font-mono text-neutral-600">No active links currently deployed. Generate one above!</div>
                    )}
                  </div>
                </div>
              </div>

            </section>

            {/* SECTION 2: Highly Stylized Premium Features Section */}
            <section className="space-y-4">
              <div className="text-center">
                <p className="text-[9px] font-mono tracking-[0.2em] text-cyan-400 uppercase font-bold">Engine Standards</p>
                <h2 className="text-lg sm:text-xl font-black text-neutral-100 tracking-tight">Security & Performance Architecture</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Fast Download Access */}
                <div className="relative group bg-neutral-900/10 border border-neutral-850 rounded-xl p-4 sm:p-5 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)] hover:-translate-y-0.5 backdrop-blur">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300 pointer-events-none" />
                  <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <Cpu className="w-4.5 h-4.5 animate-pulse" />
                  </div>
                  <h3 className="text-xs font-extrabold text-neutral-100 uppercase tracking-widest font-mono mb-1 flex items-center gap-1.5">
                    Fast Download Access
                  </h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Instantly bypassed stream pathways routing through multi-threaded 10 Gbps cloud networks. Zero intermediate splash advertisements or timers.
                  </p>
                </div>

                {/* Card 2: Secure Verification */}
                <div className="relative group bg-neutral-900/10 border border-neutral-850 rounded-xl p-4 sm:p-5 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)] hover:-translate-y-0.5 backdrop-blur">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300 pointer-events-none" />
                  <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <h3 className="text-xs font-extrabold text-neutral-100 uppercase tracking-widest font-mono mb-1 flex items-center gap-1.5">
                    Secure Verification
                  </h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Decentralized AES-256 outbound token matching system. High safety integrity ensuring your streaming resources remain protected against data leaks.
                  </p>
                </div>

                {/* Card 3: Mobile Optimized */}
                <div className="relative group bg-neutral-900/10 border border-neutral-850 rounded-xl p-4 sm:p-5 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)] hover:-translate-y-0.5 backdrop-blur">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300 pointer-events-none" />
                  <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-455 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <Smartphone className="w-4.5 h-4.5 text-cyan-400" />
                  </div>
                  <h3 className="text-xs font-extrabold text-neutral-100 uppercase tracking-widest font-mono mb-1 flex items-center gap-1.5">
                    Mobile Optimized
                  </h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Lightweight styling featuring adaptive mobile target pads, sticky action trays, and zero footprint layout blocks for instant hand-offs.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: Cinematic Stats Section */}
            <section className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <h3 className="text-xs font-bold font-mono tracking-widest text-neutral-400 uppercase flex items-center justify-center sm:justify-start gap-1.5">
                    <DatabaseZap className="w-3.5 h-3.5 text-cyan-400" /> System Metrics Log
                  </h3>
                  <p className="text-[10px] text-neutral-550">Real-time status tracking of secure redirect handshakes.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-cyan-950/30 border border-cyan-550/20 rounded-full px-2.5 py-0.5 text-[10px] text-cyan-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GATEWAY STATUS: ONLINE
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Stat 1 */}
                <div className="bg-neutral-900/20 border border-neutral-850 rounded-lg p-3.5 text-center space-y-0.5 relative overflow-hidden group hover:border-cyan-500/20 transition duration-300">
                  <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400 bg-gradient-to-r from-neutral-50 to-neutral-250 bg-clip-text">
                    {(moviesList.reduce((acc, m) => acc + m.downloads_count, 0) + 14250).toLocaleString()}
                  </div>
                  <p className="text-[9px] text-neutral-550 font-mono uppercase tracking-widest">Total File Downloads</p>
                </div>

                {/* Stat 2 */}
                <div className="bg-neutral-900/20 border border-neutral-850 rounded-lg p-3.5 text-center space-y-0.5 relative overflow-hidden group hover:border-cyan-500/20 transition duration-300">
                  <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 bg-gradient-to-r from-neutral-50 to-neutral-250 bg-clip-text">
                    {moviesList.length}
                  </div>
                  <p className="text-[9px] text-neutral-555 font-mono uppercase tracking-widest">Active Channels</p>
                </div>

                {/* Stat 3 */}
                <div className="bg-neutral-900/20 border border-neutral-850 rounded-lg p-3.5 text-center space-y-0.5 relative overflow-hidden group hover:border-cyan-500/20 transition duration-300">
                  <div className="text-xl sm:text-2xl font-black font-mono text-indigo-400 bg-gradient-to-r from-neutral-50 to-neutral-250 bg-clip-text">
                    {(moviesList.reduce((acc, m) => acc + m.views_count, 0) + 7820).toLocaleString()}
                  </div>
                  <p className="text-[9px] text-neutral-550 font-mono uppercase tracking-widest">Secure Access Generated</p>
                </div>
              </div>
            </section>

            {/* SECTION 4: Premium Telegram Join Banner */}
            <section className="relative rounded-2xl overflow-hidden border border-neutral-850 bg-gradient-to-b from-neutral-900/30 to-neutral-950 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-left group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-sky-500/10 transition-colors" />
              
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 bg-sky-950/50 border border-sky-500/30 rounded-full px-2.5 py-1 text-[10px] text-sky-450 font-mono">
                  <Send className="w-3 h-3 animate-bounce" /> INSTANT SUBSCRIBER TELEMETRY FEED
                </div>
                <h4 className="text-base sm:text-lg font-black text-neutral-100 uppercase tracking-tight">Access Secret Multi-Thread Links</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Join the Cinemood community telemetry channel! Gain priority queue slots, dynamic proxy domain bypass mirrors, and request fresh download ports on demand.
                </p>
              </div>

              <a 
                href="https://t.me/your_telegram_channel"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-mono text-xs font-black uppercase text-center shrink-0 flex items-center justify-center gap-2 select-none hover:shadow-[0_0_20px_rgba(56,189,248,0.35)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Join Telegram Feedback <ChevronRight className="w-4 h-4 text-white" />
              </a>
            </section>

          </div>
        )}

        {/* ==================== SECURE OPERATOR AUTHENTICATION GATE ==================== */}
        {(!isLoggedIn && (currentHash.startsWith('#/admin') || currentHash === '#/create' || currentHash === '#/manage-links')) && (
          <div className="max-w-sm mx-auto my-6 animate-fade-in relative z-20">
            <div className="relative bg-neutral-900 border border-neutral-850 p-5 sm:p-6 rounded-xl shadow-[0_0_35px_rgba(6,182,212,0.12)] space-y-4">
              
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-xl border border-cyan-500/30 bg-neutral-950 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                  <Lock className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base font-black tracking-wider text-white uppercase font-sans">
                    SECURITY ACCESS GATED
                  </h3>
                  <p className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase">
                    Operator Security Handshake Demanded
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">
                    Security Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <User className="h-3.5 w-3.5 text-cyan-400/50" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="w-full pl-8.5 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 focus:border-cyan-500/50 focus:outline-none text-[11px] text-white font-mono"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">
                    Handshake Access Code
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Lock className="h-3.5 w-3.5 text-cyan-400/50" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      className="w-full pl-8.5 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 focus:border-cyan-500/50 focus:outline-none text-[11px] text-white font-mono"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-500 text-neutral-950 font-black text-[11px] uppercase tracking-widest transition duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-neutral-950" /> Execute Security Unlock
                </button>
              </form>

              <div className="text-center pt-1">
                <a 
                  href="#/"
                  onClick={() => { window.location.hash = '#/'; }}
                  className="text-[9px] font-mono text-neutral-500 hover:text-cyan-400 transition uppercase"
                >
                  ← Abort & Return to Gallery
                </a>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 2. ADMIN CONSOLE VIEW ==================== */}
        {(currentHash === '#/admin' && isLoggedIn) && (
          <div className="space-y-6 animate-fade-in">
            {/* Path Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/10 p-3.5 rounded-xl border border-neutral-900/40">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                  <a href="#/" onClick={() => { window.location.hash = '#/'; }} className="hover:text-cyan-400">Cinemood Drive</a>
                  <span>/</span>
                  <span className="text-cyan-400 font-bold">Console</span>
                </div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-1.5">
                  <Sliders className="w-5 h-5 text-cyan-400" /> Administrative Console
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={fetchMovies}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white transition text-[10px] sm:text-xs font-bold flex items-center gap-1"
                  title="Force Reload Data State"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" /> Refresh State
                </button>



                <button
                  onClick={handleAdminLogout}
                  className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-500/25 text-red-300 transition text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Secure Shut Down Session"
                >
                  <LogOut className="w-3 h-3" /> Logout Session
                </button>
              </div>
            </div>

            {/* Ambient System Mode Banner */}
            <div className="p-4 rounded-xl border border-cyan-500/10 bg-neutral-900/30 font-mono text-[11px] text-neutral-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Cinemood Drive is operating in <strong>Static Download Portal Mode</strong>. All download pathways are hardcoded directly into the application code.</span>
            </div>

            {/* Interactive Analytics & Performance Charts Block */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-neutral-900/40 border border-neutral-850 rounded-xl p-3.5 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Total active routes</span>
                  <div className="p-0.5 px-1 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 text-[8px] font-bold">Portals</div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">{moviesList.length}</div>
                <p className="text-[9px] text-neutral-500 leading-tight">Registered and indexed routes serving bypassing triggers.</p>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-850 rounded-xl p-3.5 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Total visits</span>
                  <div className="p-0.5 px-1 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 text-[8px] font-bold">Impressions</div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {moviesList.reduce((acc, m) => acc + (m.views_count || 0), 0).toLocaleString()}
                </div>
                <p className="text-[9px] text-neutral-550 leading-tight">Accumulated gateway loading events across redirects.</p>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-850 rounded-xl p-3.5 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Completed downloads</span>
                  <div className="p-0.5 px-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-[8px] font-bold">Unlock Yield</div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {moviesList.reduce((acc, m) => acc + (m.downloads_count || 0), 0).toLocaleString()}
                </div>
                <p className="text-[9px] text-neutral-500 leading-tight">Total verified countdown gate completions & bypass triggers.</p>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-850 rounded-xl p-3.5 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Conversions check</span>
                  <div className="p-0.5 px-1 rounded bg-yellow-950/40 text-yellow-500 border border-yellow-500/20 text-[8px] font-bold">Efficiency</div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {(() => {
                    const tv = moviesList.reduce((acc, m) => acc + (m.views_count || 0), 0);
                    const td = moviesList.reduce((acc, m) => acc + (m.downloads_count || 0), 0);
                    return tv > 0 ? ((td / tv) * 100).toFixed(1) + '%' : '0%';
                  })()}
                </div>
                <p className="text-[9px] text-neutral-500 leading-tight">The percentage of visiting users satisfying the verification flow.</p>
              </div>
            </div>

            {/* Big admin data table list */}
            <section className="bg-neutral-900/20 border border-neutral-850 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-neutral-850 flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/40">
                <div className="text-center sm:text-left">
                  <h3 className="text-sm font-bold text-neutral-100">Configured Cinema Endpoints</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Manage copy direct links, and monitor download counts on individual film pathways.</p>
                </div>
                <div className="relative w-full sm:w-56">
                  <input
                    type="text"
                    placeholder="Search slug files..."
                    className="w-full pl-3 pr-8 py-1 rounded-lg bg-neutral-950 border border-neutral-850 focus:border-cyan-500/50 text-xs focus:outline-none transition-colors text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="h-3 w-3 text-neutral-600 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {moviesList.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Tv className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-neutral-300">No cine links available in catalog</p>
                  <p className="text-[10px] text-neutral-550 mt-0.5 max-w-sm mx-auto">Create and index customized film packages above to start listing torrent bypass triggers.</p>
                  <a
                    href="#/admin/create"
                    className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 text-[10px] font-semibold rounded-lg transition"
                  >
                    <Plus className="w-3 h-3" /> Create Link Now
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-850 text-neutral-400 bg-neutral-950/60 font-mono text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-3.5 sm:px-4.5 font-semibold">Film Details</th>
                        <th className="py-2.5 px-3.5 sm:px-4.5 font-semibold hidden md:table-cell">Target URL slug</th>
                        <th className="py-2.5 px-3.5 sm:px-4.5 font-semibold">Traffic Statistics</th>
                        <th className="py-2.5 px-3.5 sm:px-4.5 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900/50">
                      {moviesList.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map((m) => (
                        <tr key={m.id} className="hover:bg-neutral-900/10 transition">
                          <td className="py-2.5 px-3.5 sm:px-4.5">
                            <div className="flex items-center gap-2.5">
                              {/* Small tiny poster thumbnail */}
                              <img 
                                src={m.poster_url} 
                                alt="" 
                                className="w-7 h-10 rounded object-cover border border-neutral-850 bg-neutral-900 shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&auto=format&fit=crop&q=80'; }}
                              />
                              <div>
                                <span className="font-bold text-neutral-200 block truncate max-w-[120px] sm:max-w-xs">{m.title}</span>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-neutral-500">
                                  <span className="text-cyan-500 font-mono font-bold">{m.year}</span>
                                  <span>•</span>
                                  <span>{m.quality}</span>
                                  <span>•</span>
                                  <span>{m.size_gb}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-2.5 px-3.5 sm:px-4.5 hidden md:table-cell font-mono text-[11px]">
                            <span className="text-cyan-400">/{m.slug}</span>
                            <div className="text-[9px] text-neutral-600 truncate max-w-xs">{m.download_url}</div>
                          </td>

                          <td className="py-2.5 px-3.5 sm:px-4.5 font-mono text-[10px]">
                            <div className="space-y-0.5">
                              <span className="flex items-center gap-1 text-neutral-400">
                                <Eye className="w-3 h-3 text-neutral-600" /> {m.views_count.toLocaleString()} v
                              </span>
                              <span className="flex items-center gap-1 text-neutral-400">
                                <Download className="w-3 h-3 text-neutral-600" /> {m.downloads_count.toLocaleString()} d
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5 sm:px-4.5 text-right w-1">
                            <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                              <button
                                onClick={() => copyToClipboard(getShareableUrl(m.slug))}
                                className="p-1.5 rounded-md bg-neutral-950 hover:bg-neutral-850 border border-neutral-850 text-neutral-400 hover:text-cyan-400 transition"
                                title="Copy Shareable Link"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              
                              <a
                                href={`#/${m.slug}`}
                                className="p-1.5 rounded-md bg-neutral-950 hover:bg-neutral-850 border border-neutral-850 text-neutral-400 hover:text-cyan-400 transition inline-block"
                                title="Open Live Portal Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ==================== 4. DYNAMIC SLUG PORTAL / DOWNLOAD GATED PAGE ==================== */}
        {activeSlug && (
          <div className="space-y-8 animate-fade-in">
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                <h2 className="text-base font-bold text-neutral-100 font-mono">Handshaking CDN Node gateway...</h2>
                <p className="text-sm text-neutral-500 mt-1 font-mono">Matching path: /{activeSlug}</p>
              </div>
            ) : !selectedMovie ? (
              <div className="max-w-sm mx-auto text-center py-10 bg-neutral-900/15 border border-neutral-855 rounded-xl space-y-3 shadow-xl">
                <FileVideo className="w-10 h-10 text-neutral-600 mx-auto" />
                <div className="space-y-1.5 px-4">
                  <h2 className="text-sm font-black text-rose-450 uppercase tracking-tight">Link Not Found</h2>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                    Checked database registry for slug <code className="text-rose-400 font-mono bg-neutral-950 px-1 py-0.5 rounded text-[10px]">/{activeSlug}</code> but could not resolve a target media download gateway.
                  </p>
                </div>
                <div className="pt-2.5 flex justify-center gap-2">
                  <a 
                    href="#/" 
                    onClick={() => { window.location.hash = '#/'; }} 
                    className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-cyan-500/30 text-neutral-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back Home
                  </a>
                  <a 
                    href="#/admin" 
                    onClick={() => { window.location.hash = '#/admin'; }} 
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-600 text-neutral-900 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Deploy Path
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg mx-auto py-6">

                {/* Centered Minimal Premium Download Portal */}
                <div className="bg-neutral-900/45 border border-cyan-500/10 shadow-[0_0_35px_rgba(6,182,212,0.06)] rounded-xl p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden text-center space-y-4 animate-fade-in">
                  {/* Ambient Neon Blue Radial Glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-[30px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-[30px] pointer-events-none" />

                  {/* Small Centered Title */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-cyan-400 font-bold block">
                      Target Package
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                      {selectedMovie?.title || "Untitled File"}
                    </h2>
                  </div>

                  {/* --- COUNTDOWN TIMER (FOR STAGE IDLE/COUNTING/READY) --- */}
                  {(timerStage === 'counting' || timerStage === 'idle' || timerStage === 'ready') && (
                    <div className="space-y-4 py-2 animate-fade-in flex flex-col items-center">
                      {/* Countdown Ring Graphics */}
                      <div className="relative inline-flex items-center justify-center">
                        {/* Static Outer Ring */}
                        <div className="absolute inset-0 border-[2px] border-neutral-855/85 rounded-full w-20 h-20" />
                        {/* Animated Segment Ring */}
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="37"
                            stroke="#06b6d4"
                            strokeWidth="2.5"
                            fill="transparent"
                            strokeDasharray="233px"
                            strokeDashoffset={`${233 - (233 * countdown) / 10}px`}
                            className="transition-all duration-1000 ease-linear"
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        <div className="absolute bg-neutral-950/90 border border-neutral-850/60 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg">
                          <span className="text-2xl font-black font-mono tracking-tight text-white">{countdown}</span>
                          <span className="text-[7px] text-cyan-400 font-mono uppercase tracking-widest leading-none mt-0.5">SECONDS</span>
                        </div>
                      </div>

                      <div className="space-y-0.5 max-w-xs">
                        <p className="text-[11px] text-neutral-450 leading-snug font-mono">
                          {countdown > 0 
                            ? 'Preparing download gateway connection...' 
                            : 'Secure link ready for generation!'}
                        </p>
                      </div>

                      {/* CTA Gated Generating Button */}
                      <button
                        type="button"
                        onClick={startSecureVerification}
                        disabled={countdown > 0}
                        className={`w-full py-2.5 rounded-lg text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                          countdown > 0 
                            ? 'bg-neutral-955 border border-neutral-850 text-neutral-600 cursor-not-allowed text-[11px]'
                            : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-neutral-955 font-black cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:scale-[1.01] transition-all'
                        }`}
                      >
                        {countdown > 0 ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-neutral-600 animate-pulse shrink-0" /> Preparing Link ({countdown}s)
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 animate-bounce shrink-0 text-neutral-955" /> Unlock Download <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* --- VERIFICATION ANIMATION & PROGRESS BAR (FOR STAGE VERIFYING) --- */}
                  {timerStage === 'verifying' && (
                    <div className="space-y-4 py-4 animate-fade-in flex flex-col items-center">
                      
                      {/* Compact Neon spinning shield/globe loader */}
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/10 animate-spin" style={{ animationDuration: '6s' }} />
                        <div className="absolute w-12 h-12 rounded-full border-2 border-t-cyan-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin" />
                        <ShieldCheck className="w-6 h-6 text-cyan-400 animate-pulse" />
                      </div>

                      {/* Progress Bar & Status Text */}
                      <div className="w-full space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-cyan-400">
                          <span>Verifying Link...</span>
                          <span>{verificationProgress}%</span>
                        </div>

                        <div className="h-1.5 w-full bg-neutral-950 border border-neutral-900 rounded-full overflow-hidden p-[1px]">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-505 shadow-[0_0_8px_rgba(6,182,212,0.4)] rounded-full transition-all duration-300" 
                            style={{ width: `${verificationProgress}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-[9px] text-neutral-550 font-mono tracking-wide uppercase">
                        Establishing safe connection tunnels...
                      </p>
                    </div>
                  )}

                  {/* --- FINAL UNLOCK/DOWNLOAD BUTTON (FOR STAGE UNLOCKED) --- */}
                  {timerStage === 'unlocked' && (
                    <div className="space-y-4 py-2 animate-fade-in flex flex-col items-center">
                      
                      {/* Compact Unlocked success badge */}
                      <div className="w-14 h-14 rounded-full bg-emerald-950/40 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-black text-neutral-200 uppercase tracking-widest font-mono">
                          Verified Link Unlocked
                        </h4>
                        <p className="text-[9px] text-neutral-550 font-mono">
                          Safe targeted magnet link compiled successfully.
                        </p>
                      </div>

                      {/* Final Download Button */}
                      <div className="w-full space-y-2.5 pb-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedMovie?.id) {
                              CinemoodDB.incrementDownloads(selectedMovie.id);
                              fetchMovies();
                            }

                            // 1. First open the ad link
                            const adWin = window.open('https://omg10.com/4/11069725', '_blank');
                            if (adWin) {
                              adWin.focus();
                            }

                            // 2. Open the actual download link in a new tab after a brief delay
                            const downloadUrl = selectedMovie?.download_url || "#";
                            setTimeout(() => {
                              const dlWin = window.open(downloadUrl, '_blank');
                              if (!dlWin) {
                                // Fallback in case popup blocker stopped the second window.open
                                window.location.href = downloadUrl;
                              }
                            }, 500);
                          }}
                          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-450 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-955 font-black tracking-wider uppercase text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:scale-[1.01] transition-all cursor-pointer border-none"
                        >
                          <Download className="w-4 h-4 text-neutral-955 shrink-0 animate-bounce" /> Unlock Direct Download
                        </button>

                        <button
                          type="button"
                          onClick={resetCountdownTimer}
                          className="text-[9px] font-mono text-neutral-500 hover:text-cyan-400 transition uppercase tracking-wider bg-transparent border-none cursor-pointer focus:outline-none pt-1"
                        >
                          ← Reset Gate Timer
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Minimal Footer with simple centered styles */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 py-8 relative z-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono tracking-wider text-neutral-400">
            <button 
              onClick={() => setActivePolicyModal('privacy')}
              className="hover:text-cyan-400 transition cursor-pointer font-bold focus:outline-none uppercase"
            >
              Privacy Policy
            </button>
            <span className="text-neutral-800">•</span>
            <button 
              onClick={() => setActivePolicyModal('dmca')}
              className="hover:text-cyan-400 transition cursor-pointer font-bold focus:outline-none uppercase"
            >
              DMCA
            </button>
            <span className="text-neutral-800">•</span>
            <button 
              onClick={() => setActivePolicyModal('contact')}
              className="hover:text-cyan-400 transition cursor-pointer font-bold focus:outline-none uppercase"
            >
              Contact
            </button>
          </div>
          
          <p className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase">
            © {new Date().getFullYear()} CINEMOOD DRIVE • SECURE OUTBOUND SYSTEMS
          </p>
        </div>
      </footer>

      {/* Elegant Cyber Glassmorphism Policy Inquiry Modals */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in animate-duration-200">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-850 p-4 sm:p-5 rounded-xl shadow-[0_0_35px_rgba(6,182,212,0.1)] space-y-4">
            <div className="absolute top-3 right-3">
              <button 
                onClick={() => setActivePolicyModal(null)}
                className="w-7 h-7 rounded bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition text-[9px] font-mono font-bold cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-neutral-850 pb-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_7px_rgba(6,182,212,0.4)]" />
              <h3 className="text-[11px] font-black font-mono uppercase tracking-widest text-cyan-400">
                {activePolicyModal === 'privacy' && 'Privacy Policy & Data Shield'}
                {activePolicyModal === 'dmca' && 'Route Integrity & DMCA Portal'}
                {activePolicyModal === 'contact' && 'Operator Diagnostics Interface'}
              </h3>
            </div>

            <div className="text-[11px] text-neutral-300 leading-relaxed font-mono space-y-3">
              {activePolicyModal === 'privacy' && (
                <>
                  <p>
                    Cinemood Drive enforces an absolute stateless cache-routing sequence. We do NOT log cookies, outbound query parameters, target server hashes, or client IP telemetry.
                  </p>
                  <p>
                    All temporary bypass states reside inside ephemeral in-memory sandboxes and are fully destroyed forty minutes after verification sequence checks to protect client privacy.
                  </p>
                </>
              )}

              {activePolicyModal === 'dmca' && (
                <>
                  <p>
                    Cinemood Drive operates strictly as a secure transit gateway, proxy link resolver, and outbound cache router layer. We do NOT persistently host, copy, or store physical media files, video records, or torrent nodes on any hardware owned/leased directly by our operators.
                  </p>
                  <p>
                    Our dynamic routing lookup maps dynamic target catalogs configured for network bypass. For removal of active redirect catalogs from resolver cache, please forward standard verification notices to operator channels.
                  </p>
                </>
              )}

              {activePolicyModal === 'contact' && (
                <>
                  <p>
                    For redirect claims, developer node partnerships, dynamic crawler credentials, or reporting high-speed CDN gateway bottlenecks, access our compliance team:
                  </p>
                  <div className="p-2 sm:p-2.5 bg-neutral-950 rounded-lg border border-neutral-850 select-all font-mono text-[11px] text-cyan-400 text-center uppercase tracking-wide">
                    compliance@cinemood-drive.network
                  </div>
                  <p>
                    Alternatively, initiate secure direct messaging channels via our public Telegram updater nodes to query live system architects.
                  </p>
                </>
              )}
            </div>

            <div className="pt-1.5 flex justify-end">
              <button
                onClick={() => setActivePolicyModal(null)}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-black text-[11px] uppercase tracking-wider transition duration-300"
              >
                Close Gateway Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Cyber Glassmorphism Admin Login Modal Popup */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in animate-duration-200">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-850 p-4 sm:p-5 rounded-xl shadow-[0_0_35px_rgba(6,182,212,0.15)] space-y-4">
            
            <div className="absolute top-3 right-3">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="w-7 h-7 rounded bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition text-xs font-mono font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-neutral-850 pb-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_7px_rgba(6,182,212,0.4)]" />
              <h3 className="text-[11px] font-black font-mono uppercase tracking-widest text-cyan-400">
                Secure Operator Entry
              </h3>
            </div>

            <p className="text-[11px] text-neutral-400 leading-normal font-mono">
              Administrative credentials required to deploy fresh direct bypass tunnels and inspect analytics telemetry.
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">
                  Security Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <User className="h-3.5 w-3.5 text-cyan-400/50" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full pl-8.5 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 focus:border-cyan-500/50 focus:outline-none text-[11px] text-white font-mono"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">
                  Password Key
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-cyan-400/50" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    className="w-full pl-8.5 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 focus:border-cyan-500/50 focus:outline-none text-[11px] text-white font-mono"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-350 hover:to-indigo-450 text-neutral-950 font-black text-xs uppercase tracking-widest transition duration-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-neutral-950" /> Initialize Authentication
              </button>
            </form>

            <div className="pt-2 text-center text-[9px] text-neutral-500 font-mono uppercase tracking-wider">
              Stateless security bypass sequence active
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
