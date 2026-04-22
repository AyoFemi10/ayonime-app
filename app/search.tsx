import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Dimensions, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AnimeCard from "../components/AnimeCard";
import { colors, radius, spacing } from "../constants/theme";
import { AnimeProp, searchAnime } from "../lib/api";

export default function SearchScreen() {
  const { q: initialQ } = useLocalSearchParams<{ q: string }>();
  const router = useRouter();
  const [query, setQuery] = useState(initialQ || "");
  const [results, setResults] = useState<AnimeProp[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
    else setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const doSearch = (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    searchAnime(q).then(setResults).finally(() => setLoading(false));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search anime..."
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => doSearch(query)}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
              <Text style={styles.clearText}>✕</Text>
            </Pressable>
          )}
        </View>
        <Pressable style={styles.goBtn} onPress={() => doSearch(query)}>
          <Text style={styles.goBtnText}>Go</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.centerText}>Searching...</Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>😔</Text>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>Try a different search term</Text>
        </View>
      ) : results.length > 0 ? (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultCount}>{results.length} results for "{query}"</Text>
          <View style={styles.grid}>
            {results.map((item) => <AnimeCard key={item.session} anime={item} />)}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎌</Text>
          <Text style={styles.emptyTitle}>Search AYONIME</Text>
          <Text style={styles.emptyText}>Find your favourite anime</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: 14,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  backArrow: { color: colors.text, fontSize: 20, fontWeight: "700" },
  inputWrap: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 11,
  },
  inputIcon: { fontSize: 15 },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  clearText: { color: colors.muted, fontSize: 16, paddingHorizontal: 4 },
  goBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: 18, paddingVertical: 11 },
  goBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  centerText: { color: colors.muted, fontSize: 14, marginTop: 8 },
  emptyEmoji: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 14 },

  list: { padding: spacing.lg, paddingBottom: 48 },
  resultCount: { color: colors.muted, fontSize: 13, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
});
