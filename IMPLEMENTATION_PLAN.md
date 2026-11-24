# JP Events — Mobile-First Website Transformation Plan

**Status:** Planning only. No application files, components, routes, data, styles, or dependencies were changed for this task.  
**Audit date:** 24 November 2026  
**Primary objective:** Turn JP Events into a premium wedding editorial experience, designed first for touch screens, while preserving its Maharani Pink identity, real content, CMS editing, and enquiry flows.

---

## Part 1: Executive Summary

The current site has the right raw material: real wedding photography and videos, venue and portfolio content in Supabase, an image-slot editor, Embla carousels, GSAP/ScrollTrigger, Framer Motion, and a clear Maharani Pink palette. The problem is that these pieces have accumulated as long sections with repeated headings, large fixed spacing, duplicated proof, mixed component styles, and older FAQ/card patterns.

The recommended direction is a **Maharani Pink editorial journal**: warm ivory and ink as the canvas, deep berry and Maharani Pink as selective accents, refined serif display type paired with a clean sans-serif, and photography that carries most of the visual weight. Make each page feel composed for a phone, not squeezed down from a desktop grid.

The plan’s main decisions are:

1. **Remove the six-question homepage FAQ as a component, not with CSS.** Remove its matching FAQPage JSON-LD as well. The homepage already has a final enquiry CTA; turn that existing ending into a concise, image-led closing moment instead of adding another content section.
2. **Shorten the homepage story.** Consolidate repeated story, promise, service, event-experience, trust, review, and CTA sections into a smaller sequence with a clear purpose for each.
3. **Treat mobile work galleries as touch-first carousels.** Keep Embla, which is already installed; use natural horizontal swipe, a visible next-slide peek, compact controls, and no autoplay for editorial galleries.
4. **Assign one job to each motion tool.** Use GSAP/ScrollTrigger for a few image and story scroll sequences, Framer Motion for discrete interface transitions and modest reveals, and CSS for simple hover/focus states. Do not add Lenis, Swiper, or WebGL for the first redesign.
5. **Protect content and admin workflows.** Keep Supabase-backed portfolio, venue, media, social-wall row/order, image-slot, and contact behavior. Treat the legacy fallback as an intentional offline/error state.
6. **Make responsive quality measurable.** Sweep the homepage at 320, 360, 375, 390, 430, 768, 1024, and 1440 px; inspect all public routes at narrow, medium, and wide widths; test reduced motion, keyboard, and real touch gestures.

This is an implementation plan only. Phase 0 below records the audit baseline; implementation begins only after approval.

---

## Part 2: Existing Website Audit

### Stack and structure observed

- React 18, Vite 5, React Router, Tailwind 3, TypeScript, and React Helmet Async.
- Routes are composed in **src/App.tsx**. Public routes include Home, About, Services, Portfolio, Invitations, Blog, BlogPost, Contact, and Developer. Admin routes are mounted separately at /admin.
- **src/pages/Home.tsx** composes the home experience: LocalBusiness/Service schema, Hero, trust metrics, testimonials, and FAQSchema.
- **src/components/Hero.tsx** is a large home-page composition containing the full-screen hero, social wall placement, story/promise/services/experiences sections, a video carousel, reception halls, ratings, and closing CTA.
- **src/components/ImmersiveImageRibbon.tsx** is shared by Home, Portfolio, About, and Services. It has variant behavior, Embla rows, and GSAP ScrollTrigger parallax.
- About, Services, Portfolio, Contact, Blog, Invitations, Header, Footer, and AdminCms are separate component/page modules.
- **src/hooks/usePublishedContent.ts**, **src/services/cmsRepository.ts**, **src/types/cms.ts**, **src/data/legacyCmsData.ts**, **src/components/WebsiteImageEditor.tsx**, and **src/pages/AdminCms.tsx** form the public-content and admin media path. Portfolio entries carry social-wall row/order fields; venues carry category/media/order fields. These contracts are important to preserve.
- **src/App.tsx** statically imports all public pages and AdminCms. There is no route-level lazy loading visible in the route setup. This makes route-based code splitting a high-value performance task.
- **app/page.tsx** is a thin wrapper around the React app, while the active package scripts and Vite entry are index.html and src/main.tsx. Confirm deployment expectations before changing this dual-looking structure.
- package.json has build and lint scripts but no test or browser-test script. Existing motion and carousel packages are GSAP, @gsap/react, Framer Motion, Embla React, and Embla Fade. Swiper, Lenis, Motion-as-a-separate-package, React Three Fiber, and OGL are not installed.

### Rendered responsive audit

The existing homepage was inspected at all requested widths. At 320, 360, 375, 390, 430, 768, 1024, and 1440 px, document width matched viewport width; no page-level horizontal scrolling was observed. Carousel tracks intentionally extend past their viewports and are clipped or scrollable.

The current home social wall remains a three-row mobile/tablet composition up to the 1024 px breakpoint. Its measured section height was approximately 912–1,052 px from 320–430 px, and 1,444 px at 768 px. The desktop two-row variant begins at the large breakpoint. The image lanes look intentional, but three large rows make the tablet and phone scroll unusually long.

The reception-hall carousel, ratings, and trust sections also use generous vertical rhythm. Their measured heights varied with wrapping and breakpoint: roughly 587–644 px for reception halls, 357–384 px for ratings, and 517–599 px for the trust section from 320–430 px. At 768 px the trust section measured about 917 px because it remains a two-column card grid with descriptions enabled.

At 390 px, the public routes rendered without page-level horizontal overflow. Approximate full body heights observed were About 10,883 px, Services 16,554 px, Portfolio 13,221 px, Contact 4,642 px, Invitations 3,682 px, and Blog 4,762 px. The long About, Services, and Portfolio pages should be reviewed for repeated content and overly generous spacing, not just local card styling.

The 390 px rendered route inspection found an H1 on Home, About, and Contact, but none on Services, Portfolio, Invitations, or Blog. The document title remained the same homepage title when navigating between public routes; page-specific SEO components exist in the repository but are not wired into the inspected page components. Add a correct page title/description and one clear H1 per public route during implementation.

### Current public experience by area

