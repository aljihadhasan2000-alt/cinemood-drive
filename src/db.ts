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

// Helper to extract session auth bearer token from client localStorage
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('cinemood_admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Stateless client DB proxy wrapper querying the custom Node/Express secure backend layer
export class CinemoodDB {
  
  static getConnectionStatus() {
    // Sync with memory representation statically or through request
    return {
      configured: true,
      url: '/api/movies',
      hasKey: true,
      provider: 'High-Speed Secure Full-Stack Node Router'
    };
  }

  // Fetch Connection Status dynamically from Express API
  static async fetchConnectionStatus() {
    try {
      const res = await fetch('/api/movies/connection-status');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Could not load status metadata:', e);
    }
    return this.getConnectionStatus();
  }

  // Get all movies from secure backend
  static async getAllMovies(): Promise<MovieLink[]> {
    const res = await fetch('/api/movies');
    if (!res.ok) {
      throw new Error('Failed to retrieve dynamic cinema links catalog');
    }
    const data = await res.json();
    return data as MovieLink[];
  }

  // Fetch single movie by its slug path
  static async getMovieBySlug(slug: string): Promise<MovieLink | null> {
    const res = await fetch(`/api/movies/${encodeURIComponent(slug)}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Failed to resolve node route path for "${slug}"`);
    }
    return await res.json();
  }

  // Add highly checked dynamic movie link (ADMIN SECURE)
  static async addMovie(movieData: Omit<MovieLink, 'id' | 'views_count' | 'downloads_count' | 'created_at'>): Promise<MovieLink> {
    const res = await fetch('/api/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(movieData)
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error('UNAUTHORIZED: Administrative handshake missing or session has expired.');
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Could not instantiate a secure bypass gateway link');
    }

    return await res.json();
  }

  // Update dynamic link details (ADMIN SECURE)
  static async updateMovie(id: string, updatedFields: Partial<MovieLink>): Promise<MovieLink | null> {
    const res = await fetch(`/api/movies/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updatedFields)
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error('UNAUTHORIZED: Admin token has expired or is invalid.');
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to modify database node record');
    }

    return await res.json();
  }

  // Increment view counter dynamically (Public API)
  static async incrementViews(id: string): Promise<void> {
    try {
      await fetch(`/api/movies/${encodeURIComponent(id)}/view`, {
        method: 'POST'
      });
    } catch (e) {
      console.warn('Views metric sync failed:', e);
    }
  }

  // Increment download clicks counter dynamically (Public API)
  static async incrementDownloads(id: string): Promise<void> {
    try {
      await fetch(`/api/movies/${encodeURIComponent(id)}/download`, {
        method: 'POST'
      });
    } catch (e) {
      console.warn('Downloads counter sync failed:', e);
    }
  }

  // Completely destroy interactive gateway node (ADMIN SECURE)
  static async deleteMovie(id: string): Promise<boolean> {
    const res = await fetch(`/api/movies/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error('UNAUTHORIZED: Deletion rejected. administrative credentials not validated.');
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to delete record from cluster catalog');
    }

    return true;
  }
}
