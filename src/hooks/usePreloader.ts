import { useState, useEffect, useRef } from 'react';

interface UsePreloaderOptions {
  images?: string[];
  videos?: string[];
  criticalImages?: string[]; // Images that should load first
  minLoadingTime?: number;
  maxLoadingTime?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  enableProgressiveLoading?: boolean;
  lazyLoadThreshold?: number; // Percentage after which non-critical assets can be lazy loaded
}

interface PreloadAsset {
  src: string;
  type: 'image' | 'video' | 'critical-image';
  loaded: boolean;
  error: boolean;
}

export const usePreloader = (options: UsePreloaderOptions = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadedAssets, setLoadedAssets] = useState<PreloadAsset[]>([]);
  const [failedAssets, setFailedAssets] = useState<PreloadAsset[]>([]);
  
  const assetsRef = useRef<PreloadAsset[]>([]);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const {
    images = [],
    videos = [],
    criticalImages = [],
    minLoadingTime = 1000, // Reduced for better UX
    maxLoadingTime = 5000, // Maximum loading time before timeout
    onProgress,
    onComplete,
    enableProgressiveLoading = true,
    lazyLoadThreshold = 70, // Start lazy loading after 70% progress
  } = options;

  // Optimize image URLs for wedding business
  const optimizeImageUrl = (src: string, quality: 'high' | 'medium' | 'low' = 'medium'): string => {
    if (!src) return src;

    const qualities = {
      high: 'q_80,f_auto,w_1200',
      medium: 'q_70,f_auto,w_800',
      low: 'q_50,f_auto,w_400'
    };

    // Cloudinary optimization
    if (src.includes('cloudinary')) {
      return src.replace('/upload/', `/upload/${qualities[quality]}/`);
    }

    // ImageKit optimization
    if (src.includes('ik.imagekit.io')) {
      const params = quality === 'high' ? 'tr=w-1200,q-80' : 
                    quality === 'medium' ? 'tr=w-800,q-70' : 'tr=w-400,q-50';
      return src.includes('?') ? `${src}&${params}` : `${src}?${params}`;
    }

    return src;
  };

  // Initialize assets
  useEffect(() => {
    const allAssets: PreloadAsset[] = [
      // Critical images first (hero images, logos, etc.)
      ...criticalImages.map(src => ({
        src: optimizeImageUrl(src, 'high'),
        type: 'critical-image' as const,
        loaded: false,
        error: false
      })),
      // Regular images with medium quality
      ...images.map(src => ({
        src: optimizeImageUrl(src, 'medium'),
        type: 'image' as const,
        loaded: false,
        error: false
      })),
      // Videos - only metadata
      ...videos.map(src => ({
        src,
        type: 'video' as const,
        loaded: false,
        error: false
      }))
    ];

    assetsRef.current = allAssets;
    startTimeRef.current = Date.now();
  }, [images, videos, criticalImages]);

  const updateAssetStatus = (src: string, loaded: boolean, error: boolean = false) => {
    const assetIndex = assetsRef.current.findIndex(asset => asset.src === src);
    if (assetIndex !== -1) {
      assetsRef.current[assetIndex] = {
        ...assetsRef.current[assetIndex],
        loaded,
        error
      };

      const loadedCount = assetsRef.current.filter(asset => asset.loaded).length;
      const totalCount = assetsRef.current.length;
      const newProgress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 100;

      setProgress(newProgress);
      setLoadedAssets(assetsRef.current.filter(asset => asset.loaded));
      setFailedAssets(assetsRef.current.filter(asset => asset.error));

      // Call progress callback
      onProgress?.(newProgress);

      // Check if all assets are loaded or we've reached lazy load threshold
      if (loadedCount === totalCount || 
          (enableProgressiveLoading && newProgress >= lazyLoadThreshold)) {
        completeLoading();
      }
    }
  };

  const completeLoading = () => {
    const elapsedTime = Date.now() - startTimeRef.current;
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set maximum loading time timeout
    const maxTimeout = setTimeout(() => {
      console.warn('[Preloader] Maximum loading time reached, forcing completion');
      forceComplete();
    }, maxLoadingTime);

    // Normal completion
    timeoutRef.current = setTimeout(() => {
      clearTimeout(maxTimeout);
      setIsLoading(false);
      onComplete?.();
      
      // Preload remaining assets in background if progressive loading is enabled
      if (enableProgressiveLoading && progress < 100) {
        preloadRemainingAssets();
      }
    }, remainingTime);
  };

  const forceComplete = () => {
    setIsLoading(false);
    onComplete?.();
  };

  const preloadRemainingAssets = () => {
    const remainingAssets = assetsRef.current.filter(asset => !asset.loaded && !asset.error);
    
    remainingAssets.forEach(asset => {
      if (asset.type === 'image' || asset.type === 'critical-image') {
        const img = new Image();
        img.onload = () => updateAssetStatus(asset.src, true);
        img.onerror = () => updateAssetStatus(asset.src, false, true);
        img.src = asset.src;
      } else if (asset.type === 'video') {
        const video = document.createElement('video');
        video.onloadedmetadata = () => updateAssetStatus(asset.src, true);
        video.onerror = () => updateAssetStatus(asset.src, false, true);
        video.src = asset.src;
        video.preload = 'metadata';
      }
    });
  };

  const preloadAsset = (src: string, type: 'image' | 'video' = 'image') => {
    return new Promise<boolean>((resolve) => {
      if (type === 'image') {
        const img = new Image();
        img.onload = () => {
          updateAssetStatus(src, true);
          resolve(true);
        };
        img.onerror = () => {
          updateAssetStatus(src, false, true);
          resolve(false);
        };
        img.src = optimizeImageUrl(src, 'medium');
      } else {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          updateAssetStatus(src, true);
          resolve(true);
        };
        video.onerror = () => {
          updateAssetStatus(src, false, true);
          resolve(false);
        };
        video.src = src;
        video.preload = 'metadata';
      }
    });
  };

  useEffect(() => {
    // Start preloading critical assets immediately
    const criticalAssets = assetsRef.current.filter(asset => 
      asset.type === 'critical-image'
    );

    const nonCriticalAssets = assetsRef.current.filter(asset => 
      asset.type !== 'critical-image'
    );

    // Preload critical assets first
    criticalAssets.forEach(asset => {
      preloadAsset(asset.src, asset.type === 'video' ? 'video' : 'image');
    });

    // Preload non-critical assets with a small delay to prioritize critical ones
    setTimeout(() => {
      nonCriticalAssets.forEach(asset => {
        preloadAsset(asset.src, asset.type === 'video' ? 'video' : 'image');
      });
    }, 100);

    // Force completion if no assets after a short time
    if (assetsRef.current.length === 0) {
      setTimeout(() => {
        setIsLoading(false);
        onComplete?.();
      }, minLoadingTime);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Wedding business specific preloading strategies
  const preloadWeddingGallery = (galleryImages: string[]) => {
    galleryImages.forEach((src, index) => {
      // Stagger loading to prevent network congestion
      setTimeout(() => {
        preloadAsset(src, 'image');
      }, index * 100); // 100ms delay between each image
    });
  };

  const preloadVenueImages = (venueImages: string[]) => {
    // Venue images are important but not critical, load with medium priority
    venueImages.forEach((src, index) => {
      setTimeout(() => {
        preloadAsset(optimizeImageUrl(src, 'medium'), 'image');
      }, index * 150);
    });
  };

  return {
    isLoading,
    progress,
    loadedAssets,
    failedAssets,
    totalAssets: assetsRef.current.length,
    forceComplete,
    preloadAsset,
    preloadWeddingGallery,
    preloadVenueImages,
    // Utility functions for wedding business
    getLoadedCount: () => loadedAssets.length,
    getFailedCount: () => failedAssets.length,
    isCriticalContentLoaded: () => {
      const criticalAssets = assetsRef.current.filter(asset => 
        asset.type === 'critical-image'
      );
      return criticalAssets.every(asset => asset.loaded) || criticalAssets.length === 0;
    },
    // Retry failed assets
    retryFailedAssets: () => {
      failedAssets.forEach(asset => {
        preloadAsset(asset.src, asset.type === 'video' ? 'video' : 'image');
      });
    }
  };
};

// Default export with common wedding business configurations
export const useWeddingPreloader = (options: UsePreloaderOptions = {}) => {
  return usePreloader({
    minLoadingTime: 800, // Even faster for wedding sites
    maxLoadingTime: 4000,
    enableProgressiveLoading: true,
    lazyLoadThreshold: 60, // Start showing content earlier
    ...options
  });
};

export default usePreloader;