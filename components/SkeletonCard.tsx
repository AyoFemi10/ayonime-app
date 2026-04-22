import { Dimensions, StyleSheet, View } from "react-native";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import { colors, radius } from "../constants/theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 12) / 2;

export default function SkeletonCard() {
  return (
    <View style={{ width: CARD_WIDTH }}>
      <Skeleton colorMode="dark" width={CARD_WIDTH} height={CARD_WIDTH * 1.5} radius={radius.lg} />
      <View style={{ marginTop: 8, gap: 6 }}>
        <Skeleton colorMode="dark" width={CARD_WIDTH * 0.9} height={13} radius={4} />
        <Skeleton colorMode="dark" width={CARD_WIDTH * 0.5} height={11} radius={4} />
      </View>
    </View>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
});
