import { StyleSheet, Text, View } from "react-native";
import type { Player } from "@/lib/types";
import { colors } from "@/constants/theme";

type Props = {
  players: Player[];
  currentPlayerId?: string;
  roomEnded?: boolean;
};

export function Leaderboard({ players, currentPlayerId, roomEnded }: Props) {
  const sorted = [...players].sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    return a.display_name.localeCompare(b.display_name);
  });

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>
        Live leaderboard{roomEnded ? " (final)" : ""}
      </Text>
      {sorted.length === 0 ? (
        <Text style={styles.empty}>No players yet — share the join link!</Text>
      ) : (
        sorted.map((p, index) => {
          const isMe = p.id === currentPlayerId;
          return (
            <View
              key={p.id}
              style={[styles.row, isMe && styles.rowMe]}
            >
              <Text style={styles.rank}>{index + 1}</Text>
              <View style={styles.nameBlock}>
                <Text style={[styles.name, isMe && styles.nameMe]}>
                  {p.display_name}
                  {isMe ? " (you)" : ""}
                </Text>
              </View>
              <Text style={styles.points}>{p.total_points}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  empty: { color: colors.muted, fontSize: 15 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowMe: {
    borderColor: colors.accent,
    backgroundColor: "#241a1a",
  },
  rank: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "600",
    width: 28,
  },
  nameBlock: { flex: 1 },
  name: { color: colors.text, fontSize: 16, fontWeight: "500" },
  nameMe: { color: colors.accent },
  points: { color: colors.success, fontSize: 20, fontWeight: "800" },
});