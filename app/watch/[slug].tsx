import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import * as ScreenOrientation from "expo-screen-orientation";
import { colors } from "../../constants/theme";
import { getStreamUrl, startDownload } from "../../lib/api";
import { saveMyJobId } from "../../lib/downloads";

const QUALITIES = ["best", "1080", "720", "480"] as const;
const AUDIOS = [{ value: "jpn", label: "JPN" }, { value: "eng", label: "ENG" }] as const;

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
  const [controlsVisible, setControlsVisible] = useState(true);
  const [dlStatus, setDlStatus] = useState<"idle"|"loading"|"done"|"failed">("idle");
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const player = useVideoPlayer(streamUrl || "", (p) => {
    p.play();
  });

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => { ScreenOrientation.unlockAsync(); };
  }, []);

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

  const showControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Loading stream...</Text>
        </View>
      )}

      {error ? (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={loadStream}>
            <Text style={styles.retryText}>↺ Retry</Text>
          </Pressable>
        </View>
      ) : streamUrl ? (
        <Pressable style={styles.videoWrap} onPress={showControls}>
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
          />

          {controlsVisible && (
            <View style={styles.controls}>
              {/* Top */}
              <View style={styles.topBar}>
                <Pressable onPress={() => router.back()}>
                  <Text style={styles.backText}>← {title} — Ep {ep}</Text>
                </Pressable>
              </View>

              {/* Center play/pause */}
              <Pressable style={styles.centerBtn} onPress={() => {
                player.playing ? player.pause() : player.play();
              }}>
                <Text style={styles.centerBtnText}>{player.playing ? "⏸" : "▶"}</Text>
              </Pressable>

              {/* Bottom */}
              <View style={styles.bottomBar}>
                <View style={styles.optRow}>
                  {QUALITIES.map((q) => (
                    <Pressable key={q} onPress={() => setQuality(q)} style={[styles.optBtn, quality === q && styles.optBtnActive]}>
                      <Text style={[styles.optText, quality === q && styles.optTextActive]}>{q === "best" ? "Best" : `${q}p`}</Text>
                    </Pressable>
                  ))}
                  <View style={styles.divider} />
                  {AUDIOS.map((a) => (
                    <Pressable key={a.value} onPress={() => setAudio(a.value)} style={[styles.optBtn, audio === a.value && styles.optBtnActive]}>
                      <Text style={[styles.optText, audio === a.value && styles.optTextActive]}>{a.label}</Text>
                    </Pressable>
                  ))}
                  <View style={styles.divider} />
                  <Pressable
                    style={[styles.optBtn, dlStatus === "done" && { backgroundColor: "rgba(34,197,94,.3)" }, dlStatus === "loading" && styles.optBtnDisabled]}
                    disabled={dlStatus === "loading"}
                    onPress={async () => {
                      if (dlStatus === "done") { router.push("/downloads"); return; }
                      setDlStatus("loading");
                      try {
                        const jobId = await startDownload({ anime_slug: animeSlug, episode_session: slug, anime_title: title || slug, episode_number: parseInt(ep || "0"), quality, audio });
                        await saveMyJobId(jobId);
                        setDlStatus("done");
                      } catch { setDlStatus("failed"); }
                    }}
                  >
                    <Text style={[styles.optText, dlStatus === "done" && { color: "#4ade80" }]}>
                      {dlStatus === "loading" ? "..." : dlStatus === "done" ? "✓ DL" : "⬇ MP4"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  videoWrap: { flex: 1 },
  video: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "#000", gap: 16 },
  loadingText: { color: colors.muted, fontSize: 14 },
  errorText: { color: "#fff", fontSize: 15, fontWeight: "600", textAlign: "center", paddingHorizontal: 32 },
  retryBtn: { backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  controls: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between" },
  topBar: { backgroundColor: "rgba(0,0,0,.5)", paddingHorizontal: 16, paddingVertical: 12 },
  backText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  centerBtn: { alignSelf: "center", width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(124,58,237,.8)", alignItems: "center", justifyContent: "center" },
  centerBtnText: { color: "#fff", fontSize: 22 },
  bottomBar: { backgroundColor: "rgba(0,0,0,.6)", padding: 12 },
  optRow: { flexDirection: "row", gap: 6, alignItems: "center", flexWrap: "wrap" },
  optBtn: { backgroundColor: "rgba(255,255,255,.1)", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  optBtnActive: { backgroundColor: colors.accent },
  optBtnDisabled: { opacity: 0.4 },
  optText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  optTextActive: { color: "#fff" },
  divider: { width: 1, height: 16, backgroundColor: colors.border },
});
