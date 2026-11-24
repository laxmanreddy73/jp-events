# JP Events Rebranding Implementation Plan

## Audit scope and guardrails

This plan was created before implementation. Phase 2 execution and verification results are recorded in Section 11. The audit covered the application source, Vite entry and HTML shell, Tailwind configuration, SEO and sitemap files, the public directory, package scripts, and the advanced environment example. `node_modules/` and generated `dist/` output are not source-of-truth locations and must not be edited.

The requested visible brand is **JP Events**. The requested public phone is **9533950636**, its international telephone form is **`+919533950636`**, and the WhatsApp destination is **`https://wa.me/919533950636`**. Keep the existing layout and business features. Preserve existing message query strings when changing WhatsApp destinations.

## 1. Project Architecture Overview

- **Application:** React 18, TypeScript, Vite 5, React Router 6, Tailwind CSS 3.4, and plain global CSS. `src/main.tsx` mounts `src/App.tsx`; `src/App.tsx` owns the router and renders the shared header, route content, footer, analytics tracker, and scroll-to-top behavior.
- **Routes:** `/`, `/about`, `/services`, `/portfolio`, `/invitations`, `/blog`, `/blog/:slug`, `/contact`, and `/developer` are registered in `src/App.tsx`.
- **Components and pages:** `src/components/` contains the shared navigation, hero, contact, footer, loaders, galleries, service and testimonial content, and SEO/schema helpers. `src/pages/` composes the route-level views.
- **Styles and motion:** Tailwind classes and custom colors are configured in `tailwind.config.js`; `src/index.css` loads Tailwind and has a small mobile rule. Responsive layout is expressed primarily through existing Tailwind breakpoints. Framer Motion, CSS keyframes/transitions, and existing carousel/scroll logic provide motion and interaction. Recolor existing classes and values without changing their structure or animation properties.
- **SEO and business data:** `index.html`, `config/seoConfig.js`, `src/components/SEO/`, `src/components/*Schema.tsx`, and `src/utils/seoHelpers.js`, `schemas.ts`, `seoHelmet.ts`, and `advancedSchemas.js` supply metadata and JSON-LD. `scripts/` generates sitemap/robots files.
- **Contact integrations:** `src/components/Contact.tsx` submits to EmailJS and also opens WhatsApp. `src/utils/whatsappConfig.ts` generates prefilled inquiry messages. The project has no identified in-repository application backend, database, or authentication implementation. Google Analytics and EmailJS are external services.
- **Assets:** `public/` currently contains `robots.txt` only. The logo, favicon/app icons, and many photography/video/OG assets are remote URLs (Postimages and Cloudinary); no local logo or SVG brand asset was found in the audited asset locations.
- **Build/test commands:** `package.json` defines `npm run lint`, `npm run build`, `npm run dev`, and `npm run preview`; it does not define a test script.
- **Other project files:** `app/page.tsx` exists alongside the Vite app, but it is not among the routes mounted by `src/App.tsx`. Treat it as a legacy/alternate entry and do not alter it without first proving it is deployed. An actual `.env` file exists; its secret values were not inspected or copied into this plan. `.env.example.advanced` is the audited environment template.

## 2. Complete Brand Replacement Map

Replace public-visible current business naming with **JP Events**, preserving punctuation and surrounding descriptions as appropriate. Do not globally replace the substring `Suba`; it also occurs in social handles, email/domain identifiers, founder/history text, schema quotations, and generated/legacy metadata.

