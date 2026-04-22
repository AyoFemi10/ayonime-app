import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, FlatList, Pressable,
  StyleSheet, Text, TextInput, View,
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
    else setTimeout(() => inputRef.current?.focus(), 100);
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
          <Text style={styles.backText}>←</Text>
        </Pressable>
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
          <Pressable onPress={() => { setQuery(""); setResults([]); setSearched(false); }} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>Try a different search term</Text>
        </View>
      ) : results.length > 0 ? (
        <>
          <View style={styles.resultsMeta}>
            <Text style={styles.resultsText}>{results.length} results for "{query}"</Text>
          </View>
          <FlatList
            data={results}
            keyExtractor={(i) => i.session}
            numColumns={3}
            renderItem={({ item }) => <View style={styles.cardWrap}><AnimeCard anime={item} /></View>}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🎌</Text>
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
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  backText: { color: colors.text, fontSize: 22, fontWeight: "700" },
  input: {
    flex: 1, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
    color: colors.text, fontSize: 14,
  },
  clearBtn: { padding: 6 },
  clearText: { color: colors.muted, fontSize: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  loadingText: { color: colors.muted, fontSize: 14, marginTop: spacing.sm },
  emptyIcon: { fontSize: 48, marginBottom: spacing.sm },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 14 },
  resultsMeta: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  resultsText: { color: colors.muted, fontSize: 13 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  cardWrap: { flex: 1 },
});
