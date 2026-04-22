import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, Pressable,
  StyleSheet, Text, View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors, radius, spacing } from "../constants/theme";
import { getJobStatus } from "../lib/api";
import { getMyJobIds, removeMyJobId } from "../lib/downloads";

type DownloadStatus = "queued" | "resolving" | "downloading" | "compiling" | "done" | "failed";

interface DownloadJob {
  job_id: string;
  status: DownloadStatus;
  progress: number;
  file_path: string | null;
  error: string | null;
  anime_title: string;
  episode_number: number;
}

const STATUS_COLOR: Record<DownloadStatus, { bg: string; text: string }> = {
  queued:     { bg: "rgba(234,179,8,.15)",   text: "#eab308" },
  resolving:  { bg: "rgba(59,130,246,.15)",  text: "#60a5fa" },
  downloading:{ bg: "rgba(124,58,237,.15)",  text: "#a78bfa" },
  compiling:  { bg: "rgba(249,115,22,.15)",  text: "#fb923c" },
  done:       { bg: "rgba(34,197,94,.15)",   text: "#4ade80" },
  failed:     { bg: "rgba(239,68,68,.15)",   text: "#f87171" },
};

const STATUS_LABEL: Record<DownloadStatus, string> = {
  queued: "Waiting...",
  resolving: "Resolving stream...",
  downloading: "Downloading...",
  compiling: "Compiling...",
  done: "Done",
  failed: "Failed",
};

const ACTIVE: DownloadStatus[] = ["queued", "resolving", "downloading", "compiling"];

export default function DownloadsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    const ids = await getMyJobIds();
    if (ids.length === 0) { setJobs([]); setLoading(false); return; }

    const results = await Promise.allSettled(ids.map((id) => getJobStatus(id)));
    const fetched = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean) as DownloadJob[];

    setJobs(fetched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2500);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const removeJob = async (jobId: string) => {
    await removeMyJobId(jobId);
    setJobs((prev) => prev.filter((j) => j.job_id !== jobId));
  };

  const hasActive = jobs.some((j) => ACTIVE.includes(j.status));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>My Downloads</Text>
        {hasActive && (
          <View style={styles.activeDot} />
        )}
        <Pressable onPress={fetchJobs} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>⬇</Text>
          <Text style={styles.emptyTitle}>No downloads yet</Text>
          <Text style={styles.emptyText}>Hit Download MP4 on any episode to get started.</Text>
        </View>
      ) : (
        <>
          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryText}>✓ {jobs.filter((j) => j.status === "done").length} done</Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryText}>⟳ {jobs.filter((j) => ACTIVE.includes(j.status)).length} active</Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryText}>✕ {jobs.filter((j) => j.status === "failed").length} failed</Text>
            </View>
          </View>

          <FlatList
            data={jobs}
            keyExtractor={(j) => j.job_id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: job }) => {
              const sc = STATUS_COLOR[job.status] || { bg: "rgba(100,116,139,.15)", text: colors.muted };
              const isActive = ACTIVE.includes(job.status);
              return (
                <View style={styles.card}>
                  {/* Top row */}
                  <View style={styles.cardTop}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{job.anime_title}</Text>
                      <Text style={styles.cardEp}>Episode {job.episode_number}</Text>
                    </View>
                    <View style={styles.cardRight}>
                      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusText, { color: sc.text }]}>{job.status.toUpperCase()}</Text>
                      </View>
                      {!isActive && (
                        <Pressable onPress={() => removeJob(job.job_id)} style={styles.removeBtn}>
                          <Text style={styles.removeText}>✕</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {/* Progress bar */}
                  {isActive && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressMeta}>
                        <Text style={styles.progressLabel}>{STATUS_LABEL[job.status]}</Text>
                        <Text style={styles.progressPct}>{job.progress}%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${job.progress}%` }]} />
                      </View>
                    </View>
                  )}

                  {/* Done */}
                  {job.status === "done" && (
                    <View style={styles.doneRow}>
                      <Text style={styles.doneIcon}>✓</Text>
                      <Text style={styles.doneText}>Ready to save</Text>
                    </View>
                  )}

                  {/* Error */}
                  {job.status === "failed" && job.error && (
                    <Text style={styles.errorText}>{job.error}</Text>
                  )}
                </View>
              );
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  backText: { color: colors.text, fontSize: 22, fontWeight: "700" },
  headerTitle: { flex: 1, color: colors.white, fontSize: 18, fontWeight: "900" },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  refreshBtn: { padding: 6 },
  refreshText: { color: colors.muted, fontSize: 20 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  emptyIcon: { fontSize: 48, marginBottom: spacing.sm },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: "center", paddingHorizontal: 40 },

  summary: { flexDirection: "row", gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.sm },
  summaryChip: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5,
  },
  summaryText: { color: colors.muted, fontSize: 11, fontWeight: "700" },

  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },

  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  cardInfo: { flex: 1 },
  cardTitle: { color: colors.white, fontWeight: "700", fontSize: 14 },
  cardEp: { color: colors.muted, fontSize: 12, marginTop: 2 },
  cardRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  statusBadge: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: "800" },
  removeBtn: { padding: 4 },
  removeText: { color: colors.muted, fontSize: 14 },

  progressSection: { gap: 6 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { color: colors.muted, fontSize: 12 },
  progressPct: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: radius.full, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.accent, borderRadius: radius.full },

  doneRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  doneIcon: { color: "#4ade80", fontSize: 16 },
  doneText: { color: "#4ade80", fontSize: 13, fontWeight: "700" },
  errorText: { color: "#f87171", fontSize: 12 },
});
