import React from "react";
import SEOHelmet from "./SEOHelmet";
import { seoConfig } from "../../config/seoConfig";
import { 
  generateOrganizationSchema, 
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateEventSchema 
} from "../../utils/seoHelpers";

const AboutPageSEO: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const pageConfig = seoConfig.pages.about;
  
  // Enhanced organization schema for wedding business
  const orgSchema = generateOrganizationSchema(seoConfig.organization);
  
  // Breadcrumb schema for better navigation
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://subadesignsanddecoration.com/" },
    { name: "About Our Wedding Planning Company", url: "https://subadesignsanddecoration.com/about" }
  ]);

  // FAQ schema for common wedding planning questions
  const faqSchema = generateFAQSchema([
    {
      question: "How many years of experience do you have in wedding planning?",
      answer: "With over 13 years of experience since 2010, our wedding planning company has successfully organized thousands of dream weddings across India, specializing in both traditional and contemporary wedding celebrations."
    },
    {
      question: "What types of wedding events do you plan?",
      answer: "We specialize in comprehensive wedding planning including engagement ceremonies, mehndi, sangeet, haldi, wedding ceremonies, reception parties, and post-wedding events. We handle everything from intimate gatherings to grand wedding celebrations."
    },
    {
      question: "Do you provide wedding decor and theme design services?",
      answer: "Yes! We offer complete wedding decor services including mandap design, stage decoration, venue transformation, floral arrangements, lighting, and custom theme development to create your perfect wedding ambiance."
    },
    {
      question: "What areas do you serve for wedding planning?",
      answer: "We serve clients across India, with a base in Hyderabad and destination wedding services throughout the country and internationally."
    },
    {
      question: "Can you handle both Hindu and Christian weddings?",
      answer: "Absolutely! We have extensive experience planning Hindu weddings, Christian weddings, Muslim weddings, Sikh weddings, and inter-faith ceremonies, respecting all cultural traditions and customs."
    },
    {
      question: "Do you provide wedding invitation design services?",
      answer: "Yes, we offer custom wedding invitation design including traditional printed cards, modern digital invites, and interactive wedding websites to match your wedding theme and style."
    }
  ]);

  // Event schema for wedding planning services
  const eventSchema = generateEventSchema({
    name: "Wedding Planning Consultation",
    description: "Free wedding planning consultation to discuss your dream wedding vision, budget, and requirements with our experienced wedding planners.",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    location: {
      name: "JP Events",
      address: "Hyderabad, Telangana, India"
    },
    offers: {
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString().split('T')[0]
    }
  });

  // Combine all structured data
  const combinedStructuredData = [orgSchema, breadcrumbSchema, faqSchema, eventSchema];

  // Enhanced meta description for wedding business
  const enhancedDescription = `With 13+ years of experience, JP Events creates magical wedding experiences. Expert wedding planners specializing in decor, coordination & complete wedding planning across India. Free consultation available.`;

  // Enhanced keywords focusing on wedding services
  const enhancedKeywords = `wedding planners hyderabad, wedding decorators, event planners, wedding organizers, mandap design, wedding stage decoration, marriage planners, wedding coordination, bridal services, wedding event management, sangeet planning, reception decor, ${pageConfig.keywords}`;

  // Enhanced title with wedding focus
  const enhancedTitle = "About Our Wedding Planning Company | 13+ Years Creating Dream Weddings";

  return (
    <SEOHelmet
      title={enhancedTitle}
      description={enhancedDescription}
      keywords={enhancedKeywords}
      canonical={pageConfig.canonical}
      ogTitle={enhancedTitle}
      ogDescription={enhancedDescription}
      ogImage={pageConfig.image}
      ogUrl={`${seoConfig.site.url}${pageConfig.canonical}`}
      structuredData={combinedStructuredData}
    >
      {/* Additional wedding-specific meta tags */}
      <meta name="author" content="JP Events Planning Team" />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Wedding industry specific meta tags */}
      <meta name="industry" content="Wedding Planning & Event Management" />
      <meta name="services" content="Wedding Planning, Event Decor, Mandap Design, Wedding Coordination" />
      <meta name="specialty" content="Indian Weddings, Destination Weddings, Traditional & Contemporary Wedding Planning" />
      
      {/* Location-specific meta tags for wedding services */}
      <meta name="geo.region" content="IN-TS" />
      <meta name="geo.placename" content="Hyderabad" />
      
      {/* Service area meta tags */}
      <meta name="servicearea" content="Hyderabad, Telangana, Mumbai, Delhi, Chennai, India" />
      <meta name="coverageregion" content="IN" />
      
      {/* Wedding-specific Open Graph enhancements */}
      <meta property="og:type" content="business.business" />
      <meta property="business:contact_data:locality" content="Hyderabad" />
      <meta property="business:contact_data:country_name" content="India" />
      
      {/* Wedding service categories */}
      <meta property="product:category" content="Wedding Planning" />
      <meta property="product:category" content="Event Decor" />
      <meta property="product:category" content="Wedding Coordination" />
      
      {children}
    </SEOHelmet>
  );
};

export default AboutPageSEO;
