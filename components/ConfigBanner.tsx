import { StyleSheet, Text, View } from "react-native";
import { supabaseConfigured } from "@/lib/supabase";
import { colors } from "@/constants/theme";

export function ConfigBanner() {
  if (supabaseConfigured) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and
        EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file (see README).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#4a3728",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  text: { color: "#ffd9a3", fontSize: 13, lineHeight: 18 },
});