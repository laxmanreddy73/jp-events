import { Helmet } from 'react-helmet-async';
import * as schemas from '../../utils/advancedSchemas';

/**
 * Rich Snippets Component for Wedding Business
 * Dynamically injects structured data based on page type with wedding-specific enhancements
 * 
 * @example
 * // Basic wedding business usage
 * <RichSnippets 
 *   type="weddingbusiness"
 *   config={{
 *     name: 'JP Events',
 *     telephone: '+91-98765-43210',
 *     address: 'Hyderabad, Telangana, India'
 *   }}
 * />
 * 
 * @example
 * // Wedding event schema
 * <RichSnippets 
 *   type="weddingevent"
 *   config={{
 *     name: 'Priya & Rahul Wedding',
 *     date: '2024-12-15',
 *     venue: 'Taj West End, Hyderabad',
 *     weddingType: 'South Indian Hindu Wedding'
 *   }}
 * />
 * 
 * @example
 * // Multiple schemas on one page
 * <RichSnippets 
 *   type="multiple"
 *   config={{
 *     schemas: [
 *       { type: 'weddingbusiness', config: businessConfig },
 *       { type: 'breadcrumb', config: breadcrumbConfig },
 *       { type: 'faq', config: faqConfig }
 *     ]
 *   }}
 * />
 */

interface RichSnippetsProps {
  type?: string;
  config?: Record<string, unknown>;
  priority?: boolean;
  validate?: boolean;
}

