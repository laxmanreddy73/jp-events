import React from "react";
import SEOHelmet from "./SEOHelmet";
import { seoConfig } from "../../config/seoConfig";

const ContactPageSEO: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const pageConfig = seoConfig.pages.contact;
  const baseUrl = seoConfig.site.url;

  // Enhanced Wedding Planning Business Schema
  const weddingBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "WeddingPlanningBusiness",
    "name": seoConfig.organization.name,
    "description": "Premium wedding planning and event management services. Creating unforgettable weddings with complete planning, decoration, and coordination services.",
    "url": baseUrl,
    "telephone": seoConfig.organization.telephone,
    "email": seoConfig.organization.email,
    "image": `${baseUrl}/images/wedding-portfolio/main-showcase.jpg`,
    "address": seoConfig.organization.address,
    "areaServed": ["Hyderabad", "Telangana", "India"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Wedding Planning Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Complete Wedding Planning",
            "description": "End-to-end wedding planning from venue selection to vendor management and day-of coordination"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Wedding Decoration",
            "description": "Stunning wedding venue decoration including mandap, stage, entrance, and reception areas"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Destination Wedding Planning",
            "description": "Complete destination wedding coordination at exotic locations across India"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Theme Wedding Planning",
            "description": "Custom theme-based weddings including royal, vintage, garden, and contemporary themes"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Budget Wedding Planning",
            "description": "Beautiful weddings tailored to your budget without compromising on quality"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Reception Planning",
            "description": "Elegant wedding reception planning with entertainment and guest management"
          }
        }
      ]
    },
    "openingHours": [
      "Mo-Su 09:00-21:00"
    ],
    "priceRange": "₹₹₹₹",
    "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Bank Transfer",
    "currenciesAccepted": "INR",
    "knowsAbout": [
      "Wedding Planning",
      "Event Management",
      "Venue Decoration",
      "Vendor Coordination",
      "Budget Management",
      "Theme Development",
      "Guest Management",
      "Traditional Ceremonies"
    ],
    "serviceArea": ["Hyderabad", "Telangana", "India"],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "wedding consultation",
        "telephone": seoConfig.organization.telephone,
        "email": seoConfig.organization.email,
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi", "Kannada", "Tamil", "Telugu"]
      },
      {
        "@type": "ContactPoint",
        "contactType": "emergency wedding planning",
        "telephone": seoConfig.organization.telephone,
        "email": seoConfig.organization.email,
        "hoursAvailable": "Mo-Su 00:00-23:59"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Anjali Reddy"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Absolutely magical wedding planning! They handled everything from venue booking to decoration perfectly. Our dream wedding came true!"
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Rohit Kumar"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Professional wedding planners who made our destination wedding in Goa stress-free. Every detail was perfect!"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/jpeventsorganizers/",
      "https://www.instagram.com/jp_events__official/",
      "https://www.pinterest.com/weddingplannershyderabad"
    ]
  };

  // FAQ Schema for wedding-related questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How far in advance should we book wedding planners in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We recommend booking 6-12 months in advance for optimal venue and vendor selection. However, we also handle last-minute weddings with our emergency planning services."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide complete wedding planning packages?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we offer comprehensive wedding planning packages that include venue selection, decoration, catering, photography, entertainment, and complete day-of coordination."
        }
      },
      {
        "@type": "Question",
        "name": "What types of weddings do you specialize in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We specialize in South Indian weddings, North Indian weddings, Christian weddings, Muslim weddings, interfaith weddings, destination weddings, and theme-based weddings."
        }
      },
      {
        "@type": "Question",
        "name": "Do you handle destination weddings outside Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! We have extensive experience planning destination weddings in Goa, Kerala, Rajasthan, Uttarakhand, and other popular wedding destinations across India."
        }
      },
      {
        "@type": "Question",
        "name": "What is included in your wedding decoration services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our decoration services include mandap decoration, stage setup, entrance decor, seating arrangements, lighting, floral arrangements, and theme-based venue transformation."
        }
      },
      {
        "@type": "Question",
        "name": "Can you work within our wedding budget?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we create customized wedding plans that respect your budget while delivering exceptional quality. We're experienced in planning weddings from intimate gatherings to grand celebrations."
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
        "name": "Contact Wedding Planners",
        "item": `${baseUrl}${pageConfig.canonical}`
      }
    ]
  };

  return (
    <SEOHelmet
      title={pageConfig.title}
      description={pageConfig.description}
      keywords={pageConfig.keywords}
      canonical={pageConfig.canonical}
      ogTitle={pageConfig.title}
      ogDescription={pageConfig.description}
      ogImage={pageConfig.image}
      ogUrl={`${baseUrl}${pageConfig.canonical}`}
      twitterCard="summary_large_image"
      twitterSite="@weddingplanners"
      structuredData={[weddingBusinessSchema, faqSchema, breadcrumbSchema]}
    >
      {children}
    </SEOHelmet>
  );
};

export default ContactPageSEO;
