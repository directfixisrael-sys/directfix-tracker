import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Minus, Award, Coins, MessageCircle, Crown, Send, Users, Sparkles, Loader2, Image, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import directfixLogo from '@/assets/directfix-logo.png';

interface ClubMember {
  phone: string;
  name: string;
  email: string | null;
  totalPoints: number;
  totalValue: number;
  joinedAt: string;
  isActive: boolean;
}

const POINT_VALUE = 0.5;

const PROMO_TEMPLATES = [
  { id: 'discount', name: 'הנחה מיוחדת', emoji: '', preview: 'הנחה בלעדית לחברי מועדון' },
  { id: 'holiday', name: 'ברכת חג', emoji: '', preview: 'ברכה חמה לחג' },
  { id: 'new_service', name: 'שירות חדש', emoji: '', preview: 'הכירו את השירות החדש שלנו' },
  { id: 'flash_sale', name: 'מבצע בזק', emoji: '', preview: 'מבצע מוגבל בזמן' },
];

const ClubMembersManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [adjustPhone, setAdjustPhone] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [subTab, setSubTab] = useState<'members' | 'points' | 'broadcast'>('members');
  
  // Broadcast state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedPromo, setGeneratedPromo] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const loadMembers = async () => {
    setIsLoading(true);
    
    // Load club members
    const { data: clubMembers } = await supabase
      .from('club_members')
      .select('*')
      .order('created_at', { ascending: false });

    // Load loyalty points
    const { data: points } = await supabase
      .from('loyalty_points')
      .select('*');

    // Load customer names from orders
    const { data: orders } = await supabase
      .from('orders')
      .select('customer_phone, customer_name');

    const nameMap = new Map<string, string>();
    orders?.forEach(o => nameMap.set(o.customer_phone, o.customer_name));

    // Build points map
    const pointsMap = new Map<string, number>();
    points?.forEach(p => {
      const current = pointsMap.get(p.customer_phone) || 0;
      if (p.type === 'earned') pointsMap.set(p.customer_phone, current + p.points);
      else if (p.type === 'redeemed') pointsMap.set(p.customer_phone, current - p.points);
      else if (p.type === 'adjustment') pointsMap.set(p.customer_phone, current + p.points);
    });

    if (clubMembers) {
      const mapped: ClubMember[] = clubMembers.map(m => ({
        phone: m.phone,
        name: m.name || nameMap.get(m.phone) || 'חבר מועדון',
        email: m.email,
        totalPoints: pointsMap.get(m.phone) || 0,
        totalValue: (pointsMap.get(m.phone) || 0) * POINT_VALUE,
        joinedAt: m.joined_at,
        isActive: m.is_active,
      }));
      setMembers(mapped.sort((a, b) => b.totalPoints - a.totalPoints));
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, []);

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
      loadMembers();
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: 'נא לכתוב תיאור למבצע', variant: 'destructive' });
      return;
    }
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-club-promo', {
        body: { prompt: aiPrompt, template: selectedTemplate }
      });
      if (error) throw error;
      setGeneratedPromo(data.message || '');
      setBroadcastMessage(data.message || '');
      setBroadcastSubject(data.subject || '');
    } catch (err: any) {
      toast({ title: 'שגיאה ביצירת מבצע', description: err.message, variant: 'destructive' });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) {
      toast({ title: 'נא להזין הודעה', variant: 'destructive' });
      return;
    }
    
    const activeMembers = members.filter(m => m.isActive);
    // Build WhatsApp links for all members
    const message = encodeURIComponent(broadcastMessage);
    
    // Open first member's WhatsApp as example
    if (activeMembers.length > 0) {
      const firstPhone = activeMembers[0].phone.replace(/^0/, '');
      window.open(`https://wa.me/972${firstPhone}?text=${message}`, '_blank');
    }
    
    toast({ 
      title: `הודעה מוכנה לשליחה ל-${activeMembers.length} חברי מועדון`,
      description: 'נפתח WhatsApp עם ההודעה. שלח לכל חבר מועדון.'
    });
    setBroadcastOpen(false);
  };

  const filtered = members.filter(c =>
    c.phone.includes(search) || c.name.includes(search)
  );

  const activeCount = members.filter(m => m.isActive).length;

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          חברי מועדון דיירקט פיקס
        </h2>
        <p className="text-muted-foreground text-sm">ניהול חברים, נקודות ושליחת מבצעים</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{activeCount}</p>
          <p className="text-xs text-muted-foreground">חברי מועדון</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {members.reduce((sum, c) => sum + Math.max(0, c.totalPoints), 0)}
          </p>
          <p className="text-xs text-muted-foreground">סה"כ נקודות</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-success">
            ₪{(members.reduce((sum, c) => sum + Math.max(0, c.totalValue), 0)).toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground">שווי כולל</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{POINT_VALUE} ש"ח</p>
          <p className="text-xs text-muted-foreground">שווי נקודה</p>
        </Card>
      </div>

      {/* Sub tabs */}
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as any)}>
        <TabsList className="w-full">
          <TabsTrigger value="members" className="flex-1 gap-1.5">
            <Users className="w-4 h-4" />
            חברים
          </TabsTrigger>
          <TabsTrigger value="points" className="flex-1 gap-1.5">
            <Coins className="w-4 h-4" />
            נקודות
          </TabsTrigger>
          <TabsTrigger value="broadcast" className="flex-1 gap-1.5">
            <Send className="w-4 h-4" />
            שליחת מבצע
          </TabsTrigger>
        </TabsList>

        {/* Members tab */}
        <TabsContent value="members" className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="חפש לפי שם או טלפון..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">טוען...</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Crown className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>אין חברי מועדון עדיין</p>
              </div>
            ) : (
              filtered.map(c => {
                const pointsMsg = c.totalPoints > 0
                  ? `היי ${c.name}!\nיש לך *${c.totalPoints} נקודות נאמנות* בדיירקט פיקס!\nזה שווה *₪${c.totalValue.toFixed(0)} הנחה* על התיקון הבא שלך\n\nנשמח לראותך שוב!`
                  : `היי ${c.name}!\nרצינו לעדכן אותך שיש לך תוכנית נקודות נאמנות בדיירקט פיקס!\nכל 100 ש"ח בתיקון = 10 נקודות\n\nנשמח לראותך!`;
                const waLink = `https://wa.me/972${c.phone.replace(/^0/, '')}?text=${encodeURIComponent(pointsMsg)}`;
                
                return (
                  <Card key={c.phone} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                          {c.name}
                        </p>
                        <p className="text-sm text-muted-foreground" dir="ltr">{c.phone}</p>
                        {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                        <p className="text-[10px] text-muted-foreground/60">
                          הצטרף: {new Date(c.joinedAt).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center transition-colors"
                          title="שלח הודעת וואטסאפ"
                        >
                          <MessageCircle className="w-4 h-4 text-[#25D366]" />
                        </a>
                        <div className="text-left">
                          <p className="text-xl font-bold text-primary">{c.totalPoints}</p>
                          <p className="text-xs text-muted-foreground">= ₪{c.totalValue.toFixed(0)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Points tab */}
        <TabsContent value="points" className="space-y-4 mt-4">
          <Card className="p-5">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              הוספה/הפחתה ידנית
            </h3>
            <div className="space-y-3">
              <Input
                placeholder="מספר טלפון"
                value={adjustPhone}
                onChange={e => setAdjustPhone(e.target.value)}
                dir="ltr"
                className="text-right"
              />
              <Input
                type="number"
                placeholder="כמות נקודות"
                value={adjustAmount}
                onChange={e => setAdjustAmount(e.target.value)}
              />
              <Input
                placeholder="סיבה (לא חובה)"
                value={adjustDescription}
                onChange={e => setAdjustDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={() => handleAdjust('add')} className="flex-1 gap-2">
                  <Plus className="w-4 h-4" /> הוסף
                </Button>
                <Button onClick={() => handleAdjust('deduct')} variant="outline" className="flex-1 gap-2">
                  <Minus className="w-4 h-4" /> הפחת
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/50">
            <h4 className="font-bold text-sm mb-2">מדיניות תוכנית הנקודות</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>- כל 100 ש"ח בתיקון = 10 נקודות</li>
              <li>- כל נקודה שווה {POINT_VALUE} ש"ח</li>
              <li>- הנקודות ממומשות אוטומטית בהזמנה הבאה</li>
              <li>- הנקודות תקפות ל-24 חודשים</li>
              <li>- ניתן לשנות/לבטל את התוכנית בכל עת</li>
            </ul>
          </Card>
        </TabsContent>

        {/* Broadcast tab */}
        <TabsContent value="broadcast" className="space-y-4 mt-4">
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              שליחת מבצע/הודעה לכל חברי המועדון
            </h3>
            <p className="text-sm text-muted-foreground">
              בחר טמפלט או כתוב תיאור והבינה המלאכותית תעצב לך מבצע מושלם
            </p>

            {/* Templates */}
            <div className="grid grid-cols-2 gap-2">
              {PROMO_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t.id); setAiPrompt(t.preview); }}
                  className={`p-3 rounded-xl border-2 text-right transition-all ${
                    selectedTemplate === t.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-foreground/20'
                  }`}
                >
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.preview}</p>
                </button>
              ))}
            </div>

            {/* AI prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">תאר את המבצע או ההודעה שברצונך לשלוח:</label>
              <Textarea
                placeholder="לדוגמא: 20% הנחה על החלפת מסך לכל חברי המועדון, או: חג פסח שמח..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={handleGenerateAI} 
                disabled={isGeneratingAI || !aiPrompt.trim()}
                className="w-full gap-2"
                variant="outline"
              >
                {isGeneratingAI ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isGeneratingAI ? 'מעצב את ההודעה...' : 'עצב עם AI'}
              </Button>
            </div>

            {/* Generated/manual message */}
            <div className="space-y-2">
              <label className="text-sm font-medium">ההודעה שתשלח:</label>
              <Textarea
                placeholder="כתוב את ההודעה כאן או השתמש ב-AI..."
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                rows={5}
              />
            </div>

            {/* Preview */}
            {broadcastMessage && (
              <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-primary/5 border-amber-500/20">
                <p className="text-xs font-bold text-muted-foreground mb-2">תצוגה מקדימה:</p>
                <div className="bg-card rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={directfixLogo} alt="DirectFix" className="w-6 h-6 rounded" />
                    <span className="text-xs font-bold">דיירקט פיקס</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{broadcastMessage}</p>
                </div>
              </Card>
            )}

            <Button 
              onClick={handleSendBroadcast}
              disabled={!broadcastMessage.trim()}
              className="w-full h-12 gap-2 bg-gradient-to-r from-amber-500 to-primary hover:from-amber-500/90 hover:to-primary/90"
            >
              <Send className="w-4 h-4" />
              שלח ל-{activeCount} חברי מועדון
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubMembersManagement;
