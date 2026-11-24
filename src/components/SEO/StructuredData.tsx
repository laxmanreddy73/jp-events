import React from "react";
import { Helmet } from "react-helmet-async";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateAggregateRatingSchema,
  generateWeddingEventSchema,
  generateWeddingBusinessSchema,
  generateWeddingServiceSchema,
  generateBridalSuiteSchema,
  generateVenueSchema,
  generatePhotographyServiceSchema,
  generateCateringServiceSchema,
  formatSchemaDate,
  generatePriceSpecification,
} from "../../utils/seoHelpers";

interface StructuredDataProps {
  type?: 
    | "breadcrumb"
    | "faq"
    | "rating"
    | "wedding-event"
    | "wedding-business"
    | "wedding-service"
    | "bridal-suite"
    | "venue"
    | "photography"
    | "catering"
    | "custom";
  data: unknown;
  id?: string;
  className?: string;
}

/**
 * Enhanced Structured Data Component for Wedding Business
 * Comprehensive schema markup for all wedding-related pages
 * 
 * @example
 * <StructuredData 
 *   type="wedding-event"
 *   data={weddingData}
 *   id="wedding-schema"
 * />
 */
const StructuredData: React.FC<StructuredDataProps> = ({ 
  type = "custom",
  data, 
  id,
  className = "structured-data" 
}) => {
  let schema: unknown;

  const generateSchema = () => {
    switch (type) {
      case "breadcrumb":
        schema = generateBreadcrumbSchema(data as Array<{ name: string; url: string; position?: number }>);
        break;
      
      case "faq":
        schema = generateFAQSchema(data as Array<{ 
          question: string; 
          answer: string;
          acceptedAnswer?: string;
        }>);
        break;
      
      case "rating":
        schema = generateAggregateRatingSchema(
          data as {
            ratingValue: number;
            ratingCount: number;
            reviewCount: number;
            bestRating?: number;
            worstRating?: number;
          }
        );
        break;
      
      case "wedding-event":
        schema = generateWeddingEventSchema(
          data as {
            name: string;
            description: string;
            startDate: string;
            endDate?: string;
            location: {
              name: string;
              address: string;
              city: string;
              country: string;
            };
            organizer: {
              name: string;
              phone: string;
              email: string;
              url: string;
            };
            performers?: string[];
            image?: string[];
            offers?: {
              price: string;
              priceCurrency: string;
              url: string;
              availability?: string;
            };
          }
        );
        break;
      
      case "wedding-business":
        schema = generateWeddingBusinessSchema(
          data as {
            name: string;
            description: string;
            address: {
              street: string;
              city: string;
              state: string;
              postalCode: string;
              country: string;
            };
            geo?: {
              latitude: number;
              longitude: number;
            };
            telephone: string;
            email: string;
            url: string;
            priceRange?: string;
            openingHours?: string[];
            services?: string[];
            areasServed?: string[];
          }
        );
        break;
      
      case "wedding-service":
        schema = generateWeddingServiceSchema(
          data as {
            name: string;
            description: string;
            provider: string;
            serviceType: string;
            areaServed: string[];
            offers?: {
              priceSpecification: {
                price: number;
                priceCurrency: string;
                priceRange?: string;
              };
            };
            availableChannel: {
              serviceUrl: string;
            };
          }
        );
        break;
      
      case "bridal-suite":
        schema = generateBridalSuiteSchema(
          data as {
            name: string;
            description: string;
            includes: string[];
            price: number;
            priceCurrency: string;
            duration: string;
            availability: string;
            image?: string[];
          }
        );
        break;
      
      case "venue":
        schema = generateVenueSchema(
          data as {
            name: string;
            description: string;
            address: {
              street: string;
              city: string;
              state: string;
              postalCode: string;
              country: string;
            };
            geo: {
              latitude: number;
              longitude: number;
            };
            capacity: {
              standing: number;
              seated: number;
            };
            amenities: string[];
            images: string[];
            priceRange: string;
          }
        );
        break;
      
      case "photography":
        schema = generatePhotographyServiceSchema(
          data as {
            name: string;
            description: string;
            provider: string;
            serviceTypes: string[];
            pricePackages: Array<{
              name: string;
              price: number;
              duration: string;
              includes: string[];
            }>;
            areaServed: string[];
          }
        );
        break;
      
      case "catering":
        schema = generateCateringServiceSchema(
          data as {
            name: string;
            description: string;
            provider: string;
            cuisine: string[];
            menu: Array<{
              name: string;
              description: string;
              price: number;
            }>;
            serviceOptions: string[];
            areaServed: string[];
          }
        );
        break;
      
      case "custom":
        schema = data;
        break;
      
      default:
        console.warn(`[StructuredData] Unknown schema type: ${type}`);
        return null;
    }

    // Add @id to schema for better entity linking
    if (schema && typeof schema === 'object' && id) {
      schema = {
        ...schema,
        '@id': `${window.location.origin}#${id}`
      };
    }

    return schema;
  };

  const schemaData = generateSchema();

  if (!schemaData) {
    return null;
  }

  return (
    <div className={className} data-schema-type={type}>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaData, null, 2)}
        </script>
      </Helmet>
      
      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="schema-debug" style={{ display: 'none' }}>
          <h4>Schema Type: {type}</h4>
          <pre>{JSON.stringify(schemaData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

/**
 * Helper component for multiple structured data entries
 */
export const StructuredDataCollection: React.FC<{
  schemas: Array<{
    type: StructuredDataProps['type'];
    data: unknown;
    id?: string;
  }>;
}> = ({ schemas }) => {
  return (
    <>
      {schemas.map((schema, index) => (
        <StructuredData
          key={schema.id || `schema-${index}`}
          type={schema.type}
          data={schema.data}
          id={schema.id}
        />
      ))}
    </>
  );
};

/**
 * Pre-configured wedding business schemas for common use cases
 */
export const WeddingBusinessSchemas = {
  /**
   * Complete wedding planner business schema
   */
  createBusinessSchema: (businessData: {
    name: string;
    description: string;
    address: Record<string, unknown>;
    contact: {
      phone: string;
      email: string;
      website: string;
    };
    services: string[];
    areasServed: string[];
  }) => ({
    type: "wedding-business" as const,
    data: businessData,
    id: "wedding-business"
  }),

  /**
   * Wedding service package schema
   */
  createServiceSchema: (serviceData: {
    name: string;
    description: string;
    price: number;
    includes: string[];
    duration: string;
  }) => ({
    type: "wedding-service" as const,
    data: serviceData,
    id: "wedding-service"
  }),

  /**
   * FAQ schema for common wedding planning questions
   */
  createFAQSchema: (faqs: Array<{ question: string; answer: string }>) => ({
    type: "faq" as const,
    data: faqs,
    id: "wedding-faq"
  }),

  /**
   * Venue schema for wedding locations
   */
  createVenueSchema: (venueData: {
    name: string;
    address: Record<string, unknown>;
    capacity: number | string | { standing: number; seated: number };
    amenities: string[];
  }) => ({
    type: "venue" as const,
    data: venueData,
    id: "wedding-venue"
  }),

  /**
   * Complete wedding event schema
   */
  createEventSchema: (eventData: {
    name: string;
    startDate: string;
    location: Record<string, unknown>;
    description: string;
  }) => ({
    type: "wedding-event" as const,
    data: eventData,
    id: "wedding-event"
  })
};

/**
 * Usage Examples:
 * 
 * 1. Basic wedding business:
 * <StructuredData 
 *   type="wedding-business"
 *   data={businessData}
 *   id="main-business"
 * />
 * 
 * 2. Multiple schemas:
 * <StructuredDataCollection
 *   schemas={[
 *     WeddingBusinessSchemas.createBusinessSchema(businessData),
 *     WeddingBusinessSchemas.createFAQSchema(faqData),
 *     WeddingBusinessSchemas.createServiceSchema(serviceData)
 *   ]}
 * />
 * 
 * 3. Custom wedding event:
 * <StructuredData
 *   type="wedding-event"
 *   data={{
 *     name: "Traditional Hindu Wedding Ceremony",
 *     startDate: "2024-12-15T10:00:00+05:30",
 *     location: {
 *       name: "Grand Wedding Venue",
 *       address: "123 Wedding Lane, Hyderabad",
 *       city: "Hyderabad",
 *       country: "India"
 *     },
 *     description: "Complete traditional Hindu wedding ceremony with all rituals"
 *   }}
 * />
 */

export default StructuredData;

/**
 * Export helper functions for external use
 */
export {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateAggregateRatingSchema,
  generateWeddingEventSchema,
  generateWeddingBusinessSchema,
  generateWeddingServiceSchema,
  generateBridalSuiteSchema,
  generateVenueSchema,
  generatePhotographyServiceSchema,
  generateCateringServiceSchema,
  formatSchemaDate,
  generatePriceSpecification,
};