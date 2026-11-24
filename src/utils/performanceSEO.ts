/**
 * Performance SEO optimization utilities for wedding business
 * Enhanced image optimization, critical CSS, font loading, and resource hints
 */

interface ImageOptimizationOptions {
  widths?: number[];
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  aspectRatio?: string;
  crop?: string;
  gravity?: string;
}

interface ResourceHint {
  rel: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch' | 'modulepreload';
  href: string;
  as?: string;
  type?: string;
  crossOrigin?: string;
  media?: string;
}

interface WeddingImageContext {
  type: 'hero' | 'portfolio' | 'gallery' | 'service' | 'testimonial' | 'venue';
  weddingStyle?: string;
  venue?: string;
  priority?: boolean;
}

/**
 * Generate responsive image srcset with wedding optimizations
 * @param {string} imagePath - Base image path
 * @param {ImageOptimizationOptions} options - Optimization options
 * @returns {string} Srcset string
 * @example
 * const srcset = generateSrcset('/images/wedding-hero.jpg', {
 *   widths: [320, 640, 1024, 1600, 2000],
 *   format: 'webp',
 *   quality: 85
 * });
 */
export function generateSrcset(
  imagePath: string, 
  options: ImageOptimizationOptions = {}
): string {
  const {
    widths = [320, 640, 768, 1024, 1366, 1600, 1920, 2000],
    quality = 80
  } = options;

  const basePath = imagePath.replace(/\.[^.]+$/, '');

  return widths
    .map(size => {
      const params = new URLSearchParams();
      params.append('w', size.toString());
      params.append('q', quality.toString());
      
      if (options.aspectRatio) params.append('ar', options.aspectRatio);
      if (options.crop) params.append('c', options.crop);
      if (options.gravity) params.append('g', options.gravity);
      
      // Wedding-specific optimizations
      params.append('fit', 'crop');
      params.append('auto', 'format,compress');
      
      return `${basePath}?${params.toString()} ${size}w`;
    })
    .join(', ');
}

/**
 * Get sizes attribute for responsive wedding images
 * @param {Object} breakpoints - Breakpoint configuration
 * @param {string} context - Image context (hero, portfolio, etc.)
 * @returns {string} Sizes attribute string
 * @example
 * const sizes = getSizesAttribute({
 *   mobile: '100vw',
 *   tablet: '80vw',
 *   desktop: '60vw'
 * }, 'portfolio');
 */
export function getSizesAttribute(
  breakpoints: Record<string, string> = {},
  context: string = 'gallery'
): string {
  const defaultBreakpoints = {
    hero: {
      mobile: '100vw',
      tablet: '(min-width: 768px) 100vw',
      desktop: '(min-width: 1024px) 100vw'
    },
    portfolio: {
      mobile: '100vw',
      tablet: '(min-width: 768px) 50vw',
      desktop: '(min-width: 1024px) 33vw'
    },
    gallery: {
      mobile: '100vw',
      tablet: '(min-width: 768px) 50vw',
      desktop: '(min-width: 1024px) 25vw'
    },
    service: {
      mobile: '100vw',
      tablet: '(min-width: 768px) 60vw',
      desktop: '(min-width: 1024px) 40vw'
    },
    testimonial: {
      mobile: '80vw',
      tablet: '(min-width: 768px) 300px',
      desktop: '(min-width: 1024px) 400px'
    }
  };

  const contextBreakpoints = defaultBreakpoints[context] || defaultBreakpoints.gallery;
  const merged = { ...contextBreakpoints, ...breakpoints };
  
  return Object.entries(merged)
    .map(([breakpoint, size]) => 
      breakpoint === 'mobile' ? size : `${breakpoint} ${size}`
    )
    .join(', ');
}

/**
 * Detect modern image format support with wedding priorities
 * @returns {Object} Format support {webp: boolean, avif: boolean, jpegxl: boolean}
 */
export function detectImageFormats(): { webp: boolean; avif: boolean; jpegxl: boolean } {
  if (typeof document === 'undefined') {
    return { webp: true, avif: false, jpegxl: false };
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return { webp: false, avif: false, jpegxl: false };
  }

  return {
    webp: canvas.toDataURL?.('image/webp').includes('image/webp') ?? false,
    avif: canvas.toDataURL?.('image/avif').includes('image/avif') ?? false,
    jpegxl: canvas.toDataURL?.('image/jxl').includes('image/jxl') ?? false
  };
}

/**
 * Generate optimized blur-up placeholder for wedding images
 * @param {string} imagePath - Path to image
 * @param {number} blurAmount - Blur intensity (default: 15)
 * @param {WeddingImageContext} context - Wedding image context
 * @returns {Promise<string>} Base64 blur image
 */
