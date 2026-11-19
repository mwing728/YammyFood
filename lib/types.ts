import type { TallyCounts } from "./scoring";

export type Room = {
  id: string;
  code: string;
  created_at: string;
  status: "active" | "ended";
};

export type Player = TallyCounts & {
  id: string;
  room_id: string;
  device_id: string;
  display_name: string;
  total_points: number;
  updated_at: string;
};