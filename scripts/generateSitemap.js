// Sitemap Generator Script
// Run: node scripts/generateSitemap.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define your routes - Updated for interior design business
const routes = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/about", priority: 0.9, changefreq: "monthly" },
  { path: "/services", priority: 0.95, changefreq: "weekly" },
  { path: "/portfolio", priority: 0.9, changefreq: "weekly" },
  { path: "/contact", priority: 0.85, changefreq: "monthly" },
];

// Base URL - updated to actual business domain
const baseURL = process.env.VITE_SITE_URL || "https://subadesignsanddecoration.com";

function generateSitemapXML(routes) {
  const today = new Date().toISOString().split("T")[0];

  const urlEntries = routes
    .map(
      (route) =>
        `  <url>
    <loc>${baseURL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function generateSitemapIndex(sitemaps) {
  const sitemapEntries = sitemaps
    .map(
      (sitemap) =>
        `  <sitemap>
    <loc>${baseURL}/${sitemap}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, "../public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate main sitemap
try {
  const sitemapXML = generateSitemapXML(routes);
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXML);
  console.log("✓ Generated sitemap.xml");

  // Only generate sitemap index if you have multiple sitemaps
  // For now, just generate the main sitemap
  // const sitemapIndex = generateSitemapIndex(["sitemap.xml"]);
  // fs.writeFileSync(path.join(publicDir, "sitemap-index.xml"), sitemapIndex);
  // console.log("✓ Generated sitemap-index.xml");

  console.log(`\n✓ Sitemap generated successfully!`);
  console.log(`Base URL: ${baseURL}`);
  console.log(`Routes included: ${routes.length}`);
  console.log(`Output directory: ${publicDir}`);
  
  // Print routes for verification
  console.log("\nRoutes included:");
  routes.forEach(route => {
    console.log(`  - ${route.path} (priority: ${route.priority})`);
  });
  
} catch (error) {
  console.error("❌ Error generating sitemap:", error);
  process.exit(1);
}