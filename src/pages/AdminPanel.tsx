import { useState, useEffect, useCallback } from 'react';
import { useRepairStore } from '@/store/repairStore';
import { RepairOrder, RepairStatus, statusLabels } from '@/types/repair';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  Lock,
  FileText,
  Edit,
  PlusCircle,
  ChevronDown,
  MessageCircle,
  Download,
  Search,
  Phone,
  MapPin,
  ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';
import PushNotificationToggle from '@/components/PushNotificationToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import SwipeableOrderCard from '@/components/SwipeableOrderCard';
import AdminLiveChat from '@/components/AdminLiveChat';
import PullToRefresh from '@/components/PullToRefresh';
import { useIsMobile } from '@/hooks/use-mobile';

const ADMIN_CODE = 'pp1p1xke';

const AdminPanel = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [eta, setEta] = useState('');
  const [wazeLink, setWazeLink] = useState('');
  const [invoiceLink, setInvoiceLink] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState({
    customerPhone: '',
    customerName: '',
    customerAddress: '',
    deviceType: '',
    issueDescription: '',
    repairPrice: 0,
    technicianName: '',
  });
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationInput, setConversationInput] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSortBy, setCustomerSortBy] = useState<'name' | 'orders' | 'recent'>('recent');

  const { 
    orders, 
    messages, 
    activeTab,
    setActiveTab,
    addOrder, 
    updateOrderStatus, 
    updateEstimatedArrival,
    updateWazeLink,
    updateInvoiceLink,
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
          <h1 className="text-2xl font-bold text-foreground mb-2">פאנל ניהול</h1>
          <p className="text-muted-foreground mb-6">הכנס קוד גישה להמשך</p>
          
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
    // No mandatory fields - create order with whatever data is provided
    addOrder({
      ...newOrder,
      customerPhone: newOrder.customerPhone || 'לא צוין',
      customerName: newOrder.customerName || 'לקוח חדש',
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
      description: newOrder.customerName ? `הזמנה עבור ${newOrder.customerName} נוצרה` : 'הזמנה חדשה נוצרה',
    });
  };

  const handleSendMessage = (message?: string) => {
    const msgToSend = message || newMessage.trim();
    if (selectedOrder && msgToSend) {
      addSupportMessage(selectedOrder.id, msgToSend);
      if (!message) setNewMessage('');
      toast({
        title: "הודעה נשלחה",
      });
    }
  };

  const handleExitAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('האם אתה בטוח שברצונך לצאת מפאנל הניהול?')) {
      window.location.href = '/';
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
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete);
      setSelectedOrder(null);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      toast({
        title: "הזמנה נמחקה",
        variant: "destructive",
      });
    }
  };

  const copyTrackingLink = (phone: string) => {
    const link = `${window.location.origin}/track?phone=${phone}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "הקישור הועתק!",
      description: "ניתן לשלוח ללקוח",
    });
  };

  const sendWhatsAppManually = (order: RepairOrder) => {
    const trackingUrl = `${window.location.origin}/track?phone=${encodeURIComponent(order.customerPhone)}`;
    
    // Format phone number for WhatsApp (remove leading 0, add 972)
    let phone = order.customerPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '972' + phone.substring(1);
    } else if (!phone.startsWith('972')) {
      phone = '972' + phone;
    }
    
    const message = `שלום ${order.customerName}! 👋

הזמנתך התקבלה בהצלחה ✅

🔗 עקבו בזמן אמת אחרי הטכנאי:
${trackingUrl}

תודה שבחרתם בנו! 🙏`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "וואטסאפ נפתח",
      description: "שלח את ההודעה ללקוח",
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
        // Group messages by order for WhatsApp-style conversations
        const messagesByOrder = sortedMessages.reduce((acc, msg) => {
          if (!acc[msg.orderId]) {
            acc[msg.orderId] = [];
          }
          acc[msg.orderId].push(msg);
          return acc;
        }, {} as Record<string, typeof sortedMessages>);

        // Get unique conversations with last message
        const conversations = Object.entries(messagesByOrder).map(([orderId, msgs]) => {
          const order = orders.find(o => o.id === orderId);
          const lastMsg = msgs[msgs.length - 1];
          const unreadCount = msgs.filter(m => !m.read && m.sender === 'customer').length;
          return { orderId, order, msgs, lastMsg, unreadCount };
        }).sort((a, b) => {
          // Unread first, then by last message time
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
          return new Date(b.lastMsg.timestamp).getTime() - new Date(a.lastMsg.timestamp).getTime();
        });

        // If a conversation is selected, show chat view
        if (selectedConversation) {
          const conv = conversations.find(c => c.orderId === selectedConversation);
          if (conv) {
            return (
              <div className="flex-1 flex flex-col h-full">
                {/* Chat header */}
                <div className="bg-primary p-4 flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedConversation(null)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-primary-foreground/10 rounded-full transition-colors"
                  >
                    <span className="text-primary-foreground text-lg">→</span>
                  </button>
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">
                      {conv.order?.customerName?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary-foreground">{conv.order?.customerName || 'לקוח'}</h4>
                    <p className="text-xs text-primary-foreground/70">{conv.order?.deviceType}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                  {conv.msgs.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        msg.sender === 'support' ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {msg.sender === 'customer' && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-muted-foreground font-bold text-sm">
                            {conv.order?.customerName?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] px-4 py-2 rounded-2xl",
                          msg.sender === 'support' 
                            ? "bg-primary text-primary-foreground rounded-br-md" 
                            : "bg-muted text-foreground rounded-bl-md"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          msg.sender === 'support' ? "text-primary-foreground/60" : "text-muted-foreground"
                        )}>
                          {new Date(msg.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex gap-2">
                    <Input
                      value={conversationInput}
                      onChange={(e) => setConversationInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && conversationInput.trim()) {
                          addSupportMessage(selectedConversation, conversationInput.trim());
                          setConversationInput('');
                        }
                      }}
                      placeholder="כתבו הודעה..."
                      className="flex-1 rounded-full"
                    />
                    <Button 
                      onClick={() => {
                        if (conversationInput.trim()) {
                          addSupportMessage(selectedConversation, conversationInput.trim());
                          setConversationInput('');
                        }
                      }}
                      size="icon"
                      className="rounded-full w-10 h-10"
                      disabled={!conversationInput.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          }
        }

        return (
          <div className="flex-1 pb-24 md:pb-6 overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">שיחות</h2>
              {unreadCount > 0 && (
                <span className="bg-warning text-warning-foreground text-sm px-3 py-1.5 rounded-full">
                  {unreadCount} חדשות
                </span>
              )}
            </div>
            <div className="divide-y divide-border">
              {conversations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-lg">אין שיחות עדיין</p>
              ) : (
                conversations.map((conv) => (
                  <div 
                    key={conv.orderId} 
                    className={cn(
                      "p-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-3",
                      conv.unreadCount > 0 && "bg-warning/5"
                    )}
                    onClick={() => setSelectedConversation(conv.orderId)}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-lg">
                          {conv.order?.customerName?.charAt(0) || '?'}
                        </span>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                          <span className="text-[10px] text-warning-foreground font-bold">{conv.unreadCount}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{conv.order?.customerName || 'לקוח'}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.lastMsg.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMsg.sender === 'support' && <span className="text-primary">את/ה: </span>}
                        {conv.lastMsg.message}
                      </p>
                      <p className="text-xs text-muted-foreground">{conv.order?.deviceType}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'customers':
        // Build unique customers with more data
        const uniqueCustomers = orders.reduce((acc, order) => {
          const existing = acc.find(c => c.phone === order.customerPhone);
          if (existing) {
            existing.ordersCount++;
            if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
              existing.lastOrderDate = order.createdAt;
            }
            existing.totalSpent += order.repairPrice;
          } else {
            acc.push({
              phone: order.customerPhone,
              name: order.customerName,
              address: order.customerAddress,
              ordersCount: 1,
              lastOrderDate: order.createdAt,
              totalSpent: order.repairPrice,
            });
          }
          return acc;
        }, [] as { phone: string; name: string; address: string; ordersCount: number; lastOrderDate: Date; totalSpent: number }[]);

        // Filter customers
        const filteredCustomers = uniqueCustomers.filter(customer => 
          customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          customer.phone.includes(customerSearch) ||
          customer.address.toLowerCase().includes(customerSearch.toLowerCase())
        );

        // Sort customers
        const sortedCustomers = [...filteredCustomers].sort((a, b) => {
          switch (customerSortBy) {
            case 'name':
              return a.name.localeCompare(b.name, 'he');
            case 'orders':
              return b.ordersCount - a.ordersCount;
            case 'recent':
            default:
              return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
          }
        });

        // Export function
        const exportCustomers = () => {
          const csvContent = [
            ['שם לקוח', 'טלפון', 'כתובת', 'מספר הזמנות', 'סה"כ הוצאות', 'הזמנה אחרונה'].join(','),
            ...sortedCustomers.map(c => [
              `"${c.name}"`,
              c.phone,
              `"${c.address}"`,
              c.ordersCount,
              c.totalSpent,
              new Date(c.lastOrderDate).toLocaleDateString('he-IL')
            ].join(','))
          ].join('\n');
          
          const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
          link.click();
          
          toast({
            title: "הקובץ הורד בהצלחה",
            description: `${sortedCustomers.length} לקוחות יוצאו לקובץ CSV`,
          });
        };

        return (
          <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">לקוחות</h2>
                <p className="text-muted-foreground text-sm">{uniqueCustomers.length} לקוחות רשומים</p>
              </div>
              <Button onClick={exportCustomers} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                ייצוא לקוחות
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="glass-card p-4 rounded-xl mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש לפי שם, טלפון או כתובת..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" />
                  מיון:
                </span>
                <Button
                  variant={customerSortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCustomerSortBy('recent')}
                >
                  לפי תאריך
                </Button>
                <Button
                  variant={customerSortBy === 'orders' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCustomerSortBy('orders')}
                >
                  לפי הזמנות
                </Button>
                <Button
                  variant={customerSortBy === 'name' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCustomerSortBy('name')}
                >
                  לפי שם
                </Button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="glass-card p-3 rounded-xl text-center">
                <p className="text-2xl font-bold text-primary">{uniqueCustomers.length}</p>
                <p className="text-xs text-muted-foreground">סה"כ לקוחות</p>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <p className="text-2xl font-bold text-success">
                  {uniqueCustomers.filter(c => c.ordersCount > 1).length}
                </p>
                <p className="text-xs text-muted-foreground">לקוחות חוזרים</p>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <p className="text-2xl font-bold text-accent">
                  {(uniqueCustomers.reduce((sum, c) => sum + c.ordersCount, 0) / uniqueCustomers.length || 0).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">ממוצע הזמנות</p>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <p className="text-2xl font-bold text-warning">
                  ₪{uniqueCustomers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">סה"כ הכנסות</p>
              </div>
            </div>

            {/* Customers List */}
            {sortedCustomers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{customerSearch ? 'לא נמצאו לקוחות התואמים לחיפוש' : 'אין לקוחות עדיין'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedCustomers.map((customer) => (
                  <div key={customer.phone} className="glass-card p-4 rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-lg">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-lg">{customer.name}</p>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                            <Phone className="w-3 h-3" />
                            <span dir="ltr">{customer.phone}</span>
                          </div>
                          {customer.address && (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{customer.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">{customer.ordersCount}</p>
                          <p className="text-xs text-muted-foreground">הזמנות</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-success">₪{customer.totalSpent}</p>
                          <p className="text-xs text-muted-foreground">סה"כ</p>
                        </div>
                        <div className="text-center hidden sm:block">
                          <p className="text-sm font-medium text-foreground">
                            {new Date(customer.lastOrderDate).toLocaleDateString('he-IL')}
                          </p>
                          <p className="text-xs text-muted-foreground">אחרון</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 space-y-4 md:space-y-6 overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold">הגדרות</h2>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Push Notifications */}
            <PushNotificationToggle />
            
            {/* Other settings */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-bold text-foreground mb-3 text-lg">הגדרות נוספות</h3>
              <ul className="space-y-2 text-muted-foreground">
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
          <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold">משוב לקוחות</h2>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-warning/10 text-warning px-4 py-2 rounded-xl flex items-center gap-2">
                  <Star className="w-5 h-5 md:w-6 md:h-6 fill-warning" />
                  <span className="font-bold text-lg md:text-xl">{avgRating}</span>
                  <span className="text-sm">ממוצע</span>
                </div>
                <span className="text-muted-foreground">
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
                          <p className="font-bold text-foreground text-lg">{order.customerName}</p>
                          <p className="text-muted-foreground">{order.customerPhone}</p>
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
                          <p className="text-foreground">"{order.feedback}"</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
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
          <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">אנליטיקס</h2>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="glass-card p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-base">סה"כ הזמנות</span>
                </div>
                <p className="text-4xl font-bold text-foreground">{orders.length}</p>
              </div>
              
              <div className="glass-card p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-success" />
                  </div>
                  <span className="text-muted-foreground text-base">הושלמו</span>
                </div>
                <p className="text-4xl font-bold text-success">{completedOrders.length}</p>
              </div>
              
              <div className="glass-card p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <span className="text-muted-foreground text-base">ממתינות</span>
                </div>
                <p className="text-4xl font-bold text-warning">{pendingOrders.length}</p>
              </div>
            </div>

            {/* Live viewing */}
            <div className="glass-card p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                <h3 className="font-bold text-foreground text-lg">צופים כרגע בעמוד המעקב</h3>
                <span className="bg-success/10 text-success px-3 py-1 rounded-full">
                  {viewingOrders.length} לקוחות
                </span>
              </div>
              
              {viewingOrders.length === 0 ? (
                <p className="text-muted-foreground">אין לקוחות שצופים כרגע</p>
              ) : (
                <div className="space-y-3">
                  {viewingOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-success" />
                        <div>
                          <p className="font-medium text-foreground text-base">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.deviceType}</p>
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
        const ordersList = (
          <>
            {orders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>אין הזמנות עדיין</p>
                <p className="text-sm">לחצו על "הזמנה חדשה" להתחיל</p>
              </div>
            ) : (
              orders.map((order) => (
                <SwipeableOrderCard
                  key={order.id}
                  order={order}
                  isSelected={selectedOrder?.id === order.id}
                  onClick={() => setSelectedOrder(order)}
                  onDelete={() => handleDeleteOrder(order.id)}
                  getStatusColor={getStatusColor}
                />
              ))
            )}
          </>
        );

        return (
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Orders list - show on mobile when no order selected, always show on desktop */}
            <div className={cn(
              "md:w-80 border-l border-border",
              selectedOrder ? "hidden md:block md:overflow-y-auto" : "flex-1 md:flex-none"
            )}>
              {isMobile && !selectedOrder ? (
                <PullToRefresh onRefresh={handleManualRefresh}>
                  {ordersList}
                </PullToRefresh>
              ) : (
                <div className="overflow-y-auto h-full">
                  {ordersList}
                </div>
              )}
            </div>

            {/* Order details */}
            {selectedOrder ? (
              <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
                {/* Mobile back button */}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="md:hidden flex items-center gap-2 text-muted-foreground mb-4 hover:text-foreground"
                >
                  ← חזרה לרשימה
                </button>
                
                <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
                  {/* Order header */}
                  <div className="glass-card rounded-xl p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2 order-2 md:order-1 flex-wrap">
                        <span className={cn("status-badge text-sm", getStatusColor(selectedOrder.status))}>
                          {statusLabels[selectedOrder.status]}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyTrackingLink(selectedOrder.customerPhone)}
                          className="gap-1"
                        >
                          <Copy className="w-4 h-4" />
                          <span className="hidden sm:inline">העתק קישור</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendWhatsAppManually(selectedOrder)}
                          className="gap-1 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">שלח וואטסאפ</span>
                        </Button>
                      </div>
                      <div className="text-right order-1 md:order-2 md:text-left">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">{selectedOrder.customerName}</h2>
                        <p className="text-muted-foreground">{selectedOrder.customerPhone}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">מכשיר</p>
                        <p className="font-medium text-foreground text-base">{selectedOrder.deviceType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">תקלה</p>
                        <p className="font-medium text-foreground text-base">{selectedOrder.issueDescription}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">כתובת</p>
                        <p className="font-medium text-foreground text-base">{selectedOrder.customerAddress}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">מחיר תיקון</p>
                        <p className="font-medium text-foreground text-base">₪{selectedOrder.repairPrice}</p>
                      </div>
                    </div>

                    {/* Selected accessories */}
                    {selectedOrder.accessories.some(acc => acc.selected) && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-muted-foreground text-sm mb-2">אביזרים שנבחרו:</p>
                        <div className="space-y-2">
                          {selectedOrder.accessories.filter(acc => acc.selected).map((acc) => (
                            <div key={acc.id} className="flex items-center justify-between bg-success/10 text-success px-3 py-2 rounded-lg">
                              <span className="font-medium">{acc.name}</span>
                              <span className="font-bold">₪{acc.price}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="font-bold text-foreground">סה"כ לתשלום:</span>
                            <span className="font-bold text-lg text-primary">
                              ₪{selectedOrder.repairPrice + selectedOrder.accessories.filter(acc => acc.selected).reduce((sum, acc) => sum + acc.price, 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteOrder(selectedOrder.id)}
                        className="gap-1 w-full sm:w-auto"
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
                    <h3 className="font-semibold text-foreground mb-4 text-lg">עדכון סטטוס</h3>
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
                    <h3 className="font-semibold text-foreground mb-4 text-lg">זמן הגעה משוער</h3>
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

                  {/* Waze link */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4 text-lg">קישור וויז</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      הדבק את הטקסט המלא מהשיתוף של וויז - המערכת תחלץ את הקישור
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="הדבק כאן את השיתוף מוויז..."
                        value={wazeLink}
                        onChange={(e) => setWazeLink(e.target.value)}
                        className="flex-1"
                        dir="ltr"
                      />
                      <Button onClick={() => {
                        if (selectedOrder && wazeLink) {
                          // Extract just the URL from the pasted text
                          const urlMatch = wazeLink.match(/https:\/\/waze\.com\/ul[^\s]*/);
                          const extractedUrl = urlMatch ? urlMatch[0] : wazeLink;
                          
                          if (extractedUrl.includes('waze.com')) {
                            updateWazeLink(selectedOrder.id, extractedUrl);
                            toast({ title: "קישור וויז עודכן" });
                            setWazeLink('');
                          } else {
                            toast({ title: "שגיאה", description: "לא נמצא קישור וויז תקין", variant: "destructive" });
                          }
                        }
                      }}>
                        שמור
                      </Button>
                    </div>
                    {selectedOrder.wazeLink && (
                      <div className="mt-3 p-2 bg-success/10 rounded-lg">
                        <p className="text-sm text-success font-medium">✓ קישור וויז פעיל</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate" dir="ltr">
                          {selectedOrder.wazeLink}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Invoice link */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4 text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      קישור לחשבונית
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="הכנס קישור לחשבונית..."
                        value={invoiceLink}
                        onChange={(e) => setInvoiceLink(e.target.value)}
                        className="flex-1"
                        dir="ltr"
                      />
                      <Button onClick={() => {
                        if (selectedOrder && invoiceLink) {
                          updateInvoiceLink(selectedOrder.id, invoiceLink);
                          toast({ title: "קישור חשבונית עודכן" });
                          setInvoiceLink('');
                        }
                      }}>
                        שמור
                      </Button>
                    </div>
                    {selectedOrder.invoiceLink && (
                      <div className="mt-3 p-2 bg-success/10 rounded-lg">
                        <p className="text-sm text-success font-medium">✓ חשבונית זמינה ללקוח</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate" dir="ltr">
                          {selectedOrder.invoiceLink}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Add note */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4 text-lg">הוספת הערה</h3>
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
                          <p key={i} className="text-muted-foreground bg-muted/50 p-3 rounded">
                            {note}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>בחרו הזמנה מהרשימה</p>
                </div>
              </div>
            )}

            {/* Floating chat for selected order */}
            {selectedOrder && (
              <AdminLiveChat
                messages={orderMessages}
                onSendMessage={handleSendMessage}
                customerName={selectedOrder.customerName}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50 px-2 py-2 safe-area-pb">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
              activeTab === 'orders' 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground"
            )}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-[10px]">הזמנות</span>
            {orders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors relative min-w-[60px]",
              activeTab === 'messages' 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px]">הודעות</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-2 bg-warning text-warning-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
              activeTab === 'analytics' 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground"
            )}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px]">אנליטיקס</span>
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
              activeTab === 'feedback' 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground"
            )}
          >
            <Star className="w-5 h-5" />
            <span className="text-[10px]">משוב</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
              activeTab === 'settings' 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground"
            )}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">הגדרות</span>
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-sidebar border-l border-sidebar-border flex-col">
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
          <button 
            onClick={handleExitAdmin}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground text-sm flex items-center gap-2 w-full"
          >
            ← חזרה לדף הבית
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              {activeTab === 'orders' && 'ניהול הזמנות'}
              {activeTab === 'customers' && 'לקוחות'}
              {activeTab === 'messages' && 'הודעות'}
              {activeTab === 'settings' && 'הגדרות'}
              {activeTab === 'feedback' && 'משוב לקוחות'}
              {activeTab === 'analytics' && 'אנליטיקס'}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {activeTab === 'orders' && `${orders.length} הזמנות`}
              {activeTab === 'messages' && `${messages.length} הודעות`}
            </p>
          </div>
          
          {activeTab === 'orders' && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2" size="sm">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">ניהול הזמנות</span>
                    <span className="sm:hidden">הזמנות</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
                  <DropdownMenuItem 
                    onClick={() => {
                      setIsEditMode(false);
                      setEditingOrderId(null);
                      setNewOrder({
                        customerPhone: '',
                        customerName: '',
                        customerAddress: '',
                        deviceType: '',
                        issueDescription: '',
                        repairPrice: 0,
                        technicianName: '',
                      });
                      setIsNewOrderOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 ml-2" />
                    יצירת הזמנה חדשה
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      if (orders.length === 0) {
                        toast({ title: "אין הזמנות לעריכה", variant: "destructive" });
                        return;
                      }
                      setIsEditMode(true);
                      setIsNewOrderOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    עריכת הזמנה קיימת
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? 'עריכת הזמנה' : 'יצירת הזמנה חדשה'}</DialogTitle>
                    <DialogDescription>
                      {isEditMode ? 'בחרו הזמנה לעריכה ועדכנו את הפרטים' : 'מלאו את פרטי ההזמנה'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {isEditMode && !editingOrderId && (
                      <Select onValueChange={(value) => {
                        const order = orders.find(o => o.id === value);
                        if (order) {
                          setEditingOrderId(value);
                          setNewOrder({
                            customerPhone: order.customerPhone,
                            customerName: order.customerName,
                            customerAddress: order.customerAddress,
                            deviceType: order.deviceType,
                            issueDescription: order.issueDescription,
                            repairPrice: order.repairPrice,
                            technicianName: order.technicianName || '',
                          });
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="בחרו הזמנה לעריכה..." />
                        </SelectTrigger>
                        <SelectContent>
                          {orders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              {order.customerName} - {order.deviceType || 'ללא מכשיר'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {(!isEditMode || editingOrderId) && (
                      <>
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
                        <Button 
                          onClick={() => {
                            if (isEditMode && editingOrderId) {
                              // Update existing order - for now just show toast
                              // The user can edit through the order details panel
                              toast({ 
                                title: "לעדכון מלא של ההזמנה", 
                                description: "לחצו על ההזמנה ברשימה לעריכה מפורטת" 
                              });
                              setIsNewOrderOpen(false);
                              const order = orders.find(o => o.id === editingOrderId);
                              if (order) setSelectedOrder(order);
                            } else {
                              handleCreateOrder();
                            }
                          }} 
                          className="w-full"
                        >
                          {isEditMode ? 'עבור לעריכה' : 'צור הזמנה'}
                        </Button>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק הזמנה זו?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו היא בלתי הפיכה. ההזמנה וכל המידע הקשור אליה יימחקו לצמיתות מהמערכת.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק הזמנה
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;
