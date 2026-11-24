import React from "react";
import SEOHead from "./SEOHead";
import StructuredData from "./StructuredData";
import { generateOrganizationSchema, generateWebsiteSchema, generateLocalBusinessSchema, generateServiceSchemas } from "../../utils/seoHelpers";
import { seoConfig } from "../../config/seoConfig";

interface HomePageSEOProps {
  children?: React.ReactNode;
  featuredWeddings?: Array<{
    name: string;
    date: string;
    location: string;
    image: string;
    description: string;
  }>;
}

const HomePageSEO: React.FC<HomePageSEOProps> = ({ children, featuredWeddings = [] }) => {
  const pageConfig = seoConfig.pages.home;
  const baseUrl = seoConfig.site.url;
  
  // Generate core schemas
  const orgSchema = generateOrganizationSchema(seoConfig.organization);
  const websiteSchema = generateWebsiteSchema(seoConfig.site);
  const localBusinessSchema = generateLocalBusinessSchema(seoConfig.organization);
  
  // Generate wedding service schemas
  const weddingServices = generateServiceSchemas([
    {
      name: "Complete Wedding Planning",
      description: "End-to-end wedding planning services from venue selection to execution",
      areaServed: "Hyderabad and surrounding areas"
    },
    {
      name: "Wedding Venue Decoration",
      description: "Theme-based wedding venue decoration for mandap, reception, and all functions",
      areaServed: "Hyderabad"
    },
    {
      name: "Destination Wedding Planning",
      description: "Complete destination wedding arrangements in Hyderabad for out-of-town couples",
      areaServed: "India"
    },
    {
      name: "Wedding Catering Services",
      description: "Premium catering services with multiple cuisine options for wedding functions",
      areaServed: "Hyderabad"
    }
  ]);

  // FAQ schema for wedding planning
  const weddingFAQs = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How early should we book a wedding planner in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We recommend booking your wedding planner in Hyderabad at least 8-12 months in advance, especially for popular wedding season dates between November and February. This ensures availability of the best venues and vendors."
        }
      },
      {
        "@type": "Question",
        "name": "What is included in your complete wedding planning package?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our complete wedding package includes venue selection, theme planning, decoration, vendor management, catering coordination, guest management, and full event execution for all wedding functions including engagement, sangeet, mehndi, and reception."
        }
      },
      {
        "@type": "Question",
        "name": "Do you handle both traditional and contemporary wedding themes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we specialize in both traditional Indian wedding themes and contemporary fusion themes. We create personalized experiences that reflect your cultural background and personal style."
        }
      },
      {
        "@type": "Question",
        "name": "Can you work within our specific wedding budget?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! We offer customized wedding planning packages to suit all budgets. We provide transparent costing and help you allocate your budget effectively across different wedding elements."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide destination wedding services in Hyderabad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we specialize in destination weddings in Hyderabad. We handle everything from accommodation for guests, local transportation, venue setup, to cultural experiences for out-of-town visitors."
        }
      }
    ]
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
      }
    ]
  };

  // Featured weddings schema if provided
  const featuredWeddingsSchema = featuredWeddings.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Featured Weddings",
    "description": "Recently planned weddings by our team",
    "numberOfItems": featuredWeddings.length,
    "itemListElement": featuredWeddings.map((wedding, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": wedding.name,
        "startDate": wedding.date,
        "location": {
          "@type": "Place",
          "name": wedding.location
        },
        "description": wedding.description,
        "image": wedding.image
      }
    }))
  } : null;

  // Combine all structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      orgSchema,
      websiteSchema,
      localBusinessSchema,
      weddingFAQs,
      breadcrumbSchema,
      ...weddingServices,
      ...(featuredWeddingsSchema ? [featuredWeddingsSchema] : [])
    ].filter(Boolean)
  };

  return (
    <>
      <SEOHead
        title={pageConfig.title}
        description={pageConfig.description}
        keywords={pageConfig.keywords}
        canonical={pageConfig.canonical}
        ogTitle={pageConfig.title}
        ogDescription={pageConfig.description}
        ogImage={pageConfig.image}
        ogUrl={`${baseUrl}${pageConfig.canonical}`}
        twitterCard="summary_large_image"
        twitterSite="@perfectweddings"
      >
        {/* Additional wedding-specific meta tags */}
        <meta name="wedding-business" content="wedding planning, event management, venue decoration" />
        <meta name="wedding-services" content="complete wedding planning, destination weddings, catering, decoration" />
        <meta name="location" content="Hyderabad, Telangana, India" />
        <meta name="wedding-types" content="Hindu wedding, Muslim wedding, Christian wedding, Interfaith wedding" />
        <meta name="budget-range" content="affordable to luxury weddings" />
        
        {/* Preload critical images */}
        <link rel="preload" href={pageConfig.image} as="image" />
        
        {/* Canonical and alternate URLs */}
        <link rel="canonical" href={`${baseUrl}${pageConfig.canonical}`} />
        
        {/* Social media profiles */}
        <link rel="me" href="https://www.facebook.com/jpeventsorganizers/" />
        <link rel="me" href="https://www.instagram.com/jp_events__official/" />
        <link rel="me" href="https://www.pinterest.com/perfectweddings" />
        
        {/* RSS feed */}
        <link rel="alternate" type="application/rss+xml" title="Latest Wedding Tips & Ideas" href={`${baseUrl}/rss.xml`} />
        
        {/* Structured Data */}
        <StructuredData data={structuredData} />
      </SEOHead>
      {children}
    </>
  );
};

export default HomePageSEO;
