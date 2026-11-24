import { useState, useEffect, useCallback } from 'react';
import {
  generateMetaDescription,
  calculateKeywordDensity,
  calculateReadability,
  validateHeadingHierarchy,
  analyzeContentLength,
  extractWeddingKeywords,
  analyzeSentiment,
  checkLocalReferences
} from '../../utils/contentSEO';

/**
 * Real-time SEO Content Analysis Component for Wedding Business
 * Provides immediate feedback on wedding content SEO optimization
 * 
 * @example
 * <SEOContentAnalyzer 
 *   initialContent="Your wedding blog post content here..."
 *   keyword="wedding planning hyderabad"
 *   contentType="blog" // blog, service, landing, invitation
 * />
 */
export function SEOContentAnalyzer({ 
  initialContent = '', 
  keyword = '',
  contentType = 'blog' 
}) {
  const [content, setContent] = useState(initialContent);
  const [analysis, setAnalysis] = useState(null);
  const [weddingKeywords, setWeddingKeywords] = useState([]);

  // Wedding-specific content types and their optimal parameters
  const contentTypes = {
    blog: {
      minWords: 800,
      maxWords: 2500,
      targetReadability: 60,
      keywordDensity: { min: 0.8, max: 2.5 }
    },
    service: {
      minWords: 500,
      maxWords: 1500,
      targetReadability: 65,
      keywordDensity: { min: 1.0, max: 3.0 }
    },
    landing: {
      minWords: 300,
      maxWords: 1000,
      targetReadability: 70,
      keywordDensity: { min: 1.2, max: 3.5 }
    },
    invitation: {
      minWords: 200,
      maxWords: 800,
      targetReadability: 75,
      keywordDensity: { min: 0.5, max: 2.0 }
    }
  };

  const currentType = contentTypes[contentType] || contentTypes.blog;

  const performAnalysis = useCallback(() => {
    if (!content) return;

    try {
      const metaDescription = generateMetaDescription(content);
      const readability = calculateReadability(content);
      const contentLength = analyzeContentLength(content);
      const headingHierarchy = validateHeadingHierarchy(content);
      const keywordAnalysis = keyword ? calculateKeywordDensity(content, keyword) : null;
      const extractedKeywords = extractWeddingKeywords(content);
      const sentiment = analyzeSentiment(content);
      const localReferences = checkLocalReferences(content);
      
      // Wedding-specific analysis
      const weddingAnalysis = analyzeWeddingContent(content, extractedKeywords);

      setAnalysis({
        metaDescription,
        readability,
        contentLength,
        headingHierarchy,
        keywordAnalysis,
        extractedKeywords,
        sentiment,
        localReferences,
        weddingAnalysis,
        seoScore: calculateWeddingSEOScore({
          readability,
          contentLength,
          headingHierarchy,
          keywordAnalysis,
          sentiment,
          localReferences,
          weddingAnalysis,
          contentType: currentType
        })
      });

      setWeddingKeywords(extractedKeywords);
    } catch (e) {
      console.warn('[SEO Analyzer] Content analysis failed:', e.message);
    }
  }, [content, keyword, currentType]);

  useEffect(() => {
    const timer = setTimeout(performAnalysis, 500);
    return () => clearTimeout(timer);
  }, [content, performAnalysis]);

  return (
    <div className="seo-analyzer p-6 bg-slate-50 rounded-lg space-y-4 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Wedding Content SEO Analyzer</h3>
        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full capitalize">
          {contentType}
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your wedding content here for SEO analysis..."
        className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
      />

      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">Wedding SEO Score</h4>
                <p className="text-sm text-slate-600">Optimized for {contentType} content</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">{analysis.seoScore}/100</div>
                <div className="text-sm text-slate-500 mt-1">
                  {analysis.seoScore >= 80 ? 'Excellent' : 
                   analysis.seoScore >= 60 ? 'Good' : 
                   analysis.seoScore >= 40 ? 'Needs Improvement' : 'Poor'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic SEO Metrics */}
            <div className="space-y-4">
              {/* Meta Description */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h5 className="font-semibold text-slate-800 mb-2">Meta Description</h5>
                <p className="text-sm text-slate-600 mb-2">
                  Length: {analysis.metaDescription.length}/160 characters
                  {analysis.metaDescription.length >= 120 && analysis.metaDescription.length <= 160 ? 
                    ' ✅ Optimal' : ' ⚠️ Adjust'}
                </p>
                <p className="text-sm bg-slate-50 p-3 rounded border">{analysis.metaDescription}</p>
              </div>

              {/* Readability */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h5 className="font-semibold text-slate-800 mb-2">Readability</h5>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{analysis.readability.level}</span>
                  <span className="text-sm text-slate-600">Score: {analysis.readability.score}/100</span>
                </div>
                <p className="text-xs text-slate-500">{analysis.readability.recommendation}</p>
              </div>

              {/* Content Length */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h5 className="font-semibold text-slate-800 mb-2">Content Length</h5>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{analysis.contentLength.words} words</span>
                  <span className="text-sm text-slate-600">{analysis.contentLength.readingTime} min read</span>
                </div>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      analysis.contentLength.words >= currentType.minWords && 
                      analysis.contentLength.words <= currentType.maxWords ? 
                      'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (analysis.contentLength.words / currentType.maxWords) * 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Target: {currentType.minWords}-{currentType.maxWords} words
                </p>
              </div>
            </div>

            {/* Right Column - Wedding-Specific Metrics */}
            <div className="space-y-4">
              {/* Keyword Analysis */}
              {analysis.keywordAnalysis && (
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h5 className="font-semibold text-slate-800 mb-2">Primary Keyword</h5>
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">"{keyword}"</code>
                    <span className={`text-sm font-semibold ${
                      analysis.keywordAnalysis.density >= currentType.keywordDensity.min && 
                      analysis.keywordAnalysis.density <= currentType.keywordDensity.max ? 
                      'text-green-600' : 'text-yellow-600'
                    }`}>
                      {analysis.keywordAnalysis.density}% density
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{analysis.keywordAnalysis.recommendation}</p>
                </div>
              )}

              {/* Wedding Keywords */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h5 className="font-semibold text-slate-800 mb-2">Wedding Keywords Found</h5>
                <div className="flex flex-wrap gap-1 mb-2">
                  {analysis.extractedKeywords.slice(0, 8).map((kw, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  {analysis.extractedKeywords.length} wedding-related terms detected
                </p>
              </div>

              {/* Local SEO */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h5 className="font-semibold text-slate-800 mb-2">Local References</h5>
                <div className="space-y-2">
                  {analysis.localReferences.cities.map((city, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {city}
                    </div>
                  ))}
                </div>
                {analysis.localReferences.cities.length === 0 && (
                  <p className="text-xs text-yellow-600">Add Hyderabad/local city references</p>
                )}
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h5 className="font-semibold text-slate-800 mb-2">Content Tone</h5>
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${
                    analysis.sentiment.score > 0.1 ? 'text-green-600' : 
                    analysis.sentiment.score < -0.1 ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {analysis.sentiment.label}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    ({analysis.sentiment.confidence}% confidence)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {analysis.sentiment.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Wedding-Specific Recommendations */}
          {analysis.weddingAnalysis.recommendations.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h5 className="font-semibold text-purple-800 mb-3">Wedding SEO Recommendations</h5>
              <ul className="space-y-2">
                {analysis.weddingAnalysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-sm text-purple-700">
                    <span className="mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Wedding-specific content analysis
 */
function analyzeWeddingContent(content, keywords) {
  const recommendations = [];
  const contentLower = content.toLowerCase();

  // Check for wedding-specific elements
  const hasBudgetMention = /budget|cost|price|affordable|premium|luxury/i.test(content);
  const hasTimeline = /timeline|schedule|months? before|advance|planning time/i.test(content);
  const hasCulturalReference = /traditional|cultural|custom|ritual|ceremony/i.test(content);
  const hasVenueTypes = /outdoor|indoor|garden|beach|banquet|resort|hotel|destination/i.test(content);

  if (!hasBudgetMention) {
    recommendations.push("Mention budget ranges or pricing considerations for wedding services");
  }
  if (!hasTimeline) {
    recommendations.push("Include planning timelines or 'how far in advance' information");
  }
  if (!hasCulturalReference) {
    recommendations.push("Add cultural elements or traditional wedding references");
  }
  if (!hasVenueTypes) {
    recommendations.push("Reference different venue types (outdoor, banquet, destination)");
  }

  // Check for emotional/romantic language
  const romanticWords = contentLower.match(/love|romantic|beautiful|dream|perfect|special|memorable/g) || [];
  if (romanticWords.length < 3) {
    recommendations.push("Incorporate more emotional/romantic language to connect with couples");
  }

  return {
    hasBudgetMention,
    hasTimeline,
    hasCulturalReference,
    hasVenueTypes,
    romanticWordCount: romanticWords.length,
    recommendations
  };
}

/**
 * Calculate wedding-specific SEO score
 */
function calculateWeddingSEOScore({ 
  readability, 
  contentLength, 
  headingHierarchy, 
  keywordAnalysis, 
  sentiment,
  localReferences,
  weddingAnalysis,
  contentType 
}) {
  let score = 50;

  // Readability (max +15)
  if (readability.score >= contentType.targetReadability - 10 && readability.score <= contentType.targetReadability + 10) {
    score += 15;
  } else if (readability.score > 50) {
    score += 10;
  }

  // Content length (max +15)
  if (contentLength.words >= contentType.minWords && contentLength.words <= contentType.maxWords) {
    score += 15;
  } else if (contentLength.words > contentType.minWords * 0.7) {
    score += 8;
  }

  // Heading hierarchy (max +10)
  if (headingHierarchy.valid) score += 10;

  // Keyword density (max +10)
  if (keywordAnalysis && 
      keywordAnalysis.density >= contentType.keywordDensity.min && 
      keywordAnalysis.density <= contentType.keywordDensity.max) {
    score += 10;
  }

  // Local references (max +10)
  if (localReferences.cities.length > 0) score += 10;

  // Wedding-specific elements (max +15)
  let weddingScore = 0;
  if (weddingAnalysis.hasBudgetMention) weddingScore += 3;
  if (weddingAnalysis.hasTimeline) weddingScore += 3;
  if (weddingAnalysis.hasCulturalReference) weddingScore += 3;
  if (weddingAnalysis.hasVenueTypes) weddingScore += 3;
  if (weddingAnalysis.romanticWordCount >= 3) weddingScore += 3;
  score += weddingScore;

  // Sentiment (max +5)
  if (sentiment.score > 0.1) score += 5;

  return Math.min(100, score);
}

export default SEOContentAnalyzer;