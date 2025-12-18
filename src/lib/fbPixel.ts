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
  if (window.fbq) {
    console.log('Facebook Pixel: Already initialized');
    return;
  }

  console.log('Facebook Pixel: Initializing...');

  // Facebook Pixel base code
  const n = window.fbq = function(...args: any[]) {
    if (n.callMethod) {
      n.callMethod.apply(n, args);
    } else {
      n.queue.push(args);
    }
  } as any;
  
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [] as any[];
  
  // Load the Facebook Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.onload = () => {
    console.log('Facebook Pixel: Script loaded successfully');
  };
  script.onerror = () => {
    console.error('Facebook Pixel: Failed to load script');
  };
  document.head.appendChild(script);
  
  // Initialize with your Pixel ID
  window.fbq('init', FB_PIXEL_ID);
  window.fbq('track', 'PageView');
  console.log('Facebook Pixel: PageView tracked');
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
    console.log('Facebook Pixel: Lead event tracked');
  }
};

// Track AddToCart event (when selecting a repair)
export const trackAddToCart = (contentName: string, value: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: contentName,
      value: value,
      currency: 'ILS',
    });
    console.log('Facebook Pixel: AddToCart event tracked', { contentName, value });
  }
};

// Track InitiateCheckout (optional - when someone reaches payment step)
export const trackInitiateCheckout = (value: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: value,
      currency: 'ILS',
    });
    console.log('Facebook Pixel: InitiateCheckout event tracked', { value });
  }
};
