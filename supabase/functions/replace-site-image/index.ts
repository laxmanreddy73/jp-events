import { errorResponse, preflight, reply, requireAdmin } from '../_shared/auth.ts';
import { verifyAndSanitizeImage } from '../_shared/images.ts';

const staticSlotPattern = /^home\.(?:hero\.slide-0[1-3]|services\.(?:reception|ceremony|haldi-mehendi|sangeet)|about\.(?:story-01|story-02|story-03)|experiences\.featured)$/;
const serviceCategoryPattern = /^services\.(?:planning|photography|videography|entertainment|decor|catering|preWedding|traditions|bridal)$/;
const momentsSlotPattern = /^home\.moments\.portfolio-[a-z0-9-]{1,80}$/i;
const venueSlotPattern = /^venues\.([0-9a-f-]{36})\.cover$/i;

function slotSection(slotKey: string): string {
  const parts = slotKey.split('.');
  return parts.slice(0, 2).join('.');
}

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== 'POST') return reply(request, { error: 'Method not allowed.' }, 405);

  try {
    const admin = await requireAdmin(request);
    const form = await request.formData();
    const slotKey = form.get('slotKey');
    const altText = form.get('altText');
    const file = form.get('file');
    if (typeof slotKey !== 'string' || typeof altText !== 'string' || !(file instanceof File)) {
      return reply(request, { error: 'Choose an approved image slot and a file.' }, 400);
    }
    if (altText.trim().length > 500) return reply(request, { error: 'Alt text must be 500 characters or fewer.' }, 400);

    const venueMatch = slotKey.match(venueSlotPattern);
    const isAllowedSlot = staticSlotPattern.test(slotKey) || serviceCategoryPattern.test(slotKey) ||
      momentsSlotPattern.test(slotKey) || Boolean(venueMatch);
    if (!isAllowedSlot) return reply(request, { error: 'This image slot is not approved for editing.' }, 403);
    if (venueMatch) {
      const { data: venue, error: venueError } = await admin.adminClient
        .from('venues')
        .select('id')
        .eq('id', venueMatch[1])
        .maybeSingle();
      if (venueError) throw venueError;
      if (!venue) return reply(request, { error: 'The reception hall no longer exists.' }, 404);
    }
    if (momentsSlotPattern.test(slotKey)) {
      const portfolioId = slotKey.slice('home.moments.portfolio-'.length);
      const { data: portfolioItem, error: portfolioError } = await admin.adminClient
        .from('portfolio_items')
        .select('id')
        .eq('id', portfolioId)
        .eq('status', 'published')
        .maybeSingle();
      if (portfolioError) throw portfolioError;
      if (!portfolioItem) return reply(request, { error: 'This portfolio image is no longer published.' }, 404);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const verified = await verifyAndSanitizeImage(bytes);
    const extension = verified.mimeType === 'image/jpeg' ? 'jpg' : verified.mimeType === 'image/png' ? 'png' : 'webp';
    const filename = file.name.toLowerCase();
    if (!(filename.endsWith(`.${extension}`) || (extension === 'jpg' && filename.endsWith('.jpeg')))) {
      return reply(request, { error: 'The file extension does not match the verified image format.' }, 400);
    }
    const folder = slotSection(slotKey).replaceAll('.', '/');
    const objectPath = `site-content/${folder}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await admin.adminClient.storage
      .from('jp-events-media')
      .upload(objectPath, verified.bytes, {
        contentType: verified.mimeType,
        cacheControl: '31536000',
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data: previous, error: previousError } = await admin.adminClient
      .from('site_image_slots')
      .select('storage_path')
      .eq('slot_key', slotKey)
      .maybeSingle();
    if (previousError) {
      await admin.adminClient.storage.from('jp-events-media').remove([objectPath]);
      throw previousError;
    }

    const { error: saveError } = await admin.adminClient
      .from('site_image_slots')
      .upsert({
        slot_key: slotKey,
        section_key: slotSection(slotKey),
        storage_path: objectPath,
        mime_type: verified.mimeType,
        byte_size: verified.bytes.byteLength,
        width: verified.width,
        height: verified.height,
        alt_text: altText.trim(),
        is_active: true,
        updated_by: admin.userId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slot_key' });
    if (saveError) {
      await admin.adminClient.storage.from('jp-events-media').remove([objectPath]);
      throw saveError;
    }

    let oldImageCleanupPending = false;
    const oldPath = previous?.storage_path;
    if (oldPath && oldPath !== objectPath && oldPath.startsWith('site-content/')) {
      try {
        const [slotReference, mediaReference] = await Promise.all([
          admin.adminClient.from('site_image_slots').select('slot_key').eq('storage_path', oldPath).limit(1),
          admin.adminClient.from('media_assets').select('id').eq('bucket', 'jp-events-media').eq('object_path', oldPath).limit(1),
        ]);
        if (slotReference.error || mediaReference.error) throw new Error('Could not verify old image references.');
        if (!slotReference.data?.length && !mediaReference.data?.length) {
          const { error: removeError } = await admin.adminClient.storage.from('jp-events-media').remove([oldPath]);
          if (removeError) oldImageCleanupPending = true;
        }
      } catch {
        oldImageCleanupPending = true;
        console.error('Old website image cleanup is pending after a successful replacement.');
      }
    }

    return reply(request, {
      slot: {
        slot_key: slotKey,
        section_key: slotSection(slotKey),
        storage_path: objectPath,
        mime_type: verified.mimeType,
        byte_size: verified.bytes.byteLength,
        width: verified.width,
        height: verified.height,
        alt_text: altText.trim(),
        is_active: true,
      },
      oldImageCleanupPending,
    });
  } catch (error) {
    return errorResponse(request, error);
  }
});
