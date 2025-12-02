import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RepairOrder, ChatMessage, RepairStatus, Accessory } from '@/types/repair';

interface RepairStore {
  orders: RepairOrder[];
  messages: ChatMessage[];
  currentOrder: RepairOrder | null;
  activeTab: 'orders' | 'customers' | 'messages' | 'settings' | 'feedback' | 'analytics';
  
  // Tab actions
  setActiveTab: (tab: 'orders' | 'customers' | 'messages' | 'settings' | 'feedback' | 'analytics') => void;
  
  // Customer actions
  setCurrentOrder: (order: RepairOrder | null) => void;
  findOrderByPhone: (phone: string) => RepairOrder | undefined;
  toggleAccessory: (orderId: string, accessoryId: string) => void;
  setWantsPromotions: (orderId: string, wants: boolean) => void;
  setRating: (orderId: string, rating: number, feedback?: string) => void;
  addCustomerMessage: (orderId: string, message: string) => void;
  setViewingStatus: (orderId: string, isViewing: boolean) => void;
  
  // Admin actions
  addOrder: (order: Omit<RepairOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (orderId: string, status: RepairStatus, note?: string) => void;
  updateEstimatedArrival: (orderId: string, eta: string) => void;
  addNote: (orderId: string, note: string) => void;
  addSupportMessage: (orderId: string, message: string) => void;
  markMessageAsRead: (messageId: string) => void;
  deleteOrder: (orderId: string) => void;
}

const defaultAccessories: Accessory[] = [
  { id: '1', name: 'מגן מסך רגיל', price: 50, originalPrice: 79, selected: false },
  { id: '2', name: 'מגן מסך פרימיום', price: 100, originalPrice: 149, selected: false },
  { id: '3', name: 'מטען מהיר + כבל', price: 70, originalPrice: 119, selected: false },
  { id: '4', name: 'כיסוי שקוף פרימיום', price: 50, originalPrice: 89, selected: false },
];

// Demo data
const demoOrders: RepairOrder[] = [
  {
    id: '1',
    customerPhone: '0501234567',
    customerName: 'ישראל ישראלי',
    customerAddress: 'רחוב הרצל 15, תל אביב',
    deviceType: 'iPhone 14 Pro',
    issueDescription: 'מסך שבור',
    status: 'on_the_way',
    estimatedArrival: '14:30',
    technicianName: 'דני',
    repairPrice: 450,
    accessories: [...defaultAccessories],
    notes: ['הלקוח ביקש להתקשר לפני ההגעה'],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(),
    wantsPromotions: false,
  },
  {
    id: '2',
    customerPhone: '0529876543',
    customerName: 'שרה כהן',
    customerAddress: 'שדרות רוטשילד 50, תל אביב',
    deviceType: 'Samsung Galaxy S23',
    issueDescription: 'בעיית סוללה',
    status: 'confirmed',
    technicianName: 'משה',
    repairPrice: 280,
    accessories: [...defaultAccessories],
    notes: [],
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(),
    wantsPromotions: true,
  },
];

const demoMessages: ChatMessage[] = [
  {
    id: '1',
    orderId: '1',
    sender: 'support',
    senderName: 'שירה',
    message: 'שלום! ברוכים הבאים לדיירקט פיקס 👋 איך אפשר לעזור?',
    timestamp: new Date(Date.now() - 1800000),
    read: true,
  },
];

export const useRepairStore = create<RepairStore>()(
  persist(
    (set, get) => ({
      orders: demoOrders,
      messages: demoMessages,
      currentOrder: null,
      activeTab: 'orders',

      setActiveTab: (tab) => set({ activeTab: tab }),

      setCurrentOrder: (order) => set({ currentOrder: order }),
      
      findOrderByPhone: (phone) => {
        const normalizedPhone = phone.replace(/\D/g, '');
        return get().orders.find(o => o.customerPhone.replace(/\D/g, '') === normalizedPhone);
      },

      toggleAccessory: (orderId, accessoryId) => set((state) => {
        const updatedOrders = state.orders.map(order => 
          order.id === orderId 
            ? {
                ...order,
                accessories: order.accessories.map(acc =>
                  acc.id === accessoryId ? { ...acc, selected: !acc.selected } : acc
                ),
                updatedAt: new Date(),
              }
            : order
        );
        
        const updatedCurrentOrder = state.currentOrder?.id === orderId
          ? {
              ...state.currentOrder,
              accessories: state.currentOrder.accessories.map(acc =>
                acc.id === accessoryId ? { ...acc, selected: !acc.selected } : acc
              ),
              updatedAt: new Date(),
            }
          : state.currentOrder;

        return { orders: updatedOrders, currentOrder: updatedCurrentOrder };
      }),

      setWantsPromotions: (orderId, wants) => set((state) => {
        const updatedOrders = state.orders.map(order =>
          order.id === orderId ? { ...order, wantsPromotions: wants, updatedAt: new Date() } : order
        );
        
        const updatedCurrentOrder = state.currentOrder?.id === orderId
          ? { ...state.currentOrder, wantsPromotions: wants, updatedAt: new Date() }
          : state.currentOrder;

        return { orders: updatedOrders, currentOrder: updatedCurrentOrder };
      }),

      setRating: (orderId, rating, feedback) => set((state) => {
        const updatedOrders = state.orders.map(order =>
          order.id === orderId ? { ...order, rating, feedback, updatedAt: new Date() } : order
        );
        
        const updatedCurrentOrder = state.currentOrder?.id === orderId
          ? { ...state.currentOrder, rating, feedback, updatedAt: new Date() }
          : state.currentOrder;

        return { orders: updatedOrders, currentOrder: updatedCurrentOrder };
      }),

      setViewingStatus: (orderId, isViewing) => set((state) => ({
        orders: state.orders.map(order =>
          order.id === orderId 
            ? { ...order, isViewing, lastViewedAt: isViewing ? new Date() : order.lastViewedAt } 
            : order
        ),
      })),

      addCustomerMessage: (orderId, message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            orderId,
            sender: 'customer',
            senderName: state.orders.find(o => o.id === orderId)?.customerName || 'לקוח',
            message,
            timestamp: new Date(),
            read: false,
          },
        ],
      })),

