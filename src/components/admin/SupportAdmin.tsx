import { useState } from 'react';
import { MessagesSquare, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SupportInbox from './SupportInbox';
import SupportFaqManager from './SupportFaqManager';

// Support chat admin: conversations + the questions and answers the chat uses
const SupportAdmin = () => {
  const [view, setView] = useState<'inbox' | 'faqs'>('inbox');
  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex gap-2" role="tablist" aria-label="צ'אט תמיכה">
        <Button role="tab" aria-selected={view === 'inbox'} variant={view === 'inbox' ? 'default' : 'outline'} onClick={() => setView('inbox')} className="gap-1.5"><MessagesSquare className="w-4 h-4" />שיחות</Button>
        <Button role="tab" aria-selected={view === 'faqs'} variant={view === 'faqs' ? 'default' : 'outline'} onClick={() => setView('faqs')} className="gap-1.5"><ListChecks className="w-4 h-4" />שאלות ותשובות</Button>
      </div>
      {view === 'inbox' ? <SupportInbox /> : <SupportFaqManager />}
    </div>
  );
};

export default SupportAdmin;
