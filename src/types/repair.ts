export type RepairStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'technician_assigned'
  | 'on_the_way' 
  | 'arrived'
  | 'in_progress' 
  | 'completed';

export interface RepairOrder {
  id: string;
  customerPhone: string;
  customerName: string;
  customerAddress: string;
  deviceType: string;
  issueDescription: string;
  status: RepairStatus;
  estimatedArrival?: string;
  technicianName?: string;
  repairPrice: number;
  accessories: Accessory[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  wantsPromotions: boolean;
  rating?: number;
  feedback?: string;
  lastViewedAt?: Date;
  isViewing?: boolean;
  wazeLink?: string;
  invoiceLink?: string;
}

export interface Accessory {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  selected: boolean;
  description?: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: 'customer' | 'support';
  senderName: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface StatusUpdate {
  status: RepairStatus;
  timestamp: Date;
  note?: string;
}

export const statusLabels: Record<RepairStatus, string> = {
  pending: 'ממתין לאישור',
  confirmed: 'הזמנה אושרה',
  technician_assigned: 'טכנאי שובץ',
  on_the_way: 'טכנאי בדרך אליך',
  arrived: 'טכנאי הגיע',
  in_progress: 'התיקון בתהליך',
  completed: 'התיקון הושלם',
};

export const statusIcons: Record<RepairStatus, string> = {
  pending: '⏳',
  confirmed: '✓',
  technician_assigned: '👨‍🔧',
  on_the_way: '🏍️',
  arrived: '📍',
  in_progress: '🔧',
  completed: '✅',
};
