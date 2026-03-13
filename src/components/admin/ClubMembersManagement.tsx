import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Minus, Coins, MessageCircle, Crown, Send, Users, Sparkles, Loader2, Image, Trash2, Edit, Mail, Eye, History, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
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
  { id: 'discount', name: 'הנחה מיוחדת', preview: 'הנחה בלעדית לחברי מועדון' },
  { id: 'holiday', name: 'ברכת חג', preview: 'ברכה חמה לחג' },
  { id: 'new_service', name: 'שירות חדש', preview: 'הכירו את השירות החדש שלנו' },
  { id: 'flash_sale', name: 'מבצע בזק', preview: 'מבצע מוגבל בזמן' },
];

const TEXT_STYLES = [
  { id: 'marketing_heavy', name: 'שיווקי מלא', description: 'אימוג\'ים + טקסט שיווקי אגרסיבי' },
  { id: 'marketing_light', name: 'שיווקי קליל', description: 'אימוג\'ים מעטים + טקסט מאוזן' },
  { id: 'professional', name: 'מקצועי', description: 'ללא אימוג\'ים, טקסט רשמי' },
  { id: 'minimal', name: 'מינימלי', description: 'קצר וענייני, בלי קישוטים' },
];

const IMAGE_STYLES = [
  { id: 'none', name: 'ללא תמונה' },
  { id: 'banner', name: 'באנר מבצע' },
  { id: 'product', name: 'תמונת מוצר' },
  { id: 'abstract', name: 'עיצוב גרפי' },
  { id: 'photo', name: 'צילום ריאליסטי' },
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

  // Member edit/delete
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ClubMember | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', isActive: true });

  // Broadcast state
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [textStyle, setTextStyle] = useState('marketing_light');
  const [imageStyle, setImageStyle] = useState('none');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const loadMembers = async () => {
    setIsLoading(true);

    const { data: clubMembers } = await supabase
      .from('club_members')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: points } = await supabase
      .from('loyalty_points')
      .select('*');

    const { data: orders } = await supabase
      .from('orders')
      .select('customer_phone, customer_name');

    const nameMap = new Map<string, string>();
    orders?.forEach(o => nameMap.set(o.customer_phone, o.customer_name));

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

  // --- Member CRUD ---
  const openEditMember = (member: ClubMember) => {
    setEditingMember(member);
    setEditForm({ name: member.name, email: member.email || '', phone: member.phone, isActive: member.isActive });
    setEditDialogOpen(true);
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;
    try {
      const { error } = await supabase
        .from('club_members')
        .update({
          name: editForm.name,
          email: editForm.email || null,
          is_active: editForm.isActive,
        })
        .eq('phone', editingMember.phone);

      if (error) throw error;
      toast({ title: 'הפרופיל עודכן בהצלחה' });
      setEditDialogOpen(false);
      loadMembers();
    } catch (err: any) {
      toast({ title: 'שגיאה בעדכון', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteMember = async (phone: string, name: string) => {
    if (!confirm(`האם למחוק את ${name} מהמועדון?`)) return;
    try {
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('phone', phone);

      if (error) throw error;
      toast({ title: `${name} הוסר מהמועדון` });
      loadMembers();
    } catch (err: any) {
      toast({ title: 'שגיאה במחיקה', description: err.message, variant: 'destructive' });
    }
  };

  // --- Points ---
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

  // --- AI Generation ---
  const handleGenerateAI = async (withImage: boolean) => {
    if (!aiPrompt.trim()) {
      toast({ title: 'נא לכתוב תיאור למבצע', variant: 'destructive' });
      return;
    }
    if (withImage) setIsGeneratingImage(true);
    else setIsGeneratingAI(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-club-promo', {
        body: {
          prompt: aiPrompt,
          template: selectedTemplate,
          generateImage: withImage,
          textStyle,
          imageStyle: withImage ? imageStyle : undefined,
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setBroadcastMessage(data.message || '');
      setBroadcastSubject(data.subject || '');
      if (data.image) setGeneratedImage(data.image);

      toast({ title: withImage ? 'הודעה ותמונה נוצרו בהצלחה' : 'הודעה נוצרה בהצלחה' });
    } catch (err: any) {
      console.error('AI generation error:', err);
      toast({ title: 'שגיאה ביצירת מבצע', description: err.message || 'נסה שוב', variant: 'destructive' });
    } finally {
      setIsGeneratingAI(false);
      setIsGeneratingImage(false);
    }
  };

  // --- Send email broadcast ---
  const handleSendEmailBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast({ title: 'נא להזין הודעה', variant: 'destructive' });
      return;
    }

    const activeWithEmail = members.filter(m => m.isActive && m.email);
    if (activeWithEmail.length === 0) {
      toast({ title: 'אין חברי מועדון עם כתובת מייל', variant: 'destructive' });
      return;
    }

    if (!confirm(`לשלוח מייל ל-${activeWithEmail.length} חברי מועדון?`)) return;

    setIsSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-club-broadcast-email', {
        body: {
          subject: broadcastSubject || 'מבצע מיוחד מדיירקט פיקס!',
          message: broadcastMessage,
          image: generatedImage,
          recipients: activeWithEmail.map(m => ({ email: m.email!, name: m.name })),
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: `המייל נשלח בהצלחה!`,
        description: `נשלח ל-${data?.sent || activeWithEmail.length} חברי מועדון`,
      });
    } catch (err: any) {
      console.error('Email broadcast error:', err);
      toast({ title: 'שגיאה בשליחה', description: err.message, variant: 'destructive' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const filtered = members.filter(c =>
    c.phone.includes(search) || c.name.includes(search)
  );

  const activeCount = members.filter(m => m.isActive).length;
  const activeWithEmailCount = members.filter(m => m.isActive && m.email).length;

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto space-y-6" dir="rtl">
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
          <p className="text-2xl font-bold text-green-500">
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
            <Mail className="w-4 h-4" />
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
              filtered.map(c => (
                <Card key={c.phone} className={`p-4 ${!c.isActive ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {c.name}
                        {!c.isActive && (
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">לא פעיל</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground" dir="ltr">{c.phone}</p>
                      {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                      <p className="text-[10px] text-muted-foreground/60">
                        הצטרף: {new Date(c.joinedAt).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditMember(c)}
                        title="ערוך פרופיל"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMember(c.phone, c.name)}
                        title="מחק מהמועדון"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="text-left mr-2">
                        <p className="text-xl font-bold text-primary">{c.totalPoints}</p>
                        <p className="text-xs text-muted-foreground">= ₪{c.totalValue.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
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

        {/* Broadcast tab - redesigned */}
        <TabsContent value="broadcast" className="space-y-4 mt-4">
          <Card className="p-5 space-y-5">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                שליחת מבצע במייל לחברי המועדון
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {activeWithEmailCount} חברים עם כתובת מייל מתוך {activeCount} חברים פעילים
              </p>
            </div>

            {/* Template selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">בחר סוג הודעה:</label>
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
            </div>

            {/* Text style */}
            <div className="space-y-2">
              <label className="text-sm font-medium">סגנון טקסט:</label>
              <Select value={textStyle} onValueChange={setTextStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_STYLES.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="text-right">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground mr-2">- {s.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image style */}
            <div className="space-y-2">
              <label className="text-sm font-medium">סוג תמונה:</label>
              <Select value={imageStyle} onValueChange={setImageStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_STYLES.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">תאר את המבצע או ההודעה:</label>
              <Textarea
                placeholder="לדוגמא: 20% הנחה על החלפת מסך לכל חברי המועדון, או: חג פסח שמח..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleGenerateAI(false)}
                  disabled={isGeneratingAI || isGeneratingImage || !aiPrompt.trim()}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGeneratingAI ? 'מעצב...' : 'צור טקסט'}
                </Button>
                {imageStyle !== 'none' && (
                  <Button
                    onClick={() => handleGenerateAI(true)}
                    disabled={isGeneratingAI || isGeneratingImage || !aiPrompt.trim()}
                    className="flex-1 gap-2"
                    variant="outline"
                  >
                    {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                    {isGeneratingImage ? 'מעצב...' : 'צור טקסט + תמונה'}
                  </Button>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">נושא המייל:</label>
              <Input
                value={broadcastSubject}
                onChange={e => setBroadcastSubject(e.target.value)}
                placeholder="מבצע מיוחד מדיירקט פיקס!"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium">תוכן ההודעה:</label>
              <Textarea
                placeholder="כתוב את ההודעה כאן או השתמש ב-AI..."
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                rows={6}
              />
            </div>

            {/* Preview */}
            {broadcastMessage && (
              <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-primary/5 border-amber-500/20">
                <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  תצוגה מקדימה:
                </p>
                <div className="bg-card rounded-lg p-4 space-y-3 border">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <img src={directfixLogo} alt="DirectFix" className="w-8 h-8 rounded" />
                    <div>
                      <p className="text-sm font-bold">דיירקט פיקס</p>
                      <p className="text-xs text-muted-foreground">{broadcastSubject || 'מבצע מיוחד'}</p>
                    </div>
                  </div>
                  {generatedImage && (
                    <img src={generatedImage} alt="Promo" className="w-full rounded-lg" />
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{broadcastMessage}</p>
                </div>
              </Card>
            )}

            <Button
              onClick={handleSendEmailBroadcast}
              disabled={!broadcastMessage.trim() || isSendingEmail || activeWithEmailCount === 0}
              className="w-full h-12 gap-2 bg-gradient-to-l from-amber-500 to-primary hover:from-amber-500/90 hover:to-primary/90"
            >
              {isSendingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {isSendingEmail ? 'שולח...' : `שלח מייל ל-${activeWithEmailCount} חברי מועדון`}
            </Button>

            {activeWithEmailCount < activeCount && (
              <p className="text-xs text-amber-600 text-center">
                {activeCount - activeWithEmailCount} חברים ללא כתובת מייל לא יקבלו את ההודעה
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit member dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת פרופיל חבר</DialogTitle>
            <DialogDescription>עדכון פרטי החבר במועדון</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1 block">שם</label>
              <Input
                value={editForm.name}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">מייל</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                dir="ltr"
                className="text-right"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">טלפון</label>
              <Input
                value={editForm.phone}
                disabled
                dir="ltr"
                className="text-right opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-1">לא ניתן לשנות מספר טלפון</p>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">חבר פעיל</label>
              <Switch
                checked={editForm.isActive}
                onCheckedChange={(checked) => setEditForm(p => ({ ...p, isActive: checked }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveMember} className="flex-1">שמור</Button>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>ביטול</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClubMembersManagement;
