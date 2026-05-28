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

export class CinemoodDB {
  static getConnectionStatus() {
    return {
      configured: true,
      url: '/api/movies',
      hasKey: true,
      provider: 'GitHub API Persistent Storage Engine'
    };
  }

  static async getAllMovies(): Promise<MovieLink[]> {
    try {
      const resp = await fetch('/api/movies');
      if (!resp.ok) throw new Error('Database loading error from API gate');
      return await resp.json() as MovieLink[];
    } catch (err) {
      console.error('[Client DB] Failed to fetch movies:', err);
      return [];
    }
  }

  static async getMovieBySlug(slug: string): Promise<MovieLink | null> {
    try {
      const movies = await this.getAllMovies();
      const matched = movies.find(m => m.slug.toLowerCase().trim() === slug.toLowerCase().trim());
      return matched || null;
    } catch (err) {
      console.error('[Client DB] Failed to get movie by slug:', err);
      return null;
    }
  }

  static async addMovie(movieData: Omit<MovieLink, 'id' | 'views_count' | 'downloads_count' | 'created_at'>): Promise<MovieLink> {
    const resp = await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movieData)
    });
    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to sync new link back to central JSON repo');
    }
    return await resp.json() as MovieLink;
  }

  static async updateMovie(id: string, updatedFields: Partial<MovieLink>): Promise<MovieLink | null> {
    const resp = await fetch(`/api/movies/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    });
    if (!resp.ok) return null;
    return await resp.json() as MovieLink;
  }

  static async incrementViews(id: string): Promise<void> {
    await fetch(`/api/movies/${encodeURIComponent(id)}/views`, {
      method: 'POST'
    }).catch(err => console.error('[Client DB] Views increment failed:', err));
  }

  static async incrementDownloads(id: string): Promise<void> {
    await fetch(`/api/movies/${encodeURIComponent(id)}/downloads`, {
      method: 'POST'
    }).catch(err => console.error('[Client DB] Downloads increment failed:', err));
  }

  static async deleteMovie(id: string): Promise<boolean> {
    const resp = await fetch(`/api/movies/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(() => null);
    return !!resp && resp.ok;
  }
}
