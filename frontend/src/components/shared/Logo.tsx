import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', subtitle, className = '' }) => {
  const iconSizes = {
    sm: 'h-7 w-7 text-xs rounded-lg',
    md: 'h-9 w-9 text-sm rounded-xl',
    lg: 'h-11 w-11 text-base rounded-2xl'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 font-extrabold tracking-tight text-foreground select-none ${className}`}>
      {/* Dynamic Glowing Logo Icon */}
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white font-black shadow-lg shadow-indigo-500/20 group transition-all duration-300 hover:scale-105 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5 text-white transform group-hover:rotate-12 transition-transform duration-300"
        >
          {/* Custom geometric 'C' with arrow spark */}
          <path d="M16 8A6 6 0 1 0 16 16" />
          <path d="M14 12h6m-3-3 3 3-3 3" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
        </span>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className={`flex items-center gap-1 font-black ${textSizes[size]}`}>
          <span className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent tracking-wider">
            CRUIT
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
        </div>
        {subtitle && (
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-muted-foreground -mt-1">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
