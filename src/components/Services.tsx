import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Utensils, Music, Camera, Flower2, Crown, Calendar,
  Users, Mic, Gift, Sparkles, Gem,
  BookOpen, ChevronRight, Coffee,
  Video, Mail, Award, Zap,
  Diamond, Palette, Castle, Home,
  Film, Brush, User, Image, Mic2, Theater,
  ChevronLeft
} from 'lucide-react';
import { MessageCircle} from 'lucide-react';
import { openWhatsAppChat } from '../utils/whatsappConfig';
import { usePublishedVenues } from '../hooks/usePublishedContent';
import ImmersiveImageRibbon from './ImmersiveImageRibbon';
import { EditableImage } from './WebsiteImageEditor';
import { useWebsiteImageEditor } from '../contexts/websiteImageEditorContext';

gsap.registerPlugin(ScrollTrigger);
// Add this function to your component
const openWhatsAppForReceptionHall = (hall: { title: string; description?: string }) => {
  const whatsappData = {
    name: 'Interested Customer',
    email: '',
    phone: '',
    eventDate: '',
    venue: hall.title,
    eventType: 'Reception',
    guestCount: '',
    budget: '',
    message: `Hello! I'm interested in booking ${hall.title} for my reception. ${hall.description ? `This venue looks perfect because: ${hall.description.substring(0, 100)}...` : 'Could you please provide more details about availability and pricing?'}`
  };
  
  openWhatsAppChat(whatsappData);
};

