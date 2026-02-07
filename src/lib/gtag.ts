// Google Analytics (gtag.js) Helper
const GA_MEASUREMENT_ID = 'G-B25Q56HSGP';

// Declare gtag for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics - now loaded via index.html script tag
// This function ensures the gtag reference is available for TypeScript
export const initGA = () => {
  if (typeof window === 'undefined') return;
  
  // gtag is already loaded via index.html script tag
  // Just ensure the reference exists for TypeScript
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
      window.dataLayer.push(arguments);
    };
  }
  
  console.log('GA: Ready (loaded via index.html)');
};

// Track page view
export const gaPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }
};

// Track custom event
export const gaEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
    console.log('GA event:', eventName, params);
  }
};

// ===== Repair Order Funnel Events =====

// Step 1: User selects a phone model
export const gaSelectModel = (modelName: string) => {
  gaEvent('select_model', {
    event_category: 'repair_funnel',
    event_label: modelName,
    funnel_step: 1,
  });
};

// Step 2: User selects a repair type
export const gaSelectRepair = (repairType: string, price: number) => {
  gaEvent('select_repair', {
    event_category: 'repair_funnel',
    event_label: repairType,
    value: price,
    funnel_step: 2,
  });
};

// Step 2.5: Bundle offer shown / accepted / declined
export const gaBundleDecision = (accepted: boolean, bundleName: string) => {
  gaEvent('bundle_decision', {
    event_category: 'repair_funnel',
    event_label: bundleName,
    bundle_accepted: accepted,
    funnel_step: 2.5,
  });
};

// Step 3: User confirms price
export const gaConfirmPrice = (totalPrice: number) => {
  gaEvent('confirm_price', {
    event_category: 'repair_funnel',
    value: totalPrice,
    currency: 'ILS',
    funnel_step: 3,
  });
};

// Step 4: User selects schedule
export const gaSelectSchedule = (dateStr: string, timeSlot: string) => {
  gaEvent('select_schedule', {
    event_category: 'repair_funnel',
    event_label: `${dateStr} ${timeSlot}`,
    funnel_step: 4,
  });
};

// Step 5: User fills details (form started)
export const gaFillDetails = () => {
  gaEvent('fill_details', {
    event_category: 'repair_funnel',
    funnel_step: 5,
  });
};

// Step 6: Order submitted (conversion!)
export const gaConversion = (value: number, modelName: string, repairType: string) => {
  // Standard purchase event for GA4
  gaEvent('purchase', {
    currency: 'ILS',
    value: value,
    items: [{
      item_name: repairType,
      item_category: modelName,
      price: value,
      quantity: 1,
    }],
  });
  // Also send as a custom conversion event
  gaEvent('order_completed', {
    event_category: 'conversion',
    event_label: `${modelName} - ${repairType}`,
    value: value,
    currency: 'ILS',
  });
};

// Coupon applied
export const gaCouponApplied = (couponCode: string, discountValue: number) => {
  gaEvent('coupon_applied', {
    event_category: 'repair_funnel',
    event_label: couponCode,
    value: discountValue,
  });
};

// Page visits
export const gaVisitHomepage = () => {
  gaEvent('visit_homepage', { event_category: 'navigation' });
};

export const gaVisitTracker = () => {
  gaEvent('visit_tracker', { event_category: 'navigation' });
};

export const gaStartOrder = () => {
  gaEvent('start_order', { event_category: 'repair_funnel', funnel_step: 0 });
};
