import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

interface MovieLink {
  id: string;
  title: string;
  slug: string;
  description: string;
  poster_url: string;
  download_url: string;
  year: string;
  genre: string;
  quality: string;
  size_gb: string;
  views_count: number;
  downloads_count: number;
  created_at: string;
}

const SEED_MOVIES: MovieLink[] = [
  {
    id: 'seed-1',
    title: 'Leo',
    slug: 'leo-2024',
    description: 'A 74-year-old lizard named Leo and his turtle friend decide to escape from the terrarium of a Florida school classroom where they have been living for decades, after discovering Leo has only one year left to live.',
    poster_url: 'https://images.unsplash.com/photo-1620070014324-ee545ad3d0a6?w=400&auto=format&fit=crop&q=80',
    download_url: 'https://archive.org/download/leo-animated-movie-2023/Leo.2023.1080p.WEBRip.x264.torrent',
    year: '2024',
    genre: 'Animation, Comedy, Family',
    quality: '1080p WebRip',
    size_gb: '1.8 GB',
    views_count: 1420,
    downloads_count: 852,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'seed-2',
    title: 'Dune: Part Two',
    slug: 'dune-part-two-2024',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    download_url: 'https://archive.org/download/dune-part-two-cinematic/Dune2.1080p.BluRay.torrent',
    year: '2024',
    genre: 'Sci-Fi, Adventure, Drama',
    quality: '4K UltraHD',
    size_gb: '3.1 GB',
    views_count: 3241,
    downloads_count: 1954,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'seed-3',
    title: 'Interstellar',
    slug: 'interstellar-2014',
    description: 'When Earth becomes uninhabitable, a team of explorers undertakes the most important mission in human history: traveling beyond this galaxy to discover whether mankind has a future among the stars.',
    poster_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    download_url: 'https://archive.org/download/interstellar-stellar-highres/Interstellar.1080p.BluRay.torrent',
    year: '2014',
    genre: 'Sci-Fi, Adventure, Mystery',
    quality: '1080p BluRay',
    size_gb: '2.5 GB',
    views_count: 5120,
    downloads_count: 4102,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'seed-4',
    title: 'Oppenheimer',
    slug: 'oppenheimer-2023',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, bringing about the nuclear age and its complex political aftermath.',
    poster_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&auto=format&fit=crop&q=80',
    download_url: 'https://archive.org/download/oppenheimer-imax-h264/Oppenheimer.1080p.IMAX.torrent',
    year: '2023',
    genre: 'Biography, Drama, History',
    quality: '1080p HDR',
    size_gb: '2.8 GB',
    views_count: 2890,
    downloads_count: 1477,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const STORAGE_FILE = path.join(process.cwd(), 'movies-catalog.json');
const SESSION_SECRET = process.env.SESSION_SECRET || 'cinemood-secure-crypto-key-98234823948';

// Initialize Supabase if variables exist
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'YOUR_SUPABASE_URL');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Helpers to load and save local file movies
function loadMoviesFromFile(): MovieLink[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading movies file:', err);
  }
  // Initialize with seed data if absent
  saveMoviesToFile(SEED_MOVIES);
  return SEED_MOVIES;
}

function saveMoviesToFile(movies: MovieLink[]) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(movies, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed writing movies file:', err);
  }
}

