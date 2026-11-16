import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { AppPortal } from '../types';
import { sounds } from '../utils/audio';

interface HeaderProps {
  currentPortal: AppPortal;
  onSelectPortal: (portal: AppPortal) => void;
  theme: 'light' | 'purple';
  onToggleTheme: (theme: 'light' | 'purple') => void;
  onOpenDrawer?: () => void;
  notifications?: any[];
  onMarkNotificationsRead?: () => void;
  orders?: any[];
  selectedOrderId?: string | null;
  onSelectOrder?: (id: string | null) => void;
  isSellerAuthenticated?: boolean;
  onSellerLogout?: () => void;
  sellerBusinessName?: string;
  isBuyerIdentified?: boolean;
  onOpenSwipeFeed?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPortal,
  onSelectPortal,
  theme,
  onToggleTheme,
  onOpenDrawer,
}) => {
  const scrollTo = (e: React.MouseEvent, hash: string) => {
    e.preventDefault();
    if (currentPortal !== 'landing') {
      onSelectPortal('landing');
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="nav">
      <div className="nav-in">
        {/* Reachr SVG Logo + Wordmark — exact copy from reachr.html */}
        <a
          className="logo"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            if (currentPortal !== 'landing') {
              onSelectPortal('landing');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Reachr home"
        >
          <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden="true">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#ffb02e" />
                <stop offset="1" stopColor="#ff5a4a" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="11" fill="#1d1d1f" />
            <path
              d="M13 31V9H21C27.5 9 28 13.5 28 16C28 19 25.5 22 21 22H13"
              fill="none"
              stroke="url(#lg)"
              strokeWidth="5.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 22L28.5 31"
              fill="none"
              stroke="#2bc4b4"
              strokeWidth="5.6"
              strokeLinecap="round"
            />
          </svg>
          reachr
        </a>

        {/* Navigation links: Overview, How it works, Features, Discover, Pricing, Buyer Hub, Seller Studio */}
        <ul>
          <li><a href="#top" onClick={(e) => scrollTo(e, '#top')}>Overview</a></li>
          <li><a href="#how" onClick={(e) => scrollTo(e, '#how')}>How it works</a></li>
          <li><a href="#features" onClick={(e) => scrollTo(e, '#features')}>Features</a></li>
          <li>
            <a
              href="#discover"
              onClick={(e) => {
                e.preventDefault();
                onSelectPortal('discover');
                sounds.playSuccess();
              }}
            >
              Discover
            </a>
          </li>
          <li><a href="#pricing" onClick={(e) => scrollTo(e, '#pricing')}>Pricing</a></li>
          <li>
            <a
              href="#buyer"
              onClick={(e) => {
                e.preventDefault();
                onSelectPortal('buyer');
                sounds.playSuccess();
              }}
              style={{ fontWeight: 500 }}
            >
              Buyer Hub
            </a>
          </li>
          <li>
            <a
              href="#seller"
              onClick={(e) => {
                e.preventDefault();
                onSelectPortal('seller');
                sounds.playSuccess();
              }}
              style={{ fontWeight: 600, color: 'var(--blue)' }}
            >
              Seller Studio
            </a>
          </li>
        </ul>

        {/* Right-side controls */}
        <div className="nav-r">
          {/* Theme toggle */}
          <button
            type="button"
            className="ib"
            onClick={() => {
              onToggleTheme(theme === 'purple' ? 'light' : 'purple');
              sounds.playMessage();
            }}
            title={`Switch to ${theme === 'purple' ? 'Light' : 'Purple'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'purple' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-purple-600" />
            )}
          </button>

          {/* Pricing CTA pill */}
          <a
            className="pill"
            href="#pricing"
            onClick={(e) => scrollTo(e, '#pricing')}
          >
            Start free
          </a>

          {/* Hamburger menu button — exact match */}
          <button
            className="ib"
            id="menu"
            type="button"
            aria-label="More features"
            aria-expanded="false"
            aria-controls="side"
            onClick={() => {
              if (onOpenDrawer) onOpenDrawer();
              sounds.playMessage();
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};
