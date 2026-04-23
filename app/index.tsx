import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Dimensions, FlatList,
  Pressable, RefreshControl, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";
import AnimeCard from "../components/AnimeCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import { colors, radius, spacing } from "../constants/theme";
import { AnimeProp, GENRES, getAiring, getByGenre, getLatestRelease } from "../lib/api";
import { getHistory, HistoryItem } from "../lib/storage";

const FEATURED_GENRES = ["Romance", "Action", "Fantasy", "Comedy", "Thriller"];

export default function HomeScreen() {
  const router = useRouter();
  const [latest, setLatest] = useState<AnimeProp[]>([]);
  const [airing, setAiring] = useState<AnimeProp[]>([]);
  const [featured, setFeatured] = useState<AnimeProp | null>(null);
  const [continueWatching, setContinueWatching] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [genreData, setGenreData] = useState<Record<string, AnimeProp[]>>({});
  const loadingGenres = useRef<Set<string>>(new Set());

  const loadInitial = useCallback(async () => {
    const [l, a, history] = await Promise.all([
      getLatestRelease(1),
      getAiring(),
      getHistory(),
    ]);
    setLatest(l.data);
    setAiring(a);
    // Pick a random featured from latest
    if (l.data.length > 0) setFeatured(l.data[Math.floor(Math.random() * Math.min(5, l.data.length))]);
    // Continue watching — last 5 unique anime
    const seen = new Set<string>();
    const cw = history.filter((h) => { if (seen.has(h.animeSession)) return false; seen.add(h.animeSession); return true; }).slice(0, 5);
    setContinueWatching(cw);
  }, []);

  useEffect(() => { loadInitial().finally(() => setLoading(false)); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setGenreData({});
    loadingGenres.current.clear();
    loadInitial().finally(() => setRefreshing(false));
  }, [loadInitial]);

  const loadGenre = useCallback((genre: string) => {
    if (genreData[genre] || loadingGenres.current.has(genre)) return;
    loadingGenres.current.add(genre);
    getByGenre(genre, 1).then((r) => {
      setGenreData((prev) => ({ ...prev, [genre]: r.data.slice(0, 10) }));
    });
  }, [genreData]);

  const renderCard = useCallback(({ item }: { item: AnimeProp }) => <AnimeCard anime={item} />, []);
  const keyExtractor = useCallback((item: AnimeProp) => item.session, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AppHeader showSearch subtitle="Watch anime free" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Featured Hero Banner */}
        {featured && !loading && (
          <Pressable
            style={styles.hero}
            onPress={() => router.push({ pathname: "/anime/[slug]", params: { slug: featured.session, title: featured.title } })}
          >
            <Image source={{ uri: featured.poster }} style={styles.heroBg} contentFit="cover" cachePolicy="disk" />
            <LinearGradient colors={["transparent", "rgba(10,10,15,0.7)", colors.bg]} style={styles.heroGradient} />
            <View style={styles.heroContent}>
              {featured.type && <View style={styles.heroTypeBadge}><Text style={styles.heroTypeText}>{featured.type}</Text></View>}
              <Text style={styles.heroTitle} numberOfLines={2}>{featured.title}</Text>
              {featured.episodes && <Text style={styles.heroMeta}>{featured.episodes} episodes</Text>}
              <View style={styles.heroActions}>
                <Pressable
                  style={styles.heroWatchBtn}
                  onPress={() => router.push({ pathname: "/anime/[slug]", params: { slug: featured.session, title: featured.title } })}
                >
                  <Ionicons name="play" size={16} color="#fff" />
                  <Text style={styles.heroWatchText}>Watch Now</Text>
                </Pressable>
                <Pressable
                  style={styles.heroInfoBtn}
                  onPress={() => router.push({ pathname: "/anime/[slug]", params: { slug: featured.session, title: featured.title } })}
                >
                  <Ionicons name="information-circle-outline" size={16} color="#fff" />
                  <Text style={styles.heroInfoText}>More Info</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        )}

        {loading && <View style={{ padding: spacing.lg }}><SkeletonGrid count={4} /></View>}

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="▶ Continue Watching" />
            <FlatList
              data={continueWatching}
              keyExtractor={(i) => i.animeSession}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.cwCard}
                  onPress={() => router.push({ pathname: "/anime/[slug]", params: { slug: item.animeSession, title: item.animeTitle } })}
                >
                  <View style={styles.cwPlayCircle}>
                    <Ionicons name="play" size={18} color="#fff" />
                  </View>
                  <View style={styles.cwInfo}>
                    <Text style={styles.cwTitle} numberOfLines={1}>{item.animeTitle}</Text>
                    <Text style={styles.cwEp}>Episode {item.episodeNumber}</Text>
                    <Text style={styles.cwDate}>{new Date(item.watchedAt).toLocaleDateString()}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* Latest Release */}
        {!loading && (
          <View style={styles.section}>
            <SectionHeader title="🆕 Latest Release" onSeeAll={() => router.push({ pathname: "/search", params: { genre: "latest" } })} />
            <FlatList data={latest} renderItem={renderCard} keyExtractor={keyExtractor}
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList} ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              removeClippedSubviews initialNumToRender={4} maxToRenderPerBatch={4}
            />
          </View>
        )}

        {/* Currently Airing */}
        {!loading && airing.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="📡 Currently Airing" />
            <FlatList data={airing} renderItem={renderCard} keyExtractor={keyExtractor}
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList} ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              removeClippedSubviews initialNumToRender={4} maxToRenderPerBatch={4}
            />
          </View>
        )}

        {/* Genre rows — lazy */}
        {!loading && FEATURED_GENRES.map((genre) => (
          <LazyGenreRow key={genre} genre={genre} data={genreData[genre]}
            onVisible={() => loadGenre(genre)} renderCard={renderCard} keyExtractor={keyExtractor}
            onSeeAll={() => router.push({ pathname: "/search", params: { genre } })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function LazyGenreRow({ genre, data, onVisible, renderCard, keyExtractor, onSeeAll }: {
  genre: string; data?: AnimeProp[];
  onVisible: () => void;
  renderCard: ({ item }: { item: AnimeProp }) => JSX.Element;
  keyExtractor: (item: AnimeProp) => string;
  onSeeAll: () => void;
}) {
  const triggered = useRef(false);
  return (
    <View onLayout={() => { if (!triggered.current) { triggered.current = true; onVisible(); } }} style={styles.section}>
      <SectionHeader title={`${genreEmoji(genre)} ${genre}`} onSeeAll={onSeeAll} />
      {!data ? (
        <View style={styles.genreLoader}><ActivityIndicator color={colors.accent} size="small" /></View>
      ) : (
        <FlatList data={data} renderItem={renderCard} keyExtractor={keyExtractor}
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList} ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          removeClippedSubviews initialNumToRender={4} maxToRenderPerBatch={4}
        />
      )}
    </View>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && <Pressable onPress={onSeeAll}><Text style={styles.seeAll}>See all →</Text></Pressable>}
    </View>
  );
}

function genreEmoji(genre: string): string {
  const map: Record<string, string> = {
    Action: "⚔️", Adventure: "🗺️", Comedy: "😂", Drama: "🎭",
    Fantasy: "🧙", Horror: "👻", Mecha: "🤖", Music: "🎵",
    Mystery: "🔍", Psychological: "🧠", Romance: "💕", "Sci-Fi": "🚀",
    "Slice of Life": "🌸", Sports: "⚽", Supernatural: "✨", Thriller: "😱",
  };
  return map[genre] || "🎬";
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },

  hero: { width: "100%", height: 320, marginBottom: 8 },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: spacing.lg, gap: 8 },
  heroTypeBadge: { alignSelf: "flex-start", backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  heroTypeText: { color: "#fff", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "900", lineHeight: 30 },
  heroMeta: { color: "rgba(255,255,255,.7)", fontSize: 13 },
  heroActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  heroWatchBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", borderRadius: radius.full, paddingHorizontal: 20, paddingVertical: 10 },
  heroWatchText: { color: "#000", fontWeight: "900", fontSize: 14 },
  heroInfoBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,.2)", borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 10 },
  heroInfoText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  section: { marginBottom: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: spacing.lg, marginBottom: 12, marginTop: 16 },
  sectionBar: { width: 4, height: 22, borderRadius: 4, backgroundColor: colors.accent },
  sectionTitle: { color: "#fff", fontSize: 17, fontWeight: "900", flex: 1 },
  seeAll: { color: colors.accent, fontSize: 13, fontWeight: "700" },
  hList: { paddingHorizontal: spacing.lg },
  genreLoader: { height: 160, alignItems: "center", justifyContent: "center" },

  cwCard: { width: 200, backgroundColor: colors.card, borderRadius: radius.xl, padding: 14, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 },
  cwPlayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", shrink: 0 } as any,
  cwInfo: { flex: 1 },
  cwTitle: { color: "#fff", fontWeight: "700", fontSize: 13 },
  cwEp: { color: colors.accent, fontSize: 12, marginTop: 2 },
  cwDate: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
