// Facebook Pixel Helper
const FB_PIXEL_ID = '1404099044750782';

// Declare fbq for TypeScript
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

// Initialize Facebook Pixel (called once on app load)
export const initFacebookPixel = () => {
  if (typeof window === 'undefined') return;
  
  // Avoid re-initialization
  if (window.fbq) return;

  // Facebook Pixel base code
  const n = window.fbq = function(...args: any[]) {
    n.callMethod ? n.callMethod(...args) : n.queue.push(args);
  } as any;
  
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  
  // Load the Facebook Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  
  // Initialize with your Pixel ID
  window.fbq('init', FB_PIXEL_ID);
  window.fbq('track', 'PageView');
};

// Track Purchase/Conversion event
export const trackPurchase = (value: number, currency: string = 'ILS') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency,
    });
    console.log('Facebook Pixel: Purchase event tracked', { value, currency });
  }
};

// Track Lead event (optional - for when someone starts the form)
export const trackLead = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead');
  }
};

// Track InitiateCheckout (optional - when someone reaches payment step)
export const trackInitiateCheckout = (value: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: value,
      currency: 'ILS',
    });
  }
};
