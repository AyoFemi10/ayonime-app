import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius } from "../constants/theme";
import { AnimeProp } from "../lib/api";

export default function AnimeCard({ anime, width }: { anime: AnimeProp; width?: number }) {
  const router = useRouter();
  return (
    <Pressable
      style={[styles.card, width ? { width } : {}]}
      onPress={() => router.push({ pathname: "/anime/[slug]", params: { slug: anime.session, title: anime.title } })}
    >
      <View style={styles.posterWrap}>
        {anime.poster ? (
          <Image source={{ uri: anime.poster }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={[styles.poster, styles.posterFallback]}>
            <Text style={styles.fallbackText}>?</Text>
          </View>
        )}
        {/* Gradient overlay at bottom */}
        <View style={styles.posterOverlay} />

        {/* Score badge */}
        {anime.score ? (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>★ {anime.score}</Text>
          </View>
        ) : null}

        {/* Type badge */}
        {anime.type ? (
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{anime.type}</Text>
          </View>
        ) : null}

        {/* Play button on hover area */}
        <View style={styles.playBtn}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{anime.title}</Text>
        {anime.episodes ? (
          <Text style={styles.eps}>{anime.episodes} eps</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, maxWidth: "50%" },
  posterWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    aspectRatio: 2 / 3,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  poster: { width: "100%", height: "100%" },
  posterFallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  fallbackText: { color: colors.muted, fontSize: 28, fontWeight: "900" },
  posterOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
    backgroundColor: "transparent",
  },
  scoreBadge: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "rgba(0,0,0,.75)",
    borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: "rgba(250,204,21,.3)",
  },
  scoreText: { color: "#facc15", fontSize: 10, fontWeight: "800" },
  typeBadge: {
    position: "absolute", top: 6, left: 6,
    backgroundColor: "rgba(124,58,237,.8)",
    borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2,
  },
  typeText: { color: "#fff", fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
  playBtn: {
    position: "absolute", bottom: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(124,58,237,.9)",
    alignItems: "center", justifyContent: "center",
  },
  playIcon: { color: "#fff", fontSize: 10, marginLeft: 2 },
  info: { paddingTop: 8, paddingHorizontal: 2, paddingBottom: 4 },
  title: { color: colors.text, fontSize: 12, fontWeight: "700", lineHeight: 17 },
  eps: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
