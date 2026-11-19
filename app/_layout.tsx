import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { ConfigBanner } from "@/components/ConfigBanner";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ConfigBanner />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: "Yam Sushi Contest" }} />
        <Stack.Screen name="join/[code]" options={{ title: "Join contest" }} />
        <Stack.Screen name="room/[id]" options={{ title: "Contest" }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});