import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import ts from 'typescript';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the process environment before importing.');
}

const sourceUrl = new URL('../src/data/legacyCmsData.ts', import.meta.url);
const source = await readFile(sourceUrl, 'utf8');
const compiled = ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 });
const legacyDataUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`;
const { legacyPortfolioItems, legacyVenues } = await import(legacyDataUrl);
if (legacyPortfolioItems.length !== 12 || legacyVenues.length !== 9) {
  throw new Error(`Unexpected legacy dataset size: ${legacyPortfolioItems.length} portfolio items and ${legacyVenues.length} venues.`);
}
if (legacyPortfolioItems.some((item) => item.type !== 'image')) {
  throw new Error('The one-time import currently accepts image records only; retain any video records for a separately reviewed migration.');
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const slugify = (text) => text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const urls = [...new Set([
  ...legacyPortfolioItems.map((item) => item.src),
  ...legacyVenues.flatMap((venue) => [venue.src, ...venue.gallery]),
])];

const { data: existingMedia, error: existingMediaError } = await client.from('media_assets')
  .select('id,external_url').in('external_url', urls);
if (existingMediaError) throw new Error(`Could not check existing image references: ${existingMediaError.message}`);
const existingUrls = new Set((existingMedia ?? []).map((media) => media.external_url));
const missingUrls = urls.filter((url) => !existingUrls.has(url));
if (missingUrls.length) {
  const { error: mediaInsertError } = await client.from('media_assets').insert(
    missingUrls.map((url) => ({
    provider: 'external',
    bucket: null,
    object_path: null,
    external_url: url,
    original_filename: url.split('/').pop()?.split('?')[0]?.slice(0, 255) || 'legacy-image',
    mime_type: 'image/jpeg',
    byte_size: 0,
    alt_text: '',
    state: 'published',
    })),
  );
  if (mediaInsertError) throw new Error(`Could not import legacy image references: ${mediaInsertError.message}`);
}

const { data: mediaRows, error: mediaReadError } = await client.from('media_assets')
  .select('id,external_url').in('external_url', urls);
if (mediaReadError) throw new Error(`Could not read imported image references: ${mediaReadError.message}`);
const mediaByUrl = new Map((mediaRows ?? []).map((media) => [media.external_url, media.id]));
if (mediaByUrl.size !== urls.length) throw new Error('Not all legacy image references were available after the import.');

const portfolioRows = legacyPortfolioItems.map((item, index) => ({
  title: item.title,
  slug: slugify(item.title),
  description: item.description,
  category: item.category,
  guest_capacity: item.guests ?? null,
  duration: item.duration ?? null,
  event_date: null,
  event_label: item.date ?? null,
  location: item.location ?? null,
  budget: item.budget ?? null,
  tags: item.tags ?? [],
  awards: item.awards ?? [],
  photographer: item.photographer ?? null,
  featured: false,
  sort_order: index,
  likes: item.likes ?? 0,
  views: item.views ?? 0,
  status: 'published',
  published_at: new Date().toISOString(),
}));
const { error: portfolioUpsertError } = await client.from('portfolio_items')
  .upsert(portfolioRows, { onConflict: 'slug', ignoreDuplicates: true });
if (portfolioUpsertError) throw new Error(`Could not import legacy portfolio records: ${portfolioUpsertError.message}`);

const venueRows = legacyVenues.map((venue, index) => ({
  name: venue.title,
  slug: slugify(venue.title),
  subtitle: null,
  description: venue.description,
  guest_capacity: Number(venue.capacity.match(/\d+/)?.[0] ?? 0),
  amenities: venue.features,
  location: null,
  featured: false,
  sort_order: index,
  category_id: null,
  price_amount: null,
  price_currency: 'INR',
  price_type: 'contact_for_quote',
  price_note: null,
  status: 'published',
  published_at: new Date().toISOString(),
}));
const { data: venueCategory, error: venueCategoryError } = await client.from('venue_categories')
  .select('id').eq('slug', 'reception-halls').eq('is_active', true).single();
if (venueCategoryError) throw new Error(`Could not find the active Reception Halls homepage category: ${venueCategoryError.message}`);
venueRows.forEach((venue) => { venue.category_id = venueCategory.id; });
const { error: venueUpsertError } = await client.from('venues')
  .upsert(venueRows, { onConflict: 'slug', ignoreDuplicates: true });
if (venueUpsertError) throw new Error(`Could not import legacy venues: ${venueUpsertError.message}`);

const portfolioSlugs = portfolioRows.map((item) => item.slug);
const venueSlugs = venueRows.map((item) => item.slug);
const [{ data: importedPortfolio, error: portfolioReadError }, { data: importedVenues, error: venueReadError }] =
  await Promise.all([
    client.from('portfolio_items').select('id,slug').in('slug', portfolioSlugs),
    client.from('venues').select('id,slug').in('slug', venueSlugs),
  ]);
if (portfolioReadError) throw new Error(`Could not read imported portfolio records: ${portfolioReadError.message}`);
if (venueReadError) throw new Error(`Could not read imported venue records: ${venueReadError.message}`);

const portfolioLinks = (importedPortfolio ?? []).flatMap((record) => {
  const index = portfolioSlugs.indexOf(record.slug);
  const mediaId = mediaByUrl.get(legacyPortfolioItems[index]?.src);
  return mediaId ? [{ portfolio_id: record.id, media_id: mediaId, sort_order: 0, role: 'cover' }] : [];
});
const venueLinks = (importedVenues ?? []).flatMap((record) => {
  const index = venueSlugs.indexOf(record.slug);
  const venue = legacyVenues[index];
  if (!venue) return [];
  const orderedUrls = [...new Set([venue.src, ...venue.gallery])];
  return orderedUrls.flatMap((url, sortOrder) => {
    const mediaId = mediaByUrl.get(url);
    return mediaId ? [{ venue_id: record.id, media_id: mediaId, sort_order: sortOrder, role: sortOrder === 0 ? 'cover' : 'gallery' }] : [];
  });
});

const [{ error: portfolioLinksError }, { error: venueLinksError }] = await Promise.all([
  client.from('portfolio_media').upsert(portfolioLinks, { onConflict: 'portfolio_id,media_id', ignoreDuplicates: true }),
  client.from('venue_media').upsert(venueLinks, { onConflict: 'venue_id,media_id', ignoreDuplicates: true }),
]);
if (portfolioLinksError) throw new Error(`Could not link legacy portfolio images: ${portfolioLinksError.message}`);
if (venueLinksError) throw new Error(`Could not link legacy venue images: ${venueLinksError.message}`);

console.log(`Legacy CMS import complete: ${portfolioLinks.length} portfolio covers, ${venueLinks.length} unique venues, ${urls.length} external image references.`);
console.log('Existing slugs and media links were left unchanged to make this import safe to rerun.');
