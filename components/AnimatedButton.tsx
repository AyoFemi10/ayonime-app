import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, radius } from "../constants/theme";

interface Props {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: object;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "success" | "danger";
  icon?: string;
}

const VARIANTS = {
  primary: { bg: colors.accent, text: "#fff" },
  secondary: { bg: colors.card, text: colors.text },
  success: { bg: "#16a34a", text: "#fff" },
  danger: { bg: "#dc2626", text: "#fff" },
};

export default function AnimatedButton({ label, onPress, style, textStyle, disabled, variant = "primary", icon }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const v = VARIANTS[variant];

  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onPress={onPress}
        disabled={disabled}
        style={[styles.btn, { backgroundColor: v.bg }, disabled && styles.disabled]}
      >
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={[styles.text, { color: v.text }, textStyle]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: radius.xl, paddingVertical: 16, paddingHorizontal: 24 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: "900", fontSize: 16 },
  icon: { fontSize: 18 },
});
