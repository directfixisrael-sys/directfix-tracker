import { createRoot } from 'react-dom/client';
import SupportChat from '@/components/support/SupportChat';
export function mount(orderNumber: number, name: string, phone: string) {
  const el = document.createElement('div'); document.body.appendChild(el);
  createRoot(el).render(<SupportChat orderNumber={orderNumber} name={name} phone={phone} />);
}
