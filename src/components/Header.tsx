import { useEffect, useState } from 'react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({ onRefresh, isRefreshing }: HeaderProps) {
  const [dateString, setDateString] = useState('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const date = new Date();
    setDateString(
      date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    );

    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="vp-header">
      <div className="vp-container vp-header__inner">
        <div className="vp-brand">
          <img
            src="/apple-touch-icon.png"
            alt="Valley Pulse"
            className="vp-brand__logo"
          />
          <div className="vp-brand__text">
            <h1 className="vp-brand__title">Valley Pulse</h1>
            <p className="vp-brand__subtitle">{dateString}</p>
          </div>
        </div>

        <nav className="vp-nav" aria-label="Primary">
          <a className="vp-nav__link" href="#headlines">Headlines</a>
          <a className="vp-nav__link" href="#conditions">Conditions</a>
          <a className="vp-nav__link" href="#longform">Long‑form</a>
        </nav>

        <div className="vp-actions">
          <button
            onClick={toggleTheme}
            className="vp-icon-button"
            aria-label="Toggle theme"
            aria-pressed={isDark}
          >
            {isDark ? (
              <svg className="vp-icon" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
                <path d="M120,40V32a8,8,0,0,1,16,0v8a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-8-8A8,8,0,0,0,50.34,61.66Zm0,116.68-8,8a8,8,0,0,0,11.32,11.32l8-8a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l8-8a8,8,0,0,0-11.32-11.32l-8,8A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l8,8a8,8,0,0,0,11.32-11.32ZM40,120H32a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Zm88,88a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-8A8,8,0,0,0,128,208Zm96-88h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z" />
              </svg>
            ) : (
              <svg className="vp-icon" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
                <path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z" />
              </svg>
            )}
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="vp-icon-button vp-icon-button--accent"
            aria-label="Refresh"
          >
            <svg
              className={`vp-icon ${isRefreshing ? 'vp-spin' : ''}`}
              fill="currentColor"
              viewBox="0 0 256 256"
              aria-hidden="true"
            >
              <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L163.54,54.85a79.94,79.94,0,1,0,0,146.3,8,8,0,0,1,8.92,13.28A96,96,0,1,1,196.69,48H168a8,8,0,0,1,0-16h48A8,8,0,0,1,224,48Z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}