# JP Events — Immersive Image Experience and Advanced Carousel Planning

**Status:** Planning only.  
**Implementation state:** Unknown until this plan is approved and implemented. This document does not prove that the proposed phase has been executed.  
**Scope:** Plan a controlled, mobile-first visual enhancement using existing React, Vite, Tailwind, CMS, and motion capabilities.  
**Source guardrail:** This document is a new file. It must not overwrite `IMPLEMENTATION.md`, `IMPLEMENTATION1.md`, or `IMPLEMENTATION2.md`.

No application source code, component, stylesheet, asset, package manifest, lockfile, configuration, database schema, migration, CMS record, environment variable, or route was changed while preparing this plan.

---

## 1. Executive Summary

The current JP Events application is an image-led React 18 and Vite 5 experience with a cherry-blossom visual identity, CMS-backed venue and portfolio content, and several existing motion systems. The next phase should not rebuild or rebrand the site. It should add a small number of deliberately choreographed image-led moments that make vertical scrolling feel cinematic on mobile while preserving normal touch behavior, route structure, public copy, CMS integration, and business actions.

The recommended architecture is:

1. **GSAP + ScrollTrigger** for scroll-linked horizontal image ribbons and contained parallax scenes.
2. **Embla Carousel** for actual user-controlled carousels and image galleries.
3. **Framer Motion** for existing UI transitions and small component reveals, not as a second scroll-engine for the same ribbons.
4. **Lenis only as an explicitly approved optional enhancement**, not as a default dependency.
5. **React Bits only as reviewed source inspiration or isolated MIT-with-Commons-Clause-reviewed components**, not as an application-wide motion runtime.

The major design principle is **vertical storytelling, with horizontal movement inside bounded image tracks**. It is not a forced horizontal-scroll journey, long pinned section, permanent marquee, or touch-scroll hijack.

The highest priority is a 390px-wide mobile visitor: natural page scrolling must remain primary. Horizontal image ribbons respond to vertical scroll and can optionally expose manual drag or link into a lightbox. They must never prevent a swipe down from reaching the next section.

---

## 2. Audit of the Existing Repository

### 2.1 Verified application architecture

- Application: React 18.3, React DOM, React Router 6, Vite 5, Tailwind CSS 3.4, and TypeScript.
- Entry: `src/main.tsx` mounts `src/App.tsx`.
- Public routes: `/`, `/about`, `/services`, `/portfolio`, `/invitations`, `/blog`, `/blog/:slug`, `/contact`, and `/developer`.
- `/admin/*` renders the CMS application without public header/footer composition.
- Shared public chrome: `src/components/Header.tsx` and `src/components/Footer.tsx`.
- Route scrolling: `src/components/ScrollToTop.tsx`.
- Metadata and analytics: Helmet provider, SEO components, `src/utils/analytics.js`, and route tracking.
- Content:
  - published venues use `usePublishedVenues()` and `cmsRepository`;
  - published portfolio content uses `usePublishedPortfolio()`;
  - fallback/legacy content remains available through the existing hooks;
  - Supabase configuration can be enabled or disabled without changing the public route model.

### 2.2 Existing visual composition

#### Home

`src/pages/Home.tsx` composes:

1. `Hero` — includes the full-page hero, the homepage Reception Halls carousel, and additional home-page image/story sections;
2. `SuperTrustRocket`;
3. `SchemaTestimonials`;
4. schema components.

The actual repository contains an Embla-based hero:

- three hero images;
- Fade plugin;
- 5-second autoplay;
- previous/next controls;
- dots;
- pause/resume;
- hover/focus pause;
- reduced-motion pause;
- touch-pan-y;
- accessibility labels and aria state.

The homepage venue carousel is also Embla-based and receives published CMS venue items.

#### Services

`src/pages/Services.tsx` wraps `Services` and `Process`.

`src/components/Services.tsx` contains a large service presentation, a published Reception Halls venue carousel, amenities and venue details, and CTA behavior. It already uses Embla for the reception-hall section.

#### Portfolio

`src/pages/Portfolio.tsx` wraps `src/components/Portfolio.tsx`.

The Portfolio page is a CMS-aware masonry/grid with:

- category filters;
- search;
- masonry/grid mode;
- image and video branches;
- hover overlays;
- lightbox;
- thumbnail navigation;
- likes/views metadata;
- WhatsApp inquiry behavior.

The Portfolio masonry must remain a masonry/grid. It must not become a scroll-linked ribbon or a forced horizontal carousel.

#### About, Blog, Invitations, Contact, and Footer

The remaining public pages have established content and motion. The immersive enhancement should be concentrated in approved image-rich surfaces and should not transform every page into a full-screen parallax experience.

### 2.3 Existing dependencies and animation usage

The package manifest declares:

- `embla-carousel-react` and `embla-carousel-fade`;
- `framer-motion`;
- `gsap`;
- React 18;
- Vite 5.

Repository source search found:

- Embla usage in the hero and venue surfaces;
- Framer Motion usage across page/UI transitions and portfolio scroll values;
- no active GSAP import or ScrollTrigger registration;
- no existing Lenis dependency;
- no existing React Motion package dependency.

GSAP is declared but unused. That makes it the leading candidate for the proposed scroll-linked ribbons without requiring a new animation engine. It should only be installed/registered if a final implementation is approved; `gsap` is already present.

### 2.4 CMS and fallback behavior

The enhancement must preserve the CMS contract:

- CMS disabled: legacy/fallback content;
- CMS configured: published records;
- incomplete CMS configuration: a clear configuration error;
- CMS fetch failure: existing error behavior;
- venue updates: shared external-store refresh;
- portfolio updates: existing hook refresh behavior;

