import { Helmet } from 'react-helmet-async';
import { generateHreflangs, validateWeddingHreflangs, weddingLanguageConfigs } from '../../utils/internationalSEO';

interface HreflangTagsProps {
  baseUrl: string;
  translations?: Array<{
    language: string;
    region?: string;
    url: string;
    default?: boolean;
  }>;
  currentPath?: string;
  enableWeddingDefaults?: boolean;
}

/**
 * Enhanced Hreflang Tags Component for Wedding Business
 * Automatically generates and injects hreflang tags for multi-language SEO
 * with wedding-specific optimizations
 * 
 * @example
 * // Basic usage with wedding defaults
 * <HreflangTags 
 *   baseUrl="https://subadesignsanddecoration.com"
 *   enableWeddingDefaults={true}
 * />
 * 
 * @example
 * // Custom translations
 * <HreflangTags 
 *   baseUrl="https://subadesignsanddecoration.com"
 *   translations={[
 *     { language: 'en', region: 'IN', url: '/en', default: true },
 *     { language: 'hi', region: 'IN', url: '/hi' },
 *     { language: 'kn', region: 'IN', url: '/kn' }
 *   ]}
 * />
 */
export function HreflangTags({ 
  baseUrl, 
  translations = [], 
  currentPath = '',
  enableWeddingDefaults = false 
}: HreflangTagsProps) {
  
  // Use wedding business defaults if enabled
  const finalTranslations = enableWeddingDefaults 
    ? weddingLanguageConfigs.indianWeddings
    : translations;

  if (!baseUrl || finalTranslations.length === 0) {
    console.warn('[Wedding SEO] Hreflang tags skipped: missing baseUrl or translations');
    return null;
  }

  try {
    // Validate translations
    const validation = validateWeddingHreflangs(finalTranslations);
    if (!validation.isValid) {
      console.warn('[Wedding SEO] Hreflang validation failed:', validation.errors);
    }

    // Generate hreflang tags
    const hreflangs = generateHreflangs(finalTranslations, baseUrl);

    // Add canonical tag for current page
    const canonicalUrl = currentPath 
      ? `${baseUrl}${currentPath}`
      : `${baseUrl}${finalTranslations.find(t => t.default)?.url || finalTranslations[0].url}`;

    return (
      <Helmet>
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Hreflang Tags */}
        {hreflangs.map((tag, index) => (
          <link
            key={`hreflang-${index}`}
            rel={tag.rel}
            hrefLang={tag.hrefLang}
            href={tag.href}
          />
        ))}
        
        {/* Additional SEO meta for wedding business */}
        <meta name="geo.region" content="IN-TS" />
        <meta name="geo.placename" content="Hyderabad" />
      </Helmet>
    );
  } catch (error) {
    console.warn('[Wedding SEO] Hreflang generation failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Quick setup component for Indian wedding business
 */
export function WeddingBusinessHreflangs({ baseUrl, currentPath }: { baseUrl: string; currentPath?: string }) {
  return (
    <HreflangTags
      baseUrl={baseUrl}
      currentPath={currentPath}
      enableWeddingDefaults={true}
    />
  );
}

export default HreflangTags;
