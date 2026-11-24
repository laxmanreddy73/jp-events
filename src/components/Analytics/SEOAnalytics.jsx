import { useEffect, useRef } from 'react';
import { 
  initializeGA4, 
  trackPageView, 
  trackScrollDepth, 
  extractUTMParams,
  trackWebVitals,
  trackEngagement,
  trackFormInteractions,
  trackCTAClick,
  interiorDesignTracking
} from '../../utils/analytics';

/**
 * SEO Analytics Component for Wedding Design Business
 * Initializes analytics, tracks page views, scroll depth, UTM parameters, and user engagement
 * Enhanced with wedding business specific tracking
 * 
 * @param {Object} props
 * @param {string} props.measurementId - GA4 Measurement ID
 * @param {boolean} props.enableScrollTracking - Enable scroll depth tracking
 * @param {boolean} props.enableWebVitals - Enable Core Web Vitals tracking
 * @param {boolean} props.enableEngagement - Enable user engagement tracking
 * @param {boolean} props.enableFormTracking - Enable form interaction tracking
 * @param {boolean} props.enableCTATracking - Enable CTA click tracking
 * @param {number} props.scrollThresholds - Scroll depth thresholds to track
 * 
 * @example
 * <SEOAnalytics 
 *   measurementId="G-KW420YKRJT"
 *   enableScrollTracking={true}
 *   enableWebVitals={true}
 *   enableEngagement={true}
 *   enableCTATracking={true}
 * />
 */
