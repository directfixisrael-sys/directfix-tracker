import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowRight, Smartphone, Battery, Phone, CheckCircle2, Sparkles, Wrench, MapPin } from 'lucide-react';
import { useRepairStore } from '@/store/repairStore';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

// iPhone models with prices
const iphoneModels = [
  { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', screenPrice: 1350, batteryPrice: 280 },
  { id: 'iphone-16-pro', name: 'iPhone 16 Pro', screenPrice: 1250, batteryPrice: 280 },
  { id: 'iphone-16-plus', name: 'iPhone 16 Plus', screenPrice: 1100, batteryPrice: 250 },
  { id: 'iphone-16', name: 'iPhone 16', screenPrice: 1000, batteryPrice: 250 },
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', screenPrice: 1200, batteryPrice: 250 },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', screenPrice: 1100, batteryPrice: 250 },
  { id: 'iphone-15-plus', name: 'iPhone 15 Plus', screenPrice: 950, batteryPrice: 220 },
  { id: 'iphone-15', name: 'iPhone 15', screenPrice: 850, batteryPrice: 220 },
  { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', screenPrice: 1000, batteryPrice: 220 },
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', screenPrice: 900, batteryPrice: 220 },
  { id: 'iphone-14-plus', name: 'iPhone 14 Plus', screenPrice: 750, batteryPrice: 200 },
  { id: 'iphone-14', name: 'iPhone 14', screenPrice: 650, batteryPrice: 200 },
  { id: 'iphone-13-pro-max', name: 'iPhone 13 Pro Max', screenPrice: 800, batteryPrice: 200 },
  { id: 'iphone-13-pro', name: 'iPhone 13 Pro', screenPrice: 700, batteryPrice: 200 },
  { id: 'iphone-13', name: 'iPhone 13', screenPrice: 550, batteryPrice: 180 },
  { id: 'iphone-13-mini', name: 'iPhone 13 Mini', screenPrice: 500, batteryPrice: 180 },
  { id: 'iphone-12-pro-max', name: 'iPhone 12 Pro Max', screenPrice: 650, batteryPrice: 180 },
  { id: 'iphone-12-pro', name: 'iPhone 12 Pro', screenPrice: 600, batteryPrice: 180 },
  { id: 'iphone-12', name: 'iPhone 12', screenPrice: 450, batteryPrice: 150 },
  { id: 'iphone-12-mini', name: 'iPhone 12 Mini', screenPrice: 400, batteryPrice: 150 },
  { id: 'iphone-11-pro-max', name: 'iPhone 11 Pro Max', screenPrice: 550, batteryPrice: 150 },
  { id: 'iphone-11-pro', name: 'iPhone 11 Pro', screenPrice: 500, batteryPrice: 150 },
  { id: 'iphone-11', name: 'iPhone 11', screenPrice: 350, batteryPrice: 130 },
  { id: 'iphone-xr', name: 'iPhone XR', screenPrice: 300, batteryPrice: 130 },
  { id: 'iphone-xs-max', name: 'iPhone XS Max', screenPrice: 400, batteryPrice: 130 },
  { id: 'iphone-xs', name: 'iPhone XS', screenPrice: 350, batteryPrice: 130 },
  { id: 'iphone-x', name: 'iPhone X', screenPrice: 300, batteryPrice: 120 },
  { id: 'iphone-8-plus', name: 'iPhone 8 Plus', screenPrice: 250, batteryPrice: 100 },
  { id: 'iphone-8', name: 'iPhone 8', screenPrice: 200, batteryPrice: 100 },
];

const repairTypes = [
  { id: 'screen', name: 'החלפת מסך', icon: Smartphone, description: 'מסך שבור או לא מגיב' },
  { id: 'battery', name: 'החלפת סוללה', icon: Battery, description: 'סוללה חלשה או נפוחה' },
  { id: 'other', name: 'תיקון אחר', icon: Phone, description: 'צור קשר טלפוני' },
];

type Step = 'model' | 'repair' | 'price' | 'details' | 'success';

const NewRepairOrder = () => {
  const navigate = useNavigate();
  const { addOrder } = useRepairStore();
  
  const [step, setStep] = useState<Step>('model');
  const [selectedModel, setSelectedModel] = useState<typeof iphoneModels[0] | null>(null);
  const [selectedRepair, setSelectedRepair] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  const filteredModels = iphoneModels.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPrice = () => {
    if (!selectedModel || !selectedRepair) return 0;
    return selectedRepair === 'screen' ? selectedModel.screenPrice : selectedModel.batteryPrice;
  };

  const goToStep = (newStep: Step) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
    }, 200);
  };

  const handleModelSelect = (model: typeof iphoneModels[0]) => {
    setSelectedModel(model);
    goToStep('repair');
  };

  const handleRepairSelect = (repairId: string) => {
    if (repairId === 'other') {
      window.location.href = 'tel:0528692886';
      return;
    }
    setSelectedRepair(repairId);
    goToStep('price');
  };

  const handlePriceConfirm = () => {
    goToStep('details');
  };

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 10);
  };

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      toast.error('אנא מלא את כל השדות');
      return;
    }
    
    if (customerPhone.length < 9) {
      toast.error('מספר טלפון לא תקין');
      return;
    }

    setIsSubmitting(true);

    try {
      const repairTypeText = selectedRepair === 'screen' ? 'החלפת מסך' : 'החלפת סוללה';
      
      await addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        deviceType: selectedModel?.name || '',
        issueDescription: repairTypeText,
        repairPrice: getPrice(),
        status: 'pending',
        accessories: [],
        notes: [`הזמנה מהאתר - ${repairTypeText}`],
        wantsPromotions: false,
      });

      goToStep('success');
    } catch (error) {
      toast.error('אירעה שגיאה, נסה שוב');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackOrder = () => {
    navigate('/track');
  };

  // Floating phone illustration component
  const PhoneIllustration = ({ animate = false }: { animate?: boolean }) => (
    <div className={`relative ${animate ? 'animate-bounce-slow' : ''}`}>
      <div className="w-20 h-36 bg-gradient-to-b from-muted to-muted/50 rounded-[1.5rem] border-4 border-foreground/20 relative overflow-hidden shadow-xl">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-foreground/20 rounded-full" />
        <div className="absolute inset-3 top-5 bg-primary/20 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
      </div>
      {step === 'repair' && selectedRepair === null && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center animate-pulse">
          <span className="text-destructive-foreground text-xs font-bold">!</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              if (step === 'model') navigate('/');
              else if (step === 'repair') goToStep('model');
              else if (step === 'price') goToStep('repair');
              else if (step === 'details') goToStep('price');
              else navigate('/');
            }}
            className="rounded-full"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <h1 className="text-lg font-semibold">הזמנת תיקון</h1>
        </div>
        
        {/* Progress bar */}
        {step !== 'success' && (
          <div className="px-4 pb-3">
            <div className="flex gap-2">
              {['model', 'repair', 'price', 'details'].map((s, i) => (
                <div 
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    ['model', 'repair', 'price', 'details'].indexOf(step) >= i 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-4 transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        
        {/* Step 1: Select Model */}
        {step === 'model' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <PhoneIllustration animate />
              </div>
              <h2 className="text-2xl font-bold mb-2">בחר את דגם האייפון</h2>
              <p className="text-muted-foreground">איזה מכשיר צריך תיקון?</p>
            </div>

            <Input
              placeholder="🔍 חפש דגם..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-base rounded-xl"
            />

            <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pb-20">
              {filteredModels.map((model, index) => (
                <Card
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className="p-4 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 active:scale-95"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-medium text-sm leading-tight">{model.name}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Repair Type */}
        {step === 'repair' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <PhoneIllustration />
                  <div className="absolute -bottom-2 -left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                    {selectedModel?.name}
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">מה הבעיה?</h2>
              <p className="text-muted-foreground">בחר את סוג התיקון הנדרש</p>
            </div>

            <div className="space-y-3">
              {repairTypes.map((repair, index) => {
                const Icon = repair.icon;
                const isOther = repair.id === 'other';
                
                return (
                  <Card
                    key={repair.id}
                    onClick={() => handleRepairSelect(repair.id)}
                    className={`p-5 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                      isOther 
                        ? 'border-dashed border-2 hover:border-warning hover:bg-warning/5' 
                        : 'hover:border-primary hover:shadow-lg'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        isOther ? 'bg-warning/10' : 'bg-primary/10'
                      }`}>
                        <Icon className={`w-7 h-7 ${isOther ? 'text-warning' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{repair.name}</h3>
                        <p className="text-muted-foreground text-sm">{repair.description}</p>
                        {!isOther && selectedModel && (
                          <p className="text-primary font-bold mt-1">
                            ₪{repair.id === 'screen' ? selectedModel.screenPrice : selectedModel.batteryPrice}
                          </p>
                        )}
                      </div>
                      {isOther && (
                        <Phone className="w-5 h-5 text-warning" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              💡 תיקונים נוספים כמו מצלמה, רמקול ועוד - יש להתקשר
            </p>
          </div>
        )}

        {/* Step 3: Price Confirmation */}
        {step === 'price' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-success/20 to-success/5 rounded-full flex items-center justify-center animate-pulse-slow">
                    <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                      <Wrench className="w-8 h-8 text-success" />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-lg px-3 py-1 rounded-full font-bold shadow-lg">
                    ₪{getPrice()}
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">סיכום הזמנה</h2>
              <p className="text-muted-foreground">אישור מחיר התיקון</p>
            </div>

            <Card className="p-5 bg-gradient-to-br from-card to-muted/30">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">דגם</span>
                  <span className="font-semibold">{selectedModel?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">סוג תיקון</span>
                  <span className="font-semibold">
                    {selectedRepair === 'screen' ? 'החלפת מסך' : 'החלפת סוללה'}
                  </span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">סה"כ לתשלום</span>
                    <span className="text-2xl font-bold text-primary">₪{getPrice()}</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="bg-muted/50 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">תשלום בסיום התיקון בלבד</p>
                <p className="text-muted-foreground text-xs mt-1">
                  ניתן לשלם במזומן, אשראי או ביט
                </p>
              </div>
            </div>

            <Button 
              onClick={handlePriceConfirm}
              className="w-full h-14 text-lg rounded-xl"
            >
              אישור והמשך
            </Button>
          </div>
        )}

        {/* Step 4: Customer Details */}
        {step === 'details' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">פרטי הזמנה</h2>
              <p className="text-muted-foreground">לאן לשלוח את הטכנאי?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">שם מלא</label>
                <Input
                  placeholder="הכנס שם מלא"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-12 text-base rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">מספר טלפון</label>
                <Input
                  placeholder="050-0000000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                  type="tel"
                  className="h-12 text-base rounded-xl text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">כתובת מלאה</label>
                <Input
                  placeholder="עיר, רחוב ומספר בית"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="h-12 text-base rounded-xl"
                />
              </div>
            </div>

            <Card className="p-4 bg-muted/30">
              <div className="flex justify-between items-center text-sm">
                <span>{selectedModel?.name} • {selectedRepair === 'screen' ? 'מסך' : 'סוללה'}</span>
                <span className="font-bold text-primary">₪{getPrice()}</span>
              </div>
            </Card>

            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 text-lg rounded-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  שולח...
                </div>
              ) : (
                'שלח הזמנה'
              )}
            </Button>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 'success' && (
          <div className="text-center space-y-6 animate-fade-in py-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-success/30 to-success/10 rounded-full flex items-center justify-center animate-scale-in">
                  <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-12 h-12 text-success-foreground" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 text-4xl animate-bounce">🎉</div>
                <div className="absolute -bottom-2 -left-2 text-4xl animate-bounce" style={{ animationDelay: '100ms' }}>✨</div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2 text-success">ההזמנה התקבלה!</h2>
              <p className="text-muted-foreground">ניצור איתך קשר בהקדם לתיאום הגעה</p>
            </div>

            <Card className="p-5 bg-gradient-to-br from-card to-success/5">
              <div className="space-y-3 text-right">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">דגם</span>
                  <span className="font-medium">{selectedModel?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">תיקון</span>
                  <span className="font-medium">{selectedRepair === 'screen' ? 'החלפת מסך' : 'החלפת סוללה'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">מחיר</span>
                  <span className="font-bold text-primary">₪{getPrice()}</span>
                </div>
              </div>
            </Card>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={handleTrackOrder}
                className="w-full h-14 text-lg rounded-xl"
              >
                עקוב אחר ההזמנה
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full h-12 rounded-xl"
              >
                חזרה לדף הבית
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewRepairOrder;
