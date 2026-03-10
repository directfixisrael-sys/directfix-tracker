import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, User, Clock, Search, Trash2, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';

interface Lead {
  id: string;
  customer_name: string;
  customer_phone: string;
  privacy_accepted: boolean;
  is_returning_customer: boolean;
  converted: boolean;
  created_at: string;
}

const LeadsManagement = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setLeads(data);
    if (error) console.error('Error loading leads:', error);
    setIsLoading(false);
  };

  useEffect(() => {
    loadLeads();

    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => loadLeads())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const deleteLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id);
    toast.success('הליד נמחק');
  };

  const markConverted = async (id: string) => {
    await supabase.from('leads').update({ converted: true }).eq('id', id);
    toast.success('סומן כהזמנה');
  };

  const filtered = leads.filter(l => 
    !l.converted && (
      l.customer_name.includes(search) || 
      l.customer_phone.includes(search)
    )
  );

  const convertedLeads = leads.filter(l => l.converted);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי שם או טלפון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
          <p className="text-xs text-muted-foreground">לידים פעילים</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-success">{convertedLeads.length}</p>
          <p className="text-xs text-muted-foreground">הומרו להזמנה</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-warning">{leads.filter(l => l.is_returning_customer).length}</p>
          <p className="text-xs text-muted-foreground">לקוחות חוזרים</p>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">אין לידים פעילים</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <Card key={lead.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm">{lead.customer_name}</p>
                    {lead.is_returning_customer && (
                      <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded-full font-medium">
                        חוזר
                      </span>
                    )}
                    {lead.privacy_accepted && (
                      <Shield className="w-3.5 h-3.5 text-success" />
                    )}
                  </div>
                  <a href={`tel:${lead.customer_phone}`} className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {lead.customer_phone}
                  </a>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {format(new Date(lead.created_at), 'dd/MM HH:mm', { locale: he })}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-success"
                    onClick={() => markConverted(lead.id)}
                    title="סמן כהומר להזמנה"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteLead(lead.id)}
                    title="מחק"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsManagement;
