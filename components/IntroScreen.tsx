import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../constants/theme";

const { width, height } = Dimensions.get("window");

interface Props {
  onDone: () => void;
}

export default function IntroScreen({ onDone }: Props) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Fade in + scale up logo
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withTiming(1, { duration: 500 });

    // 2. Glow pulse
    glowOpacity.value = withDelay(400, withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0.4, { duration: 300 }),
      withTiming(0.8, { duration: 200 }),
    ));

    // 3. Fade out whole screen
    screenOpacity.value = withDelay(1200, withTiming(0, { duration: 400 }, (finished) => {
      if (finished) runOnJS(onDone)();
    }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      {/* Glow behind logo */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Logo */}
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <View style={styles.logoIcon}>
          <Animated.Text style={styles.logoA}>A</Animated.Text>
        </View>
        <Animated.Text style={styles.logoText}>
          AYO<Animated.Text style={styles.logoPink}>NIME</Animated.Text>
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  glow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.accent,
    opacity: 0,
    // blur effect via shadow
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 30,
  },
  logoWrap: {
    alignItems: "center",
    gap: 16,
  },
  logoIcon: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logoA: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "900",
  },
  logoText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },
  logoPink: {
    color: "#ec4899",
  },
});