| Existing text / variation | New text or handling | Exact path | Component / section and considerations |
|---|---|---|---|
| `Suba Designs`, `SUBA DESIGNS`, and logo alt text | `JP Events` (logo alt becomes `JP Events logo`) | `src/components/Header.tsx` | Header logo alternative text; keep the image source pending a replacement logo asset. |
| `Suba Designs`, `Welcome to Suba Designs`, logo alt text | `JP Events` | `src/components/LoadingScreen.tsx`, `src/components/PageLoader.tsx` | Loader copy and logo alt/wordmark; retain loader timing, progress, and animation behavior. |
| `Suba Designs`, `Suba Designs & Decoration(s)` | `JP Events` | `src/components/Hero.tsx`, `src/components/About.tsx`, `src/components/Contact.tsx`, `src/components/FAQSchema.tsx`, `src/components/Footer.tsx`, `src/components/SuperTrustRocket.tsx` | Visible hero/about/contact/footer/FAQ content and the “Why Couples Choose…” section. `About.tsx` includes the factual story explaining the old name’s origin; rewrite that sentence as a founder-approved transition/brand-history statement rather than mechanically changing its meaning. |
| `Suba Designs` within inquiry strings | `JP Events` | `src/components/Portfolio.tsx` | Several prefilled portfolio WhatsApp messages; preserve each message’s remaining event details. |
| `Suba Designs` within FAQs, reviews, and testimonials | Brand update where it is ordinary promotional copy; **keep genuine customer quotations verbatim unless the owner approves editing the quote** | `src/components/Testimonials.tsx`, `src/components/SchemaTestimonials.tsx`, `src/components/FAQSchema.tsx`, `src/components/Contact.tsx`, `index.html` | Visible testimonials and review JSON-LD are customer-attributed content. Update structured business `name` fields, but do not silently rewrite a purported customer statement. Resolve references to the legacy name with the owner before changing testimonial text. |
| `Suba Designs` in blog copy and CTA | `JP Events` in business-authored promotional copy | `src/pages/BlogPost.tsx` | Three blog body/CTA references; preserve article facts and structure. |
| `Suba Designs & Decorations` as a project name | `JP Events` only if the portfolio/project listing is meant to reflect the current brand | `src/pages/Developer.tsx` | This is a developer portfolio project record, not the company site’s customer contact. Confirm whether the developer profile should retain the historical project name. Do not change the developer’s own contact data. |
| Company names, short names, alternate names, site names, authors, copy, title strings, and social handles | Update business-name/SEO wording to JP Events; preserve keyword intent and factual claims | `index.html` | Browser title, descriptions, keywords, author/copyright, Open Graph/Twitter, app titles, analytics business labels, multiple JSON-LD entities and names, and review text. This file contains extensive inline SEO data; edit only brand-related values, not tracking scripts, URLs, or unrelated review copy. |
| `Suba Designs and Decoration(s)`, `Suba Designs`, old organization names | `JP Events` | `config/seoConfig.js` | Site identity, page titles/descriptions, organization and page structured data. Keep service/local SEO wording and URLs unless separately approved. |
| `Suba Designs` and business/event message greetings | `JP Events` | `src/utils/whatsappConfig.ts`, `src/hooks/useSEOTracking.ts` | Prefilled WhatsApp message salutations and analytics business-name values; preserve event names, payload fields, and tracking behavior. |
| Old business names and logo/URL/email references in schema records | Update schema `name` and logo alt/URL only when replacement asset/URL has been supplied | `src/components/LocalBusinessSchema.tsx`, `src/components/ServiceSchema.tsx`, `src/components/SuperTrustRocket.tsx`, `src/components/SEO/SEOHelmet.tsx`, `src/components/SEO/DynamicOGImage.tsx`, `src/components/SEO/AboutPageSEO.tsx`, `src/components/SchemaTestimonials.tsx`, `src/utils/schemas.ts`, `src/utils/seoHelmet.ts`, `src/utils/seoHelpers.js` | Includes LocalBusiness/Service/Organization schema, meta defaults, dynamic OG labels and schema helper defaults. Existing domains, emails, and social URLs are identifiers, not safe text substitutions. |
| Old brand references in site instructions/robots/sitemap-generation | Update comments and generated human-readable brand descriptions to JP Events | `README.md`, `public/robots.txt`, `scripts/generateSitemap.js`, `scripts/generateAdvancedSitemaps.js` | Update source scripts and checked-in robots source, not generated `dist/` output. Preserve crawl directives and URL structure. |
| Generic alternate business identity `Premium Wedding Planners Hyderabad` | Updated to JP Events using the approved Hyderabad location, email, and existing canonical domain | `config/advancedSEOConfig.js` | This configuration still appears unused by the application; its related template values are aligned to avoid publishing conflicting business details if a build tool consumes it. |
| Environment template values `VITE_SITE_NAME` / `VITE_COMPANY_NAME` | Set to JP Events in the example template | `.env.example.advanced` | Also has old sample domain, phone, and email. Update only template values in source control; inspect actual local/deployment environment privately. |

### Brand strings that are identifiers or historical content

- The site now uses `jpevents@gmail.com`, `https://www.instagram.com/jp_events__official/`, and `https://www.facebook.com/jpeventsorganizers/` as supplied by the owner. The existing canonical domain `subadesignsanddecoration.com` remains because no replacement domain was supplied.
- Existing JSON-LD/review copy and testimonials mention the old brand. Treat customer quotations as immutable unless approved; update business/entity names independently.
- `About.tsx` retains the former business name only as part of its claimed history; it does not present the previous city address as the current business location.

## 3. Complete Contact Number Replacement Map

