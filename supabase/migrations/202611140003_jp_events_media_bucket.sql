alter table public.media_assets
  drop constraint if exists media_storage_location;

alter table public.media_assets
  add constraint media_storage_location check (
    (provider = 'external' and external_url is not null and bucket is null and object_path is null)
    or (provider = 'supabase' and state = 'deleted' and external_url is null and bucket is null and object_path is null)
    or (
      provider = 'supabase'
      and external_url is null
      and bucket in ('cms-staging', 'jp-events-media')
      and object_path is not null
    )
  );

drop policy if exists media_admin_or_public_read on public.media_assets;
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

-- Public buckets expose every object in the bucket; draft uploads remain in cms-staging.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('jp-events-media', 'jp-events-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy jp_events_media_admin_insert on storage.objects for insert
  to authenticated with check (
    bucket_id = 'jp-events-media'
    and public.cms_is_admin()
    and (storage.foldername(name))[1] in ('portfolio', 'venues')
  );

create policy jp_events_media_admin_update on storage.objects for update
  to authenticated using (
    bucket_id = 'jp-events-media'
    and public.cms_is_admin()
    and (storage.foldername(name))[1] in ('portfolio', 'venues')
  ) with check (
    bucket_id = 'jp-events-media'
    and public.cms_is_admin()
    and (storage.foldername(name))[1] in ('portfolio', 'venues')
  );

create policy jp_events_media_admin_delete on storage.objects for delete
  to authenticated using (
    bucket_id = 'jp-events-media'
    and public.cms_is_admin()
    and (storage.foldername(name))[1] in ('portfolio', 'venues')
  );
