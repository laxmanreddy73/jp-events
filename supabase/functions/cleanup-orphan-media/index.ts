import { errorResponse, preflight, reply, requireAdmin } from '../_shared/auth.ts';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const gracePeriodMs = 7 * 24 * 60 * 60 * 1000;

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== 'POST') return reply(request, { error: 'Method not allowed.' }, 405);

  try {
    const admin = await requireAdmin(request);
    const { mediaId } = await request.json();
    if (!uuidPattern.test(mediaId ?? '')) return reply(request, { error: 'Invalid media ID.' }, 400);

    const { data: media, error: mediaError } = await admin.adminClient
      .from('media_assets')
      .select('id,provider,bucket,object_path,state,updated_at')
      .eq('id', mediaId)
      .maybeSingle();
    if (mediaError) throw mediaError;
    if (!media) return reply(request, { error: 'Media not found.' }, 404);
    if (media.provider !== 'supabase') return reply(request, { error: 'External images cannot be deleted here.' }, 409);
    if (media.state !== 'cleanup_pending') return reply(request, { error: 'Request image cleanup before permanent deletion.' }, 409);
    if (Date.now() - new Date(media.updated_at).getTime() < gracePeriodMs) {
      return reply(request, { error: 'The seven-day image cleanup grace period has not elapsed.' }, 409);
    }

    const [portfolio, venues] = await Promise.all([
      admin.adminClient.from('portfolio_media').select('portfolio_id').eq('media_id', mediaId).limit(1),
      admin.adminClient.from('venue_media').select('venue_id').eq('media_id', mediaId).limit(1),
    ]);
    if (portfolio.error) throw portfolio.error;
    if (venues.error) throw venues.error;
    if (portfolio.data?.length || venues.data?.length) {
      return reply(request, { error: 'This image is still referenced by content and was not deleted.' }, 409);
    }

    if (media.bucket && media.object_path) {
      const { error: removeError } = await admin.adminClient.storage.from(media.bucket).remove([media.object_path]);
      if (removeError && !/not found|does not exist/i.test(removeError.message)) throw removeError;
    }
    const { error: updateError } = await admin.adminClient
      .from('media_assets')
      .update({ state: 'deleted', bucket: null, object_path: null })
      .eq('id', mediaId);
    if (updateError) throw updateError;
    return reply(request, { status: 'deleted', id: mediaId });
  } catch (error) {
    return errorResponse(request, error);
  }
});
