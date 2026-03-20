import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'confirm' | 'success' | 'error' | 'loading'>('confirm');

  const handleUnsubscribe = async () => {
    setStatus('loading');
    try {
      const { data, error } = await supabase.functions.invoke('handle-club-unsubscribe', {
        body: { phone, token, confirm: true },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (!phone || !token) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-[#1a1a2e] rounded-2xl p-12 max-w-[420px] text-center border border-[#2a2a3e] shadow-2xl">
          <h1 className="text-[#d4af37] text-2xl font-bold mb-4">שגיאה</h1>
          <p className="text-[#e0e0e0] text-lg leading-relaxed">קישור לא תקין</p>
          <a href="https://directfix.co.il" className="text-[#d4af37] inline-block mt-6 font-semibold">חזרה לאתר</a>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-[#1a1a2e] rounded-2xl p-12 max-w-[420px] text-center border border-[#2a2a3e] shadow-2xl">
          <h1 className="text-[#d4af37] text-2xl font-bold mb-4">הוסרת בהצלחה</h1>
          <p className="text-[#e0e0e0] text-lg leading-relaxed">לא תקבל/י יותר הודעות פרסומיות מדיירקט פיקס.<br/>תמיד ניתן לחזור ולהירשם דרך האתר שלנו.</p>
          <a href="https://directfix.co.il" className="text-[#d4af37] inline-block mt-6 font-semibold">חזרה לאתר</a>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-[#1a1a2e] rounded-2xl p-12 max-w-[420px] text-center border border-[#2a2a3e] shadow-2xl">
          <h1 className="text-[#d4af37] text-2xl font-bold mb-4">שגיאה</h1>
          <p className="text-[#e0e0e0] text-lg leading-relaxed">אירעה שגיאה, נסו שוב מאוחר יותר</p>
          <a href="https://directfix.co.il" className="text-[#d4af37] inline-block mt-6 font-semibold">חזרה לאתר</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-[#1a1a2e] rounded-2xl p-10 max-w-[460px] w-full border border-[#2a2a3e] shadow-2xl">
        <h1 className="text-[#d4af37] text-2xl font-bold text-center mb-2">בטוח שאתה רוצה לעזוב?</h1>
        <p className="text-[#ccc] text-base text-center mb-7 leading-relaxed">לפני שמסירים אותך, הנה מה שתפספס:</p>

        <div className="bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] rounded-xl p-5 mb-6">
          <h3 className="text-[#d4af37] text-lg font-bold mb-4">הטבות שלא יהיו זמינות:</h3>

          <div className="flex items-start gap-3 mb-3.5">
            <span className="text-2xl flex-shrink-0 mt-0.5">🎁</span>
            <div className="text-[#e0e0e0] text-[15px] leading-relaxed"><strong className="text-[#d4af37]">מתנות ביום ההולדת</strong> — הפתעות מיוחדות שמחכות רק לחברי המועדון</div>
          </div>

          <div className="flex items-start gap-3 mb-3.5">
            <span className="text-2xl flex-shrink-0 mt-0.5">💰</span>
            <div className="text-[#e0e0e0] text-[15px] leading-relaxed"><strong className="text-[#d4af37]">מבצעים והנחות בלעדיות</strong> — הנחות שלא זמינות לכלל הלקוחות</div>
          </div>

          <div className="flex items-start gap-3 mb-3.5">
            <span className="text-2xl flex-shrink-0 mt-0.5">🏆</span>
            <div className="text-[#e0e0e0] text-[15px] leading-relaxed"><strong className="text-[#d4af37]">עדכוני נקודות ומבצעים</strong> — דיווח על נקודות שצברת ומבצעים חדשים</div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0 mt-0.5">📞</span>
            <div className="text-[#e0e0e0] text-[15px] leading-relaxed"><strong className="text-[#d4af37]">שיחות ייעוץ חינם</strong> — ייעוץ עם טכנאים מנוסים ללא עלות</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <a href="https://directfix.co.il" className="block text-center bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-[#1a1a2e] no-underline py-3.5 px-6 rounded-xl text-base font-bold">
            💛 רגע, אני נשאר!
          </a>
          <button
            onClick={handleUnsubscribe}
            disabled={status === 'loading'}
            className="block w-full text-center bg-transparent text-[#888] py-3 px-6 rounded-xl text-sm border border-[#333] hover:border-[#555] transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'מסיר...' : 'הסר אותי בכל זאת'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;
