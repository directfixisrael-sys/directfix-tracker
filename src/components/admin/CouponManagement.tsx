import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Tag, 
  Percent, 
  DollarSign,
  Copy,
  Loader2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

const CouponManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'fixed' as 'fixed' | 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_uses: '',
    is_active: true,
    start_date: '',
    end_date: '',
  });

  const loadCoupons = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading coupons:', error);
      toast.error('שגיאה בטעינת קופונים');
    } else {
      setCoupons((data || []).map(c => ({
        ...c,
        discount_type: c.discount_type as 'fixed' | 'percentage'
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'fixed',
      discount_value: 0,
      min_order_amount: 0,
      max_uses: '',
      is_active: true,
      start_date: '',
      end_date: '',
    });
    setEditingCoupon(null);
  };

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount || 0,
        max_uses: coupon.max_uses?.toString() || '',
        is_active: coupon.is_active,
        start_date: coupon.start_date || '',
        end_date: coupon.end_date || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast.error('יש להזין קוד קופון');
      return;
    }

    const couponData = {
      code: formData.code.toUpperCase().trim(),
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      min_order_amount: formData.min_order_amount || null,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editingCoupon.id);

      if (error) {
        toast.error('שגיאה בעדכון הקופון');
        return;
      }
      toast.success('הקופון עודכן בהצלחה');
    } else {
      const { error } = await supabase
        .from('coupons')
        .insert(couponData);

      if (error) {
        if (error.code === '23505') {
          toast.error('קוד הקופון כבר קיים');
        } else {
          toast.error('שגיאה ביצירת הקופון');
        }
        return;
      }
      toast.success('הקופון נוצר בהצלחה');
    }

    setIsDialogOpen(false);
    resetForm();
    loadCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את הקופון?')) return;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('שגיאה במחיקת הקופון');
      return;
    }

    toast.success('הקופון נמחק');
    loadCoupons();
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (error) {
      toast.error('שגיאה בעדכון הסטטוס');
      return;
    }

    loadCoupons();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('הקוד הועתק');
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    }
    return `₪${coupon.discount_value}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">ניהול קופונים</h2>
          <p className="text-sm text-muted-foreground">{coupons.length} קופונים</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          קופון חדש
        </Button>
      </div>

      {coupons.length === 0 ? (
        <Card className="p-8 text-center">
          <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">אין קופונים</h3>
          <p className="text-sm text-muted-foreground mb-4">צור את הקופון הראשון</p>
          <Button onClick={() => handleOpenDialog()}>צור קופון</Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {coupons.map(coupon => (
            <Card key={coupon.id} className={`p-4 ${!coupon.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold text-primary">{coupon.code}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyCode(coupon.code)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      {coupon.discount_type === 'percentage' ? (
                        <Percent className="w-4 h-4 text-success" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-success" />
                      )}
                      <span className="font-semibold text-success">{formatDiscount(coupon)}</span>
                    </div>
                    
                    {coupon.description && (
                      <span className="text-muted-foreground">{coupon.description}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {coupon.max_uses && (
                      <span>שימושים: {coupon.current_uses}/{coupon.max_uses}</span>
                    )}
                    {coupon.min_order_amount && coupon.min_order_amount > 0 && (
                      <span>מינימום הזמנה: ₪{coupon.min_order_amount}</span>
                    )}
                    {coupon.end_date && (
                      <span>תוקף: {new Date(coupon.end_date).toLocaleDateString('he-IL')}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={coupon.is_active}
                    onCheckedChange={() => handleToggleActive(coupon)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(coupon)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
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
            <DialogTitle>{editingCoupon ? 'עריכת קופון' : 'קופון חדש'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">קוד קופון</label>
              <div className="flex gap-2">
                <Input
                  value={formData.code}
                  onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="SUMMER20"
                  className="font-mono"
                />
                <Button variant="outline" onClick={generateCode}>יצירה</Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">תיאור (לא חובה)</label>
              <Input
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="הנחת קיץ"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">סוג הנחה</label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: 'fixed' | 'percentage') => 
                    setFormData(prev => ({ ...prev, discount_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">סכום קבוע (₪)</SelectItem>
                    <SelectItem value="percentage">אחוזים (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {formData.discount_type === 'percentage' ? 'אחוז הנחה' : 'סכום הנחה'}
                </label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={e => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  max={formData.discount_type === 'percentage' ? 100 : undefined}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">מינימום הזמנה (₪)</label>
                <Input
                  type="number"
                  value={formData.min_order_amount}
                  onChange={e => setFormData(prev => ({ ...prev, min_order_amount: parseFloat(e.target.value) || 0 }))}
                  min={0}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">מקסימום שימושים</label>
                <Input
                  type="number"
                  value={formData.max_uses}
                  onChange={e => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                  placeholder="ללא הגבלה"
                  min={1}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">תאריך התחלה</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">תאריך סיום</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={e => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">קופון פעיל</label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                ביטול
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {editingCoupon ? 'עדכון' : 'יצירה'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponManagement;