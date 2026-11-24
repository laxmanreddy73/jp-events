create extension if not exists pgcrypto with schema extensions;

create or replace function public.cms_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from auth.users as cms_user
      where cms_user.id = auth.uid()
        and coalesce(cms_user.raw_app_meta_data ->> 'cms_role', '') = 'admin'
    )
    and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

revoke all on function public.cms_is_admin() from public;
grant execute on function public.cms_is_admin() to anon, authenticated;

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  slug text not null unique check (char_length(slug) between 1 and 180),
  description text not null check (char_length(description) between 1 and 5000),
  category text not null check (char_length(category) between 1 and 80),
  guest_capacity integer check (guest_capacity is null or guest_capacity >= 0),
  duration text check (duration is null or char_length(duration) <= 120),
  event_date date,
  event_label text check (event_label is null or char_length(event_label) <= 120),
  location text check (location is null or char_length(location) <= 240),
  budget text check (budget is null or char_length(budget) <= 120),
  tags text[] not null default '{}',
  awards text[] not null default '{}',
  photographer text check (photographer is null or char_length(photographer) <= 160),
  featured boolean not null default false,
  sort_order integer not null default 0,
  likes integer not null default 0 check (likes >= 0),
  views integer not null default 0 check (views >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  slug text not null unique check (char_length(slug) between 1 and 180),
  subtitle text check (subtitle is null or char_length(subtitle) <= 240),
  description text not null check (char_length(description) between 1 and 5000),
  guest_capacity integer not null check (guest_capacity > 0),
  amenities text[] not null default '{}',
  location text check (location is null or char_length(location) <= 240),
  featured boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('supabase', 'external')),
  bucket text,
  object_path text,
  external_url text,
  original_filename text not null check (char_length(original_filename) between 1 and 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  byte_size bigint not null default 0 check (byte_size >= 0 and byte_size <= 10485760),
  width integer check (width is null or width between 1 and 6000),
  height integer check (height is null or height between 1 and 6000),
  checksum_sha256 text,
  alt_text text not null default '' check (char_length(alt_text) <= 500),
  state text not null default 'staging' check (state in ('staging', 'published', 'cleanup_pending', 'deleted')),
  uploaded_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_storage_location check (
    (provider = 'external' and external_url is not null and bucket is null and object_path is null)
    or (provider = 'supabase' and state = 'deleted' and external_url is null and bucket is null and object_path is null)
    or (provider = 'supabase' and external_url is null and bucket in ('cms-staging', 'jp-events-media') and object_path is not null)
  )
);

create unique index if not exists media_assets_external_url_unique
  on public.media_assets (external_url) where provider = 'external';
create unique index if not exists media_assets_storage_path_unique
  on public.media_assets (bucket, object_path) where provider = 'supabase';
create index if not exists media_assets_state_created_idx on public.media_assets (state, created_at desc);

