-- ============================================================
-- Sundeas AI — Investment Education & Portfolio Tracking
-- Apply via Supabase dashboard SQL editor
-- ============================================================

-- Waitlist (pre-launch email capture)
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);
alter table waitlist enable row level security;
-- No user-facing RLS needed — only accessible via service role (API route)

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  onboarding_completed boolean not null default false,
  risk_profile jsonb,        -- answers from the yes/no onboarding wizard
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on sign up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ============================================================
-- Education layer
-- ============================================================

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,       -- e.g. "what-is-an-etf"
  title text not null,
  body_md text not null,
  video_url text,                  -- YouTube embed URL
  order_index int not null default 0,
  tags text[] not null default '{}',  -- e.g. {beginner, etf, isa}
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table modules enable row level security;
create policy "Anyone can read published modules" on modules for select using (published = true);

create table if not exists user_module_progress (
  user_id uuid references profiles on delete cascade,
  module_id uuid references modules on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

alter table user_module_progress enable row level security;
create policy "Users can read own progress" on user_module_progress for select using (auth.uid() = user_id);
create policy "Users can write own progress" on user_module_progress for insert with check (auth.uid() = user_id);


-- ============================================================
-- Portfolio tracking
-- ============================================================

create table if not exists portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  name text not null,
  source text not null check (source in ('trading212', 'manual')),
  t212_api_key text,               -- stored server-side only, never sent to client
  created_at timestamptz not null default now(),
  unique (user_id, source)
);

alter table portfolios enable row level security;
create policy "Users can manage own portfolios" on portfolios for all using (auth.uid() = user_id);

create table if not exists holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references portfolios on delete cascade not null,
  ticker text not null,
  name text,
  quantity decimal not null default 0,
  avg_buy_price decimal,
  current_price decimal,
  target_weight decimal,           -- user-defined target allocation %
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (portfolio_id, ticker)
);

alter table holdings enable row level security;
create policy "Users can manage own holdings" on holdings for all
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));


-- ============================================================
-- AI insights
-- ============================================================

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references portfolios on delete cascade not null,
  content text not null,           -- AI-generated plain-English insight
  market_context jsonb,            -- snapshot of data used to generate
  generated_at timestamptz not null default now()
);

alter table insights enable row level security;
create policy "Users can read own insights" on insights for select
  using (portfolio_id in (select id from portfolios where user_id = auth.uid()));
create policy "Service role can insert insights" on insights for insert
  with check (true);  -- restricted to service role via RLS bypass in edge function
