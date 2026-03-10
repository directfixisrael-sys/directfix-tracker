import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Star, Plus, Minus, Users, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface LoyaltyRecord {
  id: string;
  customer_phone: string;
  points: number;
  type: string;
  description: string;
  order_id: string | null;
  created_at: string;
}

interface CustomerSummary {
  phone: string;
  totalPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  transactionCount: number;
}

const LoyaltyManagement = () => {
  const [records, setRecords] = useState<LoyaltyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addPhone, setAddPhone] = useState('');
  const [addPoints, setAddPoints] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addType, setAddType] = useState<'earned' | 'redeemed'>('earned');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('loyalty_points')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && data) {
      setRecords(data);
    }
    setLoading(false);
  };

  // Group by customer phone
  const customerSummaries: CustomerSummary[] = (() => {
    const map = new Map<string, CustomerSummary>();
    records.forEach(r => {
      const existing = map.get(r.customer_phone) || {
        phone: r.customer_phone,
        totalPoints: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        transactionCount: 0,
      };
      existing.totalPoints += r.points;
      if (r.type === 'earned') existing.totalEarned += r.points;
      else existing.totalRedeemed += Math.abs(r.points);
      existing.transactionCount += 1;
      map.set(r.customer_phone, existing);
    });
    return Array.from(map.values())
      .filter(c => !searchPhone || c.phone.includes(searchPhone))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  })();

  const totalPointsGiven = records.filter(r => r.type === 'earned').reduce((s, r) => s + r.points, 0);
  const totalPointsRedeemed = records.filter(r => r.type === 'redeemed').reduce((s, r) => s + Math.abs(r.points), 0);
  const uniqueCustomers = new Set(records.map(r => r.customer_phone)).size;

  const handleAddPoints = async () => {
    if (!addPhone.trim() || !addPoints.trim()) {
      toast.error('יש למלא טלפון וכמות נקודות');
      return;
    }
    const pts = parseInt(addPoints);
    if (isNaN(pts) || pts <= 0) {
      toast.error('כמות נקודות לא תקינה');
      return;
    }

    const { error } = await supabase.from('loyalty_points').insert({
      customer_phone: addPhone.trim(),
      points: addType === 'earned' ? pts : -pts,
      type: addType,
      description: addDescription.trim() || (addType === 'earned' ? `הוספה ידנית: ${pts} נקודות` : `הפחתה ידנית: ${pts} נקודות`),
    });

    if (error) {
      toast.error('שגיאה בשמירה');
    } else {
      toast.success(addType === 'earned' ? 'נקודות נוספו בהצלחה' : 'נקודות הופחתו בהצלחה');
      setShowAddDialog(false);
      setAddPhone('');
      setAddPoints('');
      setAddDescription('');
      loadRecords();
    }
  };

  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const customerHistory = selectedPhone 
    ? records.filter(r => r.customer_phone === selectedPhone)
    : [];

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold">{uniqueCustomers}</p>
          <p className="text-[10px] text-muted-foreground">לקוחות בתוכנית</p>
        </Card>
        <Card className="p-3 text-center">
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-success" />
          <p className="text-xl font-bold">{totalPointsGiven}</p>
          <p className="text-[10px] text-muted-foreground">נקודות חולקו</p>
        </Card>
        <Card className="p-3 text-center">
          <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
          <p className="text-xl font-bold">{totalPointsRedeemed}</p>
          <p className="text-[10px] text-muted-foreground">נקודות מומשו</p>
        </Card>
      </div>

      {/* Search + Add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="חפש לפי מספר טלפון..."
            value={searchPhone}
            onChange={e => setSearchPhone(e.target.value)}
            className="pr-9 h-10 rounded-xl"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-1.5 h-10 rounded-xl">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">הוסף נקודות</span>
        </Button>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="text-center text-muted-foreground py-8 text-sm">טוען...</div>
      ) : customerSummaries.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 text-sm">
          {searchPhone ? 'לא נמצאו לקוחות' : 'אין עדיין נקודות נאמנות'}
        </div>
      ) : (
        <div className="space-y-2">
          {customerSummaries.map(customer => (
            <Card 
              key={customer.phone} 
              className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedPhone(selectedPhone === customer.phone ? null : customer.phone)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{customer.phone}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {customer.transactionCount} פעולות · צבר {customer.totalEarned} · מימש {customer.totalRedeemed}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-lg font-extrabold text-amber-500">{customer.totalPoints}</p>
                  <p className="text-[10px] text-muted-foreground">נקודות</p>
                </div>
              </div>

              {/* Expanded history */}
              {selectedPhone === customer.phone && (
                <div className="mt-3 pt-3 border-t border-border space-y-2 max-h-40 overflow-y-auto">
                  {customerHistory.map(record => (
                    <div key={record.id} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-muted-foreground">{record.description}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(record.created_at).toLocaleDateString('he-IL')} {new Date(record.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`font-bold ${record.type === 'earned' ? 'text-success' : 'text-destructive'}`}>
                        {record.points > 0 ? '+' : ''}{record.points}
                      </span>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 h-8 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddPhone(customer.phone);
                        setAddType('earned');
                        setShowAddDialog(true);
                      }}
                    >
                      <Plus className="w-3 h-3" /> הוסף
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 h-8 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddPhone(customer.phone);
                        setAddType('redeemed');
                        setShowAddDialog(true);
                      }}
                    >
                      <Minus className="w-3 h-3" /> הפחת
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Points Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{addType === 'earned' ? 'הוסף נקודות' : 'הפחת נקודות'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button 
                variant={addType === 'earned' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1"
                onClick={() => setAddType('earned')}
              >
                <Plus className="w-3 h-3 ml-1" /> הוסף
              </Button>
              <Button 
                variant={addType === 'redeemed' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1"
                onClick={() => setAddType('redeemed')}
              >
                <Minus className="w-3 h-3 ml-1" /> הפחת
              </Button>
            </div>
            <Input
              placeholder="מספר טלפון"
              value={addPhone}
              onChange={e => setAddPhone(e.target.value)}
              className="rounded-xl"
            />
            <Input
              placeholder="כמות נקודות"
              type="number"
              value={addPoints}
              onChange={e => setAddPoints(e.target.value)}
              className="rounded-xl"
            />
            <Input
              placeholder="סיבה (אופציונלי)"
              value={addDescription}
              onChange={e => setAddDescription(e.target.value)}
              className="rounded-xl"
            />
            <Button onClick={handleAddPoints} className="w-full rounded-xl">
              {addType === 'earned' ? 'הוסף נקודות' : 'הפחת נקודות'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoyaltyManagement;
