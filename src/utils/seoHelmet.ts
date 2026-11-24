export interface SEOConfig {
  title: string
  description: string
  url: string
  image?: string
  type?: "website" | "article" | "business.business"
  author?: string
  keywords?: string
  canonicalUrl?: string
}

export const siteConfig = {
  name: "JP Events",
  domain: "https://subadesignsanddecoration.com",
  description: "Luxury wedding planning and decor specialists creating magical wedding experiences",
  defaultImage: "",
  social: {
    instagram: "https://www.instagram.com/jp_events__official/",
    facebook: "https://www.facebook.com/jpeventsorganizers/",
    twitter: "https://twitter.com/subadesigns",
  },
}

export const generateSEOConfig = (config: SEOConfig): SEOConfig => {
  return {
    ...config,
    url: config.url.startsWith("http") ? config.url : `${siteConfig.domain}${config.url}`,
    image: config.image || siteConfig.defaultImage,
    type: config.type || "website",
    canonicalUrl: config.canonicalUrl || config.url,
  }
}
