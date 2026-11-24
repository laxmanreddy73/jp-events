import { errorResponse, preflight, reply, requireAdmin } from '../_shared/auth.ts';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== 'POST') return reply(request, { error: 'Method not allowed.' }, 405);

  try {
    const admin = await requireAdmin(request);
    const { mediaId } = await request.json();
    if (!uuidPattern.test(mediaId ?? '')) return reply(request, { error: 'Invalid media ID.' }, 400);

    const { data: media, error: mediaError } = await admin.adminClient
      .from('media_assets').select('id,provider,state').eq('id', mediaId).maybeSingle();
    if (mediaError) throw mediaError;
    if (!media) return reply(request, { error: 'Media not found.' }, 404);
    if (media.provider !== 'supabase') {
      return reply(request, { error: 'External images are not deleted by this site.' }, 409);
    }

    const [portfolio, venues] = await Promise.all([
      admin.adminClient.from('portfolio_media').select('portfolio_id').eq('media_id', mediaId).limit(1),
      admin.adminClient.from('venue_media').select('venue_id').eq('media_id', mediaId).limit(1),
    ]);
    if (portfolio.error) throw portfolio.error;
    if (venues.error) throw venues.error;
    if (portfolio.data?.length || venues.data?.length) {
      return reply(request, { error: 'This image is still attached to content. Remove its gallery references first.' }, 409);
    }
    if (media.state === 'cleanup_pending') {
      return reply(request, { error: 'This image is already queued for delayed cleanup.' }, 409);
    }

    const { error: updateError } = await admin.adminClient
      .from('media_assets')
      .update({ state: 'cleanup_pending', updated_at: new Date().toISOString() })
      .eq('id', mediaId);
    if (updateError) throw updateError;
    return reply(request, { status: 'cleanup_pending', gracePeriodDays: 7 });
  } catch (error) {
    return errorResponse(request, error);
  }
});
