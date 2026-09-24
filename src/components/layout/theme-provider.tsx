"use client";
/* eslint-disable */

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type ThemeMode = "dark" | "light";

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeMode: ThemeMode;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  ...props
}: {
  children?: React.ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: Theme;
  enableSystem?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");

  const getSystemTheme = () => {
    if (enableSystem) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "system") {
      const systemTheme = getSystemTheme();
      // eslint-disable-next-line
      setThemeMode(systemTheme);
      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(systemTheme);
      } else {
        root.setAttribute("data-theme", systemTheme);
      }
    } else {
      setThemeMode(theme);
      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(theme);
      } else {
        root.setAttribute("data-theme", theme);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, attribute, enableSystem]);

  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        setThemeMode(systemTheme);
        if (attribute === "class") {
          document.documentElement.classList.remove("light", "dark");
          document.documentElement.classList.add(systemTheme);
        } else {
          document.documentElement.setAttribute(
            "data-theme",
            systemTheme
          );
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, attribute, enableSystem]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
    },
    themeMode,
  };

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
}
