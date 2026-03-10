import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Bell, 
  Check,
  CalendarPlus,
  Phone,
  User,
  Clock,
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  task_name: string;
  customer_name: string;
  customer_phone: string;
  subject: string;
  due_date: string;
  notes: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

const RemindersManagement = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [formData, setFormData] = useState({
    task_name: '',
    customer_name: '',
    customer_phone: '',
    subject: '',
    due_date: '',
    due_time: '',
    notes: '',
  });

  const loadReminders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('admin_reminders')
      .select('*')
      .order('due_date', { ascending: true });
    
    if (error) {
      console.error('Error loading reminders:', error);
      toast.error('שגיאה בטעינת תזכורות');
    } else {
      setReminders(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const resetForm = () => {
    setFormData({
      task_name: '',
      customer_name: '',
      customer_phone: '',
      subject: '',
      due_date: '',
      due_time: '',
      notes: '',
    });
    setEditingReminder(null);
  };

  const handleOpenDialog = (reminder?: Reminder) => {
    if (reminder) {
      setEditingReminder(reminder);
      const dueDate = new Date(reminder.due_date);
      setFormData({
        task_name: reminder.task_name,
        customer_name: reminder.customer_name,
        customer_phone: reminder.customer_phone,
        subject: reminder.subject,
        due_date: dueDate.toISOString().split('T')[0],
        due_time: dueDate.toTimeString().slice(0, 5),
        notes: reminder.notes || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.task_name.trim()) {
      toast.error('יש להזין שם משימה');
      return;
    }
    if (!formData.due_date) {
      toast.error('יש לבחור תאריך');
      return;
    }

    const dueDateTime = formData.due_time 
      ? `${formData.due_date}T${formData.due_time}:00`
      : `${formData.due_date}T09:00:00`;

    const reminderData = {
      task_name: formData.task_name.trim(),
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      subject: formData.subject.trim(),
      due_date: dueDateTime,
      notes: formData.notes || null,
    };

    if (editingReminder) {
      const { error } = await supabase
        .from('admin_reminders')
        .update(reminderData)
        .eq('id', editingReminder.id);

      if (error) {
        toast.error('שגיאה בעדכון התזכורת');
        return;
      }
      toast.success('התזכורת עודכנה בהצלחה');
    } else {
      const { error } = await supabase
        .from('admin_reminders')
        .insert(reminderData);

      if (error) {
        toast.error('שגיאה ביצירת התזכורת');
        return;
      }
      toast.success('התזכורת נוצרה בהצלחה');
    }

    setIsDialogOpen(false);
    resetForm();
    loadReminders();
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    const newCompleted = !reminder.is_completed;
    const { error } = await supabase
      .from('admin_reminders')
      .update({ 
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', reminder.id);

    if (error) {
      toast.error('שגיאה בעדכון הסטטוס');
      return;
    }

    toast.success(newCompleted ? 'המשימה סומנה כבוצעה' : 'המשימה הוחזרה לפעילה');
    loadReminders();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את התזכורת?')) return;

    const { error } = await supabase
      .from('admin_reminders')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('שגיאה במחיקת התזכורת');
      return;
    }

    toast.success('התזכורת נמחקה');
    loadReminders();
  };

  const addToCalendar = (reminder: Reminder) => {
    const dueDate = new Date(reminder.due_date);
    const endDate = new Date(dueDate.getTime() + 30 * 60000); // 30 min duration
    
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    const title = encodeURIComponent(`${reminder.task_name} - ${reminder.customer_name}`);
    const details = encodeURIComponent(
      `נושא: ${reminder.subject}\nלקוח: ${reminder.customer_name}\nטלפון: ${reminder.customer_phone}\n${reminder.notes ? `הערות: ${reminder.notes}` : ''}`
    );
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(dueDate)}/${formatDate(endDate)}&details=${details}`;
    window.open(googleUrl, '_blank');
    toast.success('היומן נפתח - הוסף את האירוע');
  };

  const callCustomer = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const isOverdue = (reminder: Reminder) => {
    return !reminder.is_completed && new Date(reminder.due_date) < new Date();
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'pending') return !r.is_completed;
    if (filter === 'completed') return r.is_completed;
    return true;
  });

  const pendingCount = reminders.filter(r => !r.is_completed).length;
  const overdueCount = reminders.filter(r => isOverdue(r)).length;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">תזכורות ומשימות</h2>
          <p className="text-sm text-muted-foreground">
            {pendingCount} ממתינות
            {overdueCount > 0 && (
              <span className="text-destructive font-medium mr-2">• {overdueCount} באיחור</span>
            )}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          תזכורת חדשה
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['pending', 'all', 'completed'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="gap-1.5"
          >
            {f === 'pending' && <Circle className="w-3.5 h-3.5" />}
            {f === 'all' && <Bell className="w-3.5 h-3.5" />}
            {f === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {f === 'pending' ? 'ממתינות' : f === 'all' ? 'הכל' : 'הושלמו'}
          </Button>
        ))}
      </div>

      {/* Reminders list */}
      {filteredReminders.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">
            {filter === 'completed' ? 'אין משימות שהושלמו' : 'אין תזכורות'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {filter === 'pending' ? 'מעולה! אין משימות ממתינות 🎉' : 'צור את התזכורת הראשונה'}
          </p>
          {filter !== 'completed' && (
            <Button onClick={() => handleOpenDialog()}>צור תזכורת</Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredReminders.map(reminder => (
            <Card 
              key={reminder.id} 
              className={cn(
                "p-4 transition-all",
                reminder.is_completed && "opacity-60",
                isOverdue(reminder) && "border-destructive/50 bg-destructive/5"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleComplete(reminder)}
                  className={cn(
                    "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                    reminder.is_completed 
                      ? "bg-success border-success text-success-foreground" 
                      : "border-muted-foreground/40 hover:border-primary"
                  )}
                >
                  {reminder.is_completed && <Check className="w-3.5 h-3.5" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "font-bold text-base",
                      reminder.is_completed && "line-through text-muted-foreground"
                    )}>
                      {reminder.task_name}
                    </h3>
                    {isOverdue(reminder) && (
                      <span className="flex items-center gap-1 text-destructive text-xs font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        באיחור
                      </span>
                    )}
                  </div>
                  
                  {reminder.subject && (
                    <p className="text-sm text-muted-foreground mb-1.5">📌 {reminder.subject}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {reminder.customer_name && (
                      <span className="flex items-center gap-1 text-foreground">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        {reminder.customer_name}
                      </span>
                    )}
                    {reminder.customer_phone && (
                      <button
                        onClick={() => callCustomer(reminder.customer_phone)}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {reminder.customer_phone}
                      </button>
                    )}
                    <span className={cn(
                      "flex items-center gap-1",
                      isOverdue(reminder) ? "text-destructive font-medium" : "text-muted-foreground"
                    )}>
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(reminder.due_date).toLocaleDateString('he-IL', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                      {' '}
                      {new Date(reminder.due_date).toLocaleTimeString('he-IL', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {reminder.notes && (
                    <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-lg px-3 py-2">
                      {reminder.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => addToCalendar(reminder)}
                    title="הוסף ליומן"
                  >
                    <CalendarPlus className="w-4 h-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(reminder)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(reminder.id)}>
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
            <DialogTitle>{editingReminder ? '✏️ עריכת תזכורת' : '🔔 תזכורת חדשה'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">שם המשימה *</label>
              <Input
                value={formData.task_name}
                onChange={e => setFormData(prev => ({ ...prev, task_name: e.target.value }))}
                placeholder="לדוגמה: להתקשר ללקוח"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">שם הלקוח</label>
              <Input
                value={formData.customer_name}
                onChange={e => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="שם מלא"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">טלפון הלקוח</label>
              <Input
                value={formData.customer_phone}
                onChange={e => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                placeholder="050-1234567"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">נושא התזכורת</label>
              <Input
                value={formData.subject}
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="לדוגמה: מעקב אחרי תיקון מסך"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">תאריך *</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">שעה</label>
                <Input
                  type="time"
                  value={formData.due_time}
                  onChange={e => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">הערות נוספות</label>
              <Textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="פרטים נוספים..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                ביטול
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {editingReminder ? 'עדכון' : 'יצירה'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RemindersManagement;
