/**
 * Content SEO Tools
 * Analyzes and optimizes content for SEO
 */

/**
 * Auto-generate meta description from content
 * @param {string} content - Page content
 * @param {number} maxLength - Max description length (default: 155-160)
 * @returns {string} Generated meta description
 */
export function generateMetaDescription(content, maxLength = 158) {
  if (!content) return '';

  // Remove HTML tags and extra whitespace
  const cleanedContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Try to end at a sentence boundary
  const truncated = cleanedContent.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastPeriod > maxLength - 20) {
    return truncated.substring(0, lastPeriod + 1);
  }

  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Calculate keyword density
 * @param {string} text - Content text
 * @param {string} keyword - Keyword to analyze
 * @returns {Object} {density: number, count: number, totalWords: number}
 */
export function calculateKeywordDensity(text, keyword) {
  if (!text || !keyword) return null;

  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
  const words = cleanText.split(/\s+/).filter(Boolean);
  const keywordRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
  const matches = text.match(keywordRegex) || [];

  const totalWords = words.length;
  const keywordCount = matches.length;
  const density = totalWords > 0 ? ((keywordCount / totalWords) * 100).toFixed(2) : 0;

  return {
    density: parseFloat(density),
    count: keywordCount,
    totalWords,
    recommendation: density < 0.5 ? 'Low - consider adding more instances' : 
                   density > 3 ? 'High - may appear as keyword stuffing' : 
                   'Optimal (0.5-3%)'
  };
}

/**
 * Calculate Flesch-Kincaid readability score
 * @param {string} text - Content text
 * @returns {Object} {score: number, grade: number, level: string}
 */
export function calculateReadability(text) {
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const words = text.split(/\s+/).length;
  const syllables = (text.match(/[aeiouy]/gi) || []).length;

  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  const grade = Math.round(score / 10);

  let level;
  if (score > 90) level = 'Very Easy - 5th grade';
  else if (score > 80) level = 'Easy - 6th grade';
  else if (score > 70) level = 'Fairly Easy - 7th grade';
  else if (score > 60) level = 'Standard - 8th-9th grade';
  else if (score > 50) level = 'Fairly Difficult - 10-12th grade';
  else level = 'Difficult - College level';

  return {
    score: Math.round(score),
    grade,
    level,
    recommendation: score >= 60 && score <= 70 ? 'Optimal for web content' : 
                   score < 60 ? 'Too complex - simplify language' : 
                   'May be too simple'
  };
}

/**
 * Validate heading hierarchy
 * @param {HTMLElement|string} element - DOM element or HTML string
 * @returns {Object} {valid: boolean, errors: string[]}
 */
export function validateHeadingHierarchy(element) {
  let html;
  
  if (typeof element === 'string') {
    html = element;
  } else if (element.innerHTML) {
    html = element.innerHTML;
  } else {
    return { valid: false, errors: ['Invalid element'] };
  }

  const headings = html.match(/<h[1-6]>/gi) || [];
  const errors = [];
  let lastLevel = 0;

  if (!headings.some(h => h.toLowerCase() === '<h1>')) {
    errors.push('Missing H1 tag - each page should have exactly one H1');
  }

  if ((html.match(/<h1>/gi) || []).length > 1) {
    errors.push('Multiple H1 tags found - should have only one per page');
  }

  return {
    valid: errors.length === 0,
    errors,
    headingCount: headings.length,
    recommendation: 'Ensure proper H1 → H2 → H3 hierarchy'
  };
}

/**
 * Get internal linking suggestions
 * @param {string} content - Page content
 * @param {Array} availablePages - Array of {title, url, keywords}
 * @returns {Array} Suggested links
 */
export function getInternalLinkSuggestions(content, availablePages = []) {
  const suggestions = [];

  availablePages.forEach(page => {
    page.keywords?.forEach(keyword => {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        suggestions.push({
          keyword,
          suggestedPage: page.title,
          url: page.url,
          confidence: 'high'
        });
      }
    });
  });

  return suggestions.slice(0, 5); // Return top 5 suggestions
}

/**
 * Analyze content length
 * @param {string} content - Content text
 * @returns {Object} Content metrics
 */
export function analyzeContentLength(content) {
  const words = content.split(/\s+/).filter(Boolean).length;
  const characters = content.length;
  const readingTime = Math.ceil(words / 200); // Average reading speed: 200 WPM

  return {
    words,
    characters,
    readingTime,
    recommendation: words < 300 ? 'Short - consider expanding content' :
                   words > 3000 ? 'Long - consider breaking into sections' :
                   'Optimal length'
  };
}

/**
 * Extract LSI keywords (Latent Semantic Indexing)
 * @param {string} content - Content text
 * @returns {Array} Related keywords
 */
export function extractLSIKeywords(content) {
  // Simplified LSI extraction - in production, use NLP library
  const words = content
    .toLowerCase()
    .match(/\b\w{4,}\b/g) || [];
  
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, frequency: count }));
}

/**
 * Detect duplicate content
 * @param {Array} pages - Array of {url, content}
 * @returns {Array} Potential duplicates
 */
export function detectDuplicateContent(pages) {
  const duplicates = [];
  
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const similarity = calculateTextSimilarity(pages[i].content, pages[j].content);
      if (similarity > 0.8) {
        duplicates.push({
          page1: pages[i].url,
          page2: pages[j].url,
          similarity: (similarity * 100).toFixed(2),
          recommendation: 'Consider using canonical tags or consolidating pages'
        });
      }
    }
  }

  return duplicates;
}

/**
 * Calculate text similarity (0-1 scale)
 * @private
 */
function calculateTextSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
