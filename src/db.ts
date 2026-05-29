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
  is_kara_special?: boolean;
}

// Statically configured movies list
// To add new download pages manually, simply edit this static list!
const STATIC_MOVIES: MovieLink[] = [
  {
    "id": "kara-480p",
    "title": "Kara (2026) Dual Audio 480p",
    "slug": "kara-2026-dual-audio-480p",
    "description": "Kara (2026) Premium Dual Audio Streaming.",
    "poster_url": "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&auto=format&fit=crop&q=80",
    "download_url": "https://cdn.cdn-hub.xyz/url?photo=OG9CcjFIQmZINDl4ZFZWbERqWFVpSEQwekpnRjl0L1B1U0VSMFMwZ3lxVnNJYlc3dTY2aUwxdDFlcFZzbzJsVGZuSlZpM1dGK0cxQUdMa3ExemVkeTBDUVBUQWZJOVl0QzVOZVJQREVOZ1E9",
    "year": "2026",
    "genre": "Action, Thriller",
    "quality": "480p",
    "size_gb": "0.5 GB",
    "views_count": 0,
    "downloads_count": 0,
    "created_at": "2026-05-29T04:41:00.000Z",
    "is_kara_special": true
  },
  {
    "id": "kara-720p",
    "title": "Kara (2026) Dual Audio 720p",
    "slug": "kara-2026-dual-audio-720p",
    "description": "Kara (2026) Premium Dual Audio Streaming.",
    "poster_url": "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&auto=format&fit=crop&q=80",
    "download_url": "https://cdn.cdn-hub.xyz/url?photo=eHlyR1dNTmRqQXh6dis5ZGY4WWpZNlJCZkpYZVJXWXB2eTlLc3ErT2FnTnF1dVlhRW1Mb0gwbWQwak9DSmZESU85aC8rL010aXRLejNReUpZWmpUSVBKT1ljSlUvcFdnM0M4b3BwUjlXczQ9",
    "year": "2026",
    "genre": "Action, Thriller",
    "quality": "720p",
    "size_gb": "1.2 GB",
    "views_count": 0,
    "downloads_count": 0,
    "created_at": "2026-05-29T04:41:00.000Z",
    "is_kara_special": true
  },
  {
    "id": "kara-1080p",
    "title": "Kara (2026) Dual Audio 1080p",
    "slug": "kara-2026-dual-audio-1080p",
    "description": "Kara (2026) Premium Dual Audio Streaming.",
    "poster_url": "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&auto=format&fit=crop&q=80",
    "download_url": "https://cdn.cdn-hub.xyz/url?photo=U1dkc2pENWlGYVAwOHlxNTRNaXFNMWE3NEkwUGNIY3V5NnozT1FUVWVWT2hjTVN5eGdVTjZHMXBZSGY3Tng0R3VlY0tVTG12RWZKa0RsUHNMaE9paTVCaHRydGpCSzdmWVg5WUp3NUE3TFU9",
    "year": "2026",
    "genre": "Action, Thriller",
    "quality": "1080p",
    "size_gb": "2.2 GB",
    "views_count": 0,
    "downloads_count": 0,
    "created_at": "2026-05-29T04:41:00.000Z",
    "is_kara_special": true
  },
  {
    "id": "m-c31vplur3",
    "title": "Ggghhhhhkkk",
    "slug": "ggghhhhhkkk",
    "description": "No description available for this cinematic release.",
    "poster_url": "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&auto=format&fit=crop&q=80",
    "download_url": "https://alpha123.uk/",
    "year": "2026",
    "genre": "Action, Thriller",
    "quality": "1080p WebRip",
    "size_gb": "1.8 GB",
    "views_count": 0,
    "downloads_count": 0,
    "created_at": "2026-05-29T04:10:44.024Z"
  },
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

// Memory state to keep session clicks alive visually for the current user
const runtimeViews: Record<string, number> = {};
const runtimeDownloads: Record<string, number> = {};

export class CinemoodDB {
  static async getAllMovies(): Promise<MovieLink[]> {
    return STATIC_MOVIES.map(m => ({
      ...m,
      views_count: m.views_count + (runtimeViews[m.id] || 0),
      downloads_count: m.downloads_count + (runtimeDownloads[m.id] || 0)
    }));
  }

  static async getMovieBySlug(slug: string): Promise<MovieLink | null> {
    const movies = await this.getAllMovies();
    const matched = movies.find(m => m.slug.toLowerCase().trim() === slug.toLowerCase().trim());
    return matched || null;
  }

  static async incrementViews(id: string): Promise<void> {
    runtimeViews[id] = (runtimeViews[id] || 0) + 1;
  }

  static async incrementDownloads(id: string): Promise<void> {
    runtimeDownloads[id] = (runtimeDownloads[id] || 0) + 1;
  }
}
