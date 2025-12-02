import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "auto";

type ThemeProviderContextType = {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

const getTimeBasedTheme = (): "dark" | "light" => {
  const hour = new Date().getHours();
  // Dark mode between 18:00 (6 PM) and 06:00 (6 AM)
  return hour >= 18 || hour < 6 ? "dark" : "light";
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    return stored || "auto";
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() => {
    if (theme === "auto") return getTimeBasedTheme();
    return theme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    const updateTheme = () => {
      let activeTheme: "dark" | "light";
      
      if (theme === "auto") {
        activeTheme = getTimeBasedTheme();
      } else {
        activeTheme = theme;
      }
      
      setResolvedTheme(activeTheme);
      root.classList.remove("light", "dark");
      root.classList.add(activeTheme);
    };

    updateTheme();
    localStorage.setItem("theme", theme);

    // Check every minute for time-based theme changes
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
