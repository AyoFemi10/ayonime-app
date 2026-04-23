import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Dimensions, FlatList,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AnimeCard from "../components/AnimeCard";
import Pagination from "../components/Pagination";
import { colors, radius, spacing } from "../constants/theme";
import { AnimeProp, GENRES, getByGenre, searchAnime } from "../lib/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 12) / 2;

export default function SearchScreen() {
  const { q: initialQ, genre: initialGenre } = useLocalSearchParams<{ q?: string; genre?: string }>();
  const router = useRouter();
  const [query, setQuery] = useState(initialQ || "");
  const [activeGenre, setActiveGenre] = useState<string | null>(initialGenre || null);
  const [results, setResults] = useState<AnimeProp[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
    else if (initialGenre && initialGenre !== "latest") loadGenre(initialGenre, 1);
  }, []);

  const doSearch = (q: string) => {
    if (!q.trim()) return;
    setActiveGenre(null);
    setLoading(true);
    setSearched(true);
    searchAnime(q).then((r) => { setResults(r); setLastPage(1); }).finally(() => setLoading(false));
  };

  const loadGenre = (genre: string, p = 1) => {
    setActiveGenre(genre);
    setQuery("");
    setLoading(true);
    setSearched(true);
    setPage(p);
    getByGenre(genre, p).then((r) => { setResults(r.data); setLastPage(r.last_page); }).finally(() => setLoading(false));
  };

  const renderCard = ({ item }: { item: AnimeProp }) => <AnimeCard anime={item} />;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
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
              <Pressable onPress={() => { setQuery(""); setResults([]); setSearched(false); setActiveGenre(null); }}>
                <Text style={styles.clear}>✕</Text>
              </Pressable>
            )}
          </View>
          <Pressable style={styles.goBtn} onPress={() => doSearch(query)}>
            <Text style={styles.goBtnText}>Search</Text>
          </Pressable>
        </View>

        {/* Genre tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreTabs}>
          <Pressable
            style={[styles.genreTab, !activeGenre && styles.genreTabActive]}
            onPress={() => { setActiveGenre(null); setResults([]); setSearched(false); }}
          >
            <Text style={[styles.genreTabText, !activeGenre && styles.genreTabTextActive]}>All</Text>
          </Pressable>
          {GENRES.map((g) => (
            <Pressable
              key={g}
              style={[styles.genreTab, activeGenre === g && styles.genreTabActive]}
              onPress={() => loadGenre(g, 1)}
            >
              <Text style={[styles.genreTabText, activeGenre === g && styles.genreTabTextActive]}>{g}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>😔</Text>
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptyText}>Try a different search term or genre</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderCard}
          keyExtractor={(i) => i.session}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {activeGenre ? `${activeGenre} anime` : `${results.length} results for "${query}"`}
            </Text>
          }
          ListFooterComponent={
            lastPage > 1 && activeGenre ? (
              <Pagination page={page} total={lastPage} onChange={(p) => loadGenre(activeGenre, p)} />
            ) : null
          }
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎌</Text>
          <Text style={styles.emptyTitle}>Find your anime</Text>
          <Text style={styles.emptyText}>Search by title or browse by genre</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingTop: 52, gap: 12, paddingBottom: 0 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "900", paddingHorizontal: spacing.lg },
  inputRow: { flexDirection: "row", gap: 10, paddingHorizontal: spacing.lg },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 11 },
  inputIcon: { fontSize: 15 },
  input: { flex: 1, color: "#fff", fontSize: 15 },
  clear: { color: colors.muted, fontSize: 16, paddingHorizontal: 4 },
  goBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: 18, justifyContent: "center" },
  goBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  genreTabs: { paddingHorizontal: spacing.lg, gap: 8, paddingVertical: 12 },
  genreTab: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  genreTabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  genreTabText: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  genreTabTextActive: { color: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyEmoji: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  list: { padding: spacing.lg, paddingBottom: 48 },
  row: { gap: 12, marginBottom: 12 },
  resultCount: { color: colors.muted, fontSize: 13, marginBottom: 16 },
});
