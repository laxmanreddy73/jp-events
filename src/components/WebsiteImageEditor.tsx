import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react';
import { Camera, Check, ImagePlus, Loader2, Pencil, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient, isCmsConfigured } from '../lib/supabaseClient';
import { fetchSiteImageSlots, replaceSiteImage, type SiteImageSlot } from '../services/siteImageSlots';
import { validateCmsImage } from '../services/mediaUploads';
import { ImageEditorContext, type ImageEditorContextValue, useWebsiteImageEditor } from '../contexts/websiteImageEditorContext';

interface ImageEditorProviderProps {
  children: ReactNode;
}

interface ImageDialogState {
  slotKey: string;
  currentSrc: string;
  altText: string;
}

async function verifyAdministrator(session: Session | null): Promise<void> {
  if (!session) throw new Error('Sign in to your administrator account first.');
  const client = getSupabaseClient();
  const { data: userData, error: userError } = await client.auth.getUser(session.access_token);
  if (userError) throw new Error(`Administrator verification failed: ${userError.message}`);
  if (userData.user?.app_metadata.cms_role !== 'admin') {
    throw new Error('This account is not authorized to edit website images.');
  }
  const { data: assurance, error: assuranceError } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError) throw new Error(`Administrator MFA verification failed: ${assuranceError.message}`);
  if (assurance.currentLevel !== 'aal2') throw new Error('Complete administrator MFA verification before editing website images.');
}

export function WebsiteImageEditorProvider({ children }: ImageEditorProviderProps) {
  const [editMode, setEditMode] = useState(false);
  const [slots, setSlots] = useState<Record<string, SiteImageSlot>>({});
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<ImageDialogState | null>(null);

  const refreshSlots = useCallback(async () => {
    if (!isCmsConfigured) return;
    try {
      const currentSlots = await fetchSiteImageSlots();
      setSlots(Object.fromEntries(currentSlots.map((slot) => [slot.slot_key, slot])));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Website image overrides could not be loaded.');
    }
  }, []);

  useEffect(() => {
    if (!isCmsConfigured) return undefined;
    let active = true;
    const client = getSupabaseClient();
    const verifySession = async (session: Session | null) => {
      if (!session) {
        setEditMode(false);
        return;
      }
      try {
        await verifyAdministrator(session);
      } catch {
        setEditMode(false);
      }
    };

    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError(`Could not check the administrator session: ${sessionError.message}`);
        return;
      }
      void verifySession(data.session);
    });
    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        setEditMode(false);
        setDialog(null);
      } else {
        queueMicrotask(() => { if (active) void verifySession(session); });
      }
    });
    void refreshSlots();
    const channel = client
      .channel('public-site-image-slots')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_image_slots' }, () => { void refreshSlots(); })
      .subscribe();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshSlots();
    };
    const refreshInterval = window.setInterval(refreshWhenVisible, 20_000);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      authListener.subscription.unsubscribe();
      void client.removeChannel(channel);
    };
  }, [refreshSlots]);

  const enableEditMode = useCallback(async () => {
    if (!isCmsConfigured) throw new Error('Configure Supabase before enabling website image editing.');
    const { data, error: sessionError } = await getSupabaseClient().auth.getSession();
    if (sessionError) throw new Error(`Could not read the administrator session: ${sessionError.message}`);
    await verifyAdministrator(data.session);
    await refreshSlots();
    setEditMode(true);
  }, [refreshSlots]);

  const disableEditMode = useCallback(() => {
    setEditMode(false);
    setDialog(null);
    setError(null);
  }, []);

  const openImageDialog = useCallback((slotKey: string, fallbackSrc: string, altText: string) => {
    if (editMode) setDialog({ slotKey, currentSrc: slots[slotKey]?.src ?? fallbackSrc, altText });
  }, [editMode, slots]);

  const saveImage = useCallback(async (
    slotKey: string,
    file: File,
    altText: string,
    onProgress: (progress: number) => void,
  ) => {
    try {
      const { slot, oldImageCleanupPending } = await replaceSiteImage(slotKey, file, altText, onProgress);
      setSlots((current) => ({ ...current, [slotKey]: slot }));
      setError(null);
      await refreshSlots();
      return oldImageCleanupPending;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'The image could not be saved.';
      setError(message);
      throw new Error(message);
    }
  }, [refreshSlots]);

  const contextValue = useMemo<ImageEditorContextValue>(() => ({
    editMode,
    slots,
    error,
    enableEditMode,
    disableEditMode,
    openImageDialog,
    saveImage,
  }), [editMode, slots, error, enableEditMode, disableEditMode, openImageDialog, saveImage]);

  return (
    <ImageEditorContext.Provider value={contextValue}>
      {children}
      {editMode && (
        <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full border border-rose-200 bg-white/95 px-4 py-2.5 text-sm text-[#382832] shadow-xl backdrop-blur">
          <span className="flex items-center gap-2 font-medium"><Pencil className="h-4 w-4 text-rose-700" /> Image editing on</span>
          <button type="button" onClick={disableEditMode} className="rounded-full bg-[#5D273C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#382832]">
            Done
          </button>
        </div>
      )}
      {editMode && error && (
        <div className="fixed bottom-20 left-1/2 z-[100] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-800 shadow-lg" role="alert">
          {error}
        </div>
      )}
      {dialog && (
        <ImageReplacementDialog
          key={dialog.slotKey}
          dialog={dialog}
          currentSrc={slots[dialog.slotKey]?.src ?? dialog.currentSrc}
          close={() => setDialog(null)}
          saveImage={saveImage}
        />
      )}
    </ImageEditorContext.Provider>
  );
}

