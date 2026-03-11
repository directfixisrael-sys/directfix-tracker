import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Plus, Minus, Award, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomerPoints {
  phone: string;
  name: string;
  totalPoints: number;
  totalValue: number;
}

const POINT_VALUE = 0.5; // Each point = 0.5 NIS

const LoyaltyManagement = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerPoints[]>([]);
  const [search, setSearch] = useState('');
  const [adjustPhone, setAdjustPhone] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = async () => {
    setIsLoading(true);
    const { data: points } = await supabase
      .from('loyalty_points')
      .select('*')
      .order('created_at', { ascending: false });

    if (points) {
      const map = new Map<string, CustomerPoints>();
      // Also get customer names from orders
      const { data: orders } = await supabase
        .from('orders')
        .select('customer_phone, customer_name');

      const nameMap = new Map<string, string>();
      orders?.forEach(o => nameMap.set(o.customer_phone, o.customer_name));

      points.forEach(p => {
        const existing = map.get(p.customer_phone) || {
          phone: p.customer_phone,
          name: nameMap.get(p.customer_phone) || 'לקוח',
          totalPoints: 0,
          totalValue: 0,
        };
        if (p.type === 'earned') {
          existing.totalPoints += p.points;
        } else if (p.type === 'redeemed') {
          existing.totalPoints -= p.points;
        } else if (p.type === 'adjustment') {
          existing.totalPoints += p.points; // can be negative
        }
        existing.totalValue = existing.totalPoints * POINT_VALUE;
        map.set(p.customer_phone, existing);
      });

      setCustomers(Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCustomers();
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
      loadCustomers();
    }
  };

  const filtered = customers.filter(c =>
    c.phone.includes(search) || c.name.includes(search)
  );

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">ניהול נקודות נאמנות</h2>
        <p className="text-muted-foreground text-sm">כל 100 ש"ח = 10 נקודות | כל נקודה = {POINT_VALUE} ש"ח</p>
      </div>

      {/* Stats */}
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

      {/* Manual adjustment */}
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
              <Plus className="w-4 h-4" /> הוסף נקודות
            </Button>
            <Button onClick={() => handleAdjust('deduct')} variant="outline" className="flex-1 gap-2">
              <Minus className="w-4 h-4" /> הפחת נקודות
            </Button>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="חפש לפי שם או טלפון..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Customers list */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">טוען...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>אין לקוחות עם נקודות</p>
          </div>
        ) : (
          filtered.map(c => (
            <Card key={c.phone} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{c.name}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">{c.phone}</p>
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-primary">{c.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">= ₪{c.totalValue.toFixed(0)}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Policy info */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-bold text-sm mb-2">מדיניות תוכנית הנקודות</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>- כל 100 ש"ח בתיקון = 10 נקודות</li>
          <li>- כל נקודה שווה {POINT_VALUE} ש"ח</li>
          <li>- הנקודות ממומשות אוטומטית בהזמנה הבאה</li>
          <li>- ניתן לשנות/לבטל את התוכנית בכל עת</li>
        </ul>
      </Card>
    </div>
  );
};

export default LoyaltyManagement;
