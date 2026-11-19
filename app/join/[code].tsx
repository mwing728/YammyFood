import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import { supabaseConfigured } from "@/lib/supabase";
import { getRoomByCode } from "@/lib/room";
import {
  getDisplayName,
  setActiveRoom,
  setDisplayName,
} from "@/lib/storage";

export default function JoinLinkScreen() {
  const { code: rawCode } = useLocalSearchParams<{ code: string }>();
  const code = (Array.isArray(rawCode) ? rawCode[0] : rawCode ?? "")
    .trim()
    .toUpperCase();

  const [name, setName] = useState("");
  const [checking, setChecking] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState(code);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const stored = await getDisplayName();
      if (stored) setName(stored);
    })();
  }, []);

  useEffect(() => {
    if (!code || !supabaseConfigured) {
      setChecking(false);
      if (!code) setError("Invalid join link.");
      return;
    }
    void (async () => {
      try {
        const room = await getRoomByCode(code);
        if (!room) {
          setError("This contest link is not valid or has expired.");
          setChecking(false);
          return;
        }
        if (room.status === "ended") {
          setError("This contest has ended.");
          setChecking(false);
          return;
        }
        setRoomId(room.id);
        setRoomCode(room.code);
        const storedName = await getDisplayName();
        if (storedName) {
          await setActiveRoom({ roomId: room.id, code: room.code, isHost: false });
          router.replace(`/room/${room.id}`);
          return;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load contest.");
      } finally {
        setChecking(false);
      }
    })();
  }, [code]);

  const onContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Your name", "Enter a display name for the leaderboard.");
      return;
    }
    if (!roomId) return;
    await setDisplayName(trimmed);
    await setActiveRoom({ roomId, code: roomCode, isHost: false });
    router.replace(`/room/${roomId}`);
  };

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.muted}>Loading contest…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.btn} onPress={() => router.replace("/")}>
          <Text style={styles.btnText}>Back home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're joining</Text>
      <Text style={styles.code}>{roomCode}</Text>
      <Text style={styles.label}>Your name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Display name"
        placeholderTextColor={colors.muted}
        autoCapitalize="words"
        autoFocus
      />
      <Pressable style={styles.primaryBtn} onPress={onContinue}>
        <Text style={styles.primaryBtnText}>Start tallying</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.bg,
  },
  muted: { color: colors.muted },
  container: {
    flex: 1,
    padding: 20,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  title: { color: colors.muted, fontSize: 15, marginBottom: 4 },
  code: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 4,
    marginBottom: 28,
  },
  label: { color: colors.text, fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 17,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: colors.text, fontSize: 17, fontWeight: "700" },
  error: { color: colors.accent, fontSize: 16, marginBottom: 20 },
  btn: {
    backgroundColor: colors.highlight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: colors.text, fontWeight: "600" },
});