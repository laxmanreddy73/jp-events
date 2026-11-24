import { useEffect, useCallback, useRef } from 'react';
import { trackCustomEvent, trackPageView } from '../utils/analytics';

interface TrackingEvent {
  eventName: string;
  eventData?: Record<string, unknown>;
  timestamp?: number;
}

interface EngagementMetrics {
  timeOnPage: number;
  scrollDepth: number;
  interactions: number;
  lastActivity: number;
}

/**
 * Enhanced custom hook for SEO event tracking in wedding business
 * Provides comprehensive tracking functionality for wedding planning services
 * 
 * @example
 * const { trackEvent, trackWeddingInquiry, trackServiceView } = useSEOTracking();
 * 
 * <button onClick={() => trackWeddingInquiry('hindu', 'complete_planning')}>
 *   Get Quote
 * </button>
 */
export function useSEOTracking(componentName?: string) {
  const engagementRef = useRef<EngagementMetrics>({
    timeOnPage: 0,
    scrollDepth: 0,
    interactions: 0,
    lastActivity: Date.now()
  });

  const eventQueueRef = useRef<TrackingEvent[]>([]);
  const pageLoadTimeRef = useRef<number>(Date.now());

  // Track initial page view
  useEffect(() => {
    const pageLoadTimestamp = pageLoadTimeRef.current;
    const pageLoadDuration = Date.now() - pageLoadTimestamp;
    
    trackPageView(window.location.pathname, document.title, {
      component: componentName,
      load_time: pageLoadDuration,
      referrer: document.referrer
    });

    // Set up periodic engagement tracking
    const engagementInterval = setInterval(() => {
      const currentTime = Date.now();
      const timeOnPage = Math.round((currentTime - pageLoadTimestamp) / 1000);
      
      engagementRef.current.timeOnPage = timeOnPage;
      
      // Track engagement every 30 seconds
      if (timeOnPage % 30 === 0) {
        trackCustomEvent('time_on_page', { label: `page_${window.location.pathname}`, value: timeOnPage });
      }
    }, 1000);

    return () => {
      clearInterval(engagementInterval);
      
      // Track final engagement on unmount
      const totalTime = Math.round((Date.now() - pageLoadTimestamp) / 1000);
      trackCustomEvent('page_exit', { label: `page_${window.location.pathname}`, value: totalTime });
    };
  }, [componentName]);

  const trackEvent = useCallback((eventName: string, eventData: Record<string, unknown> = {}) => {
    try {
      const enhancedData = {
        ...eventData,
        component: componentName,
        page_path: window.location.pathname,
        page_title: document.title,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`
      };

      trackCustomEvent(eventName, enhancedData);
      
      // Update engagement metrics
      engagementRef.current.interactions++;
      engagementRef.current.lastActivity = Date.now();

    } catch (error) {
      console.warn(
        '[Wedding Analytics] Event tracking failed:',
        error instanceof Error ? error.message : String(error)
      );
      
      // Queue failed events for retry
      eventQueueRef.current.push({
        eventName,
        eventData,
        timestamp: Date.now()
      });
    }
  }, [componentName]);

  // Wedding Business Specific Tracking Methods
  const trackWeddingInquiry = useCallback((weddingType: string, serviceType: string, source: string = 'website') => {
    trackEvent('wedding_inquiry_submitted', {
      wedding_type: weddingType,
      service_type: serviceType,
      inquiry_source: source,
      business_name: 'JP Events',
      contact_method: 'form_submission'
    });
  }, [trackEvent]);

  const trackServiceView = useCallback((serviceName: string, category: string, duration: number) => {
    trackEvent('service_page_view', {
      service_name: serviceName,
      service_category: category,
      view_duration: duration,
      business_type: 'wedding_planning'
    });
  }, [trackEvent]);

  const trackPortfolioInteraction = useCallback((projectId: string, projectType: string, action: string) => {
    trackEvent('portfolio_interaction', {
      project_id: projectId,
      project_type: projectType,
      interaction_type: action,
      wedding_style: projectType,
      business_domain: 'wedding_events'
    });
  }, [trackEvent]);

  const trackVenueSearch = useCallback((location: string, budget: string, guestCount: number) => {
    trackEvent('venue_search_performed', {
      search_location: location,
      budget_range: budget,
      guest_count: guestCount,
      search_type: 'wedding_venue',
      business_service: 'venue_selection'
    });
  }, [trackEvent]);

  const trackConsultationBooking = useCallback((consultationType: string, preferredDate: string, timeSlot: string) => {
    trackEvent('consultation_booked', {
      consultation_type: consultationType,
      preferred_date: preferredDate,
      time_slot: timeSlot,
      booking_source: 'website',
      service_provider: 'JP Events'
    });
  }, [trackEvent]);

  // Enhanced Engagement Tracking
  const trackEngagement = useCallback((engagementType: string, label: string, value: number = 1) => {
    trackCustomEvent('engagement', {
      'engagement_type': engagementType,
      'event_label': label,
      'value': value,
      'total_interactions': engagementRef.current.interactions,
      'time_on_page': engagementRef.current.timeOnPage,
      'component': componentName
    });
  }, [componentName]);

  const trackTiming = useCallback((category: string, variable: string, value: number, label?: string) => {
    trackCustomEvent('timing_complete', {
      'event_category': category,
      'event_variable': variable,
      'event_label': label,
      'value': Math.round(value),
      'page_path': window.location.pathname
    });
  }, []);

  const trackError = useCallback((errorMessage: string, errorType: string, component?: string) => {
    trackCustomEvent('error_occurred', {
      'error_type': errorType,
      'error_message': errorMessage,
      'error_component': component || componentName,
      'page_url': window.location.href,
      'user_agent': navigator.userAgent
    });
  }, [componentName]);

  // Form Tracking for Wedding Inquiries
  const trackFormStart = useCallback((formId: string, formType: string) => {
    trackEvent('form_started', {
      form_id: formId,
      form_type: formType,
      form_category: 'wedding_inquiry'
    });
  }, [trackEvent]);

  const trackFormSubmission = useCallback((formId: string, formType: string, fields: string[], duration: number) => {
    trackCustomEvent('form_submitted', {
      form_id: formId,
      form_type: formType,
      fields_completed: fields,
      submission_duration: duration,
      form_category: 'wedding_services'
    });
  }, []);

  const trackFormAbandonment = useCallback((formId: string, formType: string, completedFields: string[], duration: number) => {
    trackEvent('form_abandoned', {
      form_id: formId,
      form_type: formType,
      completed_fields: completedFields,
      time_spent: duration,
      abandonment_reason: 'user_navigation'
    });
  }, [trackEvent]);

  // Scroll Depth Tracking for Wedding Content
  const trackScrollDepth = useCallback((thresholds: number[] = [25, 50, 75, 90, 100]) => {
    const tracked = new Set<number>();
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !tracked.has(threshold)) {
          trackEvent('scroll_depth_reached', {
            scroll_percentage: threshold,
            content_type: 'wedding_services',
            page_section: getPageSection(threshold)
          });
          tracked.add(threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent]);

  // Performance Tracking
  const trackPerformance = useCallback((metricName: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') => {
    trackEvent('performance_metric', {
      metric_name: metricName,
      metric_value: value,
      performance_rating: rating,
      page_load_time: Date.now() - pageLoadTimeRef.current
    });
  }, [trackEvent]);

  // Retry failed events
  const retryFailedEvents = useCallback(() => {
    const failedEvents = [...eventQueueRef.current];
    eventQueueRef.current = [];
    
    failedEvents.forEach(event => {
      trackEvent(event.eventName, event.eventData);
    });
    
    return failedEvents.length;
  }, [trackEvent]);

  // Get current engagement metrics
  const getEngagementMetrics = useCallback((): EngagementMetrics => {
    return { ...engagementRef.current };
  }, []);

  // Helper function to determine page section
  const getPageSection = (scrollPercent: number): string => {
    if (scrollPercent <= 25) return 'header';
    if (scrollPercent <= 50) return 'services_overview';
    if (scrollPercent <= 75) return 'portfolio_showcase';
    return 'contact_section';
  };

  return {
    // Core Tracking Methods
    trackEvent,
    trackTiming,
    trackEngagement,
    trackError,
    trackPageView,
    
    // Wedding Business Specific Tracking
    trackWeddingInquiry,
    trackServiceView,
    trackPortfolioInteraction,
    trackVenueSearch,
    trackConsultationBooking,
    
    // Form Tracking
    trackFormStart,
    trackFormSubmission,
    trackFormAbandonment,
    
    // Engagement & Performance
    trackScrollDepth,
    trackPerformance,
    
    // Utility Methods
    retryFailedEvents,
    getEngagementMetrics,
    
    // Current state
    engagementMetrics: engagementRef.current
  };
}

// Hook for specific wedding service tracking
export function useWeddingServiceTracking(serviceName: string) {
  const { trackEvent, trackServiceView, trackEngagement } = useSEOTracking(serviceName);
  
  const trackServiceClick = useCallback((action: string, element: string) => {
    trackEvent('service_action', {
      service_name: serviceName,
      action_type: action,
      element_clicked: element,
      service_category: 'wedding_planning'
    });
  }, [trackEvent, serviceName]);

  const trackServiceDuration = useCallback((startTime: number) => {
    const duration = Date.now() - startTime;
    trackServiceView(serviceName, 'wedding_service', duration);
  }, [trackServiceView, serviceName]);

  return {
    trackServiceClick,
    trackServiceDuration,
    trackServiceEngagement: trackEngagement
  };
}

// Hook for portfolio tracking
export function usePortfolioTracking() {
  const { trackEvent, trackPortfolioInteraction } = useSEOTracking('Portfolio');
  
  const trackProjectView = useCallback((projectId: string, projectType: string, viewTime: number) => {
    trackPortfolioInteraction(projectId, projectType, 'view');
    trackEvent('project_viewed', {
      project_id: projectId,
      project_type: projectType,
      view_duration: viewTime,
      wedding_style: projectType
    });
  }, [trackEvent, trackPortfolioInteraction]);

  const trackProjectShare = useCallback((projectId: string, platform: string) => {
    trackPortfolioInteraction(projectId, 'shared', 'share');
    trackEvent('project_shared', {
      project_id: projectId,
      share_platform: platform,
      content_type: 'wedding_portfolio'
    });
  }, [trackEvent, trackPortfolioInteraction]);

  return {
    trackProjectView,
    trackProjectShare
  };
}

export default useSEOTracking;