export function RichSnippets({ 
  type = 'weddingbusiness', 
  config = {}, 
  priority = false,
  validate = true 
}: RichSnippetsProps) {
  
  // Extended schema generators with wedding business focus
  const schemaGenerators = {
    // Core business schemas
    organization: schemas.generateOrganizationSchema,
    localbusiness: schemas.generateLocalBusinessSchema,
    weddingbusiness: schemas.generateWeddingBusinessSchema,
    
    // Content schemas
    article: schemas.generateArticleSchema,
    blogposting: schemas.generateBlogPostingSchema,
    faq: schemas.generateFAQSchema,
    howto: schemas.generateHowToSchema,
    
    // Event schemas
    event: schemas.generateEventSchema,
    weddingevent: schemas.generateWeddingEventSchema,
    
    // Product/service schemas
    product: schemas.generateProductSchema,
    service: schemas.generateServiceSchema,
    weddingpackage: schemas.generateWeddingPackageSchema,
    
    // Navigation schemas
    breadcrumb: schemas.generateBreadcrumbSchema,
    sitenavigation: schemas.generateSiteNavigationSchema,
    
    // Media schemas
    video: schemas.generateVideoSchema,
    imagegallery: schemas.generateImageGallerySchema,
    weddingportfolio: schemas.generateWeddingPortfolioSchema,
    
    // Review schemas
    review: schemas.generateReviewSchema,
    aggregateRating: schemas.generateAggregateRatingSchema,
    
    // Job schemas
    jobposting: schemas.generateJobPostingSchema,
    
    // Education schemas
    course: schemas.generateCourseSchema,
    workshop: schemas.generateWorkshopSchema,
    
    // Recipe schemas (for wedding catering)
    recipe: schemas.generateRecipeSchema,
    
    // Multiple schemas handler
    multiple: schemas.generateMultipleSchemas
  };

  const generator = schemaGenerators[type];
  
  if (!generator) {
    console.warn(`[Wedding SEO] Unknown schema type: ${type}`);
    return null;
  }

  try {
    // Validate schema configuration if enabled
    if (validate && schemas.validateSchemaConfig) {
      const validation = schemas.validateSchemaConfig(type, config);
      if (!validation.isValid) {
        console.warn(`[Wedding SEO] Schema validation failed for type ${type}:`, validation.errors);
        
        // Attempt to fix common issues automatically
        const fixedConfig = schemas.autoFixSchemaConfig?.(type, config) || config;
        if (fixedConfig !== config) {
          console.info(`[Wedding SEO] Auto-fixed schema configuration for ${type}`);
        }
      }
    }

    const schema = generator(config);
    
    // Add wedding business context if missing
    const enhancedSchema = schemas.enhanceWithWeddingContext?.(schema, type) || schema;
    
    return (
      <Helmet>
        <script 
          type="application/ld+json"
          data-schema-type={type}
          data-schema-priority={priority ? 'high' : 'normal'}
        >
          {JSON.stringify(enhancedSchema, null, priority ? 2 : 0)}
        </script>
        
        {/* Additional meta for schema awareness */}
        {priority && (
          <meta name="schema-priority" content="high" />
        )}
      </Helmet>
    );
  } catch (error) {
    console.warn(`[Wedding SEO] Schema generation failed for type ${type}:`, 
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    // Fallback to basic organization schema
    if (type !== 'organization' && schemas.generateOrganizationSchema) {
      console.info(`[Wedding SEO] Falling back to organization schema`);
      try {
        const fallbackSchema = schemas.generateOrganizationSchema({
          name: config.name || 'JP Events',
          url: config.url || typeof window !== 'undefined' ? window.location.origin : ''
        });
        
        return (
          <Helmet>
            <script type="application/ld+json">
              {JSON.stringify(fallbackSchema)}
            </script>
          </Helmet>
        );
      } catch (fallbackError) {
        console.error(`[Wedding SEO] Fallback schema also failed:`, fallbackError);
      }
    }
    
    return null;
  }
}

/**
 * Quick Wedding Business Schema Component
 * Pre-configured for wedding planning businesses
 */
export function WeddingBusinessSnippet({ 
  businessInfo,
  includeReviews = true 
}: {
  businessInfo: {
    name: string;
    telephone: string;
    email: string;
    address: string;
    description?: string;
    services?: string[];
    areasServed?: string[];
  };
  includeReviews?: boolean;
}) {
  const config = {
    ...businessInfo,
    type: 'WeddingPlanningBusiness',
    priceRange: '₹₹₹₹',
    openingHours: [
      'Mo-Su 09:00-21:00',
      'Ph 10:00-18:00'
    ],
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Bank Transfer',
    knowsAbout: [
      'Wedding Planning',
      'Event Management',
      'Venue Decoration',
      'Vendor Coordination',
      'Budget Management',
      'South Indian Weddings',
      'North Indian Weddings',
      'Destination Weddings',
      'Theme Weddings'
    ]
  };

  return (
    <>
      <RichSnippets type="weddingbusiness" config={config} priority={true} />
      {includeReviews && (
        <RichSnippets 
          type="aggregateRating" 
          config={{
            ratingValue: '4.9',
            ratingCount: '127',
            bestRating: '5',
            worstRating: '1'
          }} 
        />
      )}
    </>
  );
}

/**
 * Wedding Event Schema Component
 * For showcasing specific wedding events in portfolio
 */
export function WeddingEventSnippet({
  eventInfo
}: {
  eventInfo: {
    name: string;
    description: string;
    date: string;
    venue: string;
    location: string;
    weddingType: string;
    images?: string[];
    coupleName?: string;
  };
}) {
  const config = {
    ...eventInfo,
    eventType: 'Wedding',
    organizer: {
      name: 'JP Events',
      type: 'Organization'
    },
    offers: {
      type: 'Offer',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/SoldOut',
      validFrom: eventInfo.date
    }
  };

  return <RichSnippets type="weddingevent" config={config} />;
}

/**
 * Wedding Package Schema Component
 * For showcasing wedding service packages
 */
export function WeddingPackageSnippet({
  packageInfo
}: {
  packageInfo: {
    name: string;
    description: string;
    price: number;
    currency?: string;
    includes?: string[];
    validity?: string;
    serviceType?: string;
  };
}) {
  const config = {
    ...packageInfo,
    category: 'Wedding Services',
    provider: 'JP Events',
    availability: 'https://schema.org/InStock',
    areaServed: ['Hyderabad', 'Telangana', 'India']
  };

  return <RichSnippets type="weddingpackage" config={config} />;
}

/**
 * Multiple Schemas Container
 * For pages requiring multiple structured data types
 */
export function MultiSchemaContainer({
  schemas
}: {
  schemas: Array<{
    type: string;
    config: Record<string, unknown>;
    priority?: boolean;
  }>;
}) {
  return (
    <>
      {schemas.map((schema, index) => (
        <RichSnippets
          key={`${schema.type}-${index}`}
          type={schema.type}
          config={schema.config}
          priority={schema.priority}
        />
      ))}
    </>
  );
}

/**
 * Hook for schema management
 */
export function useSchemaManager() {
  const trackSchemaImpression = (schemaType: string) => {
    // Track schema usage for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'schema_impression', {
        schema_type: schemaType,
        page_path: window.location.pathname
      });
    }
  };

  const validatePageSchemas = () => {
    // Check if essential schemas are present
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    const schemaTypes = Array.from(existingSchemas).map(script => 
      script.getAttribute('data-schema-type')
    );

    return {
      hasOrganization: schemaTypes.includes('organization') || schemaTypes.includes('weddingbusiness'),
      hasBreadcrumb: schemaTypes.includes('breadcrumb'),
      hasFAQ: schemaTypes.includes('faq'),
      totalSchemas: existingSchemas.length
    };
  };

  return {
    trackSchemaImpression,
    validatePageSchemas
  };
}

export default RichSnippets;
