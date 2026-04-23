import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle } from "react-native-svg";
import { colors, radius, spacing } from "../constants/theme";

function TelegramIcon({ size = 28, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.667l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.978.892z" />
    </Svg>
  );
}

function GitHubIcon({ size = 28, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </Svg>
  );
}

function ChannelIcon({ size = 28, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.667l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.978.892z" />
    </Svg>
  );
}

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
            <SocialBtn label="Telegram" icon={<TelegramIcon />} bg="#229ED9" url="https://t.me/ayomikundev" />
            <SocialBtn label="GitHub" icon={<GitHubIcon />} bg="#333" url="https://github.com/AyoFemi10" />
            <SocialBtn label="Channel" icon={<ChannelIcon />} bg="#229ED9" url="https://t.me/ayomikun_" />
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

function SocialBtn({ label, icon, bg, url }: { label: string; icon: React.ReactNode; bg: string; url: string }) {
  return (
    <Pressable style={[sb.btn, { backgroundColor: bg }]} onPress={() => Linking.openURL(url)}>
      {icon}
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
  btn: { flex: 1, borderRadius: radius.lg, paddingVertical: 12, alignItems: "center", gap: 6 },
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
