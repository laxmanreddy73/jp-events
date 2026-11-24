// SEO Configuration for Wedding Designs & Decoration - Enhanced Version
// Define page-specific metadata and structured data for wedding design and decoration services

export const seoConfig = {
  site: {
    name: "JP Events",
    url: process.env.VITE_SITE_URL || "https://subadesignsanddecoration.com",
    description: "Hyderabad's premier wedding design and decoration specialists offering complete wedding planning, venue decoration, mandap design, and event styling services. Create your dream wedding with expert designers.",
    image: "https://i.postimg.cc/N0GBD93K/pexels-abhishek-nigam-582276386-30482897.jpg",
    twitterHandle: "@subadesigns",
    locale: "en_IN",
    type: "WeddingPlanningBusiness",
    phone: "+919533950636",
    email: "jpevents@gmail.com",
    address: "Hyderabad, Telangana, India"
  },
  
  pages: {
    home: {
      path: "/",
      title: "JP Events | Premium Wedding Designers & Decorators in Hyderabad",
      description: "Top wedding designers in Hyderabad offering complete wedding decoration, mandap design, venue styling, and wedding planning services. Transform your wedding with expert design solutions. Call +919533950636.",
      keywords: "wedding designers hyderabad, wedding decoration, mandap designers, venue decoration, wedding planners, wedding stage design, bridal stage decoration, wedding decorators near me",
      image: "https://i.postimg.cc/Z5tQwgM9/pexels-mastercowley-1128783.jpg",
      canonical: "/",
      type: "website",
      structuredData: {
        "@type": "WeddingPlanningBusiness",
        "serviceType": ["WeddingDecoration", "MandapDesign", "VenueStyling", "EventPlanning"],
        "areaServed": {
          "@type": "City",
          "name": "Hyderabad"
        }
      }
    },
    about: {
      path: "/about",
      title: "About JP Events | Expert Wedding Decorators in Hyderabad",
      description: "Meet JP Events - Hyderabad's trusted wedding design studio. Specializing in wedding decoration, mandap design, venue styling, and complete wedding planning with creative excellence.",
      keywords: "about wedding designers, wedding decoration team hyderabad, experienced wedding decorators, mandap designers, venue styling experts, wedding planners",
      image: "https://i.postimg.cc/rm3jKR6d/pexels-fotographiya-wedding-photography-823737813-29470577.jpg",
      canonical: "/about",
      type: "website",
      structuredData: {
        "@type": "AboutPage",
        "mainEntity": {
          "@type": "WeddingPlanningBusiness",
          "name": "JP Events"
        }
      }
    },
    services: {
      path: "/services",
      title: "Wedding Decoration Services Hyderabad | Mandap Design & Venue Styling",
      description: "Professional wedding decoration services in Hyderabad. Mandap design, stage decoration, venue styling, theme weddings, and complete wedding planning. Free consultation available.",
      keywords: "wedding decoration services hyderabad, mandap design, wedding stage decoration, venue styling, theme wedding decor, wedding planners, bridal decoration, wedding venue designers",
      image: "https://i.postimg.cc/HsBmRTbJ/pexels-fliqaindia-30169488.jpg",
      canonical: "/services",
      type: "website",
      structuredData: {
        "@type": "Service",
        "serviceType": "WeddingDecoration",
        "provider": {
          "@type": "WeddingPlanningBusiness",
          "name": "JP Events"
        },
        "areaServed": "Hyderabad, Telangana"
      }
    },
    portfolio: {
      path: "/portfolio",
      title: "Wedding Decoration Portfolio | Mandap & Venue Designs - JP Events Hyderabad",
      description: "Browse our wedding decoration portfolio featuring mandap designs, stage decorations, venue styling, and complete wedding setups in Hyderabad. South Indian, North Indian, and theme wedding decorations.",
      keywords: "wedding decoration portfolio hyderabad, mandap design photos, wedding stage decoration gallery, venue styling projects, hyderabad wedding decorators portfolio, bridal decoration examples",
      image: "https://i.postimg.cc/pL2pw7D1/pexels-anish-bindoriya-1957073-28200149.jpg",
      canonical: "/portfolio",
      type: "website",
      structuredData: {
        "@type": "CollectionPage",
        "about": {
          "@type": "WeddingPlanningBusiness",
          "name": "JP Events"
        }
      }
    },
    invitations: {
      path: "/invitations",
      title: "Wedding Invitations | Custom Design & Printing - JP Events Hyderabad",
      description: "Beautiful custom wedding invitations and wedding cards designed by JP Events Hyderabad. Personalized invitation designs for South Indian, North Indian, and theme weddings.",
      keywords: "wedding invitations hyderabad, custom wedding cards, invitation designers, wedding card printing, personalized wedding invitations, digital wedding invites",
      image: "https://i.postimg.cc/Zq6KszRQ/pexels-dk121-3865895.jpg",
      canonical: "/invitations",
      type: "website",
      structuredData: {
        "@type": "Service",
        "serviceType": "WeddingInvitationDesign",
        "provider": {
          "@type": "WeddingPlanningBusiness",
          "name": "JP Events"
        }
      }
    },
    contact: {
      path: "/contact",
      title: "Contact Wedding Decorators Hyderabad | Free Consultation | +919533950636",
      description: "Contact JP Events Hyderabad for wedding decoration consultation. Call +919533950636 for mandap design, venue styling, stage decoration, and complete wedding planning services. Get free quote.",
      keywords: "contact wedding decorators, wedding decoration consultation hyderabad, get wedding decor quote, mandap design consultation, venue styling contact",
      image: "https://i.postimg.cc/D0PjWy71/pexels-asadphoto-169198.jpg",
      canonical: "/contact",
      type: "website",
      structuredData: {
        "@type": "ContactPage",
        "mainEntity": {
          "@type": "WeddingPlanningBusiness",
          "name": "JP Events"
        }
      }
    }
  },

  // Enhanced Organization Schema for Wedding Design Business
  organization: {
    "@context": "https://schema.org",
    "@type": "WeddingPlanningBusiness",
    "name": "JP Events",
    "description": "Premier wedding design and decoration services in Hyderabad offering complete wedding decoration, mandap design, venue styling, and wedding planning solutions.",
    "url": "https://subadesignsanddecoration.com",
    "telephone": "+919533950636",
    "email": "jpevents@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Hyderabad",
      "addressRegion": "Telangana",
      "addressCountry": "IN"
    },
    "openingHours": "Mo-Su 09:00-20:00",
    "areaServed": {
      "@type": "City",
      "name": "Hyderabad"
    },
    "serviceType": [
      "Wedding Decoration",
      "Mandap Design",
      "Venue Styling",
      "Stage Decoration",
      "Wedding Planning",
      "Theme Wedding Design"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Wedding Design Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Complete Wedding Decoration",
            "description": "Full wedding venue decoration including mandap, stage, entrance, and seating area design"
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": "150000",
            "priceCurrency": "INR"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Mandap Design & Decoration",
            "description": "Custom mandap design with floral decorations, lighting, and traditional elements"
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": "80000",
            "priceCurrency": "INR"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Stage Decoration",
            "description": "Bridal stage design with backdrop, floral arrangements, and decorative elements"
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": "60000",
            "priceCurrency": "INR"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Theme Wedding Design",
            "description": "Complete theme-based wedding decoration with customized design elements"
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": "250000",
            "priceCurrency": "INR"
          }
        }
      ]
    },
    "founder": {
      "@type": "Person",
      "name": "Narasimhamurthy"
    },
    "foundingDate": "2020",
    "numberOfEmployees": "5",
    "knowsAbout": [
      "South Indian Wedding Decoration",
      "North Indian Wedding Decor",
      "Mandap Design",
      "Stage Decoration",
      "Venue Styling",
      "Floral Arrangements",
      "Lighting Design",
      "Theme Wedding Planning"
    ]
  },

  // Enhanced Local Business Schema for Google My Business
  localBusiness: {
    "@context": "https://schema.org",
    "@type": "WeddingPlanningBusiness",
    "name": "JP Events",
    "image": "https://i.postimg.cc/wBVfwjCM/pexels-kewal-nagda-1669654142-27824432.jpg",
    "description": "Hyderabad's premier wedding design studio offering complete wedding decoration, mandap design, venue styling, and wedding planning services",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Hyderabad",
      "addressRegion": "Telangana",
      "addressCountry": "India"
    },
    "url": "https://subadesignsanddecoration.com",
    "telephone": "+919533950636",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification", 
        "dayOfWeek": "Sunday",
        "opens": "10:00",
        "closes": "18:00"
      }
    ],
    "priceRange": "₹₹₹",
    "areaServed": ["Hyderabad", "Telangana", "India"],
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Bank Transfer",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Wedding Design Services",
      "itemListElement": [
        "Wedding Decoration",
        "Mandap Design", 
        "Stage Decoration",
        "Venue Styling",
        "Theme Weddings",
        "Wedding Planning"
      ]
    }
  },

  // Enhanced Breadcrumb Schema
  breadcrumb: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://subadesignsanddecoration.com"
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Wedding Services",
        "item": "https://subadesignsanddecoration.com/services"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Wedding Portfolio",
        "item": "https://subadesignsanddecoration.com/portfolio"
      },
      {
        "@type": "ListItem",
        "position": 4, 
        "name": "Contact Us",
        "item": "https://subadesignsanddecoration.com/contact"
      }
    ]
  },

  // Enhanced FAQ Schema for Wedding Design Business
  faq: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What wedding decoration services do you offer in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer complete wedding decoration services including mandap design, stage decoration, venue styling, entrance design, seating arrangements, lighting design, and floral decorations for all types of weddings in Hyderabad."
        }
      },
      {
        "@type": "Question",
        "name": "How much does wedding decoration cost in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "Wedding decoration costs in Hyderabad typically range from ₹80,000 for basic mandap design to ₹2,50,000+ for complete theme-based wedding decoration. The cost depends on venue size, design complexity, floral requirements, and specific elements requested."
        }
      },
      {
        "@type": "Question",
        "name": "What areas in Hyderabad do you serve for wedding decoration?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We serve Hyderabad and surrounding communities, with destination wedding services available across India."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide wedding invitation design services?",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "Yes, we offer custom wedding invitation design services including traditional South Indian wedding cards, contemporary designs, digital invitations, and complete printing services to match your wedding theme and decoration."
        }
      },
      {
        "@type": "Question",
        "name": "How far in advance should I book wedding decoration services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We recommend booking 3-6 months in advance for optimal planning and design execution. However, we also accommodate last-minute bookings based on availability. For peak wedding season (Nov-Feb), early booking is highly recommended."
        }
      },
      {
        "@type": "Question",
        "name": "Do you handle different types of wedding ceremonies?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we specialize in all types of wedding ceremonies including Hindu weddings (South Indian & North Indian), Christian weddings, Muslim weddings, Sikh weddings, and interfaith weddings with appropriate traditional elements and decorations."
        }
      }
    ]
  },

  // Wedding Service Areas Configuration
  serviceAreas: {
    primary: "Hyderabad",
    areas: ["Hyderabad", "Telangana"]
  },

  // Wedding Types Configuration
  weddingTypes: {
    cultural: [
      "South Indian Wedding",
      "North Indian Wedding", 
      "Christian Wedding",
      "Muslim Wedding",
      "Sikh Wedding",
      "Interfaith Wedding"
    ],
    styles: [
      "Traditional Wedding Decoration",
      "Contemporary Wedding Design",
      "Theme Wedding Decoration",
      "Luxury Wedding Styling",
      "Minimalist Wedding Design",
      "Royal Wedding Decoration"
    ]
  }
};

