import { useState } from 'react';
import { Phone, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import VoiceLeadsManagement from './VoiceLeadsManagement';
import VoiceAgentManagement from './VoiceAgentManagement';

interface AIManagementProps {
  initialTab?: 'leads' | 'agent';
}

const AIManagement = ({ initialTab = 'leads' }: AIManagementProps) => {
  const [tab, setTab] = useState<'leads' | 'agent'>(initialTab);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 md:px-6 pt-4 md:pt-6 border-b border-border bg-background sticky top-0 z-10">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit mb-4">
          <button
            onClick={() => setTab('leads')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === 'leads' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Phone className="w-4 h-4" />
            פניות AI
          </button>
          <button
            onClick={() => setTab('agent')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === 'agent' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bot className="w-4 h-4" />
            נציג AI
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'leads' ? <VoiceLeadsManagement /> : <VoiceAgentManagement />}
      </div>
    </div>
  );
};

export default AIManagement;
