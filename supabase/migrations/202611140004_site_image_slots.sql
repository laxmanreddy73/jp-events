create table if not exists public.site_image_slots (
  id uuid primary key default gen_random_uuid(),
  slot_key text not null unique check (char_length(slot_key) between 1 and 180),
  section_key text not null check (char_length(section_key) between 1 and 80),
  storage_path text not null check (storage_path like 'site-content/%'),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  byte_size bigint not null check (byte_size between 1 and 10485760),
  width integer not null check (width between 1 and 6000),
  height integer not null check (height between 1 and 6000),
  alt_text text not null default '' check (char_length(alt_text) <= 500),
  object_position text not null default 'center' check (object_position in ('center', 'top', 'bottom', 'left', 'right')),
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists site_image_slots_section_active_idx
  on public.site_image_slots (section_key, is_active);

alter table public.site_image_slots enable row level security;

create policy site_image_slots_public_read on public.site_image_slots for select
  using (is_active);

create policy site_image_slots_admin_insert on public.site_image_slots for insert
  to authenticated with check (public.cms_is_admin());

create policy site_image_slots_admin_update on public.site_image_slots for update
  to authenticated using (public.cms_is_admin()) with check (public.cms_is_admin());

create policy site_image_slots_admin_delete on public.site_image_slots for delete
  to authenticated using (public.cms_is_admin());

grant select on public.site_image_slots to anon, authenticated;
grant insert, update, delete on public.site_image_slots to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'site_image_slots'
  ) then
    alter publication supabase_realtime add table public.site_image_slots;
  end if;
end;
$$;

create trigger site_image_slots_updated_at before update on public.site_image_slots
for each row execute function public.cms_set_updated_at();

create trigger site_image_slots_audit after insert or update or delete on public.site_image_slots
for each row execute function public.cms_audit_content_change();
