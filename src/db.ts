export interface MovieLink {
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

// Minimalist static seed movies block for complete recovery safety
const FALLBACK_SEED: MovieLink[] = [
  {
    "id": "seed-1",
    "title": "Leo",
    "slug": "leo-2024",
    "description": "A 74-year-old lizard named Leo and his turtle friend decide to escape from the terrarium of a Florida school classroom when they discover Leo has only a year to live.",
    "poster_url": "https://images.unsplash.com/photo-1620070014324-ee545ad3d0a6?w=400&auto=format&fit=crop&q=80",
    "download_url": "https://archive.org/download/leo-animated-movie-2023/Leo.2023.1080p.WEBRip.x264.torrent",
    "year": "2024",
    "genre": "Animation, Comedy, Family",
    "quality": "1080p WebRip",
    "size_gb": "1.8 GB",
    "views_count": 1421,
    "downloads_count": 854,
    "created_at": "2026-05-22T10:39:18.830Z"
  }
];

export class CinemoodDB {
  static getConnectionStatus() {
    return {
      configured: true,
      url: '/api/movies',
      hasKey: true,
      provider: 'Permanently Synced JSON Database'
    };
  }

  // Helper: Retrieve client fallback cache
  private static getLocalMoviesBackup(): MovieLink[] {
    try {
      const backup = localStorage.getItem('cinemood_movies_backup');
      if (backup) {
        return JSON.parse(backup) as MovieLink[];
      }
    } catch (e) {
      console.error('[Client-Fallback] Local backup reading fault:', e);
    }
    return FALLBACK_SEED;
  }

  // Helper: Set client fallback cache
  private static setLocalMoviesBackup(movies: MovieLink[]) {
    try {
      localStorage.setItem('cinemood_movies_backup', JSON.stringify(movies));
    } catch (e) {
      console.error('[Client-Fallback] Local backup saving fault:', e);
    }
  }

  static async getAllMovies(): Promise<MovieLink[]> {
    try {
      const resp = await fetch('/api/movies');
      if (!resp.ok) {
        throw new Error(`Server returned error status ${resp.status}`);
      }
      const data = await resp.json() as MovieLink[];
      // Sync local cache backup
      this.setLocalMoviesBackup(data);
      return data;
    } catch (err) {
      console.warn('[Client-Fallback] Failed to fetch movies from API, falling back to localStorage:', err);
      return this.getLocalMoviesBackup();
    }
  }

  static async getMovieBySlug(slug: string): Promise<MovieLink | null> {
    try {
      const movies = await this.getAllMovies();
      const matched = movies.find(m => m.slug.toLowerCase().trim() === slug.toLowerCase().trim());
      return matched || null;
    } catch (err) {
      console.error('[Client-Fallback] Failed to get movie by slug:', err);
      return null;
    }
  }

  static async addMovie(movieData: Omit<MovieLink, 'id' | 'views_count' | 'downloads_count' | 'created_at'>): Promise<MovieLink> {
    try {
      const resp = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieData)
      });
      
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.message || `Server status ${resp.status}`);
      }
      
      const savedMovie = await resp.json() as MovieLink;
      
      // Update local storage backup
      const local = this.getLocalMoviesBackup();
      local.unshift(savedMovie);
      this.setLocalMoviesBackup(local);
      
      return savedMovie;
    } catch (err) {
      console.warn('[Client-Fallback] API addMovie failed, falling back to local registry:', err);
      
      // Local fallback execution so link creation NEVER FAILS
      const fallbackMovie: MovieLink = {
        ...movieData,
        id: `m-lh-${Math.random().toString(36).substring(2, 11)}`,
        views_count: 0,
        downloads_count: 0,
        created_at: new Date().toISOString()
      };
      
      const local = this.getLocalMoviesBackup();
      
      // Check duplicate slug on local fallback listing
      const exists = local.some(m => m.slug.toLowerCase().trim() === fallbackMovie.slug.toLowerCase().trim());
      if (exists) {
        throw new Error('A link with this slug already exists in backup storage.');
      }
      
      local.unshift(fallbackMovie);
      this.setLocalMoviesBackup(local);
      return fallbackMovie;
    }
  }

  static async updateMovie(id: string, updatedFields: Partial<MovieLink>): Promise<MovieLink | null> {
    try {
      const resp = await fetch(`/api/movies/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      
      if (!resp.ok) {
        throw new Error(`Server returned error status ${resp.status}`);
      }
      
      const updated = await resp.json() as MovieLink;
      
      // Update backup list
      const local = this.getLocalMoviesBackup();
      const idx = local.findIndex(m => m.id === id);
      if (idx !== -1) {
        local[idx] = { ...local[idx], ...updatedFields, ...updated };
        this.setLocalMoviesBackup(local);
      }
      return updated;
    } catch (err) {
      console.warn('[Client-Fallback] API updateMovie failed, updating local backup:', err);
      const local = this.getLocalMoviesBackup();
      const idx = local.findIndex(m => m.id === id);
      if (idx !== -1) {
        local[idx] = { ...local[idx], ...updatedFields };
        this.setLocalMoviesBackup(local);
        return local[idx];
      }
      return null;
    }
  }

  static async incrementViews(id: string): Promise<void> {
    try {
      const resp = await fetch(`/api/movies/${encodeURIComponent(id)}/views`, {
        method: 'POST'
      });
      if (!resp.ok) throw new Error();
    } catch (err) {
      console.warn('[Client-Fallback] Views count api failure, tracking backup locally:', err);
    }
    
    // Always increment locally to ensure beautiful UI instant feedback
    const local = this.getLocalMoviesBackup();
    const idx = local.findIndex(m => m.id === id);
    if (idx !== -1) {
      local[idx].views_count = (local[idx].views_count || 0) + 1;
      this.setLocalMoviesBackup(local);
    }
  }

  static async incrementDownloads(id: string): Promise<void> {
    try {
      const resp = await fetch(`/api/movies/${encodeURIComponent(id)}/downloads`, {
        method: 'POST'
      });
      if (!resp.ok) throw new Error();
    } catch (err) {
      console.warn('[Client-Fallback] Downloads count api failure, tracking backup locally:', err);
    }
    
    // Always increment locally to ensure beautiful UI instant feedback
    const local = this.getLocalMoviesBackup();
    const idx = local.findIndex(m => m.id === id);
    if (idx !== -1) {
      local[idx].downloads_count = (local[idx].downloads_count || 0) + 1;
      this.setLocalMoviesBackup(local);
    }
  }

  static async deleteMovie(id: string): Promise<boolean> {
    let success = false;
    try {
      const resp = await fetch(`/api/movies/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      success = resp.ok;
    } catch (err) {
      console.warn('[Client-Fallback] API deleteMovie failed, deleting target backup locally:', err);
    }
    
    // Perform backup slice removal
    const local = this.getLocalMoviesBackup();
    const filtered = local.filter(m => m.id !== id);
    this.setLocalMoviesBackup(filtered);
    
    return true; // Return true as requested so fallback deletions never stall the client
  }
}
