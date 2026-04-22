import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../constants/theme";

export default function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 2);
  return (
    <View style={styles.row}>
      <Pressable onPress={() => onChange(Math.max(1, page - 1))} disabled={page === 1} style={[styles.btn, page === 1 && styles.off]}>
        <Text style={styles.btnText}>‹</Text>
      </Pressable>
      {pages.map((p) => (
        <Pressable key={p} onPress={() => onChange(p)} style={[styles.btn, p === page && styles.active]}>
          <Text style={[styles.btnText, p === page && styles.activeText]}>{p}</Text>
        </Pressable>
      ))}
      <Pressable onPress={() => onChange(Math.min(total, page + 1))} disabled={page === total} style={[styles.btn, page === total && styles.off]}>
        <Text style={styles.btnText}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 20 },
  btn: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  active: { backgroundColor: colors.accent, borderColor: colors.accent },
  off: { opacity: 0.3 },
  btnText: { color: colors.muted, fontWeight: "800", fontSize: 16 },
  activeText: { color: "#fff" },
});
