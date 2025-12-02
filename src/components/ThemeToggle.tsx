import { Moon, Sun, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const options = [
    { value: "light" as const, icon: Sun, label: "בהיר" },
    { value: "dark" as const, icon: Moon, label: "כהה" },
    { value: "auto" as const, icon: Clock, label: "אוטומטי" },
  ];

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        {resolvedTheme === "dark" ? (
          <Moon className="w-5 h-5 text-primary" />
        ) : (
          <Sun className="w-5 h-5 text-primary" />
        )}
        <div>
          <h3 className="font-bold text-foreground text-lg">מצב תצוגה</h3>
          <p className="text-muted-foreground text-sm">
            {theme === "auto" 
              ? "משתנה אוטומטית לפי השעה (כהה 18:00-06:00)" 
              : theme === "dark" 
                ? "מצב כהה קבוע" 
                : "מצב בהיר קבוע"
            }
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={theme === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex-1 gap-2",
              theme === option.value && "bg-primary text-primary-foreground"
            )}
          >
            <option.icon className="w-4 h-4" />
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
