import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/repair';
import { cn } from '@/lib/utils';
import { Send, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminLiveChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  customerName: string;
}

const AdminLiveChat = ({ messages, onSendMessage, customerName }: AdminLiveChatProps) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const unreadCount = messages.filter(m => !m.read && m.sender === 'customer').length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 left-6 z-50 flex items-center gap-3 bg-primary text-primary-foreground pl-5 pr-4 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-semibold text-sm">צ'אט עם {customerName}</span>
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center animate-pulse">
            <span className="text-[10px] text-warning-foreground font-bold">{unreadCount}</span>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-6 z-50 w-80 sm:w-96 animate-scale-in">
      <div className="wolt-card-elevated overflow-hidden flex flex-col max-h-[480px]">
        {/* Header */}
        <div className="bg-primary p-4 flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                {customerName.charAt(0)}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-primary-foreground">{customerName}</h4>
            <p className="text-xs text-primary-foreground/70">לקוח</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center hover:bg-primary-foreground/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px] max-h-[280px] bg-background">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">אין הודעות עדיין</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2 animate-fade-in",
                msg.sender === 'support' ? "flex-row-reverse" : "flex-row"
              )}
            >
              {msg.sender === 'customer' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-muted-foreground font-bold text-sm">
                    {customerName.charAt(0)}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  "chat-bubble",
                  msg.sender === 'support' ? "chat-bubble-user" : "chat-bubble-support"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className={cn(
                  "text-[10px] mt-1.5",
                  msg.sender === 'support' ? "text-primary-foreground/60" : "text-muted-foreground"
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="כתבו הודעה..."
              className="flex-1 rounded-full"
            />
            <Button 
              onClick={handleSend} 
              size="icon"
              className="rounded-full w-10 h-10"
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveChat;
