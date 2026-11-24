import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import useEmblaCarousel from 'embla-carousel-react';
import { openWhatsAppChat } from '../../utils/whatsappConfig';
import { legacyPortfolioItems } from '../../data/legacyCmsData';
import { usePublishedPortfolio, usePublishedVenues } from '../../hooks/usePublishedContent';
import type { VenueViewModel } from '../../types/cms';
import ImmersiveImageRibbon, { type RibbonImage } from '../ImmersiveImageRibbon';
import { EditableImage } from '../WebsiteImageEditor';

gsap.registerPlugin(ScrollTrigger);

const weddingFilms = [
  {
    src: 'https://res.cloudinary.com/dwcszeuuh/video/upload/v1753452127/16352543-hd_1920_1080_30fps_1_melkee.mp4',
    title: 'Haldi & Mehendi',
    description: 'Vibrant color, family, and tradition.',
    poster: 'https://i.postimg.cc/PfV33Mhk/Screenshot-2025-07-25-205012.png',
  },
  {
    src: 'https://res.cloudinary.com/dwcszeuuh/video/upload/v1753451047/15157499-hd_1920_1080_25fps_1_fwdc8s.mp4',
    title: 'Sacred vows',
    description: 'The quiet moments before forever.',
    poster: 'https://i.postimg.cc/L5Qbjt42/Screenshot-2025-07-25-205047.png',
  },
  {
    src: 'https://res.cloudinary.com/dwcszeuuh/video/upload/v1753451047/13305452_1920_1080_50fps_1_pxi3uk.mp4',
    title: 'A Kerala celebration',
    description: 'A wedding rooted in culture and family.',
    poster: 'https://i.postimg.cc/5yyP9XBG/Screenshot-2025-07-25-205032.png',
  },
  {
    src: 'https://res.cloudinary.com/dwcszeuuh/video/upload/v1753456233/4286675-hd_1920_1080_25fps_w9jfdb.mp4',
    title: 'A grand celebration',
    description: 'A day shaped around the people you love.',
    poster: 'https://i.postimg.cc/j5FHXZfg/Screenshot-2025-07-25-205400.png',
  },
];

const weddingServices = [
  {
    title: 'Reception',
    description: 'A warm welcome and a memorable setting.',
    image: 'https://i.postimg.cc/N0GBD93K/pexels-abhishek-nigam-582276386-30482897.jpg',
    slot: 'home.services.reception',
  },
  {
    title: 'Ceremony',
    description: 'Thoughtful details for the heart of the day.',
    image: 'https://i.postimg.cc/Zq6KszRQ/pexels-dk121-3865895.jpg',
    slot: 'home.services.ceremony',
  },
  {
    title: 'Haldi & Mehendi',
    description: 'Colorful gatherings filled with family.',
    image: 'https://i.postimg.cc/ZRD8nmLR/Screenshot-2025-06-27-234725.png',
    slot: 'home.services.haldi-mehendi',
  },
  {
    title: 'Sangeet',
    description: 'An evening made for music and movement.',
    image: 'https://i.postimg.cc/pL2pw7D1/pexels-anish-bindoriya-1957073-28200149.jpg',
    slot: 'home.services.sangeet',
  },
];