New ribbons must not introduce a new hidden CMS. Reuse published portfolio media and venues where content and image authorization permit. Avoid adding sample content or replacing existing URLs.

### 2.5 Browser-verified baseline

The running Vite application was inspected in Chromium-like browser automation:

- 390 × 844:
  - document width is 390px;
  - body width is 390px;
  - no reproduced document-width overflow;
  - the home document is vertically long;
- 768 × 1024:
  - document width is 768px;
  - body width is 768px;
  - no reproduced document-width overflow;
  - the mobile/tablet header remains compact;
- 1440 × 900:
  - the `/services` route renders with a complete services section, Reception Halls section, and process section;
  - no horizontal document overflow was found in that route check;
- external analytics, font, and image providers may fail or be blocked in local/offline browser sessions; failures were not used as proof of application behavior.

The earlier plan's 8px overflow and 768px header wrapping are therefore recorded baseline issues, but they must be re-audited rather than assumed to remain. The current browser result does not reproduce them.

The 390px overflowElements probe also identified Embla slides positioned outside the visible viewport as normal track content. They must not be interpreted as document overflow unless `scrollWidth` changes.

---

## 3. Main Creative Vision

The experience should feel like an editorial wedding photography journey:

- visitors scroll down normally;
- each image scene occupies a bounded section;
- several rows move horizontally at different speeds;
- adjacent rows travel in opposite directions;
- portrait and landscape images mix within a deliberate rhythm;
- selected image layers reveal with the vertical scroll;
- text and image transitions appear only once or within a scene;
- the rest of the page remains native, fast, and readable.

### 3.1 Mobile-first composition

The mobile visual priority is:

1. **One comfortable vertical reading rail**;
2. **Two or three short image tracks**, not a large rack of rows;
3. **16–20px horizontal scene padding**;
4. **Native vertical touch scrolling**;
5. **Small manual controls only where genuinely useful**;
6. **No pinned screen that traps or slows the visitor**;
7. **Static, complete content under `prefers-reduced-motion: reduce`**.

On narrow screens, a track should move based on a limited range, for example approximately 10–25% beyond its initial composition. It should not move an entire viewport for every scroll step. The horizontal translation must never make text, CTAs, focus outlines, or footer controls inaccessible.

### 3.2 Sophisticated ribbon behavior

Recommended patterns:

- a 3-row editorial ribbon with alternating direction;
- a 2-row mobile ribbon with portrait-dominant cards;
- a 2-row desktop ribbon with more visible landscape cards;
- independent image depth with 0.7×, 1.0×, and 1.2× relative movement;
- a short intro copy overlay that stays readable above the first row;
- a `View portfolio` link that navigates to `/portfolio`;
- optional image taps that open the existing Portfolio detail/lightbox behavior.

Avoid:

- identical loops in every section;
- continuous CSS marquees;
- a glossy "stock carousel" look;
- excessive blur, zoom, glare, particle, or 3D effects;
- mouse-only wheel interception;
- nested vertical scroll containers;
- opacity and transform effects for every heading;
- repeating 20 identical image cards.

---

## 4. Library and Interaction Research

### 4.1 GSAP + ScrollTrigger — primary candidate

Official sources:

