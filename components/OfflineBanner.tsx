import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors } from "../constants/theme";

const API_BASE = "https://apis.ayohost.site";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const translateY = useSharedValue(-50);

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
        setOffline(!r.ok);
      } catch {
        setOffline(true);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    translateY.value = withTiming(offline ? 0 : -50, { duration: 300 });
  }, [offline]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  if (!offline) return null;

  return (
    <Animated.View style={[styles.banner, animStyle]}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>Backend offline — check your connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000,
    backgroundColor: "#dc2626", flexDirection: "row", alignItems: "center",
    gap: 8, paddingHorizontal: 16, paddingVertical: 10,
  },
  icon: { fontSize: 16 },
  text: { color: "#fff", fontSize: 13, fontWeight: "700", flex: 1 },
});