| Existing number / value | Planned replacement | Exact path | Usage and special handling |
|---|---|---|---|
| `+91 90359 48632`, `+919035948632` (also `9035948632`) | Visible `9533950636`; tel `tel:+919533950636`; business phone metadata `+919533950636` | `index.html` | Contact/WhatsApp/business phone metadata and repeated Organization/LocalBusiness schema phone values. Preserve analytics click listeners and schema structure. |
| `+91 90359 48632`, direct `tel:` and `wa.me` destinations | Visible `9533950636`; tel `tel:+919533950636`; WhatsApp `https://wa.me/919533950636` | `src/components/Contact.tsx`, `src/components/Footer.tsx` | Contact cards, click-to-call, direct WhatsApp/social link, and visible business contact. There are two different visible business numbers in `Contact.tsx` (`+91 90359 48632` and `+91 77021 99767`); replace both with the requested number unless one is explicitly identified as a non-business line. |
| `+91 90359 48632` embedded in WhatsApp URLs | Replace only the number portion with `919533950636`; preserve every existing `?text=` message | `src/components/Header.tsx`, `src/components/Process.tsx` | Header and Process CTA direct redirects. |
| `919035948632` owner number | `919533950636` | `src/utils/whatsappConfig.ts` | Central destination used by `openWhatsAppChat` and `openVenueBookingWhatsApp`; keep URL encoding, popup behavior, and form data/message templates unchanged. |
| `+91-9035948632` | `+919533950636` or consistently formatted international phone `+91 95339 50636` in schema data | `src/components/LocalBusinessSchema.tsx`, `src/components/ServiceSchema.tsx`, `src/components/SuperTrustRocket.tsx` | JSON-LD business/service phone values; SuperTrustRocket contains repeated schema fields. |
| `+91 90359 48632`, `+919035948632` | Visible `9533950636`; international form `+919533950636` | `src/components/SEO/DynamicOGImage.tsx`, `src/components/SEO/SEOHelmet.tsx`, `src/utils/ogImageGenerator.js` | OG image text/configuration and business phone meta/schema; update runtime-generated graphics as well as HTML metadata. |
| `+919035948632`, `+91 90359 48632` in page descriptions and titles | `9533950636` for visible SEO wording; international format for schema | `config/seoConfig.js` | Site config and contact-page metadata. Page-level schema consumers such as `src/components/SEO/ContactPageSEO.tsx`, `BlogPageSEO.tsx`, `InvitationsPageSEO.tsx`, `PortfolioPageSEO.tsx`, and `ServicesPageSEO.tsx` read configured business contact data; verify rendered JSON-LD after changing the source config. |
| `+91 98765 43210` | `9533950636` / `+919533950636` only if this advanced SEO configuration is active for this site | `config/advancedSEOConfig.js`, `.env.example.advanced` | Appears as a distinct generic/template business phone and is inconsistent with the primary site configuration. Confirm activation before changing data that might belong to another configuration. |
| `+91 9876543210` | No change proposed | `src/components/Contact.tsx` | This is a customer phone field placeholder, not a business number; do not make a visitor-facing form example look like the company’s number. |
| `+91 8341289738` | No change proposed | `src/pages/Developer.tsx` | This is the named developer’s personal contact and its `tel:` link, not the company’s business number. Keep it unless the owner explicitly identifies it as a business line. |
| `+91-XXXXXXXXXX` / `+91-98765-43210` examples | No change unless verified as emitted business data | `src/utils/schemas.ts`, `src/components/SEO/RichSnippets.jsx` | Schema placeholder and code example, respectively; do not turn template/example values into a public contact. |

The audited primary business number is inconsistent across the application: `90359 48632` is the dominant live-looking number, `77021 99767` is also printed in Contact, and the advanced SEO config uses `98765 43210`. Search for all formats, `tel:` links, `wa.me` destinations, and rendered schema after implementation to ensure no business destination remains stale. Preserve all prefilled WhatsApp copy, including encoded text.

## 4. Gold-to-Pink Theme Replacement Map

Use the requested palette as semantic tokens rather than turning every surface pink:

| Purpose | Proposed value | Intended use |
|---|---|---|
| Primary blossom pink | `#E8A0B8` | Medium decorative fills, selected states, soft branded accents. Pair with dark text (`#382832`), not small white text. |
| Blush | `#F4C6D5` | Pale button/card accents, borders, and gradients; dark text only. |
| Deep rose | `#C6537A` | Brand accents, icons, hover states, and borders. White text at normal sizes needs a darker shade to meet AA. |
| Accessible deep rose for white text | `#A63F63` | Use for small white button/label text contrast when needed. |
| Light pink background | `#FFF1F5` | Select section backgrounds and subtle gradient stops. |
| Soft surface | `#FFFAFC` | Subtle tinted surface; retain white for most cards and content backgrounds. |
| Dark text | `#382832` | Primary text on white, blush, and light-pink backgrounds. |
| White | `#FFFFFF` | Preserve cards, controls, and contrast surfaces. |

Contrast check against white: `#C6537A` is approximately **4.27:1**, slightly below the WCAG AA 4.5:1 normal-text target; `#A63F63` is approximately **5.98:1**. `#382832` against `#FFF1F5` is approximately **12.62:1**. Use dark text over the lighter pinks and retain focus indicators that are clearly visible. Recheck actual text/background pairs after changes, including hover, disabled, focus, and overlay states.

