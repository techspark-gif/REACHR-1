import React, { useEffect, useState } from 'react';
import { sounds } from '../utils/audio';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (portal: 'landing' | 'seller' | 'buyer' | 'swipe' | 'discover') => void;
  theme?: 'light' | 'purple';
}

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
];

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [showLanguages, setShowLanguages] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Keep body class synced with open state for CSS animation matching reachr.html
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('open');
    } else {
      document.body.classList.remove('open');
      setShowLanguages(false);
    }
    return () => document.body.classList.remove('open');
  }, [isOpen]);

  return (
    <>
      {/* Scrim Overlay from reachr.html */}
      <div
        className="scrim"
        id="scrim"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Panel Drawer from reachr.html */}
      <aside
        className="side"
        id="side"
        aria-label="More features"
      >
        <header>
          <h3>More features</h3>
          <button
            className="ib"
            id="x"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>

        <p>What’s next for sellers and buyers.</p>

        <ul>
          {/* 1. Seller Dashboard */}
          <li
            onClick={() => {
              onNavigate('seller');
              onClose();
              sounds.playSuccess();
            }}
          >
            <i
              className="ico"
              style={{ background: 'linear-gradient(135deg,#ff9f0a,#ff6b57)' }}
            />
            <div>
              <b>
                Seller dashboard <em className="soon" style={{ background: 'var(--blue)', color: '#fff' }}>Open</em>
              </b>
              <span>Links, payments and orders in one place.</span>
            </div>
          </li>

          {/* 2. WhatsApp Updates */}
          <li
            onClick={() => {
              onNavigate('buyer');
              onClose();
              sounds.playMessage();
            }}
          >
            <i
              className="ico"
              style={{ background: 'linear-gradient(135deg,#0a84ff,#2bc4b4)' }}
            />
            <div>
              <b>
                WhatsApp updates <em className="soon">Soon</em>
              </b>
              <span>Order updates sent to the chat your buyers already use.</span>
            </div>
          </li>

          {/* 3. QR Payments */}
          <li
            onClick={() => {
              onNavigate('buyer');
              onClose();
              sounds.playMessage();
            }}
          >
            <i
              className="ico"
              style={{ background: 'linear-gradient(135deg,#2bc4b4,#8de0c7)' }}
            />
            <div>
              <b>
                QR payments <em className="soon">Soon</em>
              </b>
              <span>Turn any payment link into a scannable code.</span>
            </div>
          </li>

          {/* 4. Receipts */}
          <li
            onClick={() => {
              onNavigate('seller');
              onClose();
              sounds.playMessage();
            }}
          >
            <i
              className="ico"
              style={{ background: 'linear-gradient(135deg,#ffd166,#ff9f0a)' }}
            />
            <div>
              <b>
                Receipts <em className="soon">Soon</em>
              </b>
              <span>Automatic proof of every sale for both sides.</span>
            </div>
          </li>

          {/* 5. Promote on Social */}
          <li
            onClick={() => {
              onNavigate('seller');
              onClose();
              sounds.playMessage();
            }}
          >
            <i
              className="ico"
              style={{ background: 'linear-gradient(135deg,#ff6b57,#ff9f0a)' }}
            />
            <div>
              <b>
                Promote on social <em className="soon">Soon</em>
              </b>
              <span>Run ads for your shop on Instagram, Facebook and YouTube.</span>
            </div>
          </li>

          {/* 6. More Languages */}
          <li
            onClick={() => {
              setShowLanguages(!showLanguages);
              sounds.playMessage();
            }}
          >
            <i
              className="ico"
              style={{ background: 'linear-gradient(135deg,#0a84ff,#7cc4ff)' }}
            />
            <div style={{ flex: 1 }}>
              <b>
                More languages <em className="soon">{selectedLang}</em>
              </b>
              <span>Use Reachr in the language your buyers speak.</span>

              {showLanguages && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 6,
                    marginTop: 12,
                    padding: 8,
                    background: 'var(--bg2)',
                    borderRadius: 14,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: 0,
                        background: selectedLang === lang.name ? 'var(--blue)' : 'transparent',
                        color: selectedLang === lang.name ? '#fff' : 'inherit',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onClick={() => {
                        setSelectedLang(lang.name);
                        setShowLanguages(false);
                        sounds.playSuccess();
                      }}
                    >
                      {lang.name} <small style={{ opacity: 0.7 }}>({lang.native})</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </li>
        </ul>
      </aside>
    </>
  );
};
