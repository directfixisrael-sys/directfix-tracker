import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PushNotificationToggle = () => {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="glass-card p-4 rounded-xl text-center">
        <BellOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          הדפדפן שלך לא תומך בהתראות דחיפה
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 rounded-xl">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isSubscribed ? 'bg-success/10' : 'bg-muted'
        }`}>
          <Bell className={`w-6 h-6 ${isSubscribed ? 'text-success' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground">התראות דחיפה</h3>
          <p className="text-sm text-muted-foreground">
            {isSubscribed ? 'תקבל התראות כשלקוח שולח הודעה' : 'הפעל כדי לקבל התראות'}
          </p>
        </div>
      </div>
      
      <Button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading}
        variant={isSubscribed ? 'outline' : 'default'}
        className="w-full gap-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSubscribed ? (
          <>
            <BellOff className="w-4 h-4" />
            בטל התראות
          </>
        ) : (
          <>
            <Bell className="w-4 h-4" />
            הפעל התראות
          </>
        )}
      </Button>
    </div>
  );
};

export default PushNotificationToggle;
