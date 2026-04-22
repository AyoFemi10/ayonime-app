import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Pressable, ScrollView,
  StatusBar, StyleSheet, Text, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { colors, radius, spacing } from "../../constants/theme";
import { getStreamUrl, startDownload } from "../../lib/api";
import { saveMyJobId } from "../../lib/downloads";

const QUALITIES = ["best", "1080", "720", "480"] as const;
const AUDIOS = [{ value: "jpn", label: "Japanese" }, { value: "eng", label: "English" }] as const;

type DlStatus = "idle" | "loading" | "queued" | "done" | "failed";

export default function WatchScreen() {
  const { slug, animeSlug, title, ep } = useLocalSearchParams<{
    slug: string; animeSlug: string; title: string; ep: string;
  }>();
  const router = useRouter();

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quality, setQuality] = useState("best");
  const [audio, setAudio] = useState("jpn");
  const [dlStatus, setDlStatus] = useState<DlStatus>("idle");
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const player = useVideoPlayer(streamUrl || "", (p) => { p.play(); });

  useEffect(() => { loadStream(); }, [slug, quality, audio]);

  const loadStream = () => {
    setLoading(true);
    setError("");
    setStreamUrl(null);
    getStreamUrl(animeSlug, slug, quality, audio)
      .then((url) => { if (!url) setError("Stream not found"); else setStreamUrl(url); })
      .catch(() => setError("Failed to load stream"))
      .finally(() => setLoading(false));
  };

  const handleDownload = async () => {
    if (dlStatus === "done" || dlStatus === "queued") { router.push("/downloads"); return; }
    setDlStatus("loading");
    try {
      const jobId = await startDownload({
        anime_slug: animeSlug, episode_session: slug,
        anime_title: title || slug, episode_number: parseInt(ep || "0"),
        quality, audio,
      });
      await saveMyJobId(jobId);
      setDlStatus("queued");
    } catch { setDlStatus("failed"); }
  };

  const showControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3500);
  };

  const dlLabel = {
    idle: "⬇  Download MP4",
    loading: "Starting download...",
    queued: "✓  Download queued — View",
    done: "✓  Download queued — View",
    failed: "↺  Retry Download",
  }[dlStatus];

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={colors.bg} />

      {/* Back header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.headerEp}>Episode {ep}</Text>
        </View>
      </View>

      {/* Video player */}
      <Pressable style={styles.playerWrap} onPress={showControls}>
        {loading && (
          <View style={styles.playerOverlay}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.playerOverlayText}>Loading stream...</Text>
          </View>
        )}
        {error ? (
          <View style={styles.playerOverlay}>
            <Text style={styles.errorIcon}>⚠</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={loadStream}>
              <Text style={styles.retryText}>↺  Retry</Text>
            </Pressable>
          </View>
        ) : streamUrl ? (
          <>
            <VideoView player={player} style={styles.video} contentFit="contain" nativeControls={false} />
            {controlsVisible && (
              <View style={styles.playerControls}>
                <Pressable style={styles.bigPlayBtn} onPress={() => player.playing ? player.pause() : player.play()}>
                  <Text style={styles.bigPlayIcon}>{player.playing ? "⏸" : "▶"}</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : null}
      </Pressable>

      {/* Scrollable controls below player */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={styles.titleAccent} />
          <View style={styles.titleInfo}>
            <Text style={styles.titleText} numberOfLines={2}>{title}</Text>
            <Text style={styles.titleEp}>Episode {ep}</Text>
          </View>
        </View>

        {/* Download button — big and obvious */}
        <Pressable
          style={[
            styles.dlBtn,
            dlStatus === "queued" || dlStatus === "done" ? styles.dlBtnDone : null,
            dlStatus === "failed" ? styles.dlBtnFailed : null,
            dlStatus === "loading" ? styles.dlBtnLoading : null,
          ]}
          onPress={handleDownload}
          disabled={dlStatus === "loading"}
        >
          {dlStatus === "loading" ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : null}
          <Text style={styles.dlBtnText}>{dlLabel}</Text>
        </Pressable>

        {/* Quality */}
        <View style={styles.controlCard}>
          <Text style={styles.controlLabel}>Quality</Text>
          <View style={styles.optRow}>
            {QUALITIES.map((q) => (
              <Pressable key={q} onPress={() => setQuality(q)} style={[styles.optBtn, quality === q && styles.optBtnActive]}>
                <Text style={[styles.optText, quality === q && styles.optTextActive]}>
                  {q === "best" ? "Best" : `${q}p`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Audio */}
        <View style={styles.controlCard}>
          <Text style={styles.controlLabel}>Audio</Text>
          <View style={styles.optRow}>
            {AUDIOS.map((a) => (
              <Pressable key={a.value} onPress={() => setAudio(a.value)} style={[styles.optBtn, audio === a.value && styles.optBtnActive]}>
                <Text style={[styles.optText, audio === a.value && styles.optTextActive]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* All episodes link */}
        <Pressable
          style={styles.allEpsBtn}
          onPress={() => router.push({ pathname: "/anime/[slug]", params: { slug: animeSlug, title } })}
        >
          <Text style={styles.allEpsBtnText}>← All Episodes</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: 14,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  backArrow: { color: colors.text, fontSize: 20, fontWeight: "700" },
  headerInfo: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: "900" },
  headerEp: { color: colors.muted, fontSize: 12, marginTop: 2 },

  playerWrap: {
    width: "100%", aspectRatio: 16 / 9,
    backgroundColor: "#000", justifyContent: "center", alignItems: "center",
  },
  video: { width: "100%", height: "100%" },
  playerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 14 },
  playerOverlayText: { color: colors.muted, fontSize: 14 },
  errorIcon: { fontSize: 40 },
  errorText: { color: "#fff", fontSize: 15, fontWeight: "600", textAlign: "center", paddingHorizontal: 32 },
  retryBtn: { backgroundColor: colors.accent, paddingHorizontal: 28, paddingVertical: 12, borderRadius: radius.lg },
  retryText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  playerControls: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  bigPlayBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(124,58,237,.85)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,.3)" },
  bigPlayIcon: { color: "#fff", fontSize: 26 },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: 48 },

  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  titleAccent: { width: 4, height: "100%", minHeight: 40, borderRadius: 4, backgroundColor: colors.accent, marginTop: 2 },
  titleInfo: { flex: 1 },
  titleText: { color: "#fff", fontSize: 18, fontWeight: "900", lineHeight: 24 },
  titleEp: { color: colors.muted, fontSize: 14, marginTop: 4 },

  dlBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.accent, borderRadius: radius.xl,
    paddingVertical: 16, paddingHorizontal: 24,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12,
    elevation: 8,
  },
  dlBtnDone: { backgroundColor: "#16a34a" },
  dlBtnFailed: { backgroundColor: "#dc2626" },
  dlBtnLoading: { opacity: 0.7 },
  dlBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  controlCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16, gap: 12,
  },
  controlLabel: { color: colors.muted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  optRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  optBtn: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 9,
  },
  optBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  optText: { color: colors.muted, fontWeight: "700", fontSize: 14 },
  optTextActive: { color: "#fff" },

  allEpsBtn: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, paddingVertical: 14, alignItems: "center",
  },
  allEpsBtnText: { color: colors.muted, fontWeight: "700", fontSize: 14 },
});
