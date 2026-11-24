import { getSupabaseClient } from '../lib/supabaseClient';
import type {
  CmsContentType,
  MediaAsset,
  PortfolioRecord,
  VenueCategory,
  VenueRecord,
} from '../types/cms';

const portfolioSelection = '*, portfolio_media(media_id,sort_order,role,media:media_assets(*))';
const venueSelection = '*, category:venue_categories(id,slug,name,homepage_section,is_active,sort_order), venue_media(media_id,sort_order,role,media:media_assets(*))';

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function fetchPublishedPortfolio(): Promise<PortfolioRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from('portfolio_items')
    .select(portfolioSelection)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  throwIfError(error);
  return (data ?? []) as unknown as PortfolioRecord[];
}

export async function fetchPublishedVenues(): Promise<VenueRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from('venues')
    .select(venueSelection)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  throwIfError(error);
  return (data ?? []) as unknown as VenueRecord[];
}

export async function fetchVenueCategories(includeInactive = false): Promise<VenueCategory[]> {
  let query = getSupabaseClient()
    .from('venue_categories')
    .select('id,slug,name,homepage_section,is_active,sort_order')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (!includeInactive) query = query.eq('is_active', true);
  const { data, error } = await query;
  throwIfError(error);
  return (data ?? []) as VenueCategory[];
}

export async function fetchAdminPortfolio(): Promise<PortfolioRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from('portfolio_items')
    .select(portfolioSelection)
    .order('updated_at', { ascending: false });
  throwIfError(error);
  return (data ?? []) as unknown as PortfolioRecord[];
}

export async function fetchAdminVenues(): Promise<VenueRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from('venues')
    .select(venueSelection)
    .order('updated_at', { ascending: false });
  throwIfError(error);
  return (data ?? []) as unknown as VenueRecord[];
}

export async function fetchAdminMedia(): Promise<MediaAsset[]> {
  const { data, error } = await getSupabaseClient()
    .from('media_assets')
    .select('*')
    .neq('state', 'deleted')
    .order('created_at', { ascending: false });
  throwIfError(error);
  return (data ?? []) as MediaAsset[];
}

export async function fetchDashboardData() {
  const client = getSupabaseClient();
  const [portfolio, venues, media, activity] = await Promise.all([
    client.from('portfolio_items').select('id,status'),
    client.from('venues').select('id,status'),
    client.from('media_assets').select('id,state').neq('state', 'deleted'),
    client.from('admin_activity').select('id,action,entity_type,entity_id,occurred_at').order('occurred_at', { ascending: false }).limit(8),
  ]);
  throwIfError(portfolio.error);
  throwIfError(venues.error);
  throwIfError(media.error);
  throwIfError(activity.error);
  return {
    portfolio: portfolio.data ?? [],
    venues: venues.data ?? [],
    media: media.data ?? [],
    activity: activity.data ?? [],
  };
}

async function replaceRelations(
  table: 'portfolio_media' | 'venue_media',
  foreignKey: 'portfolio_id' | 'venue_id',
  contentId: string,
  mediaIds: string[],
): Promise<void> {
  const client = getSupabaseClient();
  const { error: deleteError } = await client.from(table).delete().eq(foreignKey, contentId);
  throwIfError(deleteError);
  if (!mediaIds.length) return;
  const rows = mediaIds.map((mediaId, index) => ({
    [foreignKey]: contentId,
    media_id: mediaId,
    sort_order: index,
    role: index === 0 ? 'cover' : 'gallery',
  }));
  const { error } = await client.from(table).insert(rows);
  throwIfError(error);
}

export interface PortfolioDraftInput {
  id?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  guest_capacity: number | null;
  duration: string | null;
  event_date: string | null;
  location: string | null;
  budget: string | null;
  tags: string[];
  awards: string[];
  photographer: string | null;
  featured: boolean;
  sort_order: number;
  social_wall_row: 1 | 2 | 3 | null;
  social_wall_sort_order: number;
  mediaIds: string[];
}

