import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

// Israeli first names for display
const cities = ['תל אביב', 'חיפה', 'ירושלים', 'באר שבע', 'ראשון לציון', 'פתח תקווה', 'נתניה', 'אשדוד', 'הרצליה', 'רמת גן', 'כפר סבא', 'רעננה', 'חולון', 'בת ים', 'מודיעין', 'רחובות'];

const getTimeAgo = (date: string) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (diff < 1) return 'הרגע';
  if (diff < 60) return `לפני ${diff} דקות`;
  if (diff < 1440) return `לפני ${Math.floor(diff / 60)} שעות`;
  return `לפני ${Math.floor(diff / 1440)} ימים`;
};

const FomoOrderToast = () => {
  const shown = useRef(false);

  useEffect(() => {
    // Show first toast after 15 seconds, then every 45 seconds
    const showToast = async () => {
      try {
        const { data } = await supabase
          .from('orders')
          .select('customer_name, device_type, issue_description, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!data || data.length === 0) return;

        const order = data[Math.floor(Math.random() * data.length)];
        const firstName = order.customer_name?.split(' ')[0] || 'לקוח';
        const city = cities[Math.floor(Math.random() * cities.length)];

        toast(
          `${firstName} מ${city} הזמין ${order.issue_description || 'תיקון'}`,
          {
            description: `${order.device_type} · ${getTimeAgo(order.created_at)}`,
            icon: <ShoppingCart className="w-4 h-4 text-primary" />,
            duration: 5000,
            position: 'bottom-right',
          }
        );
      } catch (e) {
        console.error('FomoToast error:', e);
      }
    };

    const firstTimer = setTimeout(showToast, 15000);
    const interval = setInterval(showToast, 45000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default FomoOrderToast;
