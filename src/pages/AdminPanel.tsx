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
  ArrowUpDown,
  Gift,
  CreditCard,
  DollarSign,
  Package,
  Wrench,
  CalendarPlus,
  Sparkles,
  Image,
  Megaphone,
  Bell,
  Award,
  Crown,
  Shield
} from 'lucide-react';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';
import PushNotificationToggle from '@/components/PushNotificationToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import SwipeableOrderCard from '@/components/SwipeableOrderCard';
import AdminLiveChat from '@/components/AdminLiveChat';
import PullToRefresh from '@/components/PullToRefresh';
import PriceManagement from '@/components/admin/PriceManagement';
import VacationManagement from '@/components/admin/VacationManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import PromotionsManagement from '@/components/admin/PromotionsManagement';
import CouponManagement from '@/components/admin/CouponManagement';
import BundleManagement from '@/components/admin/BundleManagement';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LiveView from '@/components/admin/LiveView';
import AnnouncementsManagement from '@/components/admin/AnnouncementsManagement';
import RemindersManagement from '@/components/admin/RemindersManagement';
import LeadsManagement from '@/components/admin/LeadsManagement';
import ClubMembersManagement from '@/components/admin/ClubMembersManagement';
import CustomerProfileView from '@/components/admin/CustomerProfileView';
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
  const [paymentLink, setPaymentLink] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState({
    customerPhone: '',
    customerName: '',
    customerAddress: '',
    customerEmail: '',
    deviceType: '',
    issueDescription: '',
    repairPrice: 0,
    technicianName: '',
    scheduledDate: '',
    scheduledTime: '',
  });
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationInput, setConversationInput] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSortBy, setCustomerSortBy] = useState<'name' | 'orders' | 'recent'>('recent');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'active' | 'all'>('active');
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [settingsSubOpen, setSettingsSubOpen] = useState(false);
  const [completionEmailPreview, setCompletionEmailPreview] = useState<string | null>(null);
  const [showCompletionPreview, setShowCompletionPreview] = useState(false);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | null>(null);

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
    updatePaymentLink,
    updatePaymentStatus,
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

  // Scroll to top when switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);

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

  const handleCreateOrder = async () => {
    console.log('Creating order:', newOrder);
    const scheduledNote = newOrder.scheduledDate && newOrder.scheduledTime 
      ? `מועד מבוקש: ${newOrder.scheduledDate} בשעות ${newOrder.scheduledTime}` 
      : '';
    const notes = scheduledNote ? [scheduledNote] : [];
    
    const orderResult: any = await addOrder({
      ...newOrder,
      customerPhone: newOrder.customerPhone || 'לא צוין',
      customerName: newOrder.customerName || 'לקוח חדש',
      status: 'pending',
      accessories: [],
      notes,
      wantsPromotions: false,
      customerEmail: newOrder.customerEmail || undefined,
    } as any);
    
    // Send email notification (same as customer order)
    if (orderResult) {
      try {
        await supabase.functions.invoke('send-order-notifications', {
          body: {
            customerName: newOrder.customerName || 'לקוח חדש',
            customerPhone: newOrder.customerPhone || 'לא צוין',
            customerAddress: newOrder.customerAddress || '',
            deviceType: newOrder.deviceType || '',
            repairType: newOrder.issueDescription || 'לא צוין',
            repairPrice: newOrder.repairPrice || 0,
            scheduledTime: scheduledNote || 'לא נקבע',
            notes: '',
            customerEmail: newOrder.customerEmail || undefined,
            orderNumber: orderResult?.order_number || undefined,
            leadSource: 'הזמנה ידנית (אדמין)',
          }
        });
        console.log('Admin order notifications sent');
      } catch (notificationError) {
        console.error('Error sending admin order notifications:', notificationError);
      }
    }
    
    console.log('Order added, current orders:', orders.length + 1);
    setNewOrder({
      customerPhone: '',
      customerName: '',
      customerAddress: '',
      customerEmail: '',
      deviceType: '',
      issueDescription: '',
      repairPrice: 0,
      technicianName: '',
      scheduledDate: '',
      scheduledTime: '',
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


  const playCompletionSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      // Warm victory arpeggio with triangle waves
      const melody = [
        { freq: 523.25, time: 0, dur: 0.35 },     // C5
        { freq: 659.25, time: 0.12, dur: 0.35 },   // E5
        { freq: 783.99, time: 0.24, dur: 0.35 },   // G5
        { freq: 1046.50, time: 0.4, dur: 0.6 },    // C6 (held longer)
        { freq: 1318.51, time: 0.55, dur: 0.5 },   // E6 sparkle
      ];
      
      melody.forEach(({ freq, time, dur }) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.18, now + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
        osc.start(now + time);
        osc.stop(now + time + dur);
      });

      // Soft shimmer pad
      const pad = audioCtx.createOscillator();
      const padGain = audioCtx.createGain();
      pad.connect(padGain);
      padGain.connect(audioCtx.destination);
      pad.frequency.value = 783.99;
      pad.type = 'sine';
      padGain.gain.setValueAtTime(0, now + 0.3);
      padGain.gain.linearRampToValueAtTime(0.08, now + 0.5);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      pad.start(now + 0.3);
      pad.stop(now + 1.2);
    } catch (e) { console.log('Audio not supported'); }
  };

  const handleUpdateStatus = (status: RepairStatus) => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, status, statusNote || undefined);
      setStatusNote('');
      
      if (status === 'completed') {
        setShowCompletionCelebration(true);
        playCompletionSound();
        setTimeout(() => setShowCompletionCelebration(false), 3000);
      }
      
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

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleBulkDelete = () => {
    const count = selectedOrderIds.size;
    selectedOrderIds.forEach(id => deleteOrder(id));
    setSelectedOrderIds(new Set());
    setSelectedOrder(null);
    toast({ title: `${count} הזמנות נמחקו`, variant: "destructive" });
  };

  const handleBulkStatusChange = (status: RepairStatus) => {
    selectedOrderIds.forEach(id => updateOrderStatus(id, status));
    setSelectedOrderIds(new Set());
    setBulkStatusDialogOpen(false);
    toast({ title: `סטטוס עודכן` });
  };

  const copyTrackingLink = (phone: string) => {
    const link = `${window.location.origin}/track?phone=${phone}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "הקישור הועתק!",
      description: "ניתן לשלוח ללקוח",
    });
  };

  const getWhatsAppMessage = (order: RepairOrder, wazeEta?: string | null) => {
    const trackingUrl = `${window.location.origin}/track?phone=${encodeURIComponent(order.customerPhone)}`;
    
    switch (order.status) {
      case 'pending':
        return `שלום ${order.customerName}!\n\nהזמנתך התקבלה בהצלחה\n${order.deviceType}\n${order.issueDescription}\n\nעקבו בזמן אמת:\n${trackingUrl}\n\nתודה שבחרתם בנו!`;
      case 'confirmed':
        return `שלום ${order.customerName}!\n\nההזמנה שלך אושרה\n${order.deviceType} - ${order.issueDescription}\n\nניצור איתך קשר בקרוב לתיאום הגעה.\n\nמעקב: ${trackingUrl}`;
      case 'technician_assigned':
        return `שלום ${order.customerName}!\n\nטכנאי שובץ להזמנה שלך\n${order.technicianName ? `שם הטכנאי: ${order.technicianName}` : ''}\n${order.deviceType}\n\nמעקב בזמן אמת: ${trackingUrl}`;
      case 'on_the_way': {
        const etaText = wazeEta 
          ? `זמן הגעה משוער: ${wazeEta}` 
          : (order.estimatedArrival ? `זמן הגעה משוער: ${order.estimatedArrival}` : '');
        const wazeUrl = order.wazeLink ? order.wazeLink.match(/https:\/\/waze\.com\/ul[^\s]*/)?.[0] || order.wazeLink : '';
        return `שלום ${order.customerName}!\n\nהטכנאי בדרך אליך!\n${etaText}\n${order.deviceType} - ${order.issueDescription}\n\nעקבו בזמן אמת:\n${trackingUrl}${wazeUrl ? `\n\nמעקב מיקום בוויז:\n${wazeUrl}` : ''}`;
      }
      case 'arrived':
        return `שלום ${order.customerName}!\n\nהטכנאי הגיע!\nאנא פתחו את הדלת\n\n${order.deviceType} - ${order.issueDescription}`;
      case 'in_progress':
        return `שלום ${order.customerName}!\n\nהתיקון בעיצומו!\n${order.deviceType} - ${order.issueDescription}\n\nנעדכן אותך ברגע שנסיים`;
      case 'completed':
        return `שלום ${order.customerName}!\n\nהתיקון הושלם בהצלחה!\n${order.deviceType} - ${order.issueDescription}\nסה"כ: ${order.repairPrice} ש"ח\n\n${order.invoiceLink ? `חשבונית: ${order.invoiceLink}\n` : ''}תודה שבחרתם ב-DirectFix!\nנשמח לדירוג: ${trackingUrl}`;
      case 'cancelled':
        return `שלום ${order.customerName}!\n\nההזמנה שלך בוטלה.\n${order.deviceType} - ${order.issueDescription}\n\nאם ברצונך להזמין מחדש, נשמח לעזור!\n${window.location.origin}`;
      default:
        return `שלום ${order.customerName}!\n\nמעקב אחרי ההזמנה: ${trackingUrl}\n\nתודה שבחרתם בנו!`;
    }
  };

  const sendWhatsAppManually = async (order: RepairOrder) => {
    // Format phone number for WhatsApp (remove leading 0, add 972)
    let phone = order.customerPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '972' + phone.substring(1);
    } else if (!phone.startsWith('972')) {
      phone = '972' + phone;
    }
    
    let wazeEta: string | null = null;
    
    // Extract ETA directly from the Waze share text (e.g. "ואגיע בשעה 8:24")
    if (order.status === 'on_the_way' && order.wazeLink) {
      const etaMatch = order.wazeLink.match(/(?:אגיע בשעה|arrive at|ETA[:\s]*)\s*(\d{1,2}:\d{2})/i);
      if (etaMatch) {
        wazeEta = etaMatch[1];
        console.log('Extracted Waze ETA from text:', wazeEta);
      }
    }
    
    const message = getWhatsAppMessage(order, wazeEta);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "וואטסאפ נפתח",
      description: wazeEta ? `זמן הגעה מוויז: ${wazeEta}` : "שלח את ההודעה ללקוח",
    });
  };

  // Send completion email to customer

  const sendCompletionEmail = async (order: RepairOrder, previewOnly = false) => {
    if (!order.customerEmail) {
      toast({ title: "אין כתובת מייל", description: "לא ניתן לשלוח מייל ללקוח ללא כתובת מייל", variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('send-completion-email', {
        body: { orderId: order.id, preview: previewOnly }
      });
      if (error) throw error;
      if (previewOnly && data?.html) {
        setCompletionEmailPreview(data.html);
        setShowCompletionPreview(true);
      } else {
        toast({ title: "מייל נשלח!", description: `מייל סיום תיקון נשלח ל-${order.customerEmail}` });
      }
    } catch (e) {
      console.error("Error sending completion email:", e);
      toast({ title: "שגיאה", description: "לא ניתן לשלוח את המייל", variant: "destructive" });
    }
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
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard orders={orders} />;
      case 'leads':
        return <LeadsManagement />;
      case 'live':
        return <LiveView />;
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
            
            {/* Vacation Management */}
            <div className="glass-card p-4 md:p-6 rounded-xl">
              <h3 className="font-bold text-foreground mb-4 text-lg">ניהול ימי חופשה / חסימות</h3>
              <p className="text-muted-foreground text-sm mb-4">
                חסום תאריכים שבהם לא ניתן להזמין תיקונים (חופשות, חגים, ימים מלאים)
              </p>
              <VacationManagement />
            </div>
            
            {/* Other settings */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-bold text-foreground mb-3 text-lg">הגדרות נוספות</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• ניהול טכנאים</li>
                <li>• הגדרות הודעות SMS</li>
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

      case 'prices':
        return <PriceManagement />;

      case 'promotions':
        return <PromotionsManagement />;

      case 'coupons':
        return <CouponManagement />;

      case 'reminders':
        return <RemindersManagement />;

      case 'bundles':
        return <BundleManagement />;

      case 'announcements':
        return <AnnouncementsManagement />;
      case 'loyalty':
        return <ClubMembersManagement />;
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
        return <AnalyticsDashboard orders={orders} />;

      default: // orders
        const isSelectionMode = selectedOrderIds.size > 0;

        const filteredOrders = orderStatusFilter === 'active' 
          ? orders.filter(o => !['completed', 'cancelled'].includes(o.status))
          : orders;

        const ordersList = (
          <>
            {/* Filter toggle */}
            <div className="p-3 border-b border-border flex items-center gap-2">
              <Button 
                size="sm" 
                variant={orderStatusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setOrderStatusFilter('active')}
                className="text-xs rounded-full"
              >
                בתהליך ({orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length})
              </Button>
              <Button 
                size="sm" 
                variant={orderStatusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setOrderStatusFilter('all')}
                className="text-xs rounded-full"
              >
                הכל ({orders.length})
              </Button>
            </div>

            {/* Bulk actions bar */}
            {isSelectionMode && (
              <div className="sticky top-0 z-10 bg-primary/10 border-b border-primary/20 p-3 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-primary">{selectedOrderIds.size} נבחרו</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setBulkStatusDialogOpen(true)} className="text-xs">
                    שנה סטטוס
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="text-xs">
                    <Trash2 className="w-3 h-3 ml-1" />
                    מחק
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedOrderIds(new Set())} className="text-xs">
                    ביטול
                  </Button>
                </div>
              </div>
            )}
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{orderStatusFilter === 'active' ? 'אין הזמנות פעילות' : 'אין הזמנות עדיין'}</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="flex items-stretch">
                  <label 
                    className="flex items-center px-3 cursor-pointer hover:bg-muted/50"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedOrderIds.has(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="w-5 h-5 accent-primary rounded cursor-pointer"
                    />
                  </label>
                  <div className="flex-1">
                    <SwipeableOrderCard
                      order={order}
                      isSelected={selectedOrder?.id === order.id}
                      onClick={() => setSelectedOrder(order)}
                      onDelete={() => handleDeleteOrder(order.id)}
                      getStatusColor={getStatusColor}
                    />
                  </div>
                </div>
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
                          <span className="hidden sm:inline">וואטסאפ</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendCompletionEmail(selectedOrder)}
                          className="gap-1 text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                          disabled={!selectedOrder.customerEmail}
                          title={!selectedOrder.customerEmail ? 'אין כתובת מייל' : 'שלח מייל ללקוח'}
                        >
                          <Send className="w-4 h-4" />
                          <span className="hidden sm:inline">מייל</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => selectedOrder && sendCompletionEmail(selectedOrder, true)}
                          className="gap-1"
                          disabled={!selectedOrder?.customerEmail}
                          title="תצוגה מקדימה של מייל"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Extract scheduled date/time from notes
                            const scheduledNote = selectedOrder.notes.find(n => n.includes('מועד מבוקש:'));
                            let startDate = new Date();
                            let endDate = new Date();
                            
                            if (scheduledNote) {
                              // Parse "מועד מבוקש: 2025-01-15 בשעות 14:00-16:00"
                              const dateMatch = scheduledNote.match(/(\d{4}-\d{2}-\d{2})/);
                              const timeMatch = scheduledNote.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
                              const singleTimeMatch = scheduledNote.match(/(\d{2}:\d{2})/);
                              
                              if (dateMatch) {
                                const [year, month, day] = dateMatch[1].split('-');
                                if (timeMatch) {
                                  const [sH, sM] = timeMatch[1].split(':');
                                  const [eH, eM] = timeMatch[2].split(':');
                                  startDate = new Date(+year, +month - 1, +day, +sH, +sM);
                                  endDate = new Date(+year, +month - 1, +day, +eH, +eM);
                                } else if (singleTimeMatch) {
                                  const [h, m] = singleTimeMatch[1].split(':');
                                  startDate = new Date(+year, +month - 1, +day, +h, +m);
                                  endDate = new Date(+year, +month - 1, +day, +h + 1, +m);
                                } else {
                                  startDate = new Date(+year, +month - 1, +day, 10, 0);
                                  endDate = new Date(+year, +month - 1, +day, 12, 0);
                                }
                              }
                            }
                            
                            const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
                            const title = encodeURIComponent(`תיקון ${selectedOrder.deviceType} - ${selectedOrder.customerName}`);
                            const details = encodeURIComponent(`${selectedOrder.issueDescription}\nטלפון: ${selectedOrder.customerPhone}\nמחיר: ₪${selectedOrder.repairPrice}`);
                            const location = encodeURIComponent(selectedOrder.customerAddress || '');
                            const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(startDate)}/${fmt(endDate)}&details=${details}&location=${location}`;
                            window.open(calUrl, '_blank');
                          }}
                          className="gap-1"
                        >
                          <CalendarPlus className="w-4 h-4" />
                          <span className="hidden sm:inline">הוסף ליומן</span>
                        </Button>
                      </div>
                      <div className="text-right order-1 md:order-2 md:text-left">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">{selectedOrder.customerName}</h2>
                        <p className="text-muted-foreground">{selectedOrder.customerPhone}</p>
                        {selectedOrder.customerEmail && (
                          <p className="text-muted-foreground text-sm">{selectedOrder.customerEmail}</p>
                        )}
                        {selectedOrder.isClubMember ? (
                          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-2.5 py-0.5 text-xs font-bold mt-1">
                            <Crown className="w-3 h-3" />
                            חבר מועדון
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs mt-1">
                            לא חבר מועדון
                          </span>
                        )}
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
                      {selectedOrder.leadSource && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground text-sm">מקור הליד</p>
                          <p className="font-medium text-primary text-base">{selectedOrder.leadSource}</p>
                        </div>
                      )}
                    </div>

                    {/* Device images */}
                    {selectedOrder.deviceImages && selectedOrder.deviceImages.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                          <Image className="w-4 h-4" />
                          תמונות מכשיר ({selectedOrder.deviceImages.length})
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedOrder.deviceImages.map((img, idx) => (
                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block">
                              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors">
                                <img src={img} alt={`תמונה ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

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
                          // Check that it contains a valid Waze URL
                          const urlMatch = wazeLink.match(/https:\/\/waze\.com\/ul[^\s]*/);
                          
                          if (urlMatch) {
                            // Save the FULL text (includes ETA info like "ואגיע בשעה 8:24")
                            updateWazeLink(selectedOrder.id, wazeLink);
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
                    {selectedOrder.wazeLink && (() => {
                      const etaMatch = selectedOrder.wazeLink?.match(/(?:אגיע בשעה|arrive at)\s*(\d{1,2}:\d{2})/i);
                      const extractedEta = etaMatch ? etaMatch[1] : null;
                      return (
                        <div className="mt-3 p-2 bg-success/10 rounded-lg">
                          <p className="text-sm text-success font-medium">✓ קישור וויז פעיל</p>
                          {extractedEta && (
                            <p className="text-sm font-semibold text-foreground mt-1">הגעה משוערת: {extractedEta}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 truncate" dir="ltr">
                            {selectedOrder.wazeLink?.match(/https:\/\/waze\.com\/ul[^\s]*/)?.[0] || 'קישור פעיל'}
                          </p>
                        </div>
                      );
                    })()}
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
                      <div className="mt-3 space-y-2">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <p className="text-sm text-success font-medium">✓ חשבונית זמינה ללקוח</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate" dir="ltr">
                            {selectedOrder.invoiceLink}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setInvoiceLink(selectedOrder.invoiceLink || '');
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            ערוך
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              updateInvoiceLink(selectedOrder.id, '');
                              toast({ title: "קישור חשבונית הוסר" });
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            הסר
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Warranty extension */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4 text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      הארכת אחריות
                    </h3>
                    {selectedOrder.completedAt && (
                      <div className="mb-3 p-2 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                        <p>תאריך סיום תיקון: {new Date(selectedOrder.completedAt).toLocaleDateString('he-IL')}</p>
                        {selectedOrder.warrantyMonths ? (
                          <p className="text-success font-medium mt-1">
                            אחריות נוכחית: {selectedOrder.warrantyMonths} חודשים
                            (עד {(() => {
                              const d = new Date(selectedOrder.completedAt!);
                              d.setMonth(d.getMonth() + (selectedOrder.warrantyMonths || 0));
                              return d.toLocaleDateString('he-IL');
                            })()})
                          </p>
                        ) : (
                          <p className="text-muted-foreground mt-1">אחריות ברירת מחדל לפי סוג תיקון</p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <select
                        value={warrantyMonths}
                        onChange={(e) => setWarrantyMonths(e.target.value)}
                        className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">בחר תקופת אחריות</option>
                        <option value="3">3 חודשים</option>
                        <option value="6">6 חודשים</option>
                        <option value="12">12 חודשים (שנה)</option>
                        <option value="18">18 חודשים</option>
                        <option value="24">24 חודשים (שנתיים)</option>
                      </select>
                      <Button onClick={async () => {
                        if (selectedOrder && warrantyMonths) {
                          const months = Number(warrantyMonths);
                          const { error } = await supabase
                            .from('orders')
                            .update({ warranty_months: months })
                            .eq('id', selectedOrder.id);
                          if (error) {
                            toast({ title: "שגיאה בעדכון אחריות", variant: "destructive" });
                          } else {
                            toast({ title: `אחריות עודכנה ל-${months} חודשים` });
                            setWarrantyMonths('');
                            loadOrders();
                          }
                        }
                      }}>
                        עדכן
                      </Button>
                    </div>
                  </div>

                  {/* Payment link */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4 text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      קישור לתשלום
                    </h3>
                    
                    {/* Generate PayPlus link */}
                    <div className="space-y-3 mb-4">
                      <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-primary" />
                          יצירת לינק תשלום PayPlus
                        </p>
                        <div className="space-y-2">
                          <Input
                            type="number"
                            placeholder="סכום (₪)"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="h-9 text-sm"
                            dir="ltr"
                          />
                          <Input
                            placeholder="תיאור (למשל: תיקון מסך)"
                            value={paymentDescription}
                            onChange={(e) => setPaymentDescription(e.target.value)}
                            className="h-9 text-sm"
                          />
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={isGeneratingPayment || !paymentAmount}
                            onClick={async () => {
                              if (!selectedOrder || !paymentAmount) return;
                              setIsGeneratingPayment(true);
                              try {
                                const { data, error } = await supabase.functions.invoke('payplus-create-payment', {
                                  body: {
                                    amount: parseFloat(paymentAmount),
                                    description: paymentDescription || `תשלום הזמנה #${selectedOrder.orderNumber}`,
                                    customerName: selectedOrder.customerName,
                                    customerPhone: selectedOrder.customerPhone,
                                    orderId: selectedOrder.id,
                                  },
                                });
                                if (error) throw error;
                                if (data?.paymentLink) {
                                  updatePaymentLink(selectedOrder.id, data.paymentLink);
                                  toast({ title: "לינק תשלום נוצר!", description: `₪${paymentAmount} — הלינק נשמר בהזמנה` });
                                  setPaymentAmount('');
                                  setPaymentDescription('');
                                } else {
                                  throw new Error(data?.error || 'Failed to generate link');
                                }
                              } catch (err: any) {
                                toast({ title: "שגיאה ביצירת לינק", description: err.message, variant: "destructive" });
                              } finally {
                                setIsGeneratingPayment(false);
                              }
                            }}
                          >
                            {isGeneratingPayment ? (
                              <><RefreshCw className="w-4 h-4 animate-spin mr-1" /> יוצר לינק...</>
                            ) : (
                              <><CreditCard className="w-4 h-4 mr-1" /> צור לינק תשלום</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Manual link */}
                    <p className="text-xs text-muted-foreground mb-2">או הכנסת לינק ידני:</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="הכנס קישור לתשלום..."
                        value={paymentLink}
                        onChange={(e) => setPaymentLink(e.target.value)}
                        className="flex-1"
                        dir="ltr"
                      />
                      <Button onClick={() => {
                        if (selectedOrder && paymentLink) {
                          updatePaymentLink(selectedOrder.id, paymentLink);
                          toast({ title: "קישור תשלום עודכן", description: "הלקוח יראה התראה על תשלום ממתין" });
                          setPaymentLink('');
                        }
                      }}>
                        שמור
                      </Button>
                    </div>
                    {selectedOrder.paymentLink && (
                      <div className="mt-3 space-y-2">
                        <div className="p-2 bg-warning/10 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-sm text-warning font-medium flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
                              </span>
                              {selectedOrder.paymentStatus === 'paid' ? 'שולם ✓' : 'ממתין לתשלום'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 truncate" dir="ltr">
                              {selectedOrder.paymentLink}
                            </p>
                          </div>
                          {selectedOrder.paymentStatus !== 'paid' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                updatePaymentStatus(selectedOrder.id, 'paid');
                                toast({ title: "סומן כשולם" });
                              }}
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              סמן כשולם
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedOrder.paymentLink || '');
                              toast({ title: "הלינק הועתק!" });
                            }}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            העתק
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setPaymentLink(selectedOrder.paymentLink || '');
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            ערוך
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              updatePaymentLink(selectedOrder.id, '');
                              toast({ title: "קישור תשלום הוסר" });
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            הסר
                          </Button>
                        </div>
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
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Completion Celebration Overlay */}
      {showCompletionCelebration && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          style={{ animation: 'celebrationFadeIn 0.6s ease-out forwards' }}
        >
          <div 
            className="bg-card/95 backdrop-blur-sm border border-border rounded-3xl p-8 shadow-2xl text-center pointer-events-auto max-w-xs"
            style={{ animation: 'celebrationPopIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
          >
            <div className="text-6xl mb-4" style={{ animation: 'celebrationStar 1s ease-in-out infinite' }}>★</div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">כל הכבוד!</h2>
            <p className="text-muted-foreground font-medium">סיימת עוד תיקון בהצלחה!</p>
            <div className="mt-4 flex justify-center gap-2 text-2xl">
              <span style={{ animation: 'celebrationFloat 1.5s ease-in-out infinite', animationDelay: '0.1s' }}>★</span>
              <span style={{ animation: 'celebrationFloat 1.5s ease-in-out infinite', animationDelay: '0.3s' }}>✦</span>
              <span style={{ animation: 'celebrationFloat 1.5s ease-in-out infinite', animationDelay: '0.5s' }}>✧</span>
            </div>
          </div>
          <style>{`
            @keyframes celebrationFadeIn {
              from { opacity: 0; backdrop-filter: blur(0); }
              to { opacity: 1; backdrop-filter: blur(4px); }
            }
            @keyframes celebrationPopIn {
              0% { opacity: 0; transform: scale(0.3) translateY(30px); }
              50% { opacity: 1; }
              100% { transform: scale(1) translateY(0); }
            }
            @keyframes celebrationStar {
              0%, 100% { transform: scale(1) rotate(0deg); }
              50% { transform: scale(1.15) rotate(10deg); }
            }
            @keyframes celebrationFloat {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
          `}</style>
        </div>
      )}
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50 px-2 py-2 safe-area-pb">
        <div className="flex justify-around items-center">
          {/* Dashboard */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]",
              activeTab === 'dashboard' ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px]">דשבורד</span>
          </button>
          {/* Orders */}
          <button 
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px] relative",
              activeTab === 'orders' ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-[10px]">הזמנות</span>
            {orders.length > 0 && (
              <span className="absolute top-0 right-1 bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </button>
          {/* Reminders */}
          <button 
            onClick={() => setActiveTab('reminders')}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors relative min-w-[56px]",
              activeTab === 'reminders' ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px]">תזכורות</span>
          </button>
          {/* Loyalty */}
          <button 
            onClick={() => setActiveTab('loyalty')}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors relative min-w-[56px]",
              activeTab === 'loyalty' ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px]">מועדון</span>
          </button>
          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[56px]",
                    ['live', 'analytics', 'messages', 'feedback', 'promotions', 'prices', 'bundles', 'settings', 'announcements', 'coupons', 'leads'].includes(activeTab)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px]">עוד</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-48 bg-popover border border-border shadow-lg z-[60] mb-2">
              <DropdownMenuItem onClick={() => setActiveTab('leads')} className={cn("gap-3 py-3", activeTab === 'leads' && "text-primary font-medium")}>
                <Users className="w-4 h-4" />
                <span>לידים</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('live')} className={cn("gap-3 py-3", activeTab === 'live' && "text-success font-medium")}>
                <Eye className="w-4 h-4" />
                <span>לייב</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('analytics')} className={cn("gap-3 py-3", activeTab === 'analytics' && "text-primary font-medium")}>
                <Activity className="w-4 h-4" />
                <span>אנליטיקס</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('messages')} className={cn("gap-3 py-3", activeTab === 'messages' && "text-primary font-medium")}>
                <MessageSquare className="w-4 h-4" />
                <span>הודעות</span>
                {unreadCount > 0 && (
                  <span className="mr-auto bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('feedback')} className={cn("gap-3 py-3", activeTab === 'feedback' && "text-primary font-medium")}>
                <Star className="w-4 h-4" />
                <span>משוב</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('promotions')} className={cn("gap-3 py-3", activeTab === 'promotions' && "text-primary font-medium")}>
                <Gift className="w-4 h-4" />
                <span>מבצעים</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('prices')} className={cn("gap-3 py-3", activeTab === 'prices' && "text-primary font-medium")}>
                <DollarSign className="w-4 h-4" />
                <span>מחירון</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('bundles')} className={cn("gap-3 py-3", activeTab === 'bundles' && "text-primary font-medium")}>
                <Package className="w-4 h-4" />
                <span>חבילות</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('announcements')} className={cn("gap-3 py-3", activeTab === 'announcements' && "text-primary font-medium")}>
                <Megaphone className="w-4 h-4" />
                <span>הודעות והתראות</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('coupons')} className={cn("gap-3 py-3", activeTab === 'coupons' && "text-primary font-medium")}>
                <CreditCard className="w-4 h-4" />
                <span>קופונים</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('loyalty')} className={cn("gap-3 py-3", activeTab === 'loyalty' && "text-primary font-medium")}>
                <Crown className="w-4 h-4" />
                <span>חברי מועדון</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('settings')} className={cn("gap-3 py-3", activeTab === 'settings' && "text-primary font-medium")}>
                <Settings className="w-4 h-4" />
                <span>הגדרות</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden md:flex w-64 bg-sidebar border-l border-sidebar-border flex-col fixed right-0 top-0 h-screen z-40">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <Wrench className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-extrabold text-sidebar-foreground text-lg tracking-tight" style={{ fontFamily: "'Rubik', sans-serif" }}>
                direct<span className="text-sidebar-primary">fix</span>
              </span>
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

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Main tabs */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              activeTab === 'dashboard' 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Activity className="w-5 h-5" />
            <span>דשבורד</span>
          </button>
          <button 
            onClick={() => setActiveTab('live')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              activeTab === 'live' 
                ? "bg-success/10 text-success" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <div className="relative">
              <Eye className="w-5 h-5" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-pulse" />
            </div>
            <span>לייב</span>
          </button>
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
            onClick={() => setActiveTab('leads')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              activeTab === 'leads' 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Users className="w-5 h-5" />
            <span>לידים</span>
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
          </button>

          {/* Divider */}
          <div className="border-t border-sidebar-border my-3" />

          {/* Settings section */}
          <button 
            onClick={() => setSettingsSubOpen(!settingsSubOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              ['customers', 'messages', 'prices', 'feedback', 'promotions', 'coupons', 'bundles', 'settings', 'announcements', 'reminders', 'loyalty'].includes(activeTab)
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Settings className="w-5 h-5" />
            <span>הגדרות</span>
            <ChevronDown className={cn("w-4 h-4 mr-auto transition-transform", settingsSubOpen && "rotate-180")} />
            {unreadCount > 0 && (
              <span className="bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {settingsSubOpen && (
            <div className="pr-4 space-y-1">
              <button 
                onClick={() => setActiveTab('messages')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm",
                  activeTab === 'messages' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                <span>הודעות</span>
                {unreadCount > 0 && (
                  <span className="mr-auto bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('customers')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm",
                  activeTab === 'customers' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Users className="w-4 h-4" />
                <span>לקוחות</span>
              </button>
              <button 
                onClick={() => setActiveTab('prices')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm",
                  activeTab === 'prices' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <FileText className="w-4 h-4" />
                <span>ניהול מחירון</span>
              </button>
              <button 
                onClick={() => setActiveTab('feedback')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm",
                  activeTab === 'feedback' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Star className="w-4 h-4" />
                <span>משוב לקוחות</span>
              </button>
              <button 
                onClick={() => setActiveTab('promotions')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm",
                  activeTab === 'promotions' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Gift className="w-4 h-4" />
                <span>מבצעים</span>
              </button>
              <button 
                onClick={() => setActiveTab('coupons')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm",
                  activeTab === 'coupons' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <CreditCard className="w-4 h-4" />
                <span>קופונים</span>
              </button>
              <button 
                onClick={() => setActiveTab('bundles')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm",
                  activeTab === 'bundles' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Package className="w-4 h-4" />
                <span>חבילות תיקון</span>
              </button>
              <button 
                onClick={() => setActiveTab('announcements')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm",
                  activeTab === 'announcements' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Megaphone className="w-4 h-4" />
                <span>הודעות והתראות</span>
              </button>
              <button 
                onClick={() => setActiveTab('loyalty')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm",
                  activeTab === 'loyalty' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Crown className="w-4 h-4" />
                <span>חברי מועדון</span>
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm",
                  activeTab === 'settings' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Settings className="w-4 h-4" />
                <span>הגדרות כלליות</span>
              </button>
              <button 
                onClick={() => setActiveTab('reminders')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm",
                  activeTab === 'reminders' 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Bell className="w-4 h-4" />
                <span>תזכורות</span>
              </button>
            </div>
          )}
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

      {/* Main content - with margin for fixed sidebar */}
      <div className="flex-1 flex flex-col md:mr-64">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              {activeTab === 'dashboard' && 'דשבורד'}
              {activeTab === 'live' && 'לייב'}
              {activeTab === 'orders' && 'ניהול הזמנות'}
              {activeTab === 'customers' && 'לקוחות'}
              {activeTab === 'messages' && 'הודעות'}
              {activeTab === 'prices' && 'ניהול מחירון'}
              {activeTab === 'settings' && 'הגדרות'}
              {activeTab === 'feedback' && 'משוב לקוחות'}
              {activeTab === 'analytics' && 'אנליטיקס'}
              {activeTab === 'promotions' && 'ניהול מבצעים'}
              {activeTab === 'coupons' && 'ניהול קופונים'}
              {activeTab === 'bundles' && 'ניהול חבילות תיקון'}
              {activeTab === 'announcements' && 'הודעות והתראות'}
              {activeTab === 'reminders' && 'תזכורות ומשימות'}
              {activeTab === 'leads' && 'לידים'}
              {activeTab === 'loyalty' && 'נקודות נאמנות'}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {activeTab === 'orders' && `${orders.length} הזמנות`}
              {activeTab === 'messages' && `${messages.length} הודעות`}
            </p>
          </div>
          
          {activeTab === 'orders' && (
            <>
              <DropdownMenu modal={true}>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2" size="sm">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">ניהול הזמנות</span>
                    <span className="sm:hidden">+ חדש</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-[70]" sideOffset={5}>
                  <DropdownMenuItem 
                    onClick={() => {
                      setIsEditMode(false);
                      setEditingOrderId(null);
                      setNewOrder({
                        customerPhone: '',
                        customerName: '',
                        customerAddress: '',
                        customerEmail: '',
                        deviceType: '',
                        issueDescription: '',
                        repairPrice: 0,
                        technicianName: '',
                        scheduledDate: '',
                        scheduledTime: '',
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
                <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto mx-4 sm:mx-auto">
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
                            customerEmail: '',
                            deviceType: order.deviceType,
                            issueDescription: order.issueDescription,
                            repairPrice: order.repairPrice,
                            technicianName: order.technicianName || '',
                            scheduledDate: '',
                            scheduledTime: '',
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
                        <AddressAutocomplete
                          value={newOrder.customerAddress}
                          onChange={(val) => setNewOrder({ ...newOrder, customerAddress: val })}
                          placeholder="כתובת"
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
                        <Input
                          type="email"
                          placeholder="אימייל הלקוח (לשליחת אישור)"
                          value={newOrder.customerEmail}
                          onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })}
                          dir="ltr"
                        />
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">תאריך</label>
                          <Input
                            type="date"
                            value={newOrder.scheduledDate}
                            onChange={(e) => setNewOrder({ ...newOrder, scheduledDate: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">טווח שעות</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">משעה</label>
                              <Input
                                type="time"
                                value={newOrder.scheduledTime.split('-')[0] || ''}
                                onChange={(e) => {
                                  const endTime = newOrder.scheduledTime.split('-')[1] || '';
                                  setNewOrder({ ...newOrder, scheduledTime: `${e.target.value}${endTime ? '-' + endTime : ''}` });
                                }}
                                dir="ltr"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">עד שעה</label>
                              <Input
                                type="time"
                                value={newOrder.scheduledTime.split('-')[1] || ''}
                                onChange={(e) => {
                                  const startTime = newOrder.scheduledTime.split('-')[0] || '';
                                  setNewOrder({ ...newOrder, scheduledTime: `${startTime}-${e.target.value}` });
                                }}
                                dir="ltr"
                              />
                            </div>
                          </div>
                        </div>
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
      {/* Bulk Status Change Dialog */}
      <Dialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שנה סטטוס ל-{selectedOrderIds.size} הזמנות</DialogTitle>
            <DialogDescription>בחר את הסטטוס החדש</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(statusLabels).map(([value, label]) => (
              <Button
                key={value}
                variant="outline"
                className="justify-start"
                onClick={() => handleBulkStatusChange(value as RepairStatus)}
              >
                {label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Email Preview Dialog */}
      <Dialog open={showCompletionPreview} onOpenChange={setShowCompletionPreview}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>תצוגה מקדימה - מייל סיום תיקון</DialogTitle>
            <DialogDescription>כך ייראה המייל שיישלח ללקוח</DialogDescription>
          </DialogHeader>
          {completionEmailPreview && (
            <iframe
              srcDoc={completionEmailPreview}
              className="w-full border-0 rounded-b-2xl"
              style={{ height: '60vh' }}
              title="תצוגה מקדימה"
            />
          )}
          <div className="p-4 pt-0 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCompletionPreview(false)}>סגור</Button>
            {selectedOrder && (
              <Button onClick={() => { sendCompletionEmail(selectedOrder); setShowCompletionPreview(false); }}>
                <Send className="w-4 h-4 ml-2" /> שלח מייל
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
