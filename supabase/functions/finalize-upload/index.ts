import { errorResponse, preflight, reply, requireAdmin } from '../_shared/auth.ts';
import { verifyAndSanitizeImage } from '../_shared/images.ts';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== 'POST') return reply(request, { error: 'Method not allowed.' }, 405);

  try {
    const admin = await requireAdmin(request);
    const body = await request.json();
    const contentType = body?.contentType as string;
    const contentId = body?.contentId as string;
    const objectPath = body?.objectPath as string;
    const originalFilename = body?.originalFilename as string;
    if (!['portfolio', 'venue'].includes(contentType) || !uuidPattern.test(contentId ?? '')) {
      return reply(request, { error: 'Invalid content type or content ID.' }, 400);
    }
    if (typeof originalFilename !== 'string' || originalFilename.length > 255) {
      return reply(request, { error: 'Invalid original filename.' }, 400);
    }
    const safeName = originalFilename.split(/[\\/]/).pop()?.split('').filter((character) => character.charCodeAt(0) >= 0x20).join('').trim();
    if (!safeName) return reply(request, { error: 'Invalid original filename.' }, 400);

    const expectedFolder = contentType === 'portfolio' ? 'portfolio' : 'venues';
    const pathParts = typeof objectPath === 'string' ? objectPath.split('/') : [];
    if (
      pathParts.length !== 4 ||
      pathParts[0] !== expectedFolder ||
      pathParts[1] !== contentId ||
      pathParts[2] !== admin.userId ||
      !/^[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(pathParts[3])
    ) return reply(request, { error: 'The upload path is not authorized for this administrator.' }, 403);

    const table = contentType === 'portfolio' ? 'portfolio_items' : 'venues';
    const { data: content, error: contentError } = await admin.adminClient
      .from(table)
      .select('id')
      .eq('id', contentId)
      .maybeSingle();
    if (contentError) throw contentError;
    if (!content) return reply(request, { error: 'The draft content record does not exist.' }, 404);

    const storage = admin.adminClient.storage.from('cms-staging');
    const { data: file, error: downloadError } = await storage.download(objectPath);
    if (downloadError || !file) throw new Error('The staged image could not be read for verification.');
    const raw = new Uint8Array(await file.arrayBuffer());
    const extension = pathParts[3].split('.').pop()?.toLowerCase();
    const expectedMime = Object.entries(extensions).find(([, ext]) => ext === extension)?.[0];
    if (!expectedMime) return reply(request, { error: 'Unsupported image extension.' }, 400);

    const verified = await verifyAndSanitizeImage(raw, expectedMime);

    const { data: existingPath, error: existingPathError } = await admin.adminClient
      .from('media_assets')
      .select('*')
      .eq('provider', 'supabase')
      .eq('bucket', 'cms-staging')
      .eq('object_path', objectPath)
      .maybeSingle();
    if (existingPathError) throw existingPathError;
    if (existingPath) {
      if (existingPath.state === 'staging' && existingPath.checksum_sha256 === verified.sha256) {
        return reply(request, { media: existingPath, recovered: true });
      }
      return reply(request, { error: 'This upload path is already associated with a different or non-staging image.' }, 409);
    }

    const { data: existing, error: duplicateError } = await admin.adminClient
      .from('media_assets')
      .select('id')
      .eq('checksum_sha256', verified.sha256)
      .maybeSingle();
    if (duplicateError) throw duplicateError;
    if (existing) {
      await storage.remove([objectPath]);
      return reply(request, { error: 'This image is already managed. Select the existing image from the media library.' }, 409);
    }

    const { error: replaceError } = await storage.upload(objectPath, verified.bytes, {
      contentType: verified.mimeType,
      upsert: true,
      cacheControl: '0',
    });
    if (replaceError) throw new Error('The verified image could not be saved to private staging. Retry this upload to resume safely.');

    const { data: media, error: insertError } = await admin.adminClient
      .from('media_assets')
      .insert({
        provider: 'supabase',
        bucket: 'cms-staging',
        object_path: objectPath,
        original_filename: safeName,
        mime_type: verified.mimeType,
        byte_size: verified.bytes.byteLength,
        width: verified.width,
        height: verified.height,
        checksum_sha256: verified.sha256,
        alt_text: safeName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        state: 'staging',
        uploaded_by: admin.userId,
      })
      .select('*')
      .single();
    if (insertError) {
      const { data: recovered, error: recoveryError } = await admin.adminClient
        .from('media_assets')
        .select('*')
        .eq('provider', 'supabase')
        .eq('bucket', 'cms-staging')
        .eq('object_path', objectPath)
        .maybeSingle();
      if (recoveryError) throw recoveryError;
      if (recovered?.state === 'staging' && recovered.checksum_sha256 === verified.sha256) {
        return reply(request, { media: recovered, recovered: true });
      }
      throw insertError;
    }

    return reply(request, { media });
  } catch (error) {
    return errorResponse(request, error);
  }
});
