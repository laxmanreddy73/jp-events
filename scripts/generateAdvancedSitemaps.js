/**
 * Advanced Sitemap Generation Script for JP Events
 * Generates multiple sitemaps: main, images, videos, news, mobile
 * 
 * Usage: node scripts/generateAdvancedSitemaps.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITEMAP_CONFIG = {
  baseUrl: process.env.VITE_SITE_URL || 'https://subadesignsanddecoration.com',
  maxUrls: 50000,
  imageSitemap: true,
  videoSitemap: false,
  newsSitemap: false,
  mobileSitemap: true
};

/**
 * Generate XML sitemap
 * @param {Array} urls - Array of {loc, lastmod, changefreq, priority}
 * @returns {string} XML sitemap
 */
function generateXML(urls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXML(url.loc)}</loc>\n`;
    if (url.lastmod) xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    if (url.changefreq) xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    if (url.priority) xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate sitemap index
 * @param {Array} sitemapUrls - Array of sitemap URLs
 * @returns {string} XML sitemap index
 */
function generateSitemapIndex(sitemapUrls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const today = new Date().toISOString().split('T')[0];
  
  sitemapUrls.forEach(url => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${escapeXML(url.loc)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });

  xml += '</sitemapindex>';
  return xml;
}

/**
 * Generate image sitemap
 */
function generateImageSitemap(imageUrls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '         xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  imageUrls.forEach(item => {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXML(item.pageUrl)}</loc>\n`;
    item.images?.forEach(img => {
      xml += '    <image:image>\n';
      xml += `      <image:loc>${escapeXML(img.url)}</image:loc>\n`;
      if (img.title) xml += `      <image:title>${escapeXML(img.title)}</image:title>\n`;
      if (img.caption) xml += `      <image:caption>${escapeXML(img.caption)}</image:caption>\n`;
      xml += '    </image:image>\n';
    });
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt(sitemapUrls) {
  let robots = `# Robots.txt for JP Events
# https://subadesignsanddecoration.com

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /api/

Crawl-delay: 1

# Sitemaps
`;

  sitemapUrls.forEach(url => {
    robots += `Sitemap: ${url.loc}\n`;
  });

  return robots;
}

/**
 * Main sitemap generation
 */
async function generateSitemaps() {
  try {
    const publicDir = path.join(__dirname, '../public');
    
    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Define all pages for JP Events
    const pages = [
      { 
        loc: '/', 
        priority: 1.0, 
        changefreq: 'weekly',
        lastmod: new Date().toISOString().split('T')[0]
      },
      { 
        loc: '/about', 
        priority: 0.9, 
        changefreq: 'monthly',
        lastmod: '2024-01-15'
      },
      { 
        loc: '/services', 
        priority: 0.95, 
        changefreq: 'weekly',
        lastmod: '2024-01-10'
      },
      { 
        loc: '/portfolio', 
        priority: 0.9, 
        changefreq: 'weekly',
        lastmod: '2024-01-12'
      },
      { 
        loc: '/contact', 
        priority: 0.85, 
        changefreq: 'monthly',
        lastmod: '2024-01-08'
      }
    ];

    // Add base URL to all pages
    const fullUrls = pages.map(page => ({
      ...page,
      loc: `${SITEMAP_CONFIG.baseUrl}${page.loc}`
    }));

    // Generate main sitemap
    const mainSitemap = generateXML(fullUrls);
    const mainPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(mainPath, mainSitemap);
    console.log('✓ Generated main sitemap:', mainPath);

    // Generate image sitemap if enabled
    let imageSitemaps = [];
    if (SITEMAP_CONFIG.imageSitemap) {
      const imageUrls = [
        {
          pageUrl: `${SITEMAP_CONFIG.baseUrl}/portfolio`,
          images: [
            { 
              url: `${SITEMAP_CONFIG.baseUrl}/images/portfolio-1.jpg`, 
              title: 'Residential Interior Design - Living Room',
              caption: 'Modern living room interior design by JP Events Hyderabad'
            },
            { 
              url: `${SITEMAP_CONFIG.baseUrl}/images/portfolio-2.jpg`, 
              title: 'Commercial Office Interior Design',
              caption: 'Professional office space design in Hyderabad'
            },
            { 
              url: `${SITEMAP_CONFIG.baseUrl}/images/portfolio-3.jpg`, 
              title: 'Home Decoration Services',
              caption: 'Complete home decoration and interior design solutions'
            }
          ]
        },
        {
          pageUrl: `${SITEMAP_CONFIG.baseUrl}/services`,
          images: [
            { 
              url: `${SITEMAP_CONFIG.baseUrl}/images/services-1.jpg`, 
              title: 'Residential Interior Design Services',
              caption: 'Custom residential interior design for homes and apartments'
            }
          ]
        }
      ];

      const imageSitemap = generateImageSitemap(imageUrls);
      const imagePath = path.join(publicDir, 'sitemap-images.xml');
      fs.writeFileSync(imagePath, imageSitemap);
      console.log('✓ Generated image sitemap:', imagePath);
      imageSitemaps.push({ loc: `${SITEMAP_CONFIG.baseUrl}/sitemap-images.xml` });
    }

    // Generate sitemap index
    const sitemapFiles = [
      { loc: `${SITEMAP_CONFIG.baseUrl}/sitemap.xml` },
      ...imageSitemaps
    ];

    const sitemapIndex = generateSitemapIndex(sitemapFiles);
    const indexPath = path.join(publicDir, 'sitemap-index.xml');
    fs.writeFileSync(indexPath, sitemapIndex);
    console.log('✓ Generated sitemap index:', indexPath);

    // Update robots.txt
    const allSitemaps = [
      `${SITEMAP_CONFIG.baseUrl}/sitemap-index.xml`,
      `${SITEMAP_CONFIG.baseUrl}/sitemap.xml`,
      ...imageSitemaps.map(s => s.loc)
    ];

    const robotsTxt = generateRobotsTxt(allSitemaps);
    const robotsPath = path.join(publicDir, 'robots.txt');
    fs.writeFileSync(robotsPath, robotsTxt);
    console.log('✓ Updated robots.txt:', robotsPath);

    // Print summary
    console.log('\n🎉 Sitemap generation complete!');
    console.log(`📊 Total pages: ${pages.length}`);
    console.log(`🌐 Base URL: ${SITEMAP_CONFIG.baseUrl}`);
    console.log(`📁 Output directory: ${publicDir}`);
    
    console.log('\n📄 Generated files:');
    console.log('  - sitemap.xml');
    if (SITEMAP_CONFIG.imageSitemap) console.log('  - sitemap-images.xml');
    console.log('  - sitemap-index.xml');
    console.log('  - robots.txt');

  } catch (error) {
    console.error('❌ Sitemap generation failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemaps();
}

export { generateSitemaps };