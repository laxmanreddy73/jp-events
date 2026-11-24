/**
 * Advanced Schema.org Markup Generation
 * Generates 15+ types of structured data for rich snippets
 */

/**
 * Generate Organization schema
 * @param {Object} config - Organization configuration
 * @returns {Object} JSON-LD schema
 */
export function generateOrganizationSchema(config) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.name,
    url: config.url,
    logo: config.logo,
    description: config.description,
    sameAs: config.socialProfiles || [],
    contact: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: config.phone,
      email: config.email
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.streetAddress,
      addressLocality: config.city,
      addressRegion: config.region,
      postalCode: config.postalCode,
      addressCountry: config.country
    }
  };
}

/**
 * Generate Product schema with reviews and ratings
 * @param {Object} config - Product configuration
 * @returns {Object} JSON-LD schema
 */
export function generateProductSchema(config) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: config.name,
    image: config.image,
    description: config.description,
    brand: {
      '@type': 'Brand',
      name: config.brand
    },
    offers: {
      '@type': 'Offer',
      url: config.url,
      priceCurrency: config.priceCurrency || 'USD',
      price: config.price,
      availability: config.availability || 'https://schema.org/InStock'
    },
    aggregateRating: config.rating ? {
      '@type': 'AggregateRating',
      ratingValue: config.rating.value,
      ratingCount: config.rating.count,
      reviewCount: config.rating.reviewCount
    } : undefined,
    review: config.reviews ? config.reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author
      },
      datePublished: review.date,
      description: review.text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating
      }
    })) : undefined
  };
}

/**
 * Generate Article schema
 * @param {Object} config - Article configuration
 * @returns {Object} JSON-LD schema
 */
export function generateArticleSchema(config) {
  return {
    '@context': 'https://schema.org',
    '@type': config.type || 'BlogPosting',
    headline: config.headline,
    description: config.description,
    image: config.image,
    datePublished: config.datePublished,
    dateModified: config.dateModified || config.datePublished,
    author: {
      '@type': 'Person',
      name: config.author
    },
    publisher: {
      '@type': 'Organization',
      name: config.publisher,
      logo: {
        '@type': 'ImageObject',
        url: config.publisherLogo
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': config.url
    },
    wordCount: config.wordCount,
    articleBody: config.articleBody
  };
}

/**
 * Generate Event schema
 * @param {Object} config - Event configuration
 * @returns {Object} JSON-LD schema
 */
export function generateEventSchema(config) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: config.name,
    description: config.description,
    image: config.image,
    startDate: config.startDate,
    endDate: config.endDate,
    eventStatus: config.status || 'https://schema.org/EventScheduled',
    eventAttendanceMode: config.attendanceMode || 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: config.locationName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: config.streetAddress,
        addressLocality: config.city,
        addressRegion: config.region,
        postalCode: config.postalCode,
        addressCountry: config.country
      }
    },
    organizer: {
      '@type': 'Organization',
      name: config.organizer,
      url: config.organizerUrl
    },
    offers: config.tickets ? {
      '@type': 'Offer',
      url: config.ticketUrl,
      price: config.ticketPrice,
      priceCurrency: config.ticketCurrency || 'USD'
    } : undefined
  };
}

/**
 * Generate FAQPage schema
 * @param {Array} faqs - Array of {question, answer} objects
 * @returns {Object} JSON-LD schema
 */
export function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generate Recipe schema
 * @param {Object} config - Recipe configuration
 * @returns {Object} JSON-LD schema
 */
export function generateRecipeSchema(config) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Recipe',
    name: config.name,
    description: config.description,
    image: config.image,
    author: {
      '@type': 'Person',
      name: config.author
    },
    prepTime: config.prepTime,
    cookTime: config.cookTime,
    totalTime: config.totalTime,
    recipeYield: config.yield,
    recipeIngredient: config.ingredients,
    recipeInstructions: config.instructions.map((instruction, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: instruction
    })),
    recipeCategory: config.category,
    recipeCuisine: config.cuisine,
    aggregateRating: config.rating ? {
      '@type': 'AggregateRating',
      ratingValue: config.rating.value,
      ratingCount: config.rating.count
    } : undefined
  };
}

/**
 * Generate BreadcrumbList schema
 * @param {Array} breadcrumbs - Array of {name, url} objects
 * @returns {Object} JSON-LD schema
 */
export function generateBreadcrumbSchema(breadcrumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
}

/**
 * Generate LocalBusiness schema
 * @param {Object} config - Business configuration
 * @returns {Object} JSON-LD schema
 */
export function generateLocalBusinessSchema(config) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: config.name,
    image: config.image,
    description: config.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.streetAddress,
      addressLocality: config.city,
      addressRegion: config.region,
      postalCode: config.postalCode,
      addressCountry: config.country
    },
    telephone: config.phone,
    url: config.url,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: config.latitude,
      longitude: config.longitude
    },
    openingHoursSpecification: config.hours ? config.hours.map(hour => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hour.day,
      opens: hour.opens,
      closes: hour.closes
    })) : undefined,
    priceRange: config.priceRange,
    aggregateRating: config.rating ? {
      '@type': 'AggregateRating',
      ratingValue: config.rating.value,
      ratingCount: config.rating.count
    } : undefined
  };
}

/**
 * Generate VideoObject schema
 * @param {Object} config - Video configuration
 * @returns {Object} JSON-LD schema
 */
export function generateVideoSchema(config) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: config.name,
    description: config.description,
    thumbnailUrl: config.thumbnail,
    uploadDate: config.uploadDate,
    duration: config.duration,
    contentUrl: config.contentUrl,
    embedUrl: config.embedUrl,
    interactionCount: config.viewCount || 'https://schema.org/InteractionCounter'
  };
}

/**
 * Generate HowTo schema
 * @param {Object} config - HowTo configuration
 * @returns {Object} JSON-LD schema
 */
export function generateHowToSchema(config) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: config.name,
    description: config.description,
    image: config.image,
    totalTime: config.totalTime,
    step: config.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.description,
      image: step.image
    }))
  };
}

/**
 * Generate JobPosting schema
 * @param {Object} config - Job configuration
 * @returns {Object} JSON-LD schema
 */
export function generateJobPostingSchema(config) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: config.title,
    description: config.description,
    datePosted: config.datePosted,
    validThrough: config.validThrough,
    employmentType: config.employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      name: config.companyName,
      sameAs: config.companyUrl,
      logo: config.companyLogo
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: config.streetAddress,
        addressLocality: config.city,
        addressRegion: config.region,
        postalCode: config.postalCode,
        addressCountry: config.country
      }
    },
    baseSalary: {
      '@type': 'PriceSpecification',
      priceCurrency: config.salaryCurrency || 'USD',
      minPrice: config.minSalary,
      maxPrice: config.maxSalary,
      priceValidUntil: config.validThrough
    }
  };
}

/**
 * Generate Course schema
 * @param {Object} config - Course configuration
 * @returns {Object} JSON-LD schema
 */
export function generateCourseSchema(config) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: config.name,
    description: config.description,
    image: config.image,
    courseCode: config.code,
    author: {
      '@type': 'Organization',
      name: config.author
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: config.mode || 'OnlineCoursesMode',
      startDate: config.startDate,
      endDate: config.endDate,
      offers: {
        '@type': 'Offer',
        price: config.price,
        priceCurrency: config.priceCurrency || 'USD'
      }
    },
    aggregateRating: config.rating ? {
      '@type': 'AggregateRating',
      ratingValue: config.rating.value,
      ratingCount: config.rating.count
    } : undefined
  };
}
