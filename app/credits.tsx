import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing } from "../constants/theme";

export default function CreditsScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Credits</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Developer hero */}
        <LinearGradient colors={[colors.accent + "44", colors.bg]} style={styles.devCard}>
          <View style={styles.devIcon}><Text style={styles.devA}>A</Text></View>
          <Text style={styles.devName}>AYOMIKUN DEV</Text>
          <Text style={styles.devTitle}>Creator & Developer of AYONIME</Text>
          <Text style={styles.devDesc}>
            Built with passion to give anime fans the best free streaming experience.
            No ads, no subscriptions, just pure anime.
          </Text>
          <View style={styles.socialRow}>
            <SocialBtn label="Telegram" emoji="✈️" url="https://t.me/ayomikundev" />
            <SocialBtn label="GitHub" emoji="🐙" url="https://github.com/AyoFemi10" />
            <SocialBtn label="Channel" emoji="📢" url="https://t.me/ayomikun_channel" />
          </View>
        </LinearGradient>

        <Text style={styles.sectionLabel}>Built With</Text>

        <CreditCard emoji="🎌" title="AnimePahe" desc="All anime content sourced from AnimePahe. We do not host any video files." />
        <CreditCard emoji="⚡" title="FastAPI" desc="Backend powered by FastAPI — fast, modern Python web framework." />
        <CreditCard emoji="📱" title="Expo & React Native" desc="Mobile app built with Expo and React Native." />
        <CreditCard emoji="🎬" title="HLS.js" desc="Web streaming powered by HLS.js." />
        <CreditCard emoji="🌐" title="Next.js" desc="Website built with Next.js and Tailwind CSS." />
        <CreditCard emoji="✨" title="Reanimated & Moti" desc="Smooth animations powered by React Native Reanimated." />

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 AYOMIKUN DEV CORP</Text>
          <Text style={styles.footerSub}>For personal use only. All rights reserved.</Text>
          <Text style={styles.footerSub}>Made with ❤️ by AYOMIKUN</Text>
        </View>

      </ScrollView>
    </View>
  );
}

function SocialBtn({ label, emoji, url }: { label: string; emoji: string; url: string }) {
  return (
    <Pressable style={sb.btn} onPress={() => Linking.openURL(url)}>
      <Text style={sb.emoji}>{emoji}</Text>
      <Text style={sb.label}>{label}</Text>
    </Pressable>
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

const sb = StyleSheet.create({
  btn: { flex: 1, backgroundColor: "rgba(255,255,255,.1)", borderRadius: radius.lg, paddingVertical: 10, alignItems: "center", gap: 4 },
  emoji: { fontSize: 20 },
  label: { color: "#fff", fontSize: 11, fontWeight: "700" },
});

const card = StyleSheet.create({
  wrap: { flexDirection: "row", gap: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 16, alignItems: "flex-start" },
  emoji: { fontSize: 26, marginTop: 2 },
  info: { flex: 1 },
  title: { color: "#fff", fontSize: 15, fontWeight: "800", marginBottom: 4 },
  desc: { color: colors.muted, fontSize: 13, lineHeight: 19 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: 16 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "900" },
  content: { padding: spacing.lg, gap: 12, paddingBottom: 48 },

  devCard: { borderRadius: radius.xl, padding: 24, alignItems: "center", gap: 8, marginBottom: 8 },
  devIcon: { width: 80, height: 80, borderRadius: 22, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  devA: { color: "#fff", fontWeight: "900", fontSize: 42 },
  devName: { color: "#fff", fontSize: 22, fontWeight: "900" },
  devTitle: { color: colors.accent, fontSize: 13, fontWeight: "700" },
  devDesc: { color: colors.muted, fontSize: 13, textAlign: "center", lineHeight: 20, marginTop: 4 },
  socialRow: { flexDirection: "row", gap: 10, marginTop: 8, width: "100%" },

  sectionLabel: { color: colors.muted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1, marginTop: 8, paddingHorizontal: 4 },

  footer: { alignItems: "center", paddingTop: 16, gap: 4 },
  footerText: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  footerSub: { color: colors.border, fontSize: 12 },
});