| Existing token/value or style family | Proposed mapping | Exact path(s) | Usage and expected effect |
|---|---|---|---|
| Tailwind `champagne` ramp: `#FEFCF9`, `#FDF8F0`, `#F7E7CE`, `#F1D6AC`, `#E5B568`, `#D99424`, `#C38520`, `#A2701B`, `#825A16`, `#6B4A12` | Map light steps to `#FFFAFC` / `#FFF1F5` / `#F4C6D5`, mid steps to `#E8A0B8`, and strong steps to `#C6537A` / accessible `#A63F63`; keep existing utility names initially if that avoids a wide markup rewrite | `tailwind.config.js` | Central color ramp used by the app. Preserve utility availability and responsive/hover/focus class behavior. |
| Existing Tailwind `blush` ramp and `rosegold` ramp | Align to the requested blossom/blush/deep-rose palette; avoid introducing competing shades or replacing neutral colors | `tailwind.config.js` | These are already pink-oriented tokens. Retune consistently rather than recoloring white, gray, or dark-neutral surfaces. |
| `--wedding-primary: #8b0000`, `--wedding-secondary: #d4af37`, `--wedding-accent: #2f4f4f`, `--wedding-light: #fff8f8`; browser `theme-color` `#8b0000` | Primary/secondary/light become appropriate blossom/rose/light-pink tokens; set browser chrome to a pink token. Preserve accent/dark neutral where it serves contrast rather than making it pink by default | `index.html` | Inline theme variables, metadata, and possible schema/style snippets. Avoid changing domain, preloads, or inline tracking. |
| `#D4AF37`, `#d4af37`, `#FFD700`, `#DAA520`, `#C9A96E`, and `#f1d78b` | Replace gold/metallic accents with deep rose, primary pink, or blush based on role; avoid bright yellow | `src/components/About.tsx`, `src/components/Services.tsx`, `src/components/Process.tsx`, `src/components/Portfolio.tsx`, `src/components/Hero.tsx`, `src/components/Header.tsx`, `src/components/PageLoader.tsx`, `src/components/SuperTrustRocket.tsx` | Local color objects, hard-coded inline colors, utility classes, navigation selected/highlight states, and loader accents. `Hero.tsx` includes an injected `.champagne-500` CSS rule; update it alongside Tailwind. Preserve sizes, hover/active states, and motion. |
| `bg-yellow-*`, `text-yellow-*`, `bg-amber-*`, `text-amber-*`, `border-amber-*`, `from-amber-*`, `to-amber-*`, and `champagne-*` / `rosegold-*` utility use | Use the new semantic palette for accents, borders, focus rings, badges, loaders, and gradient stops. Keep backgrounds mostly white/neutral, using pink sparingly | `src/components/About.tsx`, `src/components/Contact.tsx`, `src/components/Footer.tsx`, `src/components/LoadingScreen.tsx`, `src/components/PageLoader.tsx`, `src/components/FAQSchema.tsx`, `src/components/Blog.tsx`, `src/pages/BlogPost.tsx`, `src/components/InvitationMaker.tsx`, `src/components/Portfolio.tsx`, `src/components/Services.tsx`, `src/components/Process.tsx`, `src/components/Hero.tsx`, `src/components/Header.tsx`, `src/components/SEO/SEOContentAnalyzer.jsx` | Covers card tint, icon/decorative colors, form borders/focus, button states, subtle surfaces, and section gradients. Keep gray text, white cards, layout, and existing utility class behavior. |
| Footer `amber` highlight/hover/border tokens | Map to rose/blush for star, icon, underlines, and hover surfaces; preserve white overlay and gray content | `src/components/Footer.tsx` | Recolor only decoration and interactive accent, not the social-service icon colors unless they are currently being used as brand accents. |
| Contact `amber` overlay, form border/focus, controls, icons, CTA gradient, and “Create Golden Moments” copy | Use pink-toned low-opacity overlay, rose/blush control accents and focus states; keep readable dark/light text. Treat “Golden” as theme-specific marketing copy and rephrase only if appropriate (for example, retain its meaning without claiming a color) | `src/components/Contact.tsx` | Many states on a responsive contact form; preserve EmailJS submission, validation, disabled/success/error styling semantics, and existing dimensions. |
| Blog/blog post `champagne` gradient and `rosegold` links/buttons/focus rings | Use pale blush surface gradients and rose/accessible deep-rose interactive states | `src/components/Blog.tsx`, `src/pages/BlogPost.tsx` | Keep card structure, links, focus rings, and button hover transitions. |
| Gold-themed placeholder/OG palettes: `#D4AF37`, `#FFD700`, `#DAA520`, `#C9A96E` and gradient arrays | Use deep rose/primary pink accents while retaining neutral/dark backgrounds and image dimensions | `config/advancedSEOConfig.js`, `src/utils/ogImageGenerator.js`, `src/components/SEO/DynamicOGImage.tsx`, `src/utils/performanceSEO.ts` | Applies to generated OG images and canvas blur/placeholder imagery, not just CSS. Verify every generated asset; keep layout, caching, and generation behavior. Advanced config activation is unverified. |

