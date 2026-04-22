import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../constants/theme";
import { AnimeProp } from "../lib/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 12) / 2;

export default function AnimeCard({ anime, index = 0 }: { anime: AnimeProp; index?: number }) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const tap = Gesture.Tap()
    .onBegin(() => { scale.value = withSpring(0.95, { damping: 15 }); })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15 });
      router.push({ pathname: "/anime/[slug]", params: { slug: anime.session, title: anime.title } });
    });

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350, delay: index * 60 }}
      style={{ width: CARD_WIDTH }}
    >
      <GestureDetector gesture={tap}>
        <Animated.View style={animStyle}>
          <View style={styles.posterWrap}>
            {anime.poster ? (
              <Image source={{ uri: anime.poster }} style={styles.poster} resizeMode="cover" />
            ) : (
              <View style={[styles.poster, styles.fallback]}>
                <Text style={styles.fallbackText}>?</Text>
              </View>
            )}

            {/* Bottom gradient */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.85)"]}
              style={styles.gradient}
            />

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

            {/* Play button */}
            <View style={styles.playBtn}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </View>

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>{anime.title}</Text>
            {anime.episodes ? <Text style={styles.eps}>{anime.episodes} eps</Text> : null}
          </View>
        </Animated.View>
      </GestureDetector>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  posterWrap: { borderRadius: radius.lg, overflow: "hidden", aspectRatio: 2 / 3, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  poster: { width: "100%", height: "100%" },
  fallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  fallbackText: { color: colors.muted, fontSize: 32, fontWeight: "900" },
  gradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: "55%" },
  scoreBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,.8)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(250,204,21,.4)" },
  scoreText: { color: "#facc15", fontSize: 11, fontWeight: "800" },
  typeBadge: { position: "absolute", top: 8, left: 8, backgroundColor: colors.accent + "dd", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  typeText: { color: "#fff", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  playBtn: { position: "absolute", bottom: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(124,58,237,.9)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,.25)" },
  playIcon: { color: "#fff", fontSize: 11, marginLeft: 2 },
  info: { paddingTop: 10, paddingHorizontal: 2, paddingBottom: 6 },
  title: { color: colors.text, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  eps: { color: colors.muted, fontSize: 11, marginTop: 3 },
});
