import { useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AnimeCard from "../components/AnimeCard";
import SectionHeader from "../components/SectionHeader";
import { colors, radius, spacing } from "../constants/theme";
import { AnimeProp, getAiring, getLatestRelease, getTopAnime } from "../lib/api";

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

  const handleSearch = () => {
    if (query.trim()) router.push({ pathname: "/search", params: { q: query.trim() } });
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar style="light" />
        <View style={styles.logoWrap}>
          <View style={styles.logoIcon}><Text style={styles.logoIconText}>A</Text></View>
          <Text style={styles.logoText}>AYO<Text style={styles.logoAccent}>NIME</Text></Text>
        </View>
        <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Fixed header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}><Text style={styles.logoIconText}>A</Text></View>
          <Text style={styles.logoText}>AYO<Text style={styles.logoAccent}>NIME</Text></Text>
        </View>
        <Pressable style={styles.searchIcon} onPress={() => router.push({ pathname: "/search", params: { q: "" } })}>
          <Text style={styles.searchIconText}>🔍</Text>
        </Pressable>
        <Pressable style={styles.searchIcon} onPress={() => router.push("/downloads")}>
          <Text style={styles.searchIconText}>⬇</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Search anime..."
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <Pressable style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Go</Text>
          </Pressable>
        </View>

        {/* Feature pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll} contentContainerStyle={styles.pills}>
          {[["▶", "HD Stream"], ["⬇", "MP4 Download"], ["🎌", "JP/EN Audio"], ["⚡", "Fast"]].map(([icon, label]) => (
            <View key={label} style={styles.pill}>
              <Text style={styles.pillIcon}>{icon}</Text>
              <Text style={styles.pillText}>{label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Currently Airing */}
        {airing.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Currently Airing" />
            <FlatList
              data={airing}
              keyExtractor={(i) => i.session}
              numColumns={3}
              scrollEnabled={false}
              renderItem={({ item }) => <View style={styles.cardWrap}><AnimeCard anime={item} /></View>}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}

        {/* Top Anime */}
        {top.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Top Anime" badge="★ Popular" />
            <FlatList
              data={top}
              keyExtractor={(i) => i.session}
              numColumns={3}
              scrollEnabled={false}
              renderItem={({ item }) => <View style={styles.cardWrap}><AnimeCard anime={item} /></View>}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}

        {/* Latest Release */}
        <View style={styles.section}>
          <SectionHeader
            title="Latest Release"
            badge={latestLastPage > 1 ? `Page ${latestPage}/${latestLastPage}` : undefined}
          />
          {latestLoading ? (
            <View style={styles.latestLoader}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <FlatList
              data={latest}
              keyExtractor={(i) => `${i.session}-${latestPage}`}
              numColumns={3}
              scrollEnabled={false}
              renderItem={({ item }) => <View style={styles.cardWrap}><AnimeCard anime={item} /></View>}
              columnWrapperStyle={styles.row}
            />
          )}

          {/* Pagination */}
          {latestLastPage > 1 && (
            <View style={styles.pagination}>
              <Pressable
                onPress={() => loadLatestPage(Math.max(1, latestPage - 1))}
                disabled={latestPage === 1}
                style={[styles.pageBtn, latestPage === 1 && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>‹</Text>
              </Pressable>

              {[latestPage - 1, latestPage, latestPage + 1]
                .filter((p) => p >= 1 && p <= latestLastPage)
                .map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => loadLatestPage(p)}
                    style={[styles.pageBtn, p === latestPage && styles.pageBtnActive]}
                  >
                    <Text style={[styles.pageBtnText, p === latestPage && styles.pageBtnTextActive]}>{p}</Text>
                  </Pressable>
                ))}

              <Pressable
                onPress={() => loadLatestPage(Math.min(latestLastPage, latestPage + 1))}
                disabled={latestPage === latestLastPage}
                style={[styles.pageBtn, latestPage === latestLastPage && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>›</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loadingScreen: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: spacing.md,
    backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: "center", justifyContent: "center",
  },
  logoIconText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  logoText: { color: "#fff", fontWeight: "900", fontSize: 22, letterSpacing: -0.5 },
  logoAccent: { color: colors.pink },
  searchIcon: { padding: 6 },
  searchIconText: { fontSize: 20 },

  searchRow: {
    flexDirection: "row", gap: spacing.sm,
    marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  input: {
    flex: 1, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: 11,
    color: colors.text, fontSize: 14,
  },
  searchBtn: {
    backgroundColor: colors.accent, borderRadius: radius.full,
    paddingHorizontal: 20, justifyContent: "center",
  },
  searchBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  pillsScroll: { marginBottom: spacing.md },
  pills: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: 4 },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6,
  },
  pillIcon: { fontSize: 12 },
  pillText: { color: colors.muted, fontSize: 11, fontWeight: "700" },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  cardWrap: { flex: 1 },
  latestLoader: { paddingVertical: 40, alignItems: "center" },

  pagination: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, marginTop: spacing.lg },
  pageBtn: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 9, minWidth: 42, alignItems: "center",
  },
  pageBtnDisabled: { opacity: 0.3 },
  pageBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pageBtnText: { color: colors.muted, fontWeight: "800", fontSize: 14 },
  pageBtnTextActive: { color: "#fff" },
});
