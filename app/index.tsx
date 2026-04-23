import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Dimensions, FlatList,
  Pressable, RefreshControl, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import AppHeader from "../components/AppHeader";
import AnimeCard from "../components/AnimeCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import { colors, radius, spacing } from "../constants/theme";
import { AnimeProp, GENRES, getAiring, getByGenre, getLatestRelease } from "../lib/api";

const FEATURED_GENRES = ["Romance", "Action", "Fantasy", "Comedy", "Thriller"];

export default function HomeScreen() {
  const router = useRouter();
  const [latest, setLatest] = useState<AnimeProp[]>([]);
  const [airing, setAiring] = useState<AnimeProp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Genre rows loaded lazily
  const [genreData, setGenreData] = useState<Record<string, AnimeProp[]>>({});
  const [loadedGenres, setLoadedGenres] = useState<string[]>([]);
  const loadingGenres = useRef<Set<string>>(new Set());

  const loadInitial = useCallback(async () => {
    const [l, a] = await Promise.all([getLatestRelease(1), getAiring()]);
    setLatest(l.data);
    setAiring(a);
  }, []);

  useEffect(() => { loadInitial().finally(() => setLoading(false)); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setGenreData({});
    setLoadedGenres([]);
    loadingGenres.current.clear();
    loadInitial().finally(() => setRefreshing(false));
  }, [loadInitial]);

  // Called when a genre section becomes visible
  const loadGenre = useCallback((genre: string) => {
    if (genreData[genre] || loadingGenres.current.has(genre)) return;
    loadingGenres.current.add(genre);
    getByGenre(genre, 1).then((r) => {
      setGenreData((prev) => ({ ...prev, [genre]: r.data.slice(0, 10) }));
      setLoadedGenres((prev) => [...prev, genre]);
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
        {/* Hero */}
        <LinearGradient colors={[colors.accent + "44", colors.bg]} style={styles.hero}>
          <Text style={styles.heroTitle}>Watch. Download.</Text>
          <Text style={styles.heroPink}>Repeat.</Text>
          <Text style={styles.heroSub}>Stream anime in HD or save to your device. Free, forever.</Text>
          <Pressable style={styles.heroBrowseBtn} onPress={() => router.push("/search")}>
            <Text style={styles.heroBrowseText}>Browse All →</Text>
          </Pressable>
        </LinearGradient>

        {/* Latest Release */}
        <SectionHeader title="🆕 Latest Release" onSeeAll={() => router.push({ pathname: "/search", params: { genre: "latest" } })} />
        {loading ? <SkeletonGrid count={4} /> : (
          <FlatList data={latest} renderItem={renderCard} keyExtractor={keyExtractor}
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList} ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            removeClippedSubviews initialNumToRender={4} maxToRenderPerBatch={4}
          />
        )}

        {/* Currently Airing */}
        {airing.length > 0 && (
          <>
            <SectionHeader title="📡 Currently Airing" />
            <FlatList data={airing} renderItem={renderCard} keyExtractor={keyExtractor}
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList} ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              removeClippedSubviews initialNumToRender={4} maxToRenderPerBatch={4}
            />
          </>
        )}

        {/* Genre rows — lazy loaded */}
        {FEATURED_GENRES.map((genre) => (
          <LazyGenreRow
            key={genre}
            genre={genre}
            data={genreData[genre]}
            onVisible={() => loadGenre(genre)}
            renderCard={renderCard}
            keyExtractor={keyExtractor}
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

  const handleLayout = () => {
    if (!triggered.current) { triggered.current = true; onVisible(); }
  };

  return (
    <View onLayout={handleLayout} style={{ marginBottom: 8 }}>
      <SectionHeader title={`${genreEmoji(genre)} ${genre}`} onSeeAll={onSeeAll} />
      {!data ? (
        <View style={styles.genreLoader}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
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
  hero: { marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: 20, borderRadius: 20, padding: 24, gap: 4 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900" },
  heroPink: { color: colors.pink, fontSize: 28, fontWeight: "900", marginTop: -4 },
  heroSub: { color: colors.muted, fontSize: 13, marginTop: 8, lineHeight: 19 },
  heroBrowseBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: 20, paddingVertical: 10, alignSelf: "flex-start", marginTop: 12 },
  heroBrowseText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: spacing.lg, marginBottom: 12, marginTop: 8 },
  sectionBar: { width: 4, height: 22, borderRadius: 4, backgroundColor: colors.accent },
  sectionTitle: { color: "#fff", fontSize: 17, fontWeight: "900", flex: 1 },
  seeAll: { color: colors.accent, fontSize: 13, fontWeight: "700" },
  hList: { paddingHorizontal: spacing.lg },
  genreLoader: { height: 160, alignItems: "center", justifyContent: "center" },
});
