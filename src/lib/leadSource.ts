// Lead Source Tracking - captures UTM params, gclid, fbclid, referrer on first visit

const STORAGE_KEY = 'lead_source';

export interface LeadSource {
  source: string; // human-readable label
  gclid?: string;
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
}

const GOOGLE_DOMAINS = [
  'google', 'googleads', 'doubleclick', 'googlesyndication',
  'googleadservices', 'google.com', 'google.co.il',
];

const FACEBOOK_DOMAINS = [
  'facebook', 'fb.com', 'fb.me', 'fbcdn', 'instagram',
  'l.facebook.com', 'lm.facebook.com',
];

function isGoogleReferrer(hostname: string): boolean {
  return GOOGLE_DOMAINS.some(d => hostname.includes(d));
}

function isFacebookReferrer(hostname: string): boolean {
  return FACEBOOK_DOMAINS.some(d => hostname.includes(d));
}

function detectLeadSource(): LeadSource {
  // Check both search params AND hash params (some redirects put params in hash)
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace('#', '').split('?')[1] || '');
  
  const getParam = (key: string) => searchParams.get(key) || hashParams.get(key) || undefined;

  const gclid = getParam('gclid');
  const gbraid = getParam('gbraid');
  const wbraid = getParam('wbraid');
  const fbclid = getParam('fbclid');
  const utm_source = getParam('utm_source');
  const utm_medium = getParam('utm_medium');
  const utm_campaign = getParam('utm_campaign');
  const utm_term = getParam('utm_term');
  const utm_content = getParam('utm_content');
  const referrer = document.referrer || undefined;

  let source = 'ישיר';
  let refHost = '';

  // Parse referrer hostname
  if (referrer) {
    try {
      refHost = new URL(referrer).hostname.toLowerCase();
    } catch { /* ignore */ }
  }

  // === Priority 1: Explicit click IDs (most reliable) ===
  if (gclid || gbraid || wbraid) {
    source = 'Google Ads';
  } else if (fbclid) {
    source = 'Facebook Ads';
  }
  // === Priority 2: UTM parameters ===
  else if (utm_source) {
    const src = utm_source.toLowerCase();
    const medium = (utm_medium || '').toLowerCase();

    if (src.includes('google')) {
      source = medium === 'cpc' || medium === 'ppc' || medium === 'paid'
        ? 'Google Ads'
        : 'Google';
    } else if (src.includes('facebook') || src.includes('fb') || src.includes('ig')) {
      source = medium === 'cpc' || medium === 'paid' || medium === 'paidsocial'
        ? 'Facebook Ads'
        : 'Facebook';
    } else if (src.includes('instagram')) {
      source = 'Instagram';
    } else if (src.includes('tiktok')) {
      source = 'TikTok';
    } else if (src.includes('email') || medium === 'email') {
      source = 'אימייל';
    } else if (src.includes('sms') || medium === 'sms') {
      source = 'SMS';
    } else if (src.includes('whatsapp')) {
      source = 'WhatsApp';
    } else {
      source = utm_source;
      if (utm_medium) source += ` / ${utm_medium}`;
    }
  }
  // === Priority 3: Referrer-based detection ===
  else if (refHost) {
    if (isGoogleReferrer(refHost)) {
      // Google referrer without gclid = organic
      source = 'Google Organic';
    } else if (isFacebookReferrer(refHost)) {
      source = 'Facebook Organic';
    } else if (refHost.includes('instagram')) {
      source = 'Instagram';
    } else if (refHost.includes('tiktok')) {
      source = 'TikTok';
    } else if (refHost.includes('youtube')) {
      source = 'YouTube';
    } else if (refHost.includes('twitter') || refHost.includes('t.co')) {
      source = 'Twitter/X';
    } else if (refHost.includes('linkedin')) {
      source = 'LinkedIn';
    } else if (refHost.includes('waze')) {
      source = 'Waze';
    } else if (refHost.includes('directfix')) {
      // Internal navigation, keep as direct
      source = 'ישיר';
    } else {
      source = `הפניה מ-${refHost}`;
    }
  }

  return {
    source,
    gclid,
    fbclid,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    referrer,
  };
}

/** Call once on app init – stores lead source for the session */
export function captureLeadSource(): void {
  if (typeof window === 'undefined') return;

  const existing = sessionStorage.getItem(STORAGE_KEY);
  
  // If we already captured and it's NOT "ישיר", keep it
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as LeadSource;
      if (parsed.source !== 'ישיר') return;
    } catch { /* re-detect */ }
  }

  // Detect (or re-detect if current is "ישיר" – maybe params arrived late)
  const data = detectLeadSource();
  
  // Only overwrite if we found something better than "ישיר", or if nothing was stored
  if (!existing || data.source !== 'ישיר') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

/** Get the stored lead source */
export function getLeadSource(): LeadSource {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { source: 'ישיר' };
}
