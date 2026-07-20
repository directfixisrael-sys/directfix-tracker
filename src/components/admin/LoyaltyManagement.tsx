import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Minus, Award, Coins, MessageCircle, ChevronDown, ChevronUp, History, Send, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PointRow {
  id: string;
  points: number;
  type: string;
  description: string | null;
  created_at: string;
}

interface CustomerPoints {
  phone: string;
  name: string;
  totalPoints: number;
  totalValue: number;
  history: PointRow[];
  lastActivity: string | null;
}

const POINT_VALUE = 0.5;

const ORDER_URL = 'https://directfix.co.il/';

type TemplateKey = 'general' | 'battery' | 'screen' | 'seasonal' | 'expiring' | 'vip';

const buildTemplates = (name: string, points: number, value: number) => {
  const first = (name || 'לקוח/ה').split(' ')[0];
  const link = ORDER_URL;
  return {
    general: {
      label: 'תזכורת כללית',
      text:
`היי ${first},
רצינו להזכיר לך שיש לך *${points} נקודות נאמנות* אצלנו בדיירקט פיקס - שוות *${value.toFixed(0)} ש"ח הנחה* על התיקון הבא.

הנקודות ייכנסו אוטומטית ברגע שתזין את מספר הטלפון שלך בהזמנה:
${link}

נשמח לעזור בכל דבר!
צוות דיירקט פיקס`,
    },
    battery: {
      label: 'סוללה נחלשת',
      text:
`היי ${first},
הסוללה של האייפון שלך התחילה להיחלש? זה הזמן המושלם להחליף.
במיוחד בשבילך: יש לך אצלנו *${points} נקודות = ${value.toFixed(0)} ש"ח הנחה* על החלפת סוללה מקורית של אפל עם שנה אחריות מלאה.

הזמנה מהירה - הטכנאי מגיע אליך עד הבית:
${link}

הנקודות יתעדכנו אוטומטית בהזנת מספר הטלפון.`,
    },
    screen: {
      label: 'מסך שבור',
      text:
`היי ${first},
מסך שבור או שריטה שמפריעה? אצלנו יש לך *${points} נקודות שוות ${value.toFixed(0)} ש"ח הנחה* על החלפת מסך.

טכנאי מוסמך אצלך בבית או בעבודה, החלפה תוך 30 דקות עם אחריות מלאה:
${link}`,
    },
    seasonal: {
      label: 'מבצע עונתי',
      text:
`היי ${first},
מבצע מיוחד ללקוחות המועדון - וגם לך יש כבר *${points} נקודות שוות ${value.toFixed(0)} ש"ח הנחה* מצטברת שמחכה להתממש.

הזמן את התיקון הבא שלך והנקודות ירדו אוטומטית מהמחיר:
${link}`,
    },
    expiring: {
      label: 'נקודות פגות תוקף',
      text:
`היי ${first},
רצינו לעדכן אותך שהנקודות שצברת אצלנו יפוגו בקרוב.
יש לך *${points} נקודות = ${value.toFixed(0)} ש"ח הנחה* שממתינות לך.

כדי לממש - פשוט הזמן תיקון והזן את מספר הטלפון שלך:
${link}

נשמח לראותך שוב!`,
    },
    vip: {
      label: 'לקוח VIP - תודה',
      text:
`${first} היקר/ה,
תודה שאתה חלק ממשפחת דיירקט פיקס.
צברת אצלנו *${points} נקודות נאמנות = ${value.toFixed(0)} ש"ח הנחה* שממתינות לך לתיקון הבא.

מוזמן/ת להזמין בכל עת:
${link}

תמיד לשירותך.`,
    },
  } as Record<TemplateKey, { label: string; text: string }>;
};

