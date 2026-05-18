-- 1. Khởi tạo các bảng (nếu chưa có)
-- Lưu ý: id của bảng users sẽ khớp với auth.uid() từ Supabase Auth

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    stripe_customer_id TEXT UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,  -- Thêm cột này
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    image_filename TEXT NOT NULL,
    image_url TEXT,
    image_size_bytes BIGINT,
    label TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    all_scores JSONB,
    processing_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    extra_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- AI Training Platform Tables
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

create table if not exists datasets (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    name text not null,
    description text,
    storage_backend text not null default 'local',
    storage_path text not null,
    classes jsonb not null default '[]'::jsonb,
    image_count integer not null default 0,
    label_count integer not null default 0,
    train_count integer not null default 0,
    val_count integer not null default 0,
    test_count integer not null default 0,
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

create table if not exists dataset_assets (
    id uuid primary key default gen_random_uuid(),
    dataset_id uuid not null references datasets(id) on delete cascade,
    file_name text not null,
    split text not null default 'train',
    asset_type text not null default 'image',
    file_path text not null,
    label_path text,
    preview_url text,
    size_bytes bigint,
    created_at timestamptz not null default now()
);

create table if not exists training_jobs (
    id uuid primary key default gen_random_uuid(),
    dataset_id uuid not null references datasets(id) on delete cascade,
    model_type text not null default 'yolov8n',
    epochs integer not null default 100,
    batch_size integer not null default 16,
    image_size integer not null default 640,
    learning_rate numeric not null default 0.001,
    optimizer text not null default 'AdamW',
    status text not null default 'queued',
    progress numeric not null default 0,
    current_epoch integer not null default 0,
    total_epochs integer not null default 0,
    train_loss numeric,
    val_loss numeric,
    map50 numeric,
    precision numeric,
    recall numeric,
    eta_seconds integer,
    gpu_usage numeric,
    ram_usage numeric,
    config jsonb not null default '{}'::jsonb,
    logs_path text,
    error_message text,
    created_by uuid,
    created_at timestamptz not null default now(),
    started_at timestamptz,
    finished_at timestamptz,
    model_version_id uuid,
    updated_at timestamptz
);

create table if not exists training_logs (
    id uuid primary key default gen_random_uuid(),
    training_job_id uuid not null references training_jobs(id) on delete cascade,
    level text not null default 'info',
    message text not null,
    epoch integer,
    step integer,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists model_versions (
    id uuid primary key default gen_random_uuid(),
    dataset_id uuid not null references datasets(id) on delete cascade,
    training_job_id uuid not null references training_jobs(id) on delete cascade,
    name text not null,
    version text not null,
    model_type text not null,
    weights_path text not null,
    config jsonb not null default '{}'::jsonb,
    metrics jsonb not null default '{}'::jsonb,
    is_active boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deployed_at timestamptz
);

create table if not exists deployed_models (
    id uuid primary key default gen_random_uuid(),
    model_version_id uuid not null references model_versions(id) on delete cascade,
    status text not null default 'active',
    deployed_by uuid,
    deployed_at timestamptz not null default now(),
    previous_model_version_id uuid,
    metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_dataset_assets_dataset_id on dataset_assets(dataset_id);
create index if not exists idx_training_jobs_dataset_id on training_jobs(dataset_id);
create index if not exists idx_training_logs_job_id on training_logs(training_job_id);
create index if not exists idx_model_versions_dataset_id on model_versions(dataset_id);
create index if not exists idx_model_versions_active on model_versions(is_active);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Policy cho bảng predictions
DROP POLICY IF EXISTS "Users can view their own predictions" ON public.predictions;
CREATE POLICY "Users can view their own predictions" ON public.predictions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own predictions" ON public.predictions;
CREATE POLICY "Users can insert their own predictions" ON public.predictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy cho bảng subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy cho bảng usage_logs
DROP POLICY IF EXISTS "Users can view their own usage logs" ON public.usage_logs;
CREATE POLICY "Users can view their own usage logs" ON public.usage_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage logs" ON public.usage_logs;
CREATE POLICY "Users can insert their own usage logs" ON public.usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Lưu ý: Backend dùng Service Role Key nên sẽ bỏ qua RLS này để thực hiện các tác vụ hệ thống.
-- Tuy nhiên, RLS vẫn cực kỳ quan trọng nếu bạn gọi trực tiếp từ Frontend trong tương lai.
