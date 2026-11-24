export type ContentStatus = 'draft' | 'published' | 'archived';
export type CmsContentType = 'portfolio' | 'venue';
export type MediaState = 'staging' | 'published' | 'cleanup_pending' | 'deleted';
export type SocialWallRow = 1 | 2 | 3;

export interface MediaAsset {
  id: string;
  provider: 'supabase' | 'external';
  bucket: string | null;
  object_path: string | null;
  external_url: string | null;
  original_filename: string;
  mime_type: string;
  byte_size: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  state: MediaState;
  created_at: string;
}

export interface PortfolioRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  guest_capacity: number | null;
  likes: number;
  views: number;
  event_label: string | null;
  duration: string | null;
  event_date: string | null;
  location: string | null;
  budget: string | null;
  tags: string[];
  awards: string[];
  photographer: string | null;
  featured: boolean;
  sort_order: number;
  social_wall_row: SocialWallRow | null;
  social_wall_sort_order: number;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
  portfolio_media?: Array<{
    media_id: string;
    sort_order: number;
    role: 'cover' | 'gallery';
    media: MediaAsset;
  }>;
}

export interface VenueRecord {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category?: VenueCategory;
  subtitle: string | null;
  description: string;
  guest_capacity: number;
  amenities: string[];
  location: string | null;
  featured: boolean;
  sort_order: number;
  price_amount: number | null;
  price_currency: 'INR';
  price_type: 'fixed' | 'starting_from' | 'per_event' | 'per_plate' | 'contact_for_quote';
  price_note: string | null;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
  venue_media?: Array<{
    media_id: string;
    sort_order: number;
    role: 'cover' | 'gallery';
    media: MediaAsset;
  }>;
}

export interface VenueCategory {
  id: string;
  slug: string;
  name: string;
  homepage_section: 'reception-halls';
  is_active: boolean;
  sort_order: number;
}

export interface VenueViewModel {
  id: string;
  categorySlug: string;
  src: string;
  title: string;
  capacity: string;
  description: string;
  features: string[];
  gallery: string[];
  priceText?: string;
  priceNote?: string;
  status?: ContentStatus;
}

export interface CmsResult<T> {
  data: T;
  source: 'cms' | 'legacy';
}

export function mediaUrl(media: MediaAsset): string {
  if (media.provider === 'external') {
    return media.external_url ?? '';
  }
  if (media.state !== 'published' || !media.bucket || !media.object_path) {
    return '';
  }
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${media.bucket}/${media.object_path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}

export function portfolioToPublicItem(item: PortfolioRecord) {
  const media = [...(item.portfolio_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const cover = media.find((entry) => entry.role === 'cover')?.media ?? media[0]?.media;
  const src = cover ? mediaUrl(cover) : '';
  if (!src) return null;

  return {
    id: item.id,
    type: 'image' as const,
    src,
    title: item.title,
    description: item.description,
    category: item.category,
    location: item.location ?? undefined,
    date: item.event_date ?? item.event_label ?? undefined,
    guests: item.guest_capacity ?? undefined,
    likes: item.likes,
    views: item.views,
    duration: item.duration ?? undefined,
    budget: item.budget ?? undefined,
    tags: item.tags,
    awards: item.awards,
    photographer: item.photographer ?? undefined,
    socialWallRow: item.social_wall_row ?? undefined,
    socialWallSortOrder: item.social_wall_sort_order,
    gallery: media.map((entry) => mediaUrl(entry.media)).filter(Boolean),
  };
}

export function venueToPublicModel(venue: VenueRecord): VenueViewModel {
  const media = [...(venue.venue_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const cover = media.find((entry) => entry.role === 'cover')?.media ?? media[0]?.media;
  return {
    id: venue.id,
    categorySlug: venue.category?.slug ?? '',
    src: cover ? mediaUrl(cover) : '',
    title: venue.name,
    capacity: `Up to ${venue.guest_capacity} guests`,
    description: venue.description,
    features: venue.amenities,
    gallery: media.map((entry) => mediaUrl(entry.media)).filter(Boolean),
    priceText: formatVenuePrice(venue),
    priceNote: venue.price_note ?? undefined,
    status: venue.status,
  };
}

export function formatVenuePrice(venue: Pick<VenueRecord, 'price_amount' | 'price_currency' | 'price_type'>): string | undefined {
  if (venue.price_type === 'contact_for_quote') return 'Contact for quote';
  if (venue.price_amount === null || !Number.isFinite(Number(venue.price_amount))) return undefined;
  const amount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: venue.price_currency,
    maximumFractionDigits: 0,
  }).format(Number(venue.price_amount));
  if (venue.price_type === 'starting_from') return `Starting from ${amount}`;
  if (venue.price_type === 'per_event') return `${amount} per event`;
  if (venue.price_type === 'per_plate') return `${amount} per plate`;
  return amount;
}
