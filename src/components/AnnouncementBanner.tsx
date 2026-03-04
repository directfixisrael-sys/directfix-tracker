import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, AlertTriangle, Info, Megaphone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast as sonnerToast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  message: string;
  placement: string;
  is_active: boolean;
  bg_color: string;
}

const colorMap: Record<string, string> = {
  warning: 'bg-warning text-warning-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
};

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem('dismissed_announcements');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [popupAnn, setPopupAnn] = useState<Announcement | null>(null);
  const [shownToasts, setShownToasts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true);
      if (data) setAnnouncements(data as any);
    };
    load();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('announcements-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Show popup announcements
  useEffect(() => {
    const popup = announcements.find(a => a.placement === 'popup' && !dismissed.has(a.id));
    if (popup) setPopupAnn(popup);
  }, [announcements, dismissed]);

  // Show toast announcements
  useEffect(() => {
    announcements
      .filter(a => a.placement === 'toast' && !dismissed.has(a.id) && !shownToasts.has(a.id))
      .forEach(a => {
        sonnerToast(a.title || 'הודעה', {
          description: a.message,
          duration: 10000,
        });
        setShownToasts(prev => new Set([...prev, a.id]));
      });
  }, [announcements, dismissed, shownToasts]);

  const dismiss = (id: string) => {
    const next = new Set([...dismissed, id]);
    setDismissed(next);
    sessionStorage.setItem('dismissed_announcements', JSON.stringify([...next]));
  };

  const headerBanners = announcements.filter(a => a.placement === 'header_banner' && !dismissed.has(a.id));

  return (
    <>
      {/* Header banners */}
      {headerBanners.map(ann => (
        <div key={ann.id} className={`relative px-4 py-2.5 text-center text-sm font-medium ${colorMap[ann.bg_color] || colorMap.warning}`}>
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
            {ann.title && <strong>{ann.title}:</strong>}
            <span>{ann.message}</span>
          </div>
          <button
            onClick={() => dismiss(ann.id)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
            aria-label="סגור הודעה"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Popup dialog */}
      <Dialog open={!!popupAnn} onOpenChange={() => { if (popupAnn) { dismiss(popupAnn.id); setPopupAnn(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              {popupAnn?.title || 'הודעה חשובה'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{popupAnn?.message}</p>
          <Button onClick={() => { if (popupAnn) { dismiss(popupAnn.id); setPopupAnn(null); } }} className="w-full">
            הבנתי
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnnouncementBanner;
