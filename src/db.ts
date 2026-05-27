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

const DEFAULT_MOVIES: MovieLink[] = [
  {
    "id": "seed-1",
    "title": "Leo",
    "slug": "leo-2024",
    "description": "A 74-year-old lizard named Leo and his turtle friend decide to escape from the terrarium of a Florida school classroom where they have been living for decades, after discovering Leo has only one year left to live.",
    "poster_url": "https://images.unsplash.com/photo-1620070014324-ee545ad3d0a6?w=400&auto=format&fit=crop&q=80",
    "download_url": "https://archive.org/download/leo-animated-movie-2023/Leo.2023.1080p.WEBRip.x264.torrent",
    "year": "2024",
    "genre": "Animation, Comedy, Family",
    "quality": "1080p WebRip",
    "size_gb": "1.8 GB",
    "views_count": 1421,
    "downloads_count": 854,
    "created_at": "2026-05-22T10:39:18.830Z"
  },
  {
    "id": "seed-2",
    "title": "Dune: Part Two",
    "slug": "dune-part-two-2024",
    "description": "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
    "poster_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80",
    "download_url": "https://archive.org/download/dune-part-two-cinematic/Dune2.1080p.BluRay.torrent",
    "year": "2024",
    "genre": "Sci-Fi, Adventure, Drama",
    "quality": "4K UltraHD",
    "size_gb": "3.1 GB",
    "views_count": 3241,
    "downloads_count": 1954,
    "created_at": "2026-05-24T10:39:18.830Z"
  },
  {
    "id": "seed-3",
    "title": "Interstellar",
    "slug": "interstellar-2014",
    "description": "When Earth becomes uninhabitable, a team of explorers undertakes the most important mission in human history: traveling beyond this galaxy to discover whether mankind has a future among the stars.",
    "poster_url": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80",
    "download_url": "https://archive.org/download/interstellar-stellar-highres/Interstellar.1080p.BluRay.torrent",
    "year": "2014",
    "genre": "Sci-Fi, Adventure, Mystery",
    "quality": "1080p BluRay",
    "size_gb": "2.5 GB",
    "views_count": 5120,
    "downloads_count": 4102,
    "created_at": "2026-05-17T10:39:18.830Z"
  },
  {
    "id": "seed-4",
    "title": "Oppenheimer",
    "slug": "oppenheimer-2023",
    "description": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, bringing about the nuclear age and its complex political aftermath.",
    "poster_url": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&auto=format&fit=crop&q=80",
    "download_url": "https://archive.org/download/oppenheimer-imax-h264/Oppenheimer.1080p.IMAX.torrent",
    "year": "2023",
    "genre": "Biography, Drama, History",
    "quality": "1080p HDR",
    "size_gb": "2.8 GB",
    "views_count": 2891,
    "downloads_count": 1477,
    "created_at": "2026-05-20T10:39:18.830Z"
  }
];

function getStoredMovies(): MovieLink[] {
  const stored = localStorage.getItem('cinemood_movies');
  if (!stored) {
    localStorage.setItem('cinemood_movies', JSON.stringify(DEFAULT_MOVIES));
    return DEFAULT_MOVIES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_MOVIES;
  }
}

function saveStoredMovies(movies: MovieLink[]) {
  localStorage.setItem('cinemood_movies', JSON.stringify(movies));
}

export class CinemoodDB {
  static getConnectionStatus() {
    return {
      configured: true,
      url: 'localStorage://cinemood_movies',
      hasKey: true,
      provider: 'Client-Side LocalStorage Vault'
    };
  }

  static async getAllMovies(): Promise<MovieLink[]> {
    return getStoredMovies();
  }

  static async getMovieBySlug(slug: string): Promise<MovieLink | null> {
    const movies = getStoredMovies();
    const matched = movies.find(m => m.slug.toLowerCase().trim() === slug.toLowerCase().trim());
    return matched || null;
  }

  static async addMovie(movieData: Omit<MovieLink, 'id' | 'views_count' | 'downloads_count' | 'created_at'>): Promise<MovieLink> {
    const movies = getStoredMovies();
    const newMovie: MovieLink = {
      ...movieData,
      id: `m-${Math.random().toString(36).substring(2, 11)}`,
      views_count: 0,
      downloads_count: 0,
      created_at: new Date().toISOString()
    };
    movies.unshift(newMovie);
    saveStoredMovies(movies);
    return newMovie;
  }

  static async updateMovie(id: string, updatedFields: Partial<MovieLink>): Promise<MovieLink | null> {
    const movies = getStoredMovies();
    const idx = movies.findIndex(m => m.id === id);
    if (idx === -1) return null;
    
    movies[idx] = {
      ...movies[idx],
      ...updatedFields
    };
    saveStoredMovies(movies);
    return movies[idx];
  }

  static async incrementViews(id: string): Promise<void> {
    const movies = getStoredMovies();
    const idx = movies.findIndex(m => m.id === id);
    if (idx !== -1) {
      movies[idx].views_count += 1;
      saveStoredMovies(movies);
    }
  }

  static async incrementDownloads(id: string): Promise<void> {
    const movies = getStoredMovies();
    const idx = movies.findIndex(m => m.id === id);
    if (idx !== -1) {
      movies[idx].downloads_count += 1;
      saveStoredMovies(movies);
    }
  }

  static async deleteMovie(id: string): Promise<boolean> {
    const movies = getStoredMovies();
    const filtered = movies.filter(m => m.id !== id);
    saveStoredMovies(filtered);
    return true;
  }
}
