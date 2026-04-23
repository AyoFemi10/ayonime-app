import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../constants/theme";
import { getJobStatus } from "../lib/api";
import { getMyJobIds, removeMyJobId } from "../lib/downloads";
import { getLocalDownloads, LocalDownload, removeLocalDownload } from "../lib/storage";

import EmptyState from "../components/EmptyState";

const API_BASE = "https://apis.ayohost.site";
type Tab = "server" | "local";
type DlStatus = "queued" | "resolving" | "downloading" | "compiling" | "done" | "failed";
interface Job { job_id: string; status: DlStatus; progress: number; file_path: string | null; error: string | null; anime_title: string; episode_number: number; }

const STATUS: Record<DlStatus, { bg: string; text: string; label: string }> = {
  queued:      { bg: "rgba(234,179,8,.15)",   text: "#eab308", label: "Queued" },
  resolving:   { bg: "rgba(59,130,246,.15)",  text: "#60a5fa", label: "Resolving" },
  downloading: { bg: "rgba(124,58,237,.15)",  text: "#a78bfa", label: "Downloading" },
  compiling:   { bg: "rgba(249,115,22,.15)",  text: "#fb923c", label: "Compiling" },
  done:        { bg: "rgba(34,197,94,.15)",   text: "#4ade80", label: "Done ✓" },
  failed:      { bg: "rgba(239,68,68,.15)",   text: "#f87171", label: "Failed" },
};
const ACTIVE: DlStatus[] = ["queued", "resolving", "downloading", "compiling"];

