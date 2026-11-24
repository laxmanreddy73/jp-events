import { generateOGImage, validateOGConfig, getCachedOGImage, cacheOGImage } from '../../utils/ogImageGenerator';
import { Helmet } from 'react-helmet-async';

interface DynamicOGImageProps {
  title: string;
  description?: string;
  template?: 'wedding' | 'service' | 'portfolio' | 'testimonial' | 'default';
  author?: string;
  date?: string;
  image?: string;
  venue?: string;
  weddingType?: string;
  colorScheme?: 'romantic' | 'traditional' | 'modern' | 'luxury';
  featuredService?: string;
}

/**
 * Dynamic OG Image Component for Wedding Business
 * Automatically generates and applies wedding-themed Open Graph images
 * 
 * @example
 * <DynamicOGImage 
 *   title="Elegant Garden Wedding Planning"
 *   description="Complete wedding planning services for your dream garden wedding"
 *   template="wedding"
 *   venue="Taj West End, Hyderabad"
 *   weddingType="Hindu Wedding"
 *   colorScheme="romantic"
 * />
 */
export function DynamicOGImage({ 
  title, 
  description = '', 
  template = 'wedding',
  author,
  date,
  image,
  venue,
  weddingType,
  colorScheme = 'romantic',
  featuredService
}: DynamicOGImageProps) {
  
  // Enhanced validation for wedding business
  const validation = validateOGConfig({ 
    title, 
    description, 
    template,
    venue,
    weddingType 
  });
  
  if (!validation.valid) {
    console.warn('[Wedding OG] DynamicOGImage validation errors:', validation.errors);
    return null;
  }

  // Create cache key with wedding-specific parameters
  const cacheKey = `${template}-${weddingType || 'general'}-${title.slice(0, 25).replace(/\s+/g, '-')}`;
  
  // Check cache first
  let ogImageUrl = getCachedOGImage(cacheKey);
  
  if (!ogImageUrl) {
    // Generate wedding-themed OG image
    ogImageUrl = generateOGImage({
      title,
      description,
      template,
      author: author || 'JP Events Wedding Planners',
      date,
      image,
      venue,
      weddingType,
      colorScheme,
      featuredService,
      businessName: 'JP Events',
      contact: '+919533950636'
    });
    
    // Cache the result
    cacheOGImage(cacheKey, ogImageUrl);
  }

  return (
    <Helmet>
      {/* Primary OG Image */}
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content={`${title} - JP Events Wedding Planning`} />
      
      {/* Twitter Card Image */}
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:image:alt" content={`${title} - Wedding Planning Services`} />
      
      {/* Additional OG Tags for Wedding Business */}
      <meta property="og:business:category" content="Wedding Planning" />
      <meta property="og:business:contact_data:phone_number" content="+919533950636" />
      <meta property="og:business:contact_data:email" content="jpevents@gmail.com" />
      
      {/* Wedding-specific structured data in meta tags */}
      <meta name="wedding-service-type" content={weddingType || 'General Wedding Planning'} />
      <meta name="wedding-venue" content={venue || 'Multiple Venues Across India'} />
      {featuredService && <meta name="featured-wedding-service" content={featuredService} />}
      
      {/* Enhanced description for wedding content */}
      <meta property="og:description" content={`${description} | JP Events Wedding Planners - Creating Dream Weddings Since 2010`} />
    </Helmet>
  );
}

// Wedding-specific template configurations
export const weddingOGTemplates = {
  wedding: {
    backgroundColor: '#FFFAFC',
    titleColor: '#382832',
    descriptionColor: '#666666',
    accentColor: '#C6537A',
    backgroundPattern: 'floral',
    fontFamily: 'Playfair Display'
  },
  service: {
    backgroundColor: '#FFF1F5',
    titleColor: '#382832',
    descriptionColor: '#696969',
    accentColor: '#C6537A',
    backgroundPattern: 'minimal',
    fontFamily: 'Montserrat'
  },
  portfolio: {
    backgroundColor: '#FFFAFC',
    titleColor: '#382832',
    descriptionColor: '#555555',
    accentColor: '#A63F63',
    backgroundPattern: 'elegant',
    fontFamily: 'Cormorant Garamond'
  },
  testimonial: {
    backgroundColor: '#FFFFFF',
    titleColor: '#382832',
    descriptionColor: '#444444',
    accentColor: '#C6537A',
    backgroundPattern: 'classic',
    fontFamily: 'Merriweather'
  },
  default: {
    backgroundColor: '#FFFFFF',
    titleColor: '#382832',
    descriptionColor: '#666666',
    accentColor: '#8b4513',
    backgroundPattern: 'simple',
    fontFamily: 'Roboto'
  }
};

// Wedding color schemes
export const weddingColorSchemes = {
  romantic: {
    primary: '#E8A0B8',
    secondary: '#F4C6D5',
    accent: '#C6537A',
    text: '#382832'
  },
  traditional: {
    primary: '#A63F63',
    secondary: '#F4C6D5',
    accent: '#C6537A',
    text: '#382832'
  },
  modern: {
    primary: '#E8A0B8',
    secondary: '#F4C6D5',
    accent: '#C6537A',
    text: '#382832'
  },
  luxury: {
    primary: '#382832',
    secondary: '#E8A0B8',
    accent: '#C6537A',
    text: '#382832'
  }
};

export default DynamicOGImage;