import {
  Smartphone, Battery, Phone, Zap, Wifi, WifiOff, Camera, Mic, MicOff,
  Volume2, VolumeX, Fingerprint, Cpu, HardDrive, Droplets, Shield,
  Monitor, ScreenShare, ScanLine, FlipVertical, Plug, Usb, Bluetooth,
  Signal, MapPin, Compass, RotateCcw, RefreshCw, Wrench, Settings,
  CircuitBoard, Power, BatteryCharging, Ear, Eye, Vibrate, Lock,
  Unlock, Key, type LucideIcon
} from 'lucide-react';

export interface IconOption {
  id: string;
  icon: LucideIcon;
  label: string;
}

export const REPAIR_ICON_OPTIONS: IconOption[] = [
  { id: 'smartphone', icon: Smartphone, label: 'מסך' },
  { id: 'battery', icon: Battery, label: 'סוללה' },
  { id: 'phone', icon: Phone, label: 'טלפון' },
  { id: 'zap', icon: Zap, label: 'חשמל' },
  { id: 'battery-charging', icon: BatteryCharging, label: 'טעינה' },
  { id: 'plug', icon: Plug, label: 'תקע' },
  { id: 'usb', icon: Usb, label: 'USB' },
  { id: 'camera', icon: Camera, label: 'מצלמה' },
  { id: 'mic', icon: Mic, label: 'מיקרופון' },
  { id: 'mic-off', icon: MicOff, label: 'מיקרופון כבוי' },
  { id: 'volume-2', icon: Volume2, label: 'רמקול' },
  { id: 'volume-x', icon: VolumeX, label: 'רמקול כבוי' },
  { id: 'ear', icon: Ear, label: 'אוזן/שמע' },
  { id: 'wifi', icon: Wifi, label: 'WiFi' },
  { id: 'wifi-off', icon: WifiOff, label: 'WiFi כבוי' },
  { id: 'bluetooth', icon: Bluetooth, label: 'בלוטות׳' },
  { id: 'signal', icon: Signal, label: 'אנטנה' },
  { id: 'fingerprint', icon: Fingerprint, label: 'טביעת אצבע' },
  { id: 'eye', icon: Eye, label: 'Face ID' },
  { id: 'vibrate', icon: Vibrate, label: 'רטט' },
  { id: 'droplets', icon: Droplets, label: 'נזקי מים' },
  { id: 'flip-vertical', icon: FlipVertical, label: 'גב זכוכית' },
  { id: 'monitor', icon: Monitor, label: 'מסך LCD' },
  { id: 'screen-share', icon: ScreenShare, label: 'תצוגה' },
  { id: 'scan-line', icon: ScanLine, label: 'סורק' },
  { id: 'cpu', icon: Cpu, label: 'מעבד' },
  { id: 'circuit-board', icon: CircuitBoard, label: 'לוח אם' },
  { id: 'hard-drive', icon: HardDrive, label: 'אחסון' },
  { id: 'power', icon: Power, label: 'כפתור הפעלה' },
  { id: 'lock', icon: Lock, label: 'נעילה' },
  { id: 'unlock', icon: Unlock, label: 'פתיחה' },
  { id: 'key', icon: Key, label: 'מפתח' },
  { id: 'shield', icon: Shield, label: 'הגנה' },
  { id: 'wrench', icon: Wrench, label: 'תיקון כללי' },
  { id: 'settings', icon: Settings, label: 'הגדרות' },
  { id: 'rotate-ccw', icon: RotateCcw, label: 'שחזור' },
  { id: 'refresh-cw', icon: RefreshCw, label: 'רענון' },
  { id: 'compass', icon: Compass, label: 'מצפן/GPS' },
  { id: 'map-pin', icon: MapPin, label: 'מיקום' },
];

const iconMap = new Map<string, LucideIcon>(
  REPAIR_ICON_OPTIONS.map(opt => [opt.id, opt.icon])
);

export function getRepairIconComponent(iconId: string): LucideIcon {
  return iconMap.get(iconId) || Smartphone;
}
