-- Codriver Portal — Initial schema
-- Run this in Supabase SQL Editor after creating the project

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name_th text not null,
  name_en text not null,
  icon text default 'LayoutGrid',
  order_index int default 0,
  created_at timestamptz default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name_th text not null,
  name_en text not null,
  url text not null,
  category_id uuid references public.categories(id) on delete set null,
  status text not null check (status in ('active', 'paused', 'done')) default 'active',
  description_th text default '',
  description_en text default '',
  icon text default '📁',
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique (owner_id, name)
);

create table public.project_tags (
  project_id uuid references public.projects(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (project_id, tag_id)
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────

create index idx_projects_owner on public.projects(owner_id);
create index idx_projects_status on public.projects(status);
create index idx_projects_category on public.projects(category_id);
create index idx_projects_last_accessed on public.projects(last_accessed_at desc);
create index idx_categories_owner on public.categories(owner_id);
create index idx_tags_owner on public.tags(owner_id);
create index idx_project_tags_project on public.project_tags(project_id);
create index idx_project_tags_tag on public.project_tags(tag_id);

-- ─────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

-- Seed default categories when a new user signs up
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (owner_id, name_th, name_en, icon, order_index)
  values
    (new.id, 'งาน', 'Work', 'Briefcase', 1),
    (new.id, 'ส่วนตัว', 'Personal', 'Heart', 2),
    (new.id, 'เรียนรู้', 'Learning', 'BookOpen', 3),
    (new.id, 'ทดลอง', 'Experiment', 'FlaskConical', 4);
  return new;
end;
$$;

create trigger seed_default_categories_on_signup
  after insert on auth.users
  for each row
  execute function public.seed_default_categories();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.tags enable row level security;
alter table public.project_tags enable row level security;

create policy "categories_owner_all" on public.categories
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "projects_owner_all" on public.projects
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "tags_owner_all" on public.tags
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "project_tags_owner_all" on public.project_tags
  for all
  using (
    exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- REALTIME (multi-tab sync)
-- ─────────────────────────────────────────────

alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.tags;
alter publication supabase_realtime add table public.project_tags;