const Services = () => {
  const { slots: websiteImageSlots } = useWebsiteImageEditor();
  const servicesSectionRef = useRef<HTMLElement>(null);
  // State for reception halls carousel
  const [currentReceptionSlide, setCurrentReceptionSlide] = useState(0);

  const { items: receptionHalls, loading: venuesLoading, error: venuesError, source: venuesSource } =
    usePublishedVenues();
  const receptionCarouselOptions = useMemo(
    () => ({ align: 'start' as const, loop: receptionHalls.length > 1 }),
    [receptionHalls.length]
  );
  const receptionRibbonItems = useMemo(
    () => receptionHalls.map((hall, index) => ({
      id: hall.id,
      src: hall.src,
      alt: hall.title,
      aspect: (index % 3 === 0 ? 'portrait' : index % 3 === 1 ? 'landscape' : 'square') as 'portrait' | 'landscape' | 'square',
    })),
    [receptionHalls]
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(receptionCarouselOptions);
  const prefersReducedMotion = useReducedMotion();
  const currentReceptionHall = receptionHalls[currentReceptionSlide];

  useGSAP(() => {
    if (prefersReducedMotion || !servicesSectionRef.current) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('.jp-service-card-photo').forEach((photo, index) => {
        gsap.fromTo(photo,
          { yPercent: index % 2 === 0 ? -7 : 7, scale: 1.08 },
          {
            yPercent: index % 2 === 0 ? 7 : -7,
            scale: 1.16,
            ease: 'none',
            scrollTrigger: {
              trigger: photo.closest('.jp-service-card'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8 + (index % 3) * 0.25,
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.jp-reception-photo').forEach((photo) => {
        gsap.to(photo, {
          yPercent: 4,
          scale: 1.08,
          ease: 'none',
          scrollTrigger: {
            trigger: photo.closest('[role="region"]') ?? photo,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });
    });

    return () => media.revert();
  }, { scope: servicesSectionRef, dependencies: [prefersReducedMotion, receptionHalls.length] });

  const syncSelectedReceptionHall = useCallback(() => {
    if (emblaApi) setCurrentReceptionSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    syncSelectedReceptionHall();
    emblaApi.on('select', syncSelectedReceptionHall);
    emblaApi.on('reInit', syncSelectedReceptionHall);
    return () => {
      emblaApi.off('select', syncSelectedReceptionHall);
      emblaApi.off('reInit', syncSelectedReceptionHall);
    };
  }, [emblaApi, syncSelectedReceptionHall]);

  const nextReceptionSlide = () => emblaApi?.scrollNext(Boolean(prefersReducedMotion));
  const prevReceptionSlide = () => emblaApi?.scrollPrev(Boolean(prefersReducedMotion));
  const goToReceptionSlide = (index: number) => emblaApi?.scrollTo(index, Boolean(prefersReducedMotion));

  // Animation variants
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Color palette matching hero section
  const colors = {
    champagne: {
      50: "#FFFAFC",
      100: "#FFF1F5",
      200: "#FFF1F5",
      300: "#F4C6D5",
      400: "#E8A0B8",
      500: "#C6537A",
      600: "#A63F63",
      700: "#A63F63",
      800: "#5D273C",
      900: "#5D273C"
    },
    cream: {
      50: "#FFFAFC",
      100: "#FFF1F5",
      200: "#F4C6D5",
    },
    accent: {
      roseGold: "#E0BFB8",
      platinum: "#E5E4E2",
    },
    blush: {
      400: "#E8A0B8",
      600: "#C6537A"
    },
    rose: {
      100: "#FFF1F5",
      500: "#C6537A",
      600: "#A63F63",
      700: "#81314F",
      800: "#5D273C"
    }
  };

  // Hero section images
  const heroImages = {
    main: "https://res.cloudinary.com/djex6hliw/image/upload/v1751038841/flv16ko3frkbck7e7fdl.jpg",
    haldi: "https://i.postimg.cc/ZRD8nmLR/Screenshot-2025-06-27-234725.png",
    ceremony: "https://i.postimg.cc/Zq6KszRQ/pexels-dk121-3865895.jpg",
    reception: "https://i.postimg.cc/N0GBD93K/pexels-abhishek-nigam-582276386-30482897.jpg",
    sangeet: "https://i.postimg.cc/pL2pw7D1/pexels-anish-bindoriya-1957073-28200149.jpg",
    mehendi: "https://i.postimg.cc/8P8Hx3JZ/mehendi-artist.jpg",
    catering: "https://i.postimg.cc/8zV7JQJX/wedding-catering.jpg",
    decor: "https://i.postimg.cc/8C4bJYyL/wedding-decor.jpg",
    makeup: "https://i.postimg.cc/8zV7JQJX/bridal-makeup.jpg",
    invitations: "https://i.postimg.cc/8zV7JQJX/wedding-invitations.jpg",
    traditional: "https://i.postimg.cc/Zq6KszRQ/pexels-dk121-3865895.jpg",
    vedic: "https://i.postimg.cc/Zq6KszRQ/pexels-dk121-3865895.jpg",
    attire: "https://i.postimg.cc/N0GBD93K/pexels-abhishek-nigam-582276386-30482897.jpg"
  };

  // Service Data - Expanded with all requested services
  const weddingServices = {
    planning: [
      {
        icon: <Calendar className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Full Wedding Planning",
        description: "Comprehensive 12-month planning with our luxury wedding designers",
        highlight: "Includes 3 venue visits with helicopter transfers",
        premium: true,
        image: "https://i.postimg.cc/HsBmRTbJ/pexels-fliqaindia-30169488.jpg"
      },
      {
        icon: <Castle className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Venue Selection",
        description: "Access to exclusive palaces and five-star resorts worldwide",
        highlight: "Private showings before public availability",
        premium: true,
        image: "https://i.postimg.cc/pL2pw7D1/pexels-anish-bindoriya-1957073-28200149.jpg"
      },
      {
        icon: <BookOpen className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Custom Timeline",
        description: "Minute-by-minute orchestration with contingency planning",
        highlight: "Dedicated timeline manager on wedding day",
        premium: false,
        image: heroImages.ceremony
      }
    ],
    photography: [
      {
        icon: <Camera className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Premium Photography",
        description: "16-hour coverage with 4 photographers and 2 videographers",
        highlight: "Leica medium format cameras for ultimate quality",
        premium: false,
        image:"https://i.postimg.cc/Zq6KszRQ/pexels-dk121-3865895.jpg"
      },
      {
        icon: <Image className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Candid Photography",
        description: "Natural, unposed moments captured beautifully",
        highlight: "Includes pre-wedding shoot",
        premium: false,
        image: "https://i.postimg.cc/Zq6KszRQ/pexels-dk121-3865895.jpg"
      },
      {
        icon: <Camera className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Photo Booths",
        description: "Interactive photo stations with instant prints",
        highlight: "Custom themed backdrops available",
        premium: false,
        image: heroImages.reception
      }
    ],
    videography: [
      {
        icon: <Video className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Cinematic Wedding Films",
        description: "Hollywood-style wedding film with drone and underwater footage",
        highlight: "Director's cut with behind-the-scenes documentary",
        premium: true,
        image: heroImages.reception
      },
      {
        icon: <Film className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Sangeet & Reception Films",
        description: "Professional coverage of all pre-wedding events",
        highlight: "Same-day edit available",
        premium: false,
        image: "https://i.postimg.cc/Zq6KszRQ/pexels-dk121-3865895.jpg"
      },
      {
        icon: <Video className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Same Day Edit",
        description: "3-5 minute highlight film shown at reception",
        highlight: "Includes drone footage",
        premium: true,
        image: heroImages.reception
      }
    ],
    entertainment: [
      {
        icon: <Music className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Live Bands & DJs",
        description: "Top international performers and celebrity DJs",
        highlight: "Custom playlist creation",
        premium: true,
        image: heroImages.reception
      },
      {
        icon: <Mic className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Emcee Services",
        description: "Professional wedding hosts in multiple languages",
        highlight: "Custom script writing",
        premium: false,
        image: heroImages.reception
      },
      {
        icon: <Users className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Choreographers",
        description: "Bollywood and contemporary dance specialists",
        highlight: "Group dance coordination",
        premium: false,
        image: heroImages.sangeet
      }
    ],
    decor: [
      {
        icon: <Flower2 className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Themed Wedding Decor",
        description: "Complete venue transformation with custom themes",
        highlight: "3D rendering of design concepts",
        premium: true,
        image: "https://i.postimg.cc/pL2pw7D1/pexels-anish-bindoriya-1957073-28200149.jpg"
      },
      {
        icon: <Home className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Stage Setups",
        description: "Grand stages with LED walls and special effects",
        highlight: "Hydraulic lift options available",
        premium: true,
        image:"https://i.postimg.cc/ZRD8nmLR/Screenshot-2025-06-27-234725.png"
      },
      {
        icon: <Sparkles className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Lighting Design",
        description: "Professional lighting for ambiance and drama",
        highlight: "Intelligent moving lights",
        premium: false,
        image: heroImages.reception
      }
    ],
    catering: [
      {
        icon: <Utensils className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Gourmet Catering",
        description: "5-star culinary experiences with global cuisines",
        highlight: "Live cooking stations",
        premium: true,
        image:"https://i.postimg.cc/N0GBD93K/pexels-abhishek-nigam-582276386-30482897.jpg"
      },
      {
        icon: <Coffee className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Beverage Services",
        description: "Premium bar setups with mixologists",
        highlight: "Signature cocktail creation",
        premium: false,
        image: heroImages.reception
      },
      {
        icon: <Gift className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Wedding Cake",
        description: "Custom-designed cakes with premium ingredients",
        highlight: "Live cake decorating demonstration",
        premium: false,
        image: heroImages.reception
      }
    ],
    preWedding: [
      {
        icon: <Brush className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Haldi & Mehendi",
        description: "Complete traditional ceremony setups",
        highlight: "Organic haldi and henna provided",
        premium: false,
        image: heroImages.haldi
      },
      {
        icon: <User className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Mehendi Artists",
        description: "Award-winning henna artists with custom designs",
        highlight: "Bridal mehndi with gold/silver accents",
        premium: true,
        image: heroImages.mehendi
      },
      {
        icon: <Music className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Sangeet Packages",
        description: "Complete event planning for musical night",
        highlight: "Includes sound, lighting and stage",
        premium: true,
        image: heroImages.sangeet
      }
    ],
    traditions: [
       {
        icon: <Theater className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Traditional Ceremonies",
        description: "Expert guidance for cultural rituals",
        highlight: "Includes rare regional customs",
        premium: false,
        image: heroImages.traditional
      },
      {
        icon: <Mic2 className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Vedic Chanting Specialists",
        description: "Authentic pandits for traditional ceremonies",
        highlight: "Sanskrit scholars available",
        premium: true,
        image: heroImages.vedic
      },
      {
        icon: <Palette className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Regional Attire Styling",
        description: "Heritage clothing consultation",
        highlight: "Antique jewelry pairings",
        premium: false,
        image: heroImages.attire
      }
    ],
        
    bridal: [
      {
        icon: <Gem className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Bridal Makeup",
        description: "Professional artists with luxury cosmetics",
        highlight: "Trial sessions included",
        premium: false,
        image:"https://i.postimg.cc/N0GBD93K/pexels-abhishek-nigam-582276386-30482897.jpg"
      },
      {
        icon: <Mail className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Invitation Cards",
        description: "Custom-designed wedding stationery",
        highlight: "Foil stamping and laser cutting options",
        premium: false,
        image: heroImages.invitations
      },
      {
        icon: <Diamond className="w-6 h-6" style={{ color: colors.champagne[600] }} />,
        title: "Jewelry & Accessories",
        description: "Bridal jewelry consultation and rentals",
        highlight: "Heirloom pieces available",
        premium: true,
        image: "https://i.postimg.cc/Zq6KszRQ/pexels-dk121-3865895.jpg"
      }
    ]
  };

  const premiumPackages = [
    {
      name: "Imperial Majesty",
      features: [
        "24-month platinum planning service",
        "International palace venues",
        "Celebrity headline performer",
        "Unlimited guest capacity",
        "24/7 personal wedding concierge"
      ],
      icon: <Crown className="w-10 h-10" style={{ color: colors.champagne[500] }} />,
      bgColor: `bg-gradient-to-br from-champagne-400 to-champagne-600`,
      image: heroImages.reception
    },
    {
      name: "Platinum Elegance",
      features: [
        "18-month gold planning service",
        "Five-star resort venues",
        "Live orchestra with soloists",
        "Up to 500 guests",
        "Dedicated event manager"
      ],
      icon: <Award className="w-10 h-10" style={{ color: colors.champagne[500] }} />,
      bgColor: `bg-gradient-to-br from-champagne-400 to-champagne-600`,
      image: heroImages.ceremony
    },
    {
      name: "Golden Opulence",
      features: [
        "12-month silver planning service",
        "Luxury hotel venues",
        "Premium DJ entertainment",
        "Up to 250 guests",
        "Wedding day coordinator"
      ],
      icon: <Zap className="w-10 h-10" style={{ color: colors.champagne[500] }} />,
      bgColor: `bg-gradient-to-br from-rosegold-400 to-rosegold-600`,
      image: heroImages.haldi
    }
  ];

  return (
    <section
      ref={servicesSectionRef}
      id="services" 
      className="relative py-32 overflow-hidden -mt-24"
      style={{ 
        background: `linear-gradient(${colors.cream[50]} 0%, ${colors.cream[100]} 50%, white 100%)`
      }}
    >
      {/* Decorative elements matching hero */}
      <div 
        className="absolute top-0 left-0 w-[40rem] h-[40rem] rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          background: `radial-gradient(${colors.champagne[300]}, transparent 70%)`,
          filter: 'blur(100px)'
        }}
      ></div>
      <div 
        className="absolute bottom-0 right-0 w-[35rem] h-[35rem] rounded-full opacity-5 translate-x-1/2 translate-y-1/2 pointer-events-none "
        style={{
          background: `radial-gradient(${colors.champagne[400]}, transparent 70%)`,
          filter: 'blur(80px)'
        }}
      ></div>
      
      {/* Floating sparkles like hero */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <Sparkles 
            key={i}
            className="absolute animate-float"
            style={{
              color: colors.champagne[400],
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.7
            }}
          />
        ))}
      </div>

      <ImmersiveImageRibbon
        items={receptionRibbonItems}
        eyebrow="The setting tells the story"
        title="Service Photography"
        description="From intimate details to grand reception settings, every frame is composed with intention."
        ctaLabel="View the Venue Gallery"
        ctaTo="/portfolio"
        ariaLabel="JP Events service and reception photography ribbon"
        variant="services"
      />

      <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10 ">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }}
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          className="text-center mb-10 sm:mb-16 lg:mb-24"
        >
          <div className="inline-block relative">
            <Sparkles 
              className="absolute -top-8 -left-8 w-12 h-12 animate-pulse"
              style={{ color: colors.champagne[400] }} 
            />
            <Sparkles 
              className="absolute -bottom-6 -right-6 w-10 h-10 animate-pulse"
              style={{ 
                color: colors.blush[400],
                animationDelay: '0.5s'
              }} 
            />
            <h1 className="text-[clamp(2.5rem,11vw,4.5rem)] font-serif font-bold mb-4 sm:mb-6 leading-[0.98] relative">
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(45deg, ${colors.champagne[600]}, ${colors.blush[600]})`
                }}
              >
                Complete Wedding
              </span>
              <br />
              <span className="text-gray-800">Services & Solutions</span>
            </h1>
          </div>
          <div 
            className="w-40 h-1.5 mx-auto mb-10 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${colors.champagne[400]}, ${colors.blush[400]})`
            }}
          ></div>
          <motion.p 
            className="text-xl text-gray-600 max-w-4xl mx-auto font-light"
            initial={{ opacity: 0 }}
            whileInView={{ 
              opacity: 1,
              transition: { delay: 0.3 }
            }}
            viewport={{ once: true }}
          >
            From <span 
              className="font-medium"
              style={{ color: colors.champagne[600] }}
            >Haldi to Honeymoon</span> - we handle every aspect of your dream wedding with perfection
          </motion.p>
        </motion.div>

        {/* Services Grid with hero images */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-5 mb-12 sm:gap-8 sm:mb-20 lg:grid-cols-3 lg:gap-10 lg:mb-32 md:grid-cols-2"
        >
          {Object.entries(weddingServices).map(([category, services]) => (
            <motion.div 
              key={category} 
              variants={item}
              whileHover={{ y: -8 }}
              className="relative group"
            >
              <div 
                className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"
                style={{
                  background: `linear-gradient(45deg, ${colors.champagne[300]}, ${colors.champagne[500]})`
                }}
              ></div>
              
              {/* Hero image background for each service card */}
              <div 
                className="jp-service-card relative h-full overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-lg transition-all duration-500 hover:shadow-xl sm:rounded-2xl sm:p-8"
                style={{
                  backgroundImage: `url(${websiteImageSlots[`services.${category}`]?.src ?? services[0].image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundBlendMode: 'overlay',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                <EditableImage
                  slotKey={`services.${category}`}
                  src={services[0].image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="jp-service-card-photo pointer-events-none absolute inset-0 h-[115%] w-full -top-[7.5%] object-cover opacity-20"
                />
                <div 
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ background: colors.champagne[500] }}
                ></div>
                
                <h3 className="text-2xl font-serif font-medium mb-8 capitalize pb-4 relative">
                  <span 
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(45deg, ${colors.champagne[600]}, ${colors.champagne[800]})`
                    }}
                  >
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div 
                    className="absolute bottom-0 left-0 w-16 h-0.5 rounded-full"
                    style={{ background: colors.champagne[400] }}
                  ></div>
                </h3>
                
                <div className="space-y-7">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-start space-x-5 group">
                      <div 
                        className="p-3 rounded-xl flex-shrink-0 transition-all duration-300"
                        style={{
                          background: colors.champagne[100],
                          color: colors.champagne[600]
                        }}
                      >
                        {service.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-800">{service.title}</h4>
                          {service.premium && (
                            <span 
                              className="text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{
                                background: colors.champagne[100],
                                color: colors.champagne[700]
                              }}
                            >
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-2">{service.description}</p>
                        {service.highlight && (
                          <p 
                            className="text-sm mt-2 flex items-center"
                            style={{ color: colors.champagne[600] }}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {service.highlight}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="mt-8 flex items-center text-sm font-medium transition-colors duration-300 group"
                  style={{ color: colors.champagne[600] }}
                >
                  View all {category} services
                  <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Reception Halls */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="my-24 overflow-hidden rounded-[2rem] border border-rose-100/80 bg-white/75 px-5 py-10 shadow-[0_24px_70px_-48px_rgba(56,40,50,0.35)] backdrop-blur-sm sm:px-8 md:my-32 md:px-12 md:py-14"
        >
          <div className="mb-10 flex flex-col gap-6 md:mb-12 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
                The perfect setting
              </p>
              <h2 className="max-w-2xl font-serif text-4xl font-semibold leading-tight tracking-tight text-[#382832] md:text-5xl">
                Our Premium <span className="text-rose-700">Reception Halls</span>
              </h2>
            </div>
            <div className="max-w-xl lg:pb-1">
              <p className="text-base leading-7 text-gray-600 md:text-lg">
                Stunning venues that transform your wedding reception into an unforgettable experience.
              </p>
              {venuesLoading && <p className="mt-3 text-sm text-gray-600" role="status">Loading published venues…</p>}
              {venuesError && <p className="mt-3 text-sm text-rose-800" role="status">{venuesSource === 'legacy' ? 'Showing saved reception hall content while live venues are temporarily unavailable.' : 'Showing the last loaded reception halls while reconnecting to live content.'}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
            <div className="relative">
              <div
                ref={emblaRef}
                className="relative h-[360px] overflow-hidden rounded-[1.5rem] bg-rose-50 shadow-xl shadow-rose-950/10 sm:h-[440px] lg:h-full lg:min-h-[560px]"
                role="region"
                aria-label="Published reception halls"
                aria-roledescription="carousel"
              >
                <div className="flex h-full touch-pan-y">
                  {receptionHalls.map((hall, index) => (
                    <div
                      key={hall.id}
                      className="relative min-w-0 flex-[0_0_100%] overflow-hidden"
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${index + 1} of ${receptionHalls.length}`}
                      aria-hidden={index !== currentReceptionSlide}
                    >
                      <EditableImage
                        slotKey={`venues.${hall.id}.cover`}
                        src={hall.src}
                        alt=""
                        className={`jp-reception-photo h-full w-full object-cover transition-transform ease-out ${prefersReducedMotion ? 'duration-0' : 'duration-700'} ${index === currentReceptionSlide ? 'scale-105' : 'scale-100'}`}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1b1018]/80 via-[#1b1018]/15 to-transparent"></div>
                    </div>
                  ))}
                </div>
                {currentReceptionHall && (
                  <>
                    <div className="absolute left-5 top-5 z-10 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      Reception venue
                    </div>
                    <div className="absolute right-5 top-5 z-10">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => openWhatsAppForReceptionHall(currentReceptionHall)}
                        className="flex items-center justify-center rounded-full border border-white/30 bg-white/90 p-3 text-[#168447] shadow-lg backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        aria-label={`Contact ${currentReceptionHall.title} via WhatsApp`}
                      >
                        <MessageCircle className="h-5 w-5" />
                      </motion.button>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 p-6 text-white sm:p-8">
                      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/75">
                        {String(currentReceptionSlide + 1).padStart(2, '0')} / {String(receptionHalls.length).padStart(2, '0')}
                      </p>
                      <h3 className="font-serif text-2xl font-medium leading-tight sm:text-3xl">{currentReceptionHall.title}</h3>
                      {currentReceptionHall.capacity && (
                        <div className="mt-3 flex items-center text-sm text-white/85">
                          <Users className="mr-2 h-4 w-4" />
                          <span>{currentReceptionHall.capacity}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {receptionHalls.length === 0 && !venuesLoading && !venuesError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#FFF1F5] px-6 text-center text-[#382832]">
                    No published reception halls are available right now.
                  </div>
                )}
              </div>

              {receptionHalls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevReceptionSlide}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/70 bg-white/90 p-2.5 text-gray-800 shadow-lg backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-700"
                    aria-label="Previous reception hall"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextReceptionSlide}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/70 bg-white/90 p-2.5 text-gray-800 shadow-lg backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-700"
                    aria-label="Next reception hall"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="mt-5 flex justify-center gap-2" role="group" aria-label="Choose a reception hall">
                    {receptionHalls.map((hall, index) => (
                      <button
                        key={hall.id}
                        type="button"
                        onClick={() => goToReceptionSlide(index)}
                        className={`h-1.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 ${
                          index === currentReceptionSlide ? 'w-8 bg-rose-700' : 'w-3 bg-rose-200 hover:bg-rose-400'
                        }`}
                        aria-label={`Go to ${hall.title}, slide ${index + 1} of ${receptionHalls.length}`}
                        aria-current={index === currentReceptionSlide ? 'true' : undefined}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <motion.div
              key={currentReceptionSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col rounded-[1.5rem] border border-rose-100 bg-[#fffafb] p-6 sm:p-8 lg:p-9"
            >
              <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                <Gem className="h-4 w-4" />
                <span>Made for memorable moments</span>
              </div>
              <h3 className="font-serif text-3xl font-semibold leading-tight text-[#382832] sm:text-4xl">
                {currentReceptionHall?.title ?? 'Find your reception venue'}
              </h3>
              <p className="mt-4 text-base leading-7 text-gray-600">
                {currentReceptionHall?.description ?? 'Explore our collection of reception halls.'}
              </p>

              {currentReceptionHall?.capacity && (
                <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-rose-100 bg-white px-4 py-2.5 text-sm font-medium text-[#5D273C]">
                  <Users className="h-4 w-4 text-rose-700" />
                  <span>{currentReceptionHall.capacity}</span>
                </div>
              )}
              {currentReceptionHall?.priceText && (
                <p className="mt-5 text-lg font-semibold text-rose-800">
                  {currentReceptionHall.priceText}
                  {currentReceptionHall.priceNote ? ` · ${currentReceptionHall.priceNote}` : ''}
                </p>
              )}

              <div className="my-7 h-px bg-rose-100"></div>
              <div className="mb-8">
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#382832]">
                  Features &amp; amenities
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {currentReceptionHall?.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-rose-100 bg-white px-3.5 py-2 text-sm text-[#5D273C]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto grid gap-3 sm:grid-cols-2">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (currentReceptionHall) openWhatsAppForReceptionHall(currentReceptionHall);
                  }}
                  disabled={!currentReceptionHall}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#168447] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#116b38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168447] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={currentReceptionHall ? `Contact ${currentReceptionHall.title} via WhatsApp` : 'Contact via WhatsApp'}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Contact us</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!currentReceptionHall}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#5D273C] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#382832] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5D273C] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>Book this venue</span>
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Premium Packages with hero video background */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }}
          viewport={{ once: true }}
          className="relative mb-12 overflow-hidden rounded-3xl p-1 sm:mb-20 lg:mb-28"
          style={{
            background: `linear-gradient(135deg, ${colors.champagne[300]}, ${colors.champagne[500]})`
          }}
        >
          {/* Hero video background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-20"
            >
              <source 
                src="https://res.cloudinary.com/djex6hliw/video/upload/v1751038841/flv16ko3frkbck7e7fdl.mp4" 
                type="video/mp4" 
              />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10"></div>
          </div>
          
          <div className="relative bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl overflow-hidden z-10">
            <div className="relative z-10 p-12">
              <div className="text-center mb-16">
                <h3 className="text-4xl font-serif font-bold mb-6">
                  <span 
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(45deg, ${colors.champagne[600]}, ${colors.champagne[800]})`
                    }}
                  >
                    Signature Packages
                  </span>
                </h3>
                <div 
                  className="w-24 h-1 mx-auto mb-8 rounded-full"
                  style={{ background: colors.champagne[500] }}
                ></div>
                <p 
                  className="text-xl max-w-3xl mx-auto"
                  style={{ color: colors.champagne[700] }}
                >
                  Curated experiences for every scale of celebration
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {premiumPackages.map((pkg, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ 
                      y: -12,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    className="relative group"
                  >
                    <div 
                      className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(45deg, ${colors.champagne[400]}, ${colors.accent.roseGold})`
                      }}
                    ></div>
                    
                    {/* Package card with hero image */}
                    <div 
                      className="relative h-full overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-lg sm:rounded-2xl sm:p-8"
                      style={{
                        backgroundImage: `url(${pkg.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundBlendMode: 'overlay',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                      }}
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h4 
                            className="text-2xl font-serif font-bold mb-2"
                            style={{ color: colors.champagne[700] }}
                          >
                            {pkg.name}
                          </h4>
                        </div>
                        <div 
                          className="p-3 rounded-xl"
                          style={{ 
                            background: colors.champagne[100],
                            color: colors.champagne[600]
                          }}
                        >
                          {pkg.icon}
                        </div>
                      </div>
                      
                      <ul className="space-y-4 mb-10">
                        {pkg.features.map((feature, i) => (
                          <li key={i} className="flex items-start space-x-3">
                            <div 
                              className="p-1 rounded-full flex-shrink-0 mt-0.5"
                              style={{ 
                                background: colors.champagne[100],
                                color: colors.champagne[600]
                              }}
                            >
                              <Sparkles className="w-3 h-3" />
                            </div>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button 
                        className="w-full py-4 rounded-xl font-medium transition-all duration-300 group-hover:shadow-lg"
                        style={{
                          background: `linear-gradient(45deg, ${colors.champagne[500]}, ${colors.champagne[600]})`,
                          color: 'white'
                        }}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <Mail className="w-5 h-5 mr-3" />
                          Request Proposal
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Custom animations matching hero */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Services;
