# JP Events — Premium UI Enhancement Implementation Plan

**Status:** Planning only. This document records the current implementation and a proposed, controlled enhancement phase. No application code, assets, configuration, or dependencies were changed while preparing it.

**Scope:** Improve the existing JP Events site's premium visual polish, carousel usability, motion accessibility, responsive behavior, and performance without rebuilding the site or changing its routes, content model, integrations, or business behavior.

## 1. Executive Summary

The site already has a coherent wedding/event aesthetic, Cherry Blossom Pink styling, custom motion, several carousel-like experiences, and an editable CMS for published venues and portfolio content. The next phase should refine and unify these existing components rather than introduce new pages or redesign the site.

The most concrete issues observed are a cramped/wrapping desktop navigation at a 768px viewport and horizontal overflow of approximately 8px at 768px and 390px. The homepage hero and two venue displays rotate manually selected/automated slides through separate implementations. The portfolio is a masonry/grid with filtering and a lightbox, not a carousel, and should remain so.

**Recommendation:** Retain React, Tailwind, and the existing Framer Motion package. If touch-drag support and a shared carousel interaction are approved, use Embla Carousel as the single carousel library for the hero and venue slides, with existing JSX/CSS controlling the branded appearance. Do not apply a carousel library to the masonry portfolio or add a new animation library. Add packages only in the implementation phase and only after checking stable versions, React 18 compatibility, bundle impact, and the lockfile.

## 2. Project Architecture Overview

- **Application:** React 18 and TypeScript, built with Vite 5.
- **Navigation:** React Router 6. Public routes are composed in `src/App.tsx`; admin routes under `/admin/*` are isolated from the public header/footer.
- **Styling:** Tailwind CSS 3.4, `tailwind.config.js`, and a minimal `src/index.css`. The existing `champagne` and `rosegold` token names map to the pink palette; do not infer active gold styling from those names alone.
- **Motion:** `framer-motion` 12 and GSAP are already declared dependencies. Components also use CSS transitions and keyframe animation.
- **Content:** Published venue and portfolio content is read through the shared CMS hook and repository (`src/hooks/usePublishedContent.ts`, `src/services/cmsRepository.ts`, `src/types/cms.ts`). Preserve the existing configured/unconfigured behavior and the Supabase security boundary.
- **Public composition:** `src/pages/Home.tsx` composes `Hero`, `SuperTrustRocket`, `SchemaTestimonials`, and schema components. `src/pages/Services.tsx` renders `src/components/Services.tsx`; `src/pages/Portfolio.tsx` renders `src/components/Portfolio.tsx`.
- **Other public surfaces:** `src/components/Header.tsx` owns desktop/mobile public navigation; `src/components/Footer.tsx` owns the watercolor-backed footer. Admin UI and publishing logic are in `src/pages/AdminCms.tsx`.
- **Scripts:** `npm run dev`, `npm run build`, `npm run lint`, and `npm run preview`; no test script is defined in `package.json`.

For CMS implementation decisions and known deployment limitations, refer to [IMPLEMENTATION1.md](./IMPLEMENTATION1.md). For branding/contact/theme decisions, refer to [IMPLEMENTATION.md](./IMPLEMENTATION.md).

## 3. Enhancement Goals

1. Retain the current brand, page structure, copy, navigation destinations, venue/portfolio data, and existing calls to action.
2. Make carousels easier to use with touch, keyboard, screen readers, and reduced-motion preferences.
3. Address observed tablet/mobile fit and horizontal overflow without shifting existing desktop layouts.
4. Keep animations purposeful, consistent, and performant; do not add decorative motion merely to increase animation count.
5. Improve image-loading and media behavior without changing stored CMS media URLs or upload/publishing semantics.
6. Deliver measurable before/after checks and explicitly distinguish browser-verified behavior from unavailable external services.

## 4. Non-Goals and Protected Behavior