interface EditableImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  slotKey: string;
}

export function EditableImage({ slotKey, alt = '', src = '', ...imageProps }: EditableImageProps) {
  const { editMode, slots, openImageDialog } = useWebsiteImageEditor();
  const override = slots[slotKey];
  const imageSrc = override?.src ?? src;

  return (
    <>
      <img {...imageProps} src={imageSrc} alt={override?.alt_text || alt} />
      {editMode && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            openImageDialog(slotKey, imageSrc, override?.alt_text || alt);
          }}
          className="group/image-edit absolute inset-0 z-[60] flex cursor-pointer items-center justify-center bg-black/0 transition-colors hover:bg-black/20 focus-visible:bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white"
          aria-label={`Change image: ${override?.alt_text || alt || slotKey}`}
          title="Change image"
        >
          <span className="flex items-center gap-2 rounded-full border border-white/60 bg-black/55 px-4 py-2.5 text-sm font-semibold text-white opacity-100 shadow-lg backdrop-blur transition sm:opacity-0 sm:group-hover/image-edit:opacity-100 sm:group-focus-visible/image-edit:opacity-100">
            <Camera className="h-4 w-4" />
            Change image
          </span>
        </button>
      )}
    </>
  );
}

interface ImageReplacementDialogProps {
  dialog: ImageDialogState;
  currentSrc: string;
  close: () => void;
  saveImage: ImageEditorContextValue['saveImage'];
}

function ImageReplacementDialog({ dialog, currentSrc, close, saveImage }: ImageReplacementDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState(dialog.altText);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cleanupPending, setCleanupPending] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [busy, close]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const selectFile = async (nextFile: File | undefined) => {
    if (!nextFile) return;
    setError(null);
    setSuccess(false);
    try {
      const validated = await validateCmsImage(nextFile);
      const expectedExtension = `.${validated.extension}`;
      const filename = nextFile.name.toLowerCase();
      if (!(filename.endsWith(expectedExtension) || (validated.extension === 'jpg' && filename.endsWith('.jpeg')))) {
        throw new Error(`Use a file with the ${validated.extension === 'jpg' ? 'JPG/JPEG' : validated.extension.toUpperCase()} extension.`);
      }
      setFile(nextFile);
    } catch (cause) {
      setFile(null);
      setError(cause instanceof Error ? cause.message : 'This image could not be validated.');
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void selectFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    void selectFile(event.dataTransfer.files[0]);
  };

  const save = async () => {
    if (!file) return;
    setBusy(true);
    setProgress(0);
    setError(null);
    try {
      const needsCleanup = await saveImage(dialog.slotKey, file, altText, setProgress);
      setCleanupPending(needsCleanup);
      setSuccess(true);
      setFile(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The image could not be saved.');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-[#1d1118]/65 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) close();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="image-editor-title" className="my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-rose-100 px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Website image editor</p>
            <h2 id="image-editor-title" className="mt-1 font-serif text-2xl font-semibold text-[#382832]">Replace photograph</h2>
            <p className="mt-1 break-all text-xs text-gray-500">{dialog.slotKey}</p>
          </div>
          <button type="button" disabled={busy} onClick={close} className="rounded-full p-2 text-gray-500 hover:bg-rose-50 hover:text-[#382832] disabled:opacity-50" aria-label="Close image editor">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[#382832]">Current image</h3>
            <div className="h-48 overflow-hidden rounded-2xl bg-rose-50 sm:h-56">
              <img src={currentSrc} alt="Current website image" className="h-full w-full object-cover" />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[#382832]">New image preview</h3>
            <div className="h-48 overflow-hidden rounded-2xl bg-rose-50 sm:h-56">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview of replacement image" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-rose-800/70">
                  <ImagePlus className="h-8 w-8" />
                  Your preview will appear here
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-6 sm:px-7">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex min-h-24 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-4 text-center transition ${
              dragging ? 'border-rose-600 bg-rose-100' : 'border-rose-200 bg-[#fffafb] hover:border-rose-400 hover:bg-rose-50'
            }`}
          >
            <ImagePlus className="mb-1 h-5 w-5 text-rose-700" />
            <span className="text-sm font-semibold text-[#5D273C]">{file ? file.name : 'Choose an image or drag it here'}</span>
            <span className="mt-1 text-xs text-gray-500">JPG, PNG or WebP · photos up to 40 MB are optimized before upload</span>
          </button>
          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" className="sr-only" onChange={onFileChange} />

          <label className="block text-sm font-medium text-[#382832]">
            Image description (alt text)
            <input maxLength={500} value={altText} onChange={(event) => setAltText(event.target.value)} className="mt-1.5 w-full rounded-xl border border-rose-200 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
          </label>

          {progress !== null && (
            <div className="space-y-1" role="status" aria-live="polite">
              <div className="flex justify-between text-xs text-gray-600"><span>Uploading and saving image…</span><span>{progress}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-rose-700 transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
          )}
          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{error}</p>}
          {success && (
            <p className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${cleanupPending ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`} role="status">
              <Check className="h-4 w-4" />
              {cleanupPending
                ? 'Image replaced and the page updated. The previous image still needs safe cleanup.'
                : 'Image replaced successfully. The page has been updated.'}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button type="button" disabled={busy} onClick={close} className="rounded-full border border-rose-200 px-5 py-3 text-sm font-semibold text-[#5D273C] hover:bg-rose-50 disabled:opacity-50">
              {success ? 'Close' : 'Cancel'}
            </button>
            {!success && (
              <button type="button" disabled={!file || busy} onClick={() => void save()} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5D273C] px-6 py-3 text-sm font-semibold text-white hover:bg-[#382832] disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Replace image
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
