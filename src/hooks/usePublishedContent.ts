import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient, isCmsConfigured, isCmsEnabled, isCmsPartiallyConfigured } from '../lib/supabaseClient';
import { fetchPublishedPortfolio, fetchPublishedVenues } from '../services/cmsRepository';
import { legacyVenues, type LegacyPortfolioItem } from '../data/legacyCmsData';
import { portfolioToPublicItem, venueToPublicModel, type VenueViewModel } from '../types/cms';

const cacheDurationMs = 30_000;
let portfolioCache: { at: number; items: ReturnType<typeof portfolioToPublicItem>[] } | null = null;
let venueCache: { at: number; items: ReturnType<typeof venueToPublicModel>[] } | null = null;
type PortfolioFallback = Omit<LegacyPortfolioItem, 'id'> & { id: string | number };
type PublicPortfolioItem = PortfolioFallback & { gallery?: string[] };
export function invalidateCmsPublicCache(): void {
  portfolioCache = null;
  venueCache = null;
  void refreshVenueStore();
}

export function usePublishedPortfolio(fallback: PortfolioFallback[]) {
  const fallbackRef = useRef(fallback);
  const [items, setItems] = useState<PublicPortfolioItem[]>(() => {
    if (isCmsConfigured) return portfolioCache?.items.filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? [];
    return isCmsEnabled ? [] : fallbackRef.current;
  });
  const [source, setSource] = useState<'cms' | 'legacy'>(isCmsEnabled ? 'cms' : 'legacy');
  const [loading, setLoading] = useState(isCmsConfigured);
  const [error, setError] = useState<string | null>(isCmsPartiallyConfigured ? 'CMS configuration is incomplete. Set both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.' : null);

  useEffect(() => {
    if (isCmsPartiallyConfigured) {
      setItems([]);
      setLoading(false);
      setError('CMS configuration is incomplete. Set both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
      return;
    }
    if (!isCmsConfigured) {
      if (!isCmsPartiallyConfigured) {
        setItems(fallbackRef.current);
        setSource('legacy');
      }
      setLoading(false);
      return;
    }

    let active = true;
    if (portfolioCache && Date.now() - portfolioCache.at < cacheDurationMs) {
      setItems(portfolioCache.items.filter((item): item is NonNullable<typeof item> => Boolean(item)));
        setSource('cms');
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
    }

    fetchPublishedPortfolio()
      .then((records) => {
        if (!active) return;
        const mapped = records.map(portfolioToPublicItem).filter((item): item is NonNullable<typeof item> => Boolean(item));
        portfolioCache = { at: Date.now(), items: mapped };
        setItems(mapped);
        setSource('cms');
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        const message = cause instanceof Error ? cause.message : 'Published portfolio content could not be loaded.';
        if (portfolioCache) {
          setItems(portfolioCache.items.filter((item): item is NonNullable<typeof item> => Boolean(item)));
          setSource('cms');
        } else {
          setItems(fallbackRef.current);
          setSource('legacy');
        }
        setError(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return { items, loading, error, source };
}

interface VenueStoreSnapshot {
  items: VenueViewModel[];
  source: 'cms' | 'legacy';
  loading: boolean;
  error: string | null;
}

let venueStore: VenueStoreSnapshot = {
  items: isCmsConfigured
    ? venueCache?.items ?? []
    : isCmsEnabled ? [] : legacyVenues.map((venue) => ({ ...venue, categorySlug: 'reception-halls' })),
  source: isCmsEnabled ? 'cms' : 'legacy',
  loading: isCmsConfigured,
  error: isCmsPartiallyConfigured
    ? 'CMS configuration is incomplete. Set both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    : null,
};
const venueListeners = new Set<() => void>();
let venueRefresh: Promise<void> | null = null;
let venuePoll: ReturnType<typeof setInterval> | null = null;
let venueChannel: RealtimeChannel | null = null;

function updateVenueStore(next: VenueStoreSnapshot): void {
  venueStore = next;
  venueListeners.forEach((listener) => listener());
}

async function refreshVenueStore(): Promise<void> {
  if (!isCmsConfigured) return;
  if (venueRefresh) return venueRefresh;
  updateVenueStore({ ...venueStore, loading: true, error: null });
  venueRefresh = fetchPublishedVenues()
    .then((records) => {
      const mapped = records
        .filter((record) => record.category?.homepage_section === 'reception-halls' && record.category.is_active)
        .map(venueToPublicModel)
        .filter((venue) => Boolean(venue.src));
      venueCache = { at: Date.now(), items: mapped };
      updateVenueStore({ items: mapped, source: 'cms', loading: false, error: null });
    })
    .catch((cause: unknown) => {
      const message = cause instanceof Error ? cause.message : 'Published venue content could not be loaded.';
      updateVenueStore({
        items: venueCache?.items ?? legacyVenues.map((venue) => ({ ...venue, categorySlug: 'reception-halls' })),
        source: venueCache ? 'cms' : 'legacy',
        loading: false,
        error: message,
      });
    })
    .finally(() => {
      venueRefresh = null;
    });
  return venueRefresh;
}

function subscribeToVenueStore(listener: () => void): () => void {
  venueListeners.add(listener);
  if (venueListeners.size === 1 && isCmsConfigured) {
    if (venueCache && Date.now() - venueCache.at < cacheDurationMs) {
      updateVenueStore({ items: venueCache.items, source: 'cms', loading: false, error: null });
    }
    void refreshVenueStore();
    const client = getSupabaseClient();
    venueChannel = client
      .channel('public-venue-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'venues' }, () => { void refreshVenueStore(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'venue_media' }, () => { void refreshVenueStore(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_assets' }, () => { void refreshVenueStore(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'venue_categories' }, () => { void refreshVenueStore(); })
      .subscribe();
    venuePoll = setInterval(() => { void refreshVenueStore(); }, 20_000);
    document.addEventListener('visibilitychange', refreshOnVisible);
  }
  return () => {
    venueListeners.delete(listener);
    if (venueListeners.size === 0) {
      if (venuePoll) clearInterval(venuePoll);
      venuePoll = null;
      document.removeEventListener('visibilitychange', refreshOnVisible);
      if (venueChannel) void getSupabaseClient().removeChannel(venueChannel);
      venueChannel = null;
    }
  };
}

function refreshOnVisible(): void {
  if (document.visibilityState === 'visible') void refreshVenueStore();
}

export function usePublishedVenues() {
  const snapshot = useSyncExternalStore(subscribeToVenueStore, () => venueStore, () => venueStore);
  return snapshot;
}
