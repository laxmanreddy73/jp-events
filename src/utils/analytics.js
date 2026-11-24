/**
 * SEO Analytics and Tracking Integration
 * Tracks Core Web Vitals, user engagement, and SEO-relevant events
 * Enhanced for Interior Design Business
 */

// Configuration
const ANALYTICS_CONFIG = {
  measurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-KW420YKRJT',
  enabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  debug: import.meta.env.NODE_ENV === 'development'
};

/**
 * Initialize Google Analytics 4 with enhanced configuration
 */
export function initializeGA4() {
  const { measurementId, enabled, debug } = ANALYTICS_CONFIG;
  
  if (!enabled) {
    console.log('[v0] Analytics disabled by feature flag');
    return;
  }

  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    console.warn('[v0] Invalid GA4 Measurement ID');
    return;
  }

  try {
    // Load gtag script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        send_page_view: true,
        debug_mode: ${debug}
      });
    `;

    document.head.appendChild(script1);
    document.head.appendChild(script2);

    console.log(`[v0] GA4 initialized with ID: ${measurementId}`);
    
    // Track initial page view
    setTimeout(() => {
      trackPageView(window.location.pathname, document.title);
    }, 1000);
    
  } catch (e) {
    console.warn('[v0] GA4 initialization failed:', e.message);
  }
}

/**
 * Enhanced page view tracking with SEO metrics
 */
export function trackPageView(path, title) {
  if (!window.gtag || !ANALYTICS_CONFIG.enabled) return;

  try {
    const utmParams = extractUTMParams();
    
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.href,
      ...utmParams
    });

    // Track page load performance
    if ('performance' in window) {
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      if (navigationTiming) {
        trackCustomEvent('page_performance', {
          event_category: 'Performance',
          load_time: Math.round(navigationTiming.loadEventEnd - navigationTiming.navigationStart),
          dom_ready: Math.round(navigationTiming.domContentLoadedEventEnd - navigationTiming.navigationStart),
          page: path
        });
      }
    }

    console.log(`[v0] Page view tracked: ${title}`);
  } catch (e) {
    console.warn('[v0] PageView tracking failed:', e.message);
  }
}

/**
 * Track Core Web Vitals with enhanced metrics
 */
export function trackWebVital(metric) {
  if (!window.gtag || !ANALYTICS_CONFIG.enabled) return;

  try {
    const eventParams = {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
      page: window.location.pathname
    };

    // Add metric-specific parameters
    if (metric.rating) {
      eventParams.rating = metric.rating;
    }

    window.gtag('event', metric.name, eventParams);

    if (ANALYTICS_CONFIG.debug) {
      console.log(`[v0] ${metric.name}: ${Math.round(metric.value)} (${metric.rating || 'N/A'})`);
    }
  } catch (e) {
    console.warn('[v0] Web Vital tracking failed:', e.message);
  }
}

/**
 * Enhanced scroll depth tracking with time spent
 */
export function trackScrollDepth(depth, timeSpent) {
  if (!window.gtag || !ANALYTICS_CONFIG.enabled) return;

  const depths = [25, 50, 75, 90, 100];
  const roundedDepth = depths.find(d => d >= depth);

  if (roundedDepth) {
    try {
      window.gtag('event', 'scroll_depth', {
        value: roundedDepth,
        event_category: 'Engagement',
        event_label: `${roundedDepth}%`,
        time_spent: Math.round(timeSpent / 1000), // Convert to seconds
        page: window.location.pathname
      });

      if (ANALYTICS_CONFIG.debug) {
        console.log(`[v0] Scroll depth: ${roundedDepth}% in ${Math.round(timeSpent / 1000)}s`);
      }
    } catch (e) {
      console.warn('[v0] Scroll depth tracking failed:', e.message);
    }
  }
}

/**
 * Track CTA clicks for interior design business
 */
export function trackCTAClick(ctaName, ctaLocation, additionalParams = {}) {
  if (!window.gtag || !ANALYTICS_CONFIG.enabled) return;

  try {
    window.gtag('event', 'cta_click', {
      event_category: 'Engagement',
      event_label: ctaName,
      cta_location: ctaLocation,
      page: window.location.pathname,
      ...additionalParams
    });

    console.log(`[v0] CTA clicked: ${ctaName} at ${ctaLocation}`);
  } catch (e) {
    console.warn('[v0] CTA click tracking failed:', e.message);
  }
}

/**
 * Track form submissions with enhanced data
 */
export function trackFormSubmission(formName, formType, formData = {}) {
  if (!window.gtag || !ANALYTICS_CONFIG.enabled) return;

  try {
    window.gtag('event', 'form_submission', {
      event_category: 'Conversion',
      event_label: formName,
      form_type: formType,
      page: window.location.pathname,
      ...formData
    });

    // Track as conversion for interior design business
    if (formType === 'contact' || formType === 'consultation') {
      window.gtag('event', 'generate_lead', {
        event_category: 'Lead Generation',
        event_label: `${formName} - ${formType}`,
        value: 1
      });
    }

    console.log(`[v0] Form submitted: ${formName} (${formType})`);
  } catch (e) {
    console.warn('[v0] Form submission tracking failed:', e.message);
  }
}

/**
 * Track external link clicks with enhanced tracking
 */
export function trackExternalLink(url, text, linkType = 'outbound') {
  if (!window.gtag || !ANALYTICS_CONFIG.enabled) return;

  try {
    window.gtag('event', 'external_link_click', {
      event_category: linkType === 'social' ? 'Social' : 'Outbound',
      event_label: url,
      link_text: text,
      link_url: url,
      transport: 'beacon',
      page: window.location.pathname
    });

    console.log(`[v0] External link clicked: ${text} -> ${url}`);
  } catch (e) {
    console.warn('[v0] External link tracking failed:', e.message);
  }
}

/**
 * Enhanced UTM parameter extraction
 */
export function extractUTMParams() {
  const params = new URLSearchParams(window.location.search);
  const utmParams = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term')
  };

  // Clean up null values
  Object.keys(utmParams).forEach(key => {
    if (!utmParams[key]) delete utmParams[key];
  });

  return utmParams;
}

/**
 * Track custom events with validation
 */
export function trackCustomEvent(eventName, eventData = {}) {
  if (!window.gtag || !ANALYTICS_CONFIG.enabled) return;

  // Validate event name
  if (!eventName || typeof eventName !== 'string') {
    console.warn('[v0] Invalid event name:', eventName);
    return;
  }

  try {
    // Add default parameters
    const enhancedData = {
      page: window.location.pathname,
      timestamp: Date.now(),
      ...eventData
    };

    window.gtag('event', eventName, enhancedData);

    if (ANALYTICS_CONFIG.debug) {
      console.log(`[v0] Custom event: ${eventName}`, enhancedData);
    }
  } catch (e) {
    console.warn('[v0] Custom event tracking failed:', e.message);
  }
}

/**
 * Business-specific tracking for interior design
 */
export const interiorDesignTracking = {
  // Track service interest
  trackServiceInterest: (serviceName, serviceType = 'residential') => {
    trackCustomEvent('service_interest', {
      event_category: 'Services',
      event_label: serviceName,
      service_type: serviceType,
      business_type: 'interior_design'
    });
  },

  // Track portfolio view
  trackPortfolioView: (projectType, projectStyle) => {
    trackCustomEvent('portfolio_view', {
      event_category: 'Portfolio',
      event_label: projectType,
      project_style: projectStyle,
      business_type: 'interior_design'
    });
  },

  // Track consultation request
  trackConsultationRequest: (source = 'website', serviceInterest = '') => {
    trackCustomEvent('consultation_request', {
      event_category: 'Lead Generation',
      event_label: 'Consultation Booked',
      source: source,
      service_interest: serviceInterest,
      value: 1
    });
  },

  // Track quote request
  trackQuoteRequest: (projectScope, estimatedBudget) => {
    trackCustomEvent('quote_request', {
      event_category: 'Lead Generation',
      event_label: 'Quote Requested',
      project_scope: projectScope,
      estimated_budget: estimatedBudget,
      value: 1
    });
  }
};

/**
 * Initialize all tracking
 */
export function initializeAllTracking() {
  if (!ANALYTICS_CONFIG.enabled) return;

  initializeGA4();
  
  // Initialize scroll tracking
  initializeScrollTracking();
  
  // Initialize performance tracking
  initializePerformanceTracking();

  console.log('[v0] All tracking initialized');
}

/**
 * Initialize scroll tracking
 */
function initializeScrollTracking() {
  let startTime = Date.now();
  let maxScrollDepth = 0;

  const trackScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;
      const timeSpent = Date.now() - startTime;
      trackScrollDepth(scrollPercent, timeSpent);
    }
  };

  // Throttle scroll events
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(() => {
        trackScroll();
        scrollTimeout = null;
      }, 100);
    }
  });

  // Track on page unload
  window.addEventListener('beforeunload', () => {
    const totalTimeSpent = Date.now() - startTime;
    trackCustomEvent('page_engagement', {
      event_category: 'Engagement',
      max_scroll_depth: maxScrollDepth,
      time_spent: Math.round(totalTimeSpent / 1000),
      page: window.location.pathname
    });
  });
}

/**
 * Initialize performance tracking
 */
function initializePerformanceTracking() {
  if ('performance' in window) {
    // Track largest contentful paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      trackCustomEvent('largest_contentful_paint', {
        event_category: 'Performance',
        value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
        page: window.location.pathname
      });
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }
}

// Export default configuration
export default {
  initializeGA4,
  trackPageView,
  trackWebVital,
  trackScrollDepth,
  trackCTAClick,
  trackFormSubmission,
  trackExternalLink,
  trackCustomEvent,
  interiorDesignTracking,
  initializeAllTracking,
  config: ANALYTICS_CONFIG
};