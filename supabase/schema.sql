-- BGP Deck Builder — Supabase schema
-- Run this once in the Supabase SQL editor for a fresh project.

create table public.events (
  id text primary key,
  name text not null,
  date date not null,
  time text,
  format text,
  location text,
  notes text,
  created_at timestamptz default now()
);

create table public.submissions (
  id text primary key,
  timestamp timestamptz default now(),
  player_name text not null,
  discord text,
  notif_pref text,
  event_id text references public.events(id) on delete cascade,
  event_name text,
  event_date date,
  deck_name text,
  format text,
  archetype text,
  main_count int,
  side_count int,
  card_list text,
  status text not null default 'registered',
  user_id uuid references auth.users(id) -- nullable; populated in Phase B when submitter is logged in
);

create table public.admins (
  user_id uuid primary key references auth.users(id),
  added_at timestamptz default now()
);

alter table public.events enable row level security;
alter table public.submissions enable row level security;
alter table public.admins enable row level security;

-- events: public read, admin-only write
create policy "events_select_all" on public.events for select using (true);
create policy "events_admin_write" on public.events for all
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- submissions: public read + anonymous insert; only admins can update/delete
create policy "submissions_select_all" on public.submissions for select using (true);
create policy "submissions_insert_anyone" on public.submissions for insert with check (true);
create policy "submissions_admin_update" on public.submissions for update
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
create policy "submissions_admin_delete" on public.submissions for delete
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- admins: readable by self or other admins; no client-side insert/update/delete policy —
-- only editable via the Supabase dashboard table editor (service role bypasses RLS).
create policy "admins_select_self_or_admin" on public.admins for select
  using (auth.uid() = user_id or exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Realtime: let the dashboard/API stream changes to admin sessions.
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.submissions;

-- Optional: a couple of example events to start with (uncomment to use).
-- insert into public.events (id, name, date, time, format, location, notes) values
--   ('ev1', 'Friday Night Magic — Modern', '2026-08-01', '18:00', 'modern',    'BGP — Main store', 'Entry $10. Top 8 prizing.'),
--   ('ev2', 'Commander Night',             '2026-08-03', '14:00', 'commander', 'BGP — Main store', 'Casual pods, no entry fee.'),
--   ('ev3', 'Standard Showdown',           '2026-08-08', '17:00', 'standard',  'BGP — Main store', 'WPN promo packs.');
