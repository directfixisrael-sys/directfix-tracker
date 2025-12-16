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
  Package, 
  Percent,
  Battery,
  Smartphone,
  Loader2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Bundle {
  id: string;
  name: string;
  primary_repair_type: string;
  addon_repair_type: string;
  discount_percent: number;
  is_active: boolean;
}

const repairTypeOptions = [
  { value: 'מסך מקורי', label: 'מסך מקורי' },
  { value: 'מסך תואם', label: 'מסך תואם' },
  { value: 'סוללה', label: 'סוללה' },
];

const BundleManagement = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    primary_repair_type: 'מסך מקורי',
    addon_repair_type: 'סוללה',
    discount_percent: 30,
    is_active: true,
  });

  const loadBundles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('repair_bundles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading bundles:', error);
      toast.error('שגיאה בטעינת חבילות');
    } else {
      setBundles(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadBundles();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      primary_repair_type: 'מסך מקורי',
      addon_repair_type: 'סוללה',
      discount_percent: 30,
      is_active: true,
    });
    setEditingBundle(null);
  };

  const handleOpenDialog = (bundle?: Bundle) => {
    if (bundle) {
      setEditingBundle(bundle);
      setFormData({
        name: bundle.name,
        primary_repair_type: bundle.primary_repair_type,
        addon_repair_type: bundle.addon_repair_type,
        discount_percent: bundle.discount_percent,
        is_active: bundle.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('יש להזין שם חבילה');
      return;
    }

    if (formData.primary_repair_type === formData.addon_repair_type) {
      toast.error('סוג התיקון הראשי והתוספת חייבים להיות שונים');
      return;
    }

    const bundleData = {
      name: formData.name.trim(),
      primary_repair_type: formData.primary_repair_type,
      addon_repair_type: formData.addon_repair_type,
      discount_percent: formData.discount_percent,
      is_active: formData.is_active,
    };

    if (editingBundle) {
      const { error } = await supabase
        .from('repair_bundles')
        .update(bundleData)
        .eq('id', editingBundle.id);

      if (error) {
        toast.error('שגיאה בעדכון החבילה');
        return;
      }
      toast.success('החבילה עודכנה בהצלחה');
    } else {
      const { error } = await supabase
        .from('repair_bundles')
        .insert(bundleData);

      if (error) {
        toast.error('שגיאה ביצירת החבילה');
        return;
      }
      toast.success('החבילה נוצרה בהצלחה');
    }

    setIsDialogOpen(false);
    resetForm();
    loadBundles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את החבילה?')) return;

    const { error } = await supabase
      .from('repair_bundles')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('שגיאה במחיקת החבילה');
      return;
    }

    toast.success('החבילה נמחקה');
    loadBundles();
  };

  const handleToggleActive = async (bundle: Bundle) => {
    const { error } = await supabase
      .from('repair_bundles')
      .update({ is_active: !bundle.is_active })
      .eq('id', bundle.id);

    if (error) {
      toast.error('שגיאה בעדכון הסטטוס');
      return;
    }

    loadBundles();
  };

  const getRepairIcon = (type: string) => {
    if (type.includes('סוללה')) return <Battery className="w-5 h-5 text-amber-500" />;
    return <Smartphone className="w-5 h-5 text-primary" />;
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
          <h2 className="text-xl font-bold">ניהול חבילות תיקון</h2>
          <p className="text-sm text-muted-foreground">{bundles.length} חבילות</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          חבילה חדשה
        </Button>
      </div>

      <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-600 dark:text-amber-400">איך זה עובד?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              כשלקוח בוחר תיקון ראשי (למשל מסך), המערכת מציעה לו להוסיף תיקון נוסף (למשל סוללה) בהנחה שהגדרת.
              זה מגדיל את הסל ומשפר את חוויית הלקוח.
            </p>
          </div>
        </div>
      </Card>

      {bundles.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">אין חבילות</h3>
          <p className="text-sm text-muted-foreground mb-4">צור את החבילה הראשונה</p>
          <Button onClick={() => handleOpenDialog()}>צור חבילה</Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {bundles.map(bundle => (
            <Card key={bundle.id} className={`p-4 ${!bundle.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-lg">{bundle.name}</span>
                    <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-full font-semibold">
                      -{bundle.discount_percent}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg">
                      {getRepairIcon(bundle.primary_repair_type)}
                      <span>{bundle.primary_repair_type}</span>
                    </div>
                    <span className="text-xl text-muted-foreground">+</span>
                    <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                      {getRepairIcon(bundle.addon_repair_type)}
                      <span className="text-amber-600 dark:text-amber-400">{bundle.addon_repair_type}</span>
                      <Percent className="w-3 h-3 text-success" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={bundle.is_active}
                    onCheckedChange={() => handleToggleActive(bundle)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(bundle)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(bundle.id)}>
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
            <DialogTitle>{editingBundle ? 'עריכת חבילה' : 'חבילה חדשה'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">שם החבילה</label>
              <Input
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="למשל: מסך מקורי + סוללה"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">תיקון ראשי</label>
              <Select
                value={formData.primary_repair_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, primary_repair_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {repairTypeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">התיקון שהלקוח בוחר</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">תוספת בהנחה</label>
              <Select
                value={formData.addon_repair_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, addon_repair_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {repairTypeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">התיקון שיוצע בהנחה</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">אחוז הנחה על התוספת</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={formData.discount_percent}
                  onChange={e => setFormData(prev => ({ ...prev, discount_percent: parseInt(e.target.value) || 0 }))}
                  min={1}
                  max={90}
                  className="flex-1"
                />
                <span className="text-lg font-bold text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">ההנחה שתינתן על התוספת (מומלץ: 20-40%)</p>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">חבילה פעילה</label>
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
                {editingBundle ? 'עדכון' : 'יצירה'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BundleManagement;