export async function generateBlurPlaceholder(
  imagePath: string, 
  blurAmount: number = 15,
  context: WeddingImageContext = { type: 'gallery' }
): Promise<string> {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Calculate dimensions based on context
        const maxDimension = context.type === 'hero' ? 20 : 10;
        const ratio = img.width / img.height;
        
        if (ratio > 1) {
          canvas.width = maxDimension;
          canvas.height = Math.round(maxDimension / ratio);
        } else {
          canvas.height = maxDimension;
          canvas.width = Math.round(maxDimension * ratio);
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw and blur the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Apply blur effect
        if (blurAmount > 0) {
          ctx.filter = `blur(${blurAmount}px)`;
          ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        }

        // Wedding-specific: Add subtle overlay for better text readability
        if (context.type === 'hero') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
      
      img.onerror = () => {
        // Fallback to wedding-themed gradient
        resolve(generateWeddingGradientPlaceholder(context));
      };
      
      img.src = imagePath;
    });
  } catch (error) {
    console.warn('[Wedding SEO] Blur placeholder generation failed:', error);
    return generateWeddingGradientPlaceholder(context);
  }
}

/**
 * Generate wedding-themed gradient placeholder
 * @param {WeddingImageContext} context - Wedding image context
 * @returns {string} Base64 gradient image
 */
function generateWeddingGradientPlaceholder(context: WeddingImageContext): string {
  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';

  const gradients = {
    hero: ['#8B4513', '#D2691E', '#F4A460'], // Brown to tan
    portfolio: ['#4B0082', '#8A2BE2', '#9370DB'], // Purple theme
    gallery: ['#800020', '#B22222', '#DC143C'], // Burgundy theme
    service: ['#2F4F4F', '#708090', '#C0C0C0'], // Silver theme
    testimonial: ['#E8A0B8', '#C6537A', '#FFF1F5'],
    venue: ['#006400', '#228B22', '#32CD32'] // Green theme
  };

  const colors = gradients[context.type] || gradients.gallery;
  const gradient = ctx.createLinearGradient(0, 0, 10, 10);
  
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 10, 10);

  return canvas.toDataURL();
}

/**
 * Generate SEO-friendly alt text for wedding images
 * @param {string} filename - Image filename
 * @param {WeddingImageContext} context - Wedding context
 * @returns {string} Generated alt text
 * @example
 * generateAltText('south-indian-wedding-ceremony-001.jpg', {
 *   type: 'portfolio',
 *   weddingStyle: 'South Indian',
 *   venue: 'Taj West End'
 * });
 * // Returns: "South Indian wedding ceremony at Taj West End - JP Events"
 */
export function generateAltText(
  filename: string, 
  context: WeddingImageContext = { type: 'gallery' }
): string {
  // Extract base name and clean it
  const baseName = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\d+\b/g, '')
    .trim();

  // Context-based prefixes
  const contextPrefixes = {
    hero: 'Luxury Wedding Planning - ',
    portfolio: 'Wedding Portfolio - ',
    gallery: 'Wedding Gallery - ',
    service: 'Wedding Service - ',
    testimonial: 'Client Wedding - ',
    venue: 'Wedding Venue - '
  };

  const prefix = contextPrefixes[context.type] || '';
  const styleSuffix = context.weddingStyle ? ` ${context.weddingStyle} Wedding` : '';
  const venueSuffix = context.venue ? ` at ${context.venue}` : '';
  
  return `${prefix}${baseName}${styleSuffix}${venueSuffix} | JP Events`;
}

/**
 * Get optimized font loading strategy for wedding website
 * @param {string} strategy - Loading strategy
 * @param {boolean} isCritical - Whether font is critical for above-fold
 * @returns {string} Font-display CSS
 */
export function getFontDisplayStrategy(
  strategy: 'swap' | 'fallback' | 'optional' | 'block' = 'swap',
  isCritical: boolean = false
): string {
  const strategies = {
    swap: `font-display: swap; ${isCritical ? 'font-display: block; font-display: swap;' : ''}`,
    fallback: 'font-display: fallback;',
    optional: 'font-display: optional;',
    block: 'font-display: block;'
  };

  return strategies[strategy] || strategies.swap;
}

/**
 * Generate comprehensive resource hints for wedding website
 * @param {Object} config - Resource configuration
 * @returns {ResourceHint[]} Array of resource hint objects
 */
export function generateResourceHints(config: {
  preloadFonts?: Array<{ href: string; type?: string }>;
  prefetchPages?: string[];
  preconnectDomains?: string[];
  dnsPrefetch?: string[];
  modulePreload?: string[];
  weddingResources?: boolean;
} = {}): ResourceHint[] {
  const hints: ResourceHint[] = [];

  // Preload critical wedding fonts
  if (config.preloadFonts) {
    config.preloadFonts.forEach(font => {
      hints.push({
        rel: 'preload',
        href: font.href,
        as: 'font',
        type: font.type || 'font/woff2',
        crossOrigin: 'anonymous'
      });
    });
  }

  // Prefetch likely wedding-related pages
  if (config.prefetchPages) {
    config.prefetchPages.forEach(page => {
      hints.push({
        rel: 'prefetch',
        href: page
      });
    });
  }

  // Preconnect to external wedding service domains
  if (config.preconnectDomains) {
    config.preconnectDomains.forEach(domain => {
      hints.push({
        rel: 'preconnect',
        href: domain,
        crossOrigin: 'anonymous'
      });
    });
  }

  // DNS prefetch for analytics and third-party services
  if (config.dnsPrefetch) {
    config.dnsPrefetch.forEach(domain => {
      hints.push({
        rel: 'dns-prefetch',
        href: domain
      });
    });
  }

  // Module preload for critical JavaScript
  if (config.modulePreload) {
    config.modulePreload.forEach(module => {
      hints.push({
        rel: 'modulepreload',
        href: module
      });
    });
  }

  // Wedding-specific resource hints
  if (config.weddingResources) {
    hints.push(
      {
        rel: 'preload',
        href: '/images/wedding-hero.jpg',
        as: 'image',
        media: '(min-width: 1024px)'
      },
      {
        rel: 'preload',
        href: '/images/wedding-hero-mobile.jpg',
        as: 'image',
        media: '(max-width: 1023px)'
      }
    );
  }

  return hints;
}

