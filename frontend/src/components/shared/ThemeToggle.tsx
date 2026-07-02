import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 p-1">
      <button
        onClick={() => setTheme('light')}
        className={`rounded-full p-1.5 transition-all ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 scale-105'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Light Mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`rounded-full p-1.5 transition-all ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 scale-105'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Dark Mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`rounded-full p-1.5 transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 scale-105'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="System Mode"
      >
        <Laptop className="h-4 w-4" />
      </button>
    </div>
  );
};
