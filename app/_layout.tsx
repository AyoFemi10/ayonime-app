import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[ti.wrap, focused && ti.wrapActive]}>
      <Text style={ti.emoji}>{emoji}</Text>
      <Text style={[ti.label, focused && ti.labelActive]}>{label}</Text>
    </View>
  );
}

const ti = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingTop: 6, paddingHorizontal: 8, gap: 3, borderRadius: 12, minWidth: 60 },
  wrapActive: { backgroundColor: colors.accent + "22" },
  emoji: { fontSize: 20 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  labelActive: { color: colors.accent },
});

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={colors.bg} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 70,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
        />
        <Tabs.Screen
          name="search"
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Search" focused={focused} /> }}
        />
        <Tabs.Screen
          name="downloads"
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⬇" label="Downloads" focused={focused} /> }}
        />
        <Tabs.Screen
          name="settings"
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="Settings" focused={focused} /> }}
        />
        <Tabs.Screen
          name="credits"
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="ℹ️" label="Credits" focused={focused} /> }}
        />
        {/* Hidden screens */}
        <Tabs.Screen name="anime/[slug]" options={{ href: null }} />
        <Tabs.Screen name="watch/[slug]" options={{ href: null }} />
      </Tabs>
    </>
  );
}
