import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { SCORING } from "@/lib/scoring";
import { colors } from "@/constants/theme";

const PHOTOS: Record<keyof typeof SCORING, ImageSourcePropType | undefined> = {
  sashimi: require("../assets/sashimi.jpg"),
  basic_roll: require("../assets/basic-roll.jpg"),
  sushi: require("../assets/nigiri.jpg"),
  special_roll: require("../assets/special-roll.jpg"),
  hot_food: require("../assets/hot-food.jpg"),
  large_hot_food: require("../assets/large-hot-food.jpg"),
};

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
  const photo = PHOTOS[field];
  return (
    <View style={styles.row}>
      {photo ? (
        <Image
          source={photo}
          style={styles.photo}
          resizeMode="cover"
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]} />
      )}
      <View style={styles.labelBlock}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.sub}>
          {pointsPer} pt{pointsPer > 1 ? "s" : ""}
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
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: 8,
    minHeight: 64,
    overflow: "hidden",
  },
  photo: {
    width: 56,
    height: 56,
    margin: 4,
    borderRadius: 8,
    backgroundColor: "#11161c",
  },
  photoPlaceholder: {
    backgroundColor: colors.highlight,
  },
  labelBlock: { flex: 1, minWidth: 0, paddingHorizontal: 8 },
  label: { color: colors.text, fontSize: 16, fontWeight: "600" },
  sub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  controls: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0 },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.highlight,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.35 },
  btnText: { color: colors.text, fontSize: 22, fontWeight: "600", lineHeight: 26 },
  count: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    minWidth: 28,
    textAlign: "center",
  },
});