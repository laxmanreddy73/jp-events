export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "WeddingPlanningBusiness"],
  name: "JP Events",
  alternateName: ["JP Events", "JP Events and Decorations", "JP Events Wedding Planners"],
  description: "Luxury wedding planning and decor specialists creating magical wedding experiences across India",
  url: "https://subadesignsanddecoration.com",
  logo: "https://i.postimg.cc/Pr28Q6Qm/feswgfew-Photoroom.png",
  foundingDate: "2010",
  founders: [{ "@type": "Person", name: "Narasimhamurthy" }],
  sameAs: ["https://www.instagram.com/jp_events__official/", "https://www.facebook.com/jpeventsorganizers/"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    addressCountry: "IN",
  },
  telephone: "+91-XXXXXXXXXX",
  email: "jpevents@gmail.com",
}

export const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Wedding Planning & Decor Services",
  description:
    "Comprehensive wedding planning and decor services including mandap design, floral arrangements, lighting design, and event coordination",
  provider: {
    "@type": "Organization",
    name: "JP Events",
    url: "https://subadesignsanddecoration.com",
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Wedding Services",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Complete Wedding Planning",
        description: "End-to-end wedding planning from concept to execution",
      },
      {
        "@type": "Offer",
        name: "Wedding Decor Design",
        description: "Custom wedding decor designs including mandaps, stages and venue transformations",
      },
      {
        "@type": "Offer",
        name: "Event Design & Styling",
        description: "Complete design and styling for pre-wedding events",
      },
    ],
  },
}

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What wedding planning services do you offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer comprehensive wedding planning services including venue selection, decor design, vendor coordination, timeline management, and complete event execution.",
      },
    },
    {
      "@type": "Question",
      name: "Do you work with destination weddings?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we specialize in destination weddings across India and internationally. We have experience managing complex logistics and multi-location events.",
      },
    },
    {
      "@type": "Question",
      name: "How far in advance should I book?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We recommend booking 6-12 months in advance for optimal planning and vendor selection, though we do accommodate shorter timelines based on availability.",
      },
    },
    {
      "@type": "Question",
      name: "What is your design approach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We create bespoke designs tailored to your vision. Our team works closely with clients to understand their preferences and create unique, memorable wedding experiences.",
      },
    },
  ],
}

export const breadcrumbSchema = (path: string) => {
  const breadcrumbs = {
    "/": [{ name: "Home", url: "https://subadesignsanddecoration.com/" }],
    "/about": [
      { name: "Home", url: "https://subadesignsanddecoration.com/" },
      { name: "About Us", url: "https://subadesignsanddecoration.com/about" },
    ],
    "/services": [
      { name: "Home", url: "https://subadesignsanddecoration.com/" },
      { name: "Services", url: "https://subadesignsanddecoration.com/services" },
    ],
    "/portfolio": [
      { name: "Home", url: "https://subadesignsanddecoration.com/" },
      { name: "Portfolio", url: "https://subadesignsanddecoration.com/portfolio" },
    ],
    "/blog": [
      { name: "Home", url: "https://subadesignsanddecoration.com/" },
      { name: "Blog", url: "https://subadesignsanddecoration.com/blog" },
    ],
    "/contact": [
      { name: "Home", url: "https://subadesignsanddecoration.com/" },
      { name: "Contact", url: "https://subadesignsanddecoration.com/contact" },
    ],
  }

  const items = breadcrumbs[path as keyof typeof breadcrumbs] || []

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
