const API_BASE = "https://apis.ayohost.site";

export function proxyImage(url?: string): string | undefined {
  if (!url) return undefined;
  return `${API_BASE}/api/proxy/img?url=${encodeURIComponent(url)}`;
}

export interface AnimeProp {
  session: string;
  title: string;
  poster?: string;
  type?: string;
  episodes?: number;
  score?: string | number;
}

export interface Episode {
  id: number;
  episode: number;
  session: string;
  snapshot: string;
  duration: string;
}

export interface PagedResult<T> {
  data: T[];
  last_page: number;
  current_page: number;
}

export async function getAiring(): Promise<AnimeProp[]> {
  const r = await fetch(`${API_BASE}/api/airing`);
  const j = await r.json();
  return (j.data || []).map((i: any) => ({
    session: i.anime_session,
    title: i.anime_title,
    poster: proxyImage(i.snapshot),
    type: i.fansub || "TV",
    episodes: i.episode,
  }));
}

export async function getLatestRelease(page = 1): Promise<PagedResult<AnimeProp>> {
  const r = await fetch(`${API_BASE}/api/latest-release?page=${page}`);
  const j = await r.json();
  return {
    data: (j.data || []).map((i: any) => ({
      session: i.anime_session,
      title: i.anime_title,
      poster: proxyImage(i.snapshot),
      type: i.fansub || "TV",
      episodes: i.episode,
    })),
    last_page: j.last_page || 1,
    current_page: j.current_page || page,
  };
}

export async function getTopAnime(): Promise<AnimeProp[]> {
  const r = await fetch(`${API_BASE}/api/top-anime`);
  const j = await r.json();
  return (j.data || []).slice(0, 12).map((i: any) => ({
    session: i.session || i.anime_session,
    title: i.title || i.anime_title,
    poster: proxyImage(i.poster || i.snapshot),
    type: i.type || "TV",
    score: i.score,
  }));
}

export async function searchAnime(q: string): Promise<AnimeProp[]> {
  const r = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`);
  const j = await r.json();
  return (j.data || []).map((i: any) => ({
    session: i.session,
    title: i.title,
    poster: proxyImage(i.poster),
    type: i.type,
    episodes: i.episodes,
    score: i.score,
  }));
}

export async function getByGenre(genre: string, page = 1): Promise<PagedResult<AnimeProp>> {
  const r = await fetch(`${API_BASE}/api/genre?genre=${encodeURIComponent(genre)}&page=${page}`);
  const j = await r.json();
  return {
    data: (j.data || []).map((i: any) => ({
      session: i.session,
      title: i.title,
      poster: proxyImage(i.poster),
      type: i.type,
      episodes: i.episodes,
      score: i.score,
    })),
    last_page: j.last_page || 1,
    current_page: j.current_page || page,
  };
}

export const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Mecha", "Music", "Mystery", "Psychological",
  "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"
];

export interface AnimeInfo {
  session: string;
  title: string;
  poster?: string;
  type?: string;
  episodes?: number;
  score?: string | number;
  year?: number;
  season?: string;
  status?: string;
  genres?: string[];
  synopsis?: string;
}

export async function getAnimeInfo(slug: string, title: string): Promise<AnimeInfo | null> {
  try {
    const r = await fetch(`${API_BASE}/api/anime/${slug}/info?anime_name=${encodeURIComponent(title)}`);
    const j = await r.json();
    const d = j.data;
    if (!d) return null;
    return {
      session: d.session,
      title: d.title,
      poster: proxyImage(d.poster),
      type: d.type,
      episodes: d.episodes,
      score: d.score,
      year: d.year,
      season: d.season,
      status: d.status,
      genres: d.genres || [],
      synopsis: d.synopsis,
    };
  } catch { return null; }
}

export async function getEpisodes(slug: string, title: string): Promise<Episode[]> {
  const r = await fetch(`${API_BASE}/api/anime/${slug}/episodes?anime_name=${encodeURIComponent(title)}`);
  const j = await r.json();
  return (j.data || []).map((ep: any) => ({
    ...ep,
    snapshot: ep.snapshot ? proxyImage(ep.snapshot) : undefined,
  }));
}

export async function getStreamUrl(
  slug: string, session: string, quality = "best", audio = "jpn"
): Promise<string | null> {
  const r = await fetch(
    `${API_BASE}/api/stream?anime_slug=${slug}&episode_session=${session}&quality=${quality}&audio=${audio}`
  );
  const j = await r.json();
  if (j.detail) return null;

  // stream_url is like /api/player?token=<encoded_m3u8_url>&_=xxxx
  // For native HLS player, extract the m3u8 URL and hit /api/proxy/m3u8 directly
  const streamPath = j.stream_url?.startsWith("/") ? `${API_BASE}${j.stream_url}` : j.stream_url;
  if (!streamPath) return null;

  const urlObj = new URL(streamPath);
  const token = urlObj.searchParams.get("token");
  if (token) {
    // token is already the decoded m3u8 URL — re-encode it for the proxy param
    return `${API_BASE}/api/proxy/m3u8?url=${encodeURIComponent(token)}`;
  }
  return streamPath;
}

const API_BASE_URL = "https://apis.ayohost.site";

export async function startDownload(params: {
  anime_slug: string;
  episode_session: string;
  anime_title: string;
  episode_number: number;
  quality: string;
  audio: string;
}): Promise<string> {
  const r = await fetch(`${API_BASE_URL}/api/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const j = await r.json();
  return j.job_id;
}

export async function getJobStatus(jobId: string) {
  const r = await fetch(`${API_BASE_URL}/api/download/${jobId}/status`);
  if (!r.ok) return null;
  return r.json();
}