// Token Generator and Verifier using cryptographic HMAC SHA-256
function generateSessionToken(email: string): string {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours duration
  const payload = JSON.stringify({ email, expiresAt });
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

function verifySessionToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const payloadStr = Buffer.from(parts[0], 'base64').toString('utf8');
    const signature = parts[1];
    
    const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(payloadStr);
    if (Date.now() > payload.expiresAt) return null; // Token expired
    return payload.email;
  } catch (err) {
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper inside routes to extract token from Header or Cookie
  const extractToken = (req: express.Request): string | null => {
    let token = req.headers.authorization?.startsWith('Bearer ') 
      ? req.headers.authorization.slice(7) 
      : null;
    
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc: any, c: string) => {
        const parts = c.trim().split('=');
        if (parts.length >= 2) {
          acc[parts[0]] = parts.slice(1).join('=');
        }
        return acc;
      }, {});
      token = cookies['admin_session'] || null;
    }
    return token;
  };

  // Secure Authentication Middleware
  const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Administrative authentication token required.' });
    }

    const email = verifySessionToken(token);
    if (!email || email !== 'aljihadhasan220@gmail.com') {
      return res.status(403).json({ error: 'Access forbidden. Session is invalid or has expired.' });
    }

    next();
  };

  // ==================== AUTH ENTRIES ====================
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const correctEmail = 'aljihadhasan220@gmail.com';
    const correctPassword = '45684522';

    if (email && email.trim() === correctEmail && password === correctPassword) {
      const token = generateSessionToken(correctEmail);
      // Set secure cookie as defensive mechanism (fallback in case header isn't persisted)
      res.cookie('admin_session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
      });
      return res.json({
        success: true,
        token,
        user: { email: correctEmail }
      });
    } else {
      return res.status(401).json({ error: 'Invalid administrative credentials.' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('admin_session');
    return res.json({ success: true, message: 'Session closed successfully.' });
  });

  app.get('/api/auth/session', (req, res) => {
    const token = extractToken(req);
    if (!token) {
      return res.json({ loggedIn: false });
    }

    const email = verifySessionToken(token);
    if (email === 'aljihadhasan220@gmail.com') {
      return res.json({ loggedIn: true, user: { email } });
    }
    return res.json({ loggedIn: false });
  });

  // ==================== MOVIES CATALOG ENTRIES ====================
  // GET all movies
  app.get('/api/movies', async (req, res) => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return res.json(data);
        }
      } catch (err) {
        console.warn('Supabase fetch failed on server, using file-based storage:', err);
      }
    }
    const movies = loadMoviesFromFile();
    return res.json(movies);
  });

  // GET movie info status
  app.get('/api/movies/connection-status', (req, res) => {
    return res.json({
      configured: isSupabaseConfigured,
      url: SUPABASE_URL || 'Not specified',
      hasKey: !!SUPABASE_ANON_KEY,
      provider: isSupabaseConfigured ? 'Live Supabase DB' : 'Enriched Local Sandbox'
    });
  });

  // GET single movie by slug
  app.get('/api/movies/:slug', async (req, res) => {
    const { slug } = req.params;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (!error && data) {
          return res.json(data);
        }
      } catch (err) {
        console.warn('Supabase get by slug failed on server:', err);
      }
    }
    const movies = loadMoviesFromFile();
    const movie = movies.find(m => m.slug.toLowerCase() === slug.toLowerCase()) || null;
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }
    return res.json(movie);
  });

  // POST increment views count
  app.post('/api/movies/:id/view', async (req, res) => {
    const { id } = req.params;
    if (supabase) {
      try {
        const current = await supabase.from('movies').select('views_count').eq('id', id).maybeSingle();
        const nextViews = (current?.data?.views_count || 0) + 1;
        await supabase.from('movies').update({ views_count: nextViews }).eq('id', id);
        return res.json({ success: true });
      } catch (err) {
        // Carry on to local fallback
      }
    }
    const movies = loadMoviesFromFile();
    const index = movies.findIndex(m => m.id === id);
    if (index !== -1) {
      movies[index].views_count += 1;
      saveMoviesToFile(movies);
    }
    return res.json({ success: true });
  });

  // POST increment downloads count
  app.post('/api/movies/:id/download', async (req, res) => {
    const { id } = req.params;
    if (supabase) {
      try {
        const current = await supabase.from('movies').select('downloads_count').eq('id', id).maybeSingle();
        const nextDownloads = (current?.data?.downloads_count || 0) + 1;
        await supabase.from('movies').update({ downloads_count: nextDownloads }).eq('id', id);
        return res.json({ success: true });
      } catch (err) {
        // Carry on to local fallback
      }
    }
    const movies = loadMoviesFromFile();
    const index = movies.findIndex(m => m.id === id);
    if (index !== -1) {
      movies[index].downloads_count += 1;
      saveMoviesToFile(movies);
    }
    return res.json({ success: true });
  });

  // POST create a fresh new movie (SECURED)
  app.post('/api/movies', requireAdminAuth, async (req, res) => {
    const movieData = req.body;
    const newMovie: MovieLink = {
      ...movieData,
      id: `m-${Math.random().toString(36).substr(2, 9)}`,
      views_count: 0,
      downloads_count: 0,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('movies')
          .insert([newMovie])
          .select()
          .single();
        if (!error && data) {
          return res.status(201).json(data);
        }
      } catch (err) {
        console.error('Supabase write failed, writing to fallback catalog:', err);
      }
    }

    const movies = loadMoviesFromFile();
    movies.unshift(newMovie);
    saveMoviesToFile(movies);
    return res.status(201).json(newMovie);
  });

  // PUT update a movie (SECURED)
  app.put('/api/movies/:id', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const updatedFields = req.body;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('movies')
          .update(updatedFields)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return res.json(data);
        }
      } catch (err) {
        console.error('Supabase update failed:', err);
      }
    }

    const movies = loadMoviesFromFile();
    const index = movies.findIndex(m => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    movies[index] = { ...movies[index], ...updatedFields };
    saveMoviesToFile(movies);
    return res.json(movies[index]);
  });

  // DELETE a movie (SECURED)
  app.delete('/api/movies/:id', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    if (supabase) {
      try {
        const { error } = await supabase
          .from('movies')
          .delete()
          .eq('id', id);
        if (!error) {
          // Sync locally as well
        }
      } catch (err) {
        console.error('Supabase delete failed:', err);
      }
    }

    const movies = loadMoviesFromFile();
    const filtered = movies.filter(m => m.id !== id);
    saveMoviesToFile(filtered);
    return res.json({ success: true, message: 'Movie deleted successfully.' });
  });

  // ==================== GATEWAY ROUTE MIDDLEWARE FOR INDEX REDIRECTS ====================
  // Check direct hits to admin pages with standard URLs
  app.get(['/admin', '/create', '/manage-links'], (req, res, next) => {
    const token = extractToken(req);
    const email = token ? verifySessionToken(token) : null;
    if (!email || email !== 'aljihadhasan220@gmail.com') {
      // Direct unauthorized browser requests back of standard relative route
      return res.redirect('/#/');
    }
    next();
  });

  // Serve static assets or mount Vite dev handler
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CINEMOOD SERVER] Node secure gate actively listening on port ${PORT}`);
  });
}

startServer();
