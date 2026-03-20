import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { User, Award, History, ArrowLeft, Phone, Wrench, ChevronDown, ChevronUp, HelpCircle, Sparkles, Lock, Mail, Eye, EyeOff, KeyRound, Gift, Calendar, CheckCircle2, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCustomerPoints, calculateDiscountFromPoints } from '@/components/LoyaltyPointsDisplay';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const POINT_VALUE = 0.5;

interface OrderSummary {
  id: string;
  order_number: number;
  device_type: string;
  issue_description: string;
  status: string;
  repair_price: number;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  pending: 'ממתין',
  approved: 'אושר',
  in_progress: 'בתיקון',
  completed: 'הושלם',
  cancelled: 'בוטל',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-primary/10 text-primary',
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-muted text-muted-foreground',
};

type AuthView = 'phone_input' | 'login' | 'register' | 'forgot_password' | 'reset_password' | 'dashboard';

const CustomerZone = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('phone_input');
  const [customerName, setCustomerName] = useState('');
  const [points, setPoints] = useState(0);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPointsGuide, setShowPointsGuide] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  // Try to load saved session
  useEffect(() => {
    const saved = sessionStorage.getItem('customer_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        setPhone(session.phone);
        setCustomerName(session.name || '');
        loadDashboardData(session.phone);
      } catch {}
    }
  }, []);

  const callAuth = async (body: Record<string, string>) => {
    const { data, error } = await supabase.functions.invoke('customer-auth', {
      body,
    });
    if (error) throw error;
    return data;
  };

  const loadDashboardData = async (phoneNum: string) => {
    const normalized = phoneNum.replace(/\D/g, '');
    setIsLoading(true);

    const [pts, ordersRes] = await Promise.all([
      getCustomerPoints(normalized),
      supabase
        .from('orders')
        .select('id, order_number, device_type, issue_description, status, repair_price, created_at, customer_name')
        .eq('customer_phone', normalized)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    setPoints(pts);
    if (ordersRes.data && ordersRes.data.length > 0) {
      setOrders(ordersRes.data);
      if (!customerName) setCustomerName(ordersRes.data[0].customer_name || '');
    } else {
      setOrders([]);
    }
    setAuthView('dashboard');
    setIsLoading(false);
  };

  // Step 1: Check phone
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = phone.replace(/\D/g, '');
    if (normalized.length < 9) return;

    setIsLoading(true);
    try {
      const result = await callAuth({ action: 'check_phone', phone: normalized });

      if (result.status === 'has_profile') {
        // Has profile -> go to login
        setCustomerName(result.name || '');
        setAuthView('login');
      } else if (result.status === 'can_register') {
        // Has orders but no profile -> go to register
        setCustomerName(result.name || '');
        setEmail(result.email || '');
        setAuthView('register');
      } else {
        // No orders
        toast({
          title: 'לא נמצאו הזמנות',
          description: 'לא נמצאו הזמנות עבור מספר זה. הזמינו תיקון כדי ליצור פרופיל.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה, נסו שוב', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  // Step 2a: Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await callAuth({
        action: 'login',
        phone: phone.replace(/\D/g, ''),
        password,
      });

      if (result.success) {
        setCustomerName(result.name || '');
        sessionStorage.setItem(
          'customer_session',
          JSON.stringify({ phone: result.phone, name: result.name })
        );
        await loadDashboardData(result.phone);
      }
    } catch (err: any) {
      toast({
        title: 'שגיאת התחברות',
        description: 'מספר טלפון או סיסמא שגויים',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  // Step 2b: Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'שגיאה', description: 'הסיסמא חייבת להכיל לפחות 6 תווים', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'שגיאה', description: 'הסיסמאות אינן תואמות', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await callAuth({
        action: 'register',
        phone: phone.replace(/\D/g, ''),
        password,
        email,
        name: customerName,
      });

      if (result.success) {
        toast({ title: 'הרישום הושלם!', description: 'הפרופיל שלך נוצר בהצלחה' });
        sessionStorage.setItem(
          'customer_session',
          JSON.stringify({ phone: phone.replace(/\D/g, ''), name: customerName })
        );
        await loadDashboardData(phone);
      }
    } catch (err: any) {
      const msg = err?.message?.includes('already_registered')
        ? 'מספר זה כבר רשום, נסו להתחבר'
        : 'אירעה שגיאה, נסו שוב';
      toast({ title: 'שגיאה', description: msg, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  // Step 3: Forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await callAuth({
        action: 'forgot_password',
        phone: phone.replace(/\D/g, ''),
      });

      if (result.success) {
        setMaskedEmail(result.maskedEmail || '');
        setAuthView('reset_password');
        toast({ title: 'נשלח!', description: `קוד איפוס נשלח ל-${result.maskedEmail}` });
      }
    } catch {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא פרופיל עם כתובת מייל, פנו לשירות לקוחות',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  // Step 4: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: 'שגיאה', description: 'הסיסמא חייבת להכיל לפחות 6 תווים', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await callAuth({
        action: 'reset_password',
        phone: phone.replace(/\D/g, ''),
        token: resetCode,
        password: newPassword,
      });

      if (result.success) {
        toast({ title: 'הסיסמא עודכנה!', description: 'כעת תוכלו להתחבר עם הסיסמא החדשה' });
        setPassword('');
        setAuthView('login');
      }
    } catch {
      toast({ title: 'שגיאה', description: 'קוד שגוי או פג תוקף', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setAuthView('phone_input');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setPoints(0);
    setOrders([]);
    setCustomerName('');
    setResetCode('');
    setNewPassword('');
    sessionStorage.removeItem('customer_session');
  };

  const handleOrderClick = (order: OrderSummary) => {
    setOpen(false);
    navigate(`/track?phone=${phone.replace(/\D/g, '')}`);
  };

  const handleNewOrder = () => {
    setOpen(false);
    navigate('/order');
  };

  const discount = calculateDiscountFromPoints(points);

  const renderPhoneInput = () => (
    <div className="space-y-4 animate-slide-up">
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">ברוכים הבאים!</h3>
        <p className="text-sm text-muted-foreground">הזינו את מספר הטלפון שלכם כדי להתחבר או ליצור פרופיל</p>
      </div>
      <form onSubmit={handlePhoneSubmit} className="space-y-3">
        <div className="relative">
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="מספר טלפון"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-14 text-lg pr-11 rounded-xl"
            dir="ltr"
            autoFocus
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-bold gap-2"
          disabled={phone.replace(/\D/g, '').length < 9 || isLoading}
        >
          {isLoading ? 'בודק...' : 'המשך'}
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );

  const renderLogin = () => (
    <div className="space-y-4 animate-slide-up">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">שלום, {customerName}!</h3>
        <p className="text-sm text-muted-foreground">הזינו את הסיסמא שלכם</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-3">
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="סיסמא"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 text-lg pr-11 pl-11 rounded-xl"
            dir="ltr"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-bold gap-2"
          disabled={!password || isLoading}
        >
          {isLoading ? 'מתחבר...' : 'התחברות'}
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <button
          type="button"
          onClick={() => setAuthView('forgot_password')}
          className="w-full text-center text-sm text-primary underline"
        >
          שכחתי סיסמא
        </button>
      </form>
      <button
        onClick={() => { setAuthView('phone_input'); setPassword(''); }}
        className="w-full text-center text-xs text-muted-foreground underline"
      >
        החלף מספר טלפון
      </button>
    </div>
  );

  const renderRegister = () => (
    <div className="space-y-4 animate-slide-up">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">יצירת פרופיל</h3>
        <p className="text-sm text-muted-foreground">שלום {customerName}, בחרו סיסמא לאזור האישי שלכם</p>
      </div>
      <form onSubmit={handleRegister} className="space-y-3">
        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="כתובת מייל (לאיפוס סיסמא)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 pr-11 rounded-xl"
            dir="ltr"
          />
        </div>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="בחרו סיסמא (לפחות 6 תווים)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 pr-11 pl-11 rounded-xl"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="אימות סיסמא"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 pr-11 rounded-xl"
            dir="ltr"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-bold gap-2"
          disabled={!password || !confirmPassword || isLoading}
        >
          {isLoading ? 'יוצר פרופיל...' : 'צור פרופיל'}
          <Sparkles className="w-4 h-4" />
        </Button>
      </form>
      <button
        onClick={() => { setAuthView('phone_input'); setPassword(''); setConfirmPassword(''); }}
        className="w-full text-center text-xs text-muted-foreground underline"
      >
        החלף מספר טלפון
      </button>
    </div>
  );

  const renderForgotPassword = () => (
    <div className="space-y-4 animate-slide-up">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Mail className="w-8 h-8 text-warning" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">איפוס סיסמא</h3>
        <p className="text-sm text-muted-foreground">נשלח קוד איפוס למייל שרשום בפרופיל שלכם</p>
      </div>
      <form onSubmit={handleForgotPassword} className="space-y-3">
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-bold gap-2"
          disabled={isLoading}
        >
          {isLoading ? 'שולח...' : 'שלח קוד איפוס'}
          <Mail className="w-4 h-4" />
        </Button>
      </form>
      <button
        onClick={() => setAuthView('login')}
        className="w-full text-center text-xs text-muted-foreground underline"
      >
        חזרה להתחברות
      </button>
    </div>
  );

  const renderResetPassword = () => (
    <div className="space-y-4 animate-slide-up">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">הזינו קוד איפוס</h3>
        <p className="text-sm text-muted-foreground">
          הקוד נשלח ל-{maskedEmail}
        </p>
      </div>
      <form onSubmit={handleResetPassword} className="space-y-3">
        <Input
          type="text"
          placeholder="קוד איפוס (6 תווים)"
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value.toUpperCase())}
          className="h-14 text-center text-2xl tracking-[0.5em] font-bold rounded-xl"
          maxLength={6}
          dir="ltr"
          autoFocus
        />
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="סיסמא חדשה (לפחות 6 תווים)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-12 pr-11 pl-11 rounded-xl"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-bold gap-2"
          disabled={resetCode.length !== 6 || !newPassword || isLoading}
        >
          {isLoading ? 'מעדכן...' : 'עדכן סיסמא'}
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </form>
      <button
        onClick={() => setAuthView('login')}
        className="w-full text-center text-xs text-muted-foreground underline"
      >
        חזרה להתחברות
      </button>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-5 animate-slide-up">
      {/* Welcome */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-primary" />
        </div>
        {customerName && (
          <h3 className="text-xl font-bold text-foreground">שלום, {customerName}!</h3>
        )}
        <p className="text-sm text-muted-foreground" dir="ltr">{phone}</p>
      </div>

      {/* Loyalty Points Card */}
      <Card className="overflow-hidden border-2 border-primary/20">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">נקודות נאמנות</span>
            </div>
            <div className="text-left">
              <span className="text-4xl font-extrabold">{points}</span>
              <p className="text-xs opacity-80">נקודות</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {points > 0 && (
            <div className="bg-success/10 border border-success/20 rounded-xl px-4 py-3 text-center">
              <p className="text-base font-bold text-success">
                🎉 יש לך ₪{discount.toFixed(0)} הנחה!
              </p>
              <p className="text-xs text-success/70 mt-0.5">מופעל אוטומטית בהזמנה הבאה</p>
            </div>
          )}

          {points === 0 && (
            <div className="bg-muted/50 rounded-xl px-4 py-3 text-center">
              <p className="text-sm text-muted-foreground">
                הזמינו תיקון וצברו נקודות להנחות! 🚀
              </p>
            </div>
          )}

          {/* How it works */}
          <button
            type="button"
            onClick={() => setShowPointsGuide(!showPointsGuide)}
            className="w-full flex items-center justify-between bg-muted/50 hover:bg-muted rounded-xl px-4 py-2.5 transition-colors"
          >
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              איך זה עובד?
            </span>
            {showPointsGuide
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />
            }
          </button>
          {showPointsGuide && (
            <div className="bg-muted/30 rounded-xl p-4 space-y-3 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <p className="text-sm text-foreground">כל <strong className="text-primary">100 ש"ח</strong> בתיקון = <strong className="text-primary">10 נקודות</strong></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <p className="text-sm text-foreground">כל נקודה שווה <strong className="text-primary">{POINT_VALUE} ש"ח</strong> הנחה</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <p className="text-sm text-foreground">ההנחה מופעלת <strong className="text-primary">אוטומטית</strong> בהזמנה הבאה!</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Repair History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="w-5 h-5 text-primary" />
          <h4 className="font-bold text-foreground">היסטוריית תיקונים</h4>
          <span className="text-xs text-muted-foreground">({orders.length})</span>
        </div>

        {orders.length === 0 ? (
          <Card className="p-6 text-center">
            <Wrench className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">אין עדיין תיקונים</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => handleOrderClick(order)}
                className="w-full text-right"
              >
                <Card className="p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground">#{order.order_number}</span>
                      </div>
                      <p className="font-semibold text-foreground text-sm truncate">{order.device_type}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.issue_description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: he })}
                        {' · '}
                        ₪{order.repair_price}
                      </p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full text-center text-xs text-muted-foreground underline"
      >
        התנתק / החלף מספר טלפון
      </button>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-muted/80 border-2 border-foreground/10"
          aria-label="האיזור האישי שלי"
        >
          <User className="w-5 h-5 sm:w-4 sm:h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-5 pb-3 border-b border-border">
          <SheetTitle className="text-right text-lg font-bold">האיזור האישי שלי</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {authView === 'phone_input' && renderPhoneInput()}
          {authView === 'login' && renderLogin()}
          {authView === 'register' && renderRegister()}
          {authView === 'forgot_password' && renderForgotPassword()}
          {authView === 'reset_password' && renderResetPassword()}
          {authView === 'dashboard' && renderDashboard()}
        </div>

        {/* Bottom CTA */}
        <div className="p-5 pt-3 border-t border-border">
          <Button
            onClick={handleNewOrder}
            className="w-full h-14 rounded-2xl text-lg font-bold gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            הזמן תיקון חדש
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CustomerZone;
