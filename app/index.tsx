import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import AppHeader from "../components/AppHeader";
import AnimeCard from "../components/AnimeCard";
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

  if (loading) return (
    <View style={styles.splash}>
      <StatusBar style="light" />
      <View style={styles.splashLogo}>
        <View style={styles.splashIcon}><Text style={styles.splashA}>A</Text></View>
        <Text style={styles.splashName}>AYO<Text style={styles.splashPink}>NIME</Text></Text>
      </View>
      <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 48 }} />
      <Text style={styles.splashSub}>Loading anime...</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AppHeader showSearch subtitle="Watch anime free" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {airing.length > 0 && (
          <Section title="Currently Airing" count={`${airing.length} shows`}>
            <Grid items={airing} />
          </Section>
        )}

        {top.length > 0 && (
          <Section title="Top Anime" badge="★ Popular">
            <Grid items={top} />
          </Section>
        )}

        <Section title="Latest Release" badge={`Page ${latestPage}/${latestLastPage}`}>
          {latestLoading
            ? <View style={styles.loader}><ActivityIndicator color={colors.accent} size="large" /></View>
            : <Grid items={latest} />
          }
          {latestLastPage > 1 && (
            <Pagination page={latestPage} total={latestLastPage} onChange={loadPage} />
          )}
        </Section>

      </ScrollView>
    </View>
  );
}

function Section({ title, count, badge, children }: { title: string; count?: string; badge?: string; children: React.ReactNode }) {
  return (
    <View style={sec.wrap}>
      <View style={sec.header}>
        <View style={sec.bar} />
        <Text style={sec.title}>{title}</Text>
        {count ? <Text style={sec.count}>{count}</Text> : null}
        {badge ? <View style={sec.badge}><Text style={sec.badgeText}>{badge}</Text></View> : null}
      </View>
      {children}
    </View>
  );
}

function Grid({ items }: { items: AnimeProp[] }) {
  return (
    <View style={grid.wrap}>
      {items.map((item) => <AnimeCard key={item.session} anime={item} />)}
    </View>
  );
}

const sec = StyleSheet.create({
  wrap: { marginBottom: 32 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  bar: { width: 4, height: 24, borderRadius: 4, backgroundColor: colors.accent },
  title: { color: "#fff", fontSize: 20, fontWeight: "900", flex: 1 },
  count: { color: colors.muted, fontSize: 13 },
  badge: { backgroundColor: colors.accent + "22", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: colors.accent + "44" },
  badgeText: { color: colors.accent, fontSize: 11, fontWeight: "800" },
});

const grid = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 24 },
  loader: { paddingVertical: 60, alignItems: "center" },
  splash: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  splashLogo: { flexDirection: "row", alignItems: "center", gap: 12 },
  splashIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  splashA: { color: "#fff", fontWeight: "900", fontSize: 28 },
  splashName: { color: "#fff", fontWeight: "900", fontSize: 32 },
  splashPink: { color: colors.pink },
  splashSub: { color: colors.muted, fontSize: 14, marginTop: 12 },
});
