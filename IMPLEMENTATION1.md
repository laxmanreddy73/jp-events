# JP Events CMS Implementation Plan and Status

## Scope and audit basis

This document records the original implementation plan and the actual local implementation status in the final section. The audit reviewed the existing `IMPLEMENTATION.md`, package and Vite configuration, the active React routes, the portfolio and venue components, source/configuration file inventory, and the safe environment-variable example. The local `.env` file was not read.

The proposed CMS adds an administrator-only content workflow to the existing JP Events website. It must not replace the current public website or silently remove its portfolio entries, venue details, galleries, animations, contact actions, or responsive behavior.

## 1. Executive Summary

The active site is a client-rendered Vite application and currently has no application backend, CMS, relational database, admin authentication, or upload API. Portfolio and venue records are arrays embedded in React components. Existing photographs are remote URLs, including Cloudinary and Postimages URLs; a Cloudinary cloud-name variable is present in the advanced example environment template, but the active application has no Cloudinary upload SDK or authenticated upload flow.

**Recommendation:** use Supabase for managed authentication, PostgreSQL, private upload staging, public delivery of published images, row-level authorization, and Edge Functions for privileged upload/publish operations. Supabase is the simplest fit for this static React application because it supplies the missing CMS backend primitives together and can enforce authorization independently of the UI. Keep existing remote image URLs working and migrate their metadata without downloading or replacing the images. Supabase image-transformation availability and current plan limits must be confirmed by the owner before implementation.

This recommendation introduces one managed service and requires an owner-provisioned Supabase project. Cloudinary remains a viable alternative if the owner confirms account ownership, access, and a reason to reuse its transformation/CDN pipeline; existing image URLs alone do not prove an integration or account relationship. During the implementation phase, the frontend, migration, functions, and repeatable import tooling were added locally, but no Supabase project was provisioned or changed.

The proposed first administrator is provisioned by invitation from the Supabase project dashboard and explicitly granted an admin role by a trusted project operator. There is no public signup route. Every database, storage, and Edge Function write is protected by server-side authorization; hiding the admin interface is not an authorization mechanism.

## 2. Existing Project Architecture

### Verified stack and structure

- **Frontend:** React 18, TypeScript 5.5, Vite 5, React Router 6, Tailwind CSS 3.4, Framer Motion, and Lucide React. `src/main.tsx` mounts `src/App.tsx`; `src/App.tsx` owns the current routes and shared public header/footer.
- **Active public routes:** `/`, `/about`, `/services`, `/portfolio`, `/invitations`, `/blog`, `/blog/:slug`, `/contact`, and `/developer` in `src/App.tsx`.
- **Content presentation:** `src/components/Portfolio.tsx` owns the portfolio card data and masonry/grid rendering. `src/components/Hero.tsx` owns the home page's long-form sections and one reception-hall carousel. `src/components/Services.tsx` owns a second reception-hall carousel and its venue details/amenities panel.
- **Styling:** `tailwind.config.js`, `src/index.css`, and component-local inline styles/classes. The Cherry Blossom Pink theme is already configured. Admin pages should reuse these tokens and must not recolor or restructure the public site.
- **Public image delivery:** the components contain hard-coded remote image URLs from Postimages and Cloudinary. `VITE_CLOUDINARY_CLOUD_NAME` is listed in `.env.example.advanced`; the current source search found no Cloudinary upload/API client. A cloud-name variable and public asset URLs are not credentials and do not establish that the business controls the provider account.
- **Current integrations:** EmailJS is used by `src/components/Contact.tsx`; analytics and SEO code are also present. These are not CMS backends or admin authentication. No Supabase, Firebase, Prisma, ORM, SQL migration, database client, authorization middleware, API server, or server deployment configuration was found.
- **No current CMS API:** `src/utils/ogImageGenerator.js` mentions `/api/og-image` as a fallback URL, but no matching server endpoint was found. Do not treat that reference as an existing backend.
- **Legacy/alternate shell:** `app/page.tsx` renders the Vite `src/App.tsx`, but `next` is not a project dependency and no Next.js configuration or server was found. The active project scripts are `dev`, `build`, `lint`, and `preview`; there is no test script.
- **Deployment:** the repository contains no verified Vercel, Netlify, Docker, Render, Railway, Cloudflare Pages, or other deployment manifest. The actual static host and production domains must be confirmed before configuring rewrites, CSP, or production origins.
- **Environment:** `.env.example.advanced` contains an example `VITE_CLOUDINARY_CLOUD_NAME` and SEO/analytics variable names. `.env` exists, but its values were not inspected. No Supabase variable or server-only CMS secret has been verified.

## 3. Existing Portfolio and Venue Component Audit

### Portfolio

`src/pages/Portfolio.tsx` simply wraps `src/components/Portfolio.tsx`. The component defines a `PortfolioItem` TypeScript interface and two local arrays:

- `portfolioItems`: 8 detailed project cards.
- `socialWallImages`: 4 additional image cards.
- `allItems`: combines both arrays into the 12-card initial display.

The current data includes `id`, `type` (`image` or `video`), `src`, optional `poster`, `title`, `description`, `category`, optional `location`, `date`, `guests`, `duration`, `budget`, `tags`, `awards`, `photographer`, `likes`, and `views`. All 12 current records are image records; the renderer still has a video branch and that behavior must be retained for any legacy/future video entries. The current category filters are All, Ceremonies, Receptions, Pre-Wedding, and Bridal, although the data also has an Entertainment item. The UI supports search, masonry/grid mode, animated cards, likes, image/video details, a lightbox, and WhatsApp booking. Book-This-Venue and View-Details actions must remain functional and keep their current appearance.

### Reception halls

The hall data is duplicated across two distinct sections and two different shapes:

1. **Home:** `src/components/Hero.tsx` defines a local `halls` array of 9 records with `src`, `title`, `capacity`, and `description`. It renders an auto-advancing image carousel, arrows, indicators, and WhatsApp inquiry actions. `src/pages/Home.tsx` renders this component.
2. **Services:** `src/components/Services.tsx` defines a separate `receptionHalls` array of 9 records with `id`, `src`, `title`, `capacity`, `description`, and `features`. It renders a Framer Motion carousel, arrows, indicators, WhatsApp actions, amenities, capacity, and a Book-This-Venue button. `src/pages/Services.tsx` renders this component.

The records are substantially the same venues, including “Modern Elegance Hall,” but they are duplicated in source and the Services view has extra amenities. The CMS must store one venue record per venue and feed both existing presentations, retaining the home carousel's current compact presentation and the Services carousel's details panel. The seed/import must reconcile duplicate records by verified venue identity (not array index) and preserve any field or image difference rather than silently discarding it.

Portfolio entries and venues are separate content types and should not be merged into one table or component. Current cards also include videos as a supported rendering type; initial CMS image uploading need not add video upload, but existing video rendering must not be removed.

## 4. Proposed Admin Panel Architecture

- Add an isolated `/admin/*` route tree with `/admin/login`, `/admin`, `/admin/portfolio`, `/admin/venues`, and `/admin/media`. Do not add a public registration page or expose admin links in the public navigation by default.
- Add an admin shell with a sidebar/drawer, JP Events Cherry Blossom Pink tokens, dashboard counts, recent activity, responsive tables/cards, notifications, and confirmation dialogs. Keep the existing public header/footer out of the admin shell while leaving public routes unchanged.
- Use a small CMS service/repository layer between React pages and Supabase. Do not put database queries, upload-signature generation, or authorization assumptions in presentation components.
- Use Supabase Auth for administrator identity; Postgres RLS for table/API access; Storage policies for object access; and Supabase Edge Functions for short-lived upload authorization, finalization/publishing coordination, and safe deletion.
- Treat the admin route guard as user experience only. A visitor can call the REST/Storage/Function endpoints directly, so every privileged action must be denied by RLS, Storage policy, or an Edge Function's independent JWT-and-role check.
- Public content queries return only published entries and their approved images. Admin queries can read drafts only after the backend has verified the administrator role.
- Retain existing public remote image URLs as external media references during the initial import. Newly uploaded content uses Supabase Storage. Do not change the live public cards to new asset hosts until the database migration and smoke tests are complete.

## 5. Authentication and Authorization Design

