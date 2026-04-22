import { useCallback, useEffect, useState } from "react";
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import AppHeader from "../components/AppHeader";
import AnimeCard from "../components/AnimeCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import Pagination from "../components/Pagination";
import { colors, spacing } from "../constants/theme";
import { AnimeProp, getAiring, getLatestRelease, getTopAnime } from "../lib/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 12) / 2;

export default function HomeScreen() {
  const [airing, setAiring] = useState<AnimeProp[]>([]);
  const [top, setTop] = useState<AnimeProp[]>([]);
  const [latest, setLatest] = useState<AnimeProp[]>([]);
  const [latestPage, setLatestPage] = useState(1);
  const [latestLastPage, setLatestLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [latestLoading, setLatestLoading] = useState(false);

  useEffect(() => {
    Promise.all([getAiring(), getTopAnime(), getLatestRelease(1)])
      .then(([a, t, l]) => { setAiring(a); setTop(t); setLatest(l.data); setLatestLastPage(l.last_page); })
      .finally(() => setLoading(false));
  }, []);

  const loadPage = (page: number) => {
    setLatestLoading(true);
    getLatestRelease(page).then((l) => { setLatest(l.data); setLatestPage(page); }).finally(() => setLatestLoading(false));
  };

  const renderCard = useCallback(({ item }: { item: AnimeProp }) => (
    <AnimeCard anime={item} />
  ), []);

  const keyExtractor = useCallback((item: AnimeProp) => item.session, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AppHeader showSearch subtitle="Watch anime free" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
      >
        {/* Hero */}
        <LinearGradient colors={[colors.accent + "33", colors.bg]} style={styles.hero}>
          <Text style={styles.heroTitle}>Watch. Download.</Text>
          <Text style={styles.heroPink}>Repeat.</Text>
          <Text style={styles.heroSub}>Stream anime in HD or save to your device. Free, forever.</Text>
        </LinearGradient>

        {/* Currently Airing */}
        <Section title="Currently Airing" count={airing.length > 0 ? `${airing.length} shows` : undefined}>
          {loading ? <SkeletonGrid count={6} /> : (
            <FlatList
              data={airing}
              renderItem={renderCard}
              keyExtractor={keyExtractor}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
              removeClippedSubviews
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={3}
            />
          )}
        </Section>

        {/* Top Anime */}
        {top.length > 0 && (
          <Section title="Top Anime" badge="★ Popular">
            <FlatList
              data={top}
              renderItem={renderCard}
              keyExtractor={keyExtractor}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
              removeClippedSubviews
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={3}
            />
          </Section>
        )}

        {/* Latest Release */}
        <Section title="Latest Release" badge={latestLastPage > 1 ? `Page ${latestPage}/${latestLastPage}` : undefined}>
          {loading || latestLoading ? <SkeletonGrid count={6} /> : (
            <FlatList
              data={latest}
              renderItem={renderCard}
              keyExtractor={(item) => `${item.session}-${latestPage}`}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
              removeClippedSubviews
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={3}
            />
          )}
          {!loading && latestLastPage > 1 && (
            <Pagination page={latestPage} total={latestLastPage} onChange={loadPage} />
          )}
        </Section>

      </ScrollView>
    </View>
  );
}

function Section({ title, count, badge, children }: { title: string; count?: string; badge?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBar} />
        <Text style={styles.sectionTitle}>{title}</Text>
        {count ? <Text style={styles.sectionCount}>{count}</Text> : null}
        {badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },
  hero: { marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: 8, borderRadius: 20, padding: 24, gap: 4 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900" },
  heroPink: { color: colors.pink, fontSize: 28, fontWeight: "900", marginTop: -4 },
  heroSub: { color: colors.muted, fontSize: 13, marginTop: 8, lineHeight: 19 },
  section: { paddingHorizontal: spacing.lg, marginBottom: 32 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  sectionBar: { width: 4, height: 24, borderRadius: 4, backgroundColor: colors.accent },
  sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "900", flex: 1 },
  sectionCount: { color: colors.muted, fontSize: 13 },
  badge: { backgroundColor: colors.accent + "22", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: colors.accent + "44" },
  badgeText: { color: colors.accent, fontSize: 11, fontWeight: "800" },
  row: { gap: 12, marginBottom: 12 },
});
