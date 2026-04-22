import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors, radius, spacing } from "../constants/theme";

export default function SettingsScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>Playback</Text>
        <View style={styles.card}>
          <Row label="Default Quality" value="Best" />
          <Divider />
          <Row label="Default Audio" value="Japanese" />
        </View>

        <Text style={styles.sectionLabel}>App</Text>
        <View style={styles.card}>
          <Row label="Version" value="1.0.0" />
          <Divider />
          <Row label="Backend" value="apis.ayohost.site" />
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <Row label="Source" value="AnimePahe" />
          <Divider />
          <Row label="Developer" value="AYOMIKUN DEV CORP" />
        </View>

      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={row.wrap}>
      <Text style={row.label}>{label}</Text>
      <Text style={row.value}>{value}</Text>
    </View>
  );
}
function Divider() { return <View style={{ height: 1, backgroundColor: colors.border }} />; }

const row = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  label: { color: colors.text, fontSize: 15 },
  value: { color: colors.muted, fontSize: 14 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: 16 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "900" },
  content: { padding: spacing.lg, paddingBottom: 48, gap: 8 },
  sectionLabel: { color: colors.muted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 8, paddingHorizontal: 4 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: "hidden" },
});
