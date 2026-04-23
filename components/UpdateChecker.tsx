import { useEffect, useState } from "react";
import { Alert, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { colors, radius, spacing } from "../constants/theme";

const API_BASE = "https://apis.ayohost.site";
const CURRENT_VERSION = Constants.expoConfig?.version || "1.0.0";

interface VersionInfo {
  latest_version: string;
  release_date: string;
  download_url: string;
  force_update_after_days: number;
  changelog: string;
}

export default function UpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    try {
      const r = await fetch(`${API_BASE}/api/app/version`);
      const info: VersionInfo = await r.json();

      if (info.latest_version === CURRENT_VERSION) return;

      const daysSinceRelease = Math.floor(
        (Date.now() - new Date(info.release_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceRelease >= info.force_update_after_days) {
        setForceUpdate(true);
        setUpdateInfo(info);
        return;
      }

      const dismissed = await AsyncStorage.getItem(`dismissed_update_${info.latest_version}`);
      if (!dismissed) {
        setUpdateInfo(info);
        setShowBanner(true);
      }
    } catch {}
  };

  const handleUpdate = () => {
    if (updateInfo) Linking.openURL(updateInfo.download_url);
  };

  const handleDismiss = async () => {
    if (updateInfo) await AsyncStorage.setItem(`dismissed_update_${updateInfo.latest_version}`, "true");
    setShowBanner(false);
  };

  if (forceUpdate && updateInfo) {
    return (
      <Modal visible transparent={false} animationType="fade">
        <View style={styles.forceModal}>
          <Text style={styles.forceEmoji}>⚠️</Text>
          <Text style={styles.forceTitle}>App Outdated</Text>
          <Text style={styles.forceText}>
            Your version ({CURRENT_VERSION}) is no longer supported. Please update to v{updateInfo.latest_version} to continue using AYONIME.
          </Text>
          <Pressable style={styles.forceBtn} onPress={handleUpdate}>
            <Text style={styles.forceBtnText}>Update Now</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  if (showBanner && updateInfo) {
    return (
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>🎉 Update Available</Text>
          <Text style={styles.bannerText}>v{updateInfo.latest_version} — {updateInfo.changelog}</Text>
        </View>
        <View style={styles.bannerActions}>
          <Pressable onPress={handleDismiss} style={styles.dismissBtn}>
            <Text style={styles.dismissText}>Later</Text>
          </Pressable>
          <Pressable onPress={handleUpdate} style={styles.updateBtn}>
            <Text style={styles.updateText}>Update</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 999,
    backgroundColor: colors.accent, padding: 16, gap: 12,
  },
  bannerContent: { gap: 4 },
  bannerTitle: { color: "#fff", fontSize: 15, fontWeight: "900" },
  bannerText: { color: "rgba(255,255,255,.85)", fontSize: 13 },
  bannerActions: { flexDirection: "row", gap: 10 },
  dismissBtn: { flex: 1, backgroundColor: "rgba(255,255,255,.2)", borderRadius: radius.lg, paddingVertical: 10, alignItems: "center" },
  dismissText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  updateBtn: { flex: 1, backgroundColor: "#fff", borderRadius: radius.lg, paddingVertical: 10, alignItems: "center" },
  updateText: { color: colors.accent, fontWeight: "900", fontSize: 14 },

  forceModal: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  forceEmoji: { fontSize: 64 },
  forceTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  forceText: { color: colors.muted, fontSize: 15, textAlign: "center", lineHeight: 22 },
  forceBtn: { backgroundColor: colors.accent, borderRadius: radius.xl, paddingHorizontal: 40, paddingVertical: 16, marginTop: 8 },
  forceBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
