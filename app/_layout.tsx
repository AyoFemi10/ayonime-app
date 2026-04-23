import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import UpdateChecker from "../components/UpdateChecker";
import OfflineBanner from "../components/OfflineBanner";
import IntroScreen from "../components/IntroScreen";
import { colors } from "../constants/theme";
import { getMyJobIds } from "../lib/downloads";
import { getJobStatus } from "../lib/api";

SplashScreen.preventAutoHideAsync();

function TabIcon({ name, focused }: { name: React.ComponentProps<typeof Ionicons>["name"]; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : `${name}-outline` as any}
      size={24}
      color={focused ? colors.accent : colors.muted}
    />
  );
}

export default function RootLayout() {
  const [showIntro, setShowIntro] = useState(true);
  const [completedDownloads, setCompletedDownloads] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync(), 300);
    return () => clearTimeout(timer);
  }, []);

  // Poll for completed downloads to show badge
  useEffect(() => {
    const check = async () => {
      const ids = await getMyJobIds();
      if (!ids.length) { setCompletedDownloads(0); return; }
      const results = await Promise.allSettled(ids.map(getJobStatus));
      const done = results.filter((r) => r.status === "fulfilled" && r.value?.status === "done").length;
      setCompletedDownloads(done);
    };
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={colors.bg} />
      <OfflineBanner />
      <UpdateChecker />
      {showIntro && <IntroScreen onDone={() => setShowIntro(false)} />}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "700",
            marginTop: -2,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="downloads"
          options={{
            title: "Downloads",
            tabBarIcon: ({ focused }) => <TabIcon name="download" focused={focused} />,
            tabBarBadge: completedDownloads > 0 ? completedDownloads : undefined,
            tabBarBadgeStyle: { backgroundColor: colors.accent, fontSize: 10 },
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Library",
            tabBarIcon: ({ focused }) => <TabIcon name="library" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="credits"
          options={{
            title: "Credits",
            tabBarIcon: ({ focused }) => <TabIcon name="information-circle" focused={focused} />,
          }}
        />        <Tabs.Screen name="anime/[slug]" options={{ href: null }} />
        <Tabs.Screen name="watch/[slug]" options={{ href: null }} />
      </Tabs>
    </GestureHandlerRootView>
  );
}