| Area | Actual implementation | Audit observation |
|---|---|---|
| Header | **src/components/Header.tsx** | Fixed header with logo, search, desktop nav, expanding mobile nav, admin link, and global floating WhatsApp button. The mobile menu uses height/opacity animation but has no explicit menu panel relationship or focus-management contract. Search navigates to /search, which is not a route. |
| Home hero | **src/components/Hero.tsx** | Full-height image carousel with three remote images, dark overlay, headline, two CTAs, trust chips, arrows, pause control, and Embla Fade. This is the strongest first-screen asset. The phone treatment is still a rounded card inset from the viewport; the fixed WhatsApp affordance sits over the lower-right visual area. |
| Home story | **src/components/Hero.tsx** | Text-only dark “We Tell Your Story” section, a long promise/testimonial block, a large services section, a separate experience feature, a video carousel, venues, ratings, and a final CTA. Several adjacent sections repeat proof or broad wedding copy and rely on large vertical margins. |
| Social wall | **src/components/ImmersiveImageRibbon.tsx**, fed by **src/components/Hero.tsx** | Three mobile swipe rows with row/order from CMS and parallax; desktop uses two rows. Row tracks extend beyond the page by design. This content is editorially useful but too tall at tablet sizes. |
| Featured work / videos | **src/components/Hero.tsx** | Embla video carousel renders poster images first and creates playable video on interaction. It already supports touch and dot navigation; unify visual and control behavior with the other carousels. |
| Reception halls | **src/components/Hero.tsx**, **src/hooks/usePublishedContent.ts** | CMS-driven cover images, capacity, description, price, WhatsApp inquiry, loading/error/empty states, Embla navigation, and GSAP mobile image parallax. Keep these data states and the admin-editable source. |
| Proof and reviews | **src/components/SuperTrustRocket.tsx**, **src/components/SchemaTestimonials.tsx**, **src/components/Testimonials.tsx** | Six trust cards and a separate testimonial carousel are used on Home. A second Testimonials component exists but is not the Home component. Some claims should be fact-checked and normalized before prominence: for example, years of experience differ between source areas and older award/year text is still present. Do not invent or restate unverified review counts. |
| Home FAQ | **src/components/FAQSchema.tsx** | This is exactly the six questions in the brief. The component renders a visible six-item accordion and FAQPage JSON-LD from the same array. It is imported only by Home. Remove the rendered section and its FAQPage data together; do not leave an invisible accordion or structured data for content no longer shown. |
| About | **src/pages/About.tsx**, **src/components/About.tsx** | A long narrative with multiple story sections, image panels, milestones, motion reveals, and image ribbon. Preserve real history and photographs while editing repeated story beats into a tighter editorial timeline. |
| Services and process | **src/pages/Services.tsx**, **src/components/Services.tsx**, **src/components/Process.tsx** | Service cards, ribbon imagery, reception-hall carousel and details, video, and a separate five-step process. Large spacing values and negative top margin appear in the sections; inspect overlap and reading order before redesigning. Keep the service/venue enquiry behavior. |
| Portfolio | **src/pages/Portfolio.tsx**, **src/components/Portfolio.tsx** | CMS/legacy data merge, filters, search, grid/masonry toggle, video and image cards, parallax, lightbox, image ribbon, WhatsApp actions. Preserve CMS state, filtering, and lightbox actions; simplify the mobile entry point and avoid several competing gallery treatments on one page. |
| Contact | **src/pages/Contact.tsx**, **src/components/Contact.tsx** | Contact hero, detailed inquiry form, EmailJS send plus WhatsApp handoff, social links, separate five-question FAQ, and fixed mobile Call/WhatsApp actions. The global Header also owns a fixed WhatsApp control, so consolidate fixed mobile actions and protect form fields from being covered. The five contact questions are distinct from the six Home questions; review separately rather than deleting them as part of the Home change. |
| Blog and invitations | **src/components/Blog.tsx**, **src/pages/BlogPost.tsx**, **src/components/InvitationMaker.tsx** | Independent routes, not Home sections. Keep them out of the home narrative. Route-split them; validate form/actions and route metadata when their pages are refined. |
| Footer | **src/components/Footer.tsx** | Multi-column links, social links, contact details, newsletter form, legal links. Several links point to paths absent from App routes, including Gallery, Testimonials, FAQs, Pricing, Privacy, Terms, and Sitemap. Remove obsolete FAQ navigation as part of the Home FAQ change and either wire or remove other dead links. |
| Global design and metadata | **tailwind.config.js**, **src/index.css**, **index.html**, **src/components/SEO/** | Blush, champagne, and rosegold palettes contain duplicate values; components also use many direct hex colors. Playfair Display, Inter, and Cormorant Garamond are preloaded; Header injects an additional Archivo font import. index.html includes static image/video preloads and a global title. Consolidate tokens/font ownership and make preloads route/LCP-aware. |
| CMS and media | **src/pages/AdminCms.tsx**, **src/services/mediaUploads.ts**, **src/services/siteImageSlots.ts**, **src/services/cmsRepository.ts**, **src/types/cms.ts** | Admin can edit portfolio/venue drafts, media, alt text, order, and social-wall rows. Keep media visibility/status and published/legacy fallback behavior; no visual redesign should silently change CMS schema or bucket policy. |

The homepage currently renders 13 major section headings from the hero through the FAQ. The Blog is not currently a Home section; it remains a separate route.

---

## Part 3: Current UI Problems to Address

1. **Too much total scroll on phones.** The home page has many sections with broad top/bottom padding. The social wall alone is close to a full phone screen per row, and the three-row layout stays active through tablet widths.
2. **Repeated messages compete.** Story, promise, services, experience, carousel, halls, rating cards, trust cards, testimonials, and FAQ each repeat “luxury”, “award-winning”, or general reassurance. Keep proof once and let real photographs carry the rest.
3. **Generic templates remain mixed with newer editorial work.** Large gradients, decorative blurred circles, round card stacks, oversized section gaps, and inconsistent component styles sit beside the newer social wall and venue carousel.
4. **The mobile hero can make the portfolio feel inset.** The current framed image card and floating CTA consume the first screen’s safe area. Keep the strong wedding image and controls, but prioritize full-bleed crop, concise copy, and a clear one-primary-action hierarchy.
5. **Mobile navigation needs a complete interaction contract.** Add focus return, Escape behavior, proper panel semantics, page-scroll behavior, and safe-area layout. Decide whether WhatsApp is a global bottom CTA or a page-specific action; avoid both.
6. **The requested FAQ pattern is still live on Home.** Its six questions and FAQPage schema are coupled in FAQSchema.tsx. The replacement should be the already-existing closing CTA transformed into an intentional photographic ending, not another block of copy or a hidden FAQ.
7. **A second Contact FAQ risks reintroducing the same pattern.** Contact has five separate questions and currently lacks expanded-state semantics. Retain only details that answer real contact concerns; prefer concise process guidance or a direct support link over another generic accordion.
8. **Motion is spread across two JS libraries plus CSS.** Motion and GSAP are both appropriate but need ownership rules so a scroll transform and a Motion reveal do not animate the same element. Keep native mobile scrolling.
9. **Asset loading and image semantics need a consistent standard.** Public images come from multiple external hosts plus CMS storage. Use dimensions/aspect ratios, responsive delivery, correct alt text, lazy loading below the first screen, and one correct high-priority hero preload.
10. **Routes and metadata are inconsistent.** Search and several Footer paths are unhandled, the route title stays generic, and some pages render without an H1.
11. **Proof claims need content verification.** Review counts, years, award names/dates, and claims in cards/schema should be reconciled against approved business facts before redesign emphasis.
12. **The current build is a performance risk to measure.** The previous production build reported a JavaScript asset around 1 MB before gzip and about 298 KB gzipped, as well as the Vite chunk warning. Treat that as a baseline to remeasure after route splitting and image work.

---

## Part 4: GitHub Research and Recommended Reuse

Research focused on source patterns and implementation trade-offs, not copying a template. Prefer existing dependencies and adapt only the small pattern needed.

| Repository / example | Pattern inspected | Fit for JP Events | Mobile and performance | Complexity and recommendation |
|---|---|---|---|---|
| [GSAP](https://github.com/greensock/GSAP), [GSAP React examples](https://github.com/greensock/gsap-skills/tree/main/examples/react), [ScrollTrigger guidance](https://github.com/greensock/gsap-skills/blob/main/.github/instructions/scrolltrigger.instructions.md) | Scoped React useGSAP contexts, ScrollTrigger scrub timelines, image transforms, timeline cleanup. | Strong fit for the one or two signature photo/story moments where scroll position should drive a visual change. | Use transform/opacity, animate children rather than a pinned container, refresh after image/font layout, and disable or simplify on small screens and reduced motion. Do not pin long sections on phones. | Medium. Already installed. Use as the scroll-story engine only; keep selectors scoped to refs and clean up triggers on route change. |
| [Embla Carousel](https://github.com/davidjerleke/embla-carousel), [React package source](https://github.com/davidjerleke/embla-carousel/tree/v8.6.0/packages/embla-carousel-react), [React setup guide](https://github.com/davidjerleke/embla-carousel/blob/master/website/src/content/v9/pages/get-started/react.mdx) | Overflow viewport + flex track, useEmblaCarousel API, controls outside draggable viewport, plugin pattern. | Best match for the venue, work, and social galleries. It is already used by the current app and supports the lightweight custom styling this brand needs. | Touch-first drag/snap, next-slide peek, labeled controls, no forced scroll hijack. Keep slide counts modest and lazy-load offscreen media. | Low/medium. Retain installed Embla 8; use the current project API rather than upgrading only to match newer docs. |
| [Motion / Framer Motion source](https://github.com/motiondivision/motion), [scroll hooks](https://github.com/motiondivision/motion/tree/main/packages/framer-motion/src/value/scroll) | useScroll/useTransform, reduced-motion hook, layout/presence transitions, discrete gestures. | Good for menu/dialog state, modest in-view reveals, and image transforms that are independent of GSAP ScrollTrigger. | Motion values avoid React state on every frame; keep reveal duration short and make it static for reduced motion. | Low/medium. Keep the existing framer-motion package; do not add the separate motion package or duplicate scroll timelines. |
| [Lenis React integration](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md) | ReactLenis root provider and explicit GSAP ticker integration. | Smooth scrolling is not essential to the experience; the photos and carousel should provide the motion. | A global scroll wrapper changes native touch expectations and introduces an additional synchronization/lifecycle boundary with ScrollTrigger. | Medium. Do not install for the first pass. Revisit only if a measured prototype demonstrates a user benefit on iOS and Android. |
| [Swiper](https://github.com/nolimits4web/Swiper), [Swiper demos](https://github.com/nolimits4web/Swiper/tree/master/demos) | Touch slider, breakpoints, virtual slides, pagination, effects, a11y and loop options. | Capable, especially for very large galleries or a required built-in effect. It duplicates the installed Embla feature set for current content. | Mature touch support and virtual slides can help very large collections, but 3D effects and autoplay should not be the default. | Medium. Do not add or migrate now. Use only if a future requirement proves Embla insufficient. |
| [Magic UI](https://github.com/magicuidesign/magicui), [Marquee registry example](https://github.com/magicuidesign/magicui/blob/main/registry/magicui/marquee.tsx), [Scroll Progress docs](https://magicui.design/docs/components/scroll-progress) | Copyable Marquee and Scroll Progress components; CSS keyframes and Motion-backed effects. | Useful reference for small progress indicators or a branded text ticker. | Continuous marquee movement is distracting for important photos and must stop for reduced motion. Prefer native scroll for carousels. | Low if copied selectively. No new dependency; use a small CSS implementation only if the content has a clear purpose. |
| [React Bits](https://github.com/DavidHDev/react-bits), [Animated Content demo](https://github.com/DavidHDev/react-bits/blob/main/src/demo/Animations/AnimatedContentDemo.jsx), [license](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) | Source-owned React/Tailwind animated examples and demos. | A useful source of isolated reveal and image-interaction ideas, not a full-site design system. | Inspect the JavaScript and CSS cost of each effect; keep hover-only interactions desktop-specific and provide reduced-motion fallbacks. | Low/medium as a visual reference. Review the repository’s MIT + Commons Clause terms before copying; do not add the component catalog as a runtime package. |
| [Aceternity Parallax Scroll](https://ui.aceternity.com/components/parallax-scroll), [Sticky Scroll Reveal](https://ui.aceternity.com/components/sticky-scroll-reveal) | Opposing-direction image columns and sticky visual/text storytelling. | Good references for a carefully edited portfolio reveal, but can produce an overly long, template-like page if copied wholesale. | On phones, turn sticky/column effects into normal flow or a swipe gallery; do not require sticky positioning for content comprehension. | Medium/high. Visual reference only; implement selectively with existing GSAP/Embla. The brief’s GitHub path github.com/aceternity/aceternity-ui returned 404 during this audit, so verify source and license before any reuse. |
| [React Three Fiber performance guide](https://github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/scaling-performance.mdx) | Demand-based frame loop and device-quality reduction for WebGL scenes. | Not needed for wedding photo storytelling; WebGL would not improve the core job of browsing real work and contacting the planner. | Canvas rendering, DPR, textures, and GPU use are risks for mid-range phones. The guide itself advises demand rendering when scenes can rest. | High. Do not add. If a future campaign truly needs 3D, isolate it, lazy-load it, use demand rendering and a static image fallback. |
| [OGL](https://github.com/oframe/ogl/blob/master/README.md) | Low-level WebGL geometry/shader primitives and examples. | Possible for a bespoke image displacement effect, but the site has no need for a custom shader engine. | Small source size does not eliminate texture/GPU cost or custom lifecycle work on phones. | High. Do not add. Use CSS transforms for parallax; only prototype a shader after the core redesign meets performance targets. |

**Research conclusion:** retain Embla + GSAP/@gsap/react + Framer Motion. Native CSS handles simple details. No Lenis, Swiper, R3F, or OGL for the first redesign. Do not install a component library to get a single flourish.

---

## Part 5: Proposed Visual Design System

### Brand and palette

- Keep Maharani Pink, but use it as a deliberate accent: active navigation, one CTA, small rules, selected pagination, and fine details.
- Use warm porcelain/ivory as the main light canvas; deep ink/plum for type and dark photographic transitions; champagne/gold only for subtle dividers or small highlights.
- Avoid repeated pink gradient backgrounds, decorative blurred orbs, and identical rounded cards.
- Consolidate the duplicate blush/champagne/rosegold mappings in tailwind.config.js into one named token set, then map any legacy names temporarily during migration.

### Type

- Use one editorial serif for display and one sans-serif for reading and controls. The project already preloads Playfair Display, Cormorant Garamond, and Inter; choose one display face and Inter for body, then remove Header’s extra injected Archivo import.
- Use fluid sizes with clamp and keep mobile H1s to a deliberate two or three lines. Avoid desktop-sized 5xl/8xl headings on 320–390 px screens.
- Use short eyebrows, clear sentence case, and sentence-length descriptions. Reserve all caps for small, tracked labels.

### Spacing and shape

- Establish tokens for page gutters, section spacing, content widths, and carousel gaps. Phone sections should begin around 40–56 px of vertical padding, with 16–24 px between heading and media; use measured content rather than large generic mb-16/mb-28 gaps.
- Use mostly square or gently rounded image crops; reserve larger radii for one hero frame or modal. Do not put every section inside a card.
- Use asymmetric grids at tablet and desktop; on phones, keep a single visual focal point and a clear next action.

### Photography and content

- Let authentic wedding work lead. Use real CMS portfolio/venue images and verified story/testimonial content only.
- Standardize aspect ratios, focal points, object-position, alt text, width/height, and responsive sizes. Provide an intentional placeholder while CMS images load or fail.
- Do not create new reviews, venues, couples, awards, counts, or guarantees to fill a visual layout. Validate every proof claim against approved content before publication.

---

## Part 6: Proposed Website Experience

### Home sequence

1. **Compact mobile header.** Logo, menu, and one primary enquiry action. Full-screen or large overlay menu with clear focus and Escape behavior. No duplicated floating WhatsApp and bottom CTA.
2. **Cinematic hero.** One editorial wedding image as the first LCP asset; short positioning line; primary “Get in touch” action and secondary “View our work”. Swipe or tap between a small set of images, pauseable if rotating, with visible progress and reduced-motion behavior.
3. **Brand point of view.** A short copy-and-image composition explaining the JP approach using existing approved brand text. Avoid a generic abstract intro or another trust-card section.
4. **Featured wedding story.** One high-impact real project with a concise caption and optional video-on-demand. On phones it becomes a snap carousel with a partial next-card preview; on desktop it becomes an asymmetric editorial spread.
5. **Social wall.** Keep the CMS-admin-managed three rows, but reduce the number of visible rows per phone moment or compact card heights; row gestures remain independently swipeable. At tablet use a denser composition instead of keeping three large phone lanes.
6. **Services and venues.** Present a few real service categories as visual entry points, then show the reception-hall carousel with capacity and a direct inquiry action. Do not repeat the process narrative in multiple sections.
7. **One proof moment.** Choose a verified testimonial or a compact proof strip, not both a six-card metric wall and a second review wall. Keep real author/source attribution.
8. **Closing contact moment.** Rework the current final CTA as a quiet full-bleed image transition with one sentence and one contact action. This is the purposeful replacement for the Home FAQ section; do not add more FAQ copy.

### Other routes

- **About:** Short editorial timeline with real milestones and a small number of strong images; remove repeated biography paragraphs while preserving approved company history.
- **Services:** A concise service index followed by the same visual case-study/gallery language. Present the five-step process as a compact horizontal timeline on desktop and clear vertical steps on phone.
- **Portfolio:** One H1, filters that become a horizontal scroll/sheet on phone, and an image-forward CMS grid. Keep masonry/grid controls only if both views are useful on a phone; preserve search, categories, lightbox, videos, and WhatsApp contact.
- **Contact:** Put the form first, make its labels and input spacing mobile-friendly, keep success/error feedback, and expose Call/WhatsApp without covering the form. Reduce the separate FAQ to accurate contact guidance or a direct help path after business review.
- **Blog and Invitations:** Keep as independent routes and load them on demand. Do not add them back to Home unless the business explicitly wants them as primary conversion content.
- **Footer:** Reduce repeated link groups and newsletter height on mobile; keep correct phone/email/location and only valid routes.

---

## Part 7: Mobile-First Implementation Specification

| Section | 320–430 px mobile | 768–1023 px tablet | 1024–1440 px desktop |
|---|---|---|---|
| Header/menu | 56–64 px high; logo and menu remain unobstructed; menu opens as a clear panel with 44 px minimum targets, Escape close, focus return, and safe-area padding. Keep one fixed contact affordance at most. | Logo, menu, and CTA share one row; avoid switching to full desktop nav before it fits. | Full nav with clear active state and one CTA; reduced blur/transparency for contrast. |
| Hero | Near edge-to-edge portrait crop; content over a dark legible zone; concise H1; one primary CTA visible without covering the image controls. Swipe image or tap arrows; no required hover. | Wider crop and two CTAs in a row when they fit; preserve image subject and readable overlay. | Full-bleed landscape composition; restrained image-scale entrance and simple progress; avoid oversized content competing with the photograph. |
| Brand intro/story | One statement and one image with close vertical rhythm. Do not pin. Use a short opacity/translate reveal only if reduced motion is off. | Image/text split with moderate whitespace. | Asymmetric editorial split; optional scroll-linked image movement. |
| Featured work / social wall | Embla snap carousel, 75–85% slide width with peek, native horizontal touch, visible compact dots/counter, keyboard support when focused, no auto-advance for galleries. Images use stable aspect ratios and focal positions. | Two-column or dense carousel layout; avoid three oversized 18rem rows. Keep row-level controls independent. | Editorial feature card plus two-row social wall; scroll parallax only while the wall is visible. |
| Services/process | Compact selectable list or 1-column image/text strips; avoid six cards and long centered text. No scroll pinning. | Two-column offerings; process in 2–3 compact columns or a short timeline. | Three-column service grouping and a horizontal process line. |
| Reception halls | One prominent image slide, next-slide peek, labeled prev/next controls, dots, capacity/details over an image gradient, and a full-width WhatsApp CTA outside the drag surface. | Image and concise venue details in a split layout if the text remains readable; no control overlap. | Large editorial carousel with text block and booking action beside or below the image. |
| Trust/testimonial | One verified quote or three concise proof facts; no repeated grid of large cards. Carousel only if there are enough real entries. | Two-up proof/testimonial composition. | One featured quote beside supporting proof or a compact strip. |
| Closing CTA/footer | One primary CTA; footer columns collapse into clearly separated groups; avoid fixed buttons over the footer form. | Two-column footer with comfortable reading width. | Full footer grid with only routes that resolve. |
| About | Vertical image/story sequence, short approved captions, no giant timeline cards. | Editorial two-column milestones. | Alternating image/text timeline with restrained image parallax. |
| Services page | Clear service list and short vertical process. Put venue inquiry near venue content. | Two-column service blocks; no negative-margin overlap. | Asymmetric service grid and horizontal process. |
| Portfolio page | Filters horizontally scroll or open in an accessible sheet; cards are 1-column editorial tiles or a deliberate two-column grid if images remain legible; tap opens a keyboard-accessible lightbox. | 2–3 columns; filter row remains visible. | Masonry/grid toggle may remain if both have parity and the content is labeled. |
| Contact page | Form-first, single column, 16 px inputs to avoid iOS zoom, persistent actions only if they do not cover fields, explicit success/error state. | Form/details split. | Form with contact details and location/media in a balanced split. |
| Blog/invitations | Simple readable reading column; forms/tool controls stack and remain tappable. | Two-column where content benefits. | Wider image/text editorial layouts. |

### Breakpoint plan

- 320–359 px: preserve a single clear image/text focal point; remove nonessential labels before shrinking text.
- 360–429 px: primary phone layout; use fluid type and deliberate partial carousel peeks.
- 430–767 px: large-phone layout; increase image width/space without adding columns prematurely.
- 768–1023 px: tablet-specific composition; do not treat this as a wide phone or early desktop.
- 1024–1279 px: desktop navigation only when measured text fits; maintain touch-compatible carousels for hybrid devices.
- 1280–1440 px and wider: cap content width and allow asymmetry, not unlimited line lengths.

---

## Part 8: Prioritized UI/UX Effects

| Priority / effect | Visual and user benefit | Reference | Implementation plan | Mobile and performance |
|---|---|---|---|---|
| P0 — Touch-first editorial carousel | Large image cards with a visible next item make swipe affordance obvious and turn browsing into the primary interaction. | Embla React wrapper and examples. | Retain Embla; create consistent viewport/track/slide/control patterns and reuse for work and venues. Do not nest clickable controls inside the draggable viewport. | Native touch, snap, no scroll hijack, no mandatory autoplay. Moderate cost; lazy-load slides beyond the first. |
| P0 — Image parallax | Foreground wedding images drift a little relative to scroll, adding depth without changing the reading order. | GSAP ScrollTrigger source guidance. | GSAP ScrollTrigger scrubs small y/scale transforms on the image child; scope with useGSAP refs; refresh after image/layout changes. | Lower travel on phones; disable for reduced motion and low-power conditions. Keep the image oversized enough to prevent blank edges. |
| P1 — Editorial scroll reveal | Text and image captions appear as the reader reaches them, improving rhythm without delaying content. | Motion useInView/useScroll source; GSAP examples for scoped reveal. | Use one reveal system per element: Framer Motion for simple in-view opacity/translate, GSAP only when sequence is tied to a story timeline. Content must remain visible if JS fails. | No blur on every item, no transform on layout wrappers, no hidden semantic text. Reduced motion renders immediately. Low/medium cost. |
| P1 — Sticky story chapter on wide screens | One image stays in view as a few narrative steps change, giving a cinematic portfolio case study. | GSAP ScrollTrigger; Aceternity Sticky Scroll Reveal as visual reference. | Prototype one case study with a pinned outer section and animated inner images; keep pin spacing, animate children, and ensure text stays readable. | Replace with normal stacked content or a short carousel below 768 px. Medium/high complexity; only one chapter on a page. |
| P1 — Mobile social wall lanes | Independent rows can be swiped and move at different rates while the overall section remains readable. | Existing Embla/GSAP implementation; Embla docs. | Keep the admin row/order fields. Reduce card height/row count at phone and tablet breakpoints; keep parallax subtle and keep each Embla viewport separate. | Must not autoplay; provide visible “Swipe” hint only when useful; no page-level horizontal overflow. Medium cost; images are lazy-loaded. |
| P2 — Masked image reveal | A cropped image can open like a print or frame, adding a single editorial entrance. | GSAP timeline examples; React Bits animation examples as reference. | Use CSS clip-path or a simple GSAP reveal on a non-LCP image after layout is stable. Do not mask every card. | Avoid hiding the first hero image until animation; reduced motion shows the final frame. Low/medium cost if used once. |
| P2 — Staggered type or caption reveal | Small line/word movement gives a chapter title a more composed entrance. | Motion source and React Bits Animated Content demo. | Prefer block-level line/caption stagger; avoid per-character animation and content splitting when not needed. | One short stagger, no offscreen long-running animation; simple opacity in reduced motion. Low cost. |
| P2 — Scroll progress / section index | A discreet line or counter can orient a long editorial portfolio. | Magic UI Scroll Progress source/docs. | Use a small CSS/native progress indicator or Motion value, only on a long gallery page. | Keep contrast and accessible text; do not distract from wedding photography. Low cost. |
| P3 — 3D image displacement/WebGL | Shaders can distort image edges or add depth, but do not improve the core browsing task enough to justify it now. | OGL examples; React Three Fiber performance guide. | Do not include in the redesign baseline. If a special campaign later requires it, prototype one isolated, lazy-loaded visual with a static fallback and measured device capability. | High GPU, texture, battery, implementation and accessibility cost. No impact on basic content if unavailable. |

**Motion boundary:** avoid scroll-jacking, continuous image marquees, magnetic touch controls, cursor-only affordances, autoplaying social rows, and a large number of pinned scenes. Keep browser scrolling native.

---

## Part 9: Technical Architecture

### Libraries and ownership

- **Embla:** all touch galleries and snap carousels. Keep the existing installed version. One shared pattern for drag viewport, slide semantics, controls, dots/counter, and active index.
- **GSAP + ScrollTrigger + @gsap/react:** limited scroll-linked image/story timelines. One scoped ref per section, automatic context cleanup, only transform/opacity properties, refresh after content/layout updates.
- **Framer Motion:** navigation open/close, modal presence, and simple reveal states. Continue using the installed framer-motion package; do not add the newer package name during this redesign.
- **CSS/Tailwind:** hover, focus, color, and short transitions. No new library for small effects.
- **Native scrolling:** retain browser touch inertia and scrolling. No Lenis unless a measured prototype proves a better experience and it can be synchronized with all existing triggers.
- Do not run Motion and GSAP on the same node/property. Avoid setting React state on every scroll frame.

### Content and routing

- Keep published-content queries, fallback data, CMS error/empty/loading feedback, and admin editing intact.
- Split route modules with React.lazy/Suspense. Keep AdminCms out of the public Home initial chunk.
- Add a not-found route and resolve or remove Footer/search links that currently target missing paths.
- Wire route-specific Helmet metadata and correct H1s. Do not change factual SEO/schema values without approval.
- Remove homepage FAQ JSON-LD with the visible FAQ. Keep other structured data only when it describes visible, accurate content.

### Media pipeline

- Use responsive source variants with width/height or aspect-ratio to prevent layout shift; set sizes/srcset for full-width hero, carousel, and grid contexts.
- Preload only the actual Home LCP image and verify it is the same asset shown in the first hero slide; remove stale or unrelated global preloads.
- Load below-fold images lazily. Load videos only after an explicit user action, retaining the poster and a clear play control.
- Standardize CDN/storage transformations and document a fallback when a source URL fails. Preserve CMS media IDs and alt-text editing.

---

## Part 10: File-by-File Implementation Roadmap

| File | Planned change after approval | Dependencies / preservation notes |
|---|---|---|
| **src/pages/Home.tsx** | Recompose Home into the shorter approved section sequence; remove FAQSchema import/render. | FAQ cleanup follows section-content decision; keep LocalBusiness and Service data accurate. |
| **src/components/FAQSchema.tsx** | Remove the visible six-question section and matching FAQPage JSON-LD. Remove the file only after confirming no other imports. | Must not CSS-hide the section or leave the schema behind. |
| **src/components/Hero.tsx** | Break the monolithic home composition into small home section modules; refine hero, work carousel, venue carousel, and closing visual. | Preserve Embla state, CMS data, WhatsApp inquiry payload, pause/reduced-motion logic, loading/error/empty states. |
| **src/components/ImmersiveImageRibbon.tsx** | Define and document its supported variants; reduce phone/tablet social-wall height; retain CMS ordering and independent swipe lanes. | Preserve social-wall row and order semantics; do not change admin row behavior. |
| **src/components/SuperTrustRocket.tsx** | Replace the six-card metric wall with concise, validated proof or remove duplicate proof after content review. | Validate years, awards, satisfaction, counts, and certifications first. |
| **src/components/SchemaTestimonials.tsx** and **src/components/Testimonials.tsx** | Select one supported testimonial presentation; retire duplicate unused component only after reference search. | Use only genuine, approved testimonial copy and source attribution. |
| **src/components/Header.tsx** | Redesign mobile menu and fixed contact action; add focus/escape/scroll/accessibility behavior; remove or wire the unresolved search path. | Keep auth state and admin access logic; do not expose admin-only actions to public users. |
| **src/components/Services.tsx** and **src/components/Process.tsx** | Reduce duplicate long-form sections; fix large mobile spacing/negative margins; harmonize service and process cards. | Preserve published venue data and contact actions; validate layouts before changing section order. |
| **src/components/About.tsx** | Tighten the history into a real editorial timeline and select fewer, stronger photos. | Preserve approved company history and editable images. |
| **src/components/Portfolio.tsx** | Refine mobile filters, gallery, lightbox, and image sizing; use one primary gallery language. | Preserve categories, search, CMS/legacy state, likes/views behavior if active, video, and inquiry actions. |
| **src/components/Contact.tsx** | Improve form-first mobile hierarchy, input spacing, fixed action behavior, validation feedback, and separate Contact FAQ decision. | Preserve EmailJS + WhatsApp path, field names/template contract, success/error states. Do not merge its five questions with Home’s six. |
| **src/components/Footer.tsx** | Condense mobile link groups, reduce newsletter block height, correct dead links, remove the Home FAQ link. | Keep phone, email, address and social URLs accurate. |
| **src/components/Blog.tsx**, **src/pages/BlogPost.tsx**, **src/components/InvitationMaker.tsx** | Align typography/spacing where needed; lazy-load route code. | These remain independent routes unless product scope changes. |
| **src/App.tsx** | Lazy route modules, add 404 behavior, and keep public/admin shells separate. | Ensure direct URLs still work on deployment; preserve HelmetProvider, MotionConfig, auth, analytics and image editor context. |
| **index.html**, **tailwind.config.js**, **src/index.css** | Consolidate fonts/colors/motion tokens, review preloads, add focus/reduced-motion and safe-area conventions. | Migrate legacy token aliases gradually to avoid breaking unrelated pages. |
| **src/components/SEO/** | Wire route-appropriate title/description/social metadata and H1 contracts. | Verify correct structured data; remove only FAQ schema tied to removed Home FAQ. |
| **src/hooks/usePublishedContent.ts**, **src/services/cmsRepository.ts**, **src/types/cms.ts**, **src/components/WebsiteImageEditor.tsx**, **src/pages/AdminCms.tsx**, **src/data/legacyCmsData.ts** | Audit integration after visual refactor; preserve public/admin parity and fallback states. | No Supabase schema, storage bucket policy, or content migration is part of the visual plan. |
| **New: src/components/home/** | Add focused HomeHero, FeaturedWork, BrandStory, VenueFeature, and ClosingCTA modules as the monolith is split. | Create only modules that represent real reusable sections; avoid one component per decorative flourish. |
| **New: src/components/ui/CarouselControls.tsx** | Optional shared accessible controls if Home/Portfolio/Services need the same behavior. | Keep Embla instance ownership in the gallery component. |
| **New: browser QA configuration/specs** | Add a small route and viewport smoke suite if the team approves a browser-test dependency. | The current package has no automated test script; do not block implementation on a large testing framework setup. |

---

## Part 11: Performance and Accessibility

### Performance targets

- Mobile Lighthouse performance: 90+ where practical on a production-like build and throttled device profile.
- LCP: ideally below 2.5 seconds; the first hero image must be the actual LCP candidate and be correctly prioritized.
- CLS: below 0.1 through fixed media aspect ratios and stable font loading.
- INP: ideally below 200 ms; avoid rendering or image work during pointer movement.
- Keep scroll interactions smooth on mid-range Android; remove/disable expensive motion when frame budget is poor.
- Lazy-load route bundles, gallery images, and offscreen video. Avoid loading the entire admin surface on the Home route.

### Accessibility requirements

- Honor prefers-reduced-motion in GSAP, Motion, carousel transition duration, autoplay, and CSS.
- Keep meaningful content visible if animations do not initialize.
- One H1 per route, logical headings, main/navigation/footer landmarks, skip link, descriptive link labels, and correct image alternatives.
- Carousel: keyboard focus, next/previous buttons, slide count/current state, focus-visible styling, and no auto-advance for reading content. Pause hero autoplay on focus/hover and provide a visible pause control.
- Menu/dialog: aria-expanded/controls, Escape close, sensible focus entry/return, no keyboard trap unless modal, and background scroll behavior.
- Touch controls at least 44 by 44 CSS px; page content must not sit behind fixed actions or safe-area edges.
- Meet WCAG AA text contrast, especially pink-on-white and text over photography.
- Form: persistent labels, error text linked to controls, completion announcement, no dependence on color alone.
- Remove unsupported proof language, duplicated FAQ content, and invalid navigation targets.

### QA and test approach

- Use the exact viewport sweep: 320, 360, 375, 390, 430, 768, 1024, and 1440 px. At each width verify no document-level horizontal overflow, title wrapping, carousel clipping, touch-target size, and fixed CTA clearance.
- Inspect Home, About, Services, Portfolio, Contact, Blog, and Invitations at a narrow phone, 390 px, tablet, and desktop width.
- Test touch-swipe and keyboard operation separately; check reduced-motion mode, slow network, image failure, font delay, and Supabase loading/empty/error/fallback states.
- Validate Contact success/error behavior without sending real inquiries.
- Recheck production bundle size, Lighthouse, image payloads, LCP/CLS/INP, console errors, direct route reloads, and admin media workflow after the redesign.
- Use visual snapshots as evidence and manually compare after any structural or breakpoint change.

---

## Part 12: Implementation Phases

### Phase 0 — Existing website audit and baseline
Completed for this plan: source inventory, route/content review, installed-dependency review, GitHub research, 390 px route inspection, and homepage viewport sweep. Record the verified facts/claims and approved image focal points before code changes.

### Phase 1 — Design system and visual foundation
Agree palette, serif/sans pairing, fluid type, gutters, section spacing, image ratios, focus states, breakpoints, and motion rules. Consolidate duplicate tokens without changing all legacy pages at once.

### Phase 2 — Mobile navigation and hero
Refine mobile menu, CTA ownership, safe areas, hero image crop, first-screen copy and controls. Confirm one H1, contrast, pause behavior, reduced motion, and LCP asset.

### Phase 3 — Main sections and storytelling
Split the Home monolith and build the shorter editorial order. Consolidate proof/testimonials, refine About and Services stories, and remove Home FAQ component/schema. Keep the Contact FAQ decision separate and content-led.

### Phase 4 — Parallax, carousel, and advanced motion
Unify Embla behavior; add only approved image parallax and one wide-screen sticky story if a prototype works on target devices. Motion follows the ownership rules and never blocks content.

### Phase 5 — Responsive refinement
Sweep all eight widths, revise 768 px tablet composition, test long titles and large text, confirm carousel peeks and image focal points, and remove section gaps that do not support story pacing.

### Phase 6 — Performance, accessibility, and final QA
Lazy-load routes and media, correct preloads, check production bundle and Core Web Vitals, run reduced-motion/keyboard/contrast checks, verify forms and CMS fallback states, and confirm public/admin behavior remains intact.

**Dependency order:** design tokens precede broad component restyling; navigation/hero precede visual QA; the section map precedes FAQ removal; carousel semantics precede parallax; route splitting and media changes are validated after the page structure stabilizes.

---

## Part 13: Acceptance Criteria

The redesign is complete only when all of the following are true:

1. The six listed questions and the homepage FAQ accordion are absent from the rendered Home DOM. They are not hidden with CSS. No FAQPage JSON-LD remains for the removed questions.
2. Home ends with a clear photographic contact action without adding a duplicate, low-purpose content section.
3. Each public route has one H1, unique route title/description, and valid navigation; search and every visible footer link either resolves or is removed.
4. The 320/360/375/390/430/768/1024/1440 px checks show no document-level horizontal overflow, cropped text, unreachable controls, or important content beneath a fixed CTA.
5. At 320–430 px, navigation, galleries, form, and CTAs are intentionally touch-first; galleries swipe without fighting page scroll and show that more content exists.
6. At tablet widths, the social wall and trust/story layout are denser than the current 1,444 px wall / 917 px trust section at 768 px.
7. All carousel actions work by touch, keyboard, and visible controls; focus state/current slide are understandable; editorial carousels do not autoplay.
8. GSAP, Framer Motion and CSS have distinct responsibilities; all React-created ScrollTriggers clean up on route/component lifecycle; reduced-motion users see the final content without parallax/autoplay.
9. Only real CMS or approved legacy images, venues, testimonials, awards, ratings, and claims are shown. Media loading/error/empty states remain understandable.
10. Contact EmailJS and WhatsApp behavior is preserved, errors/success are announced, and no fixed buttons cover form controls.
11. Images reserve layout space, use responsive sizes, and do not reveal gray/blank edges during parallax. Video does not download or play before user intent unless approved as the single LCP hero.
12. Production Lighthouse mobile performance is 90+ where practical; CLS <0.1, LCP ideally <2.5 s, and INP ideally <200 ms under documented test conditions.
13. Public pages and /admin load directly after route splitting; CMS login, editing, upload preview, social-wall ordering, venue media, and legacy fallback are unchanged.

---

## Part 14: Risks and Technical Decisions

- **Photo truth and licensing:** do not introduce stock imagery to fill a layout or imply it is JP work. Confirm rights and focal crops for existing media.
- **CMS behavior:** visual changes must not break published-vs-draft filtering, media status, fallback behavior, venue categories, or social-wall row/order. Keep backend and bucket-policy work out of this redesign.
- **Claim consistency:** years, ratings, awards, number of reviews, and certifications vary across page/schema copy. Obtain one approved source of truth before making any claim more prominent.
- **Homepage monolith:** Hero.tsx contains many unrelated sections and behaviors. Refactor incrementally with visual evidence and targeted checks so the page does not lose WhatsApp payloads, pause behavior, CMS data, or carousel state.
- **ScrollTrigger and layout:** late image/font loads can move trigger positions. Reserve aspect ratios, refresh triggers after layout changes, and avoid mobile pinning.
- **Motion overlap:** GSAP and Framer Motion can compete when they write the same transform. Assign one owner per element/property and do not introduce Lenis in parallel.
- **Third-party library drift/license:** React Bits and copy-paste UI examples should be reviewed at the component level; comply with upstream license terms. Aceternity’s supplied GitHub URL was unavailable during research, so verify exact source before reuse.
- **Assets and network:** multiple image hosts, font loading, videos, and preloads can affect LCP. Test with throttled mobile networking and missing-image fallbacks before release.
- **Route/deployment behavior:** current Vite routes and app/page.tsx wrapper suggest more than one deployment path. Confirm the production host’s direct-route fallback before adding lazy routes or a not-found page.
- **Scope:** the plan prioritizes public website presentation. Admin and CMS behavior are regression constraints, not targets for visual redesign or database migrations.

---

## Part 15: Advanced Visual Direction and Mobile Interaction Brief

This section raises the visual bar and makes the motion direction concrete for implementation. It expands Parts 5, 6, 7, 8, 11, and 13; it does not replace the existing stack, CMS, content, or route decisions. The aim is a premium international wedding editorial studio: confident art direction, precise typography, exceptional real photography, and motion that helps a visitor read the story. Awwwards-level craft is a reference for finish and interaction quality, not a requirement to imitate any one site.

### Visual benchmark and guardrails

The finished site should feel like an editorial studio commissioned to document significant celebrations: cinematic, personal, image-led, composed, and easy to use with one hand. Each screen should have a clear focal point, purposeful type scale, and generous but controlled breathing room. Use changing compositions, image crops, full-bleed moments, quiet text interludes, and occasional asymmetry to create pacing. Maharani Pink remains a restrained accent within the existing JP Events identity.

Do not solve the visual brief with a generic wedding-planner theme, conventional Bootstrap layout, repeated rounded cards, interchangeable gradients, a basic image slider with text layered on it, or a standard corporate landing page. Avoid treating animation quantity as visual quality. Do not copy a reference's identity, copy, palette, imagery, or exact layout. Translate only the interaction or composition principle into JP Events' own brand and authentic portfolio material.

### External visual-reference research

These references were reviewed for recognizable interaction and layout lessons. Award information is included to identify the benchmark source; it is not content to add to JP Events.

| Reference and source | Pattern to study | Specific lesson to adapt for JP Events | Boundary |
|---|---|---|---|
| [K72, by Locomotive](https://locomotive.ca/en/work/k72) — Locomotive's case study lists Awwwards Site of the Day, Developer Award, Mobile Excellence, and Idéa awards. Visit the [K72 site](https://k72.ca) for the live project. | An unconventional creative-agency portfolio built to make projects the main event. | Study how project presentation can feel art-directed rather than like a uniform portfolio card grid, while keeping project names and the route to a project legible. Apply that principle to featured JP weddings and venue stories. | Do not reproduce K72's visual language or experimental navigation. Keep JP Events' navigation conventional enough to use without instruction. |
| [Bouguessa, by Dogstudio](https://dogstudio.co/cases/bouguessa/) — the case study identifies it as a luxury-fashion project and records Awwwards and FWA Site of the Day awards. | Clean, straight-lined, photography-led luxury presentation with an explicitly considered mobile experience. | Study how limited UI chrome, deliberate whitespace, full attention on image/craft, and clear mobile decision paths make a premium site feel intentional. Adapt the image-first restraint and tap clarity to wedding work and enquiry actions. | Do not import shopping patterns, product copy, or Bouguessa's brand identity. Keep JP's warm editorial palette and contact-first goals. |
| [Natascha Vavrina](https://nataschavavrina.com/) — [Awwwards' Site of the Day announcement](https://www.linkedin.com/posts/awwwards_sotd-photography-portfolio-activity-7065612605461004288-CNVu) describes it as an immersive photography portfolio. | Separate work categories, a sparse visual identity, a discoverable gallery, and clear play/pause controls for motion. | Study how the work becomes the navigation and how a gallery can invite exploration without surrounding every image with a card. For JP Events, keep categories and swipe affordances understandable, and let wedding moments lead. | Do not reproduce its typography, monochrome treatment, audiovisual behavior, or portfolio branding. JP's motion must work silently and without hover. |
| [Dennis Berti wedding/documentary photography](https://dennisberti.com/) — [designer case study](https://zhenyary.com/work/dennis-berti) reports Awwwards and FWA Site of the Day recognition and additional Mobile Excellence recognition. | A distinct photographer's voice, image-led opening, and clearly named bodies of work including unscripted weddings. | Study how portfolio categories provide context and how an editorial archive can feel authored. Adapt this to real JP Events projects with concise event/location labels and a direct path to enquire. | Do not copy headings, writing, or image treatment. Preserve JP Events' approved facts, CMS taxonomy, and clients' privacy. |

Use these references as a review set during design critique: for each target screen, identify the one lesson being adapted and verify that it serves JP Events' own audience. The live sites may change; review the cited case study and current mobile view before implementation rather than relying on a remembered screenshot.

### Implementation-ready interaction specifications

Every motion item below has one owner per animated element/property. Use existing React architecture and installed GSAP/ScrollTrigger, Framer Motion, Embla, and CSS; no new library is justified by these effects. All copy and photography remain in normal document flow and available if animation does not initialize.

| Effect and exact location | Behavior | Technical implementation with current stack | Mobile fallback / touch behavior |
|---|---|---|---|
| **Full-bleed cinematic hero — Home first viewport** (`Hero.tsx`, later the planned HomeHero module). | Use one edge-to-edge portrait-capable wedding photograph beneath the compact overlaid header. Keep the first viewport about `100svh` including safe-area awareness; the subject, concise H1, primary enquiry CTA, secondary work link, and carousel control must compose as one scene. The image is the actual LCP asset. If the existing three-image hero remains, make manual swipe/tap the primary interaction; any retained rotation must be pauseable, stop after user interaction, when the tab is hidden or focus enters, and when reduced motion is on. | Keep Embla Fade for slide selection and use a separate inner `<img>` child for one restrained scale settle (e.g. 1.04 to 1.00 over 700–900 ms); do not animate the Embla wrapper's transform with GSAP. Use responsive image sources, intrinsic dimensions, a CMS focal point/object-position, and a legible lower image gradient only where needed. | Portrait crop and subject focal point are set per image; avoid cropping faces with a fixed desktop `object-position`. Place CTA and controls inside the safe-area and thumb-reach zones, with 48 px touch targets. Swipe horizontally only when the gesture is clearly horizontal; vertical browser scrolling remains native. Show a still first frame and no autoplay for `prefers-reduced-motion`. |
| **Scroll-triggered image mask reveal — first featured wedding image on Home, then one image on About**. | Reveal a single still as the section enters view, like a print being uncovered. It should finish before the next reading beat; never delay access to the hero or hide all images in a section. | Use GSAP/ScrollTrigger in a scoped `useGSAP` context to animate `clip-path` on the image element/overlay child, once, with a short 500–700 ms ease. Keep the default CSS image fully visible; only opt into the starting mask after motion is enabled and GSAP has initialized. Trigger refresh after image/font layout settles and revert on unmount. | Keep the same image uncropped by animation and visible immediately; on narrow/low-power devices use a short opacity reveal or no reveal. Disable the mask entirely for reduced motion and if it causes paint jank on a mid-range Android device. No swipe is required to reveal content. |
| **Layered parallax photography — Home social wall, one featured Home story image, and selected Portfolio lead images**. | The three social-wall lanes travel at slightly different visual rates while scrolling, creating depth without moving the text or changing image order. The featured image may have a foreground/background offset. The effect starts and ends as the image crosses the viewport; it must not leave gray/empty edges. | Retain GSAP ScrollTrigger with a section-scoped ref. Animate only the inner media with `y` and a small scale buffer (roughly 1.03–1.06); cap phone travel around 8–16 px per layer and desktop around 16–28 px. Use scrubbed progress only while visible; no transform on the page-width track, and no React state updates per frame. Reserve overflow within each media frame and clear `will-change` after activity. | Keep all three CMS-managed rows and their admin row/order assignments. Reduce movement to a barely perceptible 4–8 px; preserve natural vertical scroll and horizontal row swipes. Turn parallax off for reduced motion, very small viewport heights where it competes with reading, or measured frame drops. The static crop is the full fallback. |
| **Sticky image + text storytelling — one featured case-study chapter on About or Portfolio; optional Home featured story only if the page stays concise**. | On wide screens, one large image remains visually anchored while two or three short story beats change beside it. The active beat changes the image/caption in a predictable order; users can still follow the story without motion. Limit to one such chapter per page. | Use CSS `position: sticky` for the media column and a GSAP ScrollTrigger timeline to crossfade/scale separate image children as text beats enter. Animate opacity/transform only; no scroll hijacking, no image swaps that alter the section's height, and no pinning of the entire document. | Below 900 px, remove sticky behavior and restore normal reading order: image, caption, then each text beat; if multiple images are essential, use a standard Embla gallery with a next-slide peek. Do not trap vertical scrolling or require a swipe to read the narrative. Reduced motion displays all story beats and the selected still. |
| **Horizontal swipe editorial galleries — Home featured work, all three Home social-wall rows, reception halls, and Portfolio**. | Each gallery is a deliberate image sequence with an obvious partial next item where appropriate. A visitor can swipe, use visible previous/next buttons, or select a slide. Portfolio filters and a lightbox remain usable independently. Each of the social-wall's three rows stays independently swipeable; row and ordering are admin-controlled. | Use the installed Embla 8 API, CSS scroll/drag viewport, stable slide aspect ratios, `containScroll`/snap behavior appropriate to the gallery, and buttons outside the draggable surface. Keep an active index from Embla events and expose current/total. Do not nest a button inside a drag target or couple vertical page scrolling to carousel state. | On 360–430 px, show about 1.15–1.3 cards for story/work, with image heights chosen per content rather than large uniform tiles; social wall uses compact, distinct crops in three short lanes. Set `touch-action: pan-y` on horizontal viewports and retain native vertical inertia. No autoplay. A visible swipe hint may appear once and disappear after interaction; controls remain tappable. |
| **Image scaling transitions — Home featured work, venue carousel, Portfolio preview/lightbox**. | Images gently settle as the active slide changes; a preview may grow into a lightbox without a layout jump. Scaling should add focus, never imply a misleading 3D card deck. | On slide selection, transition only the `<img>` child from about `scale(.985)` to `scale(1)` over 350–500 ms; use `transform-origin` and `overflow:hidden` on the image frame. Use CSS transition or Framer Motion for this discrete UI state, not GSAP if Embla is already writing transforms to the track. Reserve image dimensions to prevent layout shift. | On touch, avoid hover zoom; use a brief pressed state (around `scale(.99)` for 100–160 ms) and keep text/controls fixed. Limit scaling to the active image only. Disable scale transitions under reduced motion; keep lightbox zoom/pan controls explicit. |
| **Staggered typography reveals — page H1/eyebrow and section title/caption pairs on Home, About, Services, and Portfolio**. | Reveal eyebrow, heading, then a short supporting line in that order as the title enters view. Use the stagger to guide the eye, not to animate every word. | Use Framer Motion variants or `whileInView` on semantic blocks, with 60–100 ms between blocks and 8–12 px vertical travel, once per entry. Do not split words/characters, change heading semantics, or run an animation on every scroll tick. Content is visible before hydration / when JS is off. | Same short sequence or a single fade at 360–430 px; no words should be clipped or delayed. Turn into immediate static text for reduced motion. If text wraps to many lines, animate the heading as one block. |
| **Section-to-section visual transitions — Home hero → brand point of view; featured story → “Follow The Magic / SOCIAL WALL”; Portfolio chapter → closing enquiry**. | Give each chapter a deliberate handoff: an image may bleed to the section edge, a caption may lead into the next background, and warm ivory/ink/pink changes mark a new chapter. Eliminate unexplained blank bands and abrupt gray gaps. | Use CSS layout/background tokens, a shared edge-to-edge media frame, and a subtle gradient/color overlap at section boundaries. Use one short Framer Motion opacity transition only for route-level content where needed; do not animate section height or coordinate scroll position. Keep spacing tied to the section's actual text and image. | Use simple color continuity and a clear section boundary in normal flow. No scroll-linked background recoloring, overlapping hit areas, fixed-height transitions, or horizontal overflow. Respect safe areas and preserve readable separation when motion is disabled. |
| **Elegant full-screen mobile navigation — Header menu from 320–767 px**. | Tapping menu opens a quiet full-screen ivory/ink panel under the status bar with a clear JP identity, large vertically arranged public routes, one contact action, and a close control. Use a gentle entrance and sequential link reveal; return the user to the same scroll location when it closes. | Keep Header and Framer Motion. Model as an accessible modal dialog/overlay with `aria-expanded`, `aria-controls`, Escape close, focus entry/return, background inertness/scroll lock while open, and safe-area padding. Close it on route selection. Preserve auth/admin visibility rules. | Every item is a direct tap target of at least 48×48 px; no hover reveal and no tiny close icon. Enable swipe only if it is discoverable and does not replace the close button. Do not depend on a bottom nav; keep the menu usable one-handed on short screens and allow its links to scroll if needed. Reduced motion opens/closes instantly. |
| **Interactive portfolio previews — Portfolio grid and the Home featured-work entry**. | A preview shows the real project photograph, short project/event label, and clear action. On desktop, hover or keyboard focus may reveal the caption and a second still; selecting opens the project/lightbox. On mobile, one tap opens the preview/detail directly, with an explicit close/back action. | Keep existing CMS/legacy data and lightbox actions. Use CSS/Framer Motion for a single media crossfade and modal presence; reuse Embla only for image sequences inside the selected work. Do not load or play video until explicit user action; preserve alt text, caption, focus management, and URL/category context. | No hover-only caption, video preview, or hidden affordance. Show title/action or a visible overlay by default, and make the entire intended tile tappable without nesting controls. Use 48 px close/navigation controls; restore focus to the invoking item on close. Reduced motion removes zoom/crossfade but not the detail. |
| **Custom carousel progress — Home hero, featured work, reception halls, and Portfolio lightbox**. | Replace generic rows of dots with a restrained, brand-aligned segmented line or `01 / 06` counter beside a progress track. The active item is obvious, the next/previous actions are visible, and progress never suggests time-based autoplay on a manual gallery. | Derive selected snap and total from Embla events. Render semantic previous/next buttons plus an accessible progress/current-slide label; set `aria-current` for selectable segments. Keep the active segment in sync after drag, button action, resize, and data refresh. Avoid high-frequency React state updates; update only on selection. | Keep compact counter/segments visible without reducing image touch area; buttons at least 48×48 px and outside the image drag zone. Swipe updates progress immediately. No tiny clickable dots; no auto-progress animation on editorial galleries. For reduced motion, indicator updates instantly. |
| **Subtle magnetic interaction — desktop primary enquiry CTA and Portfolio preview affordance only**. | On a fine pointer, a button can follow the cursor by at most 3–5 px inside its own bounds, then ease back on exit. It must still look and behave like a normal button. | Use a CSS custom property or direct transform on an inner decorative child, gated by `(hover: hover) and (pointer: fine)` and reduced-motion preference. Do not update React state per pointer frame. Keep Framer Motion/GSAP off the same transform. Keyboard activation, focus ring, and click target remain unchanged. | Do not enable magnetism on touch or pen input. Use native pressed feedback only; never require pointer precision. Disable for reduced motion. |
| **Refined hover and touch feedback — links, buttons, gallery tiles, and venue enquiry CTA site-wide**. | Desktop hover may add a short color/underline response and slight image scale; keyboard focus has a clear independent ring. Touch press gives immediate feedback without sticky hover or changing layout. | Use CSS transitions for color, underline, and transform; keep typical feedback within 120–220 ms and avoid animating layout dimensions/shadows across large areas. All actions have visible default labels and semantic button/link elements. | Use `:active`/pointer feedback only as enhancement; no content or label appears exclusively on hover. Ensure targets are at least 44×44 px (48×48 preferred for primary carousel/menu actions). Give carousels `touch-action: pan-y`, preserve pinch zoom, and avoid overlapping hit areas. Reduced motion removes easing. |

### Mobile-first interaction contract

- **Native scroll is the default.** No Lenis, scroll-jacking, full-page snap, or gesture capture on the document. A horizontal gesture is consumed only when it is horizontal inside a gallery; vertical movement remains native.
- **Touch, keyboard, and pointer are equal paths.** Every hover treatment has a visible default state and a focus/tap equivalent. Carousels support swipe plus labeled controls; the menu and lightbox never rely on swipe to close.
- **Prevent horizontal page overflow.** Only explicitly clipped carousel viewports may extend beyond the visible page. Their tracks must be contained; body/document width must remain at viewport width at all required breakpoints. Do not use `100vw` inside padded containers without accounting for scrollbar/safe-area behavior.
- **Targets and spacing.** Use at least 44×44 CSS px for all action targets and prefer 48×48 px for menu, carousel, lightbox, and primary CTA controls. Keep controls clear of the image focal point, each other, browser safe areas, and fixed contact affordances.
- **Mid-range Android performance.** Prefer transform/opacity and small clip regions, decode images before revealing them, limit simultaneous scroll-linked subjects to three visible lanes, avoid large blur/backdrop-filter layers, and avoid per-frame React renders. Use real compressed responsive images. Check frame pacing while scrolling and swiping, not only the static screenshot; simplify motion immediately if it stutters.
- **Reduced motion.** With `prefers-reduced-motion: reduce`, render final states immediately, disable parallax, sticky crossfades, masks, magnetic movement, autoplay, and nonessential scale/stagger. The user still gets full content, working carousels/menu/lightbox, and understandable selection feedback.
- **CMS control remains intact.** The social wall remains exactly three admin-managed rows; admin image assignment/order is respected on every viewport. Responsive presentation may tune image width, crop, and movement, but must not silently omit items or rewrite row assignment. Loading/error/legacy fallback states must not introduce a gray blank wall.

### Visual acceptance screenshots and review rubric

Capture actual rendered screenshots after implementation using the same approved CMS/legacy content and the same image set at each target. Use consistent viewport heights of 800 px at 360 px wide, 844 px at 390 px, 932 px at 430 px, and 900 px at 1440 px. Include an actual mid-range Android browser capture for motion/touch review when available; desktop emulation alone does not prove touch feel. Save the screenshot set with viewport and state in the filename so regressions can be compared.

| Screenshot state | Required captures | What reviewers must verify |
|---|---|---|
| Home opening composition | 360×800, 390×844, 430×932, and 1440×900 | Hero is genuinely full-bleed on phones; face/focal crop, H1, CTA, header, and controls fit without collision; photo is sharp and visible before motion; no blank/gray edges. Desktop composition is composed rather than a stretched phone layout. |
| Mobile navigation | Open menu at all three phone widths; desktop menu/navigation at 1440×900 | Full-screen panel respects safe areas and short-height scroll, has clear hierarchy, readable links, large targets, and one contact action; focus/close behavior is usable and content does not scroll behind it. |
| Story and section transitions | Home story/social-wall boundary and one About or Portfolio story at phone and desktop sizes | Image/copy rhythm feels continuous; masks and parallax do not cause blank space, jump, clipped faces, or unexplained gaps; text stays readable; three social-wall rows remain visible and ordered. |
| Galleries and carousel controls | Home featured work, each social-wall row, reception halls, and Portfolio at phone sizes; at least one desktop view | Next-slide peek is intentional, drag does not fight vertical scroll, active progress matches the selected slide, controls are reachable, and image scaling does not shift layout. Test visible control, keyboard, and real swipe paths. |
| Portfolio preview/lightbox | Grid plus open detail at 390×844 and 1440×900 | Tap opens on mobile without a hover prerequisite; close returns to the invoking image/focus; captions and media load; no hover residue; controls and image crop are consistent. |
| Route and visual-system consistency | Home, About, Services, Portfolio, Contact, Blog, and Invitations top/representative section captures at 390 px plus 1440 px spot checks | Heading/type hierarchy, palette, gutters, media treatment, button language, transitions, and motion pacing belong to one JP Events system while preserving each route's task. |

Review every capture against these criteria: (1) hero composition and first-screen action clarity; (2) display/body typography hierarchy and real-content wrapping; (3) photography quality, crop, focal point, and loading state; (4) animation smoothness on mid-range Android and final states under reduced motion; (5) carousel drag, slide peek, controls, progress, and current-state feedback; (6) section-to-section pacing with no dead gaps; (7) navigation discoverability, one-handed reach, safe areas, and keyboard operation; (8) consistent visual language across routes without repeated generic cards. A screenshot passes only when the intended content is legible, the interaction is discoverable, and the motion supports rather than obstructs the story.

### Technical decisions retained

- Keep the existing React architecture and route composition plan.
- Keep installed GSAP + ScrollTrigger + `@gsap/react` for scoped scroll-linked image/story motion.
- Keep installed Framer Motion for discrete interface transitions, reveals, and modal/menu presence.
- Keep installed Embla for touch-first galleries and carousels.
- Keep existing Supabase CMS contracts, public-content/fallback behavior, social-wall row/order fields, media handling, admin login/editing/upload preview, and all enquiry/contact flows.
- Do not add libraries for these effects. A new dependency requires a demonstrated gap that the existing stack cannot meet, plus a documented performance/accessibility trade-off and explicit approval during implementation planning.

**Planning boundary:** this refinement changes only the implementation brief. No application work begins until the plan is approved.
