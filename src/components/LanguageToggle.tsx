import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  variant?: "header" | "menu";
}

const LanguageToggle = ({ className, variant = "header" }: LanguageToggleProps) => {
  const { i18n, t } = useTranslation();
  const isEnglish = i18n.language?.startsWith("en");

  const toggle = () => {
    const next = isEnglish ? "he" : "en";
    i18n.changeLanguage(next);
  };

  if (variant === "menu") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={toggle}
        className={cn("h-12 w-12 rounded-xl border-2 border-foreground/15 font-bold text-sm", className)}
        aria-label={t("common.language")}
      >
        {isEnglish ? "עב" : "EN"}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn("h-9 w-9 rounded-xl border-2 border-foreground/10 font-bold text-xs", className)}
      aria-label={t("common.language")}
      title={isEnglish ? "עברית" : "English"}
    >
      {isEnglish ? "עב" : "EN"}
    </Button>
  );
};

export default LanguageToggle;
