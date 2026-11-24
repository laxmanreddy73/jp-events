import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import useEmblaCarousel from 'embla-carousel-react';
import { EditableImage } from './WebsiteImageEditor';

gsap.registerPlugin(ScrollTrigger);

export interface RibbonImage {
  id: string | number;
  src: string;
  alt: string;
  aspect?: 'portrait' | 'landscape' | 'square';
  editableSlotKey?: string;
  row?: 1 | 2 | 3;
  order?: number;
  portfolioItemId?: string | number;
}

interface ImmersiveImageRibbonProps {
  items: RibbonImage[];
  eyebrow: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaTo?: string;
  ariaLabel: string;
  variant?: 'home' | 'portfolio' | 'services' | 'social-wall';
  editableSlotKey?: (item: RibbonImage) => string;
  onItemClick?: (item: RibbonImage) => void;
}

const aspectClasses = {
  portrait: 'h-[19.5rem] w-[68vw] max-w-[17rem] md:h-[21rem] md:w-[15.5rem] md:max-w-none',
  landscape: 'h-[14.5rem] w-[78vw] max-w-[20.5rem] md:h-[17.5rem] md:w-[24rem] md:max-w-none',
  square: 'h-[17.5rem] w-[68vw] max-w-[17rem] md:h-[18.5rem] md:w-[18.5rem] md:max-w-none',
};

const socialWallCarouselOptions = {
  align: 'start' as const,
  containScroll: 'trimSnaps' as const,
  duration: 26,
};
const disabledCarouselOptions = { active: false };

interface RibbonRowProps {
  rowItems: RibbonImage[];
  rowIndex: number;
  isSocialWall: boolean;
  isCarousel?: boolean;
  ariaHidden?: boolean;
  onItemClick?: (item: RibbonImage) => void;
}

