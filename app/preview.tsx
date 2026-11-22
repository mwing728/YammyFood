import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { TallyRow } from "@/components/TallyRow";
import { colors } from "@/constants/theme";
import { emptyCounts, TALLY_LABELS, TALLY_ORDER, type TallyCounts } from "@/lib/scoring";

/** Temporary screen for checking sushi photos. Removed after verification. */
export default function PreviewScreen() {
  const [counts, setCounts] = useState<TallyCounts>(emptyCounts());

  const bump = (field: keyof TallyCounts, delta: number) => {
    setCounts((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta),
    }));
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {TALLY_ORDER.map((field) => (
        <TallyRow
          key={field}
          label={TALLY_LABELS[field]}
          field={field}
          count={counts[field]}
          onIncrement={() => bump(field, 1)}
          onDecrement={() => bump(field, -1)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
});
