import { getSupabase } from "./supabase";
import type { Player, Room } from "./types";
import type { TallyCounts } from "./scoring";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function createRoom(): Promise<Room> {
  const supabase = getSupabase();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { data, error } = await supabase
      .from("rooms")
      .insert({ code })
      .select()
      .single();
    if (!error && data) return data as Room;
    if (error?.code !== "23505") throw error;
  }
  throw new Error("Could not create a room code. Try again.");
}

export async function getRoomByCode(code: string): Promise<Room | null> {
  const supabase = getSupabase();
  const normalized = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from("rooms")
    .select()
    .eq("code", normalized)
    .maybeSingle();
  if (error) throw error;
  return (data as Room) ?? null;
}

export async function getRoomById(id: string): Promise<Room | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("rooms")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Room) ?? null;
}

export async function joinRoomAsPlayer(
  roomId: string,
  deviceId: string,
  displayName: string
): Promise<Player> {
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("players")
    .select()
    .eq("room_id", roomId)
    .eq("device_id", deviceId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("players")
      .update({
        display_name: displayName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as Player;
  }

  const { data, error } = await supabase
    .from("players")
    .insert({
      room_id: roomId,
      device_id: deviceId,
      display_name: displayName.trim(),
      sashimi: 0,
      basic_roll: 0,
      sushi: 0,
      special_roll: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Player;
}

export async function fetchPlayerInRoom(
  roomId: string,
  deviceId: string
): Promise<Player | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("players")
    .select()
    .eq("room_id", roomId)
    .eq("device_id", deviceId)
    .maybeSingle();
  if (error) throw error;
  return (data as Player) ?? null;
}

export async function fetchPlayersInRoom(roomId: string): Promise<Player[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("players")
    .select()
    .eq("room_id", roomId)
    .order("total_points", { ascending: false });
  if (error) throw error;
  return (data as Player[]) ?? [];
}

export async function updatePlayerCounts(
  playerId: string,
  counts: TallyCounts
): Promise<Player> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("players")
    .update({
      ...counts,
      updated_at: new Date().toISOString(),
    })
    .eq("id", playerId)
    .select()
    .single();
  if (error) throw error;
  return data as Player;
}

export async function endRoom(roomId: string): Promise<Room> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("rooms")
    .update({ status: "ended" })
    .eq("id", roomId)
    .select()
    .single();
  if (error) throw error;
  return data as Room;
}