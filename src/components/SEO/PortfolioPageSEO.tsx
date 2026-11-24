import React from "react";
import SEOHelmet from "./SEOHelmet";
import { seoConfig } from "../../config/seoConfig";

interface PortfolioPageSEOProps {
  children?: React.ReactNode;
  portfolioItems?: Array<{
    title: string;
    description: string;
    image: string;
    weddingType: string;
    venue: string;
    location: string;
    date: string;
    galleryImages?: string[];
  }>;
  currentFilter?: string;
}

const PortfolioPageSEO: React.FC<PortfolioPageSEOProps> = ({ 
  children, 
  portfolioItems = [],
  currentFilter 
}) => {
  const pageConfig = seoConfig.pages.portfolio;
  const baseUrl = seoConfig.site.url;

  // Enhanced portfolio schema for wedding business
  const portfolioSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageConfig.title,
    "description": pageConfig.description,
    "url": `${baseUrl}${pageConfig.path}`,
    "creator": {
      "@type": "Organization",
      "name": seoConfig.organization.name,
      "description": "Premium wedding planning and decoration services in Hyderabad",
      "url": baseUrl,
      "telephone": seoConfig.organization.telephone,
      "email": seoConfig.organization.email,
      "address": {
        "@type": "PostalAddress",
        ...seoConfig.organization.address
      }
    },
    "about": {
      "@type": "Service",
      "name": "Wedding Planning & Decoration",
      "description": "Complete wedding planning, decoration, and coordination services for all types of weddings",
      "serviceType": [
        "Wedding Planning",
        "Wedding Decoration", 
        "Event Coordination",
        "Destination Weddings",
        "Theme Weddings"
      ]
    },
    "hasPart": portfolioItems.map((item, index) => ({
      "@type": "CreativeWork",
      "position": index + 1,
      "name": item.title,
      "description": item.description,
      "image": item.image,
      "about": {
        "@type": "Event",
        "eventType": "Wedding",
        "name": item.title,
        "description": item.description,
        "image": item.image,
        "location": {
          "@type": "Place",
          "name": item.venue,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": item.location
          }
        },
        "performer": {
          "@type": "Organization",
          "name": seoConfig.organization.name
        }
      }
    }))
  };

  // Image gallery schema for rich results
  const imageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": `${seoConfig.organization.name} Wedding Portfolio`,
    "description": "Gallery of beautifully executed weddings and events",
    "url": `${baseUrl}${pageConfig.path}`,
    "mainEntity": portfolioItems.slice(0, 10).map((item, index) => ({
      "@type": "ImageObject",
      "position": index + 1,
      "name": item.title,
      "description": item.description,
      "contentUrl": item.image,
      "thumbnailUrl": item.image,
      "acquireLicensePage": `${baseUrl}${pageConfig.path}`,
      "creator": {
        "@type": "Organization",
        "name": seoConfig.organization.name
      },
      "copyrightNotice": seoConfig.organization.name,
      "about": {
        "@type": "Event",
        "name": item.title,
        "description": `Wedding portfolio - ${item.weddingType} at ${item.venue}`,
        "eventType": "Wedding"
      }
    }))
  };

  // Breadcrumb schema
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
        "name": "Wedding Portfolio",
        "item": `${baseUrl}${pageConfig.path}`
      },
      ...(currentFilter ? [{
        "@type": "ListItem",
        "position": 3,
        "name": currentFilter,
        "item": `${baseUrl}${pageConfig.path}?filter=${encodeURIComponent(currentFilter)}`
      }] : [])
    ]
  };

  // FAQ schema for portfolio page
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What types of weddings are featured in your portfolio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our portfolio showcases diverse wedding styles including South Indian weddings, North Indian weddings, Christian weddings, Muslim weddings, destination weddings, theme weddings, and intimate ceremonies. We specialize in both traditional and contemporary wedding designs."
        }
      },
      {
        "@type": "Question",
        "name": "How many weddings have you planned in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We have successfully planned and executed over 200+ weddings across Hyderabad and destination locations. Our experience includes weddings at premium venues like Taj, Leela Palace, ITC Gardenia, and exclusive heritage properties."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide complete wedding planning or just decoration?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer comprehensive wedding planning services including complete decoration, vendor coordination, budget management, and day-of coordination. Our end-to-end approach ensures a seamless and stress-free wedding experience."
        }
      },
      {
        "@type": "Question",
        "name": "Can you work with our specific wedding theme and budget?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! We specialize in creating customized wedding experiences that align with your unique theme, cultural requirements, and budget constraints. Our portfolio demonstrates our versatility across various themes and price points."
        }
      },
      {
        "@type": "Question",
        "name": "How far in advance should we book your wedding planning services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We recommend booking 6-12 months in advance for optimal planning and vendor selection. However, we also accommodate last-minute weddings with our express planning services. View our portfolio to see weddings planned within tight timelines."
        }
      }
    ]
  };

  // Enhanced meta tags for portfolio filters
  const getEnhancedTitle = () => {
    if (currentFilter) {
      return `${currentFilter} Weddings Portfolio | ${pageConfig.title}`;
    }
    return pageConfig.title;
  };

  const getEnhancedDescription = () => {
    if (currentFilter) {
      return `Browse our stunning ${currentFilter.toLowerCase()} wedding portfolio. ${pageConfig.description} Real weddings, real stories, exceptional results.`;
    }
    return pageConfig.description;
  };

  const getEnhancedKeywords = () => {
    const baseKeywords = pageConfig.keywords.split(', ');
    const filterKeywords = currentFilter ? 
      [`${currentFilter} wedding portfolio`, `${currentFilter} wedding photos`, `${currentFilter} wedding decoration`] : 
      [];
    
    return [...baseKeywords, ...filterKeywords].join(', ');
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
      structuredData={[portfolioSchema, imageGallerySchema, breadcrumbSchema, faqSchema]}
      additionalMeta={[
        {
          name: "robots",
          content: "index, follow, max-image-preview:large"
        },
        {
          name: "twitter:image:alt",
          content: "Wedding Portfolio - Real Wedding Photos & Decorations"
        },
        {
          property: "og:image:width",
          content: "1200"
        },
        {
          property: "og:image:height", 
          content: "630"
        },
        ...(portfolioItems.length > 0 ? [
          {
            property: "og:image",
            content: portfolioItems[0].image
          },
          {
            property: "og:image:secure_url",
            content: portfolioItems[0].image
          }
        ] : [])
      ]}
    >
      {children}
    </SEOHelmet>
  );
};

export default PortfolioPageSEO;