export function SEOAnalytics({ 
  measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID,
  enableScrollTracking = true,
  enableWebVitals = true,
  enableEngagement = true,
  enableFormTracking = true,
  enableCTATracking = true,
  scrollThresholds = [25, 50, 75, 90, 100]
}) {
  const scrollTrackedRef = useRef({});
  const engagementStartRef = useRef(Date.now());
  const pageViewTrackedRef = useRef(false);
  const analyticsInitializedRef = useRef(false);

  // Configuration
  const config = {
    isAnalyticsEnabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    isDevelopment: import.meta.env.NODE_ENV === 'development',
    measurementId: measurementId || 'G-KW420YKRJT'
  };

  // Initialize scroll tracking object
  useEffect(() => {
    scrollThresholds.forEach(threshold => {
      scrollTrackedRef.current[threshold] = false;
    });
  }, [scrollThresholds]);

  // Main analytics initialization and tracking
  useEffect(() => {
    if (!config.isAnalyticsEnabled) {
      if (config.isDevelopment) {
        console.log('🔕 Analytics disabled by feature flag');
      }
      return;
    }

    // Initialize GA4 if measurementId is provided and not already initialized
    if (config.measurementId && config.measurementId.startsWith('G-') && !analyticsInitializedRef.current) {
      try {
        initializeGA4(config.measurementId);
        analyticsInitializedRef.current = true;
        
        if (config.isDevelopment) {
          console.log('✅ GA4 Analytics initialized with ID:', config.measurementId);
        }
      } catch (error) {
        console.error('❌ GA4 initialization failed:', error);
      }
    } else if (!config.measurementId.startsWith('G-')) {
      console.warn('⚠️ Invalid GA4 Measurement ID provided:', config.measurementId);
      return;
    }

    // Track initial page view (only once per page load)
    if (!pageViewTrackedRef.current) {
      const pagePath = window.location.pathname;
      const pageTitle = document.title;
      
      setTimeout(() => {
        trackPageView(pagePath, pageTitle);
        pageViewTrackedRef.current = true;
        
        if (config.isDevelopment) {
          console.log('📊 Page view tracked:', { path: pagePath, title: pageTitle });
        }
      }, 500); // Delay to ensure page is fully loaded
    }

    // Extract and store UTM parameters
    const utmParams = extractUTMParams();
    const hasUtmParams = Object.values(utmParams).some(v => v !== null && v !== undefined);
    
    if (hasUtmParams) {
      if (config.isDevelopment) {
        console.log('🎯 UTM Parameters detected:', utmParams);
      }
      
      // Store UTM parameters in sessionStorage for cross-page tracking
      try {
        sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
      } catch (error) {
        console.warn('⚠️ Failed to store UTM parameters:', error);
      }
    }

    // Track Web Vitals if enabled
    if (enableWebVitals && analyticsInitializedRef.current) {
      try {
        trackWebVitals((metric) => {
          if (config.isDevelopment) {
            console.log('📈 Web Vital:', metric.name, Math.round(metric.value));
          }
        });
      } catch (error) {
        console.warn('⚠️ Web Vitals tracking failed:', error);
      }
    }

    // Track scroll depth if enabled
    let scrollHandler;
    if (enableScrollTracking) {
      scrollHandler = () => {
        try {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercentage = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

          scrollThresholds.forEach(depth => {
            if (scrollPercentage >= depth && !scrollTrackedRef.current[depth]) {
              trackScrollDepth(depth, window.location.pathname);
              scrollTrackedRef.current[depth] = true;
              
              if (config.isDevelopment) {
                console.log('📏 Scroll depth reached:', `${depth}%`);
              }
            }
          });
        } catch (error) {
          console.warn('⚠️ Scroll tracking error:', error);
        }
      };

      // Throttle scroll events for better performance
      let scrollTimeout;
      const throttledScrollHandler = () => {
        if (!scrollTimeout) {
          scrollTimeout = setTimeout(() => {
            scrollHandler();
            scrollTimeout = null;
          }, 100);
        }
      };

      window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    }

    // Track user engagement time
    let engagementInterval;
    if (enableEngagement) {
      engagementInterval = setInterval(() => {
        try {
          const engagementTime = Math.round((Date.now() - engagementStartRef.current) / 1000);
          
          // Track engagement at specific intervals
          if (engagementTime === 30 || engagementTime === 60 || engagementTime === 120) {
            trackEngagement(engagementTime, window.location.pathname);
            
            if (config.isDevelopment) {
              console.log('⏱️ Engagement time:', `${engagementTime}s`);
            }
          }
        } catch (error) {
          console.warn('⚠️ Engagement tracking error:', error);
        }
      }, 1000);
    }

    // Track form interactions if enabled
    let formSubmitHandler;
    if (enableFormTracking) {
      formSubmitHandler = (event) => {
        try {
          const form = event.target;
          if (form.tagName === 'FORM') {
            const formId = form.id || form.getAttribute('name') || 'unknown_form';
            const formType = form.getAttribute('data-form-type') || 'general';
            const formFields = Array.from(form.elements)
              .filter(element => element.name)
              .map(element => element.name);
            
            trackFormInteractions(formId, 'submit', {
              formType: formType,
              fieldCount: formFields.length,
              fields: formFields,
              page: window.location.pathname
            });

            // Track specific form types for wedding business
            if (formType === 'contact' || formType === 'consultation') {
              interiorDesignTracking.trackConsultationRequest('website_form');
            }

            if (config.isDevelopment) {
              console.log('📝 Form submitted:', formId, formType);
            }
          }
        } catch (error) {
          console.warn('⚠️ Form tracking error:', error);
        }
      };

      document.addEventListener('submit', formSubmitHandler);
    }

    // Track CTA clicks if enabled
    let ctaClickHandler;
    if (enableCTATracking) {
      ctaClickHandler = (event) => {
        try {
          const button = event.target.closest('button, a');
          if (button) {
            const ctaText = button.textContent?.trim() || 'Unknown CTA';
            const ctaType = button.getAttribute('data-cta-type') || 
                           button.classList.contains('cta') ? 'general' : 'unknown';
            
            // Track specific CTA types for wedding business
            if (ctaType === 'consultation' || ctaText.toLowerCase().includes('consult')) {
              trackCTAClick('consultation_request', 'website');
              interiorDesignTracking.trackConsultationRequest('website_cta');
            } else if (ctaType === 'portfolio' || ctaText.toLowerCase().includes('portfolio')) {
              interiorDesignTracking.trackPortfolioView('general', 'mixed');
            } else if (ctaType === 'service' || ctaText.toLowerCase().includes('service')) {
              const serviceName = button.getAttribute('data-service-name') || 'general_service';
              interiorDesignTracking.trackServiceInterest(serviceName, 'wedding');
            }

            if (config.isDevelopment) {
              console.log('🖱️ CTA clicked:', ctaText, ctaType);
            }
          }
        } catch (error) {
          console.warn('⚠️ CTA tracking error:', error);
        }
      };

      document.addEventListener('click', ctaClickHandler);
    }

    // Track outbound links
    const linkClickHandler = (event) => {
      try {
        const link = event.target.closest('a');
        if (link && link.href) {
          // Outbound link tracking
          if (!link.href.includes(window.location.hostname)) {
            trackEngagement('outbound_click', {
              link_url: link.href,
              link_text: link.textContent?.trim() || 'No text',
              page_path: window.location.pathname
            });
            
            if (config.isDevelopment) {
              console.log('🔗 Outbound link clicked:', link.href);
            }
          }
          
          // Phone link tracking
          else if (link.href.startsWith('tel:')) {
            trackCTAClick('phone_call', 'website');
            
            if (config.isDevelopment) {
              console.log('📞 Phone link clicked:', link.href);
            }
          }
          
          // Email link tracking
          else if (link.href.startsWith('mailto:')) {
            trackCTAClick('email_contact', 'website');
            
            if (config.isDevelopment) {
              console.log('✉️ Email link clicked:', link.href);
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Link tracking error:', error);
      }
    };

    document.addEventListener('click', linkClickHandler);

    // Cleanup function
    return () => {
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
      }
      
      if (engagementInterval) {
        clearInterval(engagementInterval);
        
        // Track total engagement time on unmount
        try {
          const totalEngagement = Math.round((Date.now() - engagementStartRef.current) / 1000);
          if (enableEngagement && totalEngagement > 10) { // Only track if meaningful time spent
            trackEngagement(totalEngagement, window.location.pathname, 'page_unload');
            
            if (config.isDevelopment) {
              console.log('📊 Total engagement time:', `${totalEngagement}s`);
            }
          }
        } catch (error) {
          console.warn('⚠️ Final engagement tracking error:', error);
        }
      }
      
      if (formSubmitHandler) {
        document.removeEventListener('submit', formSubmitHandler);
      }
      
      if (ctaClickHandler) {
        document.removeEventListener('click', ctaClickHandler);
      }
      
      document.removeEventListener('click', linkClickHandler);
    };
  }, [
    config.measurementId, 
    enableScrollTracking, 
    enableWebVitals, 
    enableEngagement, 
    enableFormTracking,
    enableCTATracking,
    scrollThresholds,
    config.isAnalyticsEnabled
  ]);

  // Handle route changes in Single Page Applications
  useEffect(() => {
    if (!config.isAnalyticsEnabled) return;

    const handleRouteChange = () => {
      // Small delay to ensure new page is loaded
      setTimeout(() => {
        try {
          const newPath = window.location.pathname;
          const newTitle = document.title;
          
          trackPageView(newPath, newTitle);
          
          // Reset scroll tracking for new page
          scrollThresholds.forEach(threshold => {
            scrollTrackedRef.current[threshold] = false;
          });
          
          // Reset engagement timer for new page
          engagementStartRef.current = Date.now();
          
          if (config.isDevelopment) {
            console.log('🔄 Route change tracked:', { path: newPath, title: newTitle });
          }
        } catch (error) {
          console.warn('⚠️ Route change tracking error:', error);
        }
      }, 100);
    };

    // Listen for pushState and replaceState (SPA navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleRouteChange();
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [scrollThresholds, config.isAnalyticsEnabled]);

  return null; // This component doesn't render anything
}

export default SEOAnalytics;