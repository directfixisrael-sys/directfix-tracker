import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Smartphone,
  Battery,
  Search,
  Loader2,
  GripVertical,
  Save
} from 'lucide-react';
import { REPAIR_ICON_OPTIONS, getRepairIconComponent } from '@/lib/repairIcons';
import IconPickerField from '@/components/IconPickerField';
import { toast } from 'sonner';

interface IphoneModel {
  id: string;
  name: string;
  original_screen_price: number;
  compatible_screen_price: number;
  battery_price: number;
  back_glass_price: number;
  charging_price: number;
  is_active: boolean;
  sort_order: number;
  series: string;
  min_lead_hours: number;
}

interface ModelRepairPrice {
  model_id: string;
  repair_type_id: string;
  price: number;
}

interface RepairType {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  is_phone_only: boolean;
  is_active: boolean;
  sort_order: number;
}

type TabType = 'models' | 'repairs';

const PriceManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>('models');
  const [models, setModels] = useState<IphoneModel[]>([]);
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [modelRepairPrices, setModelRepairPrices] = useState<ModelRepairPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Model dialog state
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<IphoneModel | null>(null);
  const [modelForm, setModelForm] = useState({
    name: '',
    series: '',
    is_active: true,
    min_lead_hours: 0,
  });
  const [repairPriceForm, setRepairPriceForm] = useState<Record<string, number>>({});
  const [newSeriesName, setNewSeriesName] = useState('');
  const [isCreatingNewSeries, setIsCreatingNewSeries] = useState(false);

  // Series drag-and-drop state
  const [seriesOrder, setSeriesOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('series_order');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [draggedSeries, setDraggedSeries] = useState<string | null>(null);
  const [dragOverSeries, setDragOverSeries] = useState<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; series: string } | null>(null);

  // Get ordered series list
  const getOrderedSeries = useCallback(() => {
    const allSeries = Array.from(new Set(models.map(m => m.series).filter(Boolean)));
    return [...allSeries].sort((a, b) => {
      const idxA = seriesOrder.indexOf(a);
      const idxB = seriesOrder.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }, [models, seriesOrder]);

  const handleSeriesDrop = (targetSeries: string) => {
    if (!draggedSeries || draggedSeries === targetSeries) {
      setDraggedSeries(null);
      setDragOverSeries(null);
      return;
    }
    const ordered = getOrderedSeries();
    const fromIdx = ordered.indexOf(draggedSeries);
    const toIdx = ordered.indexOf(targetSeries);
    if (fromIdx === -1 || toIdx === -1) return;
    const newOrder = [...ordered];
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, draggedSeries);
    setSeriesOrder(newOrder);
    localStorage.setItem('series_order', JSON.stringify(newOrder));
    setDraggedSeries(null);
    setDragOverSeries(null);
  };

  const handleTouchStart = (e: React.TouchEvent, series: string) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, series };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    if (dx > 10 || dy > 10) {
      setDraggedSeries(touchStartRef.current.series);
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el) {
        const chipEl = el.closest('[data-series]') as HTMLElement;
        if (chipEl) {
          const overSeries = chipEl.getAttribute('data-series');
          if (overSeries && overSeries !== touchStartRef.current.series) {
            setDragOverSeries(overSeries);
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (draggedSeries && dragOverSeries) {
      handleSeriesDrop(dragOverSeries);
    }
    setDraggedSeries(null);
    setDragOverSeries(null);
    touchStartRef.current = null;
  };
  
  // Repair type dialog state
  const [isRepairDialogOpen, setIsRepairDialogOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<RepairType | null>(null);
  const [repairForm, setRepairForm] = useState({
    name: '',
    description: '',
    icon: 'smartphone',
    is_phone_only: false,
    is_active: true,
  });
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'model' | 'repair'; id: string } | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [modelsRes, repairsRes, pricesRes] = await Promise.all([
        supabase.from('iphone_models').select('*').order('sort_order'),
        supabase.from('repair_types').select('*').order('sort_order'),
        supabase.from('model_repair_prices').select('*'),
      ]);

      if (modelsRes.data) setModels(modelsRes.data);
      if (repairsRes.data) setRepairTypes(repairsRes.data);
      if (pricesRes.data) setModelRepairPrices(pricesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get price for a model+repair from the junction table
  const getModelRepairPrice = (modelId: string, repairTypeId: string): number => {
    const entry = modelRepairPrices.find(p => p.model_id === modelId && p.repair_type_id === repairTypeId);
    return entry?.price || 0;
  };

  // Model functions
  const openModelDialog = (model?: IphoneModel) => {
    if (model) {
      setEditingModel(model);
      setModelForm({
        name: model.name,
        series: model.series,
        is_active: model.is_active,
        min_lead_hours: model.min_lead_hours || 0,
      });
      // Load prices for this model from junction table
      const prices: Record<string, number> = {};
      repairTypes.forEach(rt => {
        prices[rt.id] = getModelRepairPrice(model.id, rt.id);
      });
      setRepairPriceForm(prices);
    } else {
      setEditingModel(null);
      setModelForm({
        name: '',
        series: '',
        is_active: true,
        min_lead_hours: 0,
      });
      // Initialize all prices to 0
      const prices: Record<string, number> = {};
      repairTypes.forEach(rt => { prices[rt.id] = 0; });
      setRepairPriceForm(prices);
    }
    setIsCreatingNewSeries(false);
    setNewSeriesName('');
    setIsModelDialogOpen(true);
  };

  const saveModel = async () => {
    const finalSeries = isCreatingNewSeries ? newSeriesName.trim() : modelForm.series;
    
    if (!modelForm.name.trim()) {
      toast.error('יש להזין שם דגם');
      return;
    }
    if (!finalSeries) {
      toast.error('יש לבחור או ליצור סדרה');
      return;
    }

    try {
      let modelId: string;
      
      if (editingModel) {
        const { error } = await supabase
          .from('iphone_models')
          .update({
            name: modelForm.name.trim(),
            series: finalSeries,
            is_active: modelForm.is_active,
            min_lead_hours: modelForm.min_lead_hours,
          })
          .eq('id', editingModel.id);

        if (error) throw error;
        modelId = editingModel.id;
        toast.success('הדגם עודכן בהצלחה');
      } else {
        const maxOrder = Math.max(...models.map(m => m.sort_order), 0);
        const { data, error } = await supabase
          .from('iphone_models')
          .insert({
            name: modelForm.name.trim(),
            series: finalSeries,
            is_active: modelForm.is_active,
            min_lead_hours: modelForm.min_lead_hours,
            sort_order: maxOrder + 1,
          })
          .select('id')
          .single();

        if (error) throw error;
        modelId = data.id;
        toast.success('הדגם נוסף בהצלחה');
      }

      // Save repair prices to junction table
      const upserts = Object.entries(repairPriceForm).map(([repairTypeId, price]) => ({
        model_id: modelId,
        repair_type_id: repairTypeId,
        price: price || 0,
      }));

      if (upserts.length > 0) {
        const { error: priceError } = await supabase
          .from('model_repair_prices')
          .upsert(upserts, { onConflict: 'model_id,repair_type_id' });
        if (priceError) throw priceError;
      }

      setIsModelDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error('שגיאה בשמירת הדגם');
    }
  };

  const toggleModelActive = async (model: IphoneModel) => {
    try {
      const { error } = await supabase
        .from('iphone_models')
        .update({ is_active: !model.is_active })
        .eq('id', model.id);

      if (error) throw error;
      
      setModels(models.map(m => 
        m.id === model.id ? { ...m, is_active: !m.is_active } : m
      ));
      toast.success(model.is_active ? 'הדגם הוסתר' : 'הדגם הופעל');
    } catch (error) {
      console.error('Error toggling model:', error);
      toast.error('שגיאה בעדכון הדגם');
    }
  };

  // Repair type functions
  const openRepairDialog = (repair?: RepairType) => {
    if (repair) {
      setEditingRepair(repair);
      setRepairForm({
        name: repair.name,
        description: repair.description || '',
        icon: repair.icon,
        is_phone_only: repair.is_phone_only,
        is_active: repair.is_active,
      });
    } else {
      setEditingRepair(null);
      setRepairForm({
        name: '',
        description: '',
        icon: 'smartphone',
        is_phone_only: false,
        is_active: true,
      });
    }
    setIsRepairDialogOpen(true);
  };

  const saveRepair = async () => {
    if (!repairForm.name.trim()) {
      toast.error('יש להזין שם סוג תיקון');
      return;
    }

    try {
      if (editingRepair) {
        const { error } = await supabase
          .from('repair_types')
          .update({
            name: repairForm.name.trim(),
            description: repairForm.description.trim() || null,
            icon: repairForm.icon,
            is_phone_only: repairForm.is_phone_only,
            is_active: repairForm.is_active,
          })
          .eq('id', editingRepair.id);

        if (error) throw error;
        toast.success('סוג התיקון עודכן בהצלחה');
      } else {
        const maxOrder = Math.max(...repairTypes.map(r => r.sort_order), 0);
        const { error } = await supabase
          .from('repair_types')
          .insert({
            name: repairForm.name.trim(),
            description: repairForm.description.trim() || null,
            icon: repairForm.icon,
            is_phone_only: repairForm.is_phone_only,
            is_active: repairForm.is_active,
            sort_order: maxOrder + 1,
          });

        if (error) throw error;
        toast.success('סוג התיקון נוסף בהצלחה');
      }

      setIsRepairDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving repair type:', error);
      toast.error('שגיאה בשמירת סוג התיקון');
    }
  };

  const toggleRepairActive = async (repair: RepairType) => {
    try {
      const { error } = await supabase
        .from('repair_types')
        .update({ is_active: !repair.is_active })
        .eq('id', repair.id);

      if (error) throw error;
      
      setRepairTypes(repairTypes.map(r => 
        r.id === repair.id ? { ...r, is_active: !r.is_active } : r
      ));
      toast.success(repair.is_active ? 'סוג התיקון הוסתר' : 'סוג התיקון הופעל');
    } catch (error) {
      console.error('Error toggling repair:', error);
      toast.error('שגיאה בעדכון סוג התיקון');
    }
  };

  // Delete functions
  const handleDelete = (type: 'model' | 'repair', id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'model') {
        const { error } = await supabase
          .from('iphone_models')
          .delete()
          .eq('id', itemToDelete.id);
        if (error) throw error;
        toast.success('הדגם נמחק בהצלחה');
      } else {
        const { error } = await supabase
          .from('repair_types')
          .delete()
          .eq('id', itemToDelete.id);
        if (error) throw error;
        toast.success('סוג התיקון נמחק בהצלחה');
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('שגיאה במחיקה');
    }
  };

  // Filter models
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRepairIcon = getRepairIconComponent;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2">ניהול מחירון</h2>
        <p className="text-muted-foreground text-sm">עריכת דגמי אייפון, מחירים וסוגי תיקונים</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'models' ? 'default' : 'outline'}
          onClick={() => setActiveTab('models')}
          className="gap-2"
        >
          <Smartphone className="w-4 h-4" />
          דגמים ומחירים
        </Button>
        <Button
          variant={activeTab === 'repairs' ? 'default' : 'outline'}
          onClick={() => setActiveTab('repairs')}
          className="gap-2"
        >
          <Battery className="w-4 h-4" />
          סוגי תיקון
        </Button>
      </div>

      {activeTab === 'models' && (
        <>
          {/* Search and Add */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש דגם..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button onClick={() => openModelDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              הוסף דגם
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-primary">{models.length}</p>
              <p className="text-xs text-muted-foreground">סה"כ דגמים</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-success">{models.filter(m => m.is_active).length}</p>
              <p className="text-xs text-muted-foreground">דגמים פעילים</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-muted-foreground">{models.filter(m => !m.is_active).length}</p>
              <p className="text-xs text-muted-foreground">דגמים מוסתרים</p>
            </Card>
          </div>

          {/* Models List */}
          <div className="space-y-2">
            {filteredModels.map((model) => (
              <Card 
                key={model.id} 
                className={`p-4 transition-all ${!model.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{model.name}</p>
                      {model.series && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{model.series}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {repairTypes.filter(rt => rt.is_active).map(rt => {
                        const price = getModelRepairPrice(model.id, rt.id);
                        if (price <= 0) return null;
                        return <span key={rt.id}>{rt.name}: ₪{price}</span>;
                      })}
                      {model.min_lead_hours > 0 && <span className="text-warning">⏰ {model.min_lead_hours} שעות מראש</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={model.is_active}
                      onCheckedChange={() => toggleModelActive(model)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openModelDialog(model)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete('model', model.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'repairs' && (
        <>
          {/* Add Button */}
          <div className="flex justify-end mb-4">
            <Button onClick={() => openRepairDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              הוסף סוג תיקון
            </Button>
          </div>

          {/* Repair Types List */}
          <div className="space-y-2">
            {repairTypes.map((repair) => {
              const Icon = getRepairIcon(repair.icon);
              return (
                <Card 
                  key={repair.id} 
                  className={`p-4 transition-all ${!repair.is_active ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      repair.is_phone_only ? 'bg-warning/10' : 'bg-primary/10'
                    }`}>
                      <Icon className={`w-6 h-6 ${repair.is_phone_only ? 'text-warning' : 'text-primary'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{repair.name}</p>
                      {repair.description && (
                        <p className="text-sm text-muted-foreground">{repair.description}</p>
                      )}
                      {repair.is_phone_only && (
                        <span className="inline-block text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full mt-1">
                          הזמנה טלפונית בלבד
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={repair.is_active}
                        onCheckedChange={() => toggleRepairActive(repair)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openRepairDialog(repair)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete('repair', repair.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Model Dialog */}
      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingModel ? 'עריכת דגם' : 'הוספת דגם חדש'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Series selection */}
            <div>
              <label className="block text-sm font-medium mb-2">סדרה</label>
              {!isCreatingNewSeries ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {getOrderedSeries().map(series => (
                      <button
                        key={series}
                        type="button"
                        data-series={series}
                        draggable
                        onDragStart={() => setDraggedSeries(series)}
                        onDragOver={(e) => { e.preventDefault(); if (draggedSeries && draggedSeries !== series) setDragOverSeries(series); }}
                        onDrop={() => handleSeriesDrop(series)}
                        onDragEnd={() => { setDraggedSeries(null); setDragOverSeries(null); }}
                        onTouchStart={(e) => handleTouchStart(e, series)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => setModelForm({ ...modelForm, series })}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-grab active:cursor-grabbing ${
                          modelForm.series === series
                            ? 'bg-primary text-primary-foreground'
                            : dragOverSeries === series
                              ? 'bg-primary/20 ring-2 ring-primary ring-dashed'
                              : draggedSeries === series
                                ? 'opacity-50 bg-muted text-foreground'
                                : 'bg-muted hover:bg-muted/80 text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <GripVertical className="w-3 h-3 opacity-40" />
                          {series}
                        </span>
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreatingNewSeries(true);
                      setModelForm({ ...modelForm, series: '' });
                    }}
                    className="gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    סדרה חדשה
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="לדוגמה: iPhone 17 או Samsung S25"
                    value={newSeriesName}
                    onChange={(e) => setNewSeriesName(e.target.value)}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreatingNewSeries(false);
                      setNewSeriesName('');
                    }}
                  >
                    חזרה לסדרות קיימות
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">שם הדגם</label>
              <Input
                placeholder="לדוגמה: iPhone 15 Pro"
                value={modelForm.name}
                onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">מסך מקורי (₪)</label>
                <Input
                  type="number"
                  value={modelForm.original_screen_price}
                  onChange={(e) => setModelForm({ ...modelForm, original_screen_price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">מסך תואם (₪)</label>
                <Input
                  type="number"
                  value={modelForm.compatible_screen_price}
                  onChange={(e) => setModelForm({ ...modelForm, compatible_screen_price: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">סוללה מקורית (₪)</label>
                <Input
                  type="number"
                  value={modelForm.battery_price}
                  onChange={(e) => setModelForm({ ...modelForm, battery_price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">גב מקורי (₪)</label>
                <Input
                  type="number"
                  value={modelForm.back_glass_price}
                  onChange={(e) => setModelForm({ ...modelForm, back_glass_price: Number(e.target.value) })}
                />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">תיקון טעינה (₪)</label>
              <Input
                type="number"
                placeholder="0 = לא מוצג"
                value={modelForm.charging_price}
                onChange={(e) => setModelForm({ ...modelForm, charging_price: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {modelForm.charging_price > 0 ? 'תיקון טעינה יוצג ללקוח' : 'תיקון טעינה לא יוצג (מחיר 0)'}
              </p>
            </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">מרווח הזמנה מינימלי (שעות)</label>
              <Input
                type="number"
                min={0}
                placeholder="0 = ללא הגבלה"
                value={modelForm.min_lead_hours}
                onChange={(e) => setModelForm({ ...modelForm, min_lead_hours: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {modelForm.min_lead_hours > 0 
                  ? `לקוחות יוכלו להזמין לפחות ${modelForm.min_lead_hours} שעות מראש`
                  : 'ללא הגבלה - ניתן להזמין מעכשיו לעכשיו (40 דקות מינימום)'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">הצג ללקוחות</span>
              <Switch
                checked={modelForm.is_active}
                onCheckedChange={(checked) => setModelForm({ ...modelForm, is_active: checked })}
              />
            </div>
            <Button onClick={saveModel} className="w-full gap-2">
              <Save className="w-4 h-4" />
              {editingModel ? 'שמור שינויים' : 'הוסף דגם'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Repair Type Dialog */}
      <Dialog open={isRepairDialogOpen} onOpenChange={setIsRepairDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRepair ? 'עריכת סוג תיקון' : 'הוספת סוג תיקון חדש'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">שם סוג התיקון</label>
              <Input
                placeholder="לדוגמה: החלפת מסך"
                value={repairForm.name}
                onChange={(e) => setRepairForm({ ...repairForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">תיאור</label>
              <Input
                placeholder="תיאור קצר של התיקון"
                value={repairForm.description}
                onChange={(e) => setRepairForm({ ...repairForm, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">אייקון</label>
              <IconPickerField 
                value={repairForm.icon} 
                onChange={(icon) => setRepairForm({ ...repairForm, icon })} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">הזמנה טלפונית בלבד</p>
                <p className="text-xs text-muted-foreground">לא ניתן להזמין דרך האתר</p>
              </div>
              <Switch
                checked={repairForm.is_phone_only}
                onCheckedChange={(checked) => setRepairForm({ ...repairForm, is_phone_only: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">הצג ללקוחות</span>
              <Switch
                checked={repairForm.is_active}
                onCheckedChange={(checked) => setRepairForm({ ...repairForm, is_active: checked })}
              />
            </div>
            <Button onClick={saveRepair} className="w-full gap-2">
              <Save className="w-4 h-4" />
              {editingRepair ? 'שמור שינויים' : 'הוסף סוג תיקון'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו היא בלתי הפיכה. הפריט יימחק לצמיתות מהמערכת.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PriceManagement;
