import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Shield, 
  Battery, 
  Zap, 
  Package, 
  Truck, 
  Check,
  Gift,
  Star,
  ChevronDown,
  ChevronUp,
  Phone,
  User,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PhoneModel {
  id: string;
  name: string;
  series: string;
  image: string;
  storage: { size: string; price: number }[];
  colors: string[];
  isNew?: boolean;
  isPro?: boolean;
}

const iphone17Series: PhoneModel[] = [
  {
    id: 'iphone-17',
    name: 'iPhone 17',
    series: 'iPhone 17',
    image: '📱',
    colors: ['שחור', 'לבן', 'כחול', 'ורוד', 'ירוק'],
    storage: [
      { size: '128GB', price: 3999 },
      { size: '256GB', price: 4499 },
      { size: '512GB', price: 5499 },
    ],
  },
  {
    id: 'iphone-17-plus',
    name: 'iPhone 17 Plus',
    series: 'iPhone 17',
    image: '📱',
    colors: ['שחור', 'לבן', 'כחול', 'ורוד', 'ירוק'],
    storage: [
      { size: '128GB', price: 4499 },
      { size: '256GB', price: 4999 },
      { size: '512GB', price: 5999 },
    ],
  },
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    series: 'iPhone 17 Pro',
    image: '📱',
    colors: ['טיטניום שחור', 'טיטניום לבן', 'טיטניום טבעי', 'טיטניום כחול'],
    isPro: true,
    storage: [
      { size: '128GB', price: 5299 },
      { size: '256GB', price: 5799 },
      { size: '512GB', price: 6799 },
      { size: '1TB', price: 7799 },
    ],
  },
  {
    id: 'iphone-17-pro-max',
    name: 'iPhone 17 Pro Max',
    series: 'iPhone 17 Pro',
    image: '📱',
    colors: ['טיטניום שחור', 'טיטניום לבן', 'טיטניום טבעי', 'טיטניום כחול'],
    isPro: true,
    isNew: true,
    storage: [
      { size: '256GB', price: 6299 },
      { size: '512GB', price: 7299 },
      { size: '1TB', price: 8299 },
    ],
  },
  {
    id: 'iphone-17-air',
    name: 'iPhone 17 Air',
    series: 'iPhone 17',
    image: '📱',
    colors: ['כסף', 'כחול חלל', 'זהב'],
    isNew: true,
    storage: [
      { size: '128GB', price: 4799 },
      { size: '256GB', price: 5299 },
      { size: '512GB', price: 6299 },
    ],
  },
];

const packageFeatures = [
  { icon: Shield, title: 'מגן מסך פרימיום', description: 'הגנה מלאה על המסך' },
  { icon: Package, title: 'כיסוי איכותי', description: 'כיסוי מעוצב לבחירתך' },
  { icon: Zap, title: 'מטען מהיר 20W', description: 'טעינה מהירה לאייפון' },
  { icon: Battery, title: 'העברת נתונים', description: 'העברה מלאה מהמכשיר הישן' },
  { icon: Truck, title: 'משלוח עד הבית/משרד', description: 'חינם!' },
];

const DevicePurchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<PhoneModel | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const handleSelectModel = (model: PhoneModel, storage: string, color: string) => {
    setSelectedModel(model);
    setSelectedStorage(storage);
    setSelectedColor(color);
    setIsOrderDialogOpen(true);
  };

  const getPrice = (model: PhoneModel, storageSize: string) => {
    return model.storage.find(s => s.size === storageSize)?.price || 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderForm.name || !orderForm.phone || !orderForm.address) {
      toast({
        title: 'נא למלא את כל השדות',
        variant: 'destructive',
      });
      return;
    }

    // Here you would send the order to your backend
    toast({
      title: 'ההזמנה התקבלה בהצלחה! 🎉',
      description: 'ניצור איתך קשר בקרוב לתיאום הגעה',
    });
    
    setIsOrderDialogOpen(false);
    setOrderForm({ name: '', phone: '', address: '' });
    setSelectedModel(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton onBack={() => navigate('/')} />
      
      <main className="container max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-slide-up">
          <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-primary/20 to-accent/20">
            <Smartphone className="w-3 h-3 ml-1" />
            סדרת iPhone 17 זמינה עכשיו!
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            קנה מכשיר חדש
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            מכשיר חדש + חבילת אביזרים מלאה + העברת נתונים + משלוח עד הבית
          </p>
        </div>

        {/* Package Benefits */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            חבילה מלאה כלולה בכל מכשיר:
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {packageFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* iPhone Models */}
        <div className="space-y-4">
          {iphone17Series.map((model) => (
            <Card 
              key={model.id}
              className={cn(
                "overflow-hidden transition-all duration-300",
                expandedModel === model.id && "ring-2 ring-primary",
                model.isPro && "bg-gradient-to-br from-card to-primary/5"
              )}
            >
              {/* Model Header */}
              <div 
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{model.image}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{model.name}</h3>
                      {model.isNew && (
                        <Badge className="bg-success text-success-foreground">חדש!</Badge>
                      )}
                      {model.isPro && (
                        <Badge variant="secondary">Pro</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      החל מ-₪{model.storage[0].price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-1">
                    {model.colors.slice(0, 4).map((color, i) => (
                      <div 
                        key={i} 
                        className="w-4 h-4 rounded-full border border-border bg-muted"
                        title={color}
                      />
                    ))}
                  </div>
                  {expandedModel === model.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedModel === model.id && (
                <div className="px-4 pb-4 pt-2 border-t border-border animate-slide-up">
                  {/* Storage Options */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">בחר נפח:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {model.storage.map((storage) => (
                        <Button
                          key={storage.size}
                          variant={selectedStorage === storage.size && selectedModel?.id === model.id ? "default" : "outline"}
                          className="h-auto py-3 flex flex-col"
                          onClick={() => {
                            setSelectedModel(model);
                            setSelectedStorage(storage.size);
                          }}
                        >
                          <span className="font-bold">{storage.size}</span>
                          <span className="text-sm opacity-80">₪{storage.price.toLocaleString()}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Color Options */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">בחר צבע:</p>
                    <div className="flex flex-wrap gap-2">
                      {model.colors.map((color) => (
                        <Button
                          key={color}
                          variant={selectedColor === color && selectedModel?.id === model.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedModel(model);
                            setSelectedColor(color);
                          }}
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Order Button */}
                  <Button 
                    className="w-full h-12 text-lg gap-2"
                    disabled={!selectedStorage || !selectedColor || selectedModel?.id !== model.id}
                    onClick={() => handleSelectModel(model, selectedStorage, selectedColor)}
                  >
                    <Smartphone className="w-5 h-5" />
                    הזמן עכשיו - ₪{selectedStorage && selectedModel?.id === model.id ? getPrice(model, selectedStorage).toLocaleString() : '---'}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Why Choose Us */}
        <Card className="mt-8 p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-warning fill-warning" />
            למה לקנות אצלנו?
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">מכשירים חדשים באריזה</p>
                <p className="text-sm text-muted-foreground">אחריות מלאה יבואן רשמי</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">שירות עד הבית</p>
                <p className="text-sm text-muted-foreground">מגיעים אליך להתקנה והעברת נתונים</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">תמיכה מלאה</p>
                <p className="text-sm text-muted-foreground">זמינים לכל שאלה גם אחרי הרכישה</p>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              השלמת הזמנה
            </DialogTitle>
            <DialogDescription>
              {selectedModel?.name} - {selectedStorage} - {selectedColor}
            </DialogDescription>
          </DialogHeader>
          
          {/* Order Summary */}
          <Card className="p-4 bg-muted/50">
            <div className="flex justify-between items-center mb-2">
              <span>מכשיר</span>
              <span className="font-medium">{selectedModel?.name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>נפח</span>
              <span className="font-medium">{selectedStorage}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>צבע</span>
              <span className="font-medium">{selectedColor}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-bold">כולל חבילת אביזרים</span>
              <span className="text-xl font-bold text-primary">
                ₪{selectedModel && selectedStorage ? getPrice(selectedModel, selectedStorage).toLocaleString() : 0}
              </span>
            </div>
          </Card>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                <User className="w-4 h-4" />
                שם מלא
              </label>
              <Input
                value={orderForm.name}
                onChange={(e) => setOrderForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="השם שלך"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                <Phone className="w-4 h-4" />
                טלפון
              </label>
              <Input
                type="tel"
                value={orderForm.phone}
                onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="050-0000000"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                כתובת למשלוח
              </label>
              <Input
                value={orderForm.address}
                onChange={(e) => setOrderForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="רחוב, עיר"
                required
              />
            </div>

            <p className="text-sm text-muted-foreground text-center">
              🚚 לאחר ההזמנה ניצור קשר לתיאום הגעה
            </p>

            <Button type="submit" className="w-full h-12 text-lg">
              שלח הזמנה
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DevicePurchase;
