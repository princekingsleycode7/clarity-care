import { useEffect, useRef } from 'react';

export function useAnalyticsTracker() {
  const scrollMilestonesLogged = useRef<Set<number>>(new Set());
  const sectionsLogged = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 1. Session ID (persisted across page navigations in current tab)
    let sessionId = sessionStorage.getItem('chh_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('chh_session_id', sessionId);
    }

    const deviceType: 'mobile' | 'tablet' | 'desktop' = 
      window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';

    // Helper to send tracking events safely
    const sendEvent = (payload: {
      eventType: string;
      scrollPercentage?: number;
      sectionId?: string;
    }) => {
      try {
        const body = JSON.stringify({
          sessionId,
          pagePath: window.location.pathname,
          referrer: document.referrer || 'direct',
          deviceType,
          screenWidth: window.innerWidth,
          ...payload,
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics/track', new Blob([body], { type: 'application/json' }));
        } else {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          }).catch(() => {});
        }
      } catch (err) {
        // Silently catch tracking errors to never interrupt client UX
      }
    };

    // Log Initial Pageview
    sendEvent({ eventType: 'pageview' });

    // 2. Track Scroll Depth Milestones (25%, 50%, 75%, 100%)
    let scrollTimeout: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;

        const currentPercentage = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));

        const milestones = [25, 50, 75, 100];
        milestones.forEach((m) => {
          if (currentPercentage >= m && !scrollMilestonesLogged.current.has(m)) {
            scrollMilestonesLogged.current.add(m);
            sendEvent({
              eventType: 'scroll_depth',
              scrollPercentage: m,
            });
          }
        });
      }, 250);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 3. Track Section Views using IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id || entry.target.getAttribute('data-section');
            if (sectionId && !sectionsLogged.current.has(sectionId)) {
              sectionsLogged.current.add(sectionId);
              sendEvent({
                eventType: 'section_view',
                sectionId,
              });
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const sectionElements = document.querySelectorAll('section, [data-section], footer');
    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);
}
