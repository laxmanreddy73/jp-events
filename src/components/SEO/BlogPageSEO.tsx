import React from "react";
import SEOHead from "./SEOHead";
import StructuredData from "./StructuredData";
import { seoConfig } from "../../config/seoConfig";
import { generateFAQSchema } from "../../utils/seoHelpers";

interface BlogPageSEOProps {
  children?: React.ReactNode;
  blogPost?: {
    title?: string;
    description?: string;
    publishDate?: string;
    modifiedDate?: string;
    author?: string;
    featuredImage?: string;
    categories?: string[];
    tags?: string[];
  };
}

const BlogPageSEO: React.FC<BlogPageSEOProps> = ({ children, blogPost }) => {
  const pageConfig = seoConfig.pages.blog;
  const baseUrl = seoConfig.site.url;
  
  // Use blog post specific data or fallback to page config
  const title = blogPost?.title || pageConfig.title;
  const description = blogPost?.description || pageConfig.description;
  const image = blogPost?.featuredImage || pageConfig.image;

  // Wedding events business schema
  const weddingBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: seoConfig.organization.name,
    description: "Professional wedding planning and event management services. Complete wedding solutions including venue decoration, catering, photography, and entertainment.",
    url: baseUrl,
    telephone: seoConfig.organization.telephone,
    email: seoConfig.organization.email,
    address: seoConfig.organization.address,
    openingHours: "Mo-Su 08:00-22:00",
    priceRange: "₹₹₹",
    servesCuisine: ["Indian", "Continental", "Asian"],
    amenityFeature: [
      "Wedding Planning",
      "Venue Decoration", 
      "Catering Services",
      "Photography",
      "Entertainment",
      "Bridal Makeup"
    ]
  };

  // Blog schema for wedding blog
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: pageConfig.title,
    description: pageConfig.description,
    url: `${baseUrl}${pageConfig.path}`,
    publisher: {
      "@type": "Organization",
      name: seoConfig.organization.name,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}${seoConfig.organization.logo}`
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}${pageConfig.path}`
    },
    inLanguage: "en-IN"
  };

  // Blog Post schema for wedding articles
  const blogPostSchema = blogPost ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blogPost.title,
    description: blogPost.description,
    image: blogPost.featuredImage ? `${baseUrl}${blogPost.featuredImage}` : `${baseUrl}${pageConfig.image}`,
    datePublished: blogPost.publishDate,
    dateModified: blogPost.modifiedDate || blogPost.publishDate,
    author: {
      "@type": "Organization",
      name: seoConfig.organization.name,
      url: baseUrl
    },
    publisher: {
      "@type": "Organization",
      name: seoConfig.organization.name,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}${seoConfig.organization.logo}`
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}${pageConfig.path}`
    },
    keywords: blogPost.tags ? blogPost.tags.join(", ") : pageConfig.keywords,
    articleSection: blogPost.categories ? blogPost.categories.join(", ") : "Wedding Planning",
    inLanguage: "en-IN"
  } : null;

  // FAQ schema for common wedding planning questions
  const weddingFAQs = generateFAQSchema([
    {
      question: "How far in advance should I book wedding planners in Hyderabad?",
      answer: "We recommend booking wedding planners in Hyderabad at least 6-12 months in advance for the best venues and vendors. Popular dates during wedding season (November-February) get booked quickly."
    },
    {
      question: "What is included in your complete wedding planning package?",
      answer: "Our complete wedding package includes venue selection, decoration, catering, photography, entertainment, bridal makeup, guest management, and complete event coordination for all wedding functions."
    },
    {
      question: "Do you provide wedding decoration services for both indoor and outdoor venues?",
      answer: "Yes, we specialize in both indoor and outdoor wedding decorations. We create stunning setups for banquet halls, gardens, beaches, and traditional wedding venues with theme-based decorations."
    },
    {
      question: "Can you help with destination weddings in Hyderabad?",
      answer: "Absolutely! We specialize in destination weddings in Hyderabad and can arrange everything from accommodation to local transportation, venue setup, and cultural experiences for out-of-town guests."
    },
    {
      question: "What wedding themes are popular this season in Hyderabad?",
      answer: "Popular wedding themes in Hyderabad include royal Rajasthani, minimalistic contemporary, vintage Bollywood, floral garden themes, and fusion themes blending traditional and modern elements."
    },
    {
      question: "Do you provide customized wedding planning for different budgets?",
      answer: "Yes, we offer customized wedding planning packages to suit all budgets. From intimate gatherings to grand celebrations, we create memorable experiences within your specified budget."
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
        name: "Wedding Blog",
        item: `${baseUrl}${pageConfig.path}`
      }
    ]
  };

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={pageConfig.keywords}
        canonical={pageConfig.canonical}
        ogTitle={title}
        ogDescription={description}
        ogImage={image}
        ogUrl={`${baseUrl}${pageConfig.canonical}`}
        twitterCard="summary_large_image"
        twitterSite="@weddingbusiness"
      >
        {/* Structured Data for Wedding Business */}
        <StructuredData data={weddingBusinessSchema} />
        <StructuredData data={blogSchema} />
        {blogPostSchema && <StructuredData data={blogPostSchema} />}
        <StructuredData data={weddingFAQs} />
        <StructuredData data={breadcrumbSchema} />
        
        {/* Additional meta tags for wedding blog */}
        {blogPost?.publishDate && (
          <meta property="article:published_time" content={blogPost.publishDate} />
        )}
        {blogPost?.modifiedDate && (
          <meta property="article:modified_time" content={blogPost.modifiedDate} />
        )}
        {blogPost?.categories && blogPost.categories.map((category, index) => (
          <meta key={index} property="article:section" content={category} />
        ))}
        {blogPost?.tags && blogPost.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
        
        {/* Wedding specific meta tags */}
        <meta name="wedding-business" content="wedding planning, event management" />
        <meta name="wedding-services" content="venue, decoration, catering, photography" />
        <meta name="location" content="Hyderabad, Telangana" />
        
        {/* Additional link tags */}
        <link rel="author" href={`${baseUrl}/about`} />
        <link rel="publisher" href={baseUrl} />
        
        {/* RSS Feed for wedding blog */}
        <link rel="alternate" type="application/rss+xml" title={`${seoConfig.organization.name} Wedding Blog RSS`} href={`${baseUrl}/rss.xml`} />
      </SEOHead>
      {children}
    </>
  );
};

export default BlogPageSEO;
