import { createContext, useContext } from 'react';
import type { SiteImageSlot } from '../services/siteImageSlots';

export interface ImageEditorContextValue {
  editMode: boolean;
  slots: Record<string, SiteImageSlot>;
  error: string | null;
  enableEditMode: () => Promise<void>;
  disableEditMode: () => void;
  openImageDialog: (slotKey: string, fallbackSrc: string, altText: string) => void;
  saveImage: (slotKey: string, file: File, altText: string, onProgress: (progress: number) => void) => Promise<boolean>;
}

export const ImageEditorContext = createContext<ImageEditorContextValue | null>(null);

export function useWebsiteImageEditor(): ImageEditorContextValue {
  const context = useContext(ImageEditorContext);
  if (!context) throw new Error('useWebsiteImageEditor must be used inside WebsiteImageEditorProvider.');
  return context;
}
