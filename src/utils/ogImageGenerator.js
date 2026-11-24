/**
 * Dynamic Open Graph Image Generation for Wedding Business
 * Generates wedding-themed OG images for social media sharing with multiple templates
 */

// Wedding business configuration
const WEDDING_CONFIG = {
  businessName: 'JP Events',
  contact: '+919533950636',
  email: 'jpevents@gmail.com',
  website: 'https://subadesignsanddecoration.com',
  foundingYear: '2010'
};

/**
 * Generate dynamic wedding-themed OG image URL
 * @param {Object} config - Image configuration
 * @param {string} config.title - Page title
 * @param {string} config.description - Short description
 * @param {string} config.template - Template type: 'wedding', 'service', 'portfolio', 'testimonial', 'venue', 'default'
 * @param {string} config.author - Author name (optional)
 * @param {string} config.date - Publication date (optional)
 * @param {string} config.image - Background image URL (optional)
 * @param {string} config.venue - Wedding venue name (optional)
 * @param {string} config.weddingType - Type of wedding: 'hindu', 'christian', 'muslim', 'sikh', 'interfaith' (optional)
 * @param {string} config.colorScheme - Color scheme: 'romantic', 'traditional', 'modern', 'luxury' (optional)
 * @param {string} config.featuredService - Featured service name (optional)
 * @param {string} config.coupleNames - Bride & groom names (optional)
 * @param {string} config.eventDate - Wedding event date (optional)
 * @returns {string} OG image URL
 * @example
 * const ogUrl = generateOGImage({
 *   title: 'Elegant Hindu Wedding Planning',
 *   description: 'Complete wedding planning services for traditional Hindu ceremonies',
 *   template: 'wedding',
 *   weddingType: 'hindu',
 *   venue: 'Taj West End, Hyderabad',
 *   colorScheme: 'traditional'
 * });
 */