Searches also found the phrase “golden” in content. Only copy that explicitly reinforces the old gold theme (not factual editorial copy or customer quotes) should be revised. Do not recolor every image, event photo, social icon, neutral gray, or dark background.

## 5. Asset and Logo Audit

- `public/` contains `robots.txt`, but no repository-owned logo, favicon, SVG, or image asset was found there.
- The header, footer, and both loading screens use the external logo image `https://i.postimg.cc/Pr28Q6Qm/feswgfew-Photoroom.png`; corresponding `alt` text currently says “Suba Designs Logo.” The same image is preloaded in `index.html`.
- `index.html` uses `https://i.postimg.cc/zXM81JdP/sdf.png` for favicon, 16/32 px icons, Apple touch icon, and structured-data logo. The raster image cannot be reliably rebranded with a text replacement or CSS color filter. Obtain a JP Events-approved logo/icon and replace its URL consistently only after supplied/approved.
- Open Graph and Twitter cards refer to a Cloudinary image URL, and page SEO configs reference several Postimages URLs. The application also generates OG/placeholder images through `src/components/SEO/DynamicOGImage.tsx`, `src/utils/ogImageGenerator.js`, and `src/utils/performanceSEO.ts`. Inspect hosted images visually; if old marks or gold artwork are baked into an image, obtain a replacement rather than applying a CSS recolor.
- Inline SVG social icons and the data-URI background in the developer page are not business logo assets. Do not replace them as part of this brand change.

## 6. Files to Modify

The following source-of-truth files are in scope for the implementation phase. A listed file may require only a specific field/text/palette update; this is not permission to refactor it.

| Exact path | Reason |
|---|---|
| `index.html` | Root title/meta/OG/app icon/schema phone and company name, theme color/variables, and inline SEO business labels. |
| `tailwind.config.js` | Existing blush/champagne/rosegold semantic palette used across components. |
| `.env.example.advanced` | Public example values for old site/company name and phone; update example, not secrets. |
| `README.md` | Repository/project title and contact description, if kept current with the product brand. |
| `config/seoConfig.js` | Main site/org name, page SEO text, phone, and structured data. |
| `config/advancedSEOConfig.js` | Conflicting sample business/phone/OG palette; change only after verifying it belongs to this project and is used. |
| `public/robots.txt` | Branded comment; preserve rules and sitemap URLs unless the canonical host is separately confirmed. |
| `scripts/generateSitemap.js`, `scripts/generateAdvancedSitemaps.js` | Site origin and branded comments/output. Preserve generation logic and URL paths. |
| `src/components/Header.tsx` | Logo alt text, direct WhatsApp URL, navigation accent colors. |
| `src/components/Footer.tsx` | Wordmark/copy, contact links/visible number, WhatsApp URL, accent/hover colors. |
| `src/components/Hero.tsx` | Hero brand label/founder label and injected champagne style rule. |
| `src/components/About.tsx` | Brand copy and locally defined gold/champagne colors; origin-history copy needs careful editing. |
| `src/components/Contact.tsx` | Brand/FAQ/form sender names, visible phone numbers and destinations, amber controls/gradients. |
| `src/components/FAQSchema.tsx` | Brand names in FAQ copy and champagne accents. |
| `src/components/LoadingScreen.tsx`, `src/components/PageLoader.tsx` | Loader brand text/logo labels and yellow/gold progress/accent styling. |
| `src/components/Portfolio.tsx` | Brand in WhatsApp templates and gold palette/interactive styling. |
| `src/components/Services.tsx`, `src/components/Process.tsx` | Local gold palette values; Process has a direct prefilled WhatsApp URL/message. |
| `src/components/Blog.tsx`, `src/pages/BlogPost.tsx` | Brand promotional text and champagne/rosegold styling. |
| `src/components/Testimonials.tsx`, `src/components/SchemaTestimonials.tsx` | Legacy company-name mentions in UI/schema. Preserve customer quotes unless approved. |
| `src/components/LocalBusinessSchema.tsx`, `src/components/ServiceSchema.tsx`, `src/components/SuperTrustRocket.tsx` | Business/schema names, phones, logos/social identifiers; preserve schema types and data shape. |
| `src/components/SEO/AboutPageSEO.tsx`, `src/components/SEO/DynamicOGImage.tsx`, `src/components/SEO/SEOHelmet.tsx` | Brand metadata/defaults, generated OG imagery, phone and JSON-LD. |
| `src/utils/seoHelmet.ts`, `src/utils/seoHelpers.js`, `src/utils/schemas.ts` | Shared SEO/schema business name and phone defaults. |
| `src/utils/whatsappConfig.ts` | Central WhatsApp destination and generated message salutations. |
| `src/utils/ogImageGenerator.js`, `src/utils/performanceSEO.ts` | Gold values in generated OG/canvas placeholder visual palettes. |
| `src/hooks/useSEOTracking.ts` | Any business-name analytics labels; keep analytics event keys and payload behavior. |
| `src/components/InvitationMaker.tsx`, `src/components/SEO/SEOContentAnalyzer.jsx` | Search-verified gold/champagne styling; update only the visual tokens found there. |