function RibbonRow({ rowItems, rowIndex, isSocialWall, isCarousel = isSocialWall, ariaHidden, onItemClick }: RibbonRowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(isCarousel && !isSocialWall ? socialWallCarouselOptions : disabledCarouselOptions);
  const nativeViewportRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [currentSnap, setCurrentSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [nativeCurrentSnap, setNativeCurrentSnap] = useState(0);
  const [nativeSnapCount, setNativeSnapCount] = useState(1);
  const [nativeCanScrollPrev, setNativeCanScrollPrev] = useState(false);
  const [nativeCanScrollNext, setNativeCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi || !isCarousel || isSocialWall) return;
    const update = () => {
      setCurrentSnap(emblaApi.selectedScrollSnap());
      setSnapCount(emblaApi.scrollSnapList().length);
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    update();
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi, isCarousel, isSocialWall]);

  useEffect(() => {
    const viewport = nativeViewportRef.current;
    if (!isSocialWall || !viewport) return;

    const syncPosition = () => {
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const track = viewport.firstElementChild;
      const firstCard = track?.firstElementChild as HTMLElement | null;
      const gap = track ? Number.parseFloat(getComputedStyle(track).columnGap) || 0 : 0;
      const step = Math.max(1, (firstCard?.getBoundingClientRect().width ?? viewport.clientWidth * 0.75) + gap);
      const count = maxScroll > 1 ? Math.ceil(maxScroll / step) + 1 : 1;
      setNativeSnapCount(count);
      setNativeCurrentSnap(Math.min(count - 1, Math.round(viewport.scrollLeft / step)));
      setNativeCanScrollPrev(viewport.scrollLeft > 1);
      setNativeCanScrollNext(maxScroll - viewport.scrollLeft > 1);
    };
    const scheduleSync = () => {
      window.clearTimeout(scrollTimerRef.current ?? undefined);
      scrollTimerRef.current = window.setTimeout(syncPosition, 90);
    };
    const resizeObserver = new ResizeObserver(syncPosition);

    syncPosition();
    resizeObserver.observe(viewport);
    viewport.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', syncPosition, { passive: true });

    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', syncPosition);
      window.clearTimeout(scrollTimerRef.current ?? undefined);
    };
  }, [isSocialWall, rowItems.length]);

  const moveNativeRow = (direction: -1 | 1) => {
    const viewport = nativeViewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({
      left: direction * Math.max(viewport.clientWidth * 0.78, 160),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isCarousel) return;
    if (isSocialWall) {
      if (event.key === 'ArrowRight' && nativeCanScrollNext) {
        event.preventDefault();
        moveNativeRow(1);
      } else if (event.key === 'ArrowLeft' && nativeCanScrollPrev) {
        event.preventDefault();
        moveNativeRow(-1);
      }
      return;
    }
    if (!emblaApi) return;
    if (event.key === 'ArrowRight' && emblaApi.canScrollNext()) {
      event.preventDefault();
      emblaApi.scrollNext();
    } else if (event.key === 'ArrowLeft' && emblaApi.canScrollPrev()) {
      event.preventDefault();
      emblaApi.scrollPrev();
    }
  };

  const rowPosition = isSocialWall
    ? 'w-full'
    : rowIndex === 0 ? '-ml-14 md:-ml-20'
      : rowIndex === 1 ? '-ml-36 md:-ml-28' : '-ml-24 md:-ml-16';
  const rowGap = isSocialWall ? 'gap-2.5 px-4 sm:gap-3 sm:px-6' : 'gap-3 md:gap-5';
  const rowTone = rowIndex === 1 ? 'pt-1.5' : rowIndex === 2 ? 'pt-0.5' : '';
  const visibleSnapCount = isSocialWall ? nativeSnapCount : Math.max(snapCount, 1);
  const visibleCurrentSnap = isSocialWall ? nativeCurrentSnap : currentSnap;

  return (
    <div data-ribbon-row={rowIndex + 1} aria-hidden={ariaHidden || undefined} className={rowPosition}>
      <div
        ref={isSocialWall ? nativeViewportRef : emblaRef}
        role={isCarousel ? 'region' : undefined}
        aria-roledescription={isCarousel ? 'carousel' : undefined}
        aria-label={isCarousel ? `Social wall row ${rowIndex + 1}` : undefined}
        tabIndex={isCarousel ? 0 : undefined}
        onKeyDown={isCarousel ? handleKeyDown : undefined}
        style={isSocialWall ? { scrollbarWidth: 'none' } : undefined}
        className={isSocialWall ? 'jp-social-wall-viewport w-full touch-auto snap-x snap-mandatory overflow-x-auto overscroll-x-contain outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#a63f63]' : isCarousel ? 'w-full touch-pan-y overflow-hidden outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#a63f63]' : 'w-max overflow-visible'}
      >
        <div data-ribbon-track className={`flex w-max items-end ${rowGap} ${rowTone}`}>
          {rowItems.map((item, itemIndex) => (
            <figure
              key={`${rowIndex}-${item.id}-${itemIndex}`}
              data-ribbon-card
              className={`relative flex-none overflow-hidden ${isSocialWall
                ? 'snap-start aspect-[1.08/1] w-[42vw] min-w-[8.25rem] max-w-[10.5rem] rounded-[0.4rem] bg-[#e8e0da] sm:w-[25vw] sm:max-w-[13rem] lg:w-[clamp(10rem,15vw,15rem)] lg:max-w-none'
                : `rounded-2xl bg-[#FFF1F5] shadow-lg ${aspectClasses[item.aspect ?? (itemIndex % 3 === 0 ? 'portrait' : itemIndex % 3 === 1 ? 'landscape' : 'square')]}`}`}
            >
              {onItemClick ? (
                <button type="button" onClick={() => onItemClick(item)} aria-label={`Open ${item.alt} in the portfolio viewer`} className="group absolute inset-0 flex h-full w-full cursor-zoom-in flex-col text-left focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white">
                  <img data-ribbon-photo src={item.src} alt="" loading="lazy" decoding="async" width="580" height="720" className="h-full w-full object-cover" />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-100 transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:opacity-100" />
                  <span className="pointer-events-none absolute bottom-2 left-2 inline-flex min-h-9 items-center gap-1.5 bg-white/90 px-2.5 text-[10px] font-semibold tracking-wide text-[#26211d] shadow-sm transition-[opacity,transform] duration-300 [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:bottom-3 sm:left-3 sm:min-h-10 sm:px-3 sm:text-[11px]">
                    View moment <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </button>
              ) : item.editableSlotKey ? (
                <EditableImage slotKey={item.editableSlotKey} src={item.src} alt={item.alt} loading="lazy" decoding="async" width="920" height="720" className="h-full w-full object-cover" />
              ) : (
                <img data-ribbon-photo src={item.src} alt={item.alt} loading="lazy" decoding="async" width="920" height="720" className="h-full w-full object-cover" />
              )}
            </figure>
          ))}
        </div>
      </div>

      {isSocialWall && rowItems.length > 1 && (
        <div className="mt-1 flex items-center gap-1 px-4 sm:px-6">
          <button type="button" onClick={() => moveNativeRow(-1)} disabled={!nativeCanScrollPrev} aria-label={`Previous images in social wall row ${rowIndex + 1}`} className="grid h-11 w-11 shrink-0 place-items-center text-[#67565d] transition-colors hover:bg-black/5 disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="mx-1 h-px flex-1 bg-[#ded4cf]" aria-hidden="true"><span className="block h-px bg-[#a63f63] transition-[width]" style={{ width: `${Math.min(((visibleCurrentSnap + 1) / visibleSnapCount) * 100, 100)}%` }} /></div>
          <span className="min-w-10 text-right font-mono text-[9px] text-[#76676d]">{String(visibleCurrentSnap + 1).padStart(2, '0')} / {String(visibleSnapCount).padStart(2, '0')}</span>
          <button type="button" onClick={() => moveNativeRow(1)} disabled={!nativeCanScrollNext} aria-label={`Next images in social wall row ${rowIndex + 1}`} className="grid h-11 w-11 shrink-0 place-items-center text-[#67565d] transition-colors hover:bg-black/5 disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a63f63]">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ImmersiveImageRibbon({
  items,
  eyebrow,
  title,
  description,
  ctaLabel = 'View Portfolio',
  ctaTo = '/portfolio',
  ariaLabel,
  variant = 'home',
  editableSlotKey,
  onItemClick,
}: ImmersiveImageRibbonProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || variant !== 'social-wall' || items.length === 0) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const rows = Array.from(sectionRef.current?.querySelectorAll<HTMLElement>('[data-ribbon-row]') ?? []);
      rows.forEach((row, index) => {
        const photos = row.querySelectorAll<HTMLElement>('[data-ribbon-photo], .jp-ribbon-photo');
        if (!photos.length) return;
        const travel = index === 1 ? 1.5 : index === 2 ? -1.5 : 1;
        gsap.fromTo(photos, { yPercent: -travel, scale: 1.035 }, {
          yPercent: travel,
          scale: 1.035,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        });
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => media.revert();
  }, { scope: sectionRef, dependencies: [items, variant] });

  if (items.length === 0) return null;
  const safeItems = items.filter((item, index, collection) => item.src && collection.findIndex((candidate) => candidate.src === item.src) === index);
  if (safeItems.length === 0) return null;

  const isSocialWall = variant === 'social-wall';
  const rows = isSocialWall
    ? Array.from({ length: 3 }, (_, rowIndex) => safeItems
        .filter((item) => item.row === rowIndex + 1)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.id).localeCompare(String(b.id)))
        .map((item) => ({ ...item, editableSlotKey: editableSlotKey?.(item) })))
    : variant === 'home'
      ? Array.from({ length: 3 }, (_, rowIndex) => {
          const offset = rowIndex * Math.ceil(safeItems.length / 3);
          return [...safeItems.slice(offset), ...safeItems.slice(0, offset)].map((item) => ({ ...item, editableSlotKey: editableSlotKey?.(item) }));
        })
      : (() => {
          const repeatedItems = [...safeItems, ...safeItems].slice(0, 20);
          return [
            repeatedItems.map((item) => ({ ...item, editableSlotKey: editableSlotKey?.(item) })),
            [...repeatedItems].reverse().map((item) => ({ ...item, editableSlotKey: editableSlotKey?.(item) })),
            repeatedItems.map((item) => ({ ...item, editableSlotKey: editableSlotKey?.(item) })),
          ];
        })();

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-label={ariaLabel}
      className={`relative isolate overflow-hidden ${isSocialWall ? 'bg-[#fffdfa] py-7 sm:py-10 lg:py-14' : 'bg-[#fffdfa] py-10 sm:py-14 lg:py-20'}`}
    >
      <div className={`mx-auto max-w-7xl px-5 text-center sm:px-8 ${isSocialWall ? 'mb-4 sm:mb-6' : 'mb-7 sm:mb-10'}`}>
        {isSocialWall ? (
          <div className="mb-3 flex items-center justify-center gap-3 text-[#d58aa4] sm:mb-4" aria-hidden="true">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#e8b7c7] sm:w-14" />
            <Sparkles className="h-4 w-4 stroke-[1.6] sm:h-5 sm:w-5" />
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#e8b7c7] sm:w-14" />
          </div>
        ) : <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a63f63] sm:mb-3 sm:text-xs">{eyebrow}</p>}
        {isSocialWall ? (
          <>
            <h2 className="font-serif text-[clamp(2rem,9vw,4rem)] font-normal leading-none tracking-[-0.035em] text-[#bd4d70]">{eyebrow}</h2>
            <p className="mt-1.5 font-serif text-[clamp(1.3rem,6vw,2.1rem)] leading-tight text-[#385c79]">{title}</p>
          </>
        ) : <h2 className="font-serif text-[clamp(1.8rem,8vw,3.5rem)] leading-[1.04] tracking-[-0.03em] text-[#30242a]">{title}</h2>}
        {description && <p className={`mx-auto max-w-xl text-sm leading-6 text-[#6d625f] sm:mt-3 sm:text-base sm:leading-7 ${isSocialWall ? 'mt-2' : 'mt-3'}`}>{description}</p>}
        {isSocialWall && <p className="mx-auto mt-2 inline-flex items-center gap-2 text-[10px] font-medium tracking-wide text-[#7a6659] sm:mt-3 sm:text-[11px] lg:hidden"><span aria-hidden="true">←</span>Swipe any row to explore<span aria-hidden="true">→</span></p>}
      </div>

      <div className={isSocialWall ? 'space-y-1 sm:space-y-2' : 'space-y-3 sm:space-y-5'}>
        {rows.map((rowItems, rowIndex) => rowItems.length > 0 && (
          <RibbonRow
            key={`ribbon-row-${rowIndex}`}
            rowItems={rowItems}
            rowIndex={rowIndex}
            isSocialWall={isSocialWall}
            ariaHidden={variant === 'portfolio' && rowIndex > 0}
            onItemClick={onItemClick}
          />
        ))}
      </div>

      {ctaTo && (
        <div className={`text-center ${isSocialWall ? 'mt-4 sm:mt-7' : 'mt-7 sm:mt-10'}`}>
          <Link to={ctaTo} className="inline-flex min-h-11 items-center gap-2 border-b border-[#c58b9d] px-1 text-sm font-semibold text-[#81314f] transition-colors hover:border-[#81314f] hover:text-[#5d273c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a63f63]">
            {ctaLabel} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
