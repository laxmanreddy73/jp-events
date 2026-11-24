import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

export interface AdminContext {
  userId: string;
  email: string;
  accessToken: string;
  adminClient: SupabaseClient;
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  const configured = Deno.env.get('CMS_ALLOWED_ORIGINS')
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean) ?? ['http://localhost:5173', 'http://127.0.0.1:5173'];
  const allowedOrigin = origin && configured.includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '600',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
    ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin } : {}),
  };
}

export function reply(request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request) });
}

export function preflight(request: Request): Response | null {
  if (request.method !== 'OPTIONS') return null;
  const origin = request.headers.get('Origin');
  const allowed = corsHeaders(request)['Access-Control-Allow-Origin'];
  if (origin && allowed !== origin) return new Response('Origin not allowed', { status: 403 });
  return new Response('ok', { headers: corsHeaders(request) });
}

function decodeClaims(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Invalid bearer token.');
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
  if (!decoded || typeof decoded !== 'object') throw new Error('Invalid bearer token claims.');
  return decoded as Record<string, unknown>;
}

export async function requireAdmin(request: Request): Promise<AdminContext> {
  const authorization = request.headers.get('Authorization') ?? '';
  const accessToken = authorization.replace(/^Bearer\s+/i, '');
  if (!accessToken || accessToken === authorization) throw new Error('Authentication required.');

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) throw new Error('CMS server configuration is incomplete.');

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error } = await userClient.auth.getUser(accessToken);
  if (error || !userData.user) throw new Error('The admin session is invalid or expired.');
  if (!userData.user.email_confirmed_at) throw new Error('Verify the invited administrator email first.');
  if (userData.user.app_metadata?.cms_role !== 'admin') throw new Error('Administrator access is required.');

  const claims = decodeClaims(accessToken);
  if (claims.aal !== 'aal2') throw new Error('Complete administrator MFA verification first.');

  return {
    userId: userData.user.id,
    email: userData.user.email ?? '',
    accessToken,
    adminClient: createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}

export function errorResponse(request: Request, error: unknown): Response {
  const message = error instanceof Error ? error.message : 'Unexpected CMS operation failure.';
  const status =
    message.includes('Authentication required') || message.includes('bearer token') || message.includes('invalid or expired') ? 401
      : message.includes('administrator') || message.includes('Administrator') || message.includes('MFA') ? 403
        : message.includes('not found') ? 404
          : message.includes('referenced') || message.includes('grace period') ? 409
            : 400;
  return reply(request, { error: message }, status);
}
