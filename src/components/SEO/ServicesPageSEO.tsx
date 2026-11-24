import React from "react";
import SEOHelmet from "./SEOHelmet";
import { seoConfig } from "../../config/seoConfig";

interface ServicesPageSEOProps {
  children?: React.ReactNode;
  activeService?: string;
  location?: string;
  packageType?: 'premium' | 'standard' | 'budget';
}

const ServicesPageSEO: React.FC<ServicesPageSEOProps> = ({ 
  children, 
  activeService,
  location = 'Hyderabad',
  packageType 
}) => {
  const pageConfig = seoConfig.pages.services;
  const baseUrl = seoConfig.site.url;

  // Enhanced service catalog for wedding business
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "WeddingPlanningBusiness",
    "name": seoConfig.organization.name,
    "description": "Premium wedding planning and decoration services in Hyderabad. Complete wedding solutions for all types of ceremonies and budgets.",
    "url": baseUrl,
    "telephone": seoConfig.organization.telephone,
    "email": seoConfig.organization.email,
    "address": seoConfig.organization.address,
    "areaServed": ["Hyderabad", "Telangana", "India"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Wedding Planning & Decoration Services",
      "description": "Complete range of wedding services for all types of ceremonies and budgets",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Complete Wedding Planning",
            "description": "End-to-end wedding planning from concept to execution. Includes venue selection, vendor management, budget planning, and day-of coordination.",
            "provider": {
              "@type": "Organization",
              "name": seoConfig.organization.name
            },
            "areaServed": ["Hyderabad", "Telangana"],
            "serviceType": "Wedding Planning",
            "serviceOutput": "Stress-free, perfectly executed wedding",
            "audience": {
              "@type": "PeopleAudience",
              "suggestedMinAge": 18,
              "suggestedMaxAge": 60
            }
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": "500000",
            "priceCurrency": "INR",
            "valueAddedTaxIncluded": true
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Wedding Decor Design",
            "description": "Custom wedding decor designs including mandaps, stages, entrance decor, and complete venue transformations. Themed decorations available.",
            "provider": {
              "@type": "Organization", 
              "name": seoConfig.organization.name
            },
            "serviceType": "Wedding Decoration",
            "serviceOutput": "Beautifully decorated wedding venue"
          },
          "priceSpecification": {
            "@type": "PriceSpecification", 
            "price": "200000",
            "priceCurrency": "INR",
            "valueAddedTaxIncluded": true
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Event Design & Styling",
            "description": "Complete design and styling for pre-wedding events, ceremonies, and reception. Includes mehndi, sangeet, cocktail party styling.",
            "provider": {
              "@type": "Organization",
              "name": seoConfig.organization.name
            },
            "serviceType": "Event Styling",
            "serviceOutput": "Cohesive event styling across all wedding functions"
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": "150000", 
            "priceCurrency": "INR",
            "valueAddedTaxIncluded": true
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Destination Wedding Planning",
            "description": "Complete destination wedding coordination at exotic locations across India. Includes travel, accommodation, and local vendor management.",
            "provider": {
              "@type": "Organization",
              "name": seoConfig.organization.name
            },
            "serviceType": "Destination Wedding",
            "serviceOutput": "Seamless destination wedding experience"
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": "800000",
            "priceCurrency": "INR",
            "valueAddedTaxIncluded": true
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Theme Wedding Planning",
            "description": "Custom theme-based weddings including royal, vintage, garden, bohemian, and contemporary themes. Complete theme execution.",
            "provider": {
              "@type": "Organization",
              "name": seoConfig.organization.name
            },
            "serviceType": "Theme Wedding",
            "serviceOutput": "Immersive themed wedding experience"
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": "600000",
            "priceCurrency": "INR",
            "valueAddedTaxIncluded": true
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Budget Wedding Planning", 
            "description": "Beautiful weddings tailored to your budget without compromising on quality. Smart planning and vendor negotiations.",
            "provider": {
              "@type": "Organization",
              "name": seoConfig.organization.name
            },
            "serviceType": "Budget Wedding",
            "serviceOutput": "Quality wedding within specified budget"
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": "250000",
            "priceCurrency": "INR",
            "valueAddedTaxIncluded": true
          }
        }
      ]
    },
    "openingHours": [
      "Mo-Su 09:00-21:00",
      "Ph 10:00-18:00"
    ],
    "priceRange": "₹₹₹₹",
    "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Bank Transfer",
    "currenciesAccepted": "INR"
  };

  // FAQ Schema for services page
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What wedding planning services do you offer in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer complete wedding planning, decoration, destination wedding planning, theme weddings, and budget wedding services. Our packages include venue selection, vendor coordination, budget management, and day-of coordination for stress-free wedding experiences."
        }
      },
      {
        "@type": "Question",
        "name": "How much does wedding planning cost in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "Wedding planning services in Hyderabad typically range from ₹2.5 lakhs for budget packages to ₹8 lakhs+ for premium destination weddings. The cost depends on wedding size, venue, decor complexity, and services required. We offer customized quotes based on your specific needs."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide wedding decoration services separately?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we offer standalone wedding decoration services starting from ₹2 lakhs. This includes mandap decoration, stage setup, entrance decor, lighting, and floral arrangements. We can work with your existing planners or provide complete decor solutions."
        }
      },
      {
        "@type": "Question", 
        "name": "What areas in Hyderabad do you serve for wedding planning?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We serve Hyderabad and surrounding communities, and also handle destination weddings across India and internationally."
        }
      },
      {
        "@type": "Question",
        "name": "How far in advance should I book wedding planning services?",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "We recommend booking 6-12 months in advance for optimal venue and vendor selection. However, we also accommodate last-minute weddings with our express planning services. For destination weddings, 9-12 months advance booking is ideal."
        }
      },
      {
        "@type": "Question",
        "name": "Do you handle different types of wedding ceremonies?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we specialize in all types of wedding ceremonies including Hindu, Muslim, Christian, Sikh, interfaith, South Indian, North Indian, and multicultural weddings. Our team has expertise in diverse cultural traditions and rituals."
        }
      }
    ]
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Wedding Services",
        "item": `${baseUrl}${pageConfig.canonical}`
      },
      ...(activeService ? [{
        "@type": "ListItem",
        "position": 3,
        "name": activeService,
        "item": `${baseUrl}${pageConfig.canonical}#${activeService.toLowerCase().replace(/\s+/g, '-')}`
      }] : [])
    ]
  };

  // Service Aggregator Schema
  const serviceAggregatorSchema = {
    "@context": "https://schema.org",
    "@type": "ServiceChannel",
    "serviceUrl": `${baseUrl}${pageConfig.canonical}`,
    "serviceLocation": {
      "@type": "Place",
      "name": "Hyderabad Wedding Services",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Hyderabad",
        "addressRegion": "Telangana",
        "addressCountry": "IN"
      }
    },
    "providesService": [
      "WeddingPlanningService",
      "EventPlanningService", 
      "DecorationService",
      "ConsultingService"
    ],
    "availableLanguage": ["English", "Hindi", "Kannada", "Tamil", "Telugu"]
  };

  // Enhanced meta tags with dynamic content
  const getEnhancedTitle = () => {
    if (activeService) {
      return `${activeService} in ${location} | ${pageConfig.title}`;
    }
    if (packageType) {
      return `${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Wedding Packages ${location} | ${pageConfig.title}`;
    }
    return pageConfig.title;
  };

  const getEnhancedDescription = () => {
    if (activeService) {
      return `Professional ${activeService.toLowerCase()} in ${location}. ${pageConfig.description} Book free consultation for your dream wedding.`;
    }
    return pageConfig.description;
  };

  const getEnhancedKeywords = () => {
    const baseKeywords = pageConfig.keywords.split(', ');
    const serviceKeywords = activeService ? 
      [`${activeService} ${location}`, `${activeService} cost`, `${activeService} packages`] : 
      [];
    const locationKeywords = [`wedding services ${location}`, `wedding planners ${location}`];
    
    return [...baseKeywords, ...serviceKeywords, ...locationKeywords].join(', ');
  };

  return (
    <SEOHelmet
      title={getEnhancedTitle()}
      description={getEnhancedDescription()}
      keywords={getEnhancedKeywords()}
      canonical={pageConfig.canonical}
      ogTitle={getEnhancedTitle()}
      ogDescription={getEnhancedDescription()}
      ogImage={pageConfig.image}
      ogUrl={`${baseUrl}${pageConfig.canonical}`}
      twitterCard="summary_large_image"
      twitterSite="@weddingplanners"
      structuredData={[servicesSchema, faqSchema, breadcrumbSchema, serviceAggregatorSchema]}
      additionalMeta={[
        {
          name: "robots",
          content: "index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large"
        },
        {
          name: "twitter:image:alt",
          content: "Wedding Planning Services - Complete Wedding Solutions"
        },
        {
          property: "og:image:width",
          content: "1200"
        },
        {
          property: "og:image:height",
          content: "630"
        },
        {
          name: "classification",
          content: "Wedding Planning, Event Management, Wedding Decoration"
        }
      ]}
    >
      {children}
    </SEOHelmet>
  );
};

export default ServicesPageSEO;
