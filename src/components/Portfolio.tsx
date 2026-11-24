"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion, type Variants } from "framer-motion"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
  VolumeX,
  Eye,
  Heart,
  Share2,
  Download,
  Grid,
  Star,
  Award,
  Crown,
  Gem,
  Diamond,
  Video,
  MapPin,
  Calendar,
  Users,
  Clock,
} from "lucide-react"
import { openWhatsAppChat } from '../utils/whatsappConfig'
import { usePublishedPortfolio } from '../hooks/usePublishedContent'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import ImmersiveImageRibbon from './ImmersiveImageRibbon'

gsap.registerPlugin(ScrollTrigger)

interface PortfolioItem {
  id: number | string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  date?: string;
  guests?: number;
  duration?: string;
  budget?: string;
  tags?: string[];
  awards?: string[];
  photographer?: string;
  likes?: number;
  views?: number;
  gallery?: string[];
  socialWallRow?: 1 | 2 | 3;
  socialWallSortOrder?: number;
}

const Portfolio = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0)
  const [filter, setFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("masonry")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMuted, setIsMuted] = useState(true)
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const [likedItems, setLikedItems] = useState<Set<number | string>>(new Set())
  const prefersReducedMotion = useReducedMotion()

  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  // Cherry blossom color palette
  const colors = {
    rose: {
      50: "#FFFAFC",
      100: "#FFF1F5",
      200: "#F4C6D5",
      300: "#EFB2C5",
      400: "#E8A0B8",
      500: "#D97D9B",
      600: "#A63F63",
      700: "#81314F",
      800: "#5D273C",
      900: "#382832",
    },
    accent: {
      rose: "#E8B4B8",
      champagne: "#F4C6D5",
      platinum: "#E5E4E2",
      bronze: "#C6537A",
    },
  }

  // Enhanced portfolio data with more details
  const portfolioItems: PortfolioItem[] = [
    {
      id: 1,
      type: "image",
      src: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      title: "Royal Garden Wedding",
      description: "Enchanted garden ceremony with golden mandap and crystal chandeliers",
      category: "ceremony",
      location: "Udaipur Palace, Rajasthan",
      date: "October 2023",
      guests: 350,
      duration: "3 days",

      tags: ["luxury", "traditional", "outdoor"],
      awards: ["Best Ceremony Design 2023", "Excellence in Floral Art"],
      photographer: "JP Events Creative Team",
      likes: 247,
      views: 1850,
    },
    {
      id: 2,
      type: "image",
      src: "https://i.postimg.cc/N0GBD93K/pexels-abhishek-nigam-582276386-30482897.jpg",
      title: "Grand Reception Hall",
      description: "Opulent ballroom with 24k gold accents and Swarovski crystal installations",
      category: "reception",
      location: "Taj Palace, Mumbai",
      date: "September 2023",
      guests: 500,
      duration: "1 day",

      tags: ["luxury", "indoor", "crystal"],
      awards: ["Luxury Wedding of the Year"],
      photographer: "Elite Wedding Films",
      likes: 389,
      views: 2340,
    },
    {
      id: 3,
      type: "image",
      src: "https://i.postimg.cc/SN5Pv4YB/pexels-keyurmali7-7153785.jpg",
      poster: "https://i.postimg.cc/SN5Pv4YB/pexels-keyurmali7-7153785.jpg",
      title: "Haldi & Mehendi Celebration",
      description: "Vibrant pre-wedding festivities with marigold installations",
      category: "pre-wedding",
      location: "Heritage Resort, Jaipur",
      date: "August 2023",
      guests: 200,
      duration: "2 days",

      tags: ["colorful", "traditional", "outdoor"],
      awards: ["Best Pre-Wedding Design"],
      photographer: "JP Events Creative Team",
      likes: 156,
      views: 980,
    },
    {
      id: 4,
      type: "image",
      src: "https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg?auto=compress&cs=tinysrgb&w=800&h=900&fit=crop",
      title: "Intimate Table Setting",
      description: "Romantic dining setup with golden charger plates and crystal stemware",
      category: "reception",
      location: "Private Villa, Goa",
      date: "July 2023",
      guests: 80,
      duration: "1 day",

      tags: ["intimate", "romantic", "beachside"],
      awards: ["Best Intimate Wedding"],
      photographer: "Coastal Weddings",
      likes: 92,
      views: 650,
    },
    {
      id: 5,
      type: "image",
      src: "https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg?auto=compress&cs=tinysrgb&w=800&h=900&fit=crop",
      title: "Sacred Vows Exchange",
      description: "Timeless moments of eternal love with traditional rituals",
      category: "ceremony",
      location: "Temple Complex, Kerala",
      date: "June 2023",
      guests: 300,
      duration: "1 day",

      tags: ["traditional", "spiritual", "cultural"],
      awards: ["Cultural Heritage Award"],
      photographer: "Divine Moments",
      likes: 203,
      views: 1420,
    },
    {
      id: 6,
      type: "image",
      src: "https://i.postimg.cc/28NW5R98/pexels-vireshstudio-2060240.jpg",
      title: "Bridal Suite Decoration",
      description: "Luxurious bridal preparation area with golden mirrors and silk draping",
      category: "bridal",
      location: "Luxury Resort, Udaipur",
      date: "May 2023",
      guests: 25,
      duration: "4 hours",

      tags: ["luxury", "bridal", "intimate"],
      awards: ["Best Bridal Suite Design"],
      photographer: "Bridal Elegance",
      likes: 134,
      views: 890,
    },
    {
      id: 7,
      type: "image",
      src: "https://i.postimg.cc/Qdvr15qr/pexels-adarsh-mp-30304835.jpg",
      poster: "https://i.postimg.cc/Qdvr15qr/pexels-adarsh-mp-30304835.jpg",
      title: "Traditional Kerala Wedding",
      description: "Three days of authentic cultural celebrations",
      category: "ceremony",
      location: "Backwater Resort, Kerala",
      date: "April 2023",
      guests: 400,
      duration: "3 days",

      tags: ["traditional", "cultural", "multi-day"],
      awards: ["Best Traditional Wedding"],
      photographer: "Kerala Traditions",
      likes: 278,
      views: 1650,
    },
    {
      id: 8,
      type: "image",
      src: "https://images.pexels.com/photos/1779414/pexels-photo-1779414.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop",
      title: "Ceremony Aisle Design",
      description: "Stunning aisle decoration with rose petals and golden lanterns",
      category: "ceremony",
      location: "Garden Palace, Mysore",
      date: "March 2023",
      guests: 250,
      duration: "1 day",

      tags: ["outdoor", "romantic", "floral"],
      awards: ["Best Aisle Design"],
      photographer: "Garden Weddings",
      likes: 167,
      views: 1120,
    },
  ]

  // Social wall images with enhanced data
  const socialWallImages: PortfolioItem[] = [
    {
      id: 9,
      type: "image",
      src: "https://i.postimg.cc/N0GBD93K/pexels-abhishek-nigam-582276386-30482897.jpg",
      title: "Traditional Ceremony Moments",
      description: "Cultural rituals captured in golden hour",
      category: "ceremony",
      location: "Heritage Palace",
      socialWallRow: 1,
      socialWallSortOrder: 0,
      likes: 89,
      views: 456,
    },
    {
      id: 10,
      type: "image",
      src: "https://i.postimg.cc/Z5tQwgM9/pexels-mastercowley-1128783.jpg",
      title: "Bridal Portrait Session",
      description: "Elegant bridal moments with golden jewelry",
      category: "bridal",
      location: "Royal Suite",
      socialWallRow: 1,
      socialWallSortOrder: 1,
      likes: 145,
      views: 723,
    },
    {
      id: 11,
      type: "image",
      src: "https://i.postimg.cc/rm3jKR6d/pexels-fotographiya-wedding-photography-823737813-29470577.jpg",
      title: "Wedding Celebration Joy",
      description: "Joyful moments of celebration and dance",
      category: "reception",
      location: "Grand Ballroom",
      socialWallRow: 2,
      socialWallSortOrder: 0,
      likes: 201,
      views: 934,
    },
    {
      id: 12,
      type: "image",
      src: "https://i.postimg.cc/HsBmRTbJ/pexels-fliqaindia-30169488.jpg",
      title: "Cultural Performance",
      description: "Traditional dance and music performances",
      category: "entertainment",
      location: "Cultural Center",
      socialWallRow: 3,
      socialWallSortOrder: 0,
      likes: 76,
      views: 412,
    },
  ]

  const { items: publishedItems, loading: contentLoading, source } =
    usePublishedPortfolio([...portfolioItems, ...socialWallImages])
  const showingLocalFallback = source === 'legacy'
  const localFallbackItems = [...portfolioItems, ...socialWallImages]
    // This legacy Postimage sample is currently served as a 503 graphic.
    .filter((item) => !item.src.includes('/SN5Pv4YB/'))
  const allItems: PortfolioItem[] = showingLocalFallback ? localFallbackItems : publishedItems
  const portfolioRibbonItems = allItems
      .filter((item) => item.type === 'image' && Boolean(item.src))
      .map((item, index) => ({
        id: item.id,
        src: item.src,
        alt: item.title,
        aspect: (index % 3 === 0 ? 'portrait' : index % 3 === 1 ? 'landscape' : 'square') as 'portrait' | 'landscape' | 'square',
      }))
  const socialWallItems = !showingLocalFallback
    ? allItems.filter((item) => item.socialWallRow)
    : allItems
      .filter((item) => item.type === 'image' && Boolean(item.src))
      .map((item, index) => ({
        ...item,
        socialWallRow: (index % 3 + 1) as 1 | 2 | 3,
        socialWallSortOrder: Math.floor(index / 3),
      }))
  const socialWallRibbonItems = socialWallItems
    .filter((item) => item.type === 'image' && Boolean(item.src) && item.socialWallRow)
    .map((item, index) => ({
      id: item.id,
      src: item.src,
      alt: item.title,
      row: item.socialWallRow,
      order: item.socialWallSortOrder ?? index,
      portfolioItemId: item.id,
      aspect: (index % 3 === 0 ? 'portrait' : index % 3 === 1 ? 'landscape' : 'square') as 'portrait' | 'landscape' | 'square',
    }))

  // Filter items based on category and search
  const filteredItems = allItems.filter((item) => {
    const matchesFilter = filter === "all" || item.category === filter
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  useEffect(() => {
    setSelectedGalleryImage(0)
    if (selectedImage !== null && selectedImage >= filteredItems.length) setSelectedImage(null)
  }, [selectedImage, filteredItems.length])

  const categories = [
    { id: "all", name: "All Projects", icon: Grid, count: allItems.length },
    {
      id: "ceremony",
      name: "Ceremonies",
      icon: Crown,
      count: allItems.filter((i) => i.category === "ceremony").length,
    },
    {
      id: "reception",
      name: "Receptions",
      icon: Sparkles,
      count: allItems.filter((i) => i.category === "reception").length,
    },
    {
      id: "pre-wedding",
      name: "Pre-Wedding",
      icon: Heart,
      count: allItems.filter((i) => i.category === "pre-wedding").length,
    },
    { id: "bridal", name: "Bridal", icon: Gem, count: allItems.filter((i) => i.category === "bridal").length },
  ]

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const handleLike = (id: number | string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredItems.length)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? filteredItems.length - 1 : selectedImage - 1)
    }
  }

  const handleBookVenue = (item: PortfolioItem) => {
    const whatsappData = {
      name: 'Portfolio Inquiry',
      email: '',
      phone: '',
      eventDate: '',
      venue: item.location || 'Not specified',
      eventType: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      guestCount: item.guests ? `${item.guests}` : '',
      budget: '',
      message: `Hello JP Events! 

I'm interested in the "${item.title}" from your portfolio.

📋 Event Details:
• Venue Type: ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}
• ${item.guests ? `Guest Count: ${item.guests}` : ''}
• ${item.location ? `Location: ${item.location}` : ''}
• ${item.date ? `Date Reference: ${item.date}` : ''}

${item.description ? `✨ What I loved: ${item.description}` : ''}

Could you please provide:
• Availability for similar setups
• Pricing details
• Customization options

Looking forward to creating something beautiful together!`
    };
    
    openWhatsAppChat(whatsappData);
  }

  // Parallax effect for background elements
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacityBg = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 0.3])

  useGSAP(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    gsap.utils.toArray<HTMLElement>('.jp-portfolio-card').forEach((card, index) => {
      gsap.fromTo(card,
        { y: index % 2 === 0 ? 24 : -18, opacity: 0.78, scale: 0.985 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            end: 'top 62%',
            scrub: 0.8,
          },
        }
      );
    });

    // Keep the cards steady while their photos travel through the frame on phones.
    // The extra scale gives the image enough bleed so the crop never reveals an edge.
    const mobileParallax = gsap.matchMedia();
    mobileParallax.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-portfolio-parallax-media]').forEach((media, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        gsap.fromTo(media, {
          yPercent: -10 * direction,
          scale: 1.3,
          transformOrigin: '50% 50%',
        }, {
          yPercent: 10 * direction,
          scale: 1.3,
          ease: 'none',
          scrollTrigger: {
            trigger: media.closest('.jp-portfolio-card') ?? media,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        });
      });
    });

    return () => mobileParallax.revert();
  }, { scope: containerRef, dependencies: [prefersReducedMotion, allItems.length, filter, viewMode] });

  return (
    <section
      ref={containerRef}
      id="portfolio"
      className="relative py-32 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.rose[50]} 0%, white 30%, ${colors.rose[100]} 70%, ${colors.rose[200]} 100%)`,
      }}
    >
      {/* Animated Background Elements */}
      <motion.div
        style={prefersReducedMotion ? { opacity: 0.2 } : { y: y1, opacity: opacityBg }}
        className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        animate={prefersReducedMotion ? undefined : {
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
          scale: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }}
      />

      <motion.div
        style={prefersReducedMotion ? { opacity: 0.15 } : { y: y2, opacity: opacityBg }}
        className="absolute bottom-20 right-10 w-24 h-24 rounded-full opacity-15 pointer-events-none"
        animate={prefersReducedMotion ? undefined : {
          rotate: -360,
          scale: [1, 0.8, 1],
        }}
        transition={{
          rotate: { duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
          scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }}
      />

      {/* Floating golden particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          aria-hidden="true"
          style={{
            background: colors.rose[300],
            opacity: 0.1,
            width: `${4 + (i * 7) % 8}px`,
            height: `${4 + (i * 7) % 8}px`,
            top: `${(i * 37) % 100}%`,
            left: `${(i * 61) % 100}%`,
          }}
          animate={prefersReducedMotion ? undefined : {
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + (i % 3),
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: (i % 5) * 0.3,
          }}
        />
      ))}

      <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
        {!contentLoading && source === 'cms' && allItems.length === 0 && <p className="mb-5 text-center text-sm text-[#65575d]" role="status">New portfolio stories will appear here when they are published.</p>}
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
          }}
          viewport={{ once: true }}
          className="mb-10 text-center sm:mb-14 lg:mb-20"
        >
          <div className="relative inline-block">
            <motion.div
              animate={prefersReducedMotion ? undefined : {
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute -top-12 -left-12"
            >
              <Sparkles className="w-16 h-16 opacity-30" style={{ color: colors.rose[400] }} />
            </motion.div>
            <motion.div
              animate={prefersReducedMotion ? undefined : {
                rotate: -360,
              }}
              transition={{
                duration: 25,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute -bottom-8 -right-8"
            >
              <Diamond className="w-12 h-12 opacity-25" style={{ color: colors.rose[500] }} />
            </motion.div>

            <h1 className="text-[clamp(2.75rem,13vw,6rem)] font-serif font-bold mb-5 sm:mb-8 leading-[0.96]">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(45deg, ${colors.rose[600]}, ${colors.rose[800]}, ${colors.rose[600]})`,
                }}
              >
                Golden
              </span>
              <br />
              <span className="text-gray-800">Portfolio</span>
            </h1>
          </div>

          <motion.div
            className="relative mx-auto mb-7 h-1.5 w-32 overflow-hidden rounded-full sm:mb-10 sm:h-2 sm:w-48"
            style={{ background: colors.rose[200] }}
            initial={prefersReducedMotion ? false : { width: 0 }}
            whileInView={prefersReducedMotion ? undefined : { width: 192 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.5, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${colors.rose[400]}, ${colors.rose[600]}, ${colors.rose[400]})`,
              }}
              animate={prefersReducedMotion ? undefined : {
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <motion.p
            className="text-xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Discover our collection of{" "}
            <span className="font-medium" style={{ color: colors.rose[700] }}>
              award-winning weddings
            </span>{" "}
            where every detail shines with perfection. From intimate ceremonies to grand celebrations, each project
            tells a unique love story.
          </motion.p>
        </motion.div>

        <ImmersiveImageRibbon
          items={portfolioRibbonItems}
          eyebrow="A visual story in motion"
          title="Love, Captured in Every Frame"
          description="Our published portfolio moments move with the page, revealing the texture and atmosphere behind each celebration."
          ctaLabel="Browse All Projects"
          ctaTo="/portfolio"
          ariaLabel="JP Events published portfolio image ribbon"
          variant="portfolio"
        />

        {/* Enhanced Filter and Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-8 space-y-4 sm:mb-12 sm:space-y-6"
        >
          <div className="flex gap-2.5 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:gap-3">
            {categories.map(({ id, name, icon: Icon, count }) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${filter === id ? "border-gold-600 bg-gold-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gold-500"}`}
              >
                <Icon className="h-4 w-4" />
                <span>{name}</span>
                <span className="text-xs opacity-75">{count}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <label className="w-full sm:max-w-md">
              <span className="sr-only">Search portfolio</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search projects"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-gold-500"
              />
            </label>
            <div className="flex gap-2" role="group" aria-label="Portfolio layout">
              <button type="button" aria-pressed={viewMode === "masonry"} onClick={() => setViewMode("masonry")} className="min-h-11 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:border-gold-500">Masonry</button>
              <button type="button" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")} className="min-h-11 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:border-gold-500">Grid</button>
            </div>
          </div>
        </motion.div>

        {contentLoading && (
          <p className="mb-6 text-center text-sm text-gray-600" role="status">Loading published portfolio…</p>
        )}
        {/* Enhanced Portfolio Grid */}
        {filteredItems.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className={
              viewMode === "masonry"
                ? "columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            }
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className={`jp-portfolio-card ${viewMode === "masonry" ? "break-inside-avoid" : ""} group cursor-pointer relative`}
                whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                onHoverStart={() => setHoveredItem(index)}
                onHoverEnd={() => setHoveredItem(null)}
                onClick={() => {
                  setSelectedGalleryImage(0)
                  setSelectedImage(index)
                }}
              >
                <div className="relative overflow-hidden rounded-3xl shadow-xl bg-white">
                  {/* Image/Video Container */}
                  <div className="relative overflow-hidden">
                    {item.type === "video" ? (
                      <div className="relative">
                        <video
                          data-portfolio-parallax-media
                          autoPlay
                          loop
                          muted={isMuted}
                          playsInline
                          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                          poster={item.poster}
                        >
                          <source src={item.src} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredItem === index ? 1 : 0 }}
                          className="absolute top-4 right-4 flex space-x-2"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsMuted(!isMuted)
                            }}
                            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          data-portfolio-parallax-media
                          src={item.src || "/placeholder.svg"}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    )}

                    {/* Overlay Content */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: hoveredItem === index ? 1 : 0,
                        y: hoveredItem === index ? 0 : 20,
                      }}
                      className="absolute inset-0 flex flex-col justify-between p-6"
                    >
                      {/* Top Actions */}
                      <div className="flex justify-between items-start">
                        <div className="flex space-x-2">
                          {item.type === "video" && (
                            <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center">
                              <Video className="w-3 h-3 mr-1" />
                              VIDEO
                            </div>
                          )}
                          {"awards" in item && item.awards && item.awards.length > 0 && (
                            <div
                              className="px-3 py-1 text-white text-xs font-bold rounded-full flex items-center"
                              style={{ background: colors.rose[600] }}
                            >
                              <Award className="w-3 h-3 mr-1" />
                              AWARD
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(item.id)
                            }}
                            className={`p-2 rounded-full transition-colors ${
                              likedItems.has(item.id)
                                ? "bg-red-500 text-white"
                                : "bg-black/50 text-white hover:bg-red-500"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? "fill-current" : ""}`} />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Content */}
                      <div className="text-white">
                        <h3 className="text-xl font-serif font-bold mb-2">{item.title}</h3>
                        <p className="text-sm opacity-90 mb-3">{item.description}</p>

                        {/* Stats */}
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {item.views || 0}
                          </div>
                          <div className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {item.likes || 0}
                          </div>
                          {"location" in item && (
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {item.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-serif font-semibold text-gray-800 group-hover:text-gold-700 transition-colors">
                        {item.title}
                      </h3>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: colors.rose[100],
                          color: colors.rose[700],
                        }}
                      >
                        {item.category.toUpperCase()}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                    {/* Enhanced Details */}
                    {"guests" in item && (
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {item.guests} guests
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.duration}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {item.date}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {item.budget}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {"tags" in item && item.tags && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 text-xs rounded-full"
                            style={{
                              background: colors.rose[50],
                              color: colors.rose[600],
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* WhatsApp booking button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBookVenue(item)
                      }}
                      className="w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-green-500 text-green-600 hover:bg-green-50 mb-3"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-1.557.893-2.862 2.354-3.54 3.994-1.378 3.244.341 7.801 3.585 9.179 1.487.627 3.077.818 4.573.535 1.495-.283 2.848-1.243 3.716-2.323 1.378-1.628 2.123-3.808 2.123-6.01 0-.704-.057-1.42-.173-2.1-.331-1.872-1.423-3.51-2.868-4.656-1.445-.975-3.244-1.466-5.195-1.466z" />
                      </svg>
                      <span>Book This Venue</span>
                    </motion.button>

                    {/* Existing View Details button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                      style={{
                        background: `linear-gradient(45deg, ${colors.rose[400]}, ${colors.rose[600]})`,
                        color: "white",
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-serif font-medium text-gray-600 mb-4">
              No items found matching your criteria
            </h3>
            <button
              onClick={() => {
                setFilter("all")
                setSearchQuery("")
              }}
              className="px-6 py-3 rounded-xl font-medium text-white"
              style={{
                background: `linear-gradient(45deg, ${colors.rose[500]}, ${colors.rose[700]})`,
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-24"
        >
          <div
            className="relative rounded-4xl p-1 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${colors.rose[400]}, ${colors.rose[600]}, ${colors.rose[400]})`,
            }}
          >
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-12">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 30,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="absolute top-8 right-8 opacity-10"
              >
                <Crown className="w-16 h-16" style={{ color: colors.rose[500] }} />
              </motion.div>

              <h3 className="text-4xl font-serif font-bold mb-6">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(45deg, ${colors.rose[600]}, ${colors.rose[800]})`,
                  }}
                >
                  Ready to Create Magic?
                </span>
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Let's design your dream wedding that will be featured in our next golden portfolio
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const whatsappData = {
                    name: 'Portfolio General Inquiry',
                    email: '',
                    phone: '',
                    eventDate: '',
                    venue: '',
                    eventType: '',
                    guestCount: '',
                    budget: '',
                    message: `Hello JP Events! 

I saw your amazing portfolio and I'm interested in creating a beautiful event with you.

Could you please help me with:
• Available services and packages
• Pricing information
• Booking process
• Consultation availability

Looking forward to hearing from you!`
                  };
                  openWhatsAppChat(whatsappData);
                }}
                className="px-12 py-4 rounded-2xl font-semibold text-lg text-white shadow-xl"
                style={{
                  background: `linear-gradient(45deg, ${colors.rose[500]}, ${colors.rose[700]})`,
                }}
              >
                Start Your Golden Journey
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <ImmersiveImageRibbon
        items={socialWallRibbonItems}
        eyebrow="Follow The Magic"
        title="SOCIAL WALL"
        description="Little moments, beautiful details, and celebrations worth remembering."
        ctaTo=""
        ariaLabel="Follow the magic social wall"
        variant="social-wall"
        onItemClick={(ribbonItem) => {
          const portfolioIndex = allItems.findIndex((item) => String(item.id) === String(ribbonItem.portfolioItemId));
          if (portfolioIndex < 0) return;

          setFilter("all");
          setSearchQuery("");
          setSelectedGalleryImage(0);
          setSelectedImage(portfolioIndex);
        }}
      />

      {/* Floating WhatsApp Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          const whatsappData = {
            name: 'Portfolio Visitor',
            email: '',
            phone: '',
            eventDate: '',
            venue: '',
            eventType: '',
            guestCount: '',
            budget: '',
            message: `Hello JP Events! 

I was browsing your portfolio and I'm impressed with your work. Could you please provide more information about your services?`
          };
          openWhatsAppChat(whatsappData);
        }}
        className="fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl z-40 flex items-center justify-center"
        style={{
          boxShadow: '0 8px 32px rgba(37, 211, 102, 0.4)'
        }}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-1.557.893-2.862 2.354-3.54 3.994-1.378 3.244.341 7.801 3.585 9.179 1.487.627 3.077.818 4.573.535 1.495-.283 2.848-1.243 3.716-2.323 1.378-1.628 2.123-3.808 2.123-6.01 0-.704-.057-1.42-.173-2.1-.331-1.872-1.423-3.51-2.868-4.656-1.445-.975-3.244-1.466-5.195-1.466z" />
        </svg>
      </motion.button>

      {/* Enhanced Lightbox Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-6xl max-h-full bg-white rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image/Video */}
              <div className="relative">
                {filteredItems[selectedImage].type === "video" ? (
                  <video
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="max-w-full max-h-[70vh] object-contain"
                    poster={filteredItems[selectedImage].poster}
                  >
                    <source src={filteredItems[selectedImage].src} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={filteredItems[selectedImage].gallery?.[selectedGalleryImage] || filteredItems[selectedImage].src || "/placeholder.svg"}
                    alt={filteredItems[selectedImage].title}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                )}
                {filteredItems[selectedImage].type !== "video" && (filteredItems[selectedImage].gallery?.length ?? 0) > 1 && (
                  <div className="flex justify-center gap-2 overflow-x-auto bg-black/70 p-3" aria-label="Portfolio image gallery">
                    {filteredItems[selectedImage].gallery?.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedGalleryImage(index)}
                        aria-label={`Show gallery image ${index + 1}`}
                        aria-pressed={selectedGalleryImage === index}
                        className={`shrink-0 overflow-hidden rounded border-2 ${selectedGalleryImage === index ? "border-rose-400" : "border-transparent"}`}
                      >
                        <img src={image} alt="" className="h-14 w-14 object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-serif font-bold text-gray-800 mb-2">
                      {filteredItems[selectedImage].title}
                    </h3>
                    <p className="text-gray-600 text-lg">{filteredItems[selectedImage].description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleLike(filteredItems[selectedImage].id)}
                      className={`p-3 rounded-full transition-colors ${
                        likedItems.has(filteredItems[selectedImage].id)
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${likedItems.has(filteredItems[selectedImage].id) ? "fill-current" : ""}`}
                      />
                    </button>
                    <button className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Enhanced Details */}
                {"guests" in filteredItems[selectedImage] && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1" style={{ color: colors.rose[600] }}>
                        {filteredItems[selectedImage].guests}
                      </div>
                      <div className="text-sm text-gray-500">Guests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1" style={{ color: colors.rose[600] }}>
                        {filteredItems[selectedImage].duration}
                      </div>
                      <div className="text-sm text-gray-500">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1" style={{ color: colors.rose[600] }}>
                        {filteredItems[selectedImage].budget}
                      </div>
                      <div className="text-sm text-gray-500">Investment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1" style={{ color: colors.rose[600] }}>
                        {filteredItems[selectedImage].views}
                      </div>
                      <div className="text-sm text-gray-500">Views</div>
                    </div>
                  </div>
                )}

                {/* WhatsApp Button in Lightbox */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBookVenue(filteredItems[selectedImage])}
                  className="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 mb-4 border-2 border-green-500 text-green-600 hover:bg-green-50"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-1.557.893-2.862 2.354-3.54 3.994-1.378 3.244.341 7.801 3.585 9.179 1.487.627 3.077.818 4.573.535 1.495-.283 2.848-1.243 3.716-2.323 1.378-1.628 2.123-3.808 2.123-6.01 0-.704-.057-1.42-.173-2.1-.331-1.872-1.423-3.51-2.868-4.656-1.445-.975-3.244-1.466-5.195-1.466z" />
                  </svg>
                  <span>Contact via WhatsApp</span>
                </motion.button>
              </div>

              {/* Navigation and Close */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 p-3 bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-gray-800 transition-colors shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-gray-800 transition-colors shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-gray-800 transition-colors shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Portfolio