function HomeSectionHeading({ eyebrow, title, description, dark = false }: { eyebrow: string; title: string; description?: string; dark?: boolean }) {
  return (
    <div className="mb-6 max-w-2xl sm:mb-9">
      <p className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] sm:text-xs ${dark ? 'text-[#eab6c5]' : 'text-[#a63f63]'}`}>{eyebrow}</p>
      <h2 className={`font-serif text-[clamp(1.85rem,8vw,3.5rem)] leading-[1.03] tracking-[-0.035em] ${dark ? 'text-[#fffdfa]' : 'text-[#30242a]'}`}>{title}</h2>
      {description && <p className={`mt-3 max-w-xl text-sm leading-6 sm:mt-4 sm:text-base sm:leading-7 ${dark ? 'text-white/75' : 'text-[#6b5a62]'}`}>{description}</p>}
    </div>
  );
}

function FeaturedWeddingStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoFrameRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion || !photoFrameRef.current) return;
    gsap.fromTo(photoFrameRef.current,
      { clipPath: 'inset(0 0 14% 0)', y: 12 },
      {
        clipPath: 'inset(0 0 0 0)',
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: photoFrameRef.current,
          start: 'top 82%',
          once: true,
        },
      }
    );
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  return (
    <section ref={sectionRef} className="bg-[#f8f5f1] py-10 sm:py-16 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-7 px-4 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:px-12">
        <div ref={photoFrameRef} className="relative overflow-hidden bg-[#ddd2ca]">
          <EditableImage
            slotKey="home.experiences.featured"
            src="https://i.postimg.cc/N0GBD93K/pexels-abhishek-nigam-582276386-30482897.jpg"
            alt="Himani and Nihal's colorful wedding celebration"
            loading="lazy"
            decoding="async"
            width="1200"
            height="1400"
            className="aspect-[1.06/1] w-full object-cover sm:aspect-[1.35/1] lg:aspect-[0.91/1]"
          />
          <p className="absolute bottom-3 left-3 bg-white/90 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.17em] text-[#30242a] backdrop-blur sm:bottom-5 sm:left-5 sm:px-4 sm:text-xs">
            A JP Events celebration · Hyderabad
          </p>
        </div>
        <div className="py-1 lg:py-10">
          <HomeSectionHeading eyebrow="Made personal" title="A celebration shaped around them" />
          <p className="text-sm leading-6 text-[#55484d] sm:text-base sm:leading-7">
            Himani and Nihal brought their own ideas, colors, and energy to every gathering. Their celebration moved from a colorful carnival Sangeet to a relaxed Boho afternoon, with each event designed to feel like them.
          </p>
          <blockquote className="mt-6 border-l border-[#b34468] pl-4 font-serif text-lg italic leading-7 text-[#5c3b49] sm:mt-8 sm:pl-6 sm:text-xl sm:leading-8">
            “Our wedding would not have been the fairytale wonder it turned out to be without JP Events and their full efforts.”
            <footer className="mt-3 font-sans text-xs not-italic text-[#76676d]">— Himani & Nihal</footer>
          </blockquote>
          <Link to="/portfolio" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#9b385b] underline decoration-[#c98aa0] underline-offset-8 transition-colors hover:text-[#6f2540] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a63f63]">
            Explore more celebrations <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function WeddingFilmGallery() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' });
  const [currentSnap, setCurrentSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCurrentSnap(emblaApi.selectedScrollSnap());
      setSnapCount(emblaApi.scrollSnapList().length);
      setPlayingIndex(null);
    };
    update();
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  return (
    <section className="overflow-hidden bg-[#21191a] py-10 text-white sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <HomeSectionHeading eyebrow="JP Events films" title="Stories in motion" description="A few favorite moments from celebrations we loved bringing to life." dark />
          <div className="mb-8 hidden shrink-0 gap-2 sm:flex">
            <button type="button" onClick={() => emblaApi?.scrollPrev()} disabled={!emblaApi?.canScrollPrev()} aria-label="Previous wedding film" className="grid h-12 w-12 place-items-center border border-white/30 text-white transition hover:bg-white/10 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => emblaApi?.scrollNext()} disabled={!emblaApi?.canScrollNext()} aria-label="Next wedding film" className="grid h-12 w-12 place-items-center border border-white/30 text-white transition hover:bg-white/10 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div ref={emblaRef} className="overflow-hidden" role="region" aria-label="Wedding films" aria-roledescription="carousel">
          <div className="-ml-3 flex touch-pan-y sm:-ml-4">
            {weddingFilms.map((film, index) => (
              <article key={film.title} className="min-w-0 flex-[0_0_82%] pl-3 sm:flex-[0_0_48%] sm:pl-4 lg:flex-[0_0_32%]">
                <div className="group relative aspect-[0.9/1] overflow-hidden bg-[#493b3e] sm:aspect-[0.86/1]">
                  {playingIndex === index ? (
                    <video autoPlay controls playsInline preload="metadata" poster={film.poster} className="absolute inset-0 h-full w-full bg-black object-cover" aria-label={`${film.title} wedding film`} onError={() => setPlayingIndex(null)}>
                      <source src={film.src} type="video/mp4" />
                    </video>
                  ) : (
                    <>
                      <img src={film.poster} alt={`${film.title} wedding film still`} loading="lazy" decoding="async" width="900" height="1050" className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025] motion-reduce:transform-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/5" aria-hidden="true" />
                      <button type="button" onClick={() => setPlayingIndex(index)} className="absolute inset-0 grid place-items-center text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white" aria-label={`Play ${film.title} film`}>
                        <span className="grid h-14 w-14 place-items-center border border-white/80 bg-black/20 pl-1 backdrop-blur-sm transition-colors group-hover:bg-white/20 sm:h-16 sm:w-16"><Play className="h-6 w-6 fill-current" aria-hidden="true" /></span>
                      </button>
                      <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                        <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.2em] text-white/75">Wedding film</p>
                        <h3 className="font-serif text-xl sm:text-2xl">{film.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-white/80 sm:text-sm">{film.description}</p>
                      </div>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between sm:mt-6">
          <div className="flex items-center gap-2 sm:hidden">
            <button type="button" onClick={() => emblaApi?.scrollPrev()} disabled={!emblaApi?.canScrollPrev()} aria-label="Previous wedding film" className="grid h-11 w-11 place-items-center border border-white/30 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
            <button type="button" onClick={() => emblaApi?.scrollNext()} disabled={!emblaApi?.canScrollNext()} aria-label="Next wedding film" className="grid h-11 w-11 place-items-center border border-white/30 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
            <span className="ml-1 text-[10px] text-white/65">Swipe to explore</span>
          </div>
          <div className="ml-auto flex items-center gap-2" role="group" aria-label="Wedding film carousel position">
            {Array.from({ length: snapCount }, (_, index) => (
              <button key={index} type="button" onClick={() => emblaApi?.scrollTo(index)} aria-label={`Show wedding film group ${index + 1} of ${snapCount}`} aria-current={currentSnap === index ? 'true' : undefined} className={`h-1.5 rounded-full transition-[width,background-color] ${currentSnap === index ? 'w-8 bg-[#eab6c5]' : 'w-2 bg-white/35 hover:bg-white/70'}`} />
            ))}
            <span className="ml-1 min-w-12 text-right font-mono text-[10px] text-white/75">{String(currentSnap + 1).padStart(2, '0')} / {String(snapCount).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceGallery() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' });
  const [currentSnap, setCurrentSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCurrentSnap(emblaApi.selectedScrollSnap());
      setSnapCount(emblaApi.scrollSnapList().length);
    };
    update();
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  return (
    <section className="bg-[#fffdfa] py-10 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between gap-4">
          <HomeSectionHeading eyebrow="Thoughtful by design" title="The moments that make a wedding" description="From the first welcome to the last dance, every gathering has its own feeling." />
          <div className="mb-8 hidden shrink-0 gap-2 sm:flex">
            <button type="button" onClick={() => emblaApi?.scrollPrev()} disabled={!emblaApi?.canScrollPrev()} aria-label="Previous celebration style" className="grid h-12 w-12 place-items-center border border-[#e7d9d7] text-[#4a3941] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
            <button type="button" onClick={() => emblaApi?.scrollNext()} disabled={!emblaApi?.canScrollNext()} aria-label="Next celebration style" className="grid h-12 w-12 place-items-center border border-[#e7d9d7] text-[#4a3941] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
          </div>
        </div>
        <div ref={emblaRef} className="overflow-hidden" role="region" aria-label="Wedding celebration styles" aria-roledescription="carousel">
          <div className="-ml-3 flex touch-pan-y sm:-ml-4">
            {weddingServices.map((service, index) => (
              <Link key={service.title} to="/services" className="group min-w-0 flex-[0_0_76%] pl-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white sm:flex-[0_0_46%] sm:pl-4 lg:flex-[0_0_25%]">
                <div className="relative aspect-[0.9/1] overflow-hidden bg-[#e4dbd5] sm:aspect-[0.86/1]">
                  <EditableImage slotKey={service.slot} src={service.image} alt={`${service.title} wedding design`} loading="lazy" decoding="async" width="800" height="950" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" aria-hidden="true" />
                  <div className="absolute bottom-4 left-4 right-4 text-white sm:bottom-6 sm:left-6 sm:right-6">
                    <span className="mb-1 block font-mono text-[10px] text-white/70">0{index + 1}</span>
                    <h3 className="font-serif text-2xl leading-tight sm:text-3xl">{service.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-white/85 sm:text-sm">{service.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between sm:mt-5">
          <div className="flex gap-2 sm:hidden">
            <button type="button" onClick={() => emblaApi?.scrollPrev()} disabled={!emblaApi?.canScrollPrev()} aria-label="Previous celebration style" className="grid h-11 w-11 place-items-center border border-[#e7d9d7] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
            <button type="button" onClick={() => emblaApi?.scrollNext()} disabled={!emblaApi?.canScrollNext()} aria-label="Next celebration style" className="grid h-11 w-11 place-items-center border border-[#e7d9d7] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
            <span className="ml-1 self-center text-[10px] text-[#76676d]">Swipe to explore</span>
          </div>
          <div className="ml-auto flex items-center gap-2" role="group" aria-label="Celebration style carousel position">
            {Array.from({ length: snapCount }, (_, index) => (
              <button key={index} type="button" onClick={() => emblaApi?.scrollTo(index)} aria-label={`Show celebration style group ${index + 1} of ${snapCount}`} aria-current={currentSnap === index ? 'true' : undefined} className={`h-1.5 rounded-full transition-[width,background-color] ${currentSnap === index ? 'w-8 bg-[#a63f63]' : 'w-2 bg-[#d8c6c1]'}`} />
            ))}
          </div>
        </div>
        <div className="mt-5 sm:mt-7"><Link to="/services" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#9b385b] underline decoration-[#c98aa0] underline-offset-8">Explore our services <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}

function openVenueInquiry(venue: VenueViewModel) {
  openWhatsAppChat({
    name: 'Reception Hall Inquiry',
    email: '',
    phone: '',
    eventDate: '',
    venue: venue.title,
    eventType: 'Reception',
    guestCount: '',
    budget: '',
    message: `Hello! I'm interested in ${venue.title} for my reception event. ${venue.capacity ? `Capacity needed: ${venue.capacity}. ` : ''}${venue.description || 'Could you please share more information about availability and pricing?'}`,
  });
}