- No rebuild, framework change, package upgrades, new route, content rewrite, or broad restyling.
- No modification to CMS schemas, RLS, authentication/MFA, Edge Functions, importer, EmailJS, analytics, contact/WhatsApp actions, or external domains.
- No new sample venue, portfolio, testimonial, category, social account, or asset.
- No conversion of the portfolio masonry/grid to a carousel; preserve its filtering, search, grid toggle, gallery, and item navigation.
- No removal of existing animations, parallax, videos, galleries, or mobile navigation.
- No changes to the admin editor except where a demonstrated shared layout/accessibility issue requires a separately approved follow-up.

## 5. Existing Visual Baseline

The running local site was reviewed in the browser at 1440×900, 768×1024, and 390×844, and the Services and Portfolio routes were opened.

- **1440px:** Header and hero render together without apparent wrapping. The hero shows image crossfade, overlay text, CTA controls, slide arrows, dots, and a progress indicator.
- **768px:** The header logo wraps to two lines; navigation labels including “About Us” and “Admin Login” wrap. Measured document body width was 776px, 8px wider than the viewport.
- **390px:** The compact header shows the JP Events wordmark, search, and menu. Hero arrows are hidden; CTAs and dots remain visible, and the floating WhatsApp control is present. Measured body width was 398px, also 8px wider than the viewport.
- **Services:** The Premium Reception Halls area shows a venue image with arrow controls beside a details panel. The page also contains service/package content outside that carousel.
- **Portfolio:** The first viewport shows filters, search, masonry/grid controls, and a masonry-oriented portfolio; this is not a horizontal carousel.

These are baseline observations from one local browser session, not a comprehensive device/browser matrix. Screenshots were inspected in the browser and were not saved as project files. External tracking requests were observed failing in the browser; this plan does not propose changing analytics.

## 6. Current Routes and Layouts to Preserve

Public paths declared in `src/App.tsx` are `/`, `/about`, `/services`, `/portfolio`, `/invitations`, `/blog`, `/blog/:slug`, `/contact`, and `/developer`. Public routes use the shared header and footer. `/admin/*` renders the admin application without the public chrome.

Validate direct loads and in-app navigation for all listed routes. Preserve `ScrollToTop`, Helmet metadata, analytics page-view behavior, and route-specific page content.

## 7. Carousel and Slider Inventory

| Surface | Current implementation and behavior | Planned treatment |
|---|---|---|
| Homepage hero | `HeroSection` in `src/components/Hero.tsx`; three external background images; opacity crossfade; 5-second interval; previous/next controls are hidden below `sm`; dots and progress indicator. | Preserve the full-bleed, crossfade, text, dimensions, and CTA treatment. Add touch interaction and accessible pause/keyboard controls; expose arrows at a practical mobile size if they do not obscure content. Respect reduced motion. |
| Homepage Reception Halls | `WeddingSections` in `src/components/Hero.tsx`; published venues via `usePublishedVenues()`, one active venue at a time, approximately 5-second rotation, arrows/dots, details, price, and WhatsApp inquiry. | Retain CMS source, inquiry payload, text and layout; unify slide navigation only after verifying CMS loading, empty/error states, and update behavior. |
| Services Reception Halls | `src/components/Services.tsx`; a second view of shared published venues with image, arrows/dots, venue details/amenities/price, and booking/inquiry actions. No autoplay was found in the current carousel logic. | Preserve its service-page details layout and existing manual navigation. Do not make it autoplay merely to match the homepage. |
| Testimonials | `SchemaTestimonials` in `src/components/SchemaTestimonials.tsx` is used by `Home.tsx`; it has a manually controlled testimonial card and schema output. `src/components/Testimonials.tsx` has a separate timed rotator but is not referenced by the active homepage composition. | Improve controls/semantics on the active component without changing testimonial text, schema, or adding autoplay. Do not treat the unreferenced component as active; only update it if a future route starts using it. |
| Video highlights | A section in `Hero.tsx` labelled “Portfolio Carousel” renders a four-column video grid; it is not a carousel. Videos currently autoplay, loop, and are muted. | Keep its grid and media count; investigate poster/lazy-loading and mobile data cost without multiplying playback or removing existing content. |
| Portfolio | `src/components/Portfolio.tsx` retains masonry/grid presentation, filters/search, cards, and modal/lightbox with gallery thumbnails and previous/next portfolio item controls. | Keep masonry/grid. Improve modal keyboard/focus behavior and loading only if implementation inspection confirms a gap; do not replace with a slider. |

