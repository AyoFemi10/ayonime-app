import { useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, Image,
  Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, radius, spacing } from "../../constants/theme";
import { Episode, getEpisodes } from "../../lib/api";

const PAGE_SIZE = 24;

export default function AnimeScreen() {
  const { slug, title } = useLocalSearchParams<{ slug: string; title: string }>();
  const router = useRouter();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastWatched, setLastWatched] = useState<string | null>(null);

  useEffect(() => {
    getEpisodes(slug, title || slug).then(setEpisodes).finally(() => setLoading(false));
    AsyncStorage.getItem(`last_watched_${slug}`).then(setLastWatched);
  }, [slug]);

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
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      </View>

      <FlatList
        data={paged}
        keyExtractor={(e) => e.session}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Continue watching */}
            {lastWatchedEp && (
              <Pressable style={styles.continueBanner} onPress={() => goWatch(lastWatchedEp)}>
                <View style={styles.playCircle}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.continueLabel}>Continue watching</Text>
                  <Text style={styles.continueEp}>Episode {lastWatchedEp.episode}</Text>
                </View>
                <Text style={styles.continueArrow}>›</Text>
              </Pressable>
            )}

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statText}>📺 {episodes.length} episodes</Text>
              </View>
            </View>

            {/* Pagination top */}
            {totalPages > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paginationScroll} contentContainerStyle={styles.pagination}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Pressable key={p} onPress={() => setPage(p)} style={[styles.pageBtn, p === page && styles.pageBtnActive]}>
                    <Text style={[styles.pageBtnText, p === page && styles.pageBtnTextActive]}>{p}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.epCard, item.session === lastWatched && styles.epCardWatched]}
            onPress={() => goWatch(item)}
          >
            {item.snapshot ? (
              <Image source={{ uri: item.snapshot }} style={styles.epImg} resizeMode="cover" />
            ) : (
              <View style={[styles.epImg, styles.epPlaceholder]}>
                <Text style={styles.epPlaceholderText}>▶</Text>
              </View>
            )}
            {item.session === lastWatched && <View style={styles.watchedDot} />}
            <View style={styles.epInfo}>
              <Text style={styles.epNum}>Ep {item.episode}</Text>
              {item.duration ? <Text style={styles.epDur}>{item.duration}</Text> : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  header: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  backText: { color: colors.text, fontSize: 22, fontWeight: "700" },
  headerTitle: { flex: 1, color: colors.white, fontSize: 16, fontWeight: "900" },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  row: { gap: spacing.sm, marginBottom: spacing.sm },

  continueBanner: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent + "55",
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, marginTop: spacing.md,
  },
  playCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
  },
  playIcon: { color: "#fff", fontSize: 14, marginLeft: 2 },
  continueLabel: { color: colors.muted, fontSize: 11 },
  continueEp: { color: colors.white, fontWeight: "800", fontSize: 14 },
  continueArrow: { color: colors.muted, fontSize: 22 },

  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  statChip: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5,
  },
  statText: { color: colors.muted, fontSize: 12, fontWeight: "700" },

  paginationScroll: { marginBottom: spacing.md },
  pagination: { gap: spacing.sm, paddingVertical: 2 },
  pageBtn: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 7, minWidth: 38, alignItems: "center",
  },
  pageBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pageBtnText: { color: colors.muted, fontWeight: "800", fontSize: 13 },
  pageBtnTextActive: { color: "#fff" },

  epCard: {
    flex: 1, backgroundColor: colors.card,
    borderRadius: radius.md, overflow: "hidden",
    borderWidth: 1, borderColor: colors.border,
  },
  epCardWatched: { borderColor: colors.accent + "88" },
  epImg: { width: "100%", aspectRatio: 16 / 9 },
  epPlaceholder: { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  epPlaceholderText: { color: colors.border, fontSize: 16 },
  watchedDot: {
    position: "absolute", top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent,
  },
  epInfo: { padding: 6 },
  epNum: { color: colors.white, fontSize: 11, fontWeight: "800" },
  epDur: { color: colors.muted, fontSize: 10, marginTop: 1 },
});
