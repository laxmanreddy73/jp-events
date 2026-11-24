/**
 * Centralized Advanced SEO Configuration for JP Events Hyderabad
 * Feature flags, API keys, and environment-specific settings for wedding business
 */

const advancedSEOConfig = {
  // Business Information - Wedding Focus
  business: {
    name: "JP Events",
    legalName: "JP Events",
    url: process.env.VITE_SITE_URL || "https://subadesignsanddecoration.com",
    phone: "+91 95339 50636",
    email: "jpevents@gmail.com",
    address: {
      city: "Hyderabad",
      state: "Telangana",
      country: "India"
    },
    services: [
      "Complete Wedding Planning",
      "Wedding Decoration Design",
      "Destination Wedding Planning",
      "Theme Wedding Planning",
      "Budget Wedding Planning",
      "Event Design & Styling",
      "Vendor Coordination",
      "Day-of Coordination"
    ],
    areasServed: ["Hyderabad", "Telangana", "India"],
    weddingTypes: [
      "South Indian Wedding",
      "North Indian Wedding",
      "Christian Wedding",
      "Muslim Wedding",
      "Sikh Wedding",
      "Interfaith Wedding",
      "Destination Wedding",
      "Theme Wedding",
      "Luxury Wedding",
      "Budget Wedding"
    ],
    foundingYear: "2018",
    teamSize: "15",
    weddingsExecuted: "200+",
    awards: [
      "Best Wedding Planners Hyderabad 2023",
      "Luxury Wedding Excellence Award 2022"
    ]
  },

  // Feature Flags - Enhanced for Wedding Business
  features: {
    dynamicOGImages: process.env.VITE_ENABLE_OG_IMAGES !== 'false',
    analytics: process.env.VITE_ENABLE_ANALYTICS !== 'false',
    richSnippets: process.env.VITE_ENABLE_RICH_SNIPPETS !== 'false',
    performanceOptimization: process.env.VITE_ENABLE_PERF_OPT !== 'false',
    contentAnalysis: process.env.VITE_ENABLE_CONTENT_ANALYSIS !== 'false',
    internationalSEO: process.env.VITE_ENABLE_I18N_SEO !== 'false',
    sitemapGeneration: process.env.VITE_ENABLE_SITEMAP !== 'false',
    localSEO: true,
    schemaMarkup: true,
    breadcrumbs: true,
    faqSchema: true,
    weddingSpecificSchemas: true,
    multiLanguageSupport: true,
    portfolioOptimization: true,
    servicePackagesSEO: true,
    reviewSchema: true,
    eventSchema: true
  },

  // Analytics Configuration - Wedding Business Tracking
  analytics: {
    ga4MeasurementId: process.env.VITE_GA4_MEASUREMENT_ID,
    hotjarSiteId: process.env.VITE_HOTJAR_SITE_ID,
    clarityProjectId: process.env.VITE_CLARITY_PROJECT_ID,
    enableScrollTracking: true,
    enableWebVitals: true,
    enableFormTracking: true,
    enableOutboundLinks: true,
    enableSiteSearch: true,
    enableEngagementTracking: true,
    enableConversionTracking: true,
    enableWeddingPackageViews: true,
    enablePortfolioEngagement: true,
    goals: {
      contactForm: 'wedding_consultation_form',
      phoneCall: 'wedding_planning_call',
      serviceInquiry: 'wedding_package_inquiry',
      portfolioView: 'wedding_portfolio_view',
      packageSelection: 'wedding_package_selected',
      consultationBooked: 'free_consultation_booked'
    },
    customDimensions: {
      weddingType: 'wedding_type',
      budgetRange: 'budget_range',
      guestCount: 'guest_count',
      preferredVenue: 'preferred_venue',
      servicePackage: 'service_package'
    }
  },

  // OG Image Configuration - Wedding Themed
  ogImages: {
    baseUrl: process.env.VITE_OG_IMAGE_BASE_URL || '/og-images',
    defaultTemplate: 'wedding-default',
    cacheDuration: 86400, // 24 hours
    templates: {
      'wedding-default': {
        width: 1200,
        height: 630,
        format: 'png',
        backgroundColor: '#8B4513', // Wedding brown
        textColor: '#FFFFFF',
        accentColor: '#FFD700' // Gold accent
      },
      'wedding-service': {
        width: 1200,
        height: 630,
        format: 'png',
        backgroundColor: '#2F4F4F', // Dark slate
        textColor: '#FFFFFF',
        accentColor: '#DAA520' // Golden rod
      },
      'wedding-portfolio': {
        width: 1200,
        height: 1200,
        format: 'png',
        backgroundColor: '#4B0082', // Indigo
        textColor: '#FFFFFF',
        accentColor: '#FF69B4' // Hot pink
      },
      'wedding-contact': {
        width: 1200,
        height: 630,
        format: 'png',
        backgroundColor: '#2E8B57', // Sea green
        textColor: '#FFFFFF',
        accentColor: '#FFD700' // Gold
      },
      'wedding-package': {
        width: 1200,
        height: 630,
        format: 'png',
        backgroundColor: '#800020', // Burgundy
        textColor: '#FFFFFF',
        accentColor: '#C9A96E' // Champagne gold
      }
    },
    dynamicText: {
      companyName: "JP Events",
      tagline: "Creating Unforgettable Wedding Experiences",
      phone: "+91 98765 43210",
      weddingTagline: "Your Dream Wedding, Perfectly Planned",
      freeConsultation: "Free Wedding Consultation Available"
    }
  },

  // Performance SEO - Wedding Site Optimized
  performance: {
    lazyLoadImages: true,
    lazyLoadThreshold: 100, // pixels for portfolio images
    generateBlurPlaceholders: true,
    imageFormats: ['webp', 'avif', 'jpg'],
    fontDisplayStrategy: 'swap',
    criticalCSSInline: true,
    preloadCriticalAssets: true,
    enableCompression: true,
    enableCaching: true,
    cacheTtl: 31536000, // 1 year
    minifyAssets: true,
    optimizeWeddingImages: true,
    portfolioImageOptimization: true,
    enableImageCDN: true,
    criticalResources: [
      '/fonts/wedding-script.woff2',
      '/images/wedding-hero.jpg',
      '/css/wedding-critical.css'
    ]
  },

  // Content Analysis - Wedding Business Focused
  contentAnalysis: {
    minContentLength: 500,
    maxContentLength: 5000,
    targetReadability: '60-70',
    targetKeywordDensity: '0.5-3%',
    requiredElements: {
      h1: { min: 1, max: 1 },
      h2: { min: 3, max: 15 },
      images: { min: 3, max: 50 },
      internalLinks: { min: 5, max: 100 },
      externalLinks: { min: 2, max: 20 }
    },
    keywordTargets: {
      primary: [
        'wedding planners hyderabad',
        'luxury wedding planners',
        'destination wedding planners',
        'wedding decoration hyderabad'
      ],
      secondary: [
        'wedding planning services',
        'theme wedding planners',
        'budget wedding packages',
        'wedding coordinators hyderabad'
      ],
      local: [
        'wedding planners near me',
        'hyderabad wedding planners',
        'wedding planners in Telangana'
      ],
      serviceSpecific: [
        'south indian wedding planners',
        'christian wedding planners hyderabad',
        'muslim wedding planners',
        'interfaith wedding planning'
      ]
    },
    weddingContentStandards: {
      includePricingRanges: true,
      includeServicePackages: true,
      includePortfolioSamples: true,
      includeClientTestimonials: true,
      includeFAQs: true,
      includeContactCTAs: true
    }
  },

  // Local SEO Configuration - Wedding Business Specific
  localSEO: {
    serviceAreas: ["Hyderabad, Telangana", "Destination weddings across India"],
    destinationAreas: [
      "Goa, India",
      "Kerala, India",
      "Udaipur, Rajasthan",
      "Jaipur, Rajasthan",
      "Mysore, Karnataka"
    ],
    businessHours: {
      monday: { open: "09:00", close: "21:00" },
      tuesday: { open: "09:00", close: "21:00" },
      wednesday: { open: "09:00", close: "21:00" },
      thursday: { open: "09:00", close: "21:00" },
      friday: { open: "09:00", close: "21:00" },
      saturday: { open: "09:00", close: "21:00" },
      sunday: { open: "10:00", close: "18:00" }
    },
    priceRange: "₹₹₹₹", // Premium pricing for wedding services
    paymentMethods: [
      "Cash",
      "Credit Card",
      "Debit Card",
      "UPI",
      "Bank Transfer",
      "EMI Options"
    ],
    amenities: [
      "Free Wedding Consultation",
      "3D Wedding Design Visualization",
      "Complete Vendor Management",
      "Budget Planning Services",
      "Multiple Wedding Package Options",
      "Destination Wedding Coordination"
    ],
    weddingSpecific: {
      venueTypes: [
        "Luxury Hotels",
        "Destination Resorts",
        "Heritage Palaces",
        "Beach Venues",
        "Garden Weddings",
        "Banquet Halls"
      ],
      guestCapacity: "50-2000 guests",
      culturalExpertise: [
        "South Indian Traditions",
        "North Indian Customs",
        "Christian Ceremonies",
        "Muslim Nikah",
        "Interfaith Weddings"
      ]
    }
  },

  // Schema Markup Configuration - Wedding Enhanced
  schemaMarkup: {
    enableLocalBusiness: true,
    enableService: true,
    enableFAQ: true,
    enableBreadcrumb: true,
    enableReview: true,
    enableProduct: false,
    enableEvent: true,
    enableArticle: true,
    enableWeddingBusiness: true,
    enableServicePackage: true,
    enablePortfolioGallery: true,
    enableAggregateRating: true,
    enableContactPoint: true,
    enableOpeningHours: true,
    enablePriceRange: true,
    enableServiceArea: true
  },

  // International SEO - Wedding Destination Focus
  internationalization: {
    defaultLanguage: 'en',
    defaultRegion: 'IN',
    supportedLanguages: ['en', 'hi', 'kn', 'ta', 'te'],
    generateHreflangs: true,
    generateMultipleSitemaps: true,
    regionalTargeting: {
      country: 'IN',
      region: 'KA',
      city: 'Hyderabad'
    },
    destinationMarkets: [
      { country: 'US', language: 'en', region: 'US' },
      { country: 'GB', language: 'en', region: 'GB' },
      { country: 'AE', language: 'ar', region: 'AE' },
      { country: 'FR', language: 'fr', region: 'FR' }
    ],
    weddingKeywordsByLanguage: {
      en: [
        'wedding planners hyderabad',
        'luxury wedding planners india',
        'destination wedding india'
      ],
      hi: [
        'वेडिंग प्लानर्स बैंगलोर',
        'शादी की योजना बनाने वाले',
        'डेस्टिनेशन वेडिंग'
      ],
      kn: [
        'ಮದುವೆ ಯೋಜಕರು ಬೆಂಗಳೂರು',
        'ವಿಲಾಸಿ ಮದುವೆ ಯೋಜಕರು',
        'ಗಮ್ಯಸ್ಥಾನ ಮದುವೆ'
      ]
    }
  },

  // Sitemap Configuration - Wedding Content Focus
  sitemap: {
    baseUrl: process.env.VITE_SITE_URL || 'https://subadesignsanddecoration.com',
    maxUrls: 2000,
    includeImages: true,
    includeVideos: true,
    includeNews: false,
    updateFrequency: 'weekly',
    priority: {
      home: 1.0,
      services: 0.9,
      portfolio: 0.9,
      about: 0.7,
      contact: 0.9,
      'wedding-packages': 0.8,
      'destination-weddings': 0.8,
      'theme-weddings': 0.8
    },
    changefreq: {
      home: 'daily',
      services: 'weekly',
      portfolio: 'weekly',
      about: 'monthly',
      contact: 'monthly',
      'wedding-packages': 'monthly',
      'destination-weddings': 'monthly',
      blog: 'weekly'
    },
    weddingSpecific: {
      includePortfolioItems: true,
      includeServicePages: true,
      includePackagePages: true,
      includeTestimonialPages: true,
      includeFAQPages: true
    }
  },

  // Social Media Configuration - Wedding Platforms
  social: {
    platforms: {
      facebook: process.env.VITE_FACEBOOK_PAGE,
      instagram: process.env.VITE_INSTAGRAM_HANDLE,
      pinterest: process.env.VITE_PINTEREST_PROFILE,
      youtube: process.env.VITE_YOUTUBE_CHANNEL,
      linkedin: process.env.VITE_LINKEDIN_COMPANY,
      weddingWire: process.env.VITE_WEDDINGWIRE_PROFILE,
      shaadiSaga: process.env.VITE_SHAADISAGA_PROFILE
    },
    sharing: {
      enableOpenGraph: true,
      enableTwitterCards: true,
      enablePinterestRichPins: true,
      enableFacebookSharing: true,
      enableInstagramSharing: true
    },
    weddingHashtags: [
      '#WeddingPlannersHyderabad',
      '#LuxuryWeddings',
      '#DestinationWedding',
      '#HyderabadWedding',
      '#WeddingPlanning',
      '#BridalGoals'
    ]
  },

  // SEO Best Practices - Wedding Industry
  bestPractices: {
    enforceHTTPS: true,
    preferWWW: false,
    enforceCanonical: true,
    enableStructuredData: true,
    enableSocialMeta: true,
    enableRobotsTxt: true,
    enableXMLSitemap: true,
    enableHumansTxt: false,
    enableSecurityHeaders: true,
    enableImageOptimization: true,
    enableLazyLoading: true,
    enableCoreWebVitals: true,
    enableMobileOptimization: true,
    weddingIndustryStandards: {
      includePricingTransparency: true,
      includePortfolioSamples: true,
      includeClientReviews: true,
      includeServiceDetails: true,
      includeContactOptions: true
    }
  },

  // Monitoring & Reporting - Wedding Business KPIs
  monitoring: {
    enableUptimeMonitoring: true,
    enablePerformanceMonitoring: true,
    enableSEORankingTracking: true,
    enableBacklinkMonitoring: true,
    enableCompetitorTracking: true,
    reportingFrequency: 'weekly',
    alertThresholds: {
      uptime: 99.8,
      performance: 85,
      coreWebVitals: 90,
      conversionRate: 2.0,
      bounceRate: 40
    },
    weddingKPIs: {
      consultationRequests: true,
      packageInquiries: true,
      portfolioViews: true,
      contactFormSubmissions: true,
      phoneCallConversions: true
    }
  },

  // Wedding Business Specific Configuration
  weddingBusiness: {
    packageTiers: {
      premium: {
        priceRange: '₹800,000+',
        features: ['Destination Weddings', 'Luxury Venues', 'Complete Planning']
      },
      standard: {
        priceRange: '₹400,000 - ₹800,000',
        features: ['Complete Planning', 'Vendor Management', 'Day Coordination']
      },
      budget: {
        priceRange: '₹250,000 - ₹400,000',
        features: ['Essential Planning', 'Budget Management', 'Basic Coordination']
      }
    },
    peakSeasons: ['November', 'December', 'January', 'February'],
    planningTimeline: {
      standard: '6-12 months',
      express: '3-6 months',
      destination: '9-15 months'
    },
    teamStructure: {
      weddingPlanners: 8,
      decorDesigners: 3,
      coordinators: 4,
      supportStaff: 5
    }
  },

  // Environment-specific overrides
  ...(process.env.NODE_ENV === 'production' && {
    analytics: {
      ga4MeasurementId: process.env.VITE_GA4_PRODUCTION_ID,
      enableFullTracking: true,
      enableEnhancedEcommerce: true,
      enableUserIDTracking: true,
      enableCrossDomainTracking: true
    },
    features: {
      dynamicOGImages: true,
      analytics: true,
      performanceOptimization: true,
      contentAnalysis: true,
      internationalSEO: true
    },
    monitoring: {
      enableRealTimeAlerts: true,
      enableCompetitorAnalysis: true,
      enableRankTracking: true
    }
  }),

  // Development overrides
  ...(process.env.NODE_ENV === 'development' && {
    features: {
      analytics: false,
      dynamicOGImages: false,
      performanceOptimization: true // Keep for testing
    },
    analytics: {
      enableDebugMode: true,
      enableDevelopmentTracking: false
    }
  })
};

