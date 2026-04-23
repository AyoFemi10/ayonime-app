import { useEffect, useState } from "react";
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { colors, radius, spacing } from "../constants/theme";
import { clearHistory, getHistory, getWatchlist, HistoryItem, removeFromWatchlist, WatchlistItem } from "../lib/storage";
import { hapticMedium } from "../lib/haptics";

type Tab = "history" | "watchlist" | "about";

export default function SettingsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("history");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    getHistory().then(setHistory);
    getWatchlist().then(setWatchlist);
  }, []);

  const handleClearHistory = () => {
    Alert.alert("Clear History", "Remove all watch history?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: async () => { await clearHistory(); setHistory([]); } },
    ]);
  };

  const handleRemoveWatchlist = async (session: string) => {
    hapticMedium();
    await removeFromWatchlist(session);
    setWatchlist((prev) => prev.filter((w) => w.session !== session));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(["history", "watchlist", "about"] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "history" ? "History" : t === "watchlist" ? "Watchlist" : "About"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "history" && (
        <View style={{ flex: 1 }}>
          {history.length > 0 && (
            <Pressable onPress={handleClearHistory} style={styles.clearBtn}>
              <Text style={styles.clearText}>Clear All</Text>
            </Pressable>
          )}
          <FlatList
            data={history}
            keyExtractor={(i) => `${i.animeSession}-${i.episodeSession}`}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<EmptyState icon="time-outline" text="No watch history yet" />}
            renderItem={({ item }) => (
              <Pressable
                style={styles.historyCard}
                onPress={() => router.push({ pathname: "/anime/[slug]", params: { slug: item.animeSession, title: item.animeTitle } })}
              >
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle} numberOfLines={1}>{item.animeTitle}</Text>
                  <Text style={styles.historyEp}>Episode {item.episodeNumber}</Text>
                  <Text style={styles.historyTime}>{new Date(item.watchedAt).toLocaleDateString()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            )}
          />
        </View>
      )}

      {tab === "watchlist" && (
        <FlatList
          data={watchlist}
          keyExtractor={(i) => i.session}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState icon="bookmark-outline" text="No saved anime yet\nTap the bookmark icon on any anime" />}
          renderItem={({ item }) => (
            <Pressable
              style={styles.historyCard}
              onPress={() => router.push({ pathname: "/anime/[slug]", params: { slug: item.session, title: item.title } })}
            >
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.historyTime}>Added {new Date(item.addedAt).toLocaleDateString()}</Text>
              </View>
              <Pressable onPress={() => handleRemoveWatchlist(item.session)} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={18} color="#f87171" />
              </Pressable>
            </Pressable>
          )}
        />
      )}

      {tab === "about" && (
        <ScrollView contentContainerStyle={styles.list}>
          <AboutRow label="App Version" value={Constants.expoConfig?.version || "1.0.0"} />
          <AboutRow label="Backend" value="apis.ayohost.site" />
          <AboutRow label="Source" value="AnimePahe" />
          <AboutRow label="Developer" value="AYOMIKUN DEV CORP" />
        </ScrollView>
      )}
    </View>
  );
}

function EmptyState({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>["name"]; text: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={48} color={colors.muted} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function AboutRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.aboutRow}>
      <Text style={styles.aboutLabel}>{label}</Text>
      <Text style={styles.aboutValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: 16 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "900" },
  tabs: { flexDirection: "row", backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { color: colors.muted, fontWeight: "700", fontSize: 14 },
  tabTextActive: { color: "#fff" },
  clearBtn: { alignSelf: "flex-end", paddingHorizontal: spacing.lg, paddingVertical: 8 },
  clearText: { color: "#f87171", fontSize: 13, fontWeight: "700" },
  list: { padding: spacing.lg, gap: 10, paddingBottom: 48 },
  historyCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 14, gap: 12 },
  historyInfo: { flex: 1 },
  historyTitle: { color: "#fff", fontWeight: "700", fontSize: 14 },
  historyEp: { color: colors.accent, fontSize: 12, marginTop: 2 },
  historyTime: { color: colors.muted, fontSize: 11, marginTop: 2 },
  removeBtn: { padding: 6 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", lineHeight: 22 },
  aboutRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border },
  aboutLabel: { color: colors.text, fontSize: 14 },
  aboutValue: { color: colors.muted, fontSize: 14 },
});