**Conditional/manual changes:** replace external logo/favicon/OG images only with approved JP Events assets; update social profile URLs, email addresses, canonical domain, and any EmailJS template branding only when the owner supplies the new account details and access. `src/pages/Developer.tsx`, true customer-quote text, schema examples/placeholders, `app/page.tsx`, `.env`, and generated `dist/` files should remain untouched unless their ownership/runtime use is confirmed.

## 7. Files and Features That Must Remain Untouched

- Do not alter route registration or route behavior in `src/App.tsx`, React Router, navigation destinations, or page/section order.
- Preserve header mobile-menu/search/dropdown behavior, sticky/scroll transitions, focus behavior, and all current responsive breakpoints.
- Preserve image/video galleries, portfolio filters/lightbox/likes, carousel state/timing, scroll effects, loading/preload flows, modal behavior, animations, parallax, hover scaling, and transitions. Only recolor related style declarations/classes.
- Preserve contact form fields, validation, submit/reset states, EmailJS service/template IDs and parameter names, email recipients, and WhatsApp message contents except for changing the destination number and approved brand greeting.
- Preserve Google Analytics IDs, analytics scripts/event names, cookie/consent behavior, outbound-link tracking, JSON-LD types/shapes, sitemap paths/crawl rules, and all SEO functionality not directly related to brand/contact/palette values.
- Do not change the developer’s personal details, historical founder facts, genuine testimonial wording, unrelated blog facts, event imagery, external service identities, or account URLs based on guesses.
- Do not change dependencies, package scripts, frameworks, backend behavior, or generated `dist/` artifacts.
- Keep the mostly white/neutral surface system. Apply pink intentionally to brand accents and selected backgrounds; do not turn the entire site into pink.

## 8. Regression and Verification Checklist

- [ ] `npm run lint` completes without new errors.
- [ ] `npm run build` succeeds; no missing Tailwind classes, broken imports, or TypeScript errors.
- [ ] Confirm every route in `src/App.tsx` still loads and has its expected SEO title/description.
- [ ] Header desktop navigation, mobile menu, dropdown/search, footer links, and scroll-to-top still work.
- [ ] Hero, image galleries/sliders, portfolio filters/lightbox, loading screens, scroll effects, hover/focus interactions, and animations retain their behavior.
- [ ] Contact form validation, submission, error/success feedback, reset, EmailJS delivery, and customer auto-reply still work with the same template parameter contracts.
- [ ] Every business telephone display is exactly `9533950636`; each business click-to-call target is `tel:+919533950636`.
- [ ] Every WhatsApp action resolves to `https://wa.me/919533950636`; existing prefilled text remains intact and URL-encoded correctly.
- [ ] Generated/rendered organization, local business, service, and OG metadata use JP Events and the new business telephone. No old business phone is emitted.
- [ ] Search source/config/template files (excluding dependencies and generated output) for all formats of old company name, phone numbers, `tel:`, and `wa.me`; manually classify email/domain/social identifiers, personal developer contact, examples, and genuine review quotations rather than blindly rewriting them.
- [ ] Check logo, browser favicon, Apple touch icon, OG/Twitter images, and loader logo render successfully once approved replacement assets are available.
- [ ] Review desktop and mobile layouts at current breakpoints; check form validation, disabled, success/error, selected, hover, and keyboard focus states.
- [ ] Verify WCAG AA color contrast for actual text and controls; use dark text on light pink, and use an AA-compliant deep rose such as `#A63F63` for small white text.
- [ ] Check browser console/network for errors and broken images, fonts, links, EmailJS, or WhatsApp redirects.
- [ ] No automated test script is defined in `package.json`; run any external test suite if the deployment repository provides one.

## 9. Potential Risks and Dependencies

