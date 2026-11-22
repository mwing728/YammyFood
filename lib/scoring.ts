export type TallyCounts = {
  sashimi: number;
  basic_roll: number;
  sushi: number;
  special_roll: number;
  hot_food: number;
  large_hot_food: number;
};

export const SCORING = {
  sashimi: 1,
  basic_roll: 1,
  sushi: 2,
  special_roll: 2,
  hot_food: 1,
  large_hot_food: 3,
} as const;

export const TALLY_LABELS: Record<keyof TallyCounts, string> = {
  sashimi: "Sashimi",
  basic_roll: "Basic roll",
  sushi: "Sushi (nigiri)",
  special_roll: "Special roll",
  hot_food: "Hot food",
  large_hot_food: "Large hot food",
};

export const TALLY_ORDER: (keyof TallyCounts)[] = [
  "sashimi",
  "basic_roll",
  "sushi",
  "special_roll",
  "hot_food",
  "large_hot_food",
];

export function computeTotal(counts: TallyCounts): number {
  return (
    counts.sashimi * SCORING.sashimi +
    counts.basic_roll * SCORING.basic_roll +
    counts.sushi * SCORING.sushi +
    counts.special_roll * SCORING.special_roll +
    counts.hot_food * SCORING.hot_food +
    counts.large_hot_food * SCORING.large_hot_food
  );
}

export const emptyCounts = (): TallyCounts => ({
  sashimi: 0,
  basic_roll: 0,
  sushi: 0,
  special_roll: 0,
  hot_food: 0,
  large_hot_food: 0,
});

export function countsFromRecord(
  record: Partial<TallyCounts> | null | undefined
): TallyCounts {
  const base = emptyCounts();
  if (!record) return base;
  for (const key of TALLY_ORDER) {
    const v = record[key];
    if (typeof v === "number" && v >= 0) base[key] = v;
  }
  return base;
}