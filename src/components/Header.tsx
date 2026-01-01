import { useEffect, useState } from 'react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({ onRefresh, isRefreshing }: HeaderProps) {
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    const date = new Date();
    setDateString(
      date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    );
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-4 py-3 shadow-lg">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex-shrink-0 overflow-hidden rounded-[22%] shadow-lg">
            <img 
              src="/apple-touch-icon.png" 
              alt="Valley Pulse" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">
              Valley Pulse
            </h1>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {dateString}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-full bg-slate-800/50 hover:bg-white/10 active:scale-95 text-blue-400 border border-white/5 transition-all disabled:opacity-50"
          aria-label="Refresh"
        >
          <svg
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L163.54,54.85a79.94,79.94,0,1,0,0,146.3,8,8,0,0,1,8.92,13.28A96,96,0,1,1,196.69,48H168a8,8,0,0,1,0-16h48A8,8,0,0,1,224,48Z"/>
          </svg>
        </button>
      </div>
    </header>
  );
}