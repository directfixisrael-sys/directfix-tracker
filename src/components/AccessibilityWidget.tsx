import { useState, useEffect } from "react";
import { Accessibility, Plus, Minus, Eye, Sparkles, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reduceAnimations: boolean;
  largePointer: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  reduceAnimations: false,
  largePointer: false,
};

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("accessibility-settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  const applySettings = (s: AccessibilitySettings) => {
    // Font size
    document.documentElement.style.fontSize = `${s.fontSize}%`;
    
    // High contrast
    if (s.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    
    // Reduce animations
    if (s.reduceAnimations) {
      document.documentElement.classList.add("reduce-animations");
    } else {
      document.documentElement.classList.remove("reduce-animations");
    }
    
    // Large pointer
    if (s.largePointer) {
      document.documentElement.classList.add("large-pointer");
    } else {
      document.documentElement.classList.remove("large-pointer");
    }
  };

  const increaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 10, 150)
    }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 10, 80)
    }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({
      ...prev,
      highContrast: !prev.highContrast
    }));
  };

  const toggleReduceAnimations = () => {
    setSettings(prev => ({
      ...prev,
      reduceAnimations: !prev.reduceAnimations
    }));
  };

  const toggleLargePointer = () => {
    setSettings(prev => ({
      ...prev,
      largePointer: !prev.largePointer
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full",
          "bg-primary text-primary-foreground shadow-lg",
          "flex items-center justify-center",
          "hover:scale-110 transition-transform",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
        aria-label="פתח תפריט נגישות"
      >
        <Accessibility className="w-6 h-6" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-card rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Accessibility className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">נגישות</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
                aria-label="סגור"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Font Size Control */}
            <div className="mb-4 p-4 rounded-xl bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">גודל טקסט</span>
                <span className="text-sm text-muted-foreground">{settings.fontSize}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseFontSize}
                  disabled={settings.fontSize <= 80}
                  className="flex-shrink-0"
                  aria-label="הקטן טקסט"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((settings.fontSize - 80) / 70) * 100}%` }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseFontSize}
                  disabled={settings.fontSize >= 150}
                  className="flex-shrink-0"
                  aria-label="הגדל טקסט"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-2">
              <ToggleOption
                icon={Eye}
                label="ניגודיות גבוהה"
                description="צבעים חזקים יותר"
                checked={settings.highContrast}
                onChange={toggleHighContrast}
              />
              <ToggleOption
                icon={Sparkles}
                label="הפחתת אנימציות"
                description="פחות תנועה במסך"
                checked={settings.reduceAnimations}
                onChange={toggleReduceAnimations}
              />
              <ToggleOption
                icon={Accessibility}
                label="סמן גדול"
                description="סמן עכבר מוגדל"
                checked={settings.largePointer}
                onChange={toggleLargePointer}
              />
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              className="w-full mt-6 gap-2"
              onClick={resetSettings}
            >
              <RotateCcw className="w-4 h-4" />
              איפוס להגדרות ברירת מחדל
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

interface ToggleOptionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleOption({ icon: Icon, label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-right",
        checked 
          ? "bg-primary/10 border-2 border-primary" 
          : "bg-muted/50 border-2 border-transparent hover:bg-muted"
      )}
      role="switch"
      aria-checked={checked}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
        checked ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-foreground">{label}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
        checked ? "border-primary bg-primary" : "border-muted-foreground"
      )}>
        {checked && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
      </div>
    </button>
  );
}
