-- Yam Sushi Contest — run in Supabase SQL Editor (free tier)

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_at timestamptz default now(),
  status text default 'active' check (status in ('active', 'ended'))
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  device_id text not null,
  display_name text not null,
  sashimi int default 0 check (sashimi >= 0),
  basic_roll int default 0 check (basic_roll >= 0),
  sushi int default 0 check (sushi >= 0),
  special_roll int default 0 check (special_roll >= 0),
  total_points int generated always as (
    sashimi + basic_roll + (sushi * 2) + (special_roll * 2)
  ) stored,
  updated_at timestamptz default now(),
  unique (room_id, device_id)
);

create or replace function set_players_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists players_updated_at on players;
create trigger players_updated_at
  before update on players
  for each row execute function set_players_updated_at();

alter table rooms enable row level security;
alter table players enable row level security;

-- MVP: open policies for a friends contest (anon key). No DELETE on players.
create policy "rooms_select" on rooms for select using (true);
create policy "rooms_insert" on rooms for insert with check (true);
create policy "rooms_update" on rooms for update using (true);

create policy "players_select" on players for select using (true);
create policy "players_insert" on players for insert with check (true);
create policy "players_update" on players for update using (true);

-- Realtime: publish players and rooms. Safe to re-run if a table is already in the publication.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'players'
  ) then
    alter publication supabase_realtime add table players;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table rooms;
  end if;
end $$;