/**
 * Calculate image optimization impact for wedding website
 * @param {Array} images - Array of image objects
 * @param {boolean} includeModernFormats - Include AVIF/WebP savings
 * @returns {Object} Optimization stats
 */
export function calculateOptimizationImpact(
  images: Array<{ src: string; size: number; context?: string }>,
  includeModernFormats: boolean = true
): {
  totalSize: number;
  estimatedOptimizedSize: number;
  potentialSavings: number;
  percentageSavings: string;
  recommendations: string[];
} {
  const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
  
  // Wedding-specific optimization factors
  const optimizationFactors = {
    webp: 0.25, // 25% savings with WebP
    avif: 0.40, // 40% savings with AVIF
    compression: 0.15, // 15% savings with compression
    responsive: 0.20, // 20% savings with responsive images
    lazyLoading: 0.30 // 30% savings with lazy loading
  };

  const formatSavings = includeModernFormats ? optimizationFactors.avif : optimizationFactors.webp;
  const totalSavings = formatSavings + optimizationFactors.compression + optimizationFactors.responsive;
  
  const estimatedOptimizedSize = totalSize * (1 - totalSavings);
  const potentialSavings = totalSize - estimatedOptimizedSize;
  const percentageSavings = ((potentialSavings / totalSize) * 100).toFixed(2);

  // Generate recommendations based on image context
  const recommendations: string[] = [];
  
  images.forEach(img => {
    if (img.context === 'hero' && img.size > 500000) {
      recommendations.push(`Optimize hero image: ${img.src} (${(img.size / 1024).toFixed(0)}KB)`);
    }
    if (img.context === 'portfolio' && img.size > 300000) {
      recommendations.push(`Compress portfolio image: ${img.src}`);
    }
  });

  if (percentageSavings > '50') {
    recommendations.push('Consider implementing AVIF format for additional savings');
  }

  return {
    totalSize,
    estimatedOptimizedSize,
    potentialSavings,
    percentageSavings,
    recommendations
  };
}

/**
 * Generate wedding-specific image optimization configuration
 * @param {WeddingImageContext} context - Image context
 * @returns {ImageOptimizationOptions} Optimization options
 */
export function getWeddingImageOptimizationConfig(
  context: WeddingImageContext
): ImageOptimizationOptions {
  const configs = {
    hero: {
      widths: [320, 640, 768, 1024, 1366, 1600, 1920, 2000],
      quality: 85,
      format: 'webp' as const,
      aspectRatio: '16:9',
      crop: 'fill',
      gravity: 'auto'
    },
    portfolio: {
      widths: [320, 640, 768, 1024, 1366, 1600],
      quality: 80,
      format: 'webp' as const,
      aspectRatio: '4:3',
      crop: 'fill',
      gravity: 'faces'
    },
    gallery: {
      widths: [320, 640, 768, 1024, 1366],
      quality: 75,
      format: 'webp' as const,
      aspectRatio: '1:1',
      crop: 'fill',
      gravity: 'auto'
    },
    service: {
      widths: [320, 640, 768, 1024],
      quality: 80,
      format: 'webp' as const,
      aspectRatio: '3:2',
      crop: 'fill',
      gravity: 'auto'
    }
  };

  return configs[context.type] || configs.gallery;
}

/**
 * Check if image should be prioritized based on wedding context
 * @param {WeddingImageContext} context - Image context
 * @param {number} position - Position in layout
 * @returns {boolean} Whether to prioritize
 */
export function shouldPrioritizeImage(
  context: WeddingImageContext,
  position: number = 0
): boolean {
  const priorityContexts = ['hero', 'service'];
  const priorityPositions = [0, 1, 2]; // First few images
  
  return priorityContexts.includes(context.type) || priorityPositions.includes(position);
}

export default {
  generateSrcset,
  getSizesAttribute,
  detectImageFormats,
  generateBlurPlaceholder,
  generateAltText,
  getFontDisplayStrategy,
  generateResourceHints,
  calculateOptimizationImpact,
  getWeddingImageOptimizationConfig,
  shouldPrioritizeImage
};
