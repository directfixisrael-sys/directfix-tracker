import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/repair';
import { cn } from '@/lib/utils';
import { Send, MessageCircle, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import shiraAvatar from '@/assets/shira-avatar.png';

interface LiveChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const LiveChat = ({ messages, onSendMessage, isExpanded = false, onToggle }: LiveChatProps) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(isExpanded);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform animate-bounce-soft"
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
        {messages.some(m => !m.read && m.sender === 'support') && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
            <span className="text-xs text-accent-foreground font-bold">!</span>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80 sm:w-96 animate-scale-in">
      <div className="glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
        {/* Header */}
        <div className="bg-primary p-4 flex items-center gap-3">
          <div className="relative">
            <img 
              src={shiraAvatar} 
              alt="שירה" 
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-foreground/20"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-primary-foreground">שירה</h4>
            <p className="text-xs text-primary-foreground/70">נציגת שירות • מחוברת</p>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-primary-foreground" />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[300px] bg-background">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">שלחו הודעה ונחזור אליכם מיד!</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2 animate-fade-in",
                msg.sender === 'customer' ? "flex-row-reverse" : "flex-row"
              )}
            >
              {msg.sender === 'support' && (
                <img 
                  src={shiraAvatar} 
                  alt="שירה" 
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div
                className={cn(
                  "chat-bubble",
                  msg.sender === 'customer' ? "chat-bubble-user" : "chat-bubble-support"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className={cn(
                  "text-xs mt-1",
                  msg.sender === 'customer' ? "text-primary-foreground/60" : "text-muted-foreground"
                )}>
                  {msg.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
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
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              size="icon"
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

export default LiveChat;