const LoyaltyManagement = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerPoints[]>([]);
  const [search, setSearch] = useState('');
  const [adjustPhone, setAdjustPhone] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);
  const [messageCustomer, setMessageCustomer] = useState<CustomerPoints | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('general');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  const loadCustomers = async () => {
    setIsLoading(true);
    const { data: points } = await supabase
      .from('loyalty_points')
      .select('*')
      .order('created_at', { ascending: false });

    if (points) {
      const { data: orders } = await supabase
        .from('orders')
        .select('customer_phone, customer_name');

      const nameMap = new Map<string, string>();
      orders?.forEach(o => nameMap.set(o.customer_phone, o.customer_name));

      const map = new Map<string, CustomerPoints>();
      points.forEach(p => {
        const existing = map.get(p.customer_phone) || {
          phone: p.customer_phone,
          name: nameMap.get(p.customer_phone) || 'לקוח',
          totalPoints: 0,
          totalValue: 0,
          history: [],
          lastActivity: null,
        };
        if (p.type === 'earned') existing.totalPoints += p.points;
        else if (p.type === 'redeemed') existing.totalPoints -= p.points;
        else existing.totalPoints += p.points;
        existing.totalValue = existing.totalPoints * POINT_VALUE;
        existing.history.push({
          id: p.id,
          points: p.points,
          type: p.type,
          description: p.description,
          created_at: p.created_at,
        });
        if (!existing.lastActivity || p.created_at > existing.lastActivity) {
          existing.lastActivity = p.created_at;
        }
        map.set(p.customer_phone, existing);
      });

      setCustomers(Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (messageCustomer) {
      const t = buildTemplates(messageCustomer.name, messageCustomer.totalPoints, messageCustomer.totalValue);
      setCustomText(t[selectedTemplate].text);
    }
  }, [messageCustomer, selectedTemplate]);

  const handleAdjust = async (type: 'add' | 'deduct') => {
    if (!adjustPhone.trim() || !adjustAmount) return;
    const pts = parseInt(adjustAmount);
    if (isNaN(pts) || pts <= 0) {
      toast({ title: 'כמות לא תקינה', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('loyalty_points').insert({
      customer_phone: adjustPhone.trim().replace(/\D/g, ''),
      points: type === 'deduct' ? -pts : pts,
      type: 'adjustment',
      description: adjustDescription.trim() || (type === 'add' ? 'הוספה ידנית' : 'הפחתה ידנית'),
    });

    if (error) {
      toast({ title: 'שגיאה', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: type === 'add' ? 'נקודות נוספו' : 'נקודות הופחתו' });
      setAdjustAmount('');
      setAdjustDescription('');
      loadCustomers();
    }
  };

  const filtered = customers.filter(c =>
    c.phone.includes(search) || c.name.includes(search)
  );

  const openMessage = (c: CustomerPoints) => {
    setSelectedTemplate('general');
    setMessageCustomer(c);
  };

  const sendWhatsApp = () => {
    if (!messageCustomer) return;
    const phone = messageCustomer.phone.replace(/\D/g, '').replace(/^0/, '');
    const waLink = `https://wa.me/972${phone}?text=${encodeURIComponent(customText)}`;
    window.open(waLink, '_blank');
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const templates = messageCustomer
    ? buildTemplates(messageCustomer.name, messageCustomer.totalPoints, messageCustomer.totalValue)
    : null;

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">ניהול נקודות נאמנות</h2>
        <p className="text-muted-foreground text-sm">כל 100 ש"ח = 10 נקודות | כל נקודה = {POINT_VALUE} ש"ח</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{customers.length}</p>
          <p className="text-xs text-muted-foreground">לקוחות עם נקודות</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {customers.reduce((sum, c) => sum + Math.max(0, c.totalPoints), 0)}
          </p>
          <p className="text-xs text-muted-foreground">סה"כ נקודות פעילות</p>
        </Card>
        <Card className="p-4 text-center col-span-2 md:col-span-1">
          <p className="text-2xl font-bold text-warning">
            ₪{(customers.reduce((sum, c) => sum + Math.max(0, c.totalValue), 0)).toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground">שווי כולל</p>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          הוספה/הפחתה ידנית
        </h3>
        <div className="space-y-3">
          <Input placeholder="מספר טלפון" value={adjustPhone} onChange={e => setAdjustPhone(e.target.value)} dir="ltr" className="text-right" />
          <Input type="number" placeholder="כמות נקודות" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} />
          <Input placeholder="סיבה (לא חובה)" value={adjustDescription} onChange={e => setAdjustDescription(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={() => handleAdjust('add')} className="flex-1 gap-2">
              <Plus className="w-4 h-4" /> הוסף נקודות
            </Button>
            <Button onClick={() => handleAdjust('deduct')} variant="outline" className="flex-1 gap-2">
              <Minus className="w-4 h-4" /> הפחת נקודות
            </Button>
          </div>
        </div>
      </Card>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="חפש לפי שם או טלפון..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">טוען...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>אין לקוחות עם נקודות</p>
          </div>
        ) : (
          filtered.map(c => {
            const isOpen = expandedPhone === c.phone;
            return (
              <Card key={c.phone} className="overflow-hidden">
                <div className="p-4 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setExpandedPhone(isOpen ? null : c.phone)}
                    className="flex-1 text-right flex items-center gap-2 min-w-0"
                  >
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{c.name}</p>
                      <p className="text-sm text-muted-foreground truncate" dir="ltr">{c.phone}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => openMessage(c)}
                      className="w-9 h-9 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center transition-colors"
                      title="שלח הודעת וואטסאפ"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    </button>
                    <div className="text-left">
                      <p className="text-xl font-bold text-primary">{c.totalPoints}</p>
                      <p className="text-xs text-muted-foreground">= ₪{c.totalValue.toFixed(0)}</p>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border/60 bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-4 h-4 text-primary" />
                      <p className="font-semibold text-sm">היסטוריית נקודות ({c.history.length})</p>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {c.history.map(h => {
                        const isEarn = h.type === 'earned' || (h.type === 'adjustment' && h.points > 0);
                        const isRedeem = h.type === 'redeemed';
                        const sign = isRedeem ? '-' : (h.points >= 0 ? '+' : '');
                        const displayPoints = Math.abs(h.points);
                        const date = new Date(h.created_at).toLocaleDateString('he-IL', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        });
                        const label = h.type === 'earned' ? 'צבירה מתיקון'
                          : h.type === 'redeemed' ? 'מימוש בהזמנה'
                          : 'התאמה ידנית';
                        return (
                          <div key={h.id} className="flex items-center justify-between bg-background rounded-lg p-2.5 text-sm">
                            <div className="min-w-0">
                              <p className="font-medium">{label}</p>
                              {h.description && <p className="text-xs text-muted-foreground truncate">{h.description}</p>}
                              <p className="text-[10px] text-muted-foreground" dir="ltr">{date}</p>
                            </div>
                            <div className={`font-bold text-base shrink-0 ${isEarn ? 'text-success' : isRedeem ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {sign}{displayPoints}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* WhatsApp message dialog */}
      <Dialog open={!!messageCustomer} onOpenChange={(o) => !o && setMessageCustomer(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              שליחת הודעה ל{messageCustomer?.name}
            </DialogTitle>
          </DialogHeader>

          {messageCustomer && templates && (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-xl p-3 flex items-center justify-between border border-primary/20">
                <div>
                  <p className="text-xs text-muted-foreground">יתרה נוכחית</p>
                  <p className="font-bold text-primary text-lg">{messageCustomer.totalPoints} נקודות</p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">שווי הנחה</p>
                  <p className="font-bold text-success text-lg">₪{messageCustomer.totalValue.toFixed(0)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">בחר תבנית הודעה</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(templates) as TemplateKey[]).map(k => (
                    <button
                      key={k}
                      onClick={() => setSelectedTemplate(k)}
                      className={`text-sm rounded-xl px-3 py-2 border transition-all ${
                        selectedTemplate === k
                          ? 'border-primary bg-primary text-primary-foreground font-semibold'
                          : 'border-border bg-background hover:border-primary/40'
                      }`}
                    >
                      {templates[k].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">תצוגה מקדימה (ניתן לערוך)</p>
                <textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  className="w-full min-h-[220px] rounded-xl border border-input bg-background p-3 text-sm leading-relaxed"
                  dir="rtl"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={sendWhatsApp} className="flex-1 gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                  <Send className="w-4 h-4" /> שלח בוואטסאפ
                </Button>
                <Button onClick={copyText} variant="outline" className="gap-2">
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'הועתק' : 'העתק'}
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground text-center">
                הנקודות של הלקוח יופחתו אוטומטית ברגע שהוא יזין את מספר הטלפון שלו בהזמנה הבאה.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="p-4 bg-muted/50">
        <h4 className="font-bold text-sm mb-2">מדיניות תוכנית הנקודות</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>- כל 100 ש"ח בתיקון = 10 נקודות</li>
          <li>- כל נקודה שווה {POINT_VALUE} ש"ח</li>
          <li>- הנקודות ממומשות אוטומטית בהזמנה הבאה לפי מספר הטלפון</li>
          <li>- ניתן לשנות/לבטל את התוכנית בכל עת</li>
        </ul>
      </Card>
    </div>
  );
};

export default LoyaltyManagement;
