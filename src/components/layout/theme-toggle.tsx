'use client';
/* eslint-disable */

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/layout/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { themeMode, setTheme } = useTheme();
  const isDarkMode = themeMode === 'dark';
  const nextTheme = isDarkMode ? 'light' : 'dark';
  const actionLabel = `Switch to ${nextTheme} mode`;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={actionLabel}
      title={actionLabel}
      data-state={isDarkMode ? 'dark' : 'light'}
      onClick={() => setTheme(nextTheme)}
      className="text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary dark:text-foreground dark:hover:bg-primary/15 dark:hover:text-primary"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
      <span className="sr-only">{actionLabel}</span>
    </Button>
  );
}

