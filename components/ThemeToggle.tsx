'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    console.log('ThemeToggle: Changing theme to', newTheme);
    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-md border border-zinc-300 dark:border-zinc-600" />
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-zinc-300 bg-white p-1 dark:border-zinc-600 dark:bg-zinc-800">
      <button
        onClick={() => handleThemeChange('light')}
        className={`rounded px-2 py-1 text-sm transition-colors ${
          theme === 'light'
            ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
        }`}
        title="Light mode"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`rounded px-2 py-1 text-sm transition-colors ${
          theme === 'dark'
            ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
        }`}
        title="Dark mode"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>
      <button
        onClick={() => handleThemeChange('system')}
        className={`rounded px-2 py-1 text-sm transition-colors ${
          theme === 'system'
            ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
        }`}
        title="System theme"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>
    </div>
  );
}