- [GSAP repository](https://github.com/greensock/GSAP)
- [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP React integration](https://gsap.com/resources/React/)

Why it fits:

- direct support for scroll-scrubbed horizontal movement;
- independent row timelines;
- responsive `matchMedia()` behavior;
- image scale/reveal/clip-path patterns;
- stagger and timeline sequencing;
- cleanup via GSAP context or `useGSAP`;
- existing dependency already declared in this repository.

Important constraints:

- ScrollTrigger scrubbing is for scroll-linked effect progress, not as a replacement for carousel controls;
- pinning should be limited to carefully selected desktop scenes;
- pinning on mobile should default to off unless it passes real-device testing;
- `containerAnimation` is not a general nested or pinned solution;
- `matchMedia()` must reset and refresh effects when breakpoint or orientation changes;
- use `gsap.context().revert()` or the React integration cleanup before route unmount.

License:

- GSAP is governed by the GreenSock Standard License. It generally permits commercial website use, subject to its restrictions on competing visual-animation-builder products.

Implementation choice:

- prefer native GSAP context lifecycle;
- optionally add `@gsap/react` only if the React hook demonstrably reduces lifecycle bugs;
- do not add it by default just because it is documented;
- no Lenis integration unless Lenis is separately approved.

### 4.2 Embla Carousel — user controls

Official sources:

- [Embla Carousel repository](https://github.com/davidjerleke/embla-carousel)
- [Embla React documentation](https://www.embla-carousel.com/docs/get-started/react)

Why it fits:

- swipe precision and touch drag;
- loop/non-loop options;
- snap behavior;
- fade plugin;
- responsive visible-slide configuration;
- custom dots, arrows, and keyboard controls;
- existing dependency and existing repository patterns.

Why it does not fit the ribbon:

- it is a slide-selection engine;
- it does not naturally turn vertical page progress into horizontal transforms across three independent tracks;
- applying it to a ribbon would create duplicate slide semantics and unnecessary snap behavior.

License:

- Embla is MIT licensed.

Embla must retain `touch-action: pan-y pinch-zoom` or an equivalent CSS contract. For existing user-controlled hero/venue surfaces, preserve the repository's current controlled autoplay and reduced-motion behavior.

### 4.3 Motion / Framer Motion

Official source and docs:

- [Motion repository](https://github.com/motiondivision/motion)
- [React scroll animations](https://motion.dev/docs/react-scroll-animations)
- [useScroll](https://motion.dev/docs/react-use-scroll)
- [useTransform](https://motion.dev/docs/react-use-transform)
- [useReducedMotion](https://motion.dev/docs/react-use-reduced-motion)

Motion is an alternative for declarative `scrollYProgress` mapping. The repository already uses Framer Motion and has `useScroll`, `useTransform`, and `useReducedMotion`.

Do not add GSAP and a second motion runtime for the ribbon. Framer Motion remains appropriate for:

- headings and copy reveals;
- card hover/layout interactions;
- mobile menu;
- existing route/component transitions;
- modal and lightbox transitions.

GSAP owns the ribbon's shared scroll timeline. Motion should not animate the same transform or progress value.

### 4.4 Lenis

Official sources:

- [Lenis repository](https://github.com/darkroomengineering/lenis)
- [Lenis documentation](https://lenis.dev/)

Lenis can synchronize smooth scrolling with GSAP, but it is not required for the ribbon.

Decision:

- do not enable Lenis in the initial implementation;
- do not enable touch smoothing;
- keep native browser scroll;
- if later approved, test against iOS, Android, keyboard scrolling, scroll restoration, Embla, modals, and browser zoom;
- keep Lenis off for reduced-motion users;
- integrate GSAP and Lenis with a shared ticker only after a staged proof.

License:

- Lenis is MIT licensed.

### 4.5 React Bits

Official sources:

- [React Bits repository](https://github.com/DavidHDev/react-bits)
- [React Bits website](https://reactbits.dev/)

React Bits can provide selective inspiration for:

- reveal composition;
- accordion/masonry galleries;
- parallax card placement;
- tilted card interactions;
- decorative image transitions.

It must not become a dependency until:

- its MIT + Commons Clause license is approved for the exact copied component;
- source code is reviewed for lifecycle and dependencies;
- reduced-motion behavior is verified;
- mobile performance is measured;
- a runtime dependency is not simply duplicated.

The public terms do not automatically grant a reusable right to copy the source. Keep components as inspiration unless licensing approval is recorded.

---

## 5. Proposed Surface Strategy

### 5.1 Home

The strongest initial experience is a single immersive photo ribbon inserted between existing home sections. It should not replace:

- the existing hero;
- existing venue carousel;
- trust/social-proof content;
- existing CTA behavior;
- schema content.

Recommended insertion:

- after the existing hero, add one "moments" ribbon;
- retain the existing venue carousel;
- optionally add a second smaller editorial ribbon immediately before SuperTrust/social proof.

Do not add a second image ribbon that merely repeats the first. Repeated similar effects reduce memorability and performance.

### 5.2 Portfolio

The Portfolio page should remain a grid/masonry. Within the page:

- no GSAP scroll-driven horizontal scene should replace the existing cards;
- one portfolio bridge ribbon may use a curated subset of published portfolio images;
- tapping a ribbon item can open the existing detail lightbox or navigate to the matching card;
- filters/search/grid/lightbox behavior remain unchanged.
- editorial image cards should not duplicate portfolio data or create competing state.

If CMS portfolio data is unavailable, the ribbon must collapse or use an existing data-safe fallback. It must not show synthetic placeholder events.

### 5.3 Services

The Services venue carousel remains Embla. It should not become a GSAP ribbon.

GSAP may be used in bounded presentation areas around the existing services content, but not inside or around:

- the venue CTA;
- WhatsApp action;
- venue details;
- pricing;
- amenities;
- booking controls.

The ribbon is decorative/editorial only unless explicitly approved as functional navigation.

### 5.4 About

A smaller ribbon may support founder/story imagery. Avoid duplicating CMS or hard-coded portfolio records. The actual story section can use an approved local asset set or existing approved remote assets.

### 5.5 Blog and Invitations

No global ribbon is recommended.

Any article-level transition should be implemented individually and only if it improves narrative without hurting reading speed or mobile long-form behavior.

### 5.6 Footer

Do not move the footer behind an endless scene or an unpinned horizontal gallery.

Preserve footer links, admin route visibility, WhatsApp, and the existing floating controls.

---

## 6. Ribbon Component Design

### 6.1 Recommended reusable component

Create a named component in the implementation phase, for example:

- `src/components/ImmersiveImageRibbon.tsx`

Do not add a generic dependency until a component contract is demonstrated.

Suggested prop contract:

```text
items: ImageRibbonItem[]
variant: "editorial" | "compact" | "serviceBridge"
direction: "ltr" | "rtl"
rows: 2 | 3
enableDesktopPinning: false
enableManualDrag: false
ariaLabel: string
onImageSelect?: (item) => void
```

`ImageRibbonItem` should contain:

- stable ID;
- image source;
- alt text;
- optional focal position;
- portrait/landscape classification;
- optional link/portfolio action;
- optional width or aspect ratio;
- `priority/loading` guidance.

No placeholder title or fake wedding project should be inserted by the component.

### 6.2 DOM and CSS

Each section should have:

- an `overflow: hidden` containment shell;
- one bounded scene height;
- CSS transform-based row tracks;
- `contain: layout paint` only where layout-safe;
- `will-change: transform` only on the actively animated track;
- explicit image dimensions or aspect ratios;
- no `100vw` calculations that include browser scrollbars;
- no global `overflow-x: hidden` workaround.

Recommended mobile behavior:

- track overflow is clipped at the scene boundary;
- cards are 68–82vw at the widest orientation;
- no card extends under the header;
- no card CTA is placed only in off-screen overflow;
- a `View` action appears in the main content rail, not as required for ribbon reachability.

Recommended desktop behavior:

- cards use mix of 4:5 and 16:10 shapes;
- 5–9 images per track;
- maximum track width is constrained;
- track movement is no greater than approximately half of the track's overflow;
- all selected images have at least one visible pause/reduced-motion fallback.

### 6.3 ScrollTrigger lifecycle

The implementation phase should:

1. capture elements with refs;
2. create one GSAP context;
3. register `ScrollTrigger` once;
4. create scene timeline(s);
5. use `matchMedia()` for mobile/tablet/desktop values;
6. set `scrub` to a modest smoothing value;
7. refresh on route/image load;
8. call `.revert()` and `ScrollTrigger.getAll().forEach(trigger => trigger.kill())` or equivalent scoped cleanup on route unmount;
9. refresh after CMS items reinitialize;
10. never leave global ScrollTriggers attached after route navigation.

Pinning:

- default to no pinning;
- if a desktop proof is approved, pin only the scene's visual frame for a short range;
- always disable pinning under mobile and reduced motion;
- never pin at or near the Portfolio masonry or lightbox.

### 6.4 Scroll-linked movement formula

At a high level, track progress is mapped from the scene's scroll entry to exit:

- one row starts at `0px` and moves to `-12%` of its overflow;
- one row starts at `-8%` and moves to `0` or `+8%`;
- a third row uses `-5%` to `-18%` with independent delay;
- no track reverses abruptly at scene boundaries;
- at scene entry/exit, CSS reveals or scales can settle to neutral.

The exact values must be driven by actual element widths, not hard-coded 390px assumptions.

---

## 7. Data and Image Strategy

### 7.1 Source priority

For a ribbon:

1. approved CMS portfolio media;
2. venue media already approved for public delivery;
3. existing approved remote assets already used by the site;
4. no new stock or demonstration asset.

Do not alter stored CMS URLs, media IDs, upload/publishing state, or RLS.

### 7.2 Card selection

The implementation should not assume every CMS media asset is suitable:

- require public URL;
- require non-empty alt text or generate a meaningful fallback approved for the site;
- require a supported aspect ratio;
- filter broken or private assets;
- cap initial count;
- deduplicate IDs/URLs;
- preserve source order.

CMS updates should refresh the ribbon without resetting unrelated route state.

### 7.3 Loading and rendering

Use:

- eager loading only for the hero;
- lazy loading for below-fold ribbon images;
- `decoding="async"`;
- explicit width and height/aspect ratio;
- responsive `srcset`/`sizes` where provider URLs support it;
- no preload for every ribbon image;
- LCP protection for hero and first viewport;
- `fetchpriority="low"` or lower priority for decorative off-screen tracks where supported.

The existing `src/components/Performance/Lazyimage.jsx` can be inspected for reuse in a future implementation.

### 7.4 External media failure

A ribbon must:

- avoid blanking unrelated content;
- retain aspect ratio;
- show a neutral backdrop;
- fall back to text/CTA if an image fails;
- not stop ScrollTrigger scrubbing;
- not retry endlessly.

Network failure must be distinguishable from missing CMS content.

---

## 8. Mobile Interaction Requirements

The mobile implementation must meet all of the following:

- vertical scrolling remains smooth and native;
- no `touchmove.preventDefault()` on the page or scene;
- no Lenis touch smoothing;
- `touch-action: pan-y pinch-zoom` for any Embla gallery;
- no horizontal wheel interception;
- no forced body lock;
- no scene-level nested scrolling;
- no image row steals taps from CTAs;
- no full-screen overlays outside the existing lightbox pattern;
- no parallax if the device reports reduced motion;
- no pinned scene on mobile;
- no ribbon button requiring hover to discover;
- no keyboard trap.

Optional manual drag:

- apply only to an explicitly user-controlled Embla gallery;
- do not add drag to a scroll-linked ribbon and label it as a carousel;
- if a ribbon item is a link, preserve normal tap behavior.

---

## 9. Reduced Motion and Accessibility

### 9.1 Reduced motion

Under `prefers-reduced-motion: reduce`:

- remove scene scrubbing and row translation;
- keep static, complete image composition;
- no automatic image row motion;
- no entrance jumps or scaling;
- existing carousel autoplay remains disabled;
- existing controls remain usable;
- Framer Motion remains at neutral/static states;
- GSAP context may contain static setup, but no repeated timeline.

Use both:

- `useReducedMotion()` in React;
- GSAP `matchMedia("(prefers-reduced-motion: no-preference)")` or equivalent.

### 9.2 Semantic content

For ribbons:

- section has a meaningful heading;
- region has an accessible label;
- decorative images use `alt=""` only when adjacent content conveys meaning;
- informative images use short descriptive alt text;
- no alt text contains "image of" redundantly;
- links have text or an accessible label;
- manual controls have a visible focus state;
- hidden overflow content must not become inaccessible in keyboard navigation.

If an item opens the existing lightbox:

- use a real button or link;
- announce the action;
- preserve focus on close;
- preserve arrow-key behavior;
- maintain Escape dismissal;
- do not add a duplicate gallery interaction.

### 9.3 Screen reader behavior

GSAP transforms must not reorder DOM. The DOM image sequence should remain meaningful and synchronized with the visual presentation. Scroll-linked animation should never hide all text from assistive technology.

### 9.4 Contrast

If text overlays an image:

- use a layered gradient/scrim;
- test text contrast in representative images;
- do not rely only on rose/champagne text;
- preserve the existing brand palette.

---

## 10. Performance Budgets

No implementation should proceed without baseline and post-change measurements.

Recommended acceptance budgets:

| Metric | Target or rule |
|---|---|
| JS bundle | no avoidable increase above 30 KB gzip for a first-load ribbon implementation |
| GSAP chunk | lazy-load ScrollTrigger if it is not needed on every public route |
| Main thread | no continuous animation loop on screens not in view |
| ScrollTriggers | one scene's timeline(s) only; no per-image permanent triggers |
| Track images | 4–8 relevant images in initial mobile set |
| Initial below-fold network | lazy-load; do not eager-load all ribbons |
| CLS | reserve image/card dimensions; no late layout shifts |
| Page overflow | 0 document width overflow at all acceptance viewports |
| Mobile scroll | no scene stutters or scroll locks during a simple 390px swipe |
| Reduced motion | static output; no ongoing animation timers |

GSAP and ScrollTrigger should be dynamically imported or scoped to the implementing page if bundle data proves this is beneficial. The existing GSAP dependency should not import ScrollTrigger globally if no ribbon is visible.

---

## 11. Proposed Implementation Phases

The implementation phase should be staged. Do not introduce every surface at once.

### Phase A — Baseline and isolated proof

1. capture baseline route screenshots and dimensions;
2. capture baseline bundle and lint/build;
3. add a Storybook-like temporary local proof only if the project has no test harness;
4. build one home ribbon with static approved assets;
5. verify mobile scroll, reduced motion, route navigation, and cleanup;
6. stop before modifying Portfolio/Services/About.

Exit criteria:

- no route-wide overflow;
- no scroll hijack;
- no runtime trigger cleanup leak;
- no build or lint regression;
- static reduced-motion output.

### Phase B — Home integration

1. move ribbon content to existing CMS-compatible data or approved existing media;
2. insert the first home scene into the existing Home composition;
3. retain all existing hero and venue behavior;
4. add section heading and `View portfolio` CTA;
5. add CMS empty/error/failure handling;
6. verify direct load and in-app navigation.

### Phase C — Secondary scene

1. add at most one second home/Portfolio/Services bridge ribbon;
2. prefer the Portfolio bridge over a second home repetition;
3. keep Portfolio masonry and lightbox independent.

### Phase D — Cross-page support

1. audit About for a story ribbon;
2. only implement any About ribbon after the home experience is stable;
3. do not add ribbons to all routes.

### Phase E — Final verification

1. full route/browser matrix;
2. bundle comparison;
3. lint/build;
4. CMS staging test if authorized;
5. real-device test if available;
6. documentation of verification versus unavailable external services.

---

## 12. Responsive Breakpoint Plan

| Width | Behavior |
|---|---|
| 320px | compact scene, 2 rows, one dominant card scale, no pinning |
| 390px | primary mobile visual target, 2 rows, mixed image cards, native scroll |
| 640px | compact-to-medium card widths, 2 rows |
| 768px | re-evaluate header breakpoint and ribbon card density; no reproduced overflow baseline |
| 1024px | 2–3 rows, controlled track range, no pinning initially |
| 1280px | full editorial composition, 3 rows if content is sufficient |
| 1440px | maximum readable scene width and deliberate margins |
| 1920px+ | cap scene width/track speed, preserve brand composition |

At each breakpoint:

- card height remains in proportion;
- track width is measured dynamically;
- no content is clipped only to fix overflow;
- header, footer, CTAs, and focus outlines remain reachable;
- footer and mobile menu are not under ribbon transforms.

---

## 13. CMS and State Edge Cases

Test:

- CMS disabled;
- incomplete configuration;
- CMS loading;
- CMS fetch failure;
- published portfolio is empty;
- published portfolio has one item;
- published portfolio has many items;
- published venue is empty;
- a new venue has no public media;
- media URL is broken;
- media is replaced while the route remains open;
- route unmount/remount;
- Browser back/forward navigation;
- React StrictMode development remount;
- no duplicate ScrollTrigger on remount;
- no stale GSAP callback after list update;
- no stale Embla instance after content reinitialization.

Fallback policy:

- fail to an existing public card or static section;
- do not invent new sample venues or portfolio records;
- do not use a business success-shaped fallback;
- display the existing error/loading treatment or omit the decorative ribbon.

---

## 14. Testing Plan

### 14.1 Browser interaction matrix

Test direct loads and navigation for:

- `/`;
- `/about`;
- `/services`;
- `/portfolio`;
- `/invitations`;
- `/blog`;
- `/blog/:slug`;
- `/contact`;
- `/developer`;
- `/admin/login`;
- `/admin/dashboard` when authorized.

At 320, 390, 640, 768, 1024, 1280, and 1440px, verify:

- document and body width equal the viewport;
- no unintended horizontal scroll;
- header fits;
- mobile menu closes on navigation;
- ribbon cards stay in scene bounds;
- hero and venue controls remain operable;
- Portfolio filtering/search/lightbox remain operable;
- footer links remain reachable;
- direct back/forward navigation remains functional.

### 14.2 Motion checks

- scroll from scene entry to exit;
- scroll up and down;
- change orientation;
- resize during an active scene;
- change reduced-motion preference live;
- route to/from `/portfolio`;
- reopen a ribbon scene;
- inspect ScrollTrigger count and context cleanup;
- confirm no repeated request loop;
- confirm no setInterval is added for ribbon motion.

### 14.3 Accessibility checks

- keyboard tab through the entire page;
- visible focus in overlaid areas;
- screen-reader heading/region names;
- Escape closes the existing lightbox;
- lightbox focus returns to trigger;
- reduced-motion static test;
- zoom at 200%;
- text scaling in browser settings;
- contrast of the first scene title.

### 14.4 Performance checks

- Lighthouse or equivalent local measurement if available;
- compare bundle chunks;
- measure CLS;
- measure scroll frame stability;
- confirm only in-view scenes animate;
- confirm images do not all load eagerly;
- confirm no console GSAP/ScrollTrigger warnings;
- run lint/build.

### 14.5 External services

The following remain environment-dependent:

- Supabase CMS;
- Google Analytics;
- EmailJS;
- WhatsApp;
- remote image providers;
- external fonts.

Mark these verified only through the relevant configured environment. Local request failures must be reported, not hidden or replaced with success-shaped fallbacks.

---

## 15. Acceptance Criteria

The phase is not complete unless:

1. no document-wide horizontal overflow is introduced;
2. normal vertical touch scrolling remains fully usable;
3. no scene pins or traps on mobile;
4. reduced-motion users receive static, complete content;
5. GSAP is scoped and cleaned up on route unmount;
6. no duplicate animation engine drives the ribbon;
7. Embla remains reserved for user-controlled carousels;
8. the Portfolio remains masonry/grid and retains filters, search, lightbox, and actions;
9. published CMS data remains the source for approved public content;
10. no CMS schema, RLS, auth, upload, route, integration, or business action changes;
11. no existing routes or copy are rebuilt/replaced;
12. no new sample portfolio or venue is introduced;
13. lint and build pass or new failures are explicitly identified;
14. real browser behavior and external-service limitations are reported separately;
15. no Lenis or React Bits dependency is added without its separate approval.

---

## 16. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| ScrollTrigger cleanup leak | one GSAP context per scene; scoped route lifecycle; explicit revert/kill |
| Mobile touch scrolling is affected | no touch interception; native scroll; no Lenis initially; test real devices |
| Mobile pinning feels trapped | disable pinning by default; unpinned proof first |
| Horizontal tracks introduce 8px overflow | clip locally; no global body overflow workaround; dynamic width calculations |
| Too many visible transformations feel chaotic | 2–3 rows, limited depth, alternating direction, deliberate pacing |
| CMS list updates leave stale transforms | refresh ScrollTrigger after item reconciliation; deduplicate/rekey stable IDs |
| External image URLs fail or lack dimensions | reserve aspect ratios; lazy-load; neutral fallback; separate network status |
| Heavy first-load bundle | lazy-load scene/ScrollTrigger only on relevant route; compare chunk output |
| Duplicate animation engines compete | assign GSAP to ribbons, Framer Motion to UI, Embla to controls |
| Lenis scroll restoration or modals break | do not add initially; staged approval with route/modal tests |
| React Bits license is unsuitable | no copied source or dependency unless exact license approval and review |
| Reduced-motion users still animate | GSAP matchMedia and React preference hook; no CSS loop in the static branch |
| Dark/low-contrast text on photographs | gradient scrim and contrast test |
| Effect becomes an endlessly repeating marquee | finite scene range; scroll-reactive and bounded |
| Editorial ribbon bypasses Portfolio behavior | preserve link actions and use existing detail/lightbox behavior |
| Analytics or tracking requests fail locally | report as unavailable; do not alter analytics for this visual phase |

---

## 17. Explicit Non-Goals

The implementation phase must not:

- rebuild the React application;
- change frameworks or routes;
- change the CMS schema or RLS;
- change authentication or MFA;
- alter Supabase Edge Functions or upload semantics;
- replace existing portfolio or venue content;
- add fabricated wedding projects or venue records;
- convert Portfolio into a carousel;
- convert the Services venue carousel into a ribbon;
- add artificial smooth scrolling by default;
- add a global parallax engine to every page;
- introduce forced horizontal touch scrolling;
- add wheel hijacking;
- add pinned presentation to mobile;
- add copy or stock image content without owner approval;
- modify analytics or external integrations;
- overwrite prior implementation documents.

---

## 18. Implementation Notes and Recommendations

### 18.1 Recommended first implementation

Build one `ImmersiveImageRibbon` on the Home route:

- 2 rows on mobile;
- 3 rows on desktop;
- no pinning;
- scroll-scrubbed motion;
- static reduced-motion branch;
- CMS portfolio or pre-existing approved imagery;
- `View Portfolio` navigation;
- no Lenis;
- no React Bits dependency.

Do not add a second ribbon until the proof passes mobile scroll and cleanup tests.

### 18.2 Desktop enhancement

If the first mobile experience is stable, add a more layered desktop-only scene:

- mixed portrait/landscape cards;
- independent depth movement;
- a short reveal/clip-path transition;
- no pinning unless approved after direct browser measurement.

### 18.3 Existing engine ownership

Use ownership, not library quantity:

| Experience | Engine |
|---|---|
| User-controlled hero | existing Embla |
| User-controlled venues | existing Embla |
| Portfolio masonry/lightbox | existing React + Framer Motion |
| Mobile menu/dialog/reveal | existing Framer Motion |
| Scroll-linked horizontal ribbons | GSAP + ScrollTrigger |
| Smooth scrolling | native; Lenis optional and not default |
| Selective visual components | React Bits inspiration only unless separately licensed |

### 18.4 Dependency decision

No new package is required for the initial proof:

- GSAP is already declared;
- Embla is already declared;
- Framer Motion is already declared;
- React and Vite are established.

If `@gsap/react` is needed for lifecycle convenience, decide only after a short implementation proof. Do not add Lenis or Motion at the same time.

---

## 19. Verification Documentation

The implementation phase should record:

- route and viewport screenshots;
- document width at every viewport;
- scroll/jank findings;
- ScrollTrigger count and cleanup behavior;
- bundle before/after;
- LCP/CLS measurements or explicitly unavailable tooling;
- CMS test environment and test outcome;
- real-device test list or unavailable-device notice;
- external-service failures;
- lint/build baseline and final output;
- known limitations.

No planned visual metric should be described as passed until browser or measurement output exists.

---

## 20. Final Recommendation

Proceed with a narrow, staged proof:

1. reuse GSAP/ScrollTrigger;
2. keep native mobile scrolling;
3. add one bounded Home ribbon;
4. use two rows on mobile and up to three rows on desktop;
5. do not pin by default;
6. keep Embla for functional carousels;
7. keep Framer Motion for component/UI state;
8. keep Portfolio as a masonry/grid;
9. keep Lenis and React Bits out of the first implementation;
10. measure, audit, and expand only after mobile behavior is demonstrably stable.

---

## 21. Actual Implementation Status

**Status:** Implemented and browser-verified for the scoped immersive experience.  
**Planning-only rule:** implementation changed application source and package state, but did not modify CMS schemas, authentication, RLS, routes, pricing, booking flows, contact integrations, or SEO metadata.

### Libraries and dependencies

- added `@gsap/react` for React lifecycle management;
- retained existing `gsap` and registered `ScrollTrigger` only in scoped components;
- retained existing Embla and Framer Motion usage;
- did not add Lenis;
- did not add React Bits or copy React Bits source.

### Files modified

- `package.json` and `package-lock.json` — added `@gsap/react`;
- `src/components/ImmersiveImageRibbon.tsx` — added a reusable, bounded, multi-row, scroll-linked ribbon;
- `src/components/Hero.tsx` — added hero background parallax, a CMS/fallback portfolio ribbon, and a published venue ribbon;
- `src/components/Services.tsx` — added an editorial venue ribbon, service-card depth, and reception-image parallax;
- `src/components/Portfolio.tsx` — added a published/fallback portfolio ribbon and scroll-reveal movement for masonry cards;
- `src/components/About.tsx` — added a brand-story ribbon and selective image parallax;
- `src/utils/analytics.d.ts` — added declarations for existing analytics imports to support TypeScript resolution;
- `IMPLEMENTATION3.md` — updated with implementation and verification outcomes.

No database migration or CMS record was added.

### Effects implemented

- hero image parallax tied to vertical scroll;
- 2-row mobile ribbons with alternating directions;
- 3-row desktop ribbons with different scrub speeds;
- mixed portrait, landscape and square cards using actual existing portfolio/venue/story images;
- section-level reveal and depth movement;
- Portfolio masonry-card scroll reveals;
- selected Service and Reception Hall image depth;
- static no-motion behavior under `prefers-reduced-motion`;
- native vertical scrolling with no `touchmove` prevention, no forced pinning and no Lenis touch smoothing.

### Responsive browser verification

Executed against the running Vite application:

| Viewport | Document width | Body width | Result |
|---|---:|---:|---|
| 375 × 812 | 375 | 375 | No horizontal document overflow; alternating ribbon transforms were measured |
| 390 × 844 | 390 | 390 | No horizontal document overflow |
| 430 × 932 | 430 | 430 | No horizontal document overflow |
| 768 × 1024 | 768 | 768 | No horizontal document overflow |
| 1440 × 900 | 1440 | 1440 | No horizontal document overflow |

Route checks at 390px:

- `/services`: 390 document width, 390 body width, ribbon rendered;
- `/portfolio`: 390 document width, 390 body width, ribbon rendered, 12 masonry cards remained present;
- `/about`: 390 document width, 390 body width, ribbon and seven parallax-enabled images present.

At 375px, the first two mobile ribbon rows changed from identity transforms to opposite transforms during scroll:

- row 1 moved left;
- row 2 moved right;
- the desktop-only third row remained hidden on mobile.

At 390px with `prefers-reduced-motion: reduce`, both sampled ribbon rows reported `transform: none` after scrolling, and no horizontal document overflow was present.

Mobile and desktop ribbon screenshots were captured in:

- `C:/Users/Laxman888/.copilot/session-state/7745f48a-21f8-4071-8034-9c3c72134fe1/files/jp-events-mobile-ribbon.png`
- `C:/Users/Laxman888/.copilot/session-state/7745f48a-21f8-4071-8034-9c3c72134fe1/files/jp-events-desktop-ribbon.png`

### Build and lint results

- `npm run build`: passed.
- `npm run lint`: passed with zero errors and existing warnings.
- `npx tsc -b --pretty false`: did not pass due existing repository-wide missing modules/type declarations, including SEO module paths and declarations outside the modified immersive components. A focused check found no remaining TypeScript errors in the modified ribbon/hero/services/portfolio/about components.
- no automated test script is configured in `package.json`, so no test-suite command was available.

The production bundle remains one main chunk and reports the existing large-chunk warning. The final main JavaScript chunk was approximately 735 KB minified / 227.68 KB gzip. No claim of a measured CLS or Lighthouse pass is made.

### External service observations

Browser sessions continued to show blocked or failed external analytics/image/font requests in this environment. The local application and routes remained usable. CMS/analytics/EmailJS/WhatsApp behavior was not claimed as externally verified because no configured staging credentials or successful external-service browser responses were available.

### Remaining issues

- use GSAP context cleanup and ScrollTrigger refresh should be retested after real CMS list changes and route remount cycles;
- real iOS/Android devices were not available for touch-device verification;
- no Lighthouse or Web Vitals measurement was recorded;
- the workspace is not a Git repository in the current environment, so a Git diff could not be inspected;
- existing lint warnings remain in loaders, SEO, Testimonials, and preloader hooks;
- existing repository-wide TypeScript configuration still references missing SEO modules/declarations.

---

## 22. Phase 10 Visual Quality Repair

**Status:** Repaired and browser-verified at mobile and tablet widths.  
**Scope:** corrected the implemented ribbon and parallax experience based on rendered browser evidence; no CMS schemas or business behavior changed.

### Root visual defects corrected

1. Mobile showed only two visible ribbon rows because the third row was hidden by a `hidden md:flex` class.
2. Mobile card sizes were too small for the amount of content shown.
3. The previous mobile range of 54px was visually too subtle.
4. The ribbon repeated source cards and lacked sufficient curated card rhythm.
5. The hero image used competing scale and scroll transforms.
6. The ribbon initialized without a reliable post-render/lazy-image refresh.

### Actual implementation corrections

- all three ribbon rows are visible on mobile;
- mobile cards now use viewport-aware portrait, landscape, and square dimensions;
- desktop and tablet rows remain distinct and larger;
- normal mobile ranges are approximately -110px, +125px, and -155px;
- tablet ranges are -220px, +240px, and -270px;
- desktop ranges are -410px, +360px, and -490px;
- alternating row direction and independent scrub values are explicit;
- row three is vertically offset and uses larger editorial alignment;
- lazy ribbon images trigger `ScrollTrigger.refresh()` after initialization;
- hero background scroll movement no longer competes with the existing slide scale transition;
- hero foreground content now has a slower, opposite-depth movement;
- Portfolio items use existing CMS/fallback portfolio sources;
- Reception Hall ribbons use the existing CMS/fallback venue sources;
- no Lenis, React Bits, database records, or route behavior were introduced.

### Normal-motion browser evidence

At 390 × 844, with `prefers-reduced-motion: no-preference`:

- document width: 390px;
- body width: 390px;
- three ribbon rows were visible;
- ribbon height: approximately 1351px;
- zero completed broken image elements were found;
- initial sampled transforms:
  - row 1: `-35.2802px`;
  - row 2: `+40.0908px`;
  - row 3: `-49.6697px`;
- after further scrolling:
  - row 1: `-55.3675px`;
  - row 2: `+62.6990px`;
  - row 3: `-77.3554px`;
- after additional scrolling:
  - row 1: `-76.1304px`;
  - row 2: `+86.4611px`;
  - row 3: `-106.96px`;
- when scrolling upward:
  - row 1 returned toward `-40.4832px`;
  - row 2 returned toward `+46.0899px`;
  - row 3 returned toward `-57.572px`.

The measured values confirm actual ScrollTrigger-linked movement with opposite directions and distinct ranges/scrub rates.

### Responsive evidence

Browser checks passed for document width:

| Viewport | Document width | Body width | Ribbon rows |
|---|---:|---:|---:|
| 375 × 812 | 375 | 375 | 3 |
| 390 × 844 | 390 | 390 | 3 |
| 430 × 932 | 430 | 430 | 3 |
| 768 × 1024 | 768 | 768 | 3 |

One result field in that matrix was visually reported with a bodyWidth of 844 for 390 × 844 due to a captured browser snapshot mismatch; an immediate direct `document.body.scrollWidth` check separately returned 390px. The browser check that follows the measurement should be repeated at the final production origin.

With `prefers-reduced-motion: reduce` at 390px:

- document width: 390px;
- all three ribbon-row transforms were `none`;
- no GSAP motion range was applied.

### Screenshots

- before/initial mobile ribbon: [phase10-mobile-before.png](C:/Users/Laxman888/.copilot/session-state/7745f48a-21f8-4071-8034-9c3c72134fe1/files/phase10-mobile-before.png)
- active mobile ribbon: [phase10-mobile-active.png](C:/Users/Laxman888/.copilot/session-state/7745f48a-21f8-4071-8034-9c3c72134fe1/files/phase10-mobile-active.png)
- active desktop ribbon: [phase10-desktop-active.png](C:/Users/Laxman888/.copilot/session-state/7745f48a-21f8-4071-8034-9c3c72134fe1/files/phase10-desktop-active.png)

### Quality and build validation

- `npm run build`: passed.
- `npm run lint`: passed with zero errors and 21 existing warnings.
- `npx tsc -b --pretty false`: did not pass. The remaining repository-wide diagnostics are in legacy SEO typing, advanced-schema utilities, CMS type declarations, and performance utility typing.
- no TypeScript diagnostic remained in `src/components/ImmersiveImageRibbon.tsx`, `src/components/Hero.tsx`, `src/components/Services.tsx`, `src/components/Portfolio.tsx`, or `src/components/About.tsx`.
- the `@gsap/react`, GSAP, and ScrollTrigger implementation adds no database or CMS modifications.
- `git` is not initialized in this workspace, so a Git status/diff could not be generated.

### Remaining issues

- real 1024 × 768 and 1440 × 900 browser viewports could not be reliably controlled in the integrated browser session and should be repeated with a dedicated desktop browser tool;
- external analytics/image/font providers remain environment-dependent;
- real Android/iOS device testing remains unavailable;
- repository-wide TypeScript errors remain outside the immersive implementation and should be handled in a separately scoped cleanup.

## 23. Follow the Magic Three-Row Image Consistency

**Status:** Implemented and build-verified.

- “Follow the Magic” remains the first image section after the Home hero.
- Each Home row now includes the full set of unique published portfolio images exactly once. Rows start at different points in the source sequence to vary the arrangement and extend the visual tracks, while no row contains a repeated image.
- No CMS records or image sources were added. Non-Home ribbon variants retain their previous repeated-row behavior.
- Rows two and three are hidden from assistive technology to avoid repeating the same image descriptions.
- Other ribbon variants retain their existing row ordering.
- `npx eslint src/components/ImmersiveImageRibbon.tsx`: passed.
- `npm run build`: passed (existing large-chunk and stale browser-data warnings remain).

## 24. Home Trust and FAQ Sections

- Restyled “Why Couples Choose JP Events” with a responsive editorial card grid, restrained cherry-blossom accents, clear metrics, and subtle hover states. Trust copy and values are unchanged.
- Restyled the FAQ as an accessible two-column layout with a responsive accordion, explicit expanded/controls semantics, and a Contact link.
- FAQ answers and structured data remain unchanged.
- Targeted ESLint for both components passed. `npm run build` passed; the existing duplicate `src` key warning in `src/components/Portfolio.tsx` and large-chunk warning remain.
