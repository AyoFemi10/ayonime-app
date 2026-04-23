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

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 12) / 2;
const FEATURED_GENRES = ["Romance", "Action", "Fantasy", "Comedy", "Thriller"];

export default function HomeScreen() {
  const router = useRouter();
  const [latest, setLatest] = useState<AnimeProp[]>([]);
  const [airing, setAiring] = useState<AnimeProp[]>([]);
  const [genreData, setGenreData] = useState<Record<string, AnimeProp[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(() => {
    return Promise.all([
      getLatestRelease(1),
      getAiring(),
      ...FEATURED_GENRES.map((g) => getByGenre(g, 1)),
    ]).then(([l, a, ...genreResults]) => {
      setLatest(l.data);
      setAiring(a);
      const gd: Record<string, AnimeProp[]> = {};
      FEATURED_GENRES.forEach((g, i) => { gd[g] = genreResults[i].data.slice(0, 10); });
      setGenreData(gd);
    });
  }, []);

  useEffect(() => { loadAll().finally(() => setLoading(false)); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll().finally(() => setRefreshing(false));
  }, [loadAll]);

  const renderCard = useCallback(({ item }: { item: AnimeProp }) => <AnimeCard anime={item} />, []);
  const keyExtractor = useCallback((item: AnimeProp) => item.session, []);

  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <AppHeader showSearch subtitle="Watch anime free" />
        <ScrollView contentContainerStyle={styles.content}>
          <SkeletonGrid count={6} />
        </ScrollView>
      </View>
    );
  }

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
          <View style={styles.heroActions}>
            <Pressable style={styles.heroBrowseBtn} onPress={() => router.push("/search")}>
              <Text style={styles.heroBrowseText}>Browse All →</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Latest Release — horizontal scroll like Netflix */}
        <HorizontalSection
          title="🆕 Latest Release"
          items={latest}
          renderCard={renderCard}
          keyExtractor={keyExtractor}
          onSeeAll={() => router.push({ pathname: "/search", params: { genre: "latest" } })}
        />

        {/* Currently Airing */}
        {airing.length > 0 && (
          <HorizontalSection
            title="📡 Currently Airing"
            items={airing}
            renderCard={renderCard}
            keyExtractor={keyExtractor}
          />
        )}

        {/* Genre rows */}
        {FEATURED_GENRES.map((genre) =>
          genreData[genre]?.length > 0 ? (
            <HorizontalSection
              key={genre}
              title={`${genreEmoji(genre)} ${genre}`}
              items={genreData[genre]}
              renderCard={renderCard}
              keyExtractor={keyExtractor}
              onSeeAll={() => router.push({ pathname: "/search", params: { genre } })}
            />
          ) : null
        )}

      </ScrollView>
    </View>
  );
}

function HorizontalSection({ title, items, renderCard, keyExtractor, onSeeAll }: {
  title: string;
  items: AnimeProp[];
  renderCard: ({ item }: { item: AnimeProp }) => JSX.Element;
  keyExtractor: (item: AnimeProp) => string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBar} />
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <Pressable onPress={onSeeAll}>
            <Text style={styles.seeAll}>See all →</Text>
          </Pressable>
        )}
      </View>
      <FlatList
        data={items}
        renderItem={renderCard}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        removeClippedSubviews
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        getItemLayout={(_, index) => ({ length: CARD_WIDTH * 0.7, offset: (CARD_WIDTH * 0.7 + 10) * index, index })}
      />
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
  hero: { marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: 8, borderRadius: 20, padding: 24, gap: 4 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900" },
  heroPink: { color: colors.pink, fontSize: 28, fontWeight: "900", marginTop: -4 },
  heroSub: { color: colors.muted, fontSize: 13, marginTop: 8, lineHeight: 19 },
  heroActions: { marginTop: 12 },
  heroBrowseBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: 20, paddingVertical: 10, alignSelf: "flex-start" },
  heroBrowseText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: spacing.lg, marginBottom: 12 },
  sectionBar: { width: 4, height: 22, borderRadius: 4, backgroundColor: colors.accent },
  sectionTitle: { color: "#fff", fontSize: 17, fontWeight: "900", flex: 1 },
  seeAll: { color: colors.accent, fontSize: 13, fontWeight: "700" },
  hList: { paddingHorizontal: spacing.lg },
});
