import { useEffect } from 'react';
import SupportChat from '@/components/support/SupportChat';

// Viewing page for the after-order support chat (not linked from the site, hidden from search engines)
const ChatPreview = () => {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    document.title = "תצוגת צ'אט | דיירקט פיקס";
    return () => { meta.remove(); };
  }, []);

  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-extrabold">תצוגת צ'אט התמיכה</h1>
        <p className="text-muted-foreground text-base">כך הלקוח רואה את הצ'אט במסך סיום ההזמנה. אפשר לסגור ולפתוח מהכפתור למטה.</p>
      </div>
      <SupportChat defaultOpen />
    </main>
  );
};

export default ChatPreview;
