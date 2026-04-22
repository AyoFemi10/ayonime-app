import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, spacing } from "../constants/theme";

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showSearch?: boolean;
  right?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, showBack, showSearch, right }: Props) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}><Text style={styles.logoIconText}>A</Text></View>
            <View>
              <Text style={styles.logoText}>AYO<Text style={styles.logoAccent}>NIME</Text></Text>
              {subtitle ? <Text style={styles.logoSub}>{subtitle}</Text> : null}
            </View>
          </View>
        )}
        {title && showBack ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={styles.pageSub}>{subtitle}</Text> : null}
          </View>
        ) : null}
      </View>
      <View style={styles.right}>
        {showSearch && (
          <Pressable style={styles.iconBtn} onPress={() => router.push("/search")}>
            <Text style={styles.iconBtnText}>🔍</Text>
          </Pressable>
        )}
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: 14,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  backIcon: { color: "#fff", fontSize: 20, fontWeight: "700" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
  },
  logoIconText: { color: "#fff", fontWeight: "900", fontSize: 20 },
  logoText: { color: "#fff", fontWeight: "900", fontSize: 22, letterSpacing: -0.5 },
  logoAccent: { color: colors.pink },
  logoSub: { color: colors.muted, fontSize: 11, marginTop: 1 },
  pageTitle: { color: "#fff", fontSize: 17, fontWeight: "900" },
  pageSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  iconBtnText: { fontSize: 18 },
});
