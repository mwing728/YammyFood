import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import type { Player, Room } from "./types";

export function subscribeToRoomPlayers(
  roomId: string,
  onChange: (players: Player[]) => void
): RealtimeChannel {
  const supabase = getSupabase();

  const refresh = async () => {
    const { data, error } = await supabase
      .from("players")
      .select()
      .eq("room_id", roomId)
      .order("total_points", { ascending: false });
    if (!error && data) onChange(data as Player[]);
  };

  void refresh();

  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "players",
        filter: `room_id=eq.${roomId}`,
      },
      () => {
        void refresh();
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToRoomStatus(
  roomId: string,
  onChange: (status: Room["status"]) => void
): RealtimeChannel {
  const supabase = getSupabase();
  return supabase
    .channel(`room-status-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        const status = (payload.new as { status?: Room["status"] }).status;
        if (status === "active" || status === "ended") onChange(status);
      }
    )
    .subscribe();
}

export function unsubscribeChannel(channel: RealtimeChannel): void {
  const supabase = getSupabase();
  void supabase.removeChannel(channel);
}