## 8. Hero Carousel Enhancement Plan

- Keep the existing 3-slide sequence and visual crossfade; preserve slide image URLs and text/CTA overlay.
- Add touch/drag navigation without conflicting with vertical page scrolling, links, or buttons. Confirm swipe direction, threshold, and pointer cancellation on real mobile/touch emulation.
- Keep manual next/previous and slide selection. Give each control an explicit accessible name and visible focus state.
- Add a user-operable pause/resume control if automatic movement continues. Stop rotation on focus or pointer interaction and do not restart unexpectedly while a user is interacting.
- Honor `prefers-reduced-motion`: do not auto-advance and use a non-sliding/brief opacity change or static first slide. Keep CTA and slide content available.
- Maintain readable overlays at each breakpoint; preserve crop focal points and image sizing. Do not put interactive controls inside a draggable surface in a way that captures their click/tap.
- Use only the three existing images; avoid downloading the full slide set eagerly if it harms mobile load. Keep the initial/likely next image prioritized and load later slides as appropriate.

## 9. Venue Carousel Enhancement Plan

- Keep the published venue source and current empty/loading/error behavior from the shared hook/repository.
- Preserve the distinction between the homepage inquiry carousel and the Services details presentation; unify only low-level slide state/controls if this does not force both pages into one layout.
- Retain title, description, capacity, price, amenities, image, and all current booking/WhatsApp handlers. Verify that a slide change cannot leave the inquiry button referring to a different venue than the visible card.
- Keep the Services carousel manual unless product owners explicitly request autoplay. If homepage rotation remains, add an effective pause control and suspend while focused/hovered.
- Handle one venue, multiple venues, no published venues, delayed CMS response, and a changed venue list without invalid active indexes or stale content.
- Preserve existing category registry and data. Do not create categories or demo records as part of the enhancement.

## 10. Testimonial and Portfolio Media Plan

- The active `SchemaTestimonials` control is manual. Add region/slide semantics, descriptive labels such as “Show testimonial 2 of 3,” and suitable focus visibility. Maintain its review JSON-LD structure and supplied text.
- Keep the unused `Testimonials.tsx` separate in scope; do not silently swap components or alter whether it is rendered.
- For the video highlight grid, review explicit poster images, `preload="none"`/metadata strategy, viewport-triggered playback if safe, and the behavior when autoplay is blocked. Maintain `muted` and `playsInline`; do not introduce sound or additional video requests.
- For portfolio images and lightbox, preserve CMS-backed gallery order, current item navigation, search, filters, and grid/masonry modes. Add keyboard Escape/arrow handling, focus containment/return, and informative image alternatives only after checking the current modal implementation.
- Do not add a portfolio carousel or duplicate video/image elements to simulate one.

## 11. Carousel Library Comparison

| Option | Benefits for this project | Trade-offs and cautions |
|---|---|---|
| Existing custom React state/CSS | No dependency or package/lockfile changes; easiest to preserve current styles and crossfade. | Duplicated timer/index logic; no existing drag/swipe; accessibility and timer edge cases must be implemented and maintained independently. |
| **Embla Carousel (recommended, conditional)** | Small, dependency-free core; React integration; drag/swipe and API-driven controls; highly customizable so current custom UI can remain. MIT license. Fits the existing single-slide, branded layouts. | React adapter and autoplay plugin are separate packages if used; no built-in visual fade preset, so keep/implement the current CSS fade carefully. Accessibility still requires authored labels, focus handling, pause behavior, and reduced-motion policy. Stable version must be chosen deliberately; official docs have shown a newer v9 release candidate alongside v8 stable documentation. |
| Swiper | Official React components; touch controls, breakpoints, navigation, pagination, A11y, autoplay, fade, thumbs, and many optional modules. MIT license. Offers a ready-made fade effect that maps to the hero. | Broader feature surface and CSS; exact package/bundle impact depends on imported modules and CSS. Avoid importing the all-module bundle. More functionality than these mostly one-slide custom experiences require. |
| Motion / current `framer-motion` | Already installed and used; useful for targeted enter/exit, gestures, and reduced-motion adaptation. MIT license. | It is not a dedicated carousel engine; replacing carousel state/swipe with motion drag would require custom snapping, bounds, keyboard, and pagination. Avoid a second motion library and avoid using animation to solve layout. |
| React Bits | Inspiration for polished visual patterns and interaction concepts. | Its repository describes an MIT license with Commons Clause restrictions; it is not a default source for copied production code. Do not copy components/assets without owner/legal review of the applicable license. |

