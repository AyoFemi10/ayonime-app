import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Dimensions, FlatList,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import AnimeCard from "../components/AnimeCard";
import Pagination from "../components/Pagination";
import { colors, radius, spacing } from "../constants/theme";
import { AnimeProp, GENRES, getByGenre, searchAnime } from "../lib/api";
import { addRecentSearch, clearRecentSearches, getRecentSearches } from "../lib/storage";
import { hapticLight } from "../lib/haptics";

export default function SearchScreen() {
  const { q: initialQ, genre: initialGenre } = useLocalSearchParams<{ q?: string; genre?: string }>();
  const router = useRouter();
  const [query, setQuery] = useState(initialQ || "");
  const [activeGenre, setActiveGenre] = useState<string | null>(initialGenre || null);
  const [results, setResults] = useState<AnimeProp[]>([]);
  const [suggestions, setSuggestions] = useState<AnimeProp[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getRecentSearches().then(setRecentSearches);
    if (initialQ) doSearch(initialQ);
    else if (initialGenre && initialGenre !== "latest") loadGenre(initialGenre, 1);
  }, []);

  // Suggestions while typing
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => {
      searchAnime(query).then((r) => setSuggestions(r.slice(0, 5)));
    }, 400);
  }, [query]);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setActiveGenre(null);
    setShowSuggestions(false);
    setLoading(true);
    setSearched(true);
    await addRecentSearch(q.trim());
    setRecentSearches(await getRecentSearches());
    searchAnime(q).then((r) => { setResults(r); setLastPage(1); }).finally(() => setLoading(false));
  };

  const loadGenre = (genre: string, p = 1) => {
    setActiveGenre(genre);
    setQuery("");
    setShowSuggestions(false);
    setLoading(true);
    setSearched(true);
    setPage(p);
    getByGenre(genre, p).then((r) => { setResults(r.data); setLastPage(r.last_page); }).finally(() => setLoading(false));
  };

  const renderCard = ({ item }: { item: AnimeProp }) => <AnimeCard anime={item} />;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Search anime..."
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={(t) => { setQuery(t); setShowSuggestions(t.length >= 2); }}
              onSubmitEditing={() => doSearch(query)}
              onFocus={() => { if (query.length >= 2) setShowSuggestions(true); }}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => { setQuery(""); setResults([]); setSearched(false); setActiveGenre(null); setSuggestions([]); setShowSuggestions(false); }}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            )}
          </View>
          <Pressable style={styles.goBtn} onPress={() => doSearch(query)}>
            <Text style={styles.goBtnText}>Search</Text>
          </Pressable>
        </View>

        {/* Genre tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreTabs}>
          <Pressable style={[styles.genreTab, !activeGenre && styles.genreTabActive]} onPress={() => { setActiveGenre(null); setResults([]); setSearched(false); }}>
            <Text style={[styles.genreTabText, !activeGenre && styles.genreTabTextActive]}>All</Text>
          </Pressable>
          {GENRES.map((g) => (
            <Pressable key={g} style={[styles.genreTab, activeGenre === g && styles.genreTabActive]} onPress={() => { hapticLight(); loadGenre(g, 1); }}>
              <Text style={[styles.genreTabText, activeGenre === g && styles.genreTabTextActive]}>{g}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsBox}>
          {suggestions.map((s) => (
            <Pressable key={s.session} style={styles.suggestionItem} onPress={() => { setQuery(s.title); doSearch(s.title); }}>
              <Ionicons name="search" size={14} color={colors.muted} />
              <Text style={styles.suggestionText} numberOfLines={1}>{s.title}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>
      ) : !searched ? (
        <ScrollView contentContainerStyle={styles.emptyContent}>
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent Searches</Text>
                <Pressable onPress={async () => { await clearRecentSearches(); setRecentSearches([]); }}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              </View>
              {recentSearches.map((s) => (
                <Pressable key={s} style={styles.recentItem} onPress={() => { setQuery(s); doSearch(s); }}>
                  <Ionicons name="time-outline" size={16} color={colors.muted} />
                  <Text style={styles.recentText}>{s}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.muted} />
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>🎌</Text>
            <Text style={styles.emptyTitle}>Find your anime</Text>
            <Text style={styles.emptyText}>Search by title or browse by genre</Text>
          </View>
        </ScrollView>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>😔</Text>
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptyText}>Try a different search term or genre</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderCard}
          keyExtractor={(i) => i.session}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.resultCount}>{activeGenre ? `${activeGenre} anime` : `${results.length} results for "${query}"`}</Text>}
          ListFooterComponent={lastPage > 1 && activeGenre ? <Pagination page={page} total={lastPage} onChange={(p) => loadGenre(activeGenre, p)} /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingTop: 52, gap: 12, paddingBottom: 0 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "900", paddingHorizontal: spacing.lg },
  inputRow: { flexDirection: "row", gap: 10, paddingHorizontal: spacing.lg },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 11 },
  input: { flex: 1, color: "#fff", fontSize: 15 },
  goBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: 18, justifyContent: "center" },
  goBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  genreTabs: { paddingHorizontal: spacing.lg, gap: 8, paddingVertical: 12 },
  genreTab: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  genreTabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  genreTabText: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  genreTabTextActive: { color: "#fff" },

  suggestionsBox: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 100 },
  suggestionItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  suggestionText: { flex: 1, color: colors.text, fontSize: 14 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingTop: 40 },
  emptyContent: { flexGrow: 1 },
  emptyEmoji: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", paddingHorizontal: 32 },

  recentSection: { padding: spacing.lg, gap: 4 },
  recentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  recentTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  clearText: { color: "#f87171", fontSize: 13, fontWeight: "700" },
  recentItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  recentText: { flex: 1, color: colors.text, fontSize: 14 },

  list: { padding: spacing.lg, paddingBottom: 48 },
  row: { gap: 12, marginBottom: 12 },
  resultCount: { color: colors.muted, fontSize: 13, marginBottom: 16 },
});