function ReceptionVenueCarousel() {
  const { items: venues, loading, error, source } = usePublishedVenues();
  const prefersReducedMotion = useReducedMotion();
  const options = useMemo(() => ({ align: 'start' as const, containScroll: 'trimSnaps' as const }), []);
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => setCurrentSlide(emblaApi.selectedScrollSnap());
    update();
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  const activeVenue = venues[currentSlide];
  return (
    <section className="bg-[#f3efec] py-10 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="mb-5 sm:mb-8">
          <HomeSectionHeading eyebrow="The JP Events venue collection" title="A setting worth celebrating" description="Elegant venues that set the perfect stage for your celebration." />
          {loading && <p className="text-xs text-[#65575d]" role="status">Loading published venues…</p>}
          {error && <p className="text-xs text-rose-800" role="status">{source === 'legacy' ? 'Showing saved reception hall content while live venues are temporarily unavailable.' : 'Showing the last loaded reception halls while reconnecting to live content.'}</p>}
        </div>

        <div className="overflow-hidden" role="region" aria-label="Published reception halls" aria-roledescription="carousel">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex touch-pan-y gap-3 sm:gap-4">
              {venues.map((venue, index) => (
                <article key={venue.id} className="relative min-w-0 flex-[0_0_91%] overflow-hidden bg-[#d2c5bc] sm:flex-[0_0_74%] lg:flex-[0_0_100%]" aria-roledescription="slide" aria-label={`${index + 1} of ${venues.length}`}>
                  <div className="relative aspect-[0.96/1] sm:aspect-[1.55/1] lg:aspect-[2.12/1]">
                    <EditableImage slotKey={`venues.${venue.id}.cover`} src={venue.src} alt={`${venue.title} reception venue`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" width="1600" height="900" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161012]/80 via-[#161012]/15 to-transparent" aria-hidden="true" />
                    <div className="absolute bottom-5 left-4 right-4 text-white sm:bottom-8 sm:left-8 sm:right-8">
                      <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/75">Reception venue · 0{index + 1}</p>
                      <h3 className="font-serif text-2xl leading-tight sm:text-4xl">{venue.title}</h3>
                      {venue.capacity && <p className="mt-1 text-sm font-semibold sm:mt-2 sm:text-base">{venue.capacity}</p>}
                      {venue.description && <p className="mt-1 max-w-xl text-xs leading-5 text-white/85 sm:mt-2 sm:text-sm sm:leading-6">{venue.description}</p>}
                      {venue.priceText && <p className="mt-1 text-xs font-semibold sm:mt-2 sm:text-sm">{venue.priceText}{venue.priceNote ? ` · ${venue.priceNote}` : ''}</p>}
                    </div>
                    <button type="button" onClick={() => openVenueInquiry(venue)} className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-[#1fc76a] text-white shadow-lg transition-colors hover:bg-[#18ad59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:right-5 sm:top-5 sm:h-12 sm:w-12" aria-label={`Ask about ${venue.title} on WhatsApp`}>
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {!loading && !error && venues.length === 0 && <p className="border border-[#d8cbc5] bg-white px-5 py-8 text-center text-sm text-[#65575d]">No published reception halls are available right now.</p>}

        {venues.length > 0 && (
          <div className="mt-4 flex items-center justify-between sm:mt-5">
            <div className="flex gap-2">
              <button type="button" onClick={() => emblaApi?.scrollPrev(Boolean(prefersReducedMotion))} disabled={currentSlide === 0} className="grid h-11 w-11 place-items-center border border-[#d3c5bf] bg-white/70 text-[#382832] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]" aria-label="Previous reception venue"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
              <button type="button" onClick={() => emblaApi?.scrollNext(Boolean(prefersReducedMotion))} disabled={currentSlide >= venues.length - 1} className="grid h-11 w-11 place-items-center border border-[#d3c5bf] bg-white/70 text-[#382832] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]" aria-label="Next reception venue"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
            </div>
            <div className="flex items-center gap-2" role="group" aria-label="Choose a reception venue">
              <span className="font-mono text-[10px] text-[#66585e]">{String(currentSlide + 1).padStart(2, '0')} / {String(venues.length).padStart(2, '0')}</span>
              <span className="h-px w-12 bg-[#cbb8b1] sm:w-20" aria-hidden="true"><span className="block h-px bg-[#a63f63] transition-[width]" style={{ width: `${((currentSlide + 1) / venues.length) * 100}%` }} /></span>
            </div>
            {activeVenue && <button type="button" onClick={() => openVenueInquiry(activeVenue)} className="hidden min-h-11 items-center gap-2 bg-[#1fc76a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#18ad59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1fc76a] sm:inline-flex"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Inquire about this venue</button>}
          </div>
        )}
      </div>
    </section>
  );
}

function SocialWall() {
  const { items: publishedPortfolio, loading, source } = usePublishedPortfolio(legacyPortfolioItems);
  const useLocalFallback = source === 'legacy';
  const items = useMemo<RibbonImage[]>(() => {
    const fallback = legacyPortfolioItems.filter((item) => item.type === 'image' && item.src && !item.src.includes('/SN5Pv4YB/'));
    const configured = publishedPortfolio.filter((item) => item.type === 'image' && item.src && item.socialWallRow);
    const wallItems = useLocalFallback
      ? fallback.map((item, index) => ({ ...item, socialWallRow: (index % 3 + 1) as 1 | 2 | 3, socialWallSortOrder: Math.floor(index / 3) }))
      : configured.length > 0
        ? configured
        : publishedPortfolio.filter((item) => item.type === 'image' && item.src).map((item, index) => ({ ...item, socialWallRow: (index % 3 + 1) as 1 | 2 | 3, socialWallSortOrder: Math.floor(index / 3) }));

    return wallItems
      .filter((item) => Boolean(item.src && item.socialWallRow))
      .map((item, index) => ({
        id: item.id,
        src: item.src,
        alt: item.title,
        row: item.socialWallRow,
        order: item.socialWallSortOrder ?? index,
        portfolioItemId: item.id,
        aspect: (index % 3 === 0 ? 'portrait' : index % 3 === 1 ? 'landscape' : 'square') as RibbonImage['aspect'],
      }));
  }, [publishedPortfolio, useLocalFallback]);

  return (
    <>
    {!loading && source === 'cms' && items.length === 0 && <p className="mx-auto max-w-7xl px-4 text-center text-sm text-[#65575d] sm:px-8 lg:px-12" role="status">New wedding moments will appear here when they are published.</p>}
    <ImmersiveImageRibbon
      items={items}
      eyebrow="Follow The Magic"
      title="SOCIAL WALL"
      description="Wedding moments from the JP Events portfolio."
      ctaLabel="View the portfolio"
      ctaTo="/portfolio"
      ariaLabel="Follow the magic social wall"
      variant="social-wall"
    />
    </>
  );
}

function ClosingContact() {
  return (
    <section className="relative isolate flex min-h-[380px] items-end overflow-hidden bg-[#24191b] text-white sm:min-h-[460px] lg:min-h-[560px]">
      <img src="https://i.postimg.cc/rm3jKR6d/pexels-fotographiya-wedding-photography-823737813-29470577.jpg" alt="A wedding celebration designed by JP Events" loading="lazy" decoding="async" width="1800" height="1100" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#171011]/85 via-[#171011]/30 to-transparent" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/75 sm:text-xs">Your celebration, your story</p>
        <h2 className="max-w-3xl font-serif text-[clamp(2.2rem,9vw,5rem)] leading-[0.98] tracking-[-0.035em]">Let’s make room for the moments that matter.</h2>
        <Link to="/contact" className="mt-6 inline-flex min-h-12 items-center gap-3 border border-white/75 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#30242a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mt-8 sm:min-h-14 sm:px-7 sm:text-base">
          Start a conversation <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export default function HomeEditorialSections() {
  return (
    <>
      <section className="bg-[#fffdfa] px-5 py-8 sm:px-8 sm:py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-3 border-l border-[#c88da0] pl-4 sm:gap-4 sm:pl-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a63f63] sm:text-xs">JP Events · Hyderabad</p>
          <p className="max-w-3xl font-serif text-xl leading-snug tracking-[-0.02em] text-[#30242a] sm:text-2xl lg:text-[2rem]">
            Bespoke decor that tells your unique love story with elegance and care.
          </p>
        </div>
      </section>
      <FeaturedWeddingStory />
      <WeddingFilmGallery />
      <SocialWall />
      <ServiceGallery />
      <ReceptionVenueCarousel />
      <ClosingContact />
    </>
  );
}
