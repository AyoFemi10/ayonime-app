import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Pressable,
  ScrollView, StatusBar, StyleSheet, Text, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { colors, radius, spacing } from "../../constants/theme";
import { getStreamUrl } from "../../lib/api";
import { saveMyJobId } from "../../lib/downloads";
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from "../../lib/haptics";
import { addToHistory, saveProgress, getProgress, getPreferences } from "../../lib/storage";

const API_BASE = "https://apis.ayohost.site";

type DlStatus = "idle" | "requesting" | "downloading" | "saving" | "done" | "failed";

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

  // Load saved preferences as defaults
  useEffect(() => {
    getPreferences().then((p) => {
      setQuality(p.defaultQuality);
      setAudio(p.defaultAudio);
    });
  }, []);
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [availableAudios, setAvailableAudios] = useState<string[]>([]);
  const [dlStatus, setDlStatus] = useState<DlStatus>("idle");
  const [dlProgress, setDlProgress] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadRef = useRef<FileSystem.DownloadResumable | null>(null);
  const qualityReady = useRef(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save progress every 5 seconds while playing
  useEffect(() => {
    progressInterval.current = setInterval(() => {
      if (player.playing && player.duration > 0) {
        saveProgress(slug, player.currentTime, player.duration);
      }
    }, 5000);
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      // Save on unmount too
      if (player.duration > 0) saveProgress(slug, player.currentTime, player.duration);
    };
  }, []);

  const player = useVideoPlayer(streamUrl || "", (p) => {
    if (streamUrl) {
      // Restore saved progress
      getProgress(slug).then((prog) => {
        if (prog && prog.currentTime > 10) p.currentTime = prog.currentTime;
      });
      p.play();
      // Save to history
      addToHistory({
        animeSession: animeSlug,
        animeTitle: title || slug,
        episodeSession: slug,
        episodeNumber: parseInt(ep || "0"),
      });
    }
  });

  // Step 1: fetch available qualities
  useEffect(() => {
    fetch(`${API_BASE}/api/stream/qualities?anime_slug=${animeSlug}&episode_session=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.streams?.length) {
          const qualities = [...new Set<string>(d.streams.map((s: any) => s.quality))];
          const audios = [...new Set<string>(d.streams.map((s: any) => s.audio))];
          setAvailableQualities(qualities);
          setAvailableAudios(audios);
          setQuality(qualities[0]);
          setAudio(audios[0]);
          qualityReady.current = true;
        } else {
          qualityReady.current = true;
        }
      })
      .catch(() => { qualityReady.current = true; })
      .finally(() => loadStream());
  }, [slug]);

  // Step 2: reload stream when quality/audio changes (but not on first mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    loadStream();
  }, [quality, audio]);

  useEffect(() => () => { downloadRef.current?.cancelAsync(); }, []);

  const loadStream = () => {
    setLoading(true);
    setError("");
    setStreamUrl(null);
    getStreamUrl(animeSlug, slug, quality, audio)
      .then((url) => {
        if (!url) setError("Stream not found. Try a different quality.");
        else setStreamUrl(url);
      })
      .catch(() => setError("Failed to load stream. Check your connection."))
      .finally(() => setLoading(false));
  };

  const handleDownload = async () => {
    if (dlStatus === "done") { Alert.alert("Already saved", "Video is in your gallery."); return; }
    if (dlStatus === "requesting" || dlStatus === "downloading" || dlStatus === "saving") return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission needed", "Allow storage access to save videos."); return; }

    setDlStatus("requesting");
    setDlProgress(0);

    try {
      const r = await fetch(`${API_BASE}/api/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anime_slug: animeSlug, episode_session: slug,
          anime_title: title || slug, episode_number: parseInt(ep || "0"),
          quality, audio,
        }),
      });
      const { job_id } = await r.json();
      await saveMyJobId(job_id);
      setDlStatus("downloading");

      const fileUrl = await pollUntilDone(job_id, (pct) => setDlProgress(pct));

      setDlStatus("saving");
      const fileName = `AYONIME_${(title || slug).replace(/[^a-zA-Z0-9]/g, "_")}_Ep${ep}.mp4`;
      const localUri = FileSystem.documentDirectory + fileName;

      downloadRef.current = FileSystem.createDownloadResumable(fileUrl, localUri, {}, (p) => {
        setDlProgress(Math.round((p.totalBytesWritten / p.totalBytesExpectedToWrite) * 100));
      });

      const result = await downloadRef.current.downloadAsync();
      if (!result?.uri) throw new Error("Download failed");

      const asset = await MediaLibrary.createAssetAsync(result.uri);
      await MediaLibrary.createAlbumAsync("AYONIME", asset, false);
      setDlStatus("done");
      hapticSuccess();
      Alert.alert("✓ Saved!", `${fileName} saved to your gallery.`);
    } catch (e: any) {
      setDlStatus("failed");
      hapticError();
      Alert.alert("Download failed", e?.message || "Something went wrong.");
    }
  };

  const showControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3500);
  };

  const isActive = ["requesting", "downloading", "saving"].includes(dlStatus);
  const dlLabel = isActive
    ? `${dlStatus === "requesting" ? "Starting" : dlStatus === "downloading" ? `Preparing ${dlProgress}%` : `Saving ${dlProgress}%`}...`
    : dlStatus === "done" ? "✓  Saved to Gallery"
    : dlStatus === "failed" ? "↺  Retry Download"
    : "⬇  Download to Device";

  const qualities = availableQualities.length > 0 ? availableQualities : ["best", "1080", "720", "480"];
  const audios = availableAudios.length > 0 ? availableAudios : ["jpn", "eng"];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.headerEp}>Episode {ep}</Text>
        </View>
      </View>

      <Pressable style={styles.playerWrap} onPress={showControls}>
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.overlayText}>Loading stream...</Text>
          </View>
        )}
        {!loading && error ? (
          <View style={styles.overlay}>
            <Text style={styles.errorEmoji}>⚠️</Text>
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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={styles.titleBar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.titleText} numberOfLines={2}>{title}</Text>
            <Text style={styles.titleEp}>Episode {ep}</Text>
          </View>
        </View>

        <Pressable
          style={[styles.dlBtn, dlStatus === "done" && styles.dlBtnDone, dlStatus === "failed" && styles.dlBtnFailed, isActive && styles.dlBtnActive]}
          onPress={() => { hapticMedium(); handleDownload(); }}
          disabled={isActive}
        >
          {isActive && <ActivityIndicator color="#fff" size="small" />}
          <Text style={styles.dlBtnText}>{dlLabel}</Text>
        </Pressable>

        {isActive && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${dlProgress}%` as any }]} />
          </View>
        )}

        <View style={styles.controlCard}>
          <Text style={styles.controlLabel}>Quality</Text>
          <View style={styles.optRow}>
            {qualities.map((q) => (
              <Pressable key={q} onPress={() => setQuality(q)} style={[styles.optBtn, quality === q && styles.optActive]}>
                <Text style={[styles.optText, quality === q && styles.optTextActive]}>{q === "best" ? "Best" : `${q}p`}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.controlCard}>
          <Text style={styles.controlLabel}>Audio</Text>
          <View style={styles.optRow}>
            {audios.map((a) => (
              <Pressable key={a} onPress={() => setAudio(a)} style={[styles.optBtn, audio === a && styles.optActive]}>
                <Text style={[styles.optText, audio === a && styles.optTextActive]}>
                  {a === "jpn" ? "Japanese" : a === "eng" ? "English" : a}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.allEpsBtn} onPress={() => router.push({ pathname: "/anime/[slug]", params: { slug: animeSlug, title } })}>
          <Text style={styles.allEpsBtnText}>← All Episodes</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

async function pollUntilDone(jobId: string, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`${API_BASE}/api/download/${jobId}/status`);
        const job = await r.json();
        onProgress(job.progress || 0);
        if (job.status === "done") { clearInterval(interval); resolve(`${API_BASE}/api/download/${jobId}/file`); }
        else if (job.status === "failed") { clearInterval(interval); reject(new Error(job.error || "Failed")); }
      } catch (e) { clearInterval(interval); reject(e); }
    }, 2000);
  });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: spacing.lg, paddingTop: 48, paddingBottom: 14, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  backArrow: { color: "#fff", fontSize: 20, fontWeight: "700" },
  headerInfo: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: "900" },
  headerEp: { color: colors.muted, fontSize: 12, marginTop: 2 },
  playerWrap: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  video: { width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 14 },
  overlayText: { color: colors.muted, fontSize: 14 },
  errorEmoji: { fontSize: 40 },
  errorText: { color: "#fff", fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  retryBtn: { backgroundColor: colors.accent, paddingHorizontal: 28, paddingVertical: 12, borderRadius: radius.lg },
  retryText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  playerControls: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  bigPlayBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(124,58,237,.85)", alignItems: "center", justifyContent: "center" },
  bigPlayIcon: { color: "#fff", fontSize: 26 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: 48 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  titleBar: { width: 4, height: 44, borderRadius: 4, backgroundColor: colors.accent, marginTop: 2 },
  titleText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  titleEp: { color: colors.muted, fontSize: 14, marginTop: 4 },
  dlBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: colors.accent, borderRadius: radius.xl, paddingVertical: 16, elevation: 4 },
  dlBtnDone: { backgroundColor: "#16a34a" },
  dlBtnFailed: { backgroundColor: "#dc2626" },
  dlBtnActive: { opacity: 0.7 },
  dlBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.accent, borderRadius: 4 },
  controlCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 16, gap: 12 },
  controlLabel: { color: colors.muted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  optRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  optBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 9 },
  optActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  optText: { color: colors.muted, fontWeight: "700", fontSize: 14 },
  optTextActive: { color: "#fff" },
  allEpsBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, paddingVertical: 14, alignItems: "center" },
  allEpsBtnText: { color: colors.muted, fontWeight: "700", fontSize: 14 },
});