export async function savePortfolioDraft(input: PortfolioDraftInput): Promise<string> {
  const client = getSupabaseClient();
  const { mediaIds, ...fields } = input;
  const record = { ...fields, status: 'draft' as const, updated_at: new Date().toISOString() };
  const query = input.id
    ? client.from('portfolio_items').update(record).eq('id', input.id).select('id').single()
    : client.from('portfolio_items').insert(record).select('id').single();
  const { data, error } = await query;
  throwIfError(error);
  if (!data) throw new Error('The portfolio draft was not saved.');
  await replaceRelations('portfolio_media', 'portfolio_id', data.id, mediaIds);
  return data.id as string;
}

export interface VenueDraftInput {
  id?: string;
  name: string;
  slug: string;
  category_id: string;
  subtitle: string | null;
  description: string;
  guest_capacity: number;
  amenities: string[];
  location: string | null;
  featured: boolean;
  sort_order: number;
  price_amount: number | null;
  price_currency: 'INR';
  price_type: VenueRecord['price_type'];
  price_note: string | null;
  mediaIds: string[];
}

export async function saveVenueDraft(input: VenueDraftInput): Promise<string> {
  const client = getSupabaseClient();
  const { mediaIds, ...fields } = input;
  const record = {
    ...fields,
    status: 'draft' as const,
    updated_at: new Date().toISOString(),
  };
  const query = input.id
    ? client.from('venues').update(record).eq('id', input.id).select('id').single()
    : client.from('venues').insert(record).select('id').single();
  const { data, error } = await query;
  throwIfError(error);
  if (!data) throw new Error('The venue draft was not saved.');
  await replaceRelations('venue_media', 'venue_id', data.id, mediaIds);
  return data.id as string;
}

export async function publishContent(type: CmsContentType, id: string): Promise<void> {
  const client = getSupabaseClient();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  throwIfError(sessionError);
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Your admin session has expired. Sign in again.');

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/publish-content`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contentType: type, contentId: id }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.error ?? `Publishing failed (${response.status}).`);
  }
}

export async function setContentStatus(
  type: CmsContentType,
  id: string,
  status: 'draft' | 'archived',
): Promise<void> {
  const table = type === 'portfolio' ? 'portfolio_items' : 'venues';
  const { error } = await getSupabaseClient()
    .from(table)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  throwIfError(error);
}

export async function deleteContent(type: CmsContentType, id: string): Promise<void> {
  const table = type === 'portfolio' ? 'portfolio_items' : 'venues';
  const { error } = await getSupabaseClient().from(table).delete().eq('id', id);
  throwIfError(error);
}

export async function reorderContent(
  type: CmsContentType,
  orderedIds: string[],
): Promise<void> {
  const table = type === 'portfolio' ? 'portfolio_items' : 'venues';
  const client = getSupabaseClient();
  const results = await Promise.all(
    orderedIds.map((id, sort_order) =>
      client.from(table).update({ sort_order, updated_at: new Date().toISOString() }).eq('id', id),
    ),
  );
  const failed = results.find((result) => result.error);
  throwIfError(failed?.error ?? null);
}

export async function reorderSocialWallRow(
  row: 1 | 2 | 3,
  orderedIds: string[],
): Promise<void> {
  const client = getSupabaseClient();
  const results = await Promise.all(
    orderedIds.map((id, social_wall_sort_order) =>
      client.from('portfolio_items')
        .update({ social_wall_row: row, social_wall_sort_order, updated_at: new Date().toISOString() })
        .eq('id', id),
    ),
  );
  const failed = results.find((result) => result.error);
  throwIfError(failed?.error ?? null);
}

export async function requestMediaDeletion(mediaId: string): Promise<void> {
  const client = getSupabaseClient();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  throwIfError(sessionError);
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Your admin session has expired. Sign in again.');
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-media-deletion`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mediaId }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error ?? `Media cleanup request failed (${response.status}).`);
}

export async function updateMediaAltText(mediaId: string, altText: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('media_assets')
    .update({ alt_text: altText.trim(), updated_at: new Date().toISOString() })
    .eq('id', mediaId);
  throwIfError(error);
}
