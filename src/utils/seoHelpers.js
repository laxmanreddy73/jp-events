// SEO Helper Utilities

/**
 * Generate a canonical URL
 */
export const generateCanonicalUrl = (path) => {
  const baseUrl = process.env.VITE_SITE_URL || "https://subadesignsanddecoration.com";
  return `${baseUrl}${path}`;
};

/**
 * Generate breadcrumb schema
 */
export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Generate Organization schema
 */
export const generateOrganizationSchema = (config) => {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "WeddingPlanningBusiness"],
    name: config.name,
    description: config.description,
    url: config.url,
    logo: config.logo,
    foundingDate: config.foundingDate,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.address.streetAddress,
      addressLocality: config.address.addressLocality,
      addressRegion: config.address.addressRegion,
      postalCode: config.address.postalCode,
      addressCountry: config.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: config.geo.latitude,
      longitude: config.geo.longitude,
    },
    contact: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      telephone: config.contact.telephone,
      email: config.contact.email,
    },
    sameAs: config.sameAs,
  };
};

/**
 * Generate WebSite schema
 */
export const generateWebsiteSchema = (config) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.name,
    url: config.url,
    description: config.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${config.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
};

/**
 * Generate Service schema for wedding services
 */
export const generateServiceSchema = (serviceName, description, url) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description: description,
    provider: {
      "@type": "LocalBusiness",
      name: "JP Events",
    },
    url: url,
    areaServed: {
      "@type": "Country",
      name: "IN",
    },
  };
};

/**
 * Generate Article schema
 */
export const generateArticleSchema = (article) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Organization",
      name: "JP Events",
    },
    publisher: {
      "@type": "Organization",
      name: "JP Events",
      logo: {
        "@type": "ImageObject",
        url: "https://subadesignsanddecoration.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
};

/**
 * Generate FAQ schema
 */
export const generateFAQSchema = (faqItems) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
};

/**
 * Generate Aggregate Rating schema
 */
export const generateAggregateRatingSchema = (config) => {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: config.ratingValue,
    bestRating: config.bestRating || "5",
    worstRating: config.worstRating || "1",
    ratingCount: config.ratingCount,
    reviewCount: config.reviewCount,
  };
};

/**
 * Format date for schema.org
 */
export const formatSchemaDate = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toISOString();
};

/**
 * Generate Open Graph meta tags object
 */
export const generateOpenGraphTags = (config) => {
  return {
    "og:type": config.type || "website",
    "og:url": config.url,
    "og:title": config.title,
    "og:description": config.description,
    "og:image": config.image,
    "og:image:alt": config.imageAlt || config.title,
  };
};

/**
 * Generate Twitter Card meta tags object
 */
export const generateTwitterCardTags = (config) => {
  return {
    "twitter:card": config.cardType || "summary_large_image",
    "twitter:url": config.url,
    "twitter:title": config.title,
    "twitter:description": config.description,
    "twitter:image": config.image,
  };
};

export const generateLocalBusinessSchema = (config) => {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "WeddingPlanningBusiness"],
    name: config.name,
    description: config.description,
    url: config.url,
    logo: config.logo,
    address: config.address,
    geo: config.geo,
    telephone: config.contact?.telephone,
    email: config.contact?.email,
  };
};

export const generateServiceSchemas = (services) => services.map((service) =>
  generateServiceSchema(service.name, service.description, service.url)
);

export const generateEventSchema = (event) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  name: event.name,
  description: event.description,
  startDate: event.startDate,
  endDate: event.endDate,
  location: event.location,
  offers: event.offers,
});

export const generateWeddingEventSchema = generateEventSchema;
export const generateWeddingBusinessSchema = generateLocalBusinessSchema;

export const generateWeddingServiceSchema = (serviceName, description, url) =>
  generateServiceSchema(serviceName, description, url);

export const generateBridalSuiteSchema = (config = {}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Bridal Suite",
  description: "Bridal preparation and suite services",
  ...config,
});

export const generateVenueSchema = (config = {}) => ({
  "@context": "https://schema.org",
  "@type": "Venue",
  name: config.name || "JP Events Venue",
  description: config.description,
  address: config.address,
});

export const generatePhotographyServiceSchema = (config = {}) =>
  generateServiceSchema(
    config.name || "Wedding Photography",
    config.description || "Professional wedding photography",
    config.url || "https://subadesignsanddecoration.com/portfolio"
  );

export const generateCateringServiceSchema = (config = {}) =>
  generateServiceSchema(
    config.name || "Wedding Catering",
    config.description || "Wedding catering services",
    config.url || "https://subadesignsanddecoration.com/services"
  );

export const generatePriceSpecification = (config = {}) => ({
  "@type": "PriceSpecification",
  priceCurrency: config.currency || "INR",
  price: config.price,
});
