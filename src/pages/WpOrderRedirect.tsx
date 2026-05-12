import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const allowedButtonTypes = ['main', 'whatsapp', 'call'];

const WpOrderRedirect = () => {
  useEffect(() => {
    let redirected = false;
    const redirectToOrder = () => {
      if (redirected) return;
      redirected = true;
      window.location.replace(`${window.location.origin}/order?source=wordpress`);
    };

    const timeoutId = window.setTimeout(redirectToOrder, 900);
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get('button') || params.get('type') || 'main';
    const buttonType = allowedButtonTypes.includes(requestedType) ? requestedType : 'main';
    const sourcePage = document.referrer || params.get('page_url') || window.location.href;

    supabase.functions
      .invoke('log-wp-click', {
        body: {
          button_type: buttonType,
          referrer: document.referrer || null,
          page_url: sourcePage,
        },
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        redirectToOrder();
      });

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <main dir="rtl" className="min-h-[60vh] flex items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card/80 p-6 text-center shadow-lg backdrop-blur">
        <p className="text-lg font-bold">מעביר להזמנת תיקון...</p>
        <p className="mt-2 text-sm text-muted-foreground">רק רגע</p>
      </div>
    </main>
  );
};

export default WpOrderRedirect;
