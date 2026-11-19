import { Pressable, StyleSheet, Text, View } from "react-native";
import { SCORING } from "@/lib/scoring";
import { colors } from "@/constants/theme";

type Props = {
  label: string;
  field: keyof typeof SCORING;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
};

export function TallyRow({
  label,
  field,
  count,
  onIncrement,
  onDecrement,
  disabled,
}: Props) {
  const pointsPer = SCORING[field];
  return (
    <View style={styles.row}>
      <View style={styles.labelBlock}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sub}>
          {pointsPer} pt{pointsPer > 1 ? "s" : ""} / piece
        </Text>
      </View>
      <View style={styles.controls}>
        <Pressable
          style={[styles.btn, (count === 0 || disabled) && styles.btnDisabled]}
          onPress={onDecrement}
          disabled={disabled || count === 0}
          accessibilityLabel={`Decrease ${label}`}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.count}>{count}</Text>
        <Pressable
          style={[styles.btnPrimary, disabled && styles.btnDisabled]}
          onPress={onIncrement}
          disabled={disabled}
          accessibilityLabel={`Increase ${label}`}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  labelBlock: { flex: 1, paddingRight: 12 },
  label: { color: colors.text, fontSize: 17, fontWeight: "600" },
  sub: { color: colors.muted, fontSize: 13, marginTop: 4 },
  controls: { flexDirection: "row", alignItems: "center", gap: 8 },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.highlight,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.35 },
  btnText: { color: colors.text, fontSize: 24, fontWeight: "600", lineHeight: 28 },
  count: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    minWidth: 36,
    textAlign: "center",
  },
});