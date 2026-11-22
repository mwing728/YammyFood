import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { TallyRow } from "@/components/TallyRow";
import { Leaderboard } from "@/components/Leaderboard";
import { colors } from "@/constants/theme";
import { useDebouncedCallback } from "@/hooks/useDebouncedSave";
import { shareOrCopyJoinLink, getJoinUrl } from "@/lib/links";
import {
  endRoom,
  fetchPlayerInRoom,
  getRoomById,
  joinRoomAsPlayer,
  updatePlayerCounts,
} from "@/lib/room";
import {
  subscribeToRoomPlayers,
  subscribeToRoomStatus,
  unsubscribeChannel,
} from "@/lib/realtime";
import {
  computeTotal,
  countsFromRecord,
  emptyCounts,
  TALLY_LABELS,
  TALLY_ORDER,
  type TallyCounts,
} from "@/lib/scoring";
import {
  cacheCounts,
  getActiveRoom,
  getDisplayName,
  getOrCreateDeviceId,
  isHostedRoom,
  setActiveRoom,
} from "@/lib/storage";
import type { Player, Room } from "@/lib/types";
import { supabaseConfigured } from "@/lib/supabase";

const SAVE_DELAY_MS = 300;

export default function RoomScreen() {
  const { id: roomId } = useLocalSearchParams<{ id: string }>();
  const rid = Array.isArray(roomId) ? roomId[0] : roomId;
  if (!rid) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Unable to load contest.</Text>
      </View>
    );
  }
  return <RoomContest key={rid} roomId={rid} />;
}