Research links: [Embla React documentation](https://www.embla-carousel.com/docs/get-started/react/), [Embla repository and license](https://github.com/davidjerleke/embla-carousel), [Swiper React documentation](https://swiperjs.com/react), [Swiper API](https://swiperjs.com/swiper-api), [Motion gesture documentation](https://motion.dev/docs/react-gestures), [Motion reduced-motion hook](https://motion.dev/docs/react-use-reduced-motion), [Motion repository](https://github.com/motiondivision/motion), and [React Bits repository](https://github.com/DavidHDev/react-bits). Recheck official docs, package versions, and license terms at implementation time.

## 12. Recommended Carousel Technology

Use **Embla Carousel** as the one primary carousel library for the active hero and venue slides only if the implementation phase confirms that swipe support and consistent carousel mechanics justify the dependency. Keep the existing visual shell, custom arrows/dots, CSS fade, text layout, colors, and Framer Motion elsewhere. The likely minimum is `embla-carousel-react`; use `embla-carousel-autoplay` only if its pause/focus/reduced-motion behavior can be configured to meet this plan. Do not add Swiper, Keen Slider, Slick, or a second carousel package.

If dependency review or a faithful fade implementation shows Embla would increase risk, retain the current custom implementation and centralize only the required index/timer/keyboard/pause behavior; document that decision before coding. Do not use a version labeled release-candidate in production without explicit approval.

## 13. Dependency and Bundle Impact

- Current `package.json` includes React 18, `framer-motion` 12, GSAP, Tailwind, and existing UI utilities; it contains neither Embla nor Swiper and has no test script.
- Conditional Embla adoption changes `package.json` and `package-lock.json`; choose compatible stable releases, inspect transitive dependencies, and test the Vite production build and bundle output.
- Do not add an autoplay plugin unless needed; do not install React Bits or another animation package.
- The previous build is reported in `IMPLEMENTATION1.md` as having an existing >500 kB chunk warning. Record the current baseline before deciding whether the library meaningfully changes the built assets.
- Do not make unrelated dependency upgrades or run automatic audit fixes within this phase.

## 14. Visual Direction and Theme Tokens

Continue the existing premium Cherry Blossom Pink identity. Use the existing design tokens and components rather than introducing a parallel palette. Prioritize soft blush and warm white surfaces, restrained deep rose accents, readable dark typography, and the established watercolor footer. Keep text contrast, overlay readability, and button/focus visibility; do not turn every surface pink or add excessive gradients, glow, or shadow.

Before changing a color or class, inspect the resolved Tailwind token and its active use. Token names such as `champagne` may already resolve to the pink palette and should not be renamed or globally replaced solely based on their names.

## 15. Responsive Layout and Navigation

- Fix measured horizontal overflow at 390px and 768px; identify the element causing the 8px excess rather than hiding overflow globally.
- At tablet widths, prevent header wordmark and navigation labels from wrapping. Review the existing `Header.tsx` breakpoint transition and switch to the established compact/mobile menu before available width becomes insufficient.
- Preserve all menu items, search, WhatsApp, admin-login/admin-dashboard/logout states, active route indication, and menu keyboard behavior.
- Keep the hero image/card frame within the viewport, maintain useful text sizes/line lengths, and keep CTA targets comfortable on touch screens.
- Check services side-by-side image/details layout at breakpoint boundaries and stack it cleanly when needed; preserve the existing content order and functionality.
- Preserve portfolio grid/masonry controls and filters; ensure the search field and filter chips can wrap or scroll accessibly without page-level overflow.
- Test at 320px, 360px, 390px, 640px, 768px, 1024px, 1280px, and 1440px, including intermediate widths around Tailwind breakpoints.

## 16. Motion and Transition Principles

- Keep existing parallax, entrance animation, hover effects, fades, transitions, and video behavior unless a specific accessibility/performance issue is demonstrated.
- Prefer transform and opacity for motion; avoid animating layout-affecting width/height/top/left where an equivalent transform is practical.
- Maintain short, consistent transitions for controls and avoid adding repeated motion that distracts from event imagery or text.
- Ensure hover-only affordances also work on keyboard and touch.
- Use the already-installed Framer Motion `useReducedMotion` where appropriate; also honor CSS `prefers-reduced-motion` for CSS-only keyframes. Do not introduce a global `animation: none` rule that removes useful state feedback.
- Reduced-motion mode must prevent automatic hero movement and avoid scroll/parallax effects that move content unexpectedly.

## 17. Accessibility Requirements

- Meet WCAG 2.2 AA expectations for keyboard operation, contrast, focus visibility, target size, and content reflow.
- Provide semantic carousel/slide regions and descriptive control names. Use real `<button>` controls; expose current slide state and avoid announcing every automatic transition continuously.
- Provide a visible pause/resume affordance for any continuing auto-rotation; stop or pause on keyboard focus and pointer interaction. Ensure controls remain operable without dragging.
- Respect `prefers-reduced-motion` for autoplay, crossfade/slide transitions, parallax, and decorative CSS motion.
- Maintain keyboard access and sensible focus order for navigation, search, venue inquiries, portfolio filters, and the image lightbox. For modal/lightbox changes, verify focus enters, stays within, and returns to the opener; Escape closes when appropriate.
- Maintain meaningful alt text for content images and empty alt text for decorative imagery. Do not invent alt text or change CMS media data without content-owner verification.
- Recheck text and controls over hero photos and the footer image at mobile and desktop sizes.

## 18. Image, Video, and Loading Performance

- Inventory existing external images and videos; preserve current URLs and CMS media references.
- Prioritize only the initial hero visual; avoid preloading every carousel frame. Verify whether an existing preload is used and correct only directly related preload hints.
- Use native lazy loading for below-the-fold images where it does not affect the initial viewport, and reserve intrinsic/aspect-ratio space to limit layout shift.
- Prefer responsive image widths/modern formats only where the image host supports them and the URL/data contract remains intact; do not rewrite stored CMS media URLs speculatively.
- Give videos poster frames where available, defer off-screen resources if playback behavior can be preserved, and avoid multiple simultaneous video decodes on mobile. Do not invent or generate owner assets.
- Measure before/after transfer size, image request count, LCP, CLS, and interaction latency under the same test conditions. If no performance harness is available, mark metrics unavailable instead of estimating.

## 19. Search, SEO, and Content Preservation

Preserve Helmet title/meta behavior, JSON-LD, canonical/domain settings, route slugs, analytics names, page text, testimonial content, and CMS fields. Re-check headings and structured data after any component changes. Do not alter SEO content or business details as part of an interaction/layout enhancement unless a separate owner-approved task identifies a defect.

## 20. CMS and External Integration Guardrails

- Public venue/portfolio components must continue using the shared hook/repository and current published-only access behavior.
- Keep draft visibility, admin-only operations, auth/MFA, RLS, storage paths, publication workflow, and importer unchanged.
- Test both the local fallback/unconfigured state and configured CMS loading/empty/error states where credentials/environments are available.
- Do not expose environment values or add client-side secrets.
- No live Supabase project, production media, external analytics, or external account behavior is claimed as locally verifiable. Use owner-provided staging credentials only through approved local environment configuration.

## 21. Files Likely to Change During an Approved Implementation

| File | Expected scope |
|---|---|
| `src/components/Header.tsx` | Tablet breakpoint/fit and verified responsive overflow; preserve nav, auth-aware actions, and mobile menu behavior. |
| `src/components/Hero.tsx` | Hero carousel touch/accessibility/pause/reduced-motion; homepage venue slide mechanics only if shared implementation is justified; no content or CMS contract changes. |
| `src/components/Services.tsx` | Venue carousel accessibility/touch behavior and responsive image/details fit; preserve manual-only behavior and actions. |
| `src/components/SchemaTestimonials.tsx` | Active testimonial controls/semantics only; preserve testimonial content and schema output. |
| `src/components/Portfolio.tsx` | Only verified lightbox keyboard/focus/accessibility or layout overflow corrections; preserve masonry/grid, filters, CMS data, and gallery. |
| `src/index.css` | Minimal reduced-motion rules only if component-level handling is insufficient; avoid broad overrides. |
| `tailwind.config.js` | Only if a confirmed missing shared breakpoint/token is necessary; current token mappings must be inspected before alteration. |
| `package.json`, `package-lock.json` | Conditional Embla dependency only after approved compatibility/license/bundle review. |

Do not modify `src/pages/AdminCms.tsx`, CMS migrations/functions/services, environment files, assets, or other routes without a demonstrated and separately scoped reason. This is a forecast, not an authorization to change these files in the planning phase.

## 22. Existing Files and Features to Leave Untouched

Keep all route declarations and page order in `src/App.tsx`, business and contact links, form behavior, analytics/SEO configuration, CMS data contracts and policies, Supabase setup, email templates, image/video source URLs, footer image URL, existing copy, and unrelated page sections unchanged. Keep `src/components/Testimonials.tsx` unused unless its active usage changes in a separately approved task. Do not rename the legacy project/package or color tokens as cleanup.

## 23. Implementation Order

1. Re-read this plan and both existing implementation documents; inspect the current working tree and preserve all user changes.
2. Capture a baseline for `npm run lint`, `npm run build`, route smoke tests, bundle output, and desktop/tablet/mobile screenshots. Record existing warnings separately.
3. Reproduce the 8px overflow and 768px header wrapping; identify the exact DOM elements responsible.
4. Make the smallest responsive header/layout correction and remeasure all listed widths.
5. Implement carousel accessibility/pause/reduced-motion behavior on active components while preserving current routes, data, and visual design.
6. If approved, add only stable Embla packages, update the lockfile, and migrate one active carousel at a time. Compare the rendered fade and interactions to baseline before migrating the next.
7. Improve lightbox keyboard/focus behavior only after auditing current behavior; avoid changing gallery data or portfolio layout.
8. Apply image/video loading changes only where measurement and preserved playback semantics support them.
9. Run targeted lint/build and browser checks after each coherent change; address only introduced failures and tightly related issues.
10. Run the full route, interaction, accessibility, reduced-motion, responsive, CMS-state, and performance checks below.
11. Review the final diff for unrelated changes and update this document with files actually changed, evidence, skipped work, and unresolved external verification.

## 24. Regression and Verification Checklist

### Routes and core interactions

- Direct-load every public route and `/admin/login`; confirm no route or layout regressions.
- Confirm desktop/mobile navigation, search, WhatsApp links, admin login/dashboard/logout visibility, and browser back/forward behavior remain intact.
- Confirm hero CTAs, slide arrows/dots/pause, venue inquiries, Services venue actions, and portfolio controls work.
- Confirm CMS-published venue ordering/content updates are reflected in both venue surfaces; test empty, one-item, multiple-item, loading, and error states.
- Confirm portfolio masonry/grid, filter/search, gallery thumbnails, previous/next, modal dismissal, and focus behavior.
- Confirm forms, validation, API calls, analytics, and business contact actions are unchanged.

### Layout and accessibility

- At 320, 360, 390, 640, 768, 1024, 1280, and 1440px, check for document overflow, clipped controls, wrapping, overlaps, and readable overlays.
- Verify keyboard-only operation, visible focus, meaningful labels, screen-reader announcement behavior, reduced-motion mode, and pause controls.
- Test touch swipe without blocking vertical scrolling or CTA clicks.
- Confirm no autoplay occurs under reduced motion and that active carousel motion pauses during user interaction.

### Assets, stability, and build

- Check for failed image/video requests, layout shift, duplicate media loading, console errors, React key warnings, and broken imports.
- Run `npm run lint` and `npm run build`; compare warnings with the documented baseline.
- Compare production bundle/chunks and relevant performance metrics against the baseline. Do not claim a metric passed if no measurement tool/data was available.
- Run a real configured CMS smoke test on staging if authorized; otherwise report it as unverified, not passed.

## 25. Performance and Quality Acceptance Criteria

- No new console/runtime errors, broken assets, imports, or route regressions.
- No horizontal scrolling at the agreed mobile/tablet viewport set, unless a specific component intentionally uses contained horizontal scrolling.
- Existing layout and content remain recognizable at desktop; the tablet header no longer wraps unintentionally.
- Existing hero crossfade, carousel controls, CMS venue data/actions, portfolio masonry/lightbox, footer, and mobile navigation remain functional.
- Carousels are keyboard-operable, touch-operable, pauseable when automatically moving, and responsive to reduced-motion preference.
- No new broad dependency, duplicate carousel/animation library, or unjustified performance regression.
- Build and lint pass with any pre-existing warnings distinguished from new warnings. External CMS/analytics behavior is only marked verified if tested in the corresponding environment.

## 26. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Carousel migration changes the crossfade, timing, slide order, or controls | Migrate one carousel at a time; retain custom controls and compare with browser captures. |
| Autoplay timer races with user swipe, focus, hidden tabs, or CMS list changes | Define a single active index source, stop/reset timer on interaction/visibility, and test list replacement and empty states. |
| A carousel library increases bundle size or duplicates existing logic | Compare build chunks; use only one library and the minimum imports; retain custom logic if net value is not demonstrated. |
| Reduced-motion changes remove too much useful feedback | Provide static content and state feedback while disabling only non-essential movement/automatic rotation. |
| Fixing overflow with global clipping hides real content | Locate the offending element and correct its width/position; verify menu, cards, and focus outlines remain reachable. |
| External images/video/CMS are unavailable or slow | Keep current content fallback and URLs; report network/environment limits and test with deterministic local fixtures where available. |
| React Bits licensing is more restrictive than expected | Use as visual inspiration only; do not copy source without license review. |
| Existing project warnings obscure new regressions | Capture baseline diagnostics, compare after edits, and fix only new or directly related issues. |

## 27. Research and Implementation Dependencies

- Confirm an owner-approved stable Embla version and verify React 18 compatibility before installation; the official documentation/release channel can change.
- Confirm whether autoplay is required to remain on each carousel; the plan preserves the current hero/homepage venue auto-advance but adds pause and reduced-motion behavior.
- Confirm browser/device support targets and whether a manual real-device test is available.
- Confirm access to a configured Supabase staging environment for dynamic-content verification. No secret values belong in this document or client code.
- Recheck official library licenses/version docs at implementation time; this document's research is a planning snapshot.
- The project has no defined automated test script. Browser interaction checks and existing lint/build commands are required unless tests are separately introduced with approval.

## 28. Phase Completion and Change Log

### Planning phase completed

- Read the existing rebrand and CMS implementation documents and inspected actual route composition, active carousel implementations, relevant responsive styles, the package manifest, and source files.
- Reviewed the running local site in a browser at desktop, tablet, and mobile sizes; opened Services and Portfolio. Observed the 768px header wrapping and 8px body-width excess at tablet/mobile.
- Compared official Embla, Swiper, Motion, and React Bits documentation/repositories and recorded the conditional recommendation and license caution above.
- Created this document only. **No application source, assets, configuration, dependency manifest, or lockfile was changed for this phase.**

### Implementation status

Implemented and browser-checked. This was a targeted presentation update; routes, business content, venue records, booking/contact actions, CMS contracts, and the portfolio masonry/grid were retained.

#### Changes and files

- `src/components/Header.tsx` — moved the desktop navigation breakpoint to `lg`, tightened desktop spacing, kept the mobile menu and WhatsApp action, and removed the global `body` overflow-clipping workaround.
- `src/components/SchemaTestimonials.tsx` — brought carousel arrows inside their container (the measured 8px overflow source), and improved control labels, focus styling, and image loading.
- `src/components/Hero.tsx` — migrated the three-slide hero and homepage published-venue carousel to Embla; retained the hero crossfade with the Embla Fade plugin; added drag/swipe mechanics, labeled controls/dots, pause/resume, hover/focus pausing, reduced-motion behavior, synchronized CMS venue details, and lazy-loaded below-fold media.
- `src/components/Services.tsx` — migrated the published Reception Halls display to Embla while retaining the existing CMS hook, venue details, manual-only navigation, and WhatsApp action.
- `src/components/Portfolio.tsx` — retained masonry/grid, filters, search, and lightbox; made decorative positions deterministic, reduced hover scaling, honored reduced motion for decorative loops, and lazy-loaded portfolio images.
- `src/components/About.tsx` — repositioned decorative circles so they no longer extend the page beyond a narrow viewport.
- `src/pages/Developer.tsx` — clipped horizontal overflow locally during its existing entrance animations; no site-wide body clipping was added.
- `src/App.tsx`, `src/index.css` — enabled the existing Framer Motion system and selected CSS keyframes to respect the user's reduced-motion preference.
- `package.json`, `package-lock.json` — added `embla-carousel-react` and `embla-carousel-fade` at 8.6.0. No Swiper or animation library was added.
- `IMPLEMENTATION2.md` — recorded implementation and verification results.

No separate category carousel was added: the current Services page has service-card groups and a distinct Reception Halls carousel, not category carousels. Existing published venue filtering remains in `usePublishedVenues()`; no CMS category or data behavior was changed.

#### Verification

- `npm run lint` — passed with 0 errors and 20 warnings in the existing loading/SEO/testimonial/preloader files.
- `npm run build -- --outDir .tmp-build` — passed. The output is 609.53 kB JS (178.25 kB gzip); the existing >500 kB chunk warning remains. Browser-baseline notices for stale Browserslist/browser mapping data also remain.
- `npx tsc -p tsconfig.app.json --noEmit` — still fails with 46 repository diagnostics. The only diagnostic in a changed file is the existing untyped `src/utils/analytics.js` import in `src/App.tsx`; no carousel, layout, or portfolio implementation files report TypeScript errors. The project has no test script in `package.json`.
- Browser screenshots were captured and visually reviewed at 1440, 1024, 768, 390, and 375 px. They are browser outputs, not files saved in the project.
- Direct route smoke checks covered `/`, `/about`, `/services`, `/portfolio`, `/invitations`, `/blog`, `/blog/test-slug`, `/contact`, `/developer`, and `/admin/login` at 1440, 1024, 768, 390, and 375 px (50 route/viewport combinations). All measured document and body widths matched the viewport. Desktop navigation fit at 1024 px; the mobile menu opened and exposed its links at 768 px.
- Browser interaction checks confirmed hero slide navigation wraps from slide 3 to slide 1, a keyboard-activated hero control changes slides, and the mobile menu opens by keyboard at 768 px. The homepage venue controls reflect the selected venue; the Services carousel exposes all 9 available local venues and wraps from venue 9 to venue 1 with matching details and WhatsApp label. The portfolio remains a masonry/grid with no carousel.
- Emulated `prefers-reduced-motion: reduce` prevented hero autoplay for 5.2 seconds and disabled the automatic-rotation control. No page-level JavaScript exceptions were observed in the smoke check.

#### Skipped and unverified

- Real-device touch testing, keyboard-only/screen-reader testing, form submission, video playback, and all lightbox focus/keyboard paths were not exhaustively tested. The browser automation context exposed no touch points (`ontouchstart` false, `maxTouchPoints` 0); simulated mouse drags did not emit pointer-down events, so swipe/drag behavior is implemented through Embla but not claimed as browser-verified.
- The browser reported external-service 401/network failures and an unsupported-script MIME error; these prevent confirmation of live analytics/CMS behavior. No production Supabase, EmailJS, or external account configuration was changed or verified. The local browser rendered the existing set of 9 venue entries; live published-content updates, empty/error states, and a real configured CMS remain unverified.
- No categories, sample content, or records were invented. The optional portfolio lightbox accessibility follow-up and video playback optimization were not changed because they are separate behaviors without a confirmed regression in this task.
- npm reported 22 dependency audit vulnerabilities (1 low, 5 moderate, 16 high); no audit fix or unrelated package upgrade was run.
- This folder has no Git metadata, so a Git diff/status review was unavailable. The temporary `.tmp-build` output was used for production validation and removed after the checks.
