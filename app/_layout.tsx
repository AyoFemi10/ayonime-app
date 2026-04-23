import { useEffect } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import UpdateChecker from "../components/UpdateChecker";
import { colors } from "../constants/theme";

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
  useEffect(() => {
    // Hide splash after a short delay to let fonts/assets load
    const timer = setTimeout(() => SplashScreen.hideAsync(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={colors.bg} />
      <UpdateChecker />
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
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="credits"
          options={{
            title: "Credits",
            tabBarIcon: ({ focused }) => <TabIcon name="information-circle" focused={focused} />,
          }}
        />
        <Tabs.Screen name="anime/[slug]" options={{ href: null }} />
        <Tabs.Screen name="watch/[slug]" options={{ href: null }} />
      </Tabs>
    </GestureHandlerRootView>
  );
}
