import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options = [
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'dark', label: 'Dark Mode', icon: Moon },
    { id: 'system', label: 'System Mode', icon: Laptop },
  ] as const;

  return (
    <div className="relative flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 p-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={`relative rounded-full p-1.5 transition-colors focus-visible:outline-none ${
              isActive
                ? 'text-primary dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title={opt.label}
          >
            {isActive && (
              <motion.div
                layoutId="active-theme-pill"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4 transition-transform duration-200 active:scale-90" />
          </button>
        );
      })}
    </div>
  );
};