create table if not exists public.portfolio_media (
  portfolio_id uuid not null references public.portfolio_items(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  sort_order integer not null default 0,
  role text not null check (role in ('cover', 'gallery')),
  primary key (portfolio_id, media_id)
);
create unique index if not exists portfolio_media_one_cover
  on public.portfolio_media (portfolio_id) where role = 'cover';
create index if not exists portfolio_media_media_idx on public.portfolio_media (media_id);

create table if not exists public.venue_media (
  venue_id uuid not null references public.venues(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  sort_order integer not null default 0,
  role text not null check (role in ('cover', 'gallery')),
  primary key (venue_id, media_id)
);
create unique index if not exists venue_media_one_cover
  on public.venue_media (venue_id) where role = 'cover';
create index if not exists venue_media_media_idx on public.venue_media (media_id);

create table if not exists public.admin_activity (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  occurred_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);
create index if not exists admin_activity_occurred_idx on public.admin_activity (occurred_at desc);

create or replace function public.cms_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if auth.uid() is not null then
    new.updated_by := auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.cms_audit_content_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  before_row jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  after_row jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  content_id uuid := case when tg_op = 'DELETE' then old.id else new.id end;
  action_name text := lower(tg_op);
begin
  if before_row ->> 'status' is distinct from after_row ->> 'status' then
    action_name := coalesce(after_row ->> 'status', 'deleted');
  end if;
  insert into public.admin_activity(actor_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    action_name,
    tg_table_name,
    content_id,
    jsonb_build_object(
      'title', coalesce(after_row ->> 'title', after_row ->> 'name', before_row ->> 'title', before_row ->> 'name')
    )
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger portfolio_items_updated_at before update on public.portfolio_items
for each row execute function public.cms_set_updated_at();
create trigger venues_updated_at before update on public.venues
for each row execute function public.cms_set_updated_at();
create trigger media_assets_updated_at before update on public.media_assets
for each row execute function public.cms_set_updated_at();

create trigger portfolio_items_audit after insert or update or delete on public.portfolio_items
for each row execute function public.cms_audit_content_change();
create trigger venues_audit after insert or update or delete on public.venues
for each row execute function public.cms_audit_content_change();

create or replace function public.cms_publish_content(p_content_type text, p_content_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  media_count integer;
  cover_count integer;
  has_unpublished_media boolean;
begin
  if coalesce(auth.role(), '') <> 'service_role' and not public.cms_is_admin() then
    raise exception 'Administrator MFA is required' using errcode = '42501';
  end if;

  if p_content_type = 'portfolio' then
    select count(*), count(*) filter (where pm.role = 'cover'),
      coalesce(bool_or(ma.state <> 'published'), true)
      into media_count, cover_count, has_unpublished_media
      from public.portfolio_media pm
      join public.media_assets ma on ma.id = pm.media_id
      where pm.portfolio_id = p_content_id;
    if media_count = 0 or cover_count <> 1 or has_unpublished_media then
      raise exception 'Portfolio requires one cover and published images' using errcode = '23514';
    end if;
    update public.portfolio_items set status = 'published', published_at = coalesce(published_at, now()), updated_at = now()
      where id = p_content_id;
  elsif p_content_type = 'venue' then
    select count(*), count(*) filter (where vm.role = 'cover'),
      coalesce(bool_or(ma.state <> 'published'), true)
      into media_count, cover_count, has_unpublished_media
      from public.venue_media vm
      join public.media_assets ma on ma.id = vm.media_id
      where vm.venue_id = p_content_id;
    if media_count = 0 or cover_count <> 1 or has_unpublished_media then
      raise exception 'Venue requires one cover and published images' using errcode = '23514';
    end if;
    update public.venues set status = 'published', published_at = coalesce(published_at, now()), updated_at = now()
      where id = p_content_id;
  else
    raise exception 'Unsupported content type' using errcode = '22023';
  end if;

  if not found then
    raise exception 'Content not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.cms_publish_content(text, uuid) from public;
grant execute on function public.cms_publish_content(text, uuid) to authenticated, service_role;

alter table public.portfolio_items enable row level security;
alter table public.venues enable row level security;
alter table public.media_assets enable row level security;
alter table public.portfolio_media enable row level security;
alter table public.venue_media enable row level security;
alter table public.admin_activity enable row level security;

create policy portfolio_public_read on public.portfolio_items for select
  using (status = 'published' or public.cms_is_admin());
create policy portfolio_admin_insert on public.portfolio_items for insert
  to authenticated with check (public.cms_is_admin());
create policy portfolio_admin_update on public.portfolio_items for update
  to authenticated using (public.cms_is_admin()) with check (public.cms_is_admin());
create policy portfolio_admin_delete on public.portfolio_items for delete
  to authenticated using (public.cms_is_admin());

create policy venues_public_read on public.venues for select
  using (status = 'published' or public.cms_is_admin());
create policy venues_admin_insert on public.venues for insert
  to authenticated with check (public.cms_is_admin());
create policy venues_admin_update on public.venues for update
  to authenticated using (public.cms_is_admin()) with check (public.cms_is_admin());
create policy venues_admin_delete on public.venues for delete
  to authenticated using (public.cms_is_admin());

create policy media_admin_or_public_read on public.media_assets for select
  using (
    public.cms_is_admin()
    or (
      state = 'published'
      and (
        provider = 'external'
        or bucket = 'jp-events-media'
      )
    )
  );
create policy media_admin_update on public.media_assets for update
  to authenticated using (public.cms_is_admin()) with check (public.cms_is_admin());

create policy portfolio_media_public_read on public.portfolio_media for select
  using (
    public.cms_is_admin()
    or exists (
      select 1 from public.portfolio_items p
      join public.media_assets ma on ma.id = portfolio_media.media_id
      where p.id = portfolio_media.portfolio_id and p.status = 'published' and ma.state = 'published'
    )
  );
create policy portfolio_media_admin_write on public.portfolio_media for all
  to authenticated using (public.cms_is_admin()) with check (public.cms_is_admin());

create policy venue_media_public_read on public.venue_media for select
  using (
    public.cms_is_admin()
    or exists (
      select 1 from public.venues v
      join public.media_assets ma on ma.id = venue_media.media_id
      where v.id = venue_media.venue_id and v.status = 'published' and ma.state = 'published'
    )
  );
create policy venue_media_admin_write on public.venue_media for all
  to authenticated using (public.cms_is_admin()) with check (public.cms_is_admin());

create policy admin_activity_read on public.admin_activity for select
  to authenticated using (public.cms_is_admin());

grant select on public.portfolio_items, public.venues, public.media_assets, public.portfolio_media, public.venue_media to anon, authenticated;
grant insert, update, delete on public.portfolio_items, public.venues, public.portfolio_media, public.venue_media to authenticated;
grant update (alt_text) on public.media_assets to authenticated;
grant select on public.admin_activity to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cms-staging', 'cms-staging', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy cms_staging_admin_read on storage.objects for select
  to authenticated using (bucket_id = 'cms-staging' and public.cms_is_admin());
create policy cms_staging_admin_insert on storage.objects for insert
  to authenticated with check (
    bucket_id = 'cms-staging'
    and public.cms_is_admin()
    and (storage.foldername(name))[1] in ('portfolio', 'venues')
    and (storage.foldername(name))[3] = auth.uid()::text
  );

