import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors, radius, spacing } from "../constants/theme";

export default function CreditsScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Credits</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* App logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoIcon}><Text style={styles.logoA}>A</Text></View>
          <Text style={styles.logoName}>AYO<Text style={styles.logoPink}>NIME</Text></Text>
          <Text style={styles.logoVersion}>Version 1.0.0</Text>
        </View>

        <CreditCard
          emoji="🎌"
          title="AnimePahe"
          desc="All anime content is sourced from AnimePahe. We do not host any video files."
        />
        <CreditCard
          emoji="⚡"
          title="FastAPI"
          desc="Backend powered by FastAPI — fast, modern Python web framework."
        />
        <CreditCard
          emoji="📱"
          title="Expo & React Native"
          desc="Mobile app built with Expo and React Native."
        />
        <CreditCard
          emoji="🎬"
          title="HLS.js"
          desc="Web streaming powered by HLS.js for smooth video playback."
        />
        <CreditCard
          emoji="🌐"
          title="Next.js"
          desc="Website built with Next.js and Tailwind CSS."
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 AYOMIKUN DEV CORP</Text>
          <Text style={styles.footerSub}>For personal use only. All rights reserved.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

function CreditCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <View style={card.wrap}>
      <Text style={card.emoji}>{emoji}</Text>
      <View style={card.info}>
        <Text style={card.title}>{title}</Text>
        <Text style={card.desc}>{desc}</Text>
      </View>
    </View>
  );
}

const card = StyleSheet.create({
  wrap: { flexDirection: "row", gap: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 16, alignItems: "flex-start" },
  emoji: { fontSize: 28, marginTop: 2 },
  info: { flex: 1 },
  title: { color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 4 },
  desc: { color: colors.muted, fontSize: 13, lineHeight: 19 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: 16 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "900" },
  content: { padding: spacing.lg, gap: 12, paddingBottom: 48 },
  logoWrap: { alignItems: "center", paddingVertical: 24, gap: 8 },
  logoIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  logoA: { color: "#fff", fontWeight: "900", fontSize: 38 },
  logoName: { color: "#fff", fontWeight: "900", fontSize: 28 },
  logoPink: { color: colors.pink },
  logoVersion: { color: colors.muted, fontSize: 13 },
  footer: { alignItems: "center", paddingTop: 16, gap: 4 },
  footerText: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  footerSub: { color: colors.border, fontSize: 12 },
});
