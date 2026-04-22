import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius } from "../constants/theme";
import { AnimeProp } from "../lib/api";

const { width } = Dimensions.get("window");
const COLS = 2;
const GAP = 12;
const CARD_WIDTH = (width - 32 - GAP) / COLS;

export default function AnimeCard({ anime }: { anime: AnimeProp }) {
  const router = useRouter();
  return (
    <Pressable
      style={[styles.card, { width: CARD_WIDTH }]}
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

        {/* Bottom gradient overlay */}
        <View style={styles.overlay} />

        {/* Score */}
        {anime.score ? (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>★ {anime.score}</Text>
          </View>
        ) : null}

        {/* Type */}
        {anime.type ? (
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{anime.type}</Text>
          </View>
        ) : null}

        {/* Play overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playBtn}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{anime.title}</Text>
        {anime.episodes ? <Text style={styles.eps}>{anime.episodes} episodes</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 4 },
  posterWrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
    aspectRatio: 2 / 3,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  poster: { width: "100%", height: "100%" },
  posterFallback: {
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.surface,
  },
  fallbackText: { color: colors.muted, fontSize: 32, fontWeight: "900" },
  overlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scoreBadge: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: "rgba(0,0,0,.8)",
    borderRadius: radius.sm, paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: "rgba(250,204,21,.4)",
  },
  scoreText: { color: "#facc15", fontSize: 11, fontWeight: "800" },
  typeBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: colors.accent + "dd",
    borderRadius: radius.sm, paddingHorizontal: 7, paddingVertical: 3,
  },
  typeText: { color: "#fff", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  playOverlay: {
    position: "absolute", bottom: 10, right: 10,
  },
  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(124,58,237,.9)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,.3)",
  },
  playIcon: { color: "#fff", fontSize: 12, marginLeft: 3 },
  info: { paddingTop: 10, paddingHorizontal: 2, paddingBottom: 8 },
  title: { color: colors.text, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  eps: { color: colors.muted, fontSize: 12, marginTop: 3 },
});
