import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  HISTORY: "ayonime_watch_history",
  WATCHLIST: "ayonime_watchlist",
  PROGRESS: "ayonime_episode_progress",
};

export interface HistoryItem {
  animeSession: string;
  animeTitle: string;
  animePoster?: string;
  episodeSession: string;
  episodeNumber: number;
  watchedAt: number; // timestamp
}

export interface WatchlistItem {
  session: string;
  title: string;
  poster?: string;
  type?: string;
  addedAt: number;
}

// ── Watch History ────────────────────────────────────────────────────────────

export async function addToHistory(item: Omit<HistoryItem, "watchedAt">) {
  try {
    const history = await getHistory();
    const filtered = history.filter(
      (h) => !(h.animeSession === item.animeSession && h.episodeSession === item.episodeSession)
    );
    filtered.unshift({ ...item, watchedAt: Date.now() });
    const trimmed = filtered.slice(0, 50); // keep last 50
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(trimmed));
  } catch {}
}

export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function clearHistory() {
  await AsyncStorage.removeItem(KEYS.HISTORY);
}

// ── Watchlist ────────────────────────────────────────────────────────────────

export async function addToWatchlist(item: Omit<WatchlistItem, "addedAt">) {
  try {
    const list = await getWatchlist();
    if (list.find((w) => w.session === item.session)) return;
    list.unshift({ ...item, addedAt: Date.now() });
    await AsyncStorage.setItem(KEYS.WATCHLIST, JSON.stringify(list));
  } catch {}
}

export async function removeFromWatchlist(session: string) {
  try {
    const list = (await getWatchlist()).filter((w) => w.session !== session);
    await AsyncStorage.setItem(KEYS.WATCHLIST, JSON.stringify(list));
  } catch {}
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.WATCHLIST);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function isInWatchlist(session: string): Promise<boolean> {
  const list = await getWatchlist();
  return list.some((w) => w.session === session);
}

// ── Episode Progress ─────────────────────────────────────────────────────────

export async function saveProgress(episodeSession: string, currentTime: number, duration: number) {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROGRESS);
    const all = raw ? JSON.parse(raw) : {};
    all[episodeSession] = { currentTime, duration, pct: duration > 0 ? currentTime / duration : 0 };
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(all));
  } catch {}
}

export async function getProgress(episodeSession: string): Promise<{ currentTime: number; duration: number; pct: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROGRESS);
    const all = raw ? JSON.parse(raw) : {};
    return all[episodeSession] || null;
  } catch { return null; }
}

export async function getAllProgress(): Promise<Record<string, { currentTime: number; duration: number; pct: number }>> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// ── Preferences ──────────────────────────────────────────────────────────────

const PREFS_KEY = "ayonime_preferences";

export interface Preferences {
  defaultQuality: string;
  defaultAudio: string;
  autoPlay: boolean;
}

const DEFAULT_PREFS: Preferences = {
  defaultQuality: "best",
  defaultAudio: "jpn",
  autoPlay: true,
};

export async function getPreferences(): Promise<Preferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch { return DEFAULT_PREFS; }
}

export async function savePreferences(prefs: Partial<Preferences>) {
  try {
    const current = await getPreferences();
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch {}
}

// ── Recent Searches ───────────────────────────────────────────────────────────

const SEARCHES_KEY = "ayonime_recent_searches";

export async function addRecentSearch(query: string) {
  try {
    const searches = await getRecentSearches();
    const filtered = searches.filter((s) => s !== query);
    filtered.unshift(query);
    await AsyncStorage.setItem(SEARCHES_KEY, JSON.stringify(filtered.slice(0, 10)));
  } catch {}
}

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function clearRecentSearches() {
  await AsyncStorage.removeItem(SEARCHES_KEY);
}

// ── Local Downloads ───────────────────────────────────────────────────────────

const LOCAL_DL_KEY = "ayonime_local_downloads";

export interface LocalDownload {
  jobId: string;
  animeTitle: string;
  episodeNumber: number;
  fileName: string;
  localUri: string;
  savedAt: number;
  fileSize?: number;
}

export async function saveLocalDownload(item: LocalDownload) {
  try {
    const list = await getLocalDownloads();
    const filtered = list.filter((d) => d.jobId !== item.jobId);
    filtered.unshift(item);
    await AsyncStorage.setItem(LOCAL_DL_KEY, JSON.stringify(filtered));
  } catch {}
}

export async function getLocalDownloads(): Promise<LocalDownload[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_DL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function removeLocalDownload(jobId: string) {
  try {
    const list = (await getLocalDownloads()).filter((d) => d.jobId !== jobId);
    await AsyncStorage.setItem(LOCAL_DL_KEY, JSON.stringify(list));
  } catch {}
}
