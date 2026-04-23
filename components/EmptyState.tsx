import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect } from "react-native-svg";
import { colors } from "../constants/theme";

type IllustType = "search" | "downloads" | "history" | "watchlist" | "offline" | "error";

function SearchIllust() {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Circle cx="52" cy="52" r="30" stroke={colors.accent} strokeWidth="4" fill="none" />
      <Line x1="74" y1="74" x2="96" y2="96" stroke={colors.accent} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="52" cy="52" r="18" fill={colors.card} />
      <Circle cx="46" cy="46" r="4" fill={colors.accent} opacity="0.6" />
      <Path d="M44 58 Q52 64 60 58" stroke={colors.accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function DownloadsIllust() {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Rect x="20" y="70" width="80" height="30" rx="8" fill={colors.card} stroke={colors.border} strokeWidth="2" />
      <Rect x="35" y="78" width="50" height="6" rx="3" fill={colors.border} />
      <Rect x="35" y="78" width="20" height="6" rx="3" fill={colors.accent} />
      <Path d="M60 20 L60 60" stroke={colors.accent} strokeWidth="4" strokeLinecap="round" />
      <Path d="M42 48 L60 66 L78 48" stroke={colors.accent} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HistoryIllust() {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="36" stroke={colors.accent} strokeWidth="4" fill={colors.card} />
      <Path d="M60 36 L60 60 L76 72" stroke={colors.accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M28 40 Q20 60 28 80" stroke={colors.accent} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}

function WatchlistIllust() {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Path d="M30 20 L30 100 L60 82 L90 100 L90 20 Z" fill={colors.card} stroke={colors.accent} strokeWidth="4" strokeLinejoin="round" />
      <Path d="M46 50 L54 58 L74 38" stroke={colors.accent} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function OfflineIllust() {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Path d="M20 60 Q60 20 100 60" stroke={colors.border} strokeWidth="4" fill="none" strokeLinecap="round" />
      <Path d="M35 75 Q60 50 85 75" stroke={colors.border} strokeWidth="4" fill="none" strokeLinecap="round" />
      <Circle cx="60" cy="90" r="8" fill={colors.border} />
      <Line x1="20" y1="20" x2="100" y2="100" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

function ErrorIllust() {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Polygon points="60,15 105,95 15,95" fill={colors.card} stroke="#dc2626" strokeWidth="4" strokeLinejoin="round" />
      <Line x1="60" y1="45" x2="60" y2="70" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
      <Circle cx="60" cy="82" r="4" fill="#dc2626" />
    </Svg>
  );
}

const ILLUSTS: Record<IllustType, React.FC> = {
  search: SearchIllust,
  downloads: DownloadsIllust,
  history: HistoryIllust,
  watchlist: WatchlistIllust,
  offline: OfflineIllust,
  error: ErrorIllust,
};

interface Props {
  type: IllustType;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ type, title, subtitle }: Props) {
  const Illust = ILLUSTS[type];
  return (
    <View style={styles.wrap}>
      <Illust />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 40 },
  title: { color: "#fff", fontSize: 20, fontWeight: "800", textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: "center", lineHeight: 21 },
});
