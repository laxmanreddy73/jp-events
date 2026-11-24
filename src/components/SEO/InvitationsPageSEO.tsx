import React from "react";
import SEOHead from "./SEOHead";
import StructuredData from "./StructuredData";
import { seoConfig } from "../../config/seoConfig";
import { localBusinessSchema, faqSchema } from "./StructuredData";

interface InvitationsPageSEOProps {
  children?: React.ReactNode;
  invitationTypes?: Array<{
    name: string;
    description: string;
    priceRange?: string;
    materials?: string[];
    designStyles?: string[];
  }>;
  featuredDesigns?: Array<{
    name: string;
    image: string;
    style: string;
    occasion: string;
  }>;
}

const InvitationsPageSEO: React.FC<InvitationsPageSEOProps> = ({ 
  children, 
  invitationTypes = [],
  featuredDesigns = []
}) => {
  const pageConfig = seoConfig.pages.invitations;
  const baseUrl = seoConfig.site.url;

  // Main service schema for wedding invitations
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Wedding Invitations & Stationery Design",
    description: pageConfig.description,
    provider: {
      "@type": "LocalBusiness",
      name: seoConfig.organization.name,
      address: seoConfig.organization.address,
      telephone: seoConfig.organization.telephone,
      email: seoConfig.organization.email
    },
    areaServed: {
      "@type": "Country",
      name: "IN",
    },
    serviceType: "WeddingInvitationDesign",
    offers: {
      "@type": "Offer",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceRange: "₹₹ - ₹₹₹",
        description: "Custom wedding invitation packages"
      }
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${baseUrl}${pageConfig.canonical}`
    }
  };

  // Product schemas for different invitation types
  const invitationSchemas = invitationTypes.map((type) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${type.name} Wedding Invitations`,
    description: type.description,
    category: "Wedding Stationery",
    offers: {
      "@type": "Offer",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceRange: type.priceRange || "₹₹ - ₹₹₹"
      },
      areaServed: "IN"
    },
    additionalProperty: type.materials ? type.materials.map(material => ({
      "@type": "PropertyValue",
      name: "material",
      value: material
    })) : []
  }));

  // FAQ schema for wedding invitations
  const invitationFAQs = faqSchema([
    {
      question: "How far in advance should we order wedding invitations?",
      answer: "We recommend ordering wedding invitations 3-4 months before your wedding date. This allows time for design consultation, printing, and addressing. For destination weddings or complex designs, plan for 5-6 months in advance."
    },
    {
      question: "What types of wedding invitation designs do you offer?",
      answer: "We offer traditional Indian designs, contemporary styles, fusion themes, laser-cut patterns, foil printing, embossed designs, digital invitations, and custom illustrations. Each design can be personalized to match your wedding theme."
    },
    {
      question: "Do you provide complete wedding stationery suites?",
      answer: "Yes, we provide complete wedding stationery suites including save-the-dates, main invitations, reception cards, RSVP cards, menu cards, thank you notes, and matching envelopes with calligraphy addressing."
    },
    {
      question: "Can you customize invitations to match our wedding theme?",
      answer: "Absolutely! We specialize in creating custom invitations that perfectly match your wedding theme, colors, and cultural elements. We incorporate specific motifs, colors, and design elements that reflect your unique love story."
    },
    {
      question: "What printing techniques and materials do you use?",
      answer: "We use premium materials including handmade paper, silk, acrylic, and wood. Printing techniques include letterpress, foil stamping, embossing, laser cutting, digital printing, and calligraphy hand-lettering."
    },
    {
      question: "Do you offer digital wedding invitations?",
      answer: "Yes, we create beautiful digital invitations with interactive RSVP tracking, guest management, and social media integration while maintaining the elegance of traditional designs."
    },
    {
      question: "What is the typical cost range for wedding invitations in Hyderabad?",
      answer: "Wedding invitation costs in Hyderabad range from ₹5,000 for basic digital designs to ₹50,000+ for premium custom suites with special printing techniques and materials. We offer packages for every budget."
    }
  ]);

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Wedding Invitations",
        item: `${baseUrl}${pageConfig.canonical}`
      }
    ]
  };

  // Collection schema for featured designs
  const featuredDesignsSchema = featuredDesigns.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Featured Wedding Invitation Designs",
    description: "Curated collection of our most popular wedding invitation designs",
    hasPart: featuredDesigns.map(design => ({
      "@type": "CreativeWork",
      name: design.name,
      image: design.image,
      about: design.style,
      genre: design.occasion
    }))
  } : null;

  // Combine all structured data
  const structuredData = [
    localBusinessSchema,
    serviceSchema,
    invitationFAQs,
    breadcrumbSchema,
    ...invitationSchemas,
    ...(featuredDesignsSchema ? [featuredDesignsSchema] : [])
  ];

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
        {/* Additional wedding invitation meta tags */}
        <meta name="invitation-types" content="traditional, contemporary, fusion, digital, luxury" />
        <meta name="printing-techniques" content="foil printing, embossing, laser cut, letterpress, digital" />
        <meta name="materials" content="handmade paper, silk, acrylic, wood, premium cardstock" />
        <meta name="service-location" content="Hyderabad, Telangana, India" />
        <meta name="customization" content="fully customizable designs, personalization available" />
        
        {/* Preload critical invitation images */}
        <link rel="preload" href={pageConfig.image} as="image" />
        {featuredDesigns.slice(0, 3).map((design, index) => (
          <link key={index} rel="preload" href={design.image} as="image" />
        ))}
        
        {/* Canonical and alternate URLs */}
        <link rel="canonical" href={`${baseUrl}${pageConfig.canonical}`} />
        
        {/* Additional link relations */}
        <link rel="author" href={`${baseUrl}/about`} />
        <link rel="publisher" href={baseUrl} />
        
        {/* Structured Data */}
        {structuredData.map((data, index) => (
          <StructuredData key={index} data={data} />
        ))}
      </SEOHead>
      {children}
    </>
  );
};

export default InvitationsPageSEO;
