import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TallyCounts } from "./scoring";
import { emptyCounts } from "./scoring";

const KEYS = {
  deviceId: "ysc_device_id",
  displayName: "ysc_display_name",
  activeRoomId: "ysc_active_room_id",
  activeRoomCode: "ysc_active_room_code",
  cachedCounts: "ysc_cached_counts",
  isHost: "ysc_is_host",
} as const;

export async function getOrCreateDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(KEYS.deviceId);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(KEYS.deviceId, id);
  }
  return id;
}

export async function getDisplayName(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.displayName);
}

export async function setDisplayName(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.displayName, name.trim());
}

export type ActiveRoom = {
  roomId: string;
  code: string;
  isHost: boolean;
};

export async function setActiveRoom(room: ActiveRoom): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.activeRoomId, room.roomId],
    [KEYS.activeRoomCode, room.code],
    [KEYS.isHost, room.isHost ? "1" : "0"],
  ]);
}

export async function getActiveRoom(): Promise<ActiveRoom | null> {
  const [[, roomId], [, code], [, isHost]] = await AsyncStorage.multiGet([
    KEYS.activeRoomId,
    KEYS.activeRoomCode,
    KEYS.isHost,
  ]);
  if (!roomId || !code) return null;
  return { roomId, code, isHost: isHost === "1" };
}

export async function clearActiveRoom(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.activeRoomId,
    KEYS.activeRoomCode,
    KEYS.isHost,
    KEYS.cachedCounts,
  ]);
}

export async function cacheCounts(counts: TallyCounts): Promise<void> {
  await AsyncStorage.setItem(KEYS.cachedCounts, JSON.stringify(counts));
}

export async function getCachedCounts(): Promise<TallyCounts> {
  const raw = await AsyncStorage.getItem(KEYS.cachedCounts);
  if (!raw) return emptyCounts();
  try {
    return { ...emptyCounts(), ...JSON.parse(raw) };
  } catch {
    return emptyCounts();
  }
}