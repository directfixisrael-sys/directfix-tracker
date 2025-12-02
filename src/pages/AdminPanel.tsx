import { useState } from 'react';
import { useRepairStore } from '@/store/repairStore';
import { RepairOrder, RepairStatus, statusLabels } from '@/types/repair';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  Send, 
  ChevronDown,
  Users,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const AdminPanel = () => {
  const { 
    orders, 
    messages, 
    addOrder, 
    updateOrderStatus, 
    updateEstimatedArrival, 
    addNote, 
    addSupportMessage 
  } = useRepairStore();
  
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [eta, setEta] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerPhone: '',
    customerName: '',
    customerAddress: '',
    deviceType: '',
    issueDescription: '',
    repairPrice: 0,
    technicianName: '',
  });

  const handleCreateOrder = () => {
    if (newOrder.customerPhone && newOrder.customerName) {
      addOrder({
        ...newOrder,
        status: 'pending',
        accessories: [],
        notes: [],
        wantsPromotions: false,
      });
      setNewOrder({
        customerPhone: '',
        customerName: '',
        customerAddress: '',
        deviceType: '',
        issueDescription: '',
        repairPrice: 0,
        technicianName: '',
      });
      setIsNewOrderOpen(false);
    }
  };

  const handleSendMessage = () => {
    if (selectedOrder && newMessage.trim()) {
      addSupportMessage(selectedOrder.id, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleAddNote = () => {
    if (selectedOrder && newNote.trim()) {
      addNote(selectedOrder.id, newNote.trim());
      setNewNote('');
    }
  };

  const handleUpdateStatus = (status: RepairStatus) => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, status, statusNote || undefined);
      setStatusNote('');
    }
  };

  const handleUpdateEta = () => {
    if (selectedOrder && eta) {
      updateEstimatedArrival(selectedOrder.id, eta);
      setEta('');
    }
  };

  const orderMessages = selectedOrder 
    ? messages.filter(m => m.orderId === selectedOrder.id)
    : [];

  const unreadCount = messages.filter(m => !m.read && m.sender === 'customer').length;

  const getStatusColor = (status: RepairStatus) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'confirmed': return 'bg-primary/10 text-primary';
      case 'technician_assigned': return 'bg-primary/10 text-primary';
      case 'on_the_way': return 'bg-accent/10 text-accent';
      case 'arrived': return 'bg-accent/10 text-accent';
      case 'in_progress': return 'bg-accent/10 text-accent';
      case 'completed': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-l border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            <span className="font-bold text-sidebar-foreground">דיירקט פיקס</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
            <Smartphone className="w-5 h-5" />
            <span>הזמנות</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
            <Users className="w-5 h-5" />
            <span>לקוחות</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors relative">
            <MessageSquare className="w-5 h-5" />
            <span>הודעות</span>
            {unreadCount > 0 && (
              <span className="absolute left-4 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
            <Settings className="w-5 h-5" />
            <span>הגדרות</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">ניהול הזמנות</h1>
            <p className="text-sm text-muted-foreground">{orders.length} הזמנות פעילות</p>
          </div>
          
          <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                הזמנה חדשה
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>יצירת הזמנה חדשה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="שם הלקוח"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                />
                <Input
                  placeholder="טלפון"
                  value={newOrder.customerPhone}
                  onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                  dir="ltr"
                />
                <Input
                  placeholder="כתובת"
                  value={newOrder.customerAddress}
                  onChange={(e) => setNewOrder({ ...newOrder, customerAddress: e.target.value })}
                />
                <Input
                  placeholder="סוג מכשיר (לדוגמה: iPhone 14)"
                  value={newOrder.deviceType}
                  onChange={(e) => setNewOrder({ ...newOrder, deviceType: e.target.value })}
                />
                <Textarea
                  placeholder="תיאור התקלה"
                  value={newOrder.issueDescription}
                  onChange={(e) => setNewOrder({ ...newOrder, issueDescription: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="מחיר התיקון"
                  value={newOrder.repairPrice || ''}
                  onChange={(e) => setNewOrder({ ...newOrder, repairPrice: Number(e.target.value) })}
                />
                <Input
                  placeholder="שם הטכנאי"
                  value={newOrder.technicianName}
                  onChange={(e) => setNewOrder({ ...newOrder, technicianName: e.target.value })}
                />
                <Button onClick={handleCreateOrder} className="w-full">
                  צור הזמנה
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Orders list */}
          <div className="w-80 border-l border-border overflow-y-auto">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={cn(
                  "w-full p-4 border-b border-border text-right transition-colors",
                  selectedOrder?.id === order.id 
                    ? "bg-primary/5 border-r-2 border-r-primary" 
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={cn("status-badge text-xs", getStatusColor(order.status))}>
                    {statusLabels[order.status]}
                  </span>
                  <span className="font-medium text-foreground">{order.customerName}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{order.deviceType}</p>
                <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
              </button>
            ))}
          </div>

          {/* Order details */}
          {selectedOrder ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Order header */}
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className={cn("status-badge", getStatusColor(selectedOrder.status))}>
                      {statusLabels[selectedOrder.status]}
                    </span>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-foreground">{selectedOrder.customerName}</h2>
                      <p className="text-muted-foreground">{selectedOrder.customerPhone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">מכשיר</p>
                      <p className="font-medium text-foreground">{selectedOrder.deviceType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">תקלה</p>
                      <p className="font-medium text-foreground">{selectedOrder.issueDescription}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">כתובת</p>
                      <p className="font-medium text-foreground">{selectedOrder.customerAddress}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">מחיר</p>
                      <p className="font-medium text-foreground">₪{selectedOrder.repairPrice}</p>
                    </div>
                  </div>
                </div>

                {/* Status update */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">עדכון סטטוס</h3>
                  <div className="space-y-3">
                    <Select 
                      value={selectedOrder.status}
                      onValueChange={(value) => handleUpdateStatus(value as RepairStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="הערה לעדכון (אופציונלי)"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                    />
                  </div>
                </div>

                {/* ETA update */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">זמן הגעה משוער</h3>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={eta}
                      onChange={(e) => setEta(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleUpdateEta}>
                      <Clock className="w-4 h-4" />
                    </Button>
                  </div>
                  {selectedOrder.estimatedArrival && (
                    <p className="text-sm text-muted-foreground mt-2">
                      נוכחי: {selectedOrder.estimatedArrival}
                    </p>
                  )}
                </div>

                {/* Add note */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">הוספת הערה</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="הערה חדשה..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleAddNote}>הוסף</Button>
                  </div>
                  {selectedOrder.notes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {selectedOrder.notes.map((note, i) => (
                        <p key={i} className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          {note}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">צ'אט עם הלקוח</h3>
                  
                  <div className="h-64 overflow-y-auto space-y-3 mb-4 p-3 bg-muted/30 rounded-lg">
                    {orderMessages.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm">אין הודעות עדיין</p>
                    )}
                    {orderMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.sender === 'support' ? "justify-start" : "justify-end"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] px-4 py-2 rounded-2xl",
                            msg.sender === 'support' 
                              ? "bg-primary text-primary-foreground rounded-br-md" 
                              : "bg-muted text-foreground rounded-bl-md"
                          )}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={cn(
                            "text-xs mt-1",
                            msg.sender === 'support' ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            {msg.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="כתבו הודעה ללקוח..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>בחרו הזמנה מהרשימה</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
