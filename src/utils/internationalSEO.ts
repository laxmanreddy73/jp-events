/**
 * International and multi-language SEO utilities
 * Enhanced for Wedding Business with hreflang, language detection, and geo-targeting
 */

export interface TranslationConfig {
  language: string;
  region?: string;
  url: string;
  default?: boolean;
  name?: string;
  weddingKeywords?: string[];
}

export interface HreflangTag {
  rel: 'alternate' | 'canonical';
  hrefLang: string;
  href: string;
}

export interface GeoConfig {
  currency: string;
  timezone: string;
  dateFormat: string;
  language: string;
  weddingTraditions?: string[];
  popularVenues?: string[];
  peakSeason?: string[];
}

/**
 * Wedding-specific language configurations for global wedding markets
 */
export const WEDDING_LANGUAGE_CONFIGS = {
  // Indian Subcontinent Focus
  indianSubcontinent: [
    {
      language: 'en',
      region: 'IN',
      url: '/en',
      name: 'English',
      default: true,
      weddingKeywords: [
        'wedding planners hyderabad',
        'luxury wedding planners india',
        'south indian wedding planners',
        'destination wedding india'
      ]
    },
    {
      language: 'hi',
      region: 'IN',
      url: '/hi',
      name: 'Hindi',
      weddingKeywords: [
        'वेडिंग प्लानर्स बैंगलोर',
        'शादी की योजना बनाने वाले',
        'वेडिंग डेकोरेटर्स',
        'डेस्टिनेशन वेडिंग'
      ]
    },
    {
      language: 'kn',
      region: 'IN',
      url: '/kn',
      name: 'Kannada',
      weddingKeywords: [
        'ಮದುವೆ ಯೋಜಕರು ಬೆಂಗಳೂರು',
        'ಮದುವೆ ಡೆಕೋರೇಟರ್ಸ್',
        'ಲಗ್ನ ಯೋಜನೆ',
        'ಹಬ್ಬದ ಮದುವೆ'
      ]
    },
    {
      language: 'ta',
      region: 'IN',
      url: '/ta',
      name: 'Tamil',
      weddingKeywords: [
        'திருமண திட்டமிடுபவர்கள்',
        'கல்யாண திட்டமிடல்',
        'விநியோக திருமணம்',
        'பெங்களூர் திருமண திட்டமிடுபவர்கள்'
      ]
    },
    {
      language: 'te',
      region: 'IN',
      url: '/te',
      name: 'Telugu',
      weddingKeywords: [
        'వెడ్డింగ్ ప్లానర్స్ బెంగళూరు',
        'కళ్యాణం ప్లానింగ్',
        'వివాహ డెకోరేటర్స్',
        'డెస్టినేషన్ వెడ్డింగ్'
      ]
    }
  ],

  // International Destination Wedding Markets
  international: [
    {
      language: 'en',
      region: 'US',
      url: '/en-us',
      name: 'English (US)',
      weddingKeywords: [
        'destination wedding india',
        'luxury wedding planners india',
        'indian wedding abroad',
        'goa wedding planners'
      ]
    },
    {
      language: 'en',
      region: 'GB',
      url: '/en-gb',
      name: 'English (UK)',
      weddingKeywords: [
        'indian wedding planners',
        'asian wedding specialists',
        'destination wedding india',
        'luxury wedding coordination'
      ]
    },
    {
      language: 'ar',
      region: 'AE',
      url: '/ar-ae',
      name: 'Arabic (UAE)',
      weddingKeywords: [
        'مخططي حفلات الزفاف في الهند',
        'حفلات الزفاف الفاخرة',
        'حفلات الزفاف في غوا'
      ]
    },
    {
      language: 'fr',
      region: 'FR',
      url: '/fr-fr',
      name: 'French',
      weddingKeywords: [
        'organisateurs de mariage en inde',
        'mariage de luxe en inde',
        'mariage à goa'
      ]
    }
  ]
};

/**
 * Generate comprehensive hreflang tags for wedding business
 * @param {Array} translations - Array of translation configurations
 * @param {string} baseUrl - Base domain URL
 * @param {string} currentPath - Current page path
 * @returns {Array} Hreflang link objects
 */