// Enhanced page configuration with structured data
export const getPageConfig = (pathname) => {
  const page = Object.values(seoConfig.pages).find(p => p.path === pathname);
  return page || seoConfig.pages.home;
};

// Generate complete structured data for any page
export const generateStructuredData = (pageConfig, additionalData = {}) => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": pageConfig.structuredData?.["@type"] || "WebPage",
    "name": pageConfig.title,
    "description": pageConfig.description,
    "url": `${seoConfig.site.url}${pageConfig.canonical}`,
    "mainEntity": pageConfig.structuredData?.mainEntity
  };

  return {
    ...baseData,
    ...additionalData
  };
};

// Generate wedding business structured data
export const generateWeddingBusinessData = (customData = {}) => {
  return {
    ...seoConfig.organization,
    ...customData
  };
};

// Generate local business structured data
export const generateLocalBusinessData = () => {
  return seoConfig.localBusiness;
};

// Generate organization structured data  
export const generateOrganizationData = () => {
  return seoConfig.organization;
};

// Generate breadcrumb structured data
export const generateBreadcrumbData = (breadcrumbs = []) => {
  const baseBreadcrumb = {...seoConfig.breadcrumb};
  
  if (breadcrumbs.length > 0) {
    baseBreadcrumb.itemListElement = breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }));
  }
  
  return baseBreadcrumb;
};

// Generate FAQ structured data
export const generateFAQData = (additionalQuestions = []) => {
  const baseFAQ = {...seoConfig.faq};
  
  if (additionalQuestions.length > 0) {
    baseFAQ.mainEntity = [...baseFAQ.mainEntity, ...additionalQuestions];
  }
  
  return baseFAQ;
};

// Generate wedding event schema
export const generateWeddingEventSchema = (eventData) => {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": eventData.name,
    "description": eventData.description,
    "startDate": eventData.date,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": eventData.venue,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": eventData.location
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": seoConfig.organization.name,
      "url": seoConfig.site.url
    },
    "performer": {
      "@type": "Organization",
      "name": seoConfig.organization.name
    }
  };
};

// Generate service area schema
export const generateServiceAreaSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "provider": {
      "@type": "WeddingPlanningBusiness",
      "name": seoConfig.organization.name
    },
    "areaServed": seoConfig.serviceAreas.areas.map(area => ({
      "@type": "City",
      "name": area
    })),
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": seoConfig.site.url
    }
  };
};

// Export default for easier imports
export default seoConfig;
