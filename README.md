# JP Events Website

A luxury wedding planning and decoration website built with React, TypeScript, and Tailwind CSS.

## Features

- **Responsive Design**: Mobile-first approach with beautiful animations
- **Contact Form with EmailJS**: Automated email responses and notifications
- **Portfolio Gallery**: Showcase of wedding projects with video support
- **Service Pages**: Comprehensive wedding services information
- **Loading Animations**: Smooth loading experience
- **SEO Optimized**: Meta tags and structured data

## EmailJS Setup

To enable the contact form email functionality:

1. **Create EmailJS Account**: Sign up at [EmailJS.com](https://www.emailjs.com/)

2. **Get Your Public Key**: 
   - Go to EmailJS Dashboard > Account > API Keys
   - Copy your Public Key

3. **Update Configuration**:
   - Open `src/components/Contact.tsx`
   - Replace `YOUR_EMAILJS_PUBLIC_KEY` with your actual public key

4. **Email Templates**:
   The project is configured to use these templates:
   - **Contact Us Template** (`template_s207awp`): Sends inquiry to business
   - **Auto-Reply Template** (`template_ak02mxm`): Sends confirmation to customer
   - **Service ID** (`service_9aspror`): Gmail service connection

5. **Template Variables**:
   Make sure your EmailJS templates include these variables:
   
   **Contact Us Template**:
   - `{{from_name}}` - Customer name
   - `{{from_email}}` - Customer email
   - `{{phone}}` - Customer phone
   - `{{event_date}}` - Event date
   - `{{venue}}` - Event venue
   - `{{event_type}}` - Type of event
   - `{{guest_count}}` - Number of guests
   - `{{budget}}` - Budget range
   - `{{message}}` - Customer message

   **Auto-Reply Template**:
   - `{{to_name}}` - Customer name
   - `{{to_email}}` - Customer email
   - `{{event_type}}` - Type of event
   - `{{event_date}}` - Event date
   - `{{from_name}}` - Business name
   - `{{from_email}}` - Business email

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Admin CMS setup

The admin route is `/admin`. The CMS is **not active until a Supabase project has been provisioned and configured**. Do not copy a service-role key into any `VITE_` variable or browser code.

1. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The publishable key is intended for browser use; never put a secret/service-role key in a `VITE_` variable. `.env.local` is ignored by Git.
2. The migrations create the CMS tables, policies and private upload staging bucket, and configure `jp-events-media` as the public destination for published files under `portfolio/` and `venues/`. A public bucket exposes every object in it, not just files linked to published database rows, so review all existing objects and policies before applying the migration. Draft uploads remain in the private staging bucket. Then install and authenticate the Supabase CLI, link the owner-approved project and apply the migrations:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

3. Deploy the five Edge Functions: `finalize-upload`, `publish-content`, `request-media-deletion`, `cleanup-orphan-media`, and `replace-site-image`. Configure the `CMS_ALLOWED_ORIGINS` function secret with the exact local and production origins. Supabase supplies its URL and service-role secret to deployed functions; never expose or print those values.
4. In Supabase Auth, leave public signup disabled and invite the administrator. After the invite is accepted, use the Supabase SQL Editor as the trusted project owner to grant the role to that exact user ID:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"cms_role":"admin"}'::jsonb
   where id = 'REPLACE_WITH_THE_INVITED_USER_UUID';
   ```

   Confirm exactly one row was updated. Do not grant roles from user-editable metadata. On first `/admin` sign-in, the CMS requires TOTP MFA enrollment and AAL2 verification.
5. Before enabling the frontend against this project, review the legacy-import summary and confirm image publication rights. From the project root, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only in the local process environment, then run:

   ```bash
   node scripts/import-legacy-cms.mjs
   ```

   The importer creates the 12 current portfolio entries, 9 deduplicated venues, and external image references without downloading images. It skips existing slugs and media links so reruns do not overwrite owner edits. Keep the service-role value out of command history, logs, and source files.
6. Smoke-test public published-content reads, admin draft creation, image upload, publish/unpublish, and access denial using a non-admin account on a staging project before production deployment.

The public pages continue to use their existing local content while Supabase is unconfigured. Once configured, they use published CMS data and report CMS read failures instead of silently showing stale static content. Apply the migration and import before switching a live deployment to configured CMS variables.

Image uploads accept JPEG, PNG, and WebP up to 10 MiB and 36 megapixels; SVG/AVIF and video uploads are not supported. The server checks signatures/container structure and dimensions and strips selected metadata chunks, but it does not fully decode/re-encode every image. Treat the current verification pipeline as a limited validator, not a complete malware or decoder safety guarantee.

Media cleanup is intentionally delayed for seven days and refuses to delete referenced assets. No scheduled cleanup job is configured; invoke the cleanup function through an approved administrator workflow after the grace period.

### Visual website image editor

After migrations `202611140001` through `202611140004` are applied and the `replace-site-image` Edge Function is deployed, an authenticated admin with the provisioned `cms_role=admin` and AAL2 MFA can select **Edit Website Images** in the CMS header. On the public site, click an approved image to preview and replace it. The editing controls are off by default and are cleared on sign-out.

Approved slots include `home.hero.slide-01` through `home.hero.slide-03`, published portfolio ribbon covers under `home.moments.portfolio-{published-portfolio-id}`, the four homepage service cards, nine Services-page category covers, `home.experiences.featured`, `home.about.story-01` through `home.about.story-03`, and `venues.{venue-id}.cover`. Portfolio gallery management remains in the existing Portfolio CMS; venue gallery management remains in the existing Venue CMS.

The `site_image_slots` table stores image overrides and metadata, not image binaries. Replacements use unique immutable object paths in `jp-events-media/site-content/`; the function validates image signature, dimensions, size, extension and slot authorization before saving. Public reads use active overrides with the original component image as fallback. The migration enables Realtime for image slots and the client also refreshes on visibility changes and periodically. Replaced objects are removed only after checking for remaining CMS and slot references.

JPEG, PNG and WebP up to 10 MiB are supported. AVIF and SVG are rejected because the deployed image verifier does not support them. The editor and server-side authorization are implemented, but require the owner to apply migrations and deploy the function. Live replacement, storage policy, and visitor/admin browser tests remain unverified until the configured project is available.

## Build

```bash
npm run build
```

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- EmailJS
- Lucide React Icons
- Vite

## Contact

For any questions about the website, contact JP Events at jpevents@gmail.com