export function generateHreflangs(translations: TranslationConfig[], baseUrl: string, currentPath: string = ''): HreflangTag[] {
  const hreflangs: HreflangTag[] = [];
  
  if (!baseUrl) {
    throw new Error('Base URL is required for hreflang generation');
  }

  if (!translations || translations.length === 0) {
    throw new Error('Translations array cannot be empty');
  }

  const defaultTranslation = translations.find(t => t.default) || translations[0];
  
  // Add x-default for non-specified languages
  hreflangs.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${baseUrl}${defaultTranslation.url}${currentPath}`
  });

  // Add specific language-region combinations
  translations.forEach(translation => {
    const hrefLang = translation.region 
      ? `${translation.language}-${translation.region}`
      : translation.language;

    hreflangs.push({
      rel: 'alternate',
      hrefLang,
      href: `${baseUrl}${translation.url}${currentPath}`
    });

    // Add language-only variant (without region)
    if (translation.region) {
      hreflangs.push({
        rel: 'alternate',
        hrefLang: translation.language,
        href: `${baseUrl}${translation.url}${currentPath}`
      });
    }
  });

  // Add canonical for current page
  hreflangs.push({
    rel: 'canonical',
    href: `${baseUrl}${defaultTranslation.url}${currentPath}`
  });

  return hreflangs;
}

/**
 * Enhanced user language detection for wedding business
 * @returns {string} Detected language code
 */
export function detectUserLanguage(): string {
  // Priority 1: URL parameter (for marketing campaigns)
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang') || urlParams.get('language');
  if (urlLang && isValidLanguageCode(urlLang)) {
    localStorage.setItem('preferredWeddingLanguage', urlLang);
    return urlLang;
  }

  // Priority 2: User preference (saved in localStorage)
  const savedLang = localStorage.getItem('preferredWeddingLanguage');
  if (savedLang && isValidLanguageCode(savedLang)) {
    return savedLang;
  }

  // Priority 3: Browser language with wedding market mapping
  const browserLang = navigator.language?.toLowerCase() || 'en';
  const mappedLang = mapBrowserToWeddingLanguage(browserLang);
  if (mappedLang) {
    return mappedLang;
  }

  // Priority 4: Geo-IP based language detection
  const geoLang = detectLanguageFromGeo();
  if (geoLang) {
    return geoLang;
  }

  return 'en'; // Default to English
}

/**
 * Enhanced geo-targeting configuration for wedding business
 * @param {string} country - Country code
 * @returns {GeoConfig} Geo configuration with wedding-specific data
 */
export function getGeoTargetingConfig(country: string): GeoConfig {
  const weddingConfigs: { [key: string]: GeoConfig } = {
    'IN': {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD-MM-YYYY',
      language: 'hi',
      weddingTraditions: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Interfaith'],
      popularVenues: ['Palace Grounds', 'Luxury Hotels', 'Beach Resorts', 'Heritage Properties'],
      peakSeason: ['November', 'December', 'January', 'February']
    },
    'US': {
      currency: 'USD',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      language: 'en',
      weddingTraditions: ['American', 'Indian-American', 'Multicultural', 'Interfaith'],
      popularVenues: ['Ballrooms', 'Country Clubs', 'Beach Venues', 'Vineyards'],
      peakSeason: ['June', 'September', 'October']
    },
    'GB': {
      currency: 'GBP',
      timezone: 'Europe/London',
      dateFormat: 'DD/MM/YYYY',
      language: 'en',
      weddingTraditions: ['British', 'Indian-British', 'Asian', 'Multicultural'],
      popularVenues: ['Manor Houses', 'Castles', 'Country Estates', 'Historic Venues'],
      peakSeason: ['July', 'August', 'September']
    },
    'AE': {
      currency: 'AED',
      timezone: 'Asia/Dubai',
      dateFormat: 'DD/MM/YYYY',
      language: 'ar',
      weddingTraditions: ['Arabic', 'Indian', 'International', 'Luxury'],
      popularVenues: ['Luxury Hotels', 'Desert Resorts', 'Beach Clubs', 'Ballrooms'],
      peakSeason: ['October', 'November', 'December', 'January']
    },
    'FR': {
      currency: 'EUR',
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY',
      language: 'fr',
      weddingTraditions: ['French', 'Indian-French', 'European', 'Chic'],
      popularVenues: ['Chateaux', 'Vineyards', 'Riviera Venues', 'Historic Sites'],
      peakSeason: ['June', 'July', 'August', 'September']
    }
  };

  return weddingConfigs[country] || weddingConfigs['IN'];
}

/**
 * Format wedding dates according to local traditions
 * @param {Date} date - Wedding date
 * @param {string} locale - Locale code
 * @param {string} tradition - Wedding tradition (optional)
 * @returns {string} Formatted wedding date
 */
export function formatWeddingDate(date: Date, locale: string = 'en-IN', tradition?: string): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  let formattedDate = formatter.format(date);

  // Add tradition-specific formatting
  if (tradition === 'Indian') {
    // Add Hindu calendar date if available
    const hinduDate = getHinduDate(date);
    if (hinduDate) {
      formattedDate += ` (${hinduDate})`;
    }
  }

  return formattedDate;
}

/**
 * Generate wedding-specific sitemap URLs
 * @param {string} baseUrl - Base domain
 * @param {string} language - Language code
 * @param {string} serviceType - Wedding service type
 * @returns {string} Sitemap URL
 */
export function generateWeddingSitemapUrl(baseUrl: string, language: string, serviceType?: string): string {
  if (serviceType) {
    return `${baseUrl}/sitemap-${language}-${serviceType}.xml`;
  }
  return `${baseUrl}/sitemap-${language}.xml`;
}

/**
 * Get wedding keywords for specific language and region
 * @param {string} language - Language code
 * @param {string} region - Region code (optional)
 * @returns {string[]} Array of wedding keywords
 */
export function getWeddingKeywords(language: string, region?: string): string[] {
  const allConfigs = [...WEDDING_LANGUAGE_CONFIGS.indianSubcontinent, ...WEDDING_LANGUAGE_CONFIGS.international];
  
  const config = allConfigs.find(t => 
    t.language === language && (!region || t.region === region)
  );

  return config?.weddingKeywords || [
    'wedding planners',
    'wedding decoration',
    'destination wedding',
    'luxury wedding'
  ];
}

/**
 * Auto-redirect based on user's location and language for wedding services
 * @param {string} baseUrl - Base domain URL
 * @returns {boolean} Whether redirect was performed
 */
export function autoRedirectForWeddingMarket(baseUrl: string): boolean {
  if (typeof window === 'undefined') return false;

  const userLang = detectUserLanguage();
  const currentPath = window.location.pathname;
  
  // Don't redirect if already on a language-specific path
  if (currentPath.includes('/en/') || currentPath.includes('/hi/') || 
      currentPath.includes('/kn/') || currentPath.includes('/ta/') || 
      currentPath.includes('/te/')) {
    return false;
  }

  // Redirect to appropriate language version
  const targetUrl = `${baseUrl}/${userLang}${currentPath}`;
  if (targetUrl !== window.location.href) {
    window.location.href = targetUrl;
    return true;
  }

  return false;
}

/**
 * Get currency symbol for wedding packages
 * @param {string} currencyCode - Currency code
 * @returns {string} Currency symbol
 */
export function getWeddingCurrencySymbol(currencyCode: string): string {
  const symbols: { [key: string]: string } = {
    'INR': '₹',
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'AED': 'AED '
  };

  return symbols[currencyCode] || currencyCode;
}

/**
 * Format wedding package pricing
 * @param {number} amount - Package amount
 * @param {string} currency - Currency code
 * @param {string} locale - Locale code
 * @returns {string} Formatted price
 */
export function formatWeddingPrice(amount: number, currency: string = 'INR', locale: string = 'en-IN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Helper functions
function isValidLanguageCode(lang: string): boolean {
  const validLanguages = ['en', 'hi', 'kn', 'ta', 'te', 'ml', 'ar', 'fr', 'de', 'ja'];
  return validLanguages.includes(lang.toLowerCase());
}

function mapBrowserToWeddingLanguage(browserLang: string): string | null {
  const languageMap: { [key: string]: string } = {
    'en': 'en',
    'hi': 'hi',
    'kn': 'kn',
    'ta': 'ta',
    'te': 'te',
    'ml': 'ml',
    'ar': 'ar',
    'fr': 'fr',
    'de': 'de',
    'ja': 'ja'
  };

  // Extract base language code (e.g., 'en-US' -> 'en')
  const baseLang = browserLang.split('-')[0].toLowerCase();
  return languageMap[baseLang] || null;
}

function detectLanguageFromGeo(): string | null {
  // This would typically integrate with a geo-IP service
  // For now, return null and let the default handle it
  return null;
}

function getHinduDate(date: Date): string | null {
  // Simplified Hindu date calculation
  // In production, integrate with a proper Hindu calendar library
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'indian'
  };

  try {
    return new Intl.DateTimeFormat('en-IN', options).format(date);
  } catch {
    return null;
  }
}

/**
 * Export utilities for wedding business SEO
 */
export default {
  generateHreflangs,
  detectUserLanguage,
  getGeoTargetingConfig,
  formatWeddingDate,
  generateWeddingSitemapUrl,
  getWeddingKeywords,
  autoRedirectForWeddingMarket,
  getWeddingCurrencySymbol,
  formatWeddingPrice,
  WEDDING_LANGUAGE_CONFIGS
};