export type TallyCounts = {
  sashimi: number;
  basic_roll: number;
  sushi: number;
  special_roll: number;
};

export const SCORING = {
  sashimi: 1,
  basic_roll: 1,
  sushi: 2,
  special_roll: 2,
} as const;

export const TALLY_LABELS: Record<keyof TallyCounts, string> = {
  sashimi: "Sashimi",
  basic_roll: "Basic roll",
  sushi: "Sushi (nigiri)",
  special_roll: "Special roll",
};

export function computeTotal(counts: TallyCounts): number {
  return (
    counts.sashimi * SCORING.sashimi +
    counts.basic_roll * SCORING.basic_roll +
    counts.sushi * SCORING.sushi +
    counts.special_roll * SCORING.special_roll
  );
}

export const emptyCounts = (): TallyCounts => ({
  sashimi: 0,
  basic_roll: 0,
  sushi: 0,
  special_roll: 0,
});