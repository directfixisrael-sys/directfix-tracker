// Google Analytics 4 Helper
// Measurement ID: G-B25Q56HSGP
// GA script is loaded conditionally in index.html (production domains only)

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Production domains where GA should fire
const PRODUCTION_HOSTS = [
  'directfix-tracker.lovable.app',
  'www.directfix.co.il',
  'directfix.co.il',
];

const isProduction = () =>
  typeof window !== 'undefined' && PRODUCTION_HOSTS.includes(window.location.hostname);

// Safe wrapper – only fires when gtag is available (i.e. production)
const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
};

// Called once from main.tsx
export const initGA = () => {
  if (!isProduction()) return;
  // gtag is bootstrapped by the inline script in index.html.
  // Nothing extra needed here – just confirm it's live.
  console.log('GA4 ready');
};

// ── Generic helpers ──────────────────────────────────────────────

export const gaPageView = (path: string, title?: string) =>
  gtag('event', 'page_view', { page_path: path, page_title: title });

export const gaEvent = (name: string, params?: Record<string, any>) => {
  gtag('event', name, params);
};

// ── Repair-order funnel ──────────────────────────────────────────

export const gaStartOrder = () =>
  gaEvent('start_order', { event_category: 'repair_funnel', funnel_step: 0 });

export const gaSelectModel = (modelName: string) =>
  gaEvent('select_model', { event_category: 'repair_funnel', event_label: modelName, funnel_step: 1 });

export const gaSelectRepair = (repairType: string, price: number) =>
  gaEvent('select_repair', { event_category: 'repair_funnel', event_label: repairType, value: price, funnel_step: 2 });

export const gaBundleDecision = (accepted: boolean, bundleName: string) =>
  gaEvent('bundle_decision', { event_category: 'repair_funnel', event_label: bundleName, bundle_accepted: accepted, funnel_step: 2.5 });

export const gaConfirmPrice = (totalPrice: number) =>
  gaEvent('confirm_price', { event_category: 'repair_funnel', value: totalPrice, currency: 'ILS', funnel_step: 3 });

export const gaSelectSchedule = (dateStr: string, timeSlot: string) =>
  gaEvent('select_schedule', { event_category: 'repair_funnel', event_label: `${dateStr} ${timeSlot}`, funnel_step: 4 });

export const gaFillDetails = () =>
  gaEvent('fill_details', { event_category: 'repair_funnel', funnel_step: 5 });

export const gaConversion = (value: number, modelName: string, repairType: string) => {
  gaEvent('purchase', {
    currency: 'ILS',
    value,
    items: [{ item_name: repairType, item_category: modelName, price: value, quantity: 1 }],
  });
  gaEvent('order_completed', {
    event_category: 'conversion',
    event_label: `${modelName} - ${repairType}`,
    value,
    currency: 'ILS',
  });
};

export const gaCouponApplied = (couponCode: string, discountValue: number) =>
  gaEvent('coupon_applied', { event_category: 'repair_funnel', event_label: couponCode, value: discountValue });

// ── Navigation ───────────────────────────────────────────────────

export const gaVisitHomepage = () =>
  gaEvent('visit_homepage', { event_category: 'navigation' });

export const gaVisitTracker = () =>
  gaEvent('visit_tracker', { event_category: 'navigation' });
