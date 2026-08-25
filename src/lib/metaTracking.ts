// Meta (Facebook) tracking: Pixel + Conversions API with shared event_id deduplication.
// Access token lives ONLY in the edge function (server side).

import { supabase } from '@/integrations/supabase/client';

// Pixel ID is public (safe in client code). Access token stays server side.
export const META_PIXEL_ID = '700713421501028';

const ATTR_KEY = 'df_meta_attribution';
const FIRED_KEY = 'df_meta_fired_events';

export interface Attribution {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  placement?: string | null;
  fbclid?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  first_landing_url?: string | null;
  referrer?: string | null;
}

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : undefined;
};

const getParam = (key: string): string | undefined => {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace('#', '').split('?')[1] || '');
  return search.get(key) || hash.get(key) || undefined;
};

/** Capture UTM / fbclid / placement / landing url once per browser (persisted). */
export const captureAttribution = (): Attribution => {
  if (typeof window === 'undefined') return {};

  let stored: Attribution = {};
  try {
    stored = JSON.parse(localStorage.getItem(ATTR_KEY) || '{}');
  } catch { /* ignore */ }

  const fresh: Attribution = {
    utm_source: getParam('utm_source') || null,
    utm_medium: getParam('utm_medium') || null,
    utm_campaign: getParam('utm_campaign') || null,
    utm_content: getParam('utm_content') || null,
    utm_term: getParam('utm_term') || null,
    placement:
      getParam('placement') ||
      getParam('utm_placement') ||
      getParam('ad_placement') ||
      null,
    fbclid: getParam('fbclid') || null,
  };

  const hasNewCampaignData = Boolean(
    fresh.utm_source || fresh.utm_campaign || fresh.fbclid || fresh.placement
  );

  const merged: Attribution = hasNewCampaignData ? { ...stored, ...fresh } : { ...fresh, ...stored };

  if (!merged.first_landing_url) merged.first_landing_url = window.location.href;
  if (!merged.referrer) merged.referrer = document.referrer || null;

  // Meta browser cookies (set by the pixel). Synthesize fbc from fbclid when missing.
  merged.fbp = getCookie('_fbp') || merged.fbp || null;
  const cookieFbc = getCookie('_fbc');
  if (cookieFbc) {
    merged.fbc = cookieFbc;
  } else if (merged.fbclid && !merged.fbc) {
    merged.fbc = `fb.1.${Date.now()}.${merged.fbclid}`;
  }

  try {
    localStorage.setItem(ATTR_KEY, JSON.stringify(merged));
  } catch { /* ignore */ }

  return merged;
};

export const getAttribution = (): Attribution => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = JSON.parse(localStorage.getItem(ATTR_KEY) || '{}') as Attribution;
    // Refresh cookie-based ids (pixel may have set them after first load)
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');
    if (fbp && fbp !== stored.fbp) stored.fbp = fbp;
    if (fbc && fbc !== stored.fbc) stored.fbc = fbc;
    return stored;
  } catch {
    return {};
  }
};

/** Fields persisted alongside an order. */
export const getOrderAttribution = () => {
  const a = getAttribution();
  return {
    utmSource: a.utm_source || null,
    utmMedium: a.utm_medium || null,
    utmCampaign: a.utm_campaign || null,
    utmContent: a.utm_content || null,
    utmTerm: a.utm_term || null,
    placement: a.placement || null,
    fbclid: a.fbclid || null,
    fbp: a.fbp || null,
    fbc: a.fbc || null,
    firstLandingUrl: a.first_landing_url || null,
  };
};

const newEventId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
};

const getVisitorId = () => {
  try {
    return sessionStorage.getItem('visitor_id') || null;
  } catch {
    return null;
  }
};

// ── Pixel bootstrap ──────────────────────────────────────────────
let pixelReady: Promise<string | null> | null = null;

const loadPixel = (pixelId: string) => {
  if (window.fbq) return;
  const n: any = (window.fbq = function (...args: any[]) {
    n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
  });
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  window.fbq('init', pixelId);
};

/** Initializes the Meta Pixel (pixel id is served by the edge function). */
export const initMetaPixel = (): Promise<string | null> => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (pixelReady) return pixelReady;

  captureAttribution();

  pixelReady = (async () => {
    try {
      loadPixel(META_PIXEL_ID);
      return META_PIXEL_ID;
    } catch (e) {
      console.warn('Meta pixel init failed', e);
      return null;
    }
  })();

  return pixelReady;
};

export interface MetaEventOptions {
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  orderId?: string | null;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  /** Fire at most once per browser session for this key. */
  onceKey?: string;
}

const alreadyFired = (key: string) => {
  try {
    const fired = JSON.parse(sessionStorage.getItem(FIRED_KEY) || '[]') as string[];
    if (fired.includes(key)) return true;
    fired.push(key);
    sessionStorage.setItem(FIRED_KEY, JSON.stringify(fired));
    return false;
  } catch {
    return false;
  }
};

/**
 * Sends an event to the Pixel (browser) and to the Conversions API (server)
 * with the same event_id for deduplication, and logs it for the admin funnel.
 */
export const trackMetaEvent = async (
  eventName: 'PageView' | 'ViewContent' | 'InitiateCheckout' | 'Lead' | 'Purchase',
  options: MetaEventOptions = {}
): Promise<void> => {
  if (typeof window === 'undefined') return;
  if (options.onceKey && alreadyFired(options.onceKey)) return;

  await initMetaPixel();

  const eventId = newEventId();
  const attribution = getAttribution();
  const currency = options.currency || 'ILS';

  const customData: Record<string, unknown> = {};
  if (options.value != null) {
    customData.value = options.value;
    customData.currency = currency;
  }
  if (options.contentName) customData.content_name = options.contentName;
  if (options.contentCategory) customData.content_category = options.contentCategory;

  try {
    if (typeof window.fbq === 'function') {
      window.fbq('track', eventName, customData, { eventID: eventId });
    }
  } catch (e) {
    console.warn('Meta pixel event failed', e);
  }

  const payload = {
    action: 'track',
    eventName,
    eventId,
    eventSourceUrl: window.location.href,
    visitorId: getVisitorId(),
    page: window.location.pathname,
    value: options.value ?? null,
    currency,
    contentName: options.contentName || null,
    orderId: options.orderId || null,
    user: {
      email: options.email || null,
      phone: options.phone || null,
      firstName: options.firstName || null,
    },
    attribution: {
      ...attribution,
      fbp: attribution.fbp || null,
      fbc: attribution.fbc || null,
    },
  };

  try {
    await supabase.functions.invoke('meta-capi', { body: payload });
  } catch (e) {
    console.warn('Meta CAPI event failed', e);
  }
};
