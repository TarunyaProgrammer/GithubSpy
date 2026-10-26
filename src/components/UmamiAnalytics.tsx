import { useEffect } from 'react';

const SCRIPT_ID = 'umami-tracker';
const DEFAULT_SCRIPT_URL = 'https://cloud.umami.is/script.js';
const DEFAULT_WEBSITE_ID = '46979f8b-ec7b-450c-83d1-7f070381af37';

/**
 * Loads Umami only when configured and only in production builds.
 * The tracker auto-detects SPA navigations, including this app's hash routes.
 */
export function UmamiAnalytics() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL || DEFAULT_SCRIPT_URL;
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID || DEFAULT_WEBSITE_ID;
    if (document.getElementById(SCRIPT_ID)) return;

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
