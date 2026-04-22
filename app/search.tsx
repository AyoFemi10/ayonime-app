import { useRef, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import AnimeCard from "../components/AnimeCard";
import { colors, radius, spacing } from "../constants/theme";
import { AnimeProp, searchAnime } from "../lib/api";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeProp[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const doSearch = (q: string) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true);
    searchAnime(q).then(setResults).finally(() => setLoading(false));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.inputRow}>
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
            />
            {query.length > 0 && (
              <Pressable onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
                <Text style={styles.clear}>✕</Text>
              </Pressable>
            )}
          </View>
          <Pressable style={styles.goBtn} onPress={() => doSearch(query)}>
            <Text style={styles.goBtnText}>Search</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /><Text style={styles.centerText}>Searching...</Text></View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}><Text style={styles.emoji}>😔</Text><Text style={styles.emptyTitle}>No results</Text><Text style={styles.emptyText}>Try a different search term</Text></View>
      ) : results.length > 0 ? (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultCount}>{results.length} results for "{query}"</Text>
          <View style={styles.grid}>{results.map((item) => <AnimeCard key={item.session} anime={item} />)}</View>
        </ScrollView>
      ) : (
        <View style={styles.center}><Text style={styles.emoji}>🎌</Text><Text style={styles.emptyTitle}>Find your anime</Text><Text style={styles.emptyText}>Search by title</Text></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: 16, gap: 14 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "900" },
  inputRow: { flexDirection: "row", gap: 10 },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 12 },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, color: "#fff", fontSize: 15 },
  clear: { color: colors.muted, fontSize: 16, paddingHorizontal: 4 },
  goBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: 20, justifyContent: "center" },
  goBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  centerText: { color: colors.muted, fontSize: 14, marginTop: 8 },
  emoji: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 14 },
  list: { padding: spacing.lg, paddingBottom: 48 },
  resultCount: { color: colors.muted, fontSize: 13, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
});
