import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { RepairOrder, ChatMessage, RepairStatus, Accessory, PaymentStatus } from '@/types/repair';

interface RepairStore {
  orders: RepairOrder[];
  messages: ChatMessage[];
  currentOrder: RepairOrder | null;
  activeTab: 'dashboard' | 'orders' | 'customers' | 'messages' | 'settings' | 'feedback' | 'analytics' | 'prices' | 'promotions' | 'coupons' | 'bundles' | 'live' | 'announcements' | 'reminders' | 'leads' | 'voice_leads' | 'loyalty' | 'ipad_prices';
  isLoading: boolean;
  
  // Tab actions
  setActiveTab: (tab: 'dashboard' | 'orders' | 'customers' | 'messages' | 'settings' | 'feedback' | 'analytics' | 'prices' | 'promotions' | 'coupons' | 'bundles' | 'live' | 'announcements' | 'reminders' | 'leads' | 'voice_leads' | 'loyalty' | 'ipad_prices') => void;
  
  // Data loading
  loadOrders: () => Promise<void>;
  loadMessages: () => Promise<void>;
  subscribeToRealtime: () => () => void;
  
  // Customer actions
  setCurrentOrder: (order: RepairOrder | null) => void;
  findOrderByPhone: (phone: string) => RepairOrder | undefined;
  findAllOrdersByPhone: (phone: string) => RepairOrder[];
  toggleAccessory: (orderId: string, accessoryId: string) => Promise<void>;
  setWantsPromotions: (orderId: string, wants: boolean) => Promise<void>;
  setRating: (orderId: string, rating: number, feedback?: string) => Promise<void>;
  addCustomerMessage: (orderId: string, message: string) => Promise<void>;
  setViewingStatus: (orderId: string, isViewing: boolean) => Promise<void>;
  
  // Admin actions
  addOrder: (order: Omit<RepairOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  updateOrderStatus: (orderId: string, status: RepairStatus, note?: string) => Promise<void>;
  updateEstimatedArrival: (orderId: string, eta: string) => Promise<void>;
  updateWazeLink: (orderId: string, wazeLink: string) => Promise<void>;
  updateInvoiceLink: (orderId: string, invoiceLink: string) => Promise<void>;
  updatePaymentLink: (orderId: string, paymentLink: string) => Promise<void>;
  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => Promise<void>;
  addNote: (orderId: string, note: string) => Promise<void>;
  addSupportMessage: (orderId: string, message: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

const defaultAccessories: Accessory[] = [
  { id: '1', name: 'מגן מסך רגיל', price: 50, originalPrice: 79, selected: false },
  { id: '2', name: 'מגן מסך פרימיום', price: 100, originalPrice: 149, selected: false },
  { id: '3', name: 'מטען מהיר + כבל', price: 70, originalPrice: 119, selected: false },
  { id: '4', name: 'כיסוי שקוף פרימיום', price: 50, originalPrice: 89, selected: false },
];

// Convert database row to RepairOrder
const dbToOrder = (row: any): RepairOrder => ({
  id: row.id,
  orderNumber: row.order_number,
  customerPhone: row.customer_phone,
  customerName: row.customer_name,
  customerEmail: row.customer_email || undefined,
  customerAddress: row.customer_address || '',
  deviceType: row.device_type || '',
  issueDescription: row.issue_description || '',
  status: row.status as RepairStatus,
  estimatedArrival: row.estimated_arrival,
  technicianName: row.technician_name,
  repairPrice: Number(row.repair_price) || 0,
  accessories: row.accessories || defaultAccessories,
  notes: row.notes || [],
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  wantsPromotions: row.wants_promotions || false,
  rating: row.rating,
  feedback: row.feedback,
  lastViewedAt: row.last_viewed_at ? new Date(row.last_viewed_at) : undefined,
  isViewing: row.is_viewing || false,
  wazeLink: row.waze_link,
  invoiceLink: row.invoice_link,
  paymentLink: row.payment_link,
  paymentStatus: row.payment_status as PaymentStatus || 'none',
  leadSource: row.lead_source || undefined,
  deviceImages: row.device_images || [],
  isClubMember: row.is_club_member || false,
  warrantyMonths: row.warranty_months || undefined,
});

// Convert database row to ChatMessage
const dbToMessage = (row: any): ChatMessage => ({
  id: row.id,
  orderId: row.order_id,
  sender: row.sender as 'customer' | 'support',
  senderName: row.sender_name,
  message: row.message,
  timestamp: new Date(row.timestamp),
  read: row.read,
});

export const useRepairStore = create<RepairStore>((set, get) => ({
  orders: [],
  messages: [],
  currentOrder: null,
  activeTab: 'dashboard',
  isLoading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  loadOrders: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading orders:', error);
    } else {
      const orders = (data || []).map(dbToOrder);
      set({ orders, isLoading: false });
      
      // Update currentOrder if it exists
      const currentOrder = get().currentOrder;
      if (currentOrder) {
        const updated = orders.find(o => o.id === currentOrder.id);
        if (updated) {
          set({ currentOrder: updated });
        }
      }
    }
  },

  loadMessages: async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error loading messages:', error);
    } else {
      set({ messages: (data || []).map(dbToMessage) });
    }
  },

  subscribeToRealtime: () => {
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          console.log('Orders changed, reloading...');
          get().loadOrders();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          console.log('Messages changed, reloading...');
          get().loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(messagesChannel);
    };
  },

