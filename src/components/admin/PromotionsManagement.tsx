import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Gift, Tag, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Promotion {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  badge_text: string | null;
  icon: string | null;
  value: number | null;
  created_at: string;
}

const iconOptions = [
  { value: 'gift', label: 'מתנה', icon: '🎁' },
  { value: 'tag', label: 'תגית', icon: '🏷️' },
  { value: 'sparkles', label: 'כוכבים', icon: '✨' },
  { value: 'percent', label: 'אחוזים', icon: '💯' },
  { value: 'fire', label: 'אש', icon: '🔥' },
  { value: 'star', label: 'כוכב', icon: '⭐' },
];

const PromotionsManagement = () => {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    badge_text: '',
    icon: 'gift',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const loadPromotions = async () => {
    try {
      // For admin, we need to see all promotions, not just active ones
      // Since RLS only allows viewing active promotions, we'll use a workaround
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
      toast({
        title: 'שגיאה בטעינת המבצעים',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPromotion) {
        // Update existing
        const { error } = await supabase
          .from('promotions')
          .update({
            title: formData.title,
            description: formData.description,
            badge_text: formData.badge_text || null,
            icon: formData.icon,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            is_active: formData.is_active,
          })
          .eq('id', editingPromotion.id);

        if (error) throw error;
        toast({ title: 'המבצע עודכן בהצלחה' });
      } else {
        // Create new
        const { error } = await supabase
          .from('promotions')
          .insert({
            title: formData.title,
            description: formData.description,
            badge_text: formData.badge_text || null,
            icon: formData.icon,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            is_active: formData.is_active,
          });

        if (error) throw error;
        toast({ title: 'המבצע נוצר בהצלחה' });
      }

      setIsDialogOpen(false);
      resetForm();
      loadPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast({
        title: 'שגיאה בשמירת המבצע',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את המבצע?')) return;

    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'המבצע נמחק' });
      loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({
        title: 'שגיאה במחיקת המבצע',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (promotion: Promotion) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !promotion.is_active })
        .eq('id', promotion.id);

      if (error) throw error;
      loadPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      badge_text: '',
      icon: 'gift',
      start_date: '',
      end_date: '',
      is_active: true,
    });
    setEditingPromotion(null);
  };

  const openEditDialog = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      badge_text: promotion.badge_text || '',
      icon: promotion.icon || 'gift',
      start_date: promotion.start_date || '',
      end_date: promotion.end_date || '',
      is_active: promotion.is_active,
    });
    setIsDialogOpen(true);
  };

  const getIconEmoji = (iconValue: string | null) => {
    return iconOptions.find(i => i.value === iconValue)?.icon || '🎁';
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">ניהול מבצעים</h2>
          <p className="text-muted-foreground text-sm">{promotions.length} מבצעים</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          מבצע חדש
        </Button>
      </div>

      {/* Promotions List */}
      {promotions.length === 0 ? (
        <Card className="p-8 text-center">
          <Gift className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">אין מבצעים פעילים</p>
          <p className="text-sm text-muted-foreground">צור מבצע חדש כדי להתחיל</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {promotions.map((promotion) => (
            <Card 
              key={promotion.id} 
              className={cn(
                "p-4 transition-all",
                !promotion.is_active && "opacity-60"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{getIconEmoji(promotion.icon)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{promotion.title}</h3>
                    {promotion.badge_text && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {promotion.badge_text}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{promotion.description}</p>
                  {(promotion.start_date || promotion.end_date) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {promotion.start_date && (
                        <span>מ-{new Date(promotion.start_date).toLocaleDateString('he-IL')}</span>
                      )}
                      {promotion.end_date && (
                        <span>עד {new Date(promotion.end_date).toLocaleDateString('he-IL')}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={promotion.is_active}
                    onCheckedChange={() => toggleActive(promotion)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(promotion)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(promotion.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'עריכת מבצע' : 'מבצע חדש'}</DialogTitle>
            <DialogDescription>
              {editingPromotion ? 'ערוך את פרטי המבצע' : 'הוסף מבצע חדש שיוצג ללקוחות'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">כותרת</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="למשל: 20% הנחה על מסכים"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">תיאור</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="תיאור קצר של המבצע"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">תג (אופציונלי)</label>
                <Input
                  value={formData.badge_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
                  placeholder="למשל: חדש!"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">אייקון</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {iconOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">תאריך התחלה</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">תאריך סיום</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">מבצע פעיל</label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingPromotion ? 'עדכן' : 'צור מבצע'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                ביטול
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionsManagement;