      addOrder: (orderData) => set((state) => {
        console.log('Store addOrder called with:', orderData);
        const newOrder: RepairOrder = {
          ...orderData,
          id: Date.now().toString(),
          accessories: [...defaultAccessories],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        console.log('New order created:', newOrder);
        console.log('Total orders will be:', state.orders.length + 1);
        return { orders: [...state.orders, newOrder] };
      }),

      updateOrderStatus: (orderId, status, note) => set((state) => {
        const updatedOrders = state.orders.map(order =>
          order.id === orderId 
            ? { 
                ...order, 
                status, 
                updatedAt: new Date(),
                completedAt: status === 'completed' ? new Date() : order.completedAt,
                notes: note ? [...order.notes, `[${new Date().toLocaleTimeString('he-IL')}] ${note}`] : order.notes,
              } 
            : order
        );
        
        const updatedCurrentOrder = state.currentOrder?.id === orderId
          ? { 
              ...state.currentOrder, 
              status, 
              updatedAt: new Date(),
              completedAt: status === 'completed' ? new Date() : state.currentOrder.completedAt,
              notes: note ? [...state.currentOrder.notes, `[${new Date().toLocaleTimeString('he-IL')}] ${note}`] : state.currentOrder.notes,
            }
          : state.currentOrder;

        return { orders: updatedOrders, currentOrder: updatedCurrentOrder };
      }),

      updateEstimatedArrival: (orderId, eta) => set((state) => {
        const updatedOrders = state.orders.map(order =>
          order.id === orderId ? { ...order, estimatedArrival: eta, updatedAt: new Date() } : order
        );
        
        const updatedCurrentOrder = state.currentOrder?.id === orderId
          ? { ...state.currentOrder, estimatedArrival: eta, updatedAt: new Date() }
          : state.currentOrder;

        return { orders: updatedOrders, currentOrder: updatedCurrentOrder };
      }),

      addNote: (orderId, note) => set((state) => {
        const updatedOrders = state.orders.map(order =>
          order.id === orderId 
            ? { ...order, notes: [...order.notes, `[${new Date().toLocaleTimeString('he-IL')}] ${note}`], updatedAt: new Date() } 
            : order
        );
        
        const updatedCurrentOrder = state.currentOrder?.id === orderId
          ? { ...state.currentOrder, notes: [...state.currentOrder.notes, `[${new Date().toLocaleTimeString('he-IL')}] ${note}`], updatedAt: new Date() }
          : state.currentOrder;

        return { orders: updatedOrders, currentOrder: updatedCurrentOrder };
      }),

      addSupportMessage: (orderId, message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            orderId,
            sender: 'support',
            senderName: 'שירה',
            message,
            timestamp: new Date(),
            read: false,
          },
        ],
      })),

      markMessageAsRead: (messageId) => set((state) => ({
        messages: state.messages.map(msg =>
          msg.id === messageId ? { ...msg, read: true } : msg
        ),
      })),

      deleteOrder: (orderId) => set((state) => ({
        orders: state.orders.filter(order => order.id !== orderId),
        currentOrder: state.currentOrder?.id === orderId ? null : state.currentOrder,
        messages: state.messages.filter(msg => msg.orderId !== orderId),
      })),
    }),
    {
      name: 'directfix-repairs',
      // Custom serializer to handle Date objects
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          // Convert date strings back to Date objects
          if (data.state?.orders) {
            data.state.orders = data.state.orders.map((order: any) => ({
              ...order,
              createdAt: new Date(order.createdAt),
              updatedAt: new Date(order.updatedAt),
              completedAt: order.completedAt ? new Date(order.completedAt) : undefined,
            }));
          }
          if (data.state?.messages) {
            data.state.messages = data.state.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
          }
          return data;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
