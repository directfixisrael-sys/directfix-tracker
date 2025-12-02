import { useState, useEffect, useCallback } from 'react';
import { useRepairStore } from '@/store/repairStore';
import { RepairOrder, RepairStatus, statusLabels } from '@/types/repair';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  Send, 
  Users,
  Smartphone,
  Settings,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
  Star,
  Activity,
  Eye,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';
import PushNotificationToggle from '@/components/PushNotificationToggle';

const ADMIN_CODE = 'pp1p1xke';

const AdminPanel = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');
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

  const { 
    orders, 
    messages, 
    activeTab,
    setActiveTab,
    addOrder, 
    updateOrderStatus, 
    updateEstimatedArrival, 
    addNote, 
    addSupportMessage,
    deleteOrder,
    loadOrders,
    loadMessages,
    subscribeToRealtime,
  } = useRepairStore();

  // Check if already authenticated from session
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin-authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data and subscribe to realtime on mount
  useEffect(() => {
    loadOrders();
    loadMessages();
    const unsubscribe = subscribeToRealtime();
    return () => unsubscribe();
  }, []);

  // Update selectedOrder when orders change
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      }
    }
  }, [orders, selectedOrder?.id]);

  const handleManualRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === ADMIN_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-authenticated', 'true');
      setCodeError('');
    } else {
      setCodeError('קוד שגוי, נסה שוב');
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">פאנל ניהול</h1>
          <p className="text-muted-foreground text-sm mb-6">הכנס קוד גישה להמשך</p>
          
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <Input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="קוד גישה"
              className="text-center text-lg tracking-widest"
              autoFocus
            />
            {codeError && (
              <p className="text-destructive text-sm">{codeError}</p>
            )}
            <Button type="submit" className="w-full">
              כניסה
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const handleCreateOrder = () => {
    console.log('Creating order:', newOrder);
    if (newOrder.customerPhone && newOrder.customerName) {
      addOrder({
        ...newOrder,
        status: 'pending',
        accessories: [],
        notes: [],
        wantsPromotions: false,
      });
      console.log('Order added, current orders:', orders.length + 1);
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
      toast({
        title: "הזמנה נוצרה בהצלחה!",
        description: `הזמנה עבור ${newOrder.customerName} נוצרה`,
      });
    } else {
      console.log('Missing required fields:', { phone: newOrder.customerPhone, name: newOrder.customerName });
      toast({
        title: "שגיאה",
        description: "יש למלא שם לקוח ומספר טלפון",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    if (selectedOrder && newMessage.trim()) {
      addSupportMessage(selectedOrder.id, newMessage.trim());
      setNewMessage('');
      toast({
        title: "הודעה נשלחה",
      });
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
      toast({
        title: "סטטוס עודכן",
        description: `הסטטוס שונה ל-${statusLabels[status]}`,
      });
    }
  };

  const handleUpdateEta = () => {
    if (selectedOrder && eta) {
      updateEstimatedArrival(selectedOrder.id, eta);
      toast({
        title: "זמן הגעה עודכן",
        description: `זמן הגעה משוער: ${eta}`,
      });
      setEta('');
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
    setSelectedOrder(null);
    toast({
      title: "הזמנה נמחקה",
      variant: "destructive",
    });
  };

  const copyTrackingLink = (phone: string) => {
    const link = `${window.location.origin}/track?phone=${phone}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "הקישור הועתק!",
      description: "ניתן לשלוח ללקוח",
    });
  };

  const orderMessages = selectedOrder 
    ? messages.filter(m => m.orderId === selectedOrder.id)
    : [];

  const unreadCount = messages.filter(m => !m.read && m.sender === 'customer').length;

  // Sort messages: newest first, unread customer messages on top
  const sortedMessages = [...messages].sort((a, b) => {
    // Unread customer messages first
    if (a.sender === 'customer' && !a.read && (b.sender !== 'customer' || b.read)) return -1;
    if (b.sender === 'customer' && !b.read && (a.sender !== 'customer' || a.read)) return 1;
    // Then by date (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

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

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'messages':
        return (
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">כל ההודעות</h2>
              {unreadCount > 0 && (
                <span className="bg-warning text-warning-foreground text-sm px-3 py-1 rounded-full">
                  {unreadCount} הודעות חדשות מלקוחות
                </span>
              )}
            </div>
            <div className="space-y-4">
              {sortedMessages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">אין הודעות עדיין</p>
              ) : (
                sortedMessages.map((msg) => {
                  const order = orders.find(o => o.id === msg.orderId);
                  const isUnreadCustomer = msg.sender === 'customer' && !msg.read;
                  return (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "glass-card p-4 rounded-xl transition-all",
                        isUnreadCustomer && "border-2 border-warning bg-warning/5"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isUnreadCustomer && (
                            <span className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                          )}
                          <span className="font-medium">{msg.senderName}</span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            msg.sender === 'customer' 
                              ? "bg-primary/10 text-primary" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {msg.sender === 'customer' ? 'לקוח' : 'תמיכה'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleString('he-IL')}
                        </span>
                      </div>
                      <p className="text-foreground">{msg.message}</p>
                      {order && (
                        <p className="text-xs text-muted-foreground mt-2">
                          הזמנה: {order.customerName} - {order.deviceType}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'customers':
        const uniqueCustomers = orders.reduce((acc, order) => {
          if (!acc.find(c => c.phone === order.customerPhone)) {
            acc.push({
              phone: order.customerPhone,
              name: order.customerName,
              address: order.customerAddress,
              ordersCount: orders.filter(o => o.customerPhone === order.customerPhone).length,
            });
          }
          return acc;
        }, [] as { phone: string; name: string; address: string; ordersCount: number }[]);

        return (
          <div className="flex-1 p-6">
            <h2 className="text-xl font-bold mb-4">לקוחות ({uniqueCustomers.length})</h2>
            <div className="space-y-3">
              {uniqueCustomers.map((customer) => (
                <div key={customer.phone} className="glass-card p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      <p className="text-sm text-muted-foreground">{customer.address}</p>
                    </div>
                    <div className="text-left">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
                        {customer.ordersCount} הזמנות
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex-1 p-6 space-y-6">
            <h2 className="text-xl font-bold">הגדרות</h2>
            
            {/* Push Notifications */}
            <PushNotificationToggle />
            
            {/* Other settings */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-bold text-foreground mb-3">הגדרות נוספות</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• ניהול טכנאים</li>
                <li>• הגדרות הודעות SMS</li>
                <li>• עריכת מחירון</li>
                <li>• התאמה אישית של סטטוסים</li>
              </ul>
            </div>
            
            {/* Logout */}
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => {
                sessionStorage.removeItem('admin-authenticated');
                setIsAuthenticated(false);
              }}
            >
              <Lock className="w-4 h-4" />
              התנתק
            </Button>
          </div>
        );

      case 'feedback':
        const ordersWithFeedback = orders.filter(o => o.rating);
        const avgRating = ordersWithFeedback.length > 0 
          ? (ordersWithFeedback.reduce((sum, o) => sum + (o.rating || 0), 0) / ordersWithFeedback.length).toFixed(1)
          : '0';
        
        return (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">משוב לקוחות</h2>
              <div className="flex items-center gap-4">
                <div className="bg-warning/10 text-warning px-4 py-2 rounded-xl flex items-center gap-2">
                  <Star className="w-5 h-5 fill-warning" />
                  <span className="font-bold text-lg">{avgRating}</span>
                  <span className="text-sm">ממוצע</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {ordersWithFeedback.length} דירוגים
                </span>
              </div>
            </div>

            {ordersWithFeedback.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>אין דירוגים עדיין</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ordersWithFeedback
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .map((order) => (
                    <div key={order.id} className="glass-card p-5 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-foreground">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-5 h-5",
                                (order.rating || 0) >= star
                                  ? "fill-warning text-warning"
                                  : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {order.feedback && (
                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          <p className="text-foreground text-sm">"{order.feedback}"</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{order.deviceType} - {order.issueDescription}</span>
                        <span>{new Date(order.updatedAt).toLocaleDateString('he-IL')}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case 'analytics':
        const viewingOrders = orders.filter(o => o.isViewing);
        const completedOrders = orders.filter(o => o.status === 'completed');
        const pendingOrders = orders.filter(o => o.status === 'pending');
        
        return (
          <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">אנליטיקס</h2>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="glass-card p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground">סה"כ הזמנות</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{orders.length}</p>
              </div>
              
              <div className="glass-card p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-success" />
                  </div>
                  <span className="text-muted-foreground">הושלמו</span>
                </div>
                <p className="text-3xl font-bold text-success">{completedOrders.length}</p>
              </div>
              
              <div className="glass-card p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <span className="text-muted-foreground">ממתינות</span>
                </div>
                <p className="text-3xl font-bold text-warning">{pendingOrders.length}</p>
              </div>
            </div>

            {/* Live viewing */}
            <div className="glass-card p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                <h3 className="font-bold text-foreground">צופים כרגע בעמוד המעקב</h3>
                <span className="bg-success/10 text-success text-sm px-2 py-0.5 rounded-full">
                  {viewingOrders.length} לקוחות
                </span>
              </div>
              
              {viewingOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">אין לקוחות שצופים כרגע</p>
              ) : (
                <div className="space-y-3">
                  {viewingOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Eye className="w-4 h-4 text-success" />
                        <div>
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.deviceType}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={cn("status-badge text-xs", getStatusColor(order.status))}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default: // orders
        return (
          <>
            {/* Orders list */}
            <div className="w-80 border-l border-border overflow-y-auto">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>אין הזמנות עדיין</p>
                  <p className="text-sm">לחצו על "הזמנה חדשה" להתחיל</p>
                </div>
              ) : (
                orders.map((order) => (
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
                ))
              )}
            </div>

            {/* Order details */}
            {selectedOrder ? (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Order header */}
                  <div className="glass-card rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={cn("status-badge", getStatusColor(selectedOrder.status))}>
                          {statusLabels[selectedOrder.status]}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyTrackingLink(selectedOrder.customerPhone)}
                          className="gap-1"
                        >
                          <Copy className="w-4 h-4" />
                          העתק קישור
                        </Button>
                      </div>
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

                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteOrder(selectedOrder.id)}
                        className="gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        מחק הזמנה
                      </Button>
                      <a 
                        href={`/track?phone=${selectedOrder.customerPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        צפה כלקוח
                      </a>
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
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-l border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
              <span className="font-bold text-sidebar-foreground">דיירקט פיקס</span>
            </div>
            <button
              onClick={handleManualRefresh}
              className="w-8 h-8 flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
              title="רענן נתונים"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              activeTab === 'orders' 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Smartphone className="w-5 h-5" />
            <span>הזמנות</span>
            {orders.length > 0 && (
              <span className="mr-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {orders.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              activeTab === 'customers' 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Users className="w-5 h-5" />
            <span>לקוחות</span>
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative",
              activeTab === 'messages' 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            <span>הודעות</span>
            {unreadCount > 0 && (
              <span className="mr-auto bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount} חדשות
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              activeTab === 'settings' 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Settings className="w-5 h-5" />
            <span>הגדרות</span>
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              activeTab === 'feedback' 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Star className="w-5 h-5" />
            <span>משוב לקוחות</span>
            {orders.filter(o => o.rating).length > 0 && (
              <span className="mr-auto bg-warning/20 text-warning text-xs px-2 py-0.5 rounded-full">
                {orders.filter(o => o.rating).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              activeTab === 'analytics' 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Activity className="w-5 h-5" />
            <span>אנליטיקס</span>
            {orders.filter(o => o.isViewing).length > 0 && (
              <span className="mr-auto bg-success/20 text-success text-xs px-2 py-0.5 rounded-full animate-pulse">
                {orders.filter(o => o.isViewing).length} צופים
              </span>
            )}
          </button>
        </nav>

        {/* Back to home link */}
        <div className="p-4 border-t border-sidebar-border">
          <a 
            href="/"
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground text-sm flex items-center gap-2"
          >
            ← חזרה לדף הבית
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {activeTab === 'orders' && 'ניהול הזמנות'}
              {activeTab === 'customers' && 'לקוחות'}
              {activeTab === 'messages' && 'הודעות'}
              {activeTab === 'settings' && 'הגדרות'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'orders' && `${orders.length} הזמנות`}
              {activeTab === 'messages' && `${messages.length} הודעות`}
            </p>
          </div>
          
          {activeTab === 'orders' && (
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
                  <DialogDescription>מלאו את פרטי ההזמנה</DialogDescription>
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
          )}
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