export default function DownloadsScreen() {
  const [tab, setTab] = useState<Tab>("server");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [localFiles, setLocalFiles] = useState<LocalDownload[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    const ids = await getMyJobIds();
    if (!ids.length) { setJobs([]); setLoading(false); return; }
    const results = await Promise.allSettled(ids.map(getJobStatus));
    setJobs(results.map((r) => r.status === "fulfilled" ? r.value : null).filter(Boolean) as Job[]);
    setLoading(false);
  }, []);

  const fetchLocal = useCallback(async () => {
    const files = await getLocalDownloads();
    const valid = await Promise.all(files.map(async (f) => {
      try { const info = await FileSystem.getInfoAsync(f.localUri); return info.exists ? f : null; } catch { return null; }
    }));
    setLocalFiles(valid.filter(Boolean) as LocalDownload[]);
  }, []);

  useEffect(() => {
    fetchJobs(); fetchLocal();
    const t = setInterval(() => { fetchJobs(); fetchLocal(); }, 2500);
    return () => clearInterval(t);
  }, [fetchJobs, fetchLocal]);

  const remove = async (id: string) => { await removeMyJobId(id); setJobs((p) => p.filter((j) => j.job_id !== id)); };

  const deleteLocalFile = async (item: LocalDownload) => {
    Alert.alert("Delete File", `Delete ${item.fileName}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try { await FileSystem.deleteAsync(item.localUri, { idempotent: true }); } catch {}
        await removeLocalDownload(item.jobId);
        setLocalFiles((p) => p.filter((f) => f.jobId !== item.jobId));
      }},
    ]);
  };

  const saveToDevice = async (job: Job) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") { Alert.alert("Permission needed", "Allow storage access."); return; }
      const fileUrl = `${API_BASE}/api/download/${job.job_id}/file`;
      const fileName = `AYONIME_${job.anime_title.replace(/[^a-zA-Z0-9]/g, "_")}_Ep${job.episode_number}.mp4`;
      const localUri = FileSystem.documentDirectory + fileName;
      await FileSystem.downloadAsync(fileUrl, localUri);
      const asset = await MediaLibrary.createAssetAsync(localUri);
      await MediaLibrary.createAlbumAsync("AYONIME", asset, false);
      Alert.alert("✓ Saved!", `${fileName} saved to your gallery.`);
    } catch (e: any) { Alert.alert("Save failed", e?.message || "Something went wrong."); }
  };

  const hasActive = jobs.some((j) => ACTIVE.includes(j.status));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Downloads</Text>
          <View style={styles.headerRight}>
            {hasActive && <View style={styles.activeDot} />}
            <Pressable onPress={() => { fetchJobs(); fetchLocal(); }} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={18} color={colors.muted} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === "server" && styles.tabActive]} onPress={() => setTab("server")}>
          <Ionicons name="cloud-download-outline" size={16} color={tab === "server" ? "#fff" : colors.muted} />
          <Text style={[styles.tabText, tab === "server" && styles.tabTextActive]}>Queue</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === "local" && styles.tabActive]} onPress={() => setTab("local")}>
          <Ionicons name="folder-outline" size={16} color={tab === "local" ? "#fff" : colors.muted} />
          <Text style={[styles.tabText, tab === "local" && styles.tabTextActive]}>Saved ({localFiles.length})</Text>
        </Pressable>
      </View>

      {tab === "local" ? (
        localFiles.length === 0 ? (
          <EmptyState type="downloads" title="No saved files" subtitle="Downloaded episodes will appear here" />
        ) : (
          <FlatList
            data={localFiles}
            keyExtractor={(i) => i.jobId}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Ionicons name="film-outline" size={24} color={colors.accent} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.animeTitle}</Text>
                    <Text style={styles.cardEp}>Episode {item.episodeNumber}</Text>
                    <Text style={styles.cardEp}>{item.fileName}</Text>
                  </View>
                  <Pressable onPress={() => deleteLocalFile(item)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={18} color="#f87171" />
                  </Pressable>
                </View>
              </View>
            )}
          />
        )
      ) : loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>
      ) : jobs.length === 0 ? (
        <EmptyState type="downloads" title="No downloads yet" subtitle='Tap "Download MP4" on any episode to start' />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(j) => j.job_id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: job }) => {
            const s = STATUS[job.status] || { bg: "rgba(100,116,139,.15)", text: colors.muted, label: job.status };
            const isActive = ACTIVE.includes(job.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{job.anime_title}</Text>
                    <Text style={styles.cardEp}>Episode {job.episode_number}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <View style={[styles.badge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.badgeText, { color: s.text }]}>{s.label.toUpperCase()}</Text>
                    </View>
                    {!isActive && (
                      <Pressable onPress={() => remove(job.job_id)} style={styles.removeBtn}>
                        <Ionicons name="close" size={16} color={colors.muted} />
                      </Pressable>
                    )}
                  </View>
                </View>
                {isActive && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressMeta}>
                      <Text style={styles.progressLabel}>{s.label}...</Text>
                      <Text style={styles.progressPct}>{job.progress}%</Text>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${job.progress}%` as any }]} />
                    </View>
                  </View>
                )}
                {job.status === "done" && (
                  <Pressable style={styles.saveBtn} onPress={() => saveToDevice(job)}>
                    <Ionicons name="download-outline" size={16} color="#4ade80" />
                    <Text style={styles.saveBtnText}>Save to Device</Text>
                  </Pressable>
                )}
                {job.status === "failed" && job.error && (
                  <Text style={styles.errorText}>{job.error}</Text>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[chip.wrap, { borderColor: color + "44", backgroundColor: color + "15" }]}>
      <Text style={[chip.text, { color }]}>{label}</Text>
    </View>
  );
}

const chip = StyleSheet.create({
  wrap: { borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  text: { fontSize: 12, fontWeight: "700" },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: 16 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "900" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  tabs: { flexDirection: "row", backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { color: colors.muted, fontWeight: "700", fontSize: 14 },
  tabTextActive: { color: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyEmoji: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 48 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 16, gap: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardInfo: { flex: 1 },
  cardTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cardEp: { color: colors.muted, fontSize: 13, marginTop: 3 },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  progressSection: { gap: 8 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { color: colors.muted, fontSize: 13 },
  progressPct: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  track: { height: 6, backgroundColor: colors.border, borderRadius: radius.full, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.accent, borderRadius: radius.full },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(34,197,94,.1)", borderWidth: 1, borderColor: "rgba(34,197,94,.4)", borderRadius: radius.lg, paddingVertical: 12 },
  saveBtnText: { color: "#4ade80", fontSize: 14, fontWeight: "800" },
  errorText: { color: "#f87171", fontSize: 13 },
});