export function generateOGImage(config = {}) {
  const {
    title = 'JP Events - Wedding Planners',
    description = 'Creating magical wedding experiences since 2010',
    template = 'wedding',
    author = '',
    date = '',
    image = '',
    venue = '',
    weddingType = '',
    colorScheme = 'romantic',
    featuredService = '',
    coupleNames = '',
    eventDate = '',
    baseUrl = process.env.VITE_OG_IMAGE_BASE_URL || '/api/og-image'
  } = config;

  const params = new URLSearchParams({
    title: title.substring(0, 80),
    description: description.substring(0, 150),
    template,
    businessName: WEDDING_CONFIG.businessName,
    contact: WEDDING_CONFIG.contact,
    ...(author && { author }),
    ...(date && { date }),
    ...(image && { image }),
    ...(venue && { venue: venue.substring(0, 50) }),
    ...(weddingType && { weddingType }),
    ...(colorScheme && { colorScheme }),
    ...(featuredService && { service: featuredService.substring(0, 40) }),
    ...(coupleNames && { couple: coupleNames.substring(0, 60) }),
    ...(eventDate && { eventDate })
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Get wedding-themed template configuration
 * @param {string} template - Template type
 * @param {string} colorScheme - Color scheme variant
 * @returns {Object} Template configuration
 */
export function getTemplateConfig(template, colorScheme = 'romantic') {
  const colorSchemes = {
    romantic: {
      primary: '#E8A0B8',
      secondary: '#F4C6D5',
      accent: '#C6537A',
      text: '#382832',
      background: 'linear-gradient(135deg, #FFF1F5 0%, #FFFAFC 100%)'
    },
    traditional: {
      primary: '#A63F63',
      secondary: '#F4C6D5',
      accent: '#C6537A',
      text: '#382832',
      background: 'linear-gradient(135deg, #FFF1F5 0%, #FFFAFC 100%)'
    },
    modern: {
      primary: '#E8A0B8',
      secondary: '#F4C6D5',
      accent: '#C6537A',
      text: '#382832',
      background: 'linear-gradient(135deg, #FFFAFC 0%, #FFF1F5 100%)'
    },
    luxury: {
      primary: '#382832',
      secondary: '#E8A0B8',
      accent: '#C6537A',
      text: '#FFFAFC',
      background: 'linear-gradient(135deg, #382832 0%, #5D273C 100%)'
    }
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.romantic;

  const configs = {
    wedding: {
      background: colors.background,
      textColor: colors.text,
      accentColor: colors.accent,
      fontSize: { title: '52px', description: '24px', metadata: '18px' },
      fontFamily: { title: 'Playfair Display', body: 'Montserrat' },
      layout: 'centered',
      showBranding: true,
      showContact: true,
      pattern: 'floral'
    },
    service: {
      background: 'linear-gradient(135deg, #C6537A 0%, #A63F63 100%)',
      textColor: '#ffffff',
      accentColor: '#F4C6D5',
      fontSize: { title: '48px', description: '22px', metadata: '16px' },
      fontFamily: { title: 'Cormorant Garamond', body: 'Roboto' },
      layout: 'left-aligned',
      showBranding: true,
      showContact: false,
      pattern: 'minimal'
    },
    portfolio: {
      background: 'linear-gradient(to bottom, #C6537A, #A63F63)',
      textColor: '#ffffff',
      accentColor: '#F4C6D5',
      fontSize: { title: '46px', description: '20px', metadata: '16px' },
      fontFamily: { title: 'Merriweather', body: 'Open Sans' },
      layout: 'image-focused',
      showBranding: true,
      showContact: true,
      pattern: 'elegant'
    },
    testimonial: {
      background: 'linear-gradient(135deg, #FFF1F5 0%, #F4C6D5 100%)',
      textColor: '#382832',
      accentColor: '#A63F63',
      fontSize: { title: '44px', description: '20px', metadata: '16px' },
      fontFamily: { title: 'Dancing Script', body: 'Lora' },
      layout: 'centered',
      showBranding: false,
      showContact: false,
      pattern: 'classic'
    },
    venue: {
      background: 'linear-gradient(135deg, #C6537A 0%, #A63F63 100%)',
      textColor: '#ffffff',
      accentColor: '#F4C6D5',
      fontSize: { title: '50px', description: '22px', metadata: '18px' },
      fontFamily: { title: 'Playfair Display', body: 'Montserrat' },
      layout: 'right-aligned',
      showBranding: true,
      showContact: true,
      pattern: 'geometric'
    },
    default: {
      background: colors.background,
      textColor: colors.text,
      accentColor: colors.accent,
      fontSize: { title: '48px', description: '22px', metadata: '16px' },
      fontFamily: { title: 'Roboto', body: 'Roboto' },
      layout: 'centered',
      showBranding: true,
      showContact: true,
      pattern: 'simple'
    }
  };

  return { ...configs[template] || configs.default, colors };
}

/**
 * Validate wedding OG image configuration
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validateOGConfig(config) {
  const errors = [];

  if (!config.title || typeof config.title !== 'string') {
    errors.push('Title is required and must be a string');
  }

  if (config.title.length > 100) {
    errors.push('Title must be less than 100 characters for optimal display');
  }

  if (config.title.length < 5) {
    errors.push('Title must be at least 5 characters long');
  }

  if (config.description && config.description.length > 200) {
    errors.push('Description must be less than 200 characters');
  }

  const validTemplates = ['wedding', 'service', 'portfolio', 'testimonial', 'venue', 'default'];
  if (config.template && !validTemplates.includes(config.template)) {
    errors.push(`Template must be one of: ${validTemplates.join(', ')}`);
  }

  const validColorSchemes = ['romantic', 'traditional', 'modern', 'luxury'];
  if (config.colorScheme && !validColorSchemes.includes(config.colorScheme)) {
    errors.push(`Color scheme must be one of: ${validColorSchemes.join(', ')}`);
  }

  const validWeddingTypes = ['hindu', 'christian', 'muslim', 'sikh', 'interfaith', ''];
  if (config.weddingType && !validWeddingTypes.includes(config.weddingType)) {
    errors.push(`Wedding type must be one of: ${validWeddingTypes.filter(Boolean).join(', ')}`);
  }

  if (config.venue && config.venue.length > 80) {
    errors.push('Venue name must be less than 80 characters');
  }

  if (config.coupleNames && config.coupleNames.length > 100) {
    errors.push('Couple names must be less than 100 characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Cache OG image generation results with wedding-specific optimization
 * @param {string} key - Cache key
 * @param {string} value - OG image URL
 * @param {number} ttl - Time to live in seconds (default: 86400 = 24 hours)
 */
export function cacheOGImage(key, value, ttl = 86400) {
  try {
    const cacheData = {
      value,
      expiresAt: Date.now() + ttl * 1000,
      business: WEDDING_CONFIG.businessName,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`wedding-og-${key}`, JSON.stringify(cacheData));
  } catch (e) {
    console.warn('[Wedding OG] Image caching failed:', e.message);
    // Fallback to session storage
    try {
      sessionStorage.setItem(`wedding-og-${key}`, value);
    } catch (fallbackError) {
      console.warn('[Wedding OG] Session storage fallback also failed');
    }
  }
}

/**
 * Get cached OG image with wedding business context
 * @param {string} key - Cache key
 * @returns {string|null} Cached OG image URL or null if expired/missing
 */
export function getCachedOGImage(key) {
  try {
    const cached = localStorage.getItem(`wedding-og-${key}`);
    if (!cached) return null;

    const { value, expiresAt, business } = JSON.parse(cached);
    
    // Check if expired
    if (Date.now() > expiresAt) {
      localStorage.removeItem(`wedding-og-${key}`);
      return null;
    }

    // Verify it's from our business (basic integrity check)
    if (business !== WEDDING_CONFIG.businessName) {
      localStorage.removeItem(`wedding-og-${key}`);
      return null;
    }

    return value;
  } catch (e) {
    console.warn('[Wedding OG] Cache retrieval failed:', e.message);
    
    // Try session storage fallback
    try {
      return sessionStorage.getItem(`wedding-og-${key}`);
    } catch {
      return null;
    }
  }
}

/**
 * Generate multiple OG image variations for A/B testing
 * @param {Object} baseConfig - Base configuration
 * @returns {Object} Multiple OG image variations
 */
export function generateOGImageVariations(baseConfig) {
  const variations = {
    romantic: {
      ...baseConfig,
      colorScheme: 'romantic',
      template: baseConfig.template
    },
    traditional: {
      ...baseConfig,
      colorScheme: 'traditional',
      template: baseConfig.template
    },
    luxury: {
      ...baseConfig,
      colorScheme: 'luxury',
      template: baseConfig.template
    },
    modern: {
      ...baseConfig,
      colorScheme: 'modern',
      template: baseConfig.template
    }
  };

  const results = {};
  for (const [variant, config] of Object.entries(variations)) {
    results[variant] = generateOGImage(config);
  }

  return results;
}

/**
 * Generate OG image for specific wedding service
 * @param {string} serviceName - Name of the wedding service
 * @param {string} description - Service description
 * @returns {string} OG image URL
 */
export function generateServiceOGImage(serviceName, description = '') {
  return generateOGImage({
    title: `${serviceName} Services`,
    description: description || `Professional ${serviceName.toLowerCase()} for your dream wedding`,
    template: 'service',
    featuredService: serviceName,
    colorScheme: 'luxury'
  });
}

/**
 * Generate OG image for wedding portfolio
 * @param {string} projectTitle - Project title
 * @param {string} venue - Wedding venue
 * @param {string} weddingType - Type of wedding
 * @returns {string} OG image URL
 */
export function generatePortfolioOGImage(projectTitle, venue = '', weddingType = '') {
  return generateOGImage({
    title: projectTitle,
    description: venue ? `Wedding at ${venue}` : 'Beautiful Wedding Celebration',
    template: 'portfolio',
    venue,
    weddingType,
    colorScheme: 'romantic'
  });
}

/**
 * Clear expired OG image cache
 */
export function clearExpiredCache() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wedding-og-')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key));
          if (Date.now() > cached.expiresAt) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[Wedding OG] Cleared ${keysToRemove.length} expired cache entries`);
  } catch (error) {
    console.warn('[Wedding OG] Cache cleanup failed:', error);
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getCacheStats() {
  try {
    let total = 0;
    let valid = 0;
    let expired = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wedding-og-')) {
        total++;
        try {
          const cached = JSON.parse(localStorage.getItem(key));
          if (Date.now() > cached.expiresAt) {
            expired++;
          } else {
            valid++;
          }
        } catch {
          expired++;
        }
      }
    }

    return { total, valid, expired };
  } catch {
    return { total: 0, valid: 0, expired: 0 };
  }
}

export default {
  generateOGImage,
  getTemplateConfig,
  validateOGConfig,
  cacheOGImage,
  getCachedOGImage,
  generateOGImageVariations,
  generateServiceOGImage,
  generatePortfolioOGImage,
  clearExpiredCache,
  getCacheStats,
  WEDDING_CONFIG
};