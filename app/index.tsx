import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import AppHeader from "../components/AppHeader";
import AnimeCard from "../components/AnimeCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import Pagination from "../components/Pagination";
import { colors, spacing } from "../constants/theme";
import { AnimeProp, getAiring, getLatestRelease, getTopAnime } from "../lib/api";

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

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AppHeader showSearch subtitle="Watch anime free" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero gradient banner */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 600 }}>
          <LinearGradient
            colors={[colors.accent + "33", colors.bg]}
            style={styles.heroBanner}
          >
            <Text style={styles.heroTitle}>Watch. Download.</Text>
            <Text style={styles.heroAccent}>Repeat.</Text>
            <Text style={styles.heroSub}>Stream anime in HD or save to your device. Free, forever.</Text>
          </LinearGradient>
        </MotiView>

        {/* Currently Airing */}
        <Section title="Currently Airing" count={airing.length > 0 ? `${airing.length} shows` : undefined}>
          {loading ? <SkeletonGrid count={6} /> : <Grid items={airing} />}
        </Section>

        {/* Top Anime */}
        <Section title="Top Anime" badge="★ Popular">
          {loading ? <SkeletonGrid count={6} /> : <Grid items={top} />}
        </Section>

        {/* Latest Release */}
        <Section title="Latest Release" badge={latestLastPage > 1 ? `Page ${latestPage}/${latestLastPage}` : undefined}>
          {loading || latestLoading ? <SkeletonGrid count={6} /> : <Grid items={latest} />}
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
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      style={styles.section}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBar} />
        <Text style={styles.sectionTitle}>{title}</Text>
        {count ? <Text style={styles.sectionCount}>{count}</Text> : null}
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </MotiView>
  );
}

function Grid({ items }: { items: AnimeProp[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item, i) => <AnimeCard key={item.session} anime={item} index={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },

  heroBanner: { marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: 8, borderRadius: 20, padding: 24, gap: 4 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900" },
  heroAccent: { color: colors.pink, fontSize: 28, fontWeight: "900", marginTop: -4 },
  heroSub: { color: colors.muted, fontSize: 13, marginTop: 8, lineHeight: 19 },

  section: { paddingHorizontal: spacing.lg, marginBottom: 32 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  sectionBar: { width: 4, height: 24, borderRadius: 4, backgroundColor: colors.accent },
  sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "900", flex: 1 },
  sectionCount: { color: colors.muted, fontSize: 13 },
  badge: { backgroundColor: colors.accent + "22", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: colors.accent + "44" },
  badgeText: { color: colors.accent, fontSize: 11, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
});
