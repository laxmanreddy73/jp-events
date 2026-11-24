import { createClient } from 'npm:@supabase/supabase-js@2';
import { errorResponse, preflight, reply, requireAdmin } from '../_shared/auth.ts';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== 'POST') return reply(request, { error: 'Method not allowed.' }, 405);

  try {
    const admin = await requireAdmin(request);
    const { contentType, contentId } = await request.json();
    if (!['portfolio', 'venue'].includes(contentType) || !uuidPattern.test(contentId ?? '')) {
      return reply(request, { error: 'Invalid content type or content ID.' }, 400);
    }

    const relation = contentType === 'portfolio' ? 'portfolio_media' : 'venue_media';
    const foreignKey = contentType === 'portfolio' ? 'portfolio_id' : 'venue_id';
    const table = contentType === 'portfolio' ? 'portfolio_items' : 'venues';
    const { data: content, error: contentError } = await admin.adminClient
      .from(table).select('id,status').eq('id', contentId).maybeSingle();
    if (contentError) throw contentError;
    if (!content) return reply(request, { error: 'Content not found.' }, 404);

    const { data: links, error: linksError } = await admin.adminClient
      .from(relation)
      .select('media_id,role,sort_order,media:media_assets(*)')
      .eq(foreignKey, contentId)
      .order('sort_order', { ascending: true });
    if (linksError) throw linksError;
    const mediaLinks = links ?? [];
    if (mediaLinks.filter((entry) => entry.role === 'cover').length !== 1 || mediaLinks.length === 0) {
      return reply(request, { error: 'Choose exactly one cover image before publishing.' }, 400);
    }

    for (const link of mediaLinks) {
      const media = Array.isArray(link.media) ? link.media[0] : link.media;
      if (!media || media.state === 'deleted' || media.state === 'cleanup_pending') {
        return reply(request, { error: 'A gallery image is unavailable or queued for deletion.' }, 409);
      }
      if (media.provider === 'external') continue;
      if (media.state === 'published' && media.bucket === 'jp-events-media') continue;
      if (media.state !== 'staging' || media.bucket !== 'cms-staging' || !media.object_path) {
        return reply(request, { error: 'A gallery image has not passed upload verification.' }, 400);
      }

      const extension = media.object_path.split('.').pop()?.toLowerCase();
      if (!['jpg', 'png', 'webp'].includes(extension ?? '')) {
        return reply(request, { error: 'Unsupported managed image format.' }, 400);
      }
      const publishedPath = `${contentType === 'portfolio' ? 'portfolio' : 'venues'}/${contentId}/${media.id}.${extension}`;
      const { error: copyError } = await admin.adminClient.storage
        .from('cms-staging')
        .copy(media.object_path, publishedPath, { destinationBucket: 'jp-events-media' });
      if (copyError && !/already exists|duplicate/i.test(copyError.message)) {
        throw new Error('A verified image could not be promoted to public storage.');
      }

      const { error: updateError } = await admin.adminClient
        .from('media_assets')
        .update({
          bucket: 'jp-events-media',
          object_path: publishedPath,
          state: 'published',
        })
        .eq('id', media.id);
      if (updateError) throw updateError;

      const { error: removeStagingError } = await admin.adminClient.storage
        .from('cms-staging')
        .remove([media.object_path]);
      if (removeStagingError) console.error('CMS staging cleanup pending for media ID:', media.id);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
    if (!supabaseUrl || !anonKey) throw new Error('CMS server configuration is incomplete.');
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${admin.accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: publishError } = await userClient.rpc('cms_publish_content', {
      p_content_type: contentType,
      p_content_id: contentId,
    });
    if (publishError) throw publishError;

    return reply(request, { status: 'published', id: contentId });
  } catch (error) {
    return errorResponse(request, error);
  }
});