1. **Competing data sources:** `index.html`, `config/seoConfig.js`, hard-coded components, JSON-LD components, `.env.example.advanced`, and `config/advancedSEOConfig.js` contain duplicated or contradictory business/contact information. `advancedSEOConfig.js` describes a different generic brand/domain/phone and appears unimported by the app; verify its consumers before changing it.
2. **Private environment values:** `.env` exists and can override deployment/site settings. Its contents were intentionally not read into this plan. In the implementation phase, the owner/deploy operator must privately verify `VITE_SITE_URL`, site/company/phone values, and relevant deployment settings; never commit secrets.
3. **Email and social accounts:** Existing email addresses and social handles contain the old brand. No new email, social URLs, or profile handles were provided. A text change cannot safely transfer inboxes or accounts. EmailJS templates and account-side auto-reply branding are external and cannot be verified from local source.
4. **WhatsApp confirmation:** Test the requested `+91` destination with the account owner. Keep the contact number visible in national format, internationalize only links/schema where appropriate, and retain every query-string message.
5. **Domain and SEO migration:** Existing canonical/alternate/sitemap/schema URLs point to the old domain. No new JP Events domain was supplied. Do not replace the origin or adjust redirects/canonical URLs without confirming ownership, DNS, hosting, Search Console, and migration/redirect requirements.
6. **Remote assets:** Logo, favicon, photos, and OG artwork are hosted externally. Their source image contents and ownership/access are not verifiable from repository text alone. New files/URLs must be approved and tested before replacing preload/icon/schema URLs.
7. **SEO claims and old content:** “Suba” founder-history text and customer review quotations have factual/provenance implications; an indiscriminate replacement risks publishing false history or altering endorsements. Use owner-approved wording where needed.
8. **Color contrast:** The suggested `#C6537A` on white is 4.27:1 and does not meet 4.5:1 for normal-sized text. Use `#A63F63` or another tested darker tone for small white text. Recheck overlays, placeholder/focus text, and translucent backgrounds in context.
9. **Legacy/unused files:** `app/page.tsx`, advanced SEO configuration, templates, and some schema utilities may not be part of the active Vite runtime. Confirm deployment/build consumers before relying on edits to them.

## 10. Implementation Order

1. Confirm with the owner that **JP Events**, `9533950636`, and `+919533950636` are final; determine whether the second Contact phone is also a business line.
2. Obtain/confirm new business email, domain, social-profile URLs, logo, favicon/app icons, and OG assets—or explicitly approve retaining current email/domain/accounts/images. Confirm history and testimonial handling.
3. Confirm whether `.env.example.advanced`, `config/advancedSEOConfig.js`, and `app/page.tsx` are active/deployed. Have the deployment owner verify actual environment values privately.
4. Update centralized runtime data first: `config/seoConfig.js`, `src/utils/whatsappConfig.ts`, business/schema config, and any verified active environment templates. Keep route/canonical URLs unchanged unless a domain migration is separately authorized.
5. Update visible brand text and phone surfaces in header, hero, about, contact, footer, FAQs, loaders, portfolio messages, and blog promotional copy. Preserve customer phone input examples, developer contact, and quoted reviews.
6. Update redundant brand/phone metadata and structured data in `index.html`, SEO components/helpers, schema components, sitemap/robots source, and scripts. Verify serialized/rendered output rather than only source strings.
7. Update Tailwind and component-specific color declarations from gold/amber/yellow/champagne to semantic cherry-blossom colors. Keep white/gray/dark surfaces, spacing, layout, class behavior, animations, and breakpoints unchanged; check contrast as colors are assigned.
8. Replace remote logos/icons/OG images only after approved assets are available; update preload, alt text, favicon, touch icon, and schema logo references as one coordinated asset change.
9. Run the checklist in Section 8, including lint/build, route and interaction smoke tests, phone/WhatsApp source and runtime checks, responsive/contrast review, and visual inspection of remote/generated images.
10. Review the final change set for unintended layout/functional edits and unresolved stale brand/contact references. Do not claim completion until account-side/email/domain tasks have been separately verified.

## 11. Phase 2 implementation results

### Changes completed

- Updated current-facing branding to **JP Events** across the header, hero, footer, loaders, about/FAQ/contact copy, services, portfolio messages, blog copy, analytics labels, page titles, SEO metadata, and business/schema names. Genuine testimonial wording was preserved except for replacing the business name itself. The About page’s account of the original Suba name remains explicitly historical.
- Replaced both Contact business numbers with the national-format `9533950636`. Business telephone links and metadata now use `+919533950636`; all checked WhatsApp destinations use `https://wa.me/919533950636`. Existing prefilled WhatsApp messages remain intact. Updated the public values in `.env.example.advanced`; the actual `.env` was not read or modified.
- Replaced the gold/champagne palette ramps and local gold/amber styling with blush, rose, soft-white, and dark-neutral values. Updated loader/portfolio/service/OG color palettes, review-star accents, browser theme colors, and the invitation style label. White text on strong rose controls uses the darker rose token (`#A63F63`) rather than the lighter `#C6537A`.
- Replaced the header/footer/loading-screen raster wordmarks with editable JP Events text wordmarks. Removed the now-unused preload for the header logo image. No image, route, section, animation, form field, API integration, dependency, or responsive rule was replaced or refactored.

### Files modified

