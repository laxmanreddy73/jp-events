create table if not exists public.venue_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 1 and 80),
  name text not null unique check (char_length(name) between 1 and 120),
  homepage_section text not null check (homepage_section in ('reception-halls')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.venue_categories (slug, name, homepage_section, sort_order)
values ('reception-halls', 'Reception Halls', 'reception-halls', 0)
on conflict (slug) do update
set name = excluded.name,
    homepage_section = excluded.homepage_section,
    is_active = true;

alter table public.venues
  add column if not exists category_id uuid references public.venue_categories(id) on delete restrict,
  add column if not exists price_amount numeric(12, 2) check (price_amount is null or price_amount >= 0),
  add column if not exists price_currency text not null default 'INR' check (price_currency = 'INR'),
  add column if not exists price_type text not null default 'contact_for_quote'
    check (price_type in ('fixed', 'starting_from', 'per_event', 'per_plate', 'contact_for_quote')),
  add column if not exists price_note text check (price_note is null or char_length(price_note) <= 240);

update public.venues
set category_id = (select id from public.venue_categories where slug = 'reception-halls')
where category_id is null;

alter table public.venues alter column category_id set not null;
create index if not exists venues_category_status_order_idx
  on public.venues (category_id, status, sort_order, created_at);

create trigger venue_categories_updated_at before update on public.venue_categories
for each row execute function public.cms_set_updated_at();

create trigger venue_categories_audit after insert or update or delete on public.venue_categories
for each row execute function public.cms_audit_content_change();

alter table public.venue_categories enable row level security;
create policy venue_categories_public_read on public.venue_categories for select
  using (is_active or public.cms_is_admin());
create policy venue_categories_admin_write on public.venue_categories for all
  to authenticated using (public.cms_is_admin()) with check (public.cms_is_admin());

grant select on public.venue_categories to anon, authenticated;
grant insert, update, delete on public.venue_categories to authenticated;

drop function if exists public.cms_publish_content(text, uuid);
create function public.cms_publish_content(p_content_type text, p_content_id uuid)
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
    if not exists (
      select 1
      from public.venues v
      join public.venue_categories c on c.id = v.category_id
      where v.id = p_content_id and c.is_active and c.homepage_section = 'reception-halls'
    ) then
      raise exception 'Venue category is inactive or has no mapped homepage section' using errcode = '23514';
    end if;
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
