// Lead Source Tracking - captures UTM params, gclid, fbclid, referrer on first visit

const STORAGE_KEY = 'lead_source';

export interface LeadSource {
  source: string; // human-readable label
  gclid?: string;
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
}

function detectLeadSource(): LeadSource {
  const params = new URLSearchParams(window.location.search);
  const gclid = params.get('gclid') || undefined;
  const fbclid = params.get('fbclid') || undefined;
  const utm_source = params.get('utm_source') || undefined;
  const utm_medium = params.get('utm_medium') || undefined;
  const utm_campaign = params.get('utm_campaign') || undefined;
  const referrer = document.referrer || undefined;

  let source = 'ישיר (Direct)';

  if (gclid) {
    source = 'Google Ads (gclid)';
  } else if (fbclid) {
    source = 'Facebook Ads (fbclid)';
  } else if (utm_source) {
    source = `UTM: ${utm_source}${utm_medium ? ` / ${utm_medium}` : ''}`;
  } else if (referrer) {
    try {
      const refHost = new URL(referrer).hostname;
      if (refHost.includes('google')) {
        source = 'Google Organic';
      } else if (refHost.includes('facebook') || refHost.includes('fb.com')) {
        source = 'Facebook Organic';
      } else if (refHost.includes('instagram')) {
        source = 'Instagram';
      } else if (refHost.includes('directfix')) {
        source = 'הפניה מאתר דיירקט פיקס';
      } else {
        source = `הפניה מ-${refHost}`;
      }
    } catch {
      source = `הפניה: ${referrer}`;
    }
  }

  return { source, gclid, fbclid, utm_source, utm_medium, utm_campaign, referrer };
}

/** Call once on app init – stores lead source for the session */
export function captureLeadSource(): void {
  if (typeof window === 'undefined') return;
  // Only capture on first visit in session
  if (sessionStorage.getItem(STORAGE_KEY)) return;
  const data = detectLeadSource();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Get the stored lead source */
export function getLeadSource(): LeadSource {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { source: 'ישיר (Direct)' };
}