- UI/content: `src/components/About.tsx`, `Blog.tsx`, `Contact.tsx`, `FAQSchema.tsx`, `Footer.tsx`, `Header.tsx`, `Hero.tsx`, `InvitationMaker.tsx`, `LoadingScreen.tsx`, `PageLoader.tsx`, `Portfolio.tsx`, `Process.tsx`, `SchemaTestimonials.tsx`, `ServiceSchema.tsx`, `Services.tsx`, `SuperTrustRocket.tsx`, `Testimonials.tsx`.
- SEO/business data: `index.html`, `config/seoConfig.js`, `src/components/LocalBusinessSchema.tsx`, `src/components/SEO/AboutPageSEO.tsx`, `src/components/SEO/DynamicOGImage.tsx`, `src/components/SEO/SEOHelmet.tsx`, `src/hooks/useSEOTracking.ts`, `src/pages/BlogPost.tsx`, `src/pages/Developer.tsx`, `src/utils/ogImageGenerator.js`, `src/utils/performanceSEO.ts`, `src/utils/schemas.ts`, `src/utils/seoHelmet.ts`, `src/utils/seoHelpers.js`, `src/utils/whatsappConfig.ts`.
- Theme/project docs/configuration: `tailwind.config.js`, `.env.example.advanced`, `README.md`, `scripts/generateAdvancedSitemaps.js`, and this file.

### Intentionally unchanged or pending owner input

- Founder-history text in `src/components/About.tsx` retains the former name only in its historical account. Existing email addresses, canonical/domain URLs, social URLs/handles (including the existing WedMeGood profile URL), Google Analytics IDs, and EmailJS identifiers/templates were not changed. External EmailJS templates/accounts could not be inspected or updated.
- The hosted raster logo `https://i.postimg.cc/Pr28Q6Qm/feswgfew-Photoroom.png` and app/favicon icon `https://i.postimg.cc/zXM81JdP/sdf.png` were not edited or replaced. Header/footer/loaders now show text wordmarks, but the old hosted icon and schema image/logo references remain until the owner supplies approved JP Events assets. Replace the favicon, touch icon, and structured-data logo/image together before public deployment; do not treat these raster assets as verified JP Events branding.
- The old name remains inside the founder-history passage and the existing social profile URL; old-brand email/domain identifiers remain by instruction. Golden event-decor descriptions and the “Create Golden Moments” copy are retained as business/content wording, not as gold interface styling. Yellow SEO-analyzer colors remain status indicators, not theme accents.
- `config/advancedSEOConfig.js` was not changed: the audit found it to describe a separate generic configuration and it was not confirmed as active. Its phone value therefore still requires an owner/deployment check before that config is used. The customer phone placeholder and developer’s personal number were preserved.
- `src/index.css`, route definitions, backend/API behavior, dependencies, `app/page.tsx`, generated `dist/`, and actual environment secrets were not changed. The working directory has no Git repository, so a Git status/diff could not be used to identify unrelated pre-existing edits.

### Verification results

- `npm run lint`: passed with 0 errors and 21 warnings. The warnings are the existing hook-dependency and Fast Refresh warnings; no new lint error was reported.
- `npm run build -- --outDir <temporary-directory>`: passed. Output was written outside the workspace and removed afterward; generated `dist/` was not modified. Existing stale browser-data notices and the >500 KB JavaScript chunk warning remain.
- Parsed all 4 inline JSON-LD blocks in `index.html` successfully.
- Source scans found no old primary/second business phone digits or checked old gold hex values in the active app/config scope. The unrelated customer placeholder, developer personal number, historical/company-account references, and separate advanced SEO config are exceptions noted above.
- Local browser check: the homepage rendered with the JP Events wordmark and updated palette; the Contact route rendered with the new page title and heading, two `tel:+919533950636` links, and three `wa.me/919533950636` links. HTTP smoke checks returned 200 for `/`, `/about`, `/services`, `/portfolio`, `/invitations`, `/blog`, `/contact`, and `/developer`. Only the homepage was visually screenshotted; the other routes were not all visually inspected.
- During browser checks, the console reported a script MIME-type error and Google Analytics requests were aborted during navigation; the remote analytics/script environment was not verified. Existing preload warnings were also observed. Email delivery, external social destinations, phone dialing, and WhatsApp opening were not exercised end-to-end.
- `package.json` has no test script. No full form submission, animation/gallery interaction, responsive-device matrix, or exhaustive contrast audit was run.

### Final follow-up verification

- The first local browser session was connected to an older Vite process on port `5173`, which still served the former `#F1D6AC` CTA color. A newly started Vite process on port `5174` served the current Tailwind configuration; browser-computed CTA background was `rgb(239, 178, 197)` (`#EFB2C5`) with dark text, confirming the pink theme is applied in the fresh app instance. The page title was `JP Events | Premium Wedding Planners & Event Decorators in Hyderabad`.
- Re-ran `npm run lint` and the production build after this check: lint passed with 0 errors and 21 warnings, and the build succeeded. The build output was written to a temporary directory and removed.
- The stale Vite process on port `5173` was stopped after verification; a connection check confirmed that port is no longer serving the old app. Production bundle validation confirms the build compiles, but this follow-up did not repeat the full route/interaction smoke checks.
