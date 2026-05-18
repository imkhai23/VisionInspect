-- VisionInspect minimal Supabase schema
-- Only the 4 tables needed for the core app flow.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    full_name,
    stripe_customer_id,
    is_active,
    is_verified,
    is_admin,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    null,
    true,
    false,
    false,
    now(),
    now()
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.users.full_name),
        updated_at = now();

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- 1) Users
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  stripe_customer_id text unique,
  is_active boolean not null default true,
  is_verified boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Predictions
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  image_filename text not null,
  image_url text,
  image_size_bytes bigint,
  label text not null,
  confidence double precision not null,
  all_scores jsonb,
  processing_ms integer,
  created_at timestamptz not null default now()
);

-- 3) Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Usage logs
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  extra_metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_predictions_user_id on public.predictions(user_id);
create index if not exists idx_predictions_created_at on public.predictions(created_at desc);
create index if not exists idx_usage_logs_user_id on public.usage_logs(user_id);
create index if not exists idx_usage_logs_created_at on public.usage_logs(created_at desc);

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_set_updated_at on public.subscriptions;
create trigger trg_subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.predictions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_logs enable row level security;

drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
on public.users
for select
using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
on public.users
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
on public.users
for update
using (auth.uid() = id);

drop policy if exists "Users can view their own predictions" on public.predictions;
create policy "Users can view their own predictions"
on public.predictions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own predictions" on public.predictions;
create policy "Users can insert their own predictions"
on public.predictions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can view their own subscription" on public.subscriptions;
create policy "Users can view their own subscription"
on public.subscriptions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can view their own usage logs" on public.usage_logs;
create policy "Users can view their own usage logs"
on public.usage_logs
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own usage logs" on public.usage_logs;
create policy "Users can insert their own usage logs"
on public.usage_logs
for insert
with check (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────────────
-- Data Management & AI Training Platform Tables
-- ──────────────────────────────────────────────────────────────────────────────

-- 1) Datasets: Store dataset metadata
create table if not exists public.datasets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  classes text[] default array[]::text[],
  storage_backend text not null default 'local',
  storage_path text not null,
  image_count integer not null default 0,
  label_count integer not null default 0,
  train_count integer not null default 0,
  val_count integer not null default 0,
  test_count integer not null default 0,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Dataset Assets: Store individual image/label files in a dataset
create table if not exists public.dataset_assets (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.datasets(id) on delete cascade,
  file_name text not null,
  split text not null check (split in ('train', 'val', 'test', 'valid')),
  asset_type text not null check (asset_type in ('image', 'label')),
  file_path text not null,
  label_path text,
  preview_url text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_dataset_assets_dataset_id on public.dataset_assets(dataset_id);
create index if not exists idx_dataset_assets_split on public.dataset_assets(split);

-- 3) Training Jobs: Track YOLO model training progress
create table if not exists public.training_jobs (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.datasets(id) on delete cascade,
  model_type text default 'yolov8n',
  epochs integer default 100,
  batch_size integer default 16,
  image_size integer default 640,
  learning_rate double precision default 0.001,
  optimizer text default 'AdamW',
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  progress double precision default 0.0,
  current_epoch integer default 0,
  total_epochs integer default 100,
  train_loss double precision,
  val_loss double precision,
  map50 double precision,
  precision double precision,
  recall double precision,
  eta_seconds double precision,
  gpu_usage double precision,
  ram_usage double precision,
  config jsonb default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  model_version_id uuid,
  logs_path text,
  error_message text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_training_jobs_dataset_id on public.training_jobs(dataset_id);

-- 4) Training Logs: Real-time logs for active training jobs
create table if not exists public.training_logs (
  id uuid primary key default gen_random_uuid(),
  training_job_id uuid not null references public.training_jobs(id) on delete cascade,
  level text not null default 'info',
  message text not null,
  epoch integer,
  step integer,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_training_logs_job_id on public.training_logs(training_job_id);

-- 5) Model Versions: Track registered AI weights and metrics
create table if not exists public.model_versions (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.datasets(id) on delete cascade,
  training_job_id uuid not null references public.training_jobs(id) on delete cascade,
  name text not null,
  version text not null,
  model_type text default 'yolov8n',
  weights_path text not null,
  config jsonb default '{}'::jsonb,
  metrics jsonb default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deployed_at timestamptz
);

create index if not exists idx_model_versions_dataset_id on public.model_versions(dataset_id);
create index if not exists idx_model_versions_job_id on public.model_versions(training_job_id);

-- 6) Deployed Models: Audit trail of active/deployed models
create table if not exists public.deployed_models (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid not null references public.model_versions(id) on delete cascade,
  status text not null default 'active',
  deployed_by uuid references public.users(id) on delete set null,
  deployed_at timestamptz not null default now(),
  previous_model_version_id uuid,
  metadata jsonb default '{}'::jsonb
);

-- Triggers for auto updated_at
drop trigger if exists trg_datasets_set_updated_at on public.datasets;
create trigger trg_datasets_set_updated_at
before update on public.datasets
for each row execute function public.set_updated_at();

drop trigger if exists trg_training_jobs_set_updated_at on public.training_jobs;
create trigger trg_training_jobs_set_updated_at
before update on public.training_jobs
for each row execute function public.set_updated_at();

drop trigger if exists trg_model_versions_set_updated_at on public.model_versions;
create trigger trg_model_versions_set_updated_at
before update on public.model_versions
for each row execute function public.set_updated_at();


-- Enable RLS (Optional for Admin-only service-role tables, but good practice)
alter table public.datasets enable row level security;
alter table public.dataset_assets enable row level security;
alter table public.training_jobs enable row level security;
alter table public.training_logs enable row level security;
alter table public.model_versions enable row level security;
alter table public.deployed_models enable row level security;

-- RLS Policies
-- Allow all authenticated users to read (Admin views it through backend API, but if frontend queries directly)
create policy "datasets_read_policy" on public.datasets for select to authenticated using (true);
create policy "dataset_assets_read_policy" on public.dataset_assets for select to authenticated using (true);
create policy "training_jobs_read_policy" on public.training_jobs for select to authenticated using (true);
create policy "training_logs_read_policy" on public.training_logs for select to authenticated using (true);
create policy "model_versions_read_policy" on public.model_versions for select to authenticated using (true);
create policy "deployed_models_read_policy" on public.deployed_models for select to authenticated using (true);

-- Allow backend service-role full write access (service role key bypasses RLS anyway)
-- (If you want admins to write directly from frontend bypasses service role, you can define checks here)