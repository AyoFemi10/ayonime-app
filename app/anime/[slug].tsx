import { useEffect, useState } from "react";
import {
  ActivityIndicator, Dimensions, FlatList, Image,
  Pressable, RefreshControl, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, radius, spacing } from "../../constants/theme";
import { Episode, getEpisodes } from "../../lib/api";
import { addToWatchlist, getAllProgress, isInWatchlist, removeFromWatchlist } from "../../lib/storage";
import { hapticLight, hapticMedium } from "../../lib/haptics";

const { width } = Dimensions.get("window");
const COLS = 2;
const GAP = 12;
const EP_WIDTH = (width - 32 - GAP) / COLS;
const PAGE_SIZE = 20;

export default function AnimeScreen() {
  const { slug, title } = useLocalSearchParams<{ slug: string; title: string }>();
  const router = useRouter();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastWatched, setLastWatched] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [progress, setProgress] = useState<Record<string, { pct: number }>>({});

  const loadData = async () => {
    const [eps, prog, wl] = await Promise.all([
      getEpisodes(slug, title || slug),
      getAllProgress(),
      isInWatchlist(slug),
      AsyncStorage.getItem(`last_watched_${slug}`).then(setLastWatched),
    ]);
    setEpisodes(eps);
    setProgress(prog);
    setInWatchlist(wl);
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [slug]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleWatchlist = async () => {
    hapticMedium();
    if (inWatchlist) {
      await removeFromWatchlist(slug);
      setInWatchlist(false);
    } else {
      await addToWatchlist({ session: slug, title: title || slug });
      setInWatchlist(true);
    }
  };

  const totalPages = Math.ceil(episodes.length / PAGE_SIZE);
  const paged = episodes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const lastWatchedEp = episodes.find((e) => e.session === lastWatched);

  const goWatch = (ep: Episode) => {
    AsyncStorage.setItem(`last_watched_${slug}`, ep.session);
    router.push({ pathname: "/watch/[slug]", params: { slug: ep.session, animeSlug: slug, title, ep: String(ep.episode) } });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.loadingText}>Loading episodes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.headerSub}>{episodes.length} episodes</Text>
        </View>
        <Pressable onPress={toggleWatchlist} style={styles.watchlistBtn}>
          <Ionicons
            name={inWatchlist ? "bookmark" : "bookmark-outline"}
            size={22}
            color={inWatchlist ? colors.accent : colors.muted}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >

        {/* Continue watching */}
        {lastWatchedEp && (
          <Pressable style={styles.continueBanner} onPress={() => goWatch(lastWatchedEp)}>
            <View style={styles.continueLeft}>
              <View style={styles.continuePlay}>
                <Text style={styles.continuePlayIcon}>▶</Text>
              </View>
              <View>
                <Text style={styles.continueLabel}>Continue watching</Text>
                <Text style={styles.continueEp}>Episode {lastWatchedEp.episode}</Text>
              </View>
            </View>
            <Text style={styles.continueArrow}>›</Text>
          </Pressable>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pageTabs}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Pressable key={p} onPress={() => setPage(p)} style={[styles.pageTab, p === page && styles.pageTabActive]}>
                <Text style={[styles.pageTabText, p === page && styles.pageTabTextActive]}>
                  {(p - 1) * PAGE_SIZE + 1}–{Math.min(p * PAGE_SIZE, episodes.length)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Episode grid */}
        <View style={styles.grid}>
          {paged.map((ep) => (
            <Pressable
              key={ep.session}
              style={[styles.epCard, { width: EP_WIDTH }, ep.session === lastWatched && styles.epCardWatched]}
              onPress={() => goWatch(ep)}
            >
              {ep.snapshot ? (
                <Image source={{ uri: ep.snapshot }} style={styles.epImg} resizeMode="cover" />
              ) : (
                <View style={[styles.epImg, styles.epPlaceholder]}>
                  <Text style={styles.epPlaceholderIcon}>▶</Text>
                </View>
              )}
              {ep.session === lastWatched && (
                <View style={styles.watchedBadge}><Text style={styles.watchedText}>Watched</Text></View>
              )}
              <View style={styles.epOverlay}>
                <View style={styles.epPlayBtn}><Text style={styles.epPlayIcon}>▶</Text></View>
              </View>
              <View style={styles.epInfo}>
                <Text style={styles.epNum}>Episode {ep.episode}</Text>
                {ep.duration ? <Text style={styles.epDur}>{ep.duration}</Text> : null}
              </View>
              {/* Progress bar */}
              {progress[ep.session]?.pct > 0 && (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.min(progress[ep.session].pct * 100, 100)}%` as any }]} />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, gap: 12 },
  loadingText: { color: colors.muted, fontSize: 14 },

  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: 16,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  backArrow: { color: colors.text, fontSize: 20, fontWeight: "700" },
  headerInfo: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "900" },
  headerSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  watchlistBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },

  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 48 },

  continueBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent + "55",
    borderRadius: radius.xl, padding: 16, marginBottom: 20,
  },
  continueLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  continuePlay: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  continuePlayIcon: { color: "#fff", fontSize: 16, marginLeft: 3 },
  continueLabel: { color: colors.muted, fontSize: 12 },
  continueEp: { color: "#fff", fontWeight: "800", fontSize: 15, marginTop: 2 },
  continueArrow: { color: colors.muted, fontSize: 26 },

  pageTabs: { gap: 8, paddingBottom: 16 },
  pageTab: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 8 },
  pageTabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pageTabText: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  pageTabTextActive: { color: "#fff" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },

  epCard: { borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 4 },
  epCardWatched: { borderColor: colors.accent + "88" },
  epImg: { width: "100%", aspectRatio: 16 / 9 },
  epPlaceholder: { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  epPlaceholderIcon: { color: colors.border, fontSize: 24 },
  watchedBadge: { position: "absolute", top: 8, left: 8, backgroundColor: colors.accent + "cc", borderRadius: radius.sm, paddingHorizontal: 7, paddingVertical: 3 },
  watchedText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  epOverlay: { position: "absolute", bottom: 40, right: 10 },
  epPlayBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(124,58,237,.85)", alignItems: "center", justifyContent: "center" },
  epPlayIcon: { color: "#fff", fontSize: 11, marginLeft: 2 },
  epInfo: { padding: 10 },
  epNum: { color: "#fff", fontSize: 13, fontWeight: "800" },
  epDur: { color: colors.muted, fontSize: 11, marginTop: 2 },
  progressTrack: { height: 3, backgroundColor: colors.border, marginHorizontal: 0 },
  progressFill: { height: "100%", backgroundColor: colors.accent },
});
