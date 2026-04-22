import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Dimensions, FlatList,
  Pressable, ScrollView, StyleSheet,
  Text, TextInput, View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AnimeCard from "../components/AnimeCard";
import { colors, radius, spacing } from "../constants/theme";
import { AnimeProp, getAiring, getLatestRelease, getTopAnime } from "../lib/api";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [airing, setAiring] = useState<AnimeProp[]>([]);
  const [top, setTop] = useState<AnimeProp[]>([]);
  const [latest, setLatest] = useState<AnimeProp[]>([]);
  const [latestPage, setLatestPage] = useState(1);
  const [latestLastPage, setLatestLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [latestLoading, setLatestLoading] = useState(false);

  useEffect(() => {
    Promise.all([getAiring(), getTopAnime(), getLatestRelease(1)])
      .then(([a, t, l]) => {
        setAiring(a);
        setTop(t);
        setLatest(l.data);
        setLatestLastPage(l.last_page);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadLatestPage = (page: number) => {
    setLatestLoading(true);
    getLatestRelease(page)
      .then((l) => { setLatest(l.data); setLatestPage(page); })
      .finally(() => setLatestLoading(false));
  };

  if (loading) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" />
        <View style={styles.splashLogo}>
          <View style={styles.splashIcon}><Text style={styles.splashIconText}>A</Text></View>
          <Text style={styles.splashTitle}>AYO<Text style={styles.splashAccent}>NIME</Text></Text>
        </View>
        <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 48 }} />
        <Text style={styles.splashSub}>Loading anime...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}><Text style={styles.logoIconText}>A</Text></View>
          <Text style={styles.logoText}>AYO<Text style={styles.logoAccent}>NIME</Text></Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconBtn} onPress={() => router.push({ pathname: "/search", params: { q: "" } })}>
            <Text style={styles.iconBtnText}>🔍</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => router.push("/downloads")}>
            <Text style={styles.iconBtnText}>⬇</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search anime..."
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => { if (query.trim()) router.push({ pathname: "/search", params: { q: query.trim() } }); }}
              returnKeyType="search"
            />
          </View>
          <Pressable
            style={styles.searchBtn}
            onPress={() => { if (query.trim()) router.push({ pathname: "/search", params: { q: query.trim() } }); }}
          >
            <Text style={styles.searchBtnText}>Go</Text>
          </Pressable>
        </View>

        {/* Feature pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {[["▶", "HD Stream"], ["⬇", "MP4 Download"], ["🎌", "JP/EN Audio"], ["⚡", "Fast Servers"], ["🔖", "Continue Watching"]].map(([icon, label]) => (
            <View key={label} style={styles.pill}>
              <Text style={styles.pillIcon}>{icon}</Text>
              <Text style={styles.pillText}>{label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Currently Airing */}
        {airing.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Currently Airing" count={airing.length} />
            <View style={styles.grid}>
              {airing.map((item) => <AnimeCard key={item.session} anime={item} />)}
            </View>
          </View>
        )}

        {/* Top Anime */}
        {top.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Top Anime" badge="★ Popular" />
            <View style={styles.grid}>
              {top.map((item) => <AnimeCard key={item.session} anime={item} />)}
            </View>
          </View>
        )}

        {/* Latest Release */}
        <View style={styles.section}>
          <SectionHeader
            title="Latest Release"
            badge={latestLastPage > 1 ? `Page ${latestPage}/${latestLastPage}` : undefined}
          />
          {latestLoading ? (
            <View style={styles.loader}><ActivityIndicator color={colors.accent} size="large" /></View>
          ) : (
            <View style={styles.grid}>
              {latest.map((item) => <AnimeCard key={`${item.session}-${latestPage}`} anime={item} />)}
            </View>
          )}

          {latestLastPage > 1 && (
            <View style={styles.pagination}>
              <Pressable
                onPress={() => loadLatestPage(Math.max(1, latestPage - 1))}
                disabled={latestPage === 1}
                style={[styles.pageBtn, latestPage === 1 && styles.pageBtnOff]}
              >
                <Text style={styles.pageBtnText}>‹ Prev</Text>
              </Pressable>
              <View style={styles.pageInfo}>
                <Text style={styles.pageInfoText}>{latestPage} / {latestLastPage}</Text>
              </View>
              <Pressable
                onPress={() => loadLatestPage(Math.min(latestLastPage, latestPage + 1))}
                disabled={latestPage === latestLastPage}
                style={[styles.pageBtn, latestPage === latestLastPage && styles.pageBtnOff]}
              >
                <Text style={styles.pageBtnText}>Next ›</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, count, badge }: { title: string; count?: number; badge?: string }) {
  return (
    <View style={sh.row}>
      <View style={sh.bar} />
      <Text style={sh.title}>{title}</Text>
      {count ? <Text style={sh.count}>{count} shows</Text> : null}
      {badge ? <View style={sh.badge}><Text style={sh.badgeText}>{badge}</Text></View> : null}
    </View>
  );
}

const sh = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  bar: { width: 4, height: 24, borderRadius: 4, backgroundColor: colors.accent },
  title: { color: "#fff", fontSize: 20, fontWeight: "900", flex: 1 },
  count: { color: colors.muted, fontSize: 13 },
  badge: { backgroundColor: "rgba(250,204,21,.15)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(250,204,21,.25)" },
  badgeText: { color: "#facc15", fontSize: 11, fontWeight: "800" },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  splash: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  splashLogo: { flexDirection: "row", alignItems: "center", gap: 12 },
  splashIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  splashIconText: { color: "#fff", fontWeight: "900", fontSize: 26 },
  splashTitle: { color: "#fff", fontWeight: "900", fontSize: 32, letterSpacing: -0.5 },
  splashAccent: { color: colors.pink },
  splashSub: { color: colors.muted, fontSize: 14, marginTop: 12 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: 14,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  logoIconText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  logoText: { color: "#fff", fontWeight: "900", fontSize: 24, letterSpacing: -0.5 },
  logoAccent: { color: colors.pink },
  headerActions: { flexDirection: "row", gap: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  iconBtnText: { fontSize: 18 },

  scroll: { flex: 1 },
  content: { paddingBottom: 48 },

  searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: spacing.lg, paddingVertical: 16 },
  searchWrap: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 12,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  searchBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: 20, paddingVertical: 12 },
  searchBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  pills: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: 16 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  pillIcon: { fontSize: 13 },
  pillText: { color: colors.muted, fontSize: 12, fontWeight: "700" },

  section: { paddingHorizontal: spacing.lg, marginBottom: 32 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  loader: { paddingVertical: 60, alignItems: "center" },

  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20, gap: 12 },
  pageBtn: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingVertical: 12, alignItems: "center" },
  pageBtnOff: { opacity: 0.3 },
  pageBtnText: { color: colors.text, fontWeight: "800", fontSize: 14 },
  pageInfo: { backgroundColor: colors.accent + "22", borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.accent + "44" },
  pageInfoText: { color: colors.accent, fontWeight: "800", fontSize: 14 },
});
