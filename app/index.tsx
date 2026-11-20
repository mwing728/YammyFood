import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { colors } from "@/constants/theme";
import { supabaseConfigured } from "@/lib/supabase";
import { createRoom, getRoomByCode } from "@/lib/room";
import {
  getActiveRoom,
  getDisplayName,
  setActiveRoom,
  setDisplayName,
} from "@/lib/storage";

export default function HomeScreen() {
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<{ roomId: string; code: string } | null>(
    null
  );

  useEffect(() => {
    void (async () => {
      const stored = await getDisplayName();
      if (stored) setName(stored);
      const active = await getActiveRoom();
      if (active) setResume({ roomId: active.roomId, code: active.code });
    })();
  }, []);

  const ensureName = useCallback(async (): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Your name", "Enter a display name for the leaderboard.");
      return false;
    }
    await setDisplayName(trimmed);
    return true;
  }, [name]);

  const goToRoom = async (roomId: string, code: string, isHost: boolean) => {
    await setActiveRoom({ roomId, code, isHost });
    router.push(`/room/${roomId}`);
  };

  const onCreate = async () => {
    if (!supabaseConfigured) return;
    if (!(await ensureName())) return;
    setLoading(true);
    try {
      const room = await createRoom();
      await goToRoom(room.id, room.code, true);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not create room.");
    } finally {
      setLoading(false);
    }
  };

  const onJoinManual = async () => {
    if (!supabaseConfigured) return;
    if (!(await ensureName())) return;
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) {
      Alert.alert("Room code", "Enter the code from your host.");
      return;
    }
    setLoading(true);
    try {
      const room = await getRoomByCode(code);
      if (!room) {
        Alert.alert("Not found", "No contest found with that code.");
        return;
      }
      if (room.status === "ended") {
        Alert.alert("Ended", "This contest has ended.");
        return;
      }
      await goToRoom(room.id, room.code, false);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not join.");
    } finally {
      setLoading(false);
    }
  };

  const onResume = () => {
    if (resume) void goToRoom(resume.roomId, resume.code, false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.lead}>
        Tap a join link from your host, or create a new contest and share the
        link with everyone at the table.
      </Text>

      <Text style={styles.label}>Your name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Matt"
        placeholderTextColor={colors.muted}
        autoCapitalize="words"
        autoCorrect={false}
      />

      {resume ? (
        <Pressable style={styles.secondaryBtn} onPress={onResume}>
          <Text style={styles.secondaryBtnText}>
            Continue contest ({resume.code})
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        style={[styles.primaryBtn, loading && styles.btnDisabled]}
        onPress={onCreate}
        disabled={loading || !supabaseConfigured}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.primaryBtnText}>Create contest</Text>
        )}
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or join with code</Text>
        <View style={styles.dividerLine} />
      </View>

      <TextInput
        style={styles.input}
        value={joinCode}
        onChangeText={setJoinCode}
        placeholder="Room code"
        placeholderTextColor={colors.muted}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <Pressable
        style={[styles.outlineBtn, loading && styles.btnDisabled]}
        onPress={onJoinManual}
        disabled={loading || !supabaseConfigured}
      >
        <Text style={styles.outlineBtnText}>Join contest</Text>
      </Pressable>

      <Text style={styles.footnote}>
        Scoring: sashimi & basic rolls 1 pt/piece · nigiri & special rolls 2
        pts/piece
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, maxWidth: 480, width: "100%", alignSelf: "center" },
  lead: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 24 },
  label: { color: colors.text, fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 17,
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: { color: colors.text, fontSize: 17, fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: colors.highlight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  secondaryBtnText: { color: colors.text, fontSize: 16, fontWeight: "600" },
  outlineBtn: {
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  outlineBtnText: { color: colors.text, fontSize: 16, fontWeight: "600" },
  btnDisabled: { opacity: 0.6 },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.muted, fontSize: 13 },
  footnote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 24,
    textAlign: "center",
  },
});