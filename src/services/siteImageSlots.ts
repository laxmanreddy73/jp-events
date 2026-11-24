import { getSupabaseClient } from '../lib/supabaseClient';
import { compressCmsImage, validateCmsImage } from './mediaUploads';

export const SITE_IMAGE_BUCKET = 'jp-events-media';

export interface SiteImageSlot {
  id?: string;
  slot_key: string;
  section_key: string;
  storage_path: string;
  mime_type: 'image/jpeg' | 'image/png' | 'image/webp';
  byte_size: number;
  width: number;
  height: number;
  alt_text: string;
  object_position: string;
  is_active: boolean;
  updated_at?: string;
  src: string;
}

interface ReplaceImageResponse {
  slot?: Omit<SiteImageSlot, 'src'>;
  oldImageCleanupPending?: boolean;
  error?: string;
}

export async function fetchSiteImageSlots(): Promise<SiteImageSlot[]> {
  const { data, error } = await getSupabaseClient()
    .from('site_image_slots')
    .select('id,slot_key,section_key,storage_path,mime_type,byte_size,width,height,alt_text,object_position,is_active,updated_at')
    .eq('is_active', true);
  if (error) throw new Error(`Website image overrides could not be loaded: ${error.message}`);

  return (data ?? []).map((slot) => ({
    ...slot,
    src: getSupabaseClient().storage.from(SITE_IMAGE_BUCKET).getPublicUrl(slot.storage_path).data.publicUrl,
  }));
}

export async function replaceSiteImage(
  slotKey: string,
  file: File,
  altText: string,
  onProgress?: (progress: number) => void,
): Promise<{ slot: SiteImageSlot; oldImageCleanupPending: boolean }> {
  const originalFilename = file.name;
  const optimizedFile = await compressCmsImage(file);
  await validateCmsImage(optimizedFile, { maxBytes: 10 * 1024 * 1024 });
  const client = getSupabaseClient();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  const session = sessionData.session;
  if (!session) throw new Error('Your administrator session has expired. Sign in again.');

  const form = new FormData();
  form.append('slotKey', slotKey);
  form.append('altText', altText.trim());
  form.append('originalFilename', originalFilename);
  form.append('file', optimizedFile, optimizedFile.name);

  const result = await new Promise<ReplaceImageResponse>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/replace-site-image`);
    request.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    request.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error('Network error while replacing the image.'));
    request.onload = () => {
      let response: ReplaceImageResponse;
      try {
        response = JSON.parse(request.responseText) as ReplaceImageResponse;
      } catch {
        reject(new Error(`Image replacement returned an invalid response (${request.status}).`));
        return;
      }
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(response.error ?? `Image replacement failed (${request.status}).`));
        return;
      }
      resolve(response);
    };
    request.send(form);
  });

  if (!result.slot) throw new Error('Image replacement completed without a saved slot.');
  return {
    slot: {
      ...result.slot,
      src: client.storage.from(SITE_IMAGE_BUCKET).getPublicUrl(result.slot.storage_path).data.publicUrl,
    },
    oldImageCleanupPending: Boolean(result.oldImageCleanupPending),
  };
}
