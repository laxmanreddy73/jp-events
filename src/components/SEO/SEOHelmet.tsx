import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOHelmetProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterHandle?: string;
  twitterSite?: string;
  children?: React.ReactNode;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  author?: string;
  noindex?: boolean;
  // Wedding Business Specific Props
  weddingType?: 'hindu' | 'christian' | 'muslim' | 'sikh' | 'interfaith' | 'destination';
  venue?: string;
  serviceType?: string;
  eventDate?: string;
  location?: string;
  priceRange?: string;
  // Advanced SEO Props
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  articleTags?: string[];
  locale?: string;
  alternateLanguages?: { lang: string; url: string }[];
  additionalMeta?: Array<{ name?: string; property?: string; content: string }>;
}

/**
 * Enhanced SEO Component for Wedding Business
 * Sets comprehensive meta tags, structured data, and wedding-specific SEO
 * Place this at the top of any page component to manage SEO
 */
const SEOHelmet: React.FC<SEOHelmetProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  ogUrl,
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterHandle = "@subadesigns",
  children,
  structuredData,
  author = "JP Events",
  noindex = false,
  // Wedding Business Props
  weddingType,
  venue,
  serviceType,
  location = "Hyderabad, India",
  priceRange = "$$$",
  // Advanced SEO Props
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags,
  locale = "en_IN",
  alternateLanguages,
}) => {
  const assetBase = import.meta.env.BASE_URL;
  const baseUrl = process.env.VITE_SITE_URL || "https://subadesignsanddecoration.com";
  const canonicalUrl = canonical ? `${baseUrl}${canonical.startsWith('/') ? canonical : `/${canonical}`}` : baseUrl;
  const defaultOGImage = "https://res.cloudinary.com/djex6hliw/image/upload/v1751038841/flv16ko3frkbck7e7fdl.jpg";
  const ogImageUrl = ogImage || defaultOGImage;

  // Enhanced keywords with wedding business focus
  const enhancedKeywords = keywords ? 
    `${keywords}, wedding planners hyderabad, event planners, wedding decorators, marriage planners, ${weddingType ? `${weddingType} wedding planners` : ''}` : 
    `wedding planners, event management, wedding decor, ${weddingType ? `${weddingType} wedding` : 'wedding services'}, hyderabad`;

  // Enhanced description with wedding business context
  const enhancedDescription = description.includes('JP Events') ? 
    description : 
    `${description} | JP Events - Professional Wedding Planners Since 2010`;

  return (
    <Helmet>
      {/* ===== BASIC META TAGS ===== */}
      <title>{title}</title>
      <meta name="description" content={enhancedDescription} />
      <meta name="keywords" content={enhancedKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="language" content="English" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* ===== WEDDING BUSINESS META TAGS ===== */}
      <meta name="business_type" content="Wedding Planning & Event Management" />
      <meta name="services_offered" content={serviceType || "Wedding Planning, Event Decor, Mandap Design, Wedding Coordination"} />
      <meta name="service_area" content={location} />
      {weddingType && <meta name="wedding_specialization" content={weddingType} />}
      {venue && <meta name="venue_partner" content={venue} />}
      <meta name="price_range" content={priceRange} />
      <meta name="years_in_business" content="13+" />

      {/* ===== GEO LOCATION TAGS ===== */}
      <meta name="geo.region" content="IN-TS" />
      <meta name="geo.placename" content="Hyderabad" />
      <meta name="country" content="India" />
      <meta name="city" content="Hyderabad" />
      <meta name="state" content="Telangana" />

      {/* ===== CANONICAL & ALTERNATE URLs ===== */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Alternate languages for international SEO */}
      {alternateLanguages?.map((alt, index) => (
        <link key={index} rel="alternate" hrefLang={alt.lang} href={alt.url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* ===== OPEN GRAPH TAGS ===== */}
      <meta property="og:site_name" content="JP Events" />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || enhancedDescription} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:alt" content={ogTitle || title} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:url" content={ogUrl || canonicalUrl} />
      <meta property="og:locale" content={locale} />

      {/* Wedding Business Specific OG Tags */}
      <meta property="business:contact_data:locality" content="Hyderabad" />
      <meta property="business:contact_data:region" content="Telangana" />
      <meta property="business:contact_data:country_name" content="India" />
      <meta property="business:contact_data:email" content="jpevents@gmail.com" />
      <meta property="business:contact_data:phone_number" content="+919533950636" />
      
      {serviceType && <meta property="product:category" content={serviceType} />}
      {weddingType && <meta property="article:section" content={weddingType} />}

      {/* ===== TWITTER CARD TAGS ===== */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={twitterTitle || title} />
      <meta name="twitter:description" content={twitterDescription || enhancedDescription} />
      <meta name="twitter:image" content={twitterImage || ogImageUrl} />
      <meta name="twitter:image:alt" content={twitterTitle || title} />
      <meta name="twitter:label1" content="Service Type" />
      <meta name="twitter:data1" content={serviceType || "Wedding Planning"} />
      <meta name="twitter:label2" content="Location" />
      <meta name="twitter:data2" content={location} />

      {/* ===== ARTICLE SPECIFIC TAGS ===== */}
      {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
      {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
      {articleSection && <meta property="article:section" content={articleSection} />}
      {articleTags?.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}

      {/* ===== STRUCTURED DATA (JSON-LD) ===== */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((data, index) => (
            <script key={index} type="application/ld+json">
              {JSON.stringify(data)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )
      )}

      {/* ===== ADDITIONAL META TAGS ===== */}
      <meta name="theme-color" content="#8b0000" />
      <meta name="msapplication-TileColor" content="#8b0000" />
      <meta name="apple-mobile-web-app-title" content="JP Events" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" href={`${assetBase}favicon.ico`} />
      <link rel="apple-touch-icon" sizes="180x180" href={`${assetBase}apple-touch-icon.png`} />
      <link rel="icon" type="image/png" sizes="32x32" href={`${assetBase}favicon-32x32.png`} />
      <link rel="icon" type="image/png" sizes="16x16" href={`${assetBase}favicon-16x16.png`} />
      <link rel="manifest" href={`${assetBase}site.webmanifest`} />

      {/* Preload critical resources */}
      <link rel="preconnect" href="https://res.cloudinary.com" />
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />

      {children}
    </Helmet>
  );
};

// Helper function to generate wedding-specific structured data
export const generateWeddingStructuredData = (data: {
  title: string;
  description: string;
  venue?: string;
  weddingType?: string;
  eventDate?: string;
  location?: string;
  serviceType?: string;
}) => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": data.serviceType || "WeddingPlanning",
    "provider": {
      "@type": "Organization",
      "name": "JP Events",
      "description": "Professional wedding planning and decoration company creating magical wedding experiences across India since 2010.",
      "url": "https://subadesignsanddecoration.com",
      "telephone": "+919533950636",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Hyderabad",
        "addressRegion": "Telangana",
        "addressCountry": "IN"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": data.location || "Hyderabad"
    },
    "description": data.description,
    "name": data.title
  };

  return baseData;
};

export default SEOHelmet;