  setCurrentOrder: (order) => set({ currentOrder: order }),
  
  findOrderByPhone: (phone) => {
    const normalizedPhone = phone.replace(/\D/g, '');
    return get().orders.find(o => o.customerPhone.replace(/\D/g, '') === normalizedPhone);
  },

  findAllOrdersByPhone: (phone) => {
    const normalizedPhone = phone.replace(/\D/g, '');
    return get().orders.filter(o => o.customerPhone.replace(/\D/g, '') === normalizedPhone);
  },

  toggleAccessory: async (orderId, accessoryId) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;

    const newAccessories = order.accessories.map(acc =>
      acc.id === accessoryId ? { ...acc, selected: !acc.selected } : acc
    );

    const { error } = await supabase
      .from('orders')
      .update({ accessories: newAccessories as unknown as any })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating accessories:', error);
    }
  },

  setWantsPromotions: async (orderId, wants) => {
    const { error } = await supabase
      .from('orders')
      .update({ wants_promotions: wants })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating promotions:', error);
    }
  },

  setRating: async (orderId, rating, feedback) => {
    const { error } = await supabase
      .from('orders')
      .update({ rating, feedback })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating rating:', error);
    }
  },

  setViewingStatus: async (orderId, isViewing) => {
    const { error } = await supabase
      .from('orders')
      .update({ 
        is_viewing: isViewing, 
        last_viewed_at: isViewing ? new Date().toISOString() : undefined 
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating viewing status:', error);
    }
  },

  addCustomerMessage: async (orderId, message) => {
    const order = get().orders.find(o => o.id === orderId);
    const { error } = await supabase
      .from('messages')
      .insert({
        order_id: orderId,
        sender: 'customer',
        sender_name: order?.customerName || 'לקוח',
        message,
        read: false,
      });

    if (error) {
      console.error('Error adding message:', error);
    } else {
      // Send push notification to admin
      try {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            title: `הודעה חדשה מ-${order?.customerName || 'לקוח'}`,
            body: message.substring(0, 100),
            url: '/admin',
          },
        });
      } catch (e) {
        console.error('Error sending push notification:', e);
      }

      // Send email notification (throttled server-side)
      try {
        await supabase.functions.invoke('notify-customer-message', {
          body: {
            orderId,
            customerName: order?.customerName || 'לקוח',
            message,
            orderNumber: order?.orderNumber,
          },
        });
      } catch (e) {
        console.error('Error sending email notification:', e);
      }
    }
  },

  addOrder: async (orderData) => {
    console.log('Adding order:', orderData);
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_phone: orderData.customerPhone,
        customer_name: orderData.customerName,
        customer_address: orderData.customerAddress,
        device_type: orderData.deviceType,
        issue_description: orderData.issueDescription,
        status: orderData.status,
        estimated_arrival: orderData.estimatedArrival,
        technician_name: orderData.technicianName,
        repair_price: orderData.repairPrice,
        accessories: defaultAccessories as unknown as any,
        notes: orderData.notes || [],
        wants_promotions: orderData.wantsPromotions,
        lead_source: (orderData as any).leadSource || null,
        customer_email: (orderData as any).customerEmail || null,
        device_images: (orderData as any).deviceImages || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding order:', error);
      return null;
    } else {
      console.log('Order added successfully:', data);
      return data;
    }
  },

  updateOrderStatus: async (orderId, status, note) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;

    const updates: any = { 
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : order.completedAt?.toISOString(),
    };

    if (note) {
      updates.notes = [...order.notes, `[${new Date().toLocaleTimeString('he-IL')}] ${note}`];
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      console.error('Error updating status:', error);
    }
  },

  updateEstimatedArrival: async (orderId, eta) => {
    const { error } = await supabase
      .from('orders')
      .update({ estimated_arrival: eta })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating ETA:', error);
    }
  },

  updateWazeLink: async (orderId, wazeLink) => {
    const { error } = await supabase
      .from('orders')
      .update({ waze_link: wazeLink })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating Waze link:', error);
    }
  },

  updateInvoiceLink: async (orderId, invoiceLink) => {
    const { error } = await supabase
      .from('orders')
      .update({ invoice_link: invoiceLink })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating invoice link:', error);
    }
  },

  updatePaymentLink: async (orderId, paymentLink) => {
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_link: paymentLink,
        payment_status: paymentLink ? 'pending' : 'none'
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating payment link:', error);
    }
  },

  updatePaymentStatus: async (orderId, paymentStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating payment status:', error);
    }
  },

  addNote: async (orderId, note) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;

    const { error } = await supabase
      .from('orders')
      .update({ 
        notes: [...order.notes, `[${new Date().toLocaleTimeString('he-IL')}] ${note}`] 
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error adding note:', error);
    }
  },

  addSupportMessage: async (orderId, message) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        order_id: orderId,
        sender: 'support',
        sender_name: 'שירה',
        message,
        read: false,
      });

    if (error) {
      console.error('Error adding support message:', error);
    }
  },

  markMessageAsRead: async (messageId) => {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
    }
  },

  deleteOrder: async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order:', error);
    } else {
      const currentOrder = get().currentOrder;
      if (currentOrder?.id === orderId) {
        set({ currentOrder: null });
      }
    }
  },
}));
