import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Phone, User, Clock, Search, Trash2, CheckCircle2, XCircle, Shield, Smartphone, Wrench, Mail, Tag, Eye, Send } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';

interface Lead {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  privacy_accepted: boolean;
  is_returning_customer: boolean;
  converted: boolean;
  last_step: string;
  device_type: string | null;
  repair_type: string | null;
  created_at: string;
}

interface RecoveryHistory {
  leadId: string;
  sentAt: string;
  couponCode?: string;
  couponDiscount?: number;
}

const LeadsManagement = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'active' | 'converted' | 'returning'>('active');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Recovery email state
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [recoveryCouponCode, setRecoveryCouponCode] = useState('');
  const [recoveryCouponDiscount, setRecoveryCouponDiscount] = useState('');
  const [recoveryPreviewHtml, setRecoveryPreviewHtml] = useState<string | null>(null);
  const [showRecoveryPreview, setShowRecoveryPreview] = useState(false);
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const [recoveryHistory, setRecoveryHistory] = useState<RecoveryHistory[]>([]);

  const loadLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    
    if (data) {
      // Backfill device_type/repair_type from orders for older leads
      const phonesNeedingData = data
        .filter(l => !l.device_type && !l.repair_type && l.customer_phone)
        .map(l => l.customer_phone);
      
      if (phonesNeedingData.length > 0) {
        const uniquePhones = [...new Set(phonesNeedingData)];
        const { data: orders } = await supabase
          .from('orders')
          .select('customer_phone, device_type, issue_description')
          .in('customer_phone', uniquePhones)
          .order('created_at', { ascending: false });
        
        if (orders) {
          const orderMap = new Map<string, { device: string; repair: string }>();
          orders.forEach(o => {
            if (!orderMap.has(o.customer_phone)) {
              orderMap.set(o.customer_phone, { device: o.device_type, repair: o.issue_description });
            }
          });
          
          data.forEach(l => {
            if (!l.device_type && !l.repair_type) {
              const orderInfo = orderMap.get(l.customer_phone);
              if (orderInfo) {
                l.device_type = orderInfo.device;
                l.repair_type = orderInfo.repair;
              }
            }
          });
        }
      }
      setLeads(data as Lead[]);
    }
    if (error) console.error('Error loading leads:', error);
    setIsLoading(false);
  };

  useEffect(() => {
    loadLeads();
    // Load recovery history from localStorage
    const saved = localStorage.getItem('recovery_email_history');
    if (saved) setRecoveryHistory(JSON.parse(saved));

    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => loadLeads())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const deleteLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id);
    toast.success('הליד נמחק');
  };

  const markConverted = async (id: string) => {
    await supabase.from('leads').update({ converted: true }).eq('id', id);
    toast.success('סומן כהזמנה');
  };

  const openRecoveryDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setRecoveryCouponCode('');
    setRecoveryCouponDiscount('');
    setRecoveryPreviewHtml(null);
    setRecoveryDialogOpen(true);
  };

  const handleRecoveryPreview = async () => {
    if (!selectedLead) return;
    try {
      const { data, error } = await supabase.functions.invoke('send-lead-recovery-email', {
        body: {
          customerName: selectedLead.customer_name,
          customerEmail: selectedLead.customer_email || '',
          lastStep: selectedLead.last_step,
          couponCode: recoveryCouponCode || undefined,
          couponDiscount: recoveryCouponDiscount ? Number(recoveryCouponDiscount) : undefined,
          deviceType: selectedLead.device_type || undefined,
          repairType: selectedLead.repair_type || undefined,
          preview: true,
        }
      });
      if (error) throw error;
      if (data?.html) {
        setRecoveryPreviewHtml(data.html);
        setShowRecoveryPreview(true);
      }
    } catch (e) {
      toast.error('שגיאה בטעינת התצוגה המקדימה');
    }
  };

  const handleSendRecovery = async () => {
    if (!selectedLead || !selectedLead.customer_email) {
      toast.error('אין כתובת מייל ללקוח');
      return;
    }
    setIsSendingRecovery(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-lead-recovery-email', {
        body: {
          customerName: selectedLead.customer_name,
          customerEmail: selectedLead.customer_email,
          lastStep: selectedLead.last_step,
          couponCode: recoveryCouponCode || undefined,
          couponDiscount: recoveryCouponDiscount ? Number(recoveryCouponDiscount) : undefined,
          preview: false,
        }
      });
      if (error) throw error;
      
      // Save to history
      const entry: RecoveryHistory = {
        leadId: selectedLead.id,
        sentAt: new Date().toISOString(),
        couponCode: recoveryCouponCode || undefined,
        couponDiscount: recoveryCouponDiscount ? Number(recoveryCouponDiscount) : undefined,
      };
      const newHistory = [...recoveryHistory, entry];
      setRecoveryHistory(newHistory);
      localStorage.setItem('recovery_email_history', JSON.stringify(newHistory));

      toast.success(`מייל שחזור נשלח ל-${selectedLead.customer_email}`);
      setRecoveryDialogOpen(false);
      setShowRecoveryPreview(false);
    } catch (e) {
      toast.error('שגיאה בשליחת המייל');
    }
    setIsSendingRecovery(false);
  };

  const getLeadRecoveryHistory = (leadId: string) => {
    return recoveryHistory.filter(h => h.leadId === leadId);
  };

  const searchMatch = (l: Lead) =>
    l.customer_name.includes(search) || l.customer_phone.includes(search) || (l.customer_email && l.customer_email.includes(search));

  const filtered = leads.filter(l => {
    if (!searchMatch(l)) return false;
    if (filter === 'active') return !l.converted;
    if (filter === 'converted') return l.converted;
    if (filter === 'returning') return l.is_returning_customer;
    return true;
  });

  const activeCount = leads.filter(l => !l.converted).length;
  const convertedCount = leads.filter(l => l.converted).length;
  const returningCount = leads.filter(l => l.is_returning_customer).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי שם, טלפון או מייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Stats - clickable filters */}
      <div className="grid grid-cols-3 gap-3">
        <Card
          className={`p-3 text-center cursor-pointer transition-all ${filter === 'active' ? 'ring-2 ring-primary' : 'opacity-70'}`}
          onClick={() => setFilter('active')}
        >
          <p className="text-2xl font-bold text-foreground">{activeCount}</p>
          <p className="text-xs text-muted-foreground">לידים פעילים</p>
        </Card>
        <Card
          className={`p-3 text-center cursor-pointer transition-all ${filter === 'converted' ? 'ring-2 ring-success' : 'opacity-70'}`}
          onClick={() => setFilter('converted')}
        >
          <p className="text-2xl font-bold text-success">{convertedCount}</p>
          <p className="text-xs text-muted-foreground">הומרו להזמנה</p>
        </Card>
        <Card
          className={`p-3 text-center cursor-pointer transition-all ${filter === 'returning' ? 'ring-2 ring-warning' : 'opacity-70'}`}
          onClick={() => setFilter('returning')}
        >
          <p className="text-2xl font-bold text-warning">{returningCount}</p>
          <p className="text-xs text-muted-foreground">לקוחות חוזרים</p>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">אין לידים פעילים</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => {
            const history = getLeadRecoveryHistory(lead.id);
            return (
              <Card key={lead.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm">{lead.customer_name}</p>
                      {lead.is_returning_customer && (
                        <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded-full font-medium">
                          חוזר
                        </span>
                      )}
                      {lead.privacy_accepted && (
                        <Shield className="w-3.5 h-3.5 text-success" />
                      )}
                    </div>
                    {lead.customer_phone && (
                      <a href={`tel:${lead.customer_phone}`} className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {lead.customer_phone}
                      </a>
                    )}
                    {lead.customer_email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {lead.customer_email}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {format(new Date(lead.created_at), 'dd/MM HH:mm', { locale: he })}
                    </p>
                    {lead.last_step && lead.last_step !== 'intro' && (
                      <span className="inline-block text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium mt-1">
                        עצר ב: {lead.last_step}
                      </span>
                    )}
                    {lead.device_type && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium mt-1 mr-1">
                        <Smartphone className="w-2.5 h-2.5" />
                        {lead.device_type}
                      </span>
                    )}
                    {lead.repair_type && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium mt-1 mr-1">
                        <Wrench className="w-2.5 h-2.5" />
                        {lead.repair_type}
                      </span>
                    )}
                    {/* Recovery history */}
                    {history.length > 0 && (
                      <div className="mt-1">
                        {history.map((h, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-medium mr-1">
                            <Mail className="w-2.5 h-2.5" />
                            נשלח {format(new Date(h.sentAt), 'dd/MM HH:mm', { locale: he })}
                            {h.couponCode && ` | קופון: ${h.couponCode}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {/* Recovery email button */}
                    {lead.customer_email && !lead.converted && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-primary"
                        onClick={() => openRecoveryDialog(lead)}
                        title="שלח מייל שחזור"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-success"
                      onClick={() => markConverted(lead.id)}
                      title="סמן כהומר להזמנה"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteLead(lead.id)}
                      title="מחק"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recovery Email Dialog */}
      <Dialog open={recoveryDialogOpen} onOpenChange={setRecoveryDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">שלח מייל שחזור הזמנה</DialogTitle>
            <DialogDescription className="text-right">
              {selectedLead?.customer_name} - עצר ב: {selectedLead?.last_step}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-right">קוד קופון (לא חובה)</label>
              <Input
                placeholder="קוד קופון להנחה"
                value={recoveryCouponCode}
                onChange={e => setRecoveryCouponCode(e.target.value)}
                dir="ltr"
                className="text-right"
              />
            </div>
            {recoveryCouponCode && (
              <div>
                <label className="block text-sm font-medium mb-1 text-right">סכום הנחה (₪)</label>
                <Input
                  placeholder="50"
                  value={recoveryCouponDiscount}
                  onChange={e => setRecoveryCouponDiscount(e.target.value)}
                  type="number"
                  dir="ltr"
                  className="text-right"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRecoveryPreview} className="flex-1 gap-2">
                <Eye className="w-4 h-4" />
                תצוגה מקדימה
              </Button>
              <Button onClick={handleSendRecovery} disabled={isSendingRecovery || !selectedLead?.customer_email} className="flex-1 gap-2">
                <Send className="w-4 h-4" />
                {isSendingRecovery ? 'שולח...' : 'שלח מייל'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recovery Email Preview Dialog */}
      <Dialog open={showRecoveryPreview} onOpenChange={setShowRecoveryPreview}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>תצוגה מקדימה - מייל שחזור</DialogTitle>
            <DialogDescription>כך ייראה המייל שיישלח ללקוח</DialogDescription>
          </DialogHeader>
          {recoveryPreviewHtml && (
            <iframe
              srcDoc={recoveryPreviewHtml}
              className="w-full border-0 rounded-b-2xl"
              style={{ height: '60vh' }}
              title="תצוגה מקדימה"
            />
          )}
          <div className="p-4 pt-0 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowRecoveryPreview(false)}>סגור</Button>
            <Button onClick={() => { handleSendRecovery(); setShowRecoveryPreview(false); }}>
              <Send className="w-4 h-4 ml-2" /> שלח מייל
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsManagement;