function RoomContest({ roomId: rid }: { roomId: string }) {

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [me, setMe] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [counts, setCounts] = useState<TallyCounts>(emptyCounts());
  const [isHost, setIsHost] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);

  const countsRef = useRef(counts);
  const playerIdRef = useRef<string | null>(null);
  const roomIdRef = useRef<string | null>(null);
  countsRef.current = counts;
  playerIdRef.current = me?.id ?? null;

  const persistCounts = useCallback(async () => {
    const pid = playerIdRef.current;
    const roomId = roomIdRef.current;
    const snapshot = countsRef.current;
    if (!pid || !roomId) return;
    try {
      const updated = await updatePlayerCounts(pid, snapshot);
      setMe(updated);
      await cacheCounts(roomId, snapshot);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  const debouncedSave = useDebouncedCallback(persistCounts, SAVE_DELAY_MS);

  useEffect(() => {
    const onOnline = () => {
      setOffline(false);
      void persistCounts();
    };
    const onOffline = () => setOffline(true);
    if (typeof window !== "undefined") {
      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
      setOffline(!navigator.onLine);
      return () => {
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
      };
    }
  }, [persistCounts]);

  useEffect(() => {
    if (!rid || !supabaseConfigured) {
      setLoading(false);
      return;
    }

    const activeRoomId = rid;
    roomIdRef.current = activeRoomId;
    let cancelled = false;
    let playersChannel: ReturnType<typeof subscribeToRoomPlayers> | null = null;
    let statusChannel: ReturnType<typeof subscribeToRoomStatus> | null = null;

    void (async () => {
      try {
        const r = await getRoomById(activeRoomId);
        if (cancelled) return;
        if (!r) {
          Alert.alert("Not found", "This room does not exist.", [
            { text: "OK", onPress: () => router.replace("/") },
          ]);
          return;
        }
        setRoom(r);

        const active = await getActiveRoom();
        if (cancelled) return;
        const host =
          (await isHostedRoom(activeRoomId)) ||
          Boolean(active && active.roomId === activeRoomId && active.isHost);
        setIsHost(host);

        const deviceId = await getOrCreateDeviceId();
        const displayName = (await getDisplayName()) ?? "Player";

        let player = await fetchPlayerInRoom(activeRoomId, deviceId);
        if (!player) {
          player = await joinRoomAsPlayer(activeRoomId, deviceId, displayName);
        }
        if (cancelled) return;

        setMe(player);
        const loaded = countsFromRecord(player);
        setCounts(loaded);
        await cacheCounts(loaded);
        await setActiveRoom({
          roomId: activeRoomId,
          code: r.code,
          isHost: host,
        });
        if (cancelled) return;

        playersChannel = subscribeToRoomPlayers(activeRoomId, setPlayers);
        statusChannel = subscribeToRoomStatus(activeRoomId, (status) => {
          setRoom((current) =>
            current && current.id === activeRoomId ? { ...current, status } : current
          );
        });
      } catch (e) {
        Alert.alert("Error", e instanceof Error ? e.message : "Could not load room.");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      debouncedSave.cancel();
      roomIdRef.current = activeRoomId;
      if (playersChannel) unsubscribeChannel(playersChannel);
      if (statusChannel) unsubscribeChannel(statusChannel);
      void persistCounts();
    };
  }, [rid, persistCounts, debouncedSave]);

  const bump = (field: keyof TallyCounts, delta: number) => {
    if (!room || room.id !== rid || room.status === "ended" || me?.room_id !== rid) return;
    setCounts((prev) => {
      const next = { ...prev, [field]: Math.max(0, prev[field] + delta) };
      if (rid) void cacheCounts(rid, next);
      return next;
    });
    if (delta > 0) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    debouncedSave();
  };

  const onShare = async () => {
    if (!room) return;
    const result = await shareOrCopyJoinLink(room.code);
    setShareHint(result === "shared" ? "Link shared!" : "Join link copied!");
    setTimeout(() => setShareHint(null), 2500);
  };

  const confirmEndContest = async () => {
    if (!rid || ending) return;
    setEnding(true);
    setEndError(null);
    try {
      const updated = await endRoom(rid);
      setRoom(updated);
      setConfirmEnd(false);
    } catch (e) {
      setEndError(e instanceof Error ? e.message : "Could not end.");
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!room || !me) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Unable to load contest.</Text>
      </View>
    );
  }

  const total = computeTotal(counts);
  const locked = room.status === "ended";

  return (
    <View style={styles.screen}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {offline ? (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline — changes will sync when you're back</Text>
        </View>
      ) : null}

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.roomLabel}>Room</Text>
          <Text style={styles.roomCode}>{room.code}</Text>
        </View>
        <Pressable style={styles.shareBtn} onPress={onShare}>
          <Text style={styles.shareBtnText}>Share link</Text>
        </Pressable>
      </View>
      {shareHint ? <Text style={styles.shareHint}>{shareHint}</Text> : null}
      <Text style={styles.linkPreview} numberOfLines={1}>
        {getJoinUrl(room.code)}
      </Text>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Your total</Text>
        <Text style={styles.totalValue}>{total}</Text>
        {locked ? (
          <Text style={styles.locked}>Contest ended — final scores</Text>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Your tally</Text>
      {TALLY_ORDER.map((field) => (
        <TallyRow
          key={field}
          label={TALLY_LABELS[field]}
          field={field}
          count={counts[field]}
          onIncrement={() => bump(field, 1)}
          onDecrement={() => bump(field, -1)}
          disabled={locked}
        />
      ))}

      <Leaderboard
        players={players.length ? players : [me]}
        currentPlayerId={me.id}
        roomEnded={locked}
      />

      <Pressable style={styles.homeLink} onPress={() => router.push("/")}>
        <Text style={styles.homeLinkText}>Home (scores saved)</Text>
      </Pressable>
    </ScrollView>

    {isHost && !locked ? (
      <View style={styles.footer}>
        <Pressable
          style={styles.endBtn}
          accessibilityRole="button"
          onPress={() => {
            setEndError(null);
            setConfirmEnd(true);
          }}
        >
          <Text style={styles.endBtnText}>End contest</Text>
        </Pressable>
      </View>
    ) : null}

    {confirmEnd ? (
      <View style={styles.modalBackdrop}>
        <View style={styles.endConfirm}>
          <Text style={styles.endConfirmTitle}>End contest?</Text>
          <Text style={styles.endConfirmBody}>
            Scores stay on the board. Nobody will be able to add more pieces.
          </Text>
          {endError ? <Text style={styles.endError}>{endError}</Text> : null}
          <View style={styles.endActions}>
            <Pressable
              style={styles.endCancel}
              accessibilityRole="button"
              onPress={() => {
                setConfirmEnd(false);
                setEndError(null);
              }}
              disabled={ending}
            >
              <Text style={styles.endCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.endConfirmBtn, ending && styles.btnDisabled]}
              accessibilityRole="button"
              onPress={() => void confirmEndContest()}
              disabled={ending}
            >
              <Text style={styles.endConfirmBtnText}>
                {ending ? "Ending…" : "End contest"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  muted: { color: colors.muted },
  offlineBanner: {
    backgroundColor: "#3d3520",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  offlineText: { color: "#ffd9a3", fontSize: 13 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  roomLabel: { color: colors.muted, fontSize: 13 },
  roomCode: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 3,
  },
  shareBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  shareBtnText: { color: colors.text, fontWeight: "700" },
  shareHint: { color: colors.success, fontSize: 13, marginBottom: 4 },
  linkPreview: { color: colors.muted, fontSize: 11, marginBottom: 16 },
  totalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalLabel: { color: colors.muted, fontSize: 14 },
  totalValue: { color: colors.success, fontSize: 48, fontWeight: "900" },
  locked: { color: colors.muted, marginTop: 8, fontSize: 13 },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  endBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  endBtnText: { color: colors.text, fontSize: 17, fontWeight: "700" },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    padding: 24,
  },
  endConfirm: {
    borderWidth: 1,
    borderColor: colors.accentDim,
    borderRadius: 16,
    padding: 20,
    backgroundColor: colors.card,
  },
  endConfirmTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  endConfirmBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  endError: { color: "#ffb4a8", fontSize: 13, marginTop: 8 },
  endActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  endCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: colors.highlight,
  },
  endCancelText: { color: colors.text, fontWeight: "600" },
  endConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: colors.accent,
  },
  endConfirmBtnText: { color: colors.text, fontWeight: "700" },
  btnDisabled: { opacity: 0.6 },
  homeLink: { marginTop: 16, alignItems: "center" },
  homeLinkText: { color: colors.muted, fontSize: 14 },
});