// Utility functions
export const getBusinessInfo = () => advancedSEOConfig.business;
export const isFeatureEnabled = (feature) => advancedSEOConfig.features[feature];
export const getAnalyticsConfig = () => advancedSEOConfig.analytics;
export const getLocalSEOConfig = () => advancedSEOConfig.localSEO;
export const getSitemapConfig = () => advancedSEOConfig.sitemap;
export const getWeddingBusinessConfig = () => advancedSEOConfig.weddingBusiness;
export const getInternationalConfig = () => advancedSEOConfig.internationalization;

// Wedding-specific utility functions
export const getWeddingPackageTiers = () => advancedSEOConfig.weddingBusiness.packageTiers;
export const getWeddingServiceAreas = () => advancedSEOConfig.localSEO.serviceAreas;
export const getWeddingKeywords = (language = 'en') => 
  advancedSEOConfig.internationalization.weddingKeywordsByLanguage[language] || 
  advancedSEOConfig.internationalization.weddingKeywordsByLanguage.en;

export const getWeddingSchemaTypes = () => ({
  enabled: advancedSEOConfig.schemaMarkup,
  types: Object.keys(advancedSEOConfig.schemaMarkup).filter(key => 
    key.startsWith('enable') && advancedSEOConfig.schemaMarkup[key]
  )
});

export default advancedSEOConfig;
