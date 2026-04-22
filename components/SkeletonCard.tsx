import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, cancelAnimation } from "react-native-reanimated";
import { useEffect } from "react";
import { colors, radius } from "../constants/theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 12) / 2;

function SkeletonBox({ w, h, style }: { w: number | string; h: number; style?: object }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    return () => cancelAnimation(opacity);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ width: w, height: h, borderRadius: radius.md, backgroundColor: colors.card }, animStyle, style]} />
  );
}

export default function SkeletonCard() {
  return (
    <View style={{ width: CARD_WIDTH, gap: 8 }}>
      <SkeletonBox w={CARD_WIDTH} h={CARD_WIDTH * 1.5} style={{ borderRadius: radius.lg }} />
      <SkeletonBox w={CARD_WIDTH * 0.85} h={13} />
      <SkeletonBox w={CARD_WIDTH * 0.5} h={11} />
    </View>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  const rows: number[][] = [];
  for (let i = 0; i < count; i += 2) rows.push([i, i + 1].filter((x) => x < count));
  return (
    <View style={{ gap: 12 }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row", gap: 12 }}>
          {row.map((i) => <SkeletonCard key={i} />)}
        </View>
      ))}
    </View>
  );
}
