import React, { useState, useEffect, useRef } from 'react';
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

export default function App() {
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
  
  // --- App Diagnostics Status ---
  const [dbStatus, setDbStatus] = useState(CinemoodDB.getConnectionStatus());

  // --- Notification System ---
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- Form Create/Edit Movie State ---
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newPoster, setNewPoster] = useState('');
  const [newDownload, setNewDownload] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newYear, setNewYear] = useState('2026');
  const [newGenre, setNewGenre] = useState('Action, Thriller');
  const [newQuality, setNewQuality] = useState('1080p WebRip');
  const [newSize, setNewSize] = useState('1.8 GB');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Editable movie variables ---
  const [editingMovie, setEditingMovie] = useState<MovieLink | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editPoster, setEditPoster] = useState('');
  const [editDownload, setEditDownload] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editQuality, setEditQuality] = useState('');
  const [editSize, setEditSize] = useState('');

  // Auto-fill poster suggestions array
  const POSTER_PRESETS = [
    { name: 'Cinematic Blue', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80' },
    { name: 'Cosmic Nebula', url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&auto=format&fit=crop&q=80' },
    { name: 'Retro Neon Drive', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
    { name: 'Techno Matrix', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80' }
  ];

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

  // Sync Diagnostics and Database client configuration automatically
  useEffect(() => {
    setDbStatus(CinemoodDB.getConnectionStatus());
  }, [currentHash]);

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
      document.title = `${selectedMovie.title} (${selectedMovie.year}) Premium Direct Download - Cinemood Drive`;
      
      const updateMetaTag = (attributeName: string, attributeValue: string, contentValue: string) => {
        let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attributeName, attributeValue);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', contentValue);
      };

      updateMetaTag('name', 'description', `Instant high speed secure decrypted direct bypass fetch for ${selectedMovie.title} (${selectedMovie.year}). Size: ${selectedMovie.size_gb}, Video: ${selectedMovie.quality}.`);
      updateMetaTag('property', 'og:title', `${selectedMovie.title} Premium Direct Stream - Cinemood`);
      updateMetaTag('property', 'og:description', `Unlock safe decrypted cloud storage nodes and direct multi-threaded streams for ${selectedMovie.title}.`);
      updateMetaTag('property', 'og:image', selectedMovie.poster_url);
      updateMetaTag('property', 'og:url', window.location.href);
      updateMetaTag('name', 'twitter:card', 'summary_large_image');
    } else {
      document.title = 'Cinemood Drive - Premium Direct Cinematic Link Portal & Magnet Generator';
    }
  }, [selectedMovie]);

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

  // Auto-slugify title typed in form
  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    const slugified = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setNewSlug(slugified);
  };

  // Submit new Cinema download URL node
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim() || !newDownload.trim()) {
      notify('Please fill out all mandatory fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate unique slug
      const existing = await CinemoodDB.getMovieBySlug(newSlug.trim());
      if (existing) {
        notify('This friendly URL slug already exists. Please choose a unique name.', 'error');
        setIsSubmitting(false);
        return;
      }

      await CinemoodDB.addMovie({
        title: newTitle.trim(),
        slug: newSlug.trim(),
        description: newDesc.trim() || 'No description available for this cinematic release.',
        poster_url: newPoster.trim() || 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&auto=format&fit=crop&q=80',
        download_url: newDownload.trim(),
        year: newYear.trim() || '2026',
        genre: newGenre.trim() || 'General',
        quality: newQuality.trim() || '1080p HD',
        size_gb: newSize.trim() || '1.5 GB'
      });

      notify(`Cinema Download link for "${newTitle}" created successfully!`, 'success');
      
      // Clean states
      setNewTitle('');
      setNewSlug('');
      setNewPoster('');
      setNewDownload('');
      setNewDesc('');
      setNewYear('2026');
      setNewGenre('Action, Thriller');
      setNewQuality('1080p WebRip');
      setNewSize('1.8 GB');

      // Refresh listings and navigate
      await fetchMovies();
      window.location.hash = '#/admin';
    } catch (err) {
      console.error(err);
      notify('Failed to registry movie link.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start edit action hook
  const handleEditClick = (movie: MovieLink) => {
    setEditingMovie(movie);
    setEditTitle(movie.title);
    setEditSlug(movie.slug);
    setEditPoster(movie.poster_url);
    setEditDownload(movie.download_url);
    setEditDesc(movie.description);
    setEditYear(movie.year);
    setEditGenre(movie.genre);
    setEditQuality(movie.quality);
    setEditSize(movie.size_gb);
  };

  // Save changes hook
  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;
    if (!editTitle.trim() || !editSlug.trim() || !editDownload.trim()) {
      notify('Mandatory fields are required.', 'error');
      return;
    }

    try {
      const res = await CinemoodDB.updateMovie(editingMovie.id, {
        title: editTitle.trim(),
        slug: editSlug.trim(),
        poster_url: editPoster.trim(),
        download_url: editDownload.trim(),
        description: editDesc.trim(),
        year: editYear.trim(),
        genre: editGenre.trim(),
        quality: editQuality.trim(),
        size_gb: editSize.trim(),
      });

      if (res) {
        notify(`"${editTitle}" has been updated and synchronized successfully!`, 'success');
        setEditingMovie(null);
        fetchMovies();
      } else {
        notify('Failed to save cinema updates.', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('An error occurred during DB synchronization.', 'error');
    }
  };

  // Delete movie helper
  const handleDeleteMovie = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the premium download link for "${title}"?`)) {
      try {
        await CinemoodDB.deleteMovie(id);
        notify(`Deleted "${title}" successfully.`, 'info');
        fetchMovies();
      } catch (e) {
        notify('Failed to delete link.', 'error');
      }
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a 
            href="#/" 
            onClick={() => { window.location.hash = '#/'; }} 
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-lg blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-neutral-950 p-2.5 rounded-lg border border-cyan-500/30 flex items-center justify-center">
                <Film className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-all duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-neutral-50 to-neutral-200 bg-clip-text text-transparent">
                  CINEMOOD
                </span>
                <span className="bg-cyan-550 text-cyan-400 border border-cyan-500/30 font-semibold px-2 py-0.5 rounded text-[10px] tracking-widest uppercase shadow-[0_0_8px_rgba(6,182,212,0.15)] bg-neutral-900">
                  DRIVE
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 tracking-wide font-mono">Bypass Traffic • Ultra High Speed CDN</p>
            </div>
          </a>

          <div className="flex items-center gap-4">
            {/* Real DB Environment Status Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-neutral-900/60 border border-neutral-800/90 rounded-full px-3 py-1 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.configured ? 'bg-emerald-500 animate-ping' : 'bg-cyan-400/80 animate-pulse'}`} />
              <span className="text-neutral-400 font-mono text-[11px]">
                {dbStatus.provider}: <strong className="text-neutral-200">{dbStatus.configured ? 'Sync Active' : 'Sandbox (Stored)'}</strong>
              </span>
            </div>

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
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">        {/* ==================== 1. DISCOVER / GALLERY VIEW ==================== */}
        {(currentHash === '#/' && !activeSlug) && (
          <div className="space-y-16 animate-fade-in pb-12">
            
            {/* SECTION 1: High-Tech Secure Gateway Hero Area */}
            <section className="relative rounded-3xl overflow-hidden border border-neutral-900 bg-neutral-900/15 backdrop-blur-xl p-8 sm:p-12 lg:p-16 text-center space-y-8 shadow-2xl">
              
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
              <div className="relative z-10 inline-flex items-center gap-1.5 bg-cyan-950/45 border border-cyan-500/20 rounded-full px-4 py-1.5 text-xs text-cyan-400 font-mono tracking-wider animate-pulse-glow max-w-full">
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                Premium Cyber Bypass & Secure Outbound Redirect
              </div>

              {/* Large Cinemood Drive Logo & Title */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-3 bg-neutral-900/90 border border-cyan-500/35 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                    <Film className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
                      CINEMOOD <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-mono">DRIVE</span>
                    </h1>
                    <p className="text-[10px] sm:text-xs text-cyan-500/80 uppercase font-mono tracking-[0.25em] font-semibold">Decentralized High-Speed Redirect Engine</p>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
                  The ultimate advertisement-bypassed direct stream & magnet redirect portal. Easily protect and compile your outbound bypass nodes.
                </p>
              </div>

              {/* HIGH-TECH SECURE ACCESS SYSTEM GATEWAY */}
              <div className="relative z-10 max-w-lg mx-auto space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      if (isLoggedIn) {
                        window.location.hash = '#/admin/create';
                      } else {
                        setShowLoginModal(true);
                      }
                    }}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-500 text-neutral-950 font-black text-xs uppercase tracking-[0.2em] transition duration-300 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.3)] w-full sm:w-auto cursor-pointer border border-cyan-400/20 group hover:shadow-[0_0_40px_rgba(6,182,212,0.55)] hover:scale-[1.02] transform"
                  >
                    <Plus className="w-4 h-4 text-neutral-950 transition-transform group-hover:rotate-90" /> Create Link
                  </button>

                  <button
                    onClick={() => {
                      if (isLoggedIn) {
                        window.location.hash = '#/admin';
                      } else {
                        setShowLoginModal(true);
                      }
                    }}
                    className="px-8 py-4 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-cyan-500/35 text-neutral-300 hover:text-white transition duration-300 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer hover:bg-neutral-900 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                  >
                    <Sliders className="w-4 h-4 text-cyan-400" /> Admin Console
                  </button>
                </div>

                {/* Active Channels Fast-Jump Chips */}
                <div className="pt-2 text-left space-y-1.5 bg-neutral-950/20 p-4 rounded-2xl border border-neutral-900/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest leading-none">⚡ ACTIVE REDIRECT CHANNELS:</span>
                    <button 
                      onClick={() => {
                        if (isLoggedIn) {
                          window.location.hash = '#/admin';
                        } else {
                          setShowLoginModal(true);
                        }
                      }}
                      className="text-[10px] font-mono text-cyan-400/80 hover:text-cyan-400 hover:underline bg-transparent border-none cursor-pointer focus:outline-none"
                    >
                      Manage All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {moviesList.slice(0, 6).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          window.location.hash = `#/${m.slug}`;
                          notify(`Resolving Outbound Access to "${m.title}"...`, 'info');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-850 hover:border-cyan-500/40 text-neutral-400 hover:text-white font-mono text-[10px] transition-all duration-300 flex items-center gap-1 group cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full group-hover:animate-ping" />
                        /{m.slug}
                      </button>
                    ))}
                    {moviesList.length === 0 && (
                      <div className="text-[10px] font-mono text-neutral-600">No active links currently deployed. Generate one above!</div>
                    )}
                  </div>
                </div>
              </div>

            </section>

            {/* SECTION 2: Highly Stylized Premium Features Section */}
            <section className="space-y-6">
              <div className="text-center">
                <p className="text-[10px] font-mono tracking-[0.2em] text-cyan-400 uppercase font-bold">Engine Standards</p>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-100 tracking-tight">Security & Performance Architecture</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Fast Download Access */}
                <div className="relative group bg-neutral-900/10 border border-neutral-850 rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)] hover:-translate-y-1 backdrop-blur">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300 pointer-events-none" />
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-extrabold text-neutral-100 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
                    Fast Download Access
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Instantly bypassed stream pathways routing through multi-threaded 10 Gbps cloud networks. Zero intermediate splash advertisements or timers.
                  </p>
                </div>

                {/* Card 2: Secure Verification */}
                <div className="relative group bg-neutral-900/10 border border-neutral-850 rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)] hover:-translate-y-1 backdrop-blur">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300 pointer-events-none" />
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-extrabold text-neutral-100 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
                    Secure Verification
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Decentralized AES-256 outbound token matching system. High safety integrity ensuring your streaming resources remain protected against data leaks.
                  </p>
                </div>

                {/* Card 3: Mobile Optimized */}
                <div className="relative group bg-neutral-900/10 border border-neutral-850 rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)] hover:-translate-y-1 backdrop-blur">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300 pointer-events-none" />
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-450 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-extrabold text-neutral-100 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
                    Mobile Optimized
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Lightweight styling featuring adaptive mobile target pads, sticky action trays, and zero footprint layout blocks for instant hand-offs.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: Cinematic Stats Section */}
            <section className="bg-neutral-950/50 border border-neutral-900 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-1.5">
                    <DatabaseZap className="w-4 h-4 text-cyan-400" /> System Metrics Log
                  </h3>
                  <p className="text-[11px] text-neutral-500">Real-time status tracking of secure redirect handshakes.</p>
                </div>
                <div className="flex items-center gap-2 bg-cyan-950/30 border border-cyan-550/20 rounded-full px-3 py-1 text-[11px] text-cyan-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GATEWAY STATUS: ONLINE
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Stat 1 */}
                <div className="bg-neutral-900/20 border border-neutral-850 rounded-xl p-5 text-center space-y-1 relative overflow-hidden group hover:border-cyan-500/20 transition duration-300">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400 bg-gradient-to-r from-neutral-50 to-neutral-250 bg-clip-text">
                    {(moviesList.reduce((acc, m) => acc + m.downloads_count, 0) + 14250).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-neutral-550 font-mono uppercase tracking-widest">Total File Downloads</p>
                </div>

                {/* Stat 2 */}
                <div className="bg-neutral-900/20 border border-neutral-850 rounded-xl p-5 text-center space-y-1 relative overflow-hidden group hover:border-cyan-500/20 transition duration-300">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 bg-gradient-to-r from-neutral-50 to-neutral-250 bg-clip-text">
                    {moviesList.length}
                  </div>
                  <p className="text-[10px] text-neutral-550 font-mono uppercase tracking-widest">Active Channels</p>
                </div>

                {/* Stat 3 */}
                <div className="bg-neutral-900/20 border border-neutral-850 rounded-xl p-5 text-center space-y-1 relative overflow-hidden group hover:border-cyan-500/20 transition duration-300">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-400 bg-gradient-to-r from-neutral-50 to-neutral-250 bg-clip-text">
                    {(moviesList.reduce((acc, m) => acc + m.views_count, 0) + 7820).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-neutral-550 font-mono uppercase tracking-widest">Secure Access Generated</p>
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
          <div className="max-w-md mx-auto my-12 animate-fade-in relative z-20">
            <div className="relative bg-neutral-900 border border-neutral-850 p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-6">
              
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl border border-cyan-500/30 bg-neutral-950 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.15)]">
                  <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-widest text-white uppercase font-sans">
                    SECURITY ACCESS GATED
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase">
                    Operator Security Handshake Demanded
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">
                    Security Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-cyan-400/50" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-cyan-500/50 focus:outline-none text-xs text-white font-mono"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">
                    Handshake Access Code
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-cyan-400/50" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-cyan-500/50 focus:outline-none text-xs text-white font-mono"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-500 text-neutral-950 font-black text-xs uppercase tracking-widest transition duration-300 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-neutral-950" /> Execute Security Unlock
                </button>
              </form>

              <div className="text-center pt-2">
                <a 
                  href="#/"
                  onClick={() => { window.location.hash = '#/'; }}
                  className="text-[10px] font-mono text-neutral-500 hover:text-cyan-400 transition uppercase"
                >
                  ← Abort & Return to Gallery
                </a>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 2. ADMIN CONSOLE VIEW ==================== */}
        {(currentHash === '#/admin' && isLoggedIn) && (
          <div className="space-y-8 animate-fade-in">
            {/* Path Breadcrumbs */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <a href="#/" onClick={() => { window.location.hash = '#/'; }} className="hover:text-cyan-400">Cinemood Drive</a>
                  <span>/</span>
                  <span className="text-cyan-400">Console</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                  <Sliders className="w-7 h-7 text-cyan-400" /> Administrative Console
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchMovies}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white transition text-xs font-bold flex items-center gap-1.5"
                  title="Force Reload Data State"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Refresh State
                </button>

                <a 
                  href="#/admin/create"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-neutral-950 font-bold hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create Cinema Link
                </a>

                <button
                  onClick={handleAdminLogout}
                  className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900 border border-red-500/25 text-red-300 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Secure Shut Down Session"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout Session
                </button>
              </div>
            </div>

            {/* Configured Credentials diagnostic block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-neutral-900/30 border border-neutral-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-widest font-mono flex items-center gap-2">
                    <DatabaseZap className="w-4.5 h-4.5 text-cyan-400" /> Local Storage Engine Connection
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/25">
                    LOCAL PERSISTENCE ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-850 space-y-1">
                    <span className="text-neutral-500 text-[10px] block uppercase">STORAGE LOCATION</span>
                    <span className="text-neutral-200 truncate block">{dbStatus.url}</span>
                  </div>
                  <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-850 space-y-1">
                    <span className="text-neutral-500 text-[10px] block uppercase">PERSISTENCE DRIVER</span>
                    <span className="text-neutral-200 block">🔒 LocalStorage Secure Vault</span>
                  </div>
                </div>
              </div>

              {/* Stat dashboard */}
              <div className="bg-neutral-900/30 border border-neutral-850 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Cpu className="w-4.5 h-4.5 text-cyan-400" /> Performance Console
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Database Uptime</span>
                    <span className="font-mono text-cyan-400">100.00%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">API Response Time</span>
                    <span className="font-mono text-neutral-200">{dbStatus.configured ? '~42ms' : '0.1ms (Local)'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Indexed Links Count</span>
                    <span className="font-mono text-neutral-200 font-bold">{moviesList.length} items</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-850 text-[11px] text-neutral-500">
                  Last monitored: {new Date().toLocaleTimeString()}
                </div>
              </div>

            </div>

            {/* Interactive Analytics & Performance Charts Block */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-neutral-900/40 border border-neutral-850 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-neutral-500 uppercase">Total active routes</span>
                  <div className="p-1 px-1.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">Portals</div>
                </div>
                <div className="text-3xl font-black text-white">{moviesList.length}</div>
                <p className="text-[10px] text-neutral-500 leading-normal">Registered and indexed routes serving bypassing triggers.</p>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-850 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-neutral-500 uppercase">Total visits</span>
                  <div className="p-1 px-1.5 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">Impressions</div>
                </div>
                <div className="text-3xl font-black text-white">
                  {moviesList.reduce((acc, m) => acc + (m.views_count || 0), 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-neutral-500 leading-normal">Accumulated gateway loading events across redirects.</p>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-850 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-neutral-500 uppercase">Completed downloads</span>
                  <div className="p-1 px-1.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">Unlock Yield</div>
                </div>
                <div className="text-3xl font-black text-white">
                  {moviesList.reduce((acc, m) => acc + (m.downloads_count || 0), 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-neutral-500 leading-normal">Total verified countdown gate completions & bypass triggers.</p>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-850 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-neutral-500 uppercase">Conversions check</span>
                  <div className="p-1 px-1.5 rounded bg-yellow-950/40 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold">Efficiency</div>
                </div>
                <div className="text-3xl font-black text-white">
                  {(() => {
                    const tv = moviesList.reduce((acc, m) => acc + (m.views_count || 0), 0);
                    const td = moviesList.reduce((acc, m) => acc + (m.downloads_count || 0), 0);
                    return tv > 0 ? ((td / tv) * 100).toFixed(1) + '%' : '0%';
                  })()}
                </div>
                <p className="text-[10px] text-neutral-500 leading-normal">The percentage of visiting users satisfying the verification flow.</p>
              </div>
            </div>



            {/* Big admin data table list */}
            <section className="bg-neutral-900/20 border border-neutral-850 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-neutral-850 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/40">
                <div>
                  <h3 className="text-base font-bold text-neutral-100">Configured Cinema Endpoints</h3>
                  <p className="text-xs text-neutral-400 mt-1">Manage, copy direct links, and monitor download counts on individual film pathways.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search slug files..."
                    className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-neutral-950 border border-neutral-850 focus:border-cyan-500/50 text-xs focus:outline-none transition-colors text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="h-3.5 w-3.5 text-neutral-600 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {moviesList.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <Tv className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-neutral-300">No cine links available in catalog</p>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">Create and index customized film packages above to start listing torrent bypass triggers.</p>
                  <a
                    href="#/admin/create"
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 text-xs font-semibold rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Link Now
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-850 text-neutral-400 bg-neutral-950/60 font-mono text-[11px] uppercase tracking-wider">
                        <th className="py-4 px-6 font-semibold">Film Details</th>
                        <th className="py-4 px-6 font-semibold hidden md:table-cell">Target URL slug</th>
                        <th className="py-4 px-6 font-semibold">Traffic Statistics</th>
                        <th className="py-4 px-6 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {moviesList.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map((m) => (
                        <tr key={m.id} className="hover:bg-neutral-900/30 transition">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {/* Small tiny poster thumbnail */}
                              <img 
                                src={m.poster_url} 
                                alt="" 
                                className="w-9 h-12 rounded object-cover border border-neutral-850 bg-neutral-900 shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).src = POSTER_PRESETS[0].url; }}
                              />
                              <div>
                                <span className="font-bold text-neutral-200 block truncate max-w-[150px] sm:max-w-xs">{m.title}</span>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                                  <span className="text-cyan-500 font-mono font-bold">{m.year}</span>
                                  <span>•</span>
                                  <span>{m.quality}</span>
                                  <span>•</span>
                                  <span>{m.size_gb}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-4 px-6 hidden md:table-cell font-mono text-xs">
                            <span className="text-cyan-400">/{m.slug}</span>
                            <div className="text-[10px] text-neutral-600 truncate max-w-xs">{m.download_url}</div>
                          </td>

                          <td className="py-4 px-6 font-mono text-xs">
                            <div className="space-y-1">
                              <span className="flex items-center gap-1.5 text-neutral-300">
                                <Eye className="w-3.5 h-3.5 text-neutral-500" /> {m.views_count.toLocaleString()} visits
                              </span>
                              <span className="flex items-center gap-1.5 text-neutral-300">
                                <Download className="w-3.5 h-3.5 text-neutral-500" /> {m.downloads_count.toLocaleString()} clicks
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => copyToClipboard(getShareableUrl(m.slug))}
                                className="p-2 rounded bg-neutral-950 hover:bg-neutral-850 border border-neutral-850 text-neutral-400 hover:text-cyan-400 transition"
                                title="Copy Shareable Link"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              
                              <a
                                href={`#/${m.slug}`}
                                className="p-2 rounded bg-neutral-950 hover:bg-neutral-850 border border-neutral-850 text-neutral-400 hover:text-cyan-400 transition inline-block"
                                title="Open Live Portal Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <button
                                onClick={() => handleEditClick(m)}
                                className="p-2 rounded bg-neutral-950 hover:bg-neutral-850 border border-neutral-850 text-neutral-400 hover:text-yellow-400 transition"
                                title="Edit Entry Details"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteMovie(m.id, m.title)}
                                className="p-2 rounded bg-neutral-950 hover:bg-red-950/80 border border-neutral-850 text-neutral-400 hover:text-red-400 transition"
                                title="Delete Entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* INLINE EDIT MODE DIALOG (Glassmorphic Slide-over Modal Overlay) */}
            {editingMovie && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative shadow-2xl">
                  
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-4">
                    <div className="flex items-center gap-2">
                      <Pencil className="w-5 h-5 text-yellow-500" />
                      <div>
                        <h2 className="text-lg font-bold text-neutral-100">Edit Portal Link Details</h2>
                        <p className="text-[11px] text-neutral-500 font-mono">ID: {editingMovie.id}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setEditingMovie(null)}
                      className="text-neutral-450 hover:text-white text-xs font-bold font-mono px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 transition"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <form onSubmit={handleUpdateMovie} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Film Title *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm focus:border-cyan-500/50 focus:outline-none text-white font-medium"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Friendly Slug *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-cyan-400 font-mono text-sm focus:border-cyan-500/50 focus:outline-none"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Release Year</label>
                        <input
                          type="text"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm focus:border-cyan-500/50 focus:outline-none text-white text-[13px]"
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Genres</label>
                        <input
                          type="text"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm focus:border-cyan-500/50 focus:outline-none text-white text-[13px]"
                          value={editGenre}
                          onChange={(e) => setEditGenre(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Format Size</label>
                        <input
                          type="text"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm focus:border-cyan-500/50 focus:outline-none text-white text-[13px]"
                          value={editSize}
                          onChange={(e) => setEditSize(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Quality Label</label>
                        <input
                          type="text"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm focus:border-cyan-500/50 focus:outline-none text-white text-[13px]"
                          value={editQuality}
                          onChange={(e) => setEditQuality(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Poster Template Image URL</label>
                        <input
                          type="url"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono focus:border-cyan-500/50 focus:outline-none text-white"
                          value={editPoster}
                          onChange={(e) => setEditPoster(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Core Target Torrent / Magnet Link *</label>
                      <input
                        type="url"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-cyan-400 font-mono text-xs focus:border-cyan-500/50 focus:outline-none"
                        value={editDownload}
                        onChange={(e) => setEditDownload(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Synopsys Description</label>
                      <textarea
                        rows={3}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs focus:border-cyan-500/50 focus:outline-none text-white leading-relaxed resize-none"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-850">
                      <button
                        type="button"
                        onClick={() => setEditingMovie(null)}
                        className="px-4 py-2 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs font-bold transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-sky-600 text-neutral-950 font-black rounded-lg text-xs hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition duration-200"
                      >
                        Save & Deploy Updates
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. CREATE DYNAMIC LINK FORM VIEW ==================== */}
        {(currentHash === '#/admin/create' && isLoggedIn) && (
          <div className="space-y-8 animate-fade-in">
            {/* Path Breadcrumbs */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                <a href="#/" onClick={() => { window.location.hash = '#/'; }} className="hover:text-cyan-400">Cinemood Drive</a>
                <span>/</span>
                <a href="#/admin" onClick={() => { window.location.hash = '#/admin'; }} className="hover:text-cyan-400">Console</a>
                <span>/</span>
                <span className="text-cyan-400">Generate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                <Plus className="w-7 h-7 text-cyan-400 animate-pulse" /> Register New Download Endpoint
              </h1>
              <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
                Add premium content details below. This generates an optimized, SEO-friendly custom slug URL structure (e.g. <code className="text-cyan-400 bg-neutral-900 px-1 py-0.5 rounded">/leo-2024</code>) featuring countdown gates.
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-neutral-900/35 border border-cyan-500/10 shadow-[0_0_50px_rgba(6,182,212,0.08)] rounded-2xl p-6 sm:p-8 space-y-5 relative overflow-hidden backdrop-blur-xl">
              {/* Ambient neon blue glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />

              <form onSubmit={handleAddMovie} className="space-y-4 relative z-10">
                
                {/* Film Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Film Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leo"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-sm focus:outline-none transition text-white font-medium"
                    value={newTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>

                {/* Friendly Slug Portal URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    Friendly Slug Portal URL * <span className="text-cyan-500 text-[9px] font-mono font-normal">(Dynamic link)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-neutral-500 font-mono text-xs select-none">/</span>
                    <input
                      type="text"
                      required
                      placeholder="leo-2024"
                      className="w-full pl-6 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-cyan-400 font-mono focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-sm focus:outline-none transition"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                    />
                  </div>
                </div>

                {/* Poster Backplate Image URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Poster Backplate Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-cyan-500/50 text-sm focus:outline-none transition text-white text-[13px] font-mono"
                    value={newPoster}
                    onChange={(e) => setNewPoster(e.target.value)}
                  />
                  
                  {/* Quick presets list selector */}
                  <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest font-mono">Presets:</span>
                    {POSTER_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setNewPoster(p.url)}
                        className={`text-[9px] px-2 py-0.5 rounded border transition ${
                          newPoster === p.url 
                            ? 'bg-cyan-950/50 text-cyan-400 border-cyan-500/30 font-bold' 
                            : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-700'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Download Link */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">
                    Core Target Torrent / Direct Download Link *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://archive.org/download/... (Magnet, Torrent, or Stream CDN URL)"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-805 text-cyan-400 font-mono focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-[13px] focus:outline-none transition"
                    value={newDownload}
                    onChange={(e) => setNewDownload(e.target.value)}
                  />
                  <p className="text-[9px] text-neutral-500 leading-normal">This URL is encrypted behind our countdown and security integrity gate. Users will never see it until they resolve verification.</p>
                </div>

                {/* Synopsys Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Synopsys Description</label>
                  <textarea
                    placeholder="Write brief description for the audience..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-cyan-500/50 text-sm focus:outline-none transition text-white leading-relaxed resize-none"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>

                {/* Submit & Cancel */}
                <div className="pt-3 flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-grow py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-neutral-950 font-black text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.01] transition-all duration-300 disabled:opacity-55 cursor-pointer"
                  >
                    {isSubmitting ? 'Writing to schema DB...' : 'Create Link'}
                  </button>
                  <a
                    href="#/admin"
                    className="px-5 py-3 rounded-xl bg-neutral-900 border border-neutral-850 text-neutral-400 hover:text-white transition text-xs font-bold text-center"
                  >
                    Cancel
                  </a>
                </div>

              </form>
            </div>
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
              <div className="max-w-md mx-auto text-center py-16 bg-neutral-900/10 border border-neutral-850 rounded-3xl space-y-4">
                <FileVideo className="w-16 h-16 text-neutral-700 mx-auto" />
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-neutral-200">Movie Route Not Found</h2>
                  <p className="text-sm text-neutral-400 px-6">We checked our database registry for slug <code className="text-red-400 font-mono">/{activeSlug}</code> but could not resolve a target link package.</p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <a 
                    href="#/" 
                    onClick={() => { window.location.hash = '#/'; }} 
                    className="px-4 py-2 bg-neutral-950 border border-neutral-800 hover:border-cyan-500/30 text-neutral-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Go Back Home
                  </a>
                  <a 
                    href="#/admin" 
                    onClick={() => { window.location.hash = '#/admin'; }} 
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 text-neutral-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Deploy /{activeSlug}
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg mx-auto py-6">
                {/* Back button above card */}
                <div className="flex justify-start px-1">
                  <a 
                    href="#/" 
                    onClick={() => { window.location.hash = '#/'; }} 
                    className="inline-flex items-center gap-2 text-xs font-mono text-neutral-500 hover:text-cyan-400 font-bold transition group"
                  >
                    <ArrowLeft className="w-4 h-4 text-cyan-500 group-hover:-translate-x-0.5 transition" /> Back to Gallery
                  </a>
                </div>

                {/* Centered Minimal Premium Download Portal */}
                <div className="bg-neutral-900/40 border border-cyan-500/10 shadow-[0_0_50px_rgba(6,182,212,0.1)] rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden text-center space-y-6 animate-fade-in">
                  {/* Ambient Neon Blue Radial Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />

                  {/* Small Centered Title */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-cyan-400 font-bold block">
                      Target Package
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                      {selectedMovie.title}
                    </h2>
                    <div className="flex justify-center items-center gap-2 text-[11px] text-neutral-400 font-mono mt-1 bg-neutral-950/40 py-1 px-3 rounded-full border border-neutral-900 w-fit mx-auto">
                      <span>{selectedMovie.year}</span>
                      <span className="text-neutral-800">•</span>
                      <span>{selectedMovie.quality}</span>
                      <span className="text-neutral-800">•</span>
                      <span>{selectedMovie.size_gb}</span>
                    </div>
                  </div>

                  {/* --- COUNTDOWN TIMER (FOR STAGE IDLE/COUNTING/READY) --- */}
                  {(timerStage === 'counting' || timerStage === 'idle' || timerStage === 'ready') && (
                    <div className="space-y-6 py-4 animate-fade-in flex flex-col items-center">
                      {/* Countdown Ring Graphics */}
                      <div className="relative inline-flex items-center justify-center">
                        {/* Static Outer Ring */}
                        <div className="absolute inset-0 border-[3px] border-neutral-850/80 rounded-full w-24 h-24" />
                        {/* Animated Segment Ring */}
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="44"
                            stroke="#06b6d4"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray="276px"
                            strokeDashoffset={`${276 - (276 * countdown) / 10}px`}
                            className="transition-all duration-1000 ease-linear"
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        <div className="absolute bg-neutral-950/90 border border-neutral-850/60 w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg">
                          <span className="text-3xl font-black font-mono tracking-tight text-white">{countdown}</span>
                          <span className="text-[8px] text-cyan-400 font-mono uppercase tracking-widest leading-none mt-1">SECONDS</span>
                        </div>
                      </div>

                      <div className="space-y-1 max-w-xs">
                        <p className="text-xs text-neutral-450 leading-relaxed font-mono">
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
                        className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                          countdown > 0 
                            ? 'bg-neutral-955 border border-neutral-850 text-neutral-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-neutral-950 font-black cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.01] transition-all'
                        }`}
                      >
                        {countdown > 0 ? (
                          <>
                            <Clock className="w-4 h-4 text-neutral-600 animate-pulse shrink-0" /> Preparing Link ({countdown}s)
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4.5 h-4.5 animate-bounce shrink-0 text-neutral-950" /> Unlock Download <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* --- VERIFICATION ANIMATION & PROGRESS BAR (FOR STAGE VERIFYING) --- */}
                  {timerStage === 'verifying' && (
                    <div className="space-y-6 py-6 animate-fade-in flex flex-col items-center">
                      
                      {/* Compact Neon spinning shield/globe loader */}
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/10 animate-spin" style={{ animationDuration: '6s' }} />
                        <div className="absolute w-16 h-16 rounded-full border-2 border-t-cyan-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin" />
                        <ShieldCheck className="w-8 h-8 text-cyan-400 animate-pulse" />
                      </div>

                      {/* Progress Bar & Status Text */}
                      <div className="w-full space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                          <span>Verifying Link...</span>
                          <span>{verificationProgress}%</span>
                        </div>

                        <div className="h-2 w-full bg-neutral-950 border border-neutral-900 rounded-full overflow-hidden p-[1px]">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-505 shadow-[0_0_10px_rgba(6,182,212,0.5)] rounded-full transition-all duration-300" 
                            style={{ width: `${verificationProgress}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-neutral-550 font-mono tracking-wide uppercase">
                        Establishing safe connection tunnels...
                      </p>
                    </div>
                  )}

                  {/* --- FINAL UNLOCK/DOWNLOAD BUTTON (FOR STAGE UNLOCKED) --- */}
                  {timerStage === 'unlocked' && (
                    <div className="space-y-6 py-4 animate-fade-in flex flex-col items-center">
                      
                      {/* Compact Unlocked success badge */}
                      <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-neutral-200 uppercase tracking-widest font-mono">
                          Verified Link Unlocked
                        </h4>
                        <p className="text-[10px] text-neutral-550 font-mono">
                          Safe targeted magnet link compiled successfully.
                        </p>
                      </div>

                      {/* Final Download Button */}
                      <div className="w-full space-y-3 pb-2">
                        <a
                          href={selectedMovie.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            CinemoodDB.incrementDownloads(selectedMovie.id);
                            fetchMovies();
                          }}
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-450 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-955 font-black tracking-wider uppercase text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(52,211,153,0.4)] hover:scale-[1.01] transition-all"
                        >
                          <Download className="w-5 h-5 text-neutral-950 shrink-0 animate-bounce" /> Unlock Direct Download
                        </a>

                        <button
                          type="button"
                          onClick={resetCountdownTimer}
                          className="text-[10px] font-mono text-neutral-500 hover:text-cyan-400 transition uppercase tracking-wider bg-transparent border-none cursor-pointer focus:outline-none pt-2"
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-850 p-6 sm:p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-5">
            <div className="absolute top-4 right-4 animate-pulse">
              <button 
                onClick={() => setActivePolicyModal(null)}
                className="w-8 h-8 rounded-lg bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition text-xs font-mono font-bold cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-b border-neutral-850 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.4)]" />
              <h3 className="text-sm font-black font-mono uppercase tracking-widest text-cyan-400">
                {activePolicyModal === 'privacy' && 'Privacy Policy & Data Shield'}
                {activePolicyModal === 'dmca' && 'Route Integrity & DMCA Portal'}
                {activePolicyModal === 'contact' && 'Operator Diagnostics Interface'}
              </h3>
            </div>

            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-mono space-y-4">
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
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-850 select-all font-mono text-xs text-cyan-400 text-center uppercase tracking-wide">
                    compliance@cinemood-drive.network
                  </div>
                  <p>
                    Alternatively, initiate secure direct messaging channels via our public Telegram updater nodes to query live system architects.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActivePolicyModal(null)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-wider transition duration-300"
              >
                Close Gateway Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Cyber Glassmorphism Admin Login Modal Popup */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-850 p-6 sm:p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] space-y-5">
            
            <div className="absolute top-4 right-4 animate-pulse">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="w-8 h-8 rounded-lg bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition text-xs font-mono font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-b border-neutral-850 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.4)]" />
              <h3 className="text-sm font-black font-mono uppercase tracking-widest text-cyan-400">
                Secure Operator Entry
              </h3>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
              Administrative credentials required to deploy fresh direct bypass tunnels and inspect analytics telemetry.
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">
                  Security Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-cyan-400/50" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-cyan-500/50 focus:outline-none text-xs text-white font-mono"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">
                  Password Key
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-cyan-400/50" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-cyan-500/50 focus:outline-none text-xs text-white font-mono"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-350 hover:to-indigo-450 text-neutral-950 font-black text-xs uppercase tracking-widest transition duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-neutral-950" /> Initialize Authentication
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
