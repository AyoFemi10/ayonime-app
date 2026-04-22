import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../constants/theme";

export default function SectionHeader({
  title, badge, onSeeAll,
}: {
  title: string; badge?: string; onSeeAll?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.bar} />
      <Text style={styles.title}>{title}</Text>
      {badge ? (
        <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
      ) : null}
      {onSeeAll ? (
        <Pressable style={styles.seeAll} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See all →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  bar: { width: 4, height: 22, borderRadius: radius.full, backgroundColor: colors.accent },
  title: { color: colors.white, fontSize: 18, fontWeight: "900", flex: 1 },
  badge: {
    backgroundColor: "rgba(250,204,21,.15)",
    borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: "rgba(250,204,21,.2)",
  },
  badgeText: { color: "#facc15", fontSize: 10, fontWeight: "800" },
  seeAll: { paddingHorizontal: 4 },
  seeAllText: { color: colors.accent, fontSize: 12, fontWeight: "700" },
});