### Identity and first administrator

- Use Supabase Auth's managed email/password identity and recovery/session handling; do not implement password storage or custom cryptography.
- Disable public signups. The owner/operator invites the first named admin from the Supabase dashboard after verifying the recipient address. The operator then adds that Auth user ID to the protected `admin_users` table using the dashboard's trusted SQL editor or a narrowly scoped provisioning function. Do not place invitation tokens, passwords, role grants, or service-role credentials in source control or browser code.
- Require verified email and enable/enforce administrator MFA (TOTP or the provider's current supported MFA mechanism) for admin mutation operations. Confirm recovery codes and account recovery with the owner before production.
- Make role changes/revocation an operator-only operation. Never let a user insert their own `admin_users` row or set their own role through user-editable metadata.

### Session and privileged-operation checks

- Use the provider's supported SPA authentication flow (PKCE where supported), short and reviewed session lifetimes, refresh-token rotation/revocation, explicit logout, and reauthentication/MFA for destructive actions. Keep the session token out of URLs and logs. Apply a strict Content Security Policy and prevent untrusted HTML rendering to limit token theft through XSS.
- The frontend route guard sends unauthenticated users to `/admin/login` and checks admin status for navigation. This is not the security boundary.
- Enable RLS on every CMS table. Public role can select only published content and public media metadata. Authenticated non-admin users have no CMS write permissions. Admin policies explicitly check an immutable server-provisioned admin membership and MFA assurance level as required by the chosen Supabase policy design.
- Storage policies deny anonymous and non-admin writes. Signed upload tokens are short-lived and scoped to one random staging object path; they are issued only after an Edge Function validates the caller's JWT, admin membership, MFA state, and request constraints.
- Edge Functions independently validate JWT, role, origin, request schema, rate limits, and ownership before using a server-only service credential. Never trust a client-supplied user ID, filename, storage path, role, public URL, MIME type, size, or image dimensions.
- Configure Supabase Auth's available login rate limits and CAPTCHA/abuse controls; alert on repeated failures and upload/publish spikes. Use exact production CORS origins, not `*` with credentials. Bearer-token requests should not use cookie-based authentication unless a later server-side session/BFF design is explicitly adopted.
- Apply server-side length/range/enum validation and parameterized database operations. Render user-authored text as text; do not pass it to `dangerouslySetInnerHTML`. Keep an append-only admin audit trail without passwords, access tokens, or unnecessary personal data.

## 6. Image Hosting Provider Comparison

Provider features, quotas, free tiers, image-transformation entitlements, and prices can change. The owner must compare current plan terms and expected monthly storage, operations, image transformations, and delivery bandwidth before creating a production account.

| Provider | Fit for this project | Advantages | Trade-offs / checks |
|---|---|---|---|
| **Supabase Storage (recommended)** | New CMS uploads, paired with Supabase Auth and Postgres | One managed project can provide Auth, relational content, Storage policies, signed uploads, and Edge Functions; authorization can use the same admin identity and RLS model; minimal new vendor surface for a static SPA | No current Supabase account or integration was found. Confirm image resizing/optimization features, storage limits, delivery behavior, and plan costs for the selected plan. Use immutable object keys and a transformation/CDN strategy if needed. |
| **Cloudinary** | Existing public URLs are present in components and the safe env template has a cloud-name variable, but no upload integration or account ownership is verified | Strong image transformation/optimization/CDN capabilities; possible reuse of an owner-controlled existing asset account | Does not supply this application's CMS database/admin authorization. Secure signed uploads require a server-side signing function and secret. Verify account ownership, API access, plan/usage limits, existing asset ownership, and transformation/metadata-removal behavior. Do not infer access from URLs or a cloud name. |
| **AWS S3 + CloudFront** | Viable if the business already operates AWS | Mature object storage, IAM, lifecycle/versioning and CDN options; highly configurable | Requires separate auth/database/API, IAM and CDN configuration, upload signing, image processing, monitoring, and more operational knowledge. No AWS integration was found. |
| **Cloudflare R2** | Viable if the business already uses Cloudflare | Object storage with an egress-cost profile that may suit image delivery; pairs with Workers and custom CDN designs | Requires a separate auth/database/API and image transformation solution; request/storage pricing and custom security/lifecycle work still need review. No Cloudflare deployment integration was found. |

**Decision:** use Supabase Storage for new CMS-managed image uploads so authorization, content records, and image objects are governed by a single owner-managed platform. Keep current Cloudinary/Postimages URLs as legacy external media during rollout. Do not copy/migrate those binaries without owner approval and access. If the owner confirms an existing Cloudinary account is controlled by JP Events and prefers its image CDN, pause before implementation and revise the storage decision; do not silently add both storage providers.

## 7. Recommended Cloud Image Storage Architecture

### Buckets and access model

- Create a private `cms-staging` bucket for new uploads and draft-only media. It is not anonymously readable.
- Use the existing public-read, admin-write `jp-events-media` bucket for published portfolio/venue images under `portfolio/` and `venues/`. Public bucket access applies to every object in that bucket, so only published images should be copied there; keep draft uploads in private `cms-staging`.
- Keep original staging paths UUID-based and non-user-controlled. Published object keys are immutable/versioned (for example, content UUID + media UUID + normalized output format); replacing an image creates a new object rather than overwriting a cached URL.
- Existing external image URLs are recorded as `external` media and are not moved. New media rows record their provider/bucket/object key and derive the delivery URL from trusted metadata. Never accept arbitrary image URLs as a substitute for an authenticated upload.

### Upload and publish lifecycle

1. The admin selects one or more files. The browser provides immediate preview, progress, and basic extension/size checks; those checks are only for UX.
2. The browser requests an upload authorization from an Edge Function. The function verifies the Supabase JWT, provisioned admin membership, MFA policy, per-admin/IP limits, allowed media category, and configured size/type limits. It creates a cryptographically random staging path and a short-lived, single-object upload token.
3. The browser uploads directly to private staging, with progress and bounded retry for transient failures. The server-side credential never reaches the browser. Do not permit arbitrary object paths, overwrite, SVG, HTML, archives, or unrecognized file types.
4. An authenticated finalization function checks the actual uploaded object and its storage metadata, validates the file signature/decoded image format, maximum bytes/dimensions/pixel count, and supported formats (JPG/JPEG, PNG, WebP, AVIF). It rejects mismatches and records a checksum/metadata. The owner-approved size and dimension limits must be set before implementation; a reasonable initial proposal is 10 MiB/file and 6,000 px per side, subject to provider and Edge Function limits.
5. Normalize/re-encode or use the selected provider's supported image transformation pipeline. Remove EXIF/GPS metadata from published delivery derivatives and verify that removal with a fixture containing location metadata. Preserve an original only in private storage if the owner has a retention requirement.
6. Store media metadata in Postgres and keep unapproved media in staging. Admin preview uses a short-lived signed read URL. When content is published, an authorized publication operation copies/promotes verified images to the public bucket, updates the media state and content status, and writes an audit event. Make the operation idempotent and recoverable because a database transaction cannot atomically commit a Storage copy.
7. Public pages request published content only and render the public object URL. Images use explicit alt text, lazy-loading except where current loading behavior requires otherwise, and a graceful unavailable-image placeholder.
8. Upload errors must distinguish rejected files, expired authorization, quota/rate limits, network errors, and finalization failures. Preserve successful uploads when another file in a batch fails and allow retry without creating duplicate records.

### Duplicate and removal safety

- Compute a content checksum for duplicate warnings. Reuse a media record or explicitly create a separate attachment according to owner intent; do not assume equal bytes mean the same content purpose.
- Removing a content entry detaches its media relationships but does not immediately destroy objects. Mark unreferenced assets as cleanup candidates; after a configurable grace period, a privileged cleanup function rechecks all references and any active draft/editor state before deleting. Use idempotent retries and record deletion in the audit log.
- A media object referenced by any portfolio item or venue (published or draft) cannot be deleted. A failed cross-service cleanup remains retryable and visible to an admin; it must not return success if the object is still present.

## 8. Database Schema and Relationships

Use Supabase-managed PostgreSQL with versioned SQL migrations in `supabase/migrations/`. Do not store image binary data in Postgres. Use UUID primary keys, `timestamptz` timestamps, indexes for common reads, foreign keys, and RLS on every application table.

### Proposed tables

**`admin_users`**

- `user_id uuid primary key references auth.users(id) on delete restrict`
- `role text not null check (role in ('admin'))`
- `created_at timestamptz not null default now()`
- `created_by uuid references auth.users(id)`
- No user-facing insert/update/delete policy. Membership changes are performed by an authorized project operator.

**`media_assets`**

- `id uuid primary key`, `provider text` (`supabase` or `external`), `bucket text null`, `object_key text null`, `external_url text null`
- `original_filename text`, `mime_type text`, `byte_size bigint`, `width integer`, `height integer`, `checksum_sha256 text`, `alt_text text`
- `state text` (`staging`, `verified`, `published`, `cleanup_pending`, `deleted`), `uploaded_by uuid references auth.users(id)`, `created_at`, `updated_at`
- For Supabase assets, require bucket/object key and disallow a client-authored arbitrary external URL. For legacy external records, preserve the existing trusted source URL and identify the row as external.
- Unique index on provider/bucket/object key (where present); indexes on state, uploader, and checksum as appropriate.

**`portfolio_items`**

- `id uuid primary key`, `title text not null`, `slug text unique not null`, `description text not null`, `category text not null`
- `guest_capacity integer null check (guest_capacity is null or guest_capacity >= 0)`, `duration text null`, `event_date date null`, `location text null`, `budget text null`
- `tags text[] not null default '{}'`, `awards text[] not null default '{}'`, `photographer text null`
- `featured boolean not null default false`, `sort_order integer not null default 0`, `status text not null check (status in ('draft','published'))`
- `published_at timestamptz null`, `created_by`, `updated_by`, `created_at`, `updated_at`
- Index `(status, sort_order, updated_at desc)`, plus unique slug and category/status indexes where useful.

**`portfolio_media`**

- `portfolio_id uuid references portfolio_items(id) on delete cascade`, `media_id uuid references media_assets(id) on delete restrict`, `sort_order integer not null`, `role text not null check (role in ('cover','gallery'))`
- Composite primary key for item/media; index media ID for safe reference checks; a constraint/index to allow one cover per item. Publication validation requires exactly one verified cover and only verified, appropriate gallery media.

**`venues`**

- `id uuid primary key`, `name text not null`, `slug text unique not null`, `subtitle text null`, `description text not null`
- `guest_capacity integer not null check (guest_capacity > 0)`, `amenities text[] not null default '{}'`, `location text null`
- `featured boolean not null default false`, `sort_order integer not null default 0`, `status text not null check (status in ('draft','published'))`
- `published_at timestamptz null`, `created_by`, `updated_by`, `created_at`, `updated_at`
- Index `(status, sort_order, updated_at desc)`.

**`venue_media`**

- `venue_id uuid references venues(id) on delete cascade`, `media_id uuid references media_assets(id) on delete restrict`, `sort_order integer not null`, `role text not null check (role in ('cover','gallery'))`
- Composite primary key and one-cover constraint; index by media ID. Preserve gallery ordering for the existing carousels.

**`admin_activity`**

- `id bigint generated always as identity primary key`, `actor_user_id uuid references auth.users(id) on delete set null`
- `action text not null`, `entity_type text not null`, `entity_id uuid null`, `occurred_at timestamptz not null default now()`, `details jsonb not null default '{}'`
- Append-only from the admin UI; writes come from trusted database triggers/functions or Edge Functions. Do not place secrets, auth tokens, or full customer/contact payloads in `details`.

### Relationships and publication rules

- Each portfolio item/venue references one or more media rows through the appropriate join table. The join rows preserve ordered galleries and identify a cover.
- Content removal cascades only its join rows; it does not cascade-delete shared media. Media deletion is restricted until every join reference is removed and the cleanup workflow confirms no references.
- Keep status as a constrained value. Only a trusted publish operation may set `published`; validate required content, cover, verified media, and publish timestamps in the database layer as well as the UI.
- Use trigger-maintained `updated_at` and audit events for create/update/publish/unpublish/delete. Avoid copying secrets or excessive PII into audit records.
- Use normalized join tables rather than opaque JSON for media relationships and ordering. `text[]` is sufficient for simple tags/amenities; if categories or amenities later need independent descriptions/translations, add reference tables through a later migration.

## 9. Admin Dashboard UI Specification

- **Overview:** counts for total/published/draft portfolio and venues, verified media count, recent admin activity, and links to the two content managers.
- **Portfolio manager:** searchable/filterable list; title/category/status/updated date; create/edit; draft save; publish/unpublish; feature/unfeature; reorder; preview; confirm delete.
- **Venue manager:** searchable list; create/edit; cover and ordered gallery; name/description/capacity; amenities; location; publish state; preview; confirm delete.
- **Media library:** thumbnail, alt text, type, size/dimensions, upload date, usage list, staging/published state, preview, replace, and remove/cleanup action only when safe.
- **Editor experience:** controlled text fields, category selection, accessible validation messages, drag/drop and multi-file upload, previews before save, per-file progress, retry/cancel, explicit save/cancel, dirty-form warning, success/failure notifications, and confirmation for publish/unpublish/delete.
- **Responsive behavior:** desktop table/list; narrow layouts use cards and collapsible navigation. No change to public breakpoints, public menu, or public component design.
- **Failure handling:** show auth expiry and retry/sign-in action; show upload/publish failure with retryable state; never display a success toast if the database/media operation did not commit.

## 10. Portfolio CRUD Workflow

1. Admin opens `/admin/portfolio`; the route guard checks the current session, while RLS remains authoritative.
2. The list query returns all statuses only to admins, ordered by `sort_order`, with search/category filters applied without exposing drafts publicly.
3. “Add portfolio item” creates an editor for title, slug, description, category, event date, guest capacity, duration, location, tags, and featured state.
4. The admin uploads or selects a verified cover and optional ordered gallery images. The editor stores media IDs in `portfolio_media`; it does not trust a submitted URL.
5. “Save draft” persists valid draft data. “Publish” invokes the publication operation, which revalidates the record and media references server-side, promotes media to the public bucket if needed, writes `published_at` and audit data, then invalidates public data caches.
6. Edit/publish and reorder changes take effect on public portfolio fetch after the configured cache window or immediate invalidation. An unpublish action removes the item from public queries; it does not delete media.
7. Deletion requires confirmation and only deletes the content record and join rows. Media becomes cleanup-eligible only after all content references are checked.
8. Preserve existing masonry/grid classes, card and modal rendering, existing likes, filters, animation, WhatsApp booking, and video renderer. Add dynamic loading/error/empty states without replacing the current visual layout.

## 11. Reception Hall CRUD Workflow

1. Admin opens `/admin/venues`; the list includes status, name, capacity, cover preview, order, and last update.
2. Create/edit fields include name, optional subtitle, description, positive guest capacity, location, amenities/features, cover image, ordered gallery, featured flag, status, and sort order.
3. Admin preview checks both current venue presentations: compact home carousel and Services details panel. The public implementations remain separate view components but read the same venue records.
4. Publish validates the required name/description/capacity, exactly one verified cover, and verified gallery assets. Public queries return published records ordered consistently.
5. Reordering/replacing a cover updates both public hall displays. Existing WhatsApp inquiry actions continue to use the current central WhatsApp configuration and selected venue title/details.
6. Unpublish/delete actions do not delete objects automatically. Delete confirmation describes the content removal separately from any later orphan-image cleanup.
7. If no venues are published, show a designed empty state; do not crash the carousel, modulo by zero, or render stale hard-coded venue details as if they were live CMS data.

## 12. Image Upload and Management Workflow

- Accept JPG/JPEG, PNG, WebP, and AVIF only; explicitly reject SVG until a reviewed sanitizer/rendering strategy exists. Block HTML, scripts, archives, and unknown content regardless of filename/MIME supplied by the browser.
- Proposed initial limit: 10 MiB per image and 6,000 px per side, with a pixel-count cap. Confirm the final thresholds against provider and edge-function limits and owner expectations before coding.
- Perform client checks for faster feedback, then repeat all security checks server-side after upload. Inspect signatures and decode the image; enforce actual type/size/dimensions, sanitize the output, strip GPS/EXIF from public derivatives, and store canonical metadata.
- Store alt text with media and require meaningful alt text for content images unless the image is explicitly decorative. Do not expose original filenames in public object paths.
- Support multiple concurrent uploads with a safe concurrency cap, progress, cancellation before finalization, per-file retry, idempotency key, and clear partial-success behavior. Avoid creating duplicate metadata after a network retry.
- `replace image` creates a new object/media row and updates selected content associations only after successful verification. The old object remains until a reference check and grace period complete.
- Display image usage from `portfolio_media` and `venue_media`. A deletion action must refuse referenced files and state why.
- Define retention/backup policy for staged and orphaned images. Provide a scheduled or operator-triggered cleanup function with dry-run reporting, age threshold, usage check, audit record, and retryable failures.

## 13. Public Website Dynamic Content Integration

- `src/components/Portfolio.tsx` requests published portfolio records and ordered media; retains the current card markup, masonry/grid mode, category/search UI, lightbox, image/video branches, animation, and WhatsApp booking.
- `src/components/Hero.tsx` requests published venues and uses the cover image and compact title/capacity/description in the existing home carousel.
- `src/components/Services.tsx` requests the same published venue set and ordered gallery/amenities in the existing side-by-side carousel/details UI.
- Keep stable UUID keys and preserve order. Do not derive identity from array indices. Retain the current public section sequence and slider controls/autoplay; guard empty/single-item counts so next/previous handlers cannot divide by zero.
- Query only `status = 'published'` through a public view or RLS policy. Drafts are never returned to anonymous clients even if a frontend filter is bypassed.
- Provide explicit loading, retryable error, and empty states. Use a placeholder for a missing image, preserve alt text, and avoid blank/broken slides. Do not silently substitute stale data after a failed request; if a temporary static fallback is approved for rollout, identify it as a migration fallback and remove/retire it after data parity is verified.
- Cache public query responses briefly (proposed 30–60 seconds) and refetch/invalidate after publish, unpublish, reorder, and edit in the admin. On another browser/device, updates appear within that stated bound. Use immutable storage object keys so CDN caches cannot serve an overwritten prior image. Do not cache drafts or admin lists in public storage.
- If immediate cross-device propagation is required, consider a Supabase Realtime subscription for published rows; treat it as an optional enhancement, not a prerequisite for correct reads. Ensure errors fall back to bounded refetch rather than a permanently stale client cache.
- Migrate all currently embedded content before switching the public components to database-only reads. Verify counts, text, image URLs, categories, amenities, and sort order against the current arrays. Preserve images at their present URLs; do not scrape or copy provider content without owner authorization.

## 14. API Endpoint Specification

There is no current REST/server API convention. Use Supabase Auth/REST/Storage and Edge Functions rather than inventing an Express server alongside the Vite app. Supabase APIs enforce authorization independently of the route UI.

| Operation / proposed endpoint | Access | Required checks / behavior |
|---|---|---|
| `POST /auth/v1/token?grant_type=password` via Supabase Auth SDK | Login only | Public registration disabled; provider login rate limits/CAPTCHA; verified invited account; require MFA before admin mutations. No password logging. |
| `POST /auth/v1/logout` via SDK | Authenticated user | Revoke/clear current session; return to public site or login. |
| `GET /rest/v1/portfolio_items?status=eq.published&order=sort_order.asc` | Anonymous and authenticated | RLS/public view returns published fields only; no draft rows or admin-only metadata. |
| `GET /rest/v1/venues?status=eq.published&order=sort_order.asc` | Anonymous and authenticated | RLS returns published venues only. |
| `GET /rest/v1/portfolio_items`, `GET /rest/v1/venues`, `GET /rest/v1/media_assets` | Admin | RLS verifies role; may include drafts and management metadata only to admin. |
| `POST`, `PATCH`, `DELETE /rest/v1/portfolio_items` and `/rest/v1/venues` | Admin | RLS on each operation; strict field validation; publication transitions validated by database function/trigger; write audit row; deletion leaves media intact. |
| `POST`, `DELETE /rest/v1/portfolio_media` and `/rest/v1/venue_media` | Admin | RLS; check media state/type and same owner/project scope; maintain unique cover/order constraints. |
| `POST /functions/v1/create-upload-authorization` | Admin only | Validate JWT, admin role, MFA, requested type/size/category; generate random private staging object key and short-lived scoped upload permission. No broad bucket token. |
| Supabase Storage signed upload to `cms-staging` | Short-lived upload token issued above | Exact object only; no overwrite; bucket limits; private read; token expiry. Browser upload progress is not a security check. |
| `POST /functions/v1/finalize-upload` | Admin only | Verify caller, staging object ownership/path, actual metadata and allowed image, dimensions/bytes, checksum, sanitization result; create/update media row idempotently; audit failure/success. |
| `POST /functions/v1/publish-content` | Admin only | Revalidate entire record; promote/copy media, update status/timestamp and audit data; idempotent retry/reconciliation if object copy and DB write diverge. |
| `POST /functions/v1/delete-orphan-media` | Admin only; scheduled service invocation may use service role | Confirm zero references across draft and published joins, cleanup grace period, expected object key/provider, then delete and record result. Return conflict for any reference. |
| `GET /rest/v1/rpc/admin_dashboard_counts` | Admin only | Restricted database function/view aggregates statuses and recent activity; never expose drafts/count details anonymously. |

All service-role operations remain within Edge Functions or trusted project tooling. Public clients use only the publishable/anon key, which is not a secret and is safe only when RLS and Storage policies are correctly enabled. Do not add secrets to `VITE_*` variables.

## 15. Security Threat Analysis and Safeguards

| Threat | Required safeguard |
|---|---|
| Visitor bypasses hidden admin UI and calls APIs directly | RLS on every table, Storage object policies, Edge Function JWT/role checks; test REST calls without using the app. |
| Visitor self-registers or escalates role | Disable signup; invite-only user provisioning; operator-only role table; ignore client metadata/role claims unless issued by trusted auth hooks. |
| Stolen/guessed password or brute-force login | Managed auth rate limits, CAPTCHA/abuse controls as supported, verified email, MFA, alerts, session revocation and secure recovery procedures. |
| Service key leaked in frontend bundle/repository | Server-only Edge Function secrets; never `VITE_SUPABASE_SERVICE_ROLE_KEY`; scan built assets and git-tracked files for secret names/values during implementation without printing secrets. |
| Forged file extension/MIME or malicious upload | Allowlist extensions and actual signatures, decoded format/dimensions, size and pixel caps, no SVG, quarantine before publication, sanitizer/re-encode, randomized paths. |
| Public storage write/delete through misconfigured policy | Anonymous read only on published bucket; no anonymous insert/update/delete; write policies check admin membership; test every operation as anon and non-admin. |
| XSS from content description/tags | Validate and length-limit on server; render escaped React text; no unsafe HTML; CSP and explicit security headers on the real deployment host. |
| CSRF/CORS misuse | Prefer bearer-token API calls rather than ambient cookies; exact origin allowlist; validate Origin for functions where appropriate; do not combine wildcard CORS and credentialed cookies. |
| URL/path traversal or arbitrary object deletion | Server-generated UUID paths; never concatenate untrusted path into delete; verify storage row/media owner and all references before removal. |
| Race between image cleanup and content publish | State machine, reference check under a transaction/lock before marking for cleanup, grace period, idempotent operation, retry/reconciliation. |
| Stale cache hides a publish/unpublish | Bounded cache TTL, mutation invalidation, immutable object keys, publication timestamp, retry UI and independent-device test. |
| Admin action cannot be traced | Append-only activity events with actor, entity, action, timestamp, minimal before/after fields; alert and retain logs per owner policy. |
| Lost database or images | Scheduled database backups, separately verified object backup/version/manifest strategy, restore drill, migration rollback plan, and owner-approved recovery objectives. |

Existing site code contains static content and external services but no existing admin API or authorization controls to reuse. The existing EmailJS public client integration is not a CMS authorization layer and must remain isolated from admin credentials.

## 16. Environment Variable Requirements

Only names are specified here; no current secret values were read or copied.

**Frontend build variables (safe to expose only as public configuration):**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- Existing `VITE_CLOUDINARY_CLOUD_NAME` is not needed for the recommended Supabase Storage upload flow; do not remove or change it as part of this phase.

**Supabase Edge Function / server-only secrets:**

- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (use platform-provided secrets; never expose service-role key to Vite)
- Any function-specific signing/verification secret only if the selected implementation requires one; prefer provider JWT and signed Storage permissions.

## Phase 11 — Visual image replacement

The Visual Website Image Editor is implemented in the application, but has not been applied to or tested against the live Supabase project. Apply migration `202611140004_site_image_slots.sql` after the prior CMS migrations and deploy `replace-site-image`. Its admin UI verifies the current user, provisioned `app_metadata.cms_role`, and AAL2 MFA before enabling edit mode; the Edge Function independently repeats the role/MFA check before uploading or changing a slot. Database reads and writes are also protected by `site_image_slots` RLS.

Explicit image slots cover the homepage hero slides, the cover photographs in the “Moments worth remembering / Follow the Magic” portfolio ribbon, homepage service cards, Services-page category imagery, one homepage feature image, three About page editorial images, and published reception hall covers. Each portfolio slot is keyed by its stable published portfolio UUID; each venue cover slot uses the venue UUID. Existing Portfolio and Venue CMS gallery editors remain the management path for additional gallery images.

Replacements are validated as JPEG, PNG, or WebP (10 MiB maximum; 6,000 px per side and 36 MP), stored under a new unique object path in the existing public `jp-events-media` bucket, and recorded with MIME type, size, dimensions, alt text and update identity in `site_image_slots`. Public components apply active database overrides and retain their original image URLs as fallbacks. Realtime plus periodic/visibility refresh keeps open pages current. Old managed objects are removed only after checking the CMS media and site-slot references.

Deployment must be reviewed before applying: `jp-events-media` is public, which makes every object in the bucket publicly readable; only published images should be copied there. The site replacement function uses the server-only service credential and requires CMS admin + AAL2; no service key is exposed to Vite. `.env.local` and cloud policies are not available in this workspace, so authentication, RLS, upload, old-object cleanup, and end-to-end browser behavior remain unverified against the live project. AVIF/SVG are intentionally not supported by the current verifier.

**Not required by the recommended architecture:** Cloudinary API secret/key; do not configure unless the owner explicitly changes the provider decision.

Document public names without values in the maintained safe template (`.env.example.advanced` or a newly approved `.env.example` if the owner prefers). Store server-only keys in Supabase Edge Function secrets/dashboard and local ignored environment storage. Do not inspect, print, modify, or commit `.env` during implementation. Confirm production build variable handling and ensure frontend variables contain no server secrets.

## 17. Database Migration Plan

1. Confirm the Supabase project/region, production site origin, backup/retention plan, image limits, and authorized first admin.
2. Create a versioned initial migration for `admin_users`, `media_assets`, `portfolio_items`, `portfolio_media`, `venues`, `venue_media`, `admin_activity`, constraints, indexes, triggers, helper functions, and RLS policies.
3. Create and test Storage buckets and policies (private staging, published read-only to public, authenticated admin writes only). Keep buckets private until policy tests pass.
4. Use a repeatable import script to seed the existing 12 portfolio/social-wall records and the 9 unique hall records. Reconcile the duplicate home/Services venue arrays by title and data review; preserve all image URLs, fields, amenities, initial sort order, categories, and existing public behavior.
5. Store current Cloudinary/Postimages URLs as external media references. Do not download files, change source hosting, or assume the business owns the remote accounts.
6. Produce an import report with source and destination counts, unmatched/duplicate rows, invalid URLs, and per-field differences. Require owner review for any conflicting venue content before cutover.
7. Run migration in a non-production project first; test rerun/idempotency and restore. Back up current source arrays (already in versioned source) and the target database before production migration.
8. Deploy functions and environment configuration, provision/invite an admin, and run anonymous/non-admin/admin authorization tests before exposing any admin route.
9. Cut public reads over one component at a time (portfolio, home halls, Services halls). Confirm exact data parity and retain a rollback switch to the prior static source until production smoke checks pass.
10. Rollback reverts the UI read path and disables admin writes; do not drop tables or delete cloud images as part of application rollback. Resolve database schema changes with forward migrations unless a tested restore is necessary.

## 18. Deployment and Cloud Configuration

- Confirm the actual production host, origin(s), DNS ownership, static-host SPA rewrite behavior, and release process. The repository currently has no deployment manifest; do not invent a production domain or hosting provider.
- Provision a Supabase project in an owner-approved region. Configure Auth URL allowlists, exact redirect URLs, signup disabled, email verification, MFA, rate limits/CAPTCHA, database backups, storage limits, Edge Function CORS, and monitoring.
- Deploy migrations before the frontend that depends on CMS reads. Deploy Edge Functions with secrets through the Supabase platform, not a source file. Deploy frontend public Supabase URL/key only through the host's public build variables.
- Configure the static host to serve the SPA shell for `/admin/*` as it must for existing React Router deep links. Do not add a public rewrite that exposes a serverless admin endpoint without its own auth checks.
- Add or update CSP/security headers on the confirmed host to permit the approved Supabase API/storage origins and existing image/font/analytics sources; avoid weakening policy with broad wildcards.
- Test staging first with an admin test account and synthetic images. Promote migrations/functions/site in a documented order. Keep provider dashboards/keys owned by the business and provide an operator handover.
- No production credentials, project, bucket, account, endpoint, or hosting configuration are currently verified. Owner provisioning is a prerequisite, not a code-only task.

## 19. Testing and Regression Strategy

### Database and API authorization tests

- Anonymous can read only published portfolio/venue rows and published image metadata; cannot select drafts/admin activity or mutate any CMS table.
- Authenticated non-admin can neither read drafts nor create, update, publish, reorder, or delete content or upload/delete media.
- Provisioned admin can perform the intended CRUD and upload flows only after role/MFA checks; revoked admin loses write access immediately after token/role revalidation.
- Test Storage anonymous read/write/delete per bucket and admin write boundaries. Test Edge Functions with missing, expired, wrong-role, and insufficient-MFA JWTs.
- Test signup disabled, repeated login rate limiting, exact-origin CORS, and audit attribution.
- Use Supabase local development/SQL policy tests (for example pgTAP if enabled by the selected CLI setup). No automated test framework is currently defined; add only the smallest test tooling needed and record setup.

### File and content validation tests

- Valid JPG/PNG/WebP/AVIF; mismatched extension/MIME/signature; corrupted data; zero-byte file; oversize file; excessive dimensions/pixel count; SVG/HTML/archive; missing alt text; filename/path traversal; duplicate upload; expired token; partial batch and retry.
- Assert public images have GPS/EXIF stripped and draft images are not anonymously delivered.
- Assert referenced media cannot be deleted, shared media remains after one content item is removed, and orphan cleanup is retryable/idempotent.
- Verify publish/unpublish, update, cover replacement, gallery order, feature flag, category search, and status transitions.

### Public site and regression tests

- Run existing `npm run lint` and `npm run build`; add targeted type checks/test commands only if needed.
- Smoke-test every current route and new admin route/deep link on the actual configured host. Check the public homepage venue carousel, Services detail/amenities carousel, portfolio masonry/grid, filters/search, lightbox, video branch, image placeholders, animations, breakpoints, and browser console.
- Check current WhatsApp actions still open their intended existing messages/destination; CMS changes should not alter the central contact behavior.
- Validate no drafts leak in network responses, rendered page HTML, client cache, or public storage.
- Verify state across two sessions/devices: publish, edit, reorder, unpublish, logout, role revocation, and bounded cache freshness.
- Use keyboard-only access and screen reader labels for admin tables, dialogs, file input/dropzone, upload progress, and error messages. Review color contrast against existing Cherry Blossom Pink tokens.
- No implementation is complete until the owner can perform the workflow from admin login through a published item appearing in both the intended public route and managed image delivery.

## 20. Backup, Recovery and Monitoring

- Confirm the Supabase plan's database backup/PITR retention and recovery point/time objectives with the owner; do not assume a free tier provides production-grade recovery.
- Database backups do not automatically prove that Storage objects are backed up. Maintain an object manifest with bucket/key/checksum and test restoration of both metadata and representative images.
- Use immutable/versioned object names and a documented retention policy. Restrict destructive dashboard access and separate project owner credentials from day-to-day admin accounts.
- Monitor Auth failures, Edge Function errors/latency, storage quota, upload failures, rejected file counts, public fetch errors, orphan queue age, and unusual delete/publish volume. Alert a named owner/operator.
- Include actor/action/entity/time in admin activity logs. Define retention and privacy access for logs; avoid logging full file bytes, auth tokens, customer phone/email, or unsanitized content.
- Schedule orphan cleanup in dry-run/report mode first, then enable deletion only after owner review. Keep retry/dead-letter reporting for failed storage/database consistency work.
- Document restoration and provider/account recovery contacts. Run a restore drill before public CMS launch and periodically thereafter.

## 21. Exact File-by-File Implementation Plan

Paths below are proposed files relative to the repository root. Existing paths were verified during this audit; paths under `supabase/`, `src/admin/`, and `src/lib/` do not yet exist and would be newly created. This list describes a scoped future implementation and grants no permission to edit files during this planning phase.

### Existing files to update

| Exact path | Planned change |
|---|---|
| `package.json` and `package-lock.json` | Add only the Supabase browser client dependency and the minimum local migration/test tooling approved for this implementation; add focused CMS scripts without changing React/Vite versions or unrelated packages. |
| `src/App.tsx` | Add `/admin/*` routes and isolate the admin shell from the existing public header/footer; preserve all nine current public route definitions and shared public behaviors. |
| `src/components/Portfolio.tsx` | Replace hard-coded image/social-wall data source with the CMS repository; preserve existing card/masonry/grid/filter/search/lightbox/booking/animation/video rendering and add loading/error/empty/image-fallback states. |
| `src/components/Hero.tsx` | Load published venue data for the existing home reception-hall carousel; preserve its images, auto-advance, controls, indicators, layout, and WhatsApp inquiry action. |
| `src/components/Services.tsx` | Load the same published venue records in the existing Services carousel/details panel; preserve amenities, capacity, booking/WhatsApp actions, motion, and responsive layout. |
| `.env.example.advanced` (or owner-approved `.env.example`) | Document only the public Supabase URL/anon key names and any local public configuration needed; never add a service-role key, secret value, or real credential. |
| `README.md` | Add concise owner/developer setup instructions for local Supabase config, migration/deployment, first-admin provisioning, public signup-disabled policy, and where server-only secrets are configured. Do not put credentials in docs. |
| `tailwind.config.js` | Only if the dashboard needs a missing alias for the existing Cherry Blossom Pink token; do not change the existing public palette or global design. |

### New frontend files

| Exact path | Planned responsibility |
|---|---|
| `src/lib/supabaseClient.ts` | Create one typed Supabase client from public Vite variables; fail clearly when required configuration is absent and never include server secrets. |
| `src/types/cms.ts` | Define typed portfolio, venue, gallery/media, publication state, and API error contracts shared by admin and public views. |
| `src/services/cmsRepository.ts` | Encapsulate public published reads, admin CRUD, ordering, cache invalidation, and typed error propagation. |
| `src/services/adminAuth.ts` | Wrap managed login/logout/session/MFA/admin-role checks; no custom signup/password store. |
| `src/services/mediaUploads.ts` | Request short-lived upload permission, upload to staging with progress/retry, finalize, and manage trusted media IDs. |
| `src/components/admin/AdminRoute.tsx` | Admin session/role/MFA route guard for UX; document that database/functions enforce authorization independently. |
| `src/components/admin/AdminLayout.tsx` | Isolated responsive CMS navigation/header/content shell using current brand tokens. |
| `src/components/admin/ConfirmActionDialog.tsx` | Accessible confirmation dialog for delete, unpublish, role-sensitive, and media cleanup actions. |
| `src/components/admin/ImageUploader.tsx` | Allowlisted multi-image selection/dropzone, previews, alt text, progress, cancellation, and per-file errors. |
| `src/components/admin/StatusBadge.tsx` | Consistent draft/published/staging/error status display. |
| `src/pages/admin/AdminLogin.tsx` | Invite-only sign-in and MFA challenge; no signup or password reset workflow that bypasses managed auth. |
| `src/pages/admin/AdminDashboard.tsx` | Admin-only counts and recent activity view. |
| `src/pages/admin/PortfolioManager.tsx` | Search/filter/list, ordering, status, create/edit/delete entry workflows. |
| `src/pages/admin/PortfolioEditor.tsx` | Validated portfolio metadata, media/gallery editor, draft/publish and preview. |
| `src/pages/admin/VenueManager.tsx` | Venue list, status, search, ordering, and CRUD entry point. |
| `src/pages/admin/VenueEditor.tsx` | Venue fields, amenities, capacity, cover/gallery, preview, draft/publish. |
| `src/pages/admin/MediaLibrary.tsx` | Admin-only media catalog, usage, preview, metadata, replacement, and safe orphan cleanup request. |

### New Supabase/backend files

| Exact path | Planned responsibility |
|---|---|
| `supabase/config.toml` | Local Supabase development configuration and safe auth/storage/function defaults; no credentials. |
| `supabase/migrations/<timestamp>_cms_schema.sql` | Create CMS tables, constraints, indexes, updated-at/audit helpers, and publication validation. |
| `supabase/migrations/<timestamp>_cms_rls_storage_policies.sql` | Enable RLS and define anon/admin policies for tables and staging/published buckets; deny public writes and role self-management. |
| `supabase/functions/create-upload-authorization/index.ts` | Validate admin JWT/role/MFA and issue narrow, short-lived staging upload permission. |
| `supabase/functions/finalize-upload/index.ts` | Verify staged object identity and actual image metadata/type/size/dimensions; create verified media record idempotently. |
| `supabase/functions/publish-content/index.ts` | Revalidate content/media, promote verified media, publish transactionally where possible, audit, and reconcile partial failures. |
| `supabase/functions/delete-orphan-media/index.ts` | Recheck references and retention, delete only safe unreferenced object, audit and retry failures. |
| `supabase/functions/_shared/auth.ts` | Shared server-side JWT, admin membership, MFA, CORS, and request validation helpers used by each function. |
| `supabase/functions/_shared/validation.ts` | Shared allowed file types, metadata constraints, sizes, dimensions, content-field limits, and normalized errors. |
| `supabase/tests/database/cms_rls.test.sql` | Automated SQL tests for anonymous, authenticated non-admin, admin, and revoked-admin table/storage policies. |
| `scripts/importLegacyCmsData.ts` | One-time repeatable import of current portfolio/social-wall and deduplicated venues; emit a parity/difference report and preserve external URLs. |

Add a deployment-host configuration file only after the actual host is confirmed. Do not add `vercel.json`, Netlify configuration, or another platform manifest by assumption.

## 22. Existing Files and Features That Must Remain Untouched

- Keep all current public routes, header/footer/navigation, SEO schemas, business information, contact details, EmailJS, analytics, and WhatsApp configuration unchanged except the minimal `/admin` route integration and dynamic data reads in the three audited content components.
- Keep the public site's page/section order, layouts, masonry design, carousel images/controls/timing, lightbox, animations, hover behavior, responsive breakpoints, loading, and current Cherry Blossom Pink theme.
- Do not move or rewrite `src/components/Portfolio.tsx`, `src/components/Hero.tsx`, or `src/components/Services.tsx` wholesale. Make narrow data-source/async-state changes while retaining their existing render and interaction code.
- Do not rewrite or replace existing Cloudinary/Postimages image URLs, obtain/download remote content, or assume that the site owns those provider accounts. Preserve external references during migration.
- Do not remove the Portfolio component's video branch or change media types outside the approved CMS scope.
- Do not modify `src/components/Contact.tsx`, `src/utils/whatsappConfig.ts`, public forms, business phone, existing API/integration settings, SEO domains, logos/favicon, unrelated content, or legacy `app/page.tsx`.
- Do not read or commit `.env`; do not expose service-role/auth credentials in client JavaScript, build artifacts, docs, screenshots, logs, or repository history.
- During the planning phase, changes were intentionally deferred. Phase 4 added local dependency/schema/UI/function/importer files; no cloud service was configured, no remote database migration was applied, and no media was uploaded.
- Do not commit generated `dist/` output, dependency updates unrelated to the CMS, or local admin data.

## 23. Risks, Dependencies and Owner Actions

1. **Provider ownership is unknown.** Existing Cloudinary URLs and an example cloud-name variable do not prove JP Events owns the account or can upload. The recommended new CMS uses Supabase; owner must create/authorize the project and accept current storage/transformation costs.
2. **Hosting is unknown.** The static host, production origin, SPA fallback, security-header configuration, and deployment pipeline must be identified before auth redirects, CORS, CSP, or deep-link behavior can be completed.
3. **No persistent database or API exists.** All CMS data must be migrated and the public pages will depend on network availability after cutover. Owner must approve failure behavior and operational support.
4. **Venue arrays are duplicated.** The home and Services versions mostly agree but have different fields. The owner must review conflicting text/images/amenities before import and select the canonical copy for each field.
5. **Current portfolio content is hard-coded.** The initial import must include all 12 existing cards and preserve their metadata/URLs. Any historical non-image/video records discovered during implementation require an explicit compatibility decision.
6. **Security depends on configuration.** A wrong RLS/Storage policy can expose drafts or allow upload/delete. Production launch is blocked until policy tests are run against a real staging project and a non-admin account.
7. **Images may be publicly accessible after publish.** The business must confirm that every photo has permission for public display and that draft assets should remain private. Any consent/privacy takedown process must be defined.
8. **Image transformations and EXIF sanitization vary by provider and plan.** Test output with GPS-tagged and malformed files; do not assume upload-time metadata removal or transformations are included in a plan.
9. **Email deliverability/MFA recovery and owner account administration are external.** Establish owner email, recovery contacts, MFA backup, and secondary project operator before launch.
10. **Data deletion and backups cross service boundaries.** Database and object storage cannot be deleted/committed in one transaction. Use stateful cleanup, idempotency, backups, logs, and tested recovery.
11. **Cost and quota estimates are missing.** The owner must provide expected image count, average size, monthly views/bandwidth, admin count, retention, and growth; check then-current provider pricing and limits.
12. **No automated test runner exists.** Add only focused security/migration checks needed to prove RLS, upload validation, and no public regressions.
13. **No Git repository was detected at the supplied workspace root in the preceding work.** During implementation, preserve any user changes and establish the actual project version-control/deployment process before applying changes.

## 24. Step-by-Step Implementation Sequence

1. Obtain owner approval for Supabase, data migration, image-publication consent, image size/dimension limits, admin identities/MFA, cache freshness, hosting origin, and backup/recovery targets.
2. Provision a non-production Supabase project and identify the real static host; document secrets in provider-managed secret storage without printing them.
3. Define schema/contracts and the publication state machine. Review deduplicated venue data and the legacy import report before coding.
4. Create migrations, indexes, RLS/table policies, storage buckets/policies, audit helpers, and SQL tests. Prove anon and non-admin denial before building UI.
5. Implement shared frontend CMS/Auth/media services and Edge Functions with independent JWT/admin/MFA checks, upload validation, idempotency, CORS, and rate limits.
6. Build `/admin/*` as a separate route/layout; provision/invite the first admin out of band and verify login/MFA/logout/role revocation.
7. Build dashboard, portfolio/venue editors, media library, accessible validation, upload progress/retry, confirmations, audit activity, and mobile layouts.
8. Import the 12 current portfolio/social-wall records and 9 unique venue records as external media references, reconcile differences, and require owner parity approval.
9. Switch `src/components/Portfolio.tsx` to published CMS data while preserving the UI and test its loading/error/empty states, filters, detail modal, media branches, and WhatsApp action.
10. Switch the `src/components/Hero.tsx` and `src/components/Services.tsx` venue views to the same published venue source, retaining both distinct current presentations and controls.
11. Run SQL/RLS/storage/function tests, image-validation cases, lint/build, all public/admin route smoke tests, desktop/mobile visual regression, network/console checks, and cache/second-device tests.
12. Deploy migrations and functions to staging, validate policy and backup/restore, then deploy production backend before the UI cutover. Keep a rollback path to the versioned static content until parity and stability pass.
13. Enable cleanup only in report/dry-run mode first. Review candidates, then enable delayed deletion with audit and monitoring.
14. Hand over project ownership, admin provisioning/revocation, secret rotation, backup restore, quotas/cost monitoring, and incident/takedown procedures. Do not call CMS launch complete before owner acceptance of the end-to-end publish flow.

## 25. Acceptance Criteria

- No public account creation exists. Only explicitly provisioned admins can access admin content or execute any write/upload/publish/delete operation.
- Admin role is checked by backend/database policies for every privileged API operation, not just the React route guard.
- First admin can be securely invited/provisioned without hardcoded passwords or browser-visible privileged credentials; MFA, rate limits, logout, recovery, and role revocation are tested.
- Portfolio and venue content are stored persistently in a managed database; image bytes live in persistent cloud storage and remain available across redeployments/restarts.
- Admin can create, edit, save draft, publish/unpublish, feature, reorder, and remove portfolio entries; venue edits cover title/name, details, capacity, amenities, cover, and ordered galleries.
- Upload accepts only approved raster formats, enforces actual file/signature/size/dimension checks on the server, rejects SVG/unsafe types, reports progress/failure accurately, and strips GPS/EXIF from public derivatives.
- No image with any content reference can be deleted; safe orphan cleanup is delayed, auditable, retryable, and tested.
- Publishing a portfolio entry makes it appear in the existing portfolio presentation; publishing a venue makes it appear in both existing home and Services hall presentations using the same record.
- Anonymous reads contain published records only; drafts and admin activity are not publicly accessible; public image access grants no public write/delete ability.
- Existing routes, Cherry Blossom Pink brand/theme, masonry layout, both carousel designs, imagery, responsiveness, animations, controls, WhatsApp behavior, and video rendering remain intact.
- Loading/error/empty/missing-image behavior is understandable and does not crash or silently publish stale content.
- Updates propagate within the documented cache bound; image replacements use new versioned object keys and do not display stale cached media.
- Migration parity, database/storage policies, Edge Function authorization, file validation, backups/restore, build/lint, and route/regression checks pass in staging before production launch.
- Owner has approved production provider plans/costs, account ownership, admin roster, hosting origins, privacy/content rights, and operational handover.

## 26. Phase 4 Implementation Status

### Implemented locally

- Added the Supabase JS client dependency and a lazy, explicit configuration guard in `src/lib/supabaseClient.ts`. No service-role key is used by browser code.
- Added CMS record/view types and the legacy migration data module in `src/types/cms.ts` and `src/data/legacyCmsData.ts`.
- Added `src/services/cmsRepository.ts` for public/admin reads, drafts, publishing, status changes, deletion, ordering, and media metadata; `src/services/mediaUploads.ts` for allowlisted upload checks, progress, and server finalization.
- Added `src/hooks/usePublishedContent.ts` with a 30-second public cache. Unconfigured builds retain the original local content; configured CMS reads use published data only and show errors without silently falling back to stale static content.
- Connected the public portfolio and both existing venue presentations in `src/components/Portfolio.tsx`, `src/components/Hero.tsx`, and `src/components/Services.tsx`. Existing page structure, motion/carousel controls, filters, lightbox, WhatsApp actions, and video rendering remain in place; the portfolio lightbox can show CMS gallery images.
- Added an isolated `/admin/*` route in `src/App.tsx` and the responsive admin interface in `src/pages/AdminCms.tsx`. It has invite-only password sign-in, trusted `app_metadata.cms_role` checking, required TOTP/AAL2, dashboard counts/activity, portfolio and venue draft editing, gallery selection/upload, explicit publish/unpublish/archive/delete, ordering, media alt text, and delayed media-deletion requests.
- Added `supabase/migrations/202611140001_cms.sql`, `supabase/config.toml`, and Edge Functions for upload finalization, publishing, delayed deletion requests, and orphan cleanup. RLS and function checks require a server-provisioned admin role and AAL2. The public media policy avoids cross-table RLS recursion; deleted managed assets can clear their storage path.
- Added repeatable source-based legacy import tooling at `scripts/import-legacy-cms.mjs`. It imports 12 portfolio records, the 9 deduplicated venues in `legacyCmsData.ts`, and existing remote image URLs as external media references; it does not download assets. Existing slugs and media links are not overwritten.
- Added public client placeholders to `.env.example.advanced` and local/staging setup guidance to `README.md`. `IMPLEMENTATION1.md` now records implementation and validation results.

### Files changed

- `package.json`, `package-lock.json` — add `@supabase/supabase-js`.
- `.env.example.advanced`, `README.md`, `IMPLEMENTATION1.md` — safe public configuration placeholders, owner setup/limitations, and this status record.
- `src/App.tsx`, `src/pages/AdminCms.tsx` — isolated admin route and CMS UI.
- `src/components/Portfolio.tsx`, `src/components/Hero.tsx`, `src/components/Services.tsx` — published CMS content sources with the existing public presentation retained.
- `src/types/cms.ts`, `src/data/legacyCmsData.ts`, `src/lib/supabaseClient.ts`, `src/hooks/usePublishedContent.ts`, `src/services/cmsRepository.ts`, `src/services/mediaUploads.ts` — CMS types, fallback/import data, client, cache, repository, and upload flow.
- `supabase/config.toml`, `supabase/migrations/202611140001_cms.sql`, `supabase/functions/_shared/auth.ts`, `supabase/functions/_shared/images.ts`, `supabase/functions/finalize-upload/index.ts`, `supabase/functions/publish-content/index.ts`, `supabase/functions/request-media-deletion/index.ts`, `supabase/functions/cleanup-orphan-media/index.ts` — local Supabase config, schema/RLS/storage, authentication, and privileged operations.
- `scripts/import-legacy-cms.mjs` — repeatable import of the current static public content.

### Not deployed or verified

- No Supabase project credentials are configured, and the migration, Edge Functions, RLS, Storage policies, Auth MFA, and importer have **not** been applied or exercised against a local or staging Supabase project. No data has been uploaded or imported by this implementation.
- Production first-admin provisioning, administrator MFA recovery, exact production CORS origins, database backups/restore, image-content rights, and deployment-host SPA rewrites remain owner/operator tasks.
- No cleanup schedule was created. Cleanup requests enter a seven-day grace state; an authorized operator must arrange and test how the cleanup function is run.
- The image checks inspect signatures/container structure and dimensions and remove selected metadata chunks, but they do not fully decode/re-encode every format or provide malware scanning. JPEG/PNG/WebP are supported; SVG, AVIF, and video upload are not.
- Staging image previews use signed URLs. Persistent image serving, actual upload progress, publishing, and cross-provider copy behavior still require staging verification.
- A `tsc -b` run still reports pre-existing project diagnostics in analytics/SEO/configuration files, including the missing declaration for `src/utils/analytics.js` imported by `src/App.tsx`; no diagnostics pointed at the new CMS files or modified portfolio/venue components after their adapter typing was corrected. The repository has no test script and no Git metadata was available at the workspace root, so no Git diff/status could be used.
- `npm install` reported 22 dependency audit vulnerabilities (1 low, 5 moderate, 16 high). No automated audit fix or unrelated upgrade was performed.

### Validation performed locally

- `npm run lint`: passed with 0 errors; 20 warnings remain in existing LoadingScreen, PageLoader, SEO, Testimonials, and preloader files.
- `npm run build`: passed. Vite reported stale browser-data notices and the existing 500 kB chunk-size warning.
- `node --check scripts/import-legacy-cms.mjs`: passed.
- The local Vite `/admin` route returned HTTP 200 and the browser rendered the configuration warning with sign-in disabled; the public `/portfolio` route also loaded in the local browser. Browser logs included aborted external Google Analytics collection requests from existing global tracking; no new CMS runtime exception was observed. This was a route/UI smoke check, not a full console or feature regression test. No remote auth, database, Storage, upload, publish, RLS, or production testing is claimed.

### Required owner actions before cutover

1. Provision and secure the Supabase project, set the two public Vite variables locally/deployment-side, and apply the migration and four functions using the documented setup.
2. Invite the administrator, grant `app_metadata.cms_role = admin` through a trusted operator-only path, and verify TOTP MFA/AAL2 plus denial for a non-admin account.
3. Confirm public-use permission for all legacy images, run `scripts/import-legacy-cms.mjs` with service-role credentials only in the local process environment, and verify all 12 portfolio entries and 9 unique venues before enabling configured CMS variables for the live site.
4. On staging, exercise anon/non-admin/admin RLS, signed staging previews, upload of valid and malformed images, publish/unpublish, gallery ordering, media cleanup and recovery, mobile admin UI, public routes, and rollback before production cutover.
5. Review the dependency audit with the project owner and separately decide whether to remediate; do not run a broad dependency upgrade as part of CMS rollout.

## 27. Phase 5 — Admin Navigation and Dynamic Venue Publishing

### Implemented locally

- Added responsive public-site navigation to `/admin/login`. After Supabase confirms an `app_metadata.cms_role` admin and an AAL2 session, the navigation instead offers `/admin/dashboard` and a separate Logout action. Admin route URLs track the selected dashboard, venues, portfolio, and media views; non-authorized sessions are redirected to the login route. Database and Edge Function authorization remain authoritative.
- Added the `venue_categories` registry and seeded the existing Reception Halls homepage section. The venue schema now requires a category and stores INR public-price type, amount, and note. The publish RPC rejects inactive or unmapped categories. The admin editor loads canonical categories and supports price editing without inventing a price.
- Connected both existing reception-hall presentations to the same published venue feed. The editor marks the first media image as the cover, supports reordering/removing gallery images, and the public views show only the cover in the existing carousel while displaying available public pricing. Published content is refreshed through Supabase Realtime plus 20-second polling and visible-tab revalidation.
- Updated the legacy importer for the category and pricing schema and for ordered cover/gallery relationships, preserving the existing first image as the cover and defaulting unpriced records to “Contact for quote.”

### Phase 5 files changed

- `src/components/Header.tsx` — desktop/mobile Admin Login, verified-admin Dashboard/Logout, and surfaced authentication-action errors.
- `src/pages/AdminCms.tsx` — path-aware admin views, category and pricing fields, and cover/gallery ordering controls.
- `src/components/Hero.tsx`, `src/components/Services.tsx` — shared published venue data and public price display within the existing carousel layouts.
- `src/hooks/usePublishedContent.ts` — shared venue snapshot with Realtime subscription, periodic refresh, and legacy fallback (already updated during this phase).
- `src/types/cms.ts`, `src/services/cmsRepository.ts` — venue category, price, read, and draft-write types/data.
- `supabase/migrations/202611140002_venue_categories_pricing.sql` — category registry, venue columns/backfill, RLS, and category-aware publish validation.
- `scripts/import-legacy-cms.mjs` — category assignment and ordered venue media relationships.
- `IMPLEMENTATION1.md` — this implementation and validation record.

### Phase 5 validation and remaining limitations

- `npm run lint`: passed with 0 errors; the same 20 existing warnings remain.
- `npm run build`: passed; Vite reported stale browser data and the existing 500 kB chunk-size warning.
- `node --check scripts/import-legacy-cms.mjs`: passed.
- `npx tsc --noEmit -p tsconfig.app.json`: still exits with pre-existing project diagnostics in analytics/SEO/configuration files; no diagnostics referenced the Phase 5 files.
- The local browser rendered the public home route, verified the Admin Login link in desktop and mobile navigation (both point to `/admin/login`), and confirmed that an unauthenticated `/admin/dashboard` request redirects to the login page. The login route reported that CMS configuration is missing. External analytics requests were aborted and existing asset-preload warnings appeared; this was only a route/render smoke check, not an auth, full visual, console-cleanliness, or end-to-end CMS test.
- Supabase is not configured for this workspace. The new migration and Edge Function behavior, role/AAL2 checks against a real project, data import, publishing, Realtime delivery, and cross-device updates remain unverified until owner-provisioned staging credentials and deployment are available. The implementation uses 20-second polling as a refresh fallback.
- The repository root has no Git metadata, so a Git diff/status review could not be performed. No tests script is defined in `package.json`.
