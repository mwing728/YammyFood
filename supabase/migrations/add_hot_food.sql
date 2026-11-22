-- Run once in Supabase SQL Editor on an existing project (after initial migration)

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS hot_food int DEFAULT 0 CHECK (hot_food >= 0),
  ADD COLUMN IF NOT EXISTS large_hot_food int DEFAULT 0 CHECK (large_hot_food >= 0);

ALTER TABLE players DROP COLUMN IF EXISTS total_points;

ALTER TABLE players
  ADD COLUMN total_points int GENERATED ALWAYS AS (
    sashimi + basic_roll + (sushi * 2) + (special_roll * 2)
    + hot_food + (large_hot_food * 3)
  ) STORED;