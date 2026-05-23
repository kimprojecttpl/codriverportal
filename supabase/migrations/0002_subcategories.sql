-- Codriver Portal — Sub-category support (2-level hierarchy)
-- Adds parent_id to categories for parent/child relationships.
-- Run this AFTER 0001_init.sql

alter table public.categories
  add column parent_id uuid references public.categories(id) on delete set null;

create index idx_categories_parent on public.categories(parent_id);

-- Enforce 2-level limit: a category with parent_id cannot itself be a parent
create or replace function public.enforce_category_depth()
returns trigger
language plpgsql
as $$
begin
  -- If trying to set parent_id, ensure the parent is itself top-level
  if new.parent_id is not null then
    if exists (
      select 1 from public.categories
      where id = new.parent_id and parent_id is not null
    ) then
      raise exception 'Sub-categories cannot have their own children (max 2 levels)';
    end if;
    -- Prevent self-reference
    if new.parent_id = new.id then
      raise exception 'Category cannot be its own parent';
    end if;
  end if;
  -- If this category becomes a child, ensure it doesn't already have children
  if new.parent_id is not null then
    if exists (
      select 1 from public.categories where parent_id = new.id
    ) then
      raise exception 'Cannot move a parent category under another parent (it already has children)';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_category_depth_trigger
  before insert or update on public.categories
  for each row
  execute function public.enforce_category_depth();
