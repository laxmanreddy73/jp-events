import { getSupabaseClient } from '../lib/supabaseClient';
import type { CmsContentType, MediaAsset } from '../types/cms';

const maxUploadBytes = 10 * 1024 * 1024;
const maxSourceBytes = 40 * 1024 * 1024;
const maxDimension = 6000;
const maxPixels = 36_000_000;
const maxPublishedEdge = 2400;
const supportedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

function detectImageType(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return 'image/png';
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  ) return 'image/webp';
  return null;
}

export async function validateCmsImage(
  file: File,
  options: { maxBytes?: number } = {},
): Promise<{ mimeType: string; extension: string; width: number; height: number }> {
  const byteLimit = options.maxBytes ?? maxSourceBytes;
  if (file.size <= 0 || file.size > byteLimit) {
    throw new Error(`Images must be between 1 byte and ${Math.round(byteLimit / 1024 / 1024)} MiB.`);
  }
  const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const mimeType = detectImageType(header);
  if (!mimeType || !supportedTypes.has(mimeType)) {
    throw new Error('Only verified JPEG, PNG, and WebP images are supported. SVG and AVIF are not accepted.');
  }
  if (file.type && file.type !== mimeType) {
    throw new Error('The file extension or browser media type does not match the image contents.');
  }
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  if (width <= 0 || height <= 0 || width > maxDimension || height > maxDimension || width * height > maxPixels) {
    throw new Error('Image dimensions exceed the 6,000 px per side / 36 megapixel limit.');
  }
  return { mimeType, extension: supportedTypes.get(mimeType)!, width, height };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('The browser could not optimize this image.'));
      else resolve(blob);
    }, 'image/webp', quality);
  });
}

/** Compresses a locally selected photo before it reaches Supabase Storage. */
export async function compressCmsImage(file: File): Promise<File> {
  const source = await validateCmsImage(file);
  const bitmap = await createImageBitmap(file);
  const sourceMaxEdge = Math.max(source.width, source.height);
  let scale = Math.min(1, maxPublishedEdge / sourceMaxEdge);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) {
    bitmap.close();
    throw new Error('Image optimization is not available in this browser.');
  }

  try {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const quality = Math.max(0.58, 0.84 - attempt * 0.045);
      const blob = await canvasToBlob(canvas, quality);
      const extension = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/png' ? 'png' : 'webp';
      if (supportedTypes.has(blob.type) && blob.size <= maxUploadBytes) {
        const nameWithoutExtension = file.name.replace(/\.[^.]+$/, '') || 'image';
        return new File([blob], `${nameWithoutExtension}.${extension}`, {
          type: blob.type,
          lastModified: file.lastModified,
        });
      }

      scale *= 0.82;
    }
  } finally {
    bitmap.close();
    canvas.width = 1;
    canvas.height = 1;
  }

  throw new Error('This image is too large to optimize below the 10 MiB upload limit. Choose a smaller image.');
}

function uploadWithProgress(
  bucket: string,
  objectPath: string,
  file: File,
  mimeType: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    void getSupabaseClient().auth.getSession().then(({ data, error }) => {
      const accessToken = data.session?.access_token;
      if (error || !accessToken) {
        reject(new Error(error?.message ?? 'Your admin session has expired. Sign in again.'));
        return;
      }

      const xhr = new XMLHttpRequest();
      const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
      xhr.open('POST', `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${encodedPath}`);
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
      xhr.setRequestHeader('Content-Type', mimeType);
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onerror = () => reject(new Error('Network error while uploading the image.'));
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else if (xhr.status === 409 || /already exists|duplicate/i.test(xhr.responseText)) {
          reject(new Error('CMS_UPLOAD_OBJECT_EXISTS'));
        }
        else reject(new Error(`Image upload failed (${xhr.status}): ${xhr.responseText.slice(0, 300)}`));
      };
      xhr.send(file);
    }).catch((error: unknown) => reject(error instanceof Error ? error : new Error('Could not read the admin session.')));
  });
}

async function imageFingerprint(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function pendingUploadPath(key: string, expectedPrefix: string, extension: string): { path: string; clear: () => void } {
  const storageKey = `jp-cms-pending:${key}`;
  const isValid = (path: string | null): path is string => Boolean(
    path && path.startsWith(expectedPrefix) && new RegExp(`[0-9a-f-]{36}\\.${extension}$`, 'i').test(path),
  );
  let path: string | null = null;
  try {
    path = sessionStorage.getItem(storageKey);
  } catch {
    // Upload still works when browser storage is unavailable; retry may use a new path.
  }
  if (!isValid(path)) {
    path = `${expectedPrefix}${crypto.randomUUID()}.${extension}`;
    try {
      sessionStorage.setItem(storageKey, path);
    } catch {
      // Keep the in-memory path for this attempt.
    }
  }
  return {
    path,
    clear: () => {
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        // Nothing else is needed; the server already committed the media record.
      }
    },
  };
}

export async function uploadCmsImage(
  file: File,
  contentType: CmsContentType,
  contentId: string,
  onProgress?: (progress: number) => void,
): Promise<MediaAsset> {
  const originalFilename = file.name;
  const optimizedFile = await compressCmsImage(file);
  const { mimeType, extension } = await validateCmsImage(optimizedFile, { maxBytes: maxUploadBytes });
  const { data: sessionData, error: sessionError } = await getSupabaseClient().auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error('Your admin session has expired. Sign in again.');

  const folder = contentType === 'venue' ? 'venues' : 'portfolio';
  const fingerprint = await imageFingerprint(optimizedFile);
  const upload = pendingUploadPath(
    `${userId}:${contentType}:${contentId}:${fingerprint}`,
    `${folder}/${contentId}/${userId}/`,
    extension,
  );
  try {
    await uploadWithProgress('cms-staging', upload.path, optimizedFile, mimeType, onProgress);
  } catch (cause) {
    if (!(cause instanceof Error) || cause.message !== 'CMS_UPLOAD_OBJECT_EXISTS') throw cause;
    // A previous attempt may have uploaded the complete immutable object before the network failed.
    // Finalization verifies its bytes and returns the already-registered media row when safe.
  }

  const { data: refreshedSession, error: refreshError } = await getSupabaseClient().auth.getSession();
  if (refreshError) throw new Error(refreshError.message);
  const accessToken = refreshedSession.session?.access_token;
  if (!accessToken) throw new Error('Your admin session has expired. Sign in again.');

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/finalize-upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bucket: 'cms-staging',
      objectPath: upload.path,
      contentType,
      contentId,
      originalFilename,
    }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 409) upload.clear();
    throw new Error(result?.error ?? `Image verification failed (${response.status}).`);
  }
  upload.clear();
  const media = result?.media as Partial<MediaAsset> | undefined;
  if (!media || typeof media.id !== 'string' || typeof media.state !== 'string' || typeof media.mime_type !== 'string') {
    throw new Error('Image verification returned an invalid media record.');
  }
  return media as MediaAsset;
}
