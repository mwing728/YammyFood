import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import type { Player } from "./types";

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

export function unsubscribeChannel(channel: RealtimeChannel): void {
  const supabase = getSupabase();
  void supabase.removeChannel(channel);
}