import { useEffect } from 'react';

const SCRIPT_ID = 'umami-tracker';

/**
 * Loads Umami only when configured and only in production builds.
 * The tracker auto-detects SPA navigations, including this app's hash routes.
 */
export function UmamiAnalytics() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL;
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
    if (!scriptUrl || !websiteId || document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.defer = true;
    script.src = scriptUrl;
    script.dataset.websiteId = websiteId;
    script.dataset.autoTrack = 'true';
    script.dataset.excludeHash = 'true';

    const hostUrl = import.meta.env.VITE_UMAMI_HOST_URL;
    if (hostUrl) script.dataset.hostUrl = hostUrl;

    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return null;
}
