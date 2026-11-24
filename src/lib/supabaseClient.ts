import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isCmsConfigured = Boolean(supabaseUrl && supabasePublishableKey);
export const isCmsPartiallyConfigured = Boolean(supabaseUrl || supabasePublishableKey) && !isCmsConfigured;
export const isCmsEnabled = isCmsConfigured || isCmsPartiallyConfigured;

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabasePublishableKey) {
    const missing = [
      !supabaseUrl && 'VITE_SUPABASE_URL',
      !supabasePublishableKey && 'VITE_SUPABASE_PUBLISHABLE_KEY',
    ].filter(Boolean);
    throw new Error(`Supabase CMS configuration is incomplete. Set ${missing.join(' and ')}.`);
  }
  if (!client) {
    client = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true,
      },
    });
  }
  return client;
}
