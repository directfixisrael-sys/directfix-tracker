import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Plus, Trash2, Loader2, CalendarRange, Clock } from 'lucide-react';

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

const VacationManagement = () => {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDate, setNewDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDateRange, setIsDateRange] = useState(false);
  const [isTimeBlock, setIsTimeBlock] = useState(false);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  useEffect(() => {
    loadBlockedDates();
  }, []);

  const loadBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setBlockedDates((data as BlockedDate[]) || []);
    } catch (error) {
      console.error('Error loading blocked dates:', error);
      toast.error('שגיאה בטעינת התאריכים החסומים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlockedDate = async () => {
    if (!newDate) {
      toast.error('אנא בחר תאריך');
      return;
    }

    if (isDateRange && !newEndDate) {
      toast.error('אנא בחר תאריך סיום');
      return;
    }

    if (isDateRange && new Date(newEndDate) < new Date(newDate)) {
      toast.error('תאריך הסיום חייב להיות אחרי תאריך ההתחלה');
      return;
    }

    if (isTimeBlock && (!newStartTime || !newEndTime)) {
      toast.error('אנא בחר שעת התחלה ושעת סיום');
      return;
    }

    if (isTimeBlock && newStartTime >= newEndTime) {
      toast.error('שעת הסיום חייבת להיות אחרי שעת ההתחלה');
      return;
    }

    setIsAdding(true);
    try {
      const timeData = isTimeBlock
        ? { start_time: newStartTime, end_time: newEndTime }
        : { start_time: null, end_time: null };

      if (isDateRange) {
        const dates: { date: string; reason: string | null; start_time: string | null; end_time: string | null }[] = [];
        const start = new Date(newDate);
        const end = new Date(newEndDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push({
            date: d.toISOString().split('T')[0],
            reason: newReason || null,
            ...timeData,
          });
        }

        const { error } = await supabase
          .from('blocked_dates')
          .insert(dates);

        if (error) throw error;
        toast.success(`${dates.length} תאריכים נחסמו בהצלחה`);
      } else {
        const { error } = await supabase
          .from('blocked_dates')
          .insert({
            date: newDate,
            reason: newReason || null,
            ...timeData,
          });

        if (error) throw error;
        toast.success('התאריך נחסם בהצלחה');
      }

      setNewDate('');
      setNewEndDate('');
      setNewReason('');
      setNewStartTime('');
      setNewEndTime('');
      loadBlockedDates();
    } catch (error) {
      console.error('Error adding blocked date:', error);
      toast.error('שגיאה בהוספת התאריך');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('התאריך הוסר');
      loadBlockedDates();
    } catch (error) {
      console.error('Error deleting blocked date:', error);
      toast.error('שגיאה במחיקת התאריך');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5); // "HH:MM"
  };

  const isPastDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const futureDates = blockedDates.filter(d => !isPastDate(d.date));
  const pastDates = blockedDates.filter(d => isPastDate(d.date));

  return (
    <div className="space-y-6">
      {/* Add new blocked date */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          הוסף תאריך חסום / חופשה
        </h3>
        
        {/* Toggles */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <CalendarRange className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="date-range" className="text-sm cursor-pointer flex-1">
              טווח תאריכים (מתאריך עד תאריך)
            </Label>
            <Switch
              id="date-range"
              checked={isDateRange}
              onCheckedChange={setIsDateRange}
            />
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="time-block" className="text-sm cursor-pointer flex-1">
              חסום שעות מסוימות בלבד (לא כל היום)
            </Label>
            <Switch
              id="time-block"
              checked={isTimeBlock}
              onCheckedChange={setIsTimeBlock}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                {isDateRange ? 'מתאריך' : 'תאריך'}
              </label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {isDateRange && (
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">עד תאריך</label>
                <Input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  min={newDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>

          {/* Time inputs */}
          {isTimeBlock && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-accent/30 rounded-lg border border-accent">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">משעה</label>
                <Input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">עד שעה</label>
                <Input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">סיבה (לא חובה)</label>
            <Input
              placeholder="למשל: חופשה, חג..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleAddBlockedDate}
            disabled={isAdding || !newDate || (isDateRange && !newEndDate) || (isTimeBlock && (!newStartTime || !newEndTime))}
            className="w-full md:w-auto"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
            ) : (
              <Plus className="w-4 h-4 ml-2" />
            )}
            {isTimeBlock ? 'הוסף חסימת שעות' : isDateRange ? 'הוסף טווח תאריכים' : 'הוסף תאריך חסום'}
          </Button>
        </div>
      </Card>

      {/* Future blocked dates */}
      {futureDates.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-foreground">תאריכים חסומים קרובים ({futureDates.length})</h3>
          <div className="space-y-2">
            {futureDates.map((blockedDate) => (
              <Card key={blockedDate.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${blockedDate.start_time ? 'bg-orange-100' : 'bg-destructive/10'}`}>
                    {blockedDate.start_time ? (
                      <Clock className="w-5 h-5 text-orange-600" />
                    ) : (
                      <Calendar className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{formatDate(blockedDate.date)}</p>
                    {blockedDate.start_time && blockedDate.end_time && (
                      <p className="text-sm text-orange-600 font-medium">
                        🕐 {formatTime(blockedDate.start_time)} - {formatTime(blockedDate.end_time)}
                      </p>
                    )}
                    {!blockedDate.start_time && (
                      <p className="text-xs text-muted-foreground">כל היום</p>
                    )}
                    {blockedDate.reason && (
                      <p className="text-sm text-muted-foreground">{blockedDate.reason}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteBlockedDate(blockedDate.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {futureDates.length === 0 && (
        <Card className="p-6 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">אין תאריכים חסומים קרובים</p>
          <p className="text-sm text-muted-foreground mt-1">כל הימים זמינים להזמנות</p>
        </Card>
      )}

      {/* Past blocked dates */}
      {pastDates.length > 0 && (
        <div className="opacity-60">
          <h3 className="font-medium mb-2 text-sm text-muted-foreground">
            תאריכים שעברו ({pastDates.length})
          </h3>
          <div className="space-y-1">
            {pastDates.slice(0, 5).map((blockedDate) => (
              <div key={blockedDate.id} className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{formatDate(blockedDate.date)}</span>
                {blockedDate.start_time && blockedDate.end_time && (
                  <span>({formatTime(blockedDate.start_time)}-{formatTime(blockedDate.end_time)})</span>
                )}
                {blockedDate.reason && <span>• {blockedDate.reason}</span>}
              </div>
            ))}
            {pastDates.length > 5 && (
              <p className="text-xs text-muted-foreground">ועוד {pastDates.length - 5}...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VacationManagement;
