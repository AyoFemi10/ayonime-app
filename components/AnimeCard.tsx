import { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Animated, {
  cancelAnimation, useAnimatedStyle, useSharedValue,
  withRepeat, withSequence, withSpring, withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../constants/theme";
import { AnimeProp } from "../lib/api";
import { hapticLight } from "../lib/haptics";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 12) / 2;

function ImageShimmer({ cardWidth }: { cardWidth: number }) {
  const shimmerX = useSharedValue(-cardWidth);

  useEffect(() => {
    shimmerX.value = withRepeat(
      withTiming(cardWidth * 2, { duration: 1200 }),
      -1,
      false
    );
    return () => cancelAnimation(shimmerX);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: "hidden", backgroundColor: colors.card }]}>
      <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.06)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, width: cardWidth }}
        />
      </Animated.View>
    </View>
  );
}

export default function AnimeCard({ anime, horizontal }: { anime: AnimeProp; horizontal?: boolean }) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardW = horizontal ? CARD_WIDTH * 0.65 : CARD_WIDTH;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    hapticLight();
    router.push({ pathname: "/anime/[slug]", params: { slug: anime.session, title: anime.title } });
  };

  return (
    <Animated.View style={[{ width: cardW }, animStyle]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 20, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 300 }); }}
        onPress={handlePress}
      >
        <View style={[styles.posterWrap, { height: cardW * 1.5 }]}>
          {/* Shimmer while loading */}
          {!imageLoaded && <ImageShimmer cardWidth={cardW} />}

          {anime.poster ? (
            <Image
              source={{ uri: anime.poster }}
              style={[styles.poster, !imageLoaded && { opacity: 0 }]}
              contentFit="cover"
              cachePolicy="disk"
              onLoad={() => setImageLoaded(true)}
              transition={300}
            />
          ) : (
            <View style={[styles.poster, styles.fallback]}>
              <Text style={styles.fallbackText}>?</Text>
            </View>
          )}

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={styles.gradient}
          />

          {anime.score ? (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>★ {anime.score}</Text>
            </View>
          ) : null}

          {anime.type ? (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{anime.type}</Text>
            </View>
          ) : null}

          <View style={styles.playBtn}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{anime.title}</Text>
          {anime.episodes ? <Text style={styles.eps}>{anime.episodes} eps</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  posterWrap: { borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  poster: { width: "100%", height: "100%" },
  fallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  fallbackText: { color: colors.muted, fontSize: 32, fontWeight: "900" },
  gradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: "50%" },
  scoreBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,.8)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(250,204,21,.4)" },
  scoreText: { color: "#facc15", fontSize: 11, fontWeight: "800" },
  typeBadge: { position: "absolute", top: 8, left: 8, backgroundColor: colors.accent + "dd", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  typeText: { color: "#fff", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  playBtn: { position: "absolute", bottom: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(124,58,237,.9)", alignItems: "center", justifyContent: "center" },
  playIcon: { color: "#fff", fontSize: 11, marginLeft: 2 },
  info: { paddingTop: 10, paddingHorizontal: 2, paddingBottom: 6 },
  title: { color: colors.text, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  eps: { color: colors.muted, fontSize: 11, marginTop: 3 },
});
