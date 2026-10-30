import React, { useState, useRef, useEffect } from 'react';
import { Bell, ShoppingBag, Store, ShieldCheck, X, LogOut, ArrowRight, ArrowLeft } from 'lucide-react';
import { AppNotification, OrderLink, AppPortal } from '../types';
import { sounds } from '../utils/audio';

interface HeaderProps {
  currentPortal: AppPortal;
  onSelectPortal: (portal: AppPortal) => void;
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  orders: OrderLink[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string | null) => void;
  isSellerAuthenticated: boolean;
  onSellerLogout: () => void;
  isOwnerAuthenticated?: boolean;
  onOwnerLogout?: () => void;
  isBuyerIdentified?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPortal,
  onSelectPortal,
  notifications,
  onMarkNotificationsRead,
  orders,
  selectedOrderId,
  onSelectOrder,
  isSellerAuthenticated,
  onSellerLogout,
  isOwnerAuthenticated,
  onOwnerLogout,
  isBuyerIdentified = false,
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifDropdown(false);
      }
    };

    if (showNotifDropdown) {
      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifDropdown]);

  // Only show notification center when user is authenticated (Seller / Owner)
  // or when buyer has entered their order details / is tracking an active order.
  // NEVER show on the public home page!
  const showNotificationCenter =
    currentPortal !== 'landing' &&
    ((currentPortal === 'seller' && isSellerAuthenticated) ||
      (currentPortal === 'universal-control' && Boolean(isOwnerAuthenticated)) ||
      (currentPortal === 'buyer' && Boolean(isBuyerIdentified)));

  // If in Buyer Portal, filter notifications specifically to the tracked order
  const displayNotifications =
    currentPortal === 'buyer'
      ? notifications.filter((n) => {
          const trackedOrder = orders.find((o) => o.id === selectedOrderId);
          if (!trackedOrder) return false;
          return n.linkCode && n.linkCode.toUpperCase() === trackedOrder.linkCode.toUpperCase();
        })
      : notifications;

  const unreadCount = displayNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-3 z-50 px-4 md:px-8 max-w-7xl mx-auto w-full transition-all duration-200">
      <div className="bg-[#0F1420]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 shadow-xl flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <button
          onClick={() => {
            onSelectPortal('landing');
            setShowNotifDropdown(false);
            sounds.playMessage();
          }}
          className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none shrink-0"
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-400 shadow-md shadow-pink-500/30 group-hover:scale-110 transition-transform" />
          <span className="font-display font-extrabold text-2xl tracking-tight text-white group-hover:text-pink-400 transition-colors">
            Reachr
          </span>
        </button>

        {/* Center Zone: Contextual to the Active Experience */}
        <div className="flex-1 flex items-center justify-center">
          {/* Public Landing Navigation */}
          {currentPortal === 'landing' && (
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <a
                href="#features"
                className="px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#calculator"
                className="px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                Savings Simulator
              </a>
              <a
                href="#pricing"
                className="px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 transition-colors font-bold"
              >
                3 Subscription Plans
              </a>
              <a
                href="#faq"
                className="px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                FAQ
              </a>
            </nav>
          )}

          {/* Buyer Experience Banner */}
          {currentPortal === 'buyer' && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-teal-400" />
                <span>Buyer Portal · Zero Sign-In Required</span>
              </span>
            </div>
          )}

          {/* Seller Experience Banner */}
          {currentPortal === 'seller' && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-pink-400" />
                <span>Seller Studio · {isSellerAuthenticated ? "Meera's Handloom" : 'Merchant Login'}</span>
              </span>
            </div>
          )}

          {/* Platform Owner Console Banner */}
          {currentPortal === 'universal-control' && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span>Platform Owner Console · Universal Control</span>
              </span>
            </div>
          )}
        </div>

        {/* Right Zone: Primary Actions & Activity */}
        <div className="flex items-center gap-2 shrink-0">
          {/* If on Buyer, Seller or Owner portal: provide return to home */}
          {currentPortal !== 'landing' && (
            <button
              onClick={() => {
                onSelectPortal('landing');
                sounds.playMessage();
              }}
              className="px-3 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
          )}

          {/* Public Landing or Buyer view: Quick Buyer & Seller launchers */}
          {currentPortal === 'landing' && (
            <>
              <button
                onClick={() => {
                  onSelectPortal('buyer');
                  sounds.playMessage();
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Customer tracking and instant payment link portal (no login needed)"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Track Order / Explore</span>
                <span className="sm:hidden">Buyer</span>
              </button>

              <button
                onClick={() => {
                  onSelectPortal('seller');
                  sounds.playSuccess();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-pink-600/25 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{isSellerAuthenticated ? 'Seller Studio' : 'Seller Login'}</span>
              </button>
            </>
          )}

          {/* If in Buyer Portal: Quick jump to Seller Studio */}
          {currentPortal === 'buyer' && (
            <button
              onClick={() => {
                onSelectPortal('seller');
                sounds.playMessage();
              }}
              className="px-3 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-pink-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Seller Studio</span>
            </button>
          )}

          {/* If in Seller Portal and authenticated: show logout button */}
          {currentPortal === 'seller' && isSellerAuthenticated && (
            <button
              onClick={onSellerLogout}
              className="px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
              title="Sign out of Seller Studio"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}

          {/* If in Universal Control: Exit Owner session */}
          {currentPortal === 'universal-control' && onOwnerLogout && (
            <button
              onClick={onOwnerLogout}
              className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Exit Admin</span>
            </button>
          )}

          {/* Activity / Notification Bell - Only rendered when logged in or order details entered */}
          {showNotificationCenter && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                title={currentPortal === 'buyer' ? 'Your Order Updates' : 'Recent Activity'}
                className={`relative p-2 rounded-xl text-slate-300 hover:text-white border transition-colors cursor-pointer ${
                  showNotifDropdown ? 'bg-white/10 border-white/20' : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06]'
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              {showNotifDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
                    onClick={() => setShowNotifDropdown(false)}
                  />

                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#121724] border border-white/15 rounded-2xl p-4 shadow-2xl z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-sm text-white">
                          {currentPortal === 'buyer' ? 'Your Order Activity' : 'Activity Log'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">({displayNotifications.length} events)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              onMarkNotificationsRead();
                            }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifDropdown(false)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                          aria-label="Close activity log"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                      {displayNotifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-500">
                          {currentPortal === 'buyer'
                            ? 'No updates logged for this order yet.'
                            : 'No activity logged yet.'}
                        </div>
                      ) : (
                        displayNotifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (item.linkCode) {
                                const matched = orders.find((o) => o.linkCode === item.linkCode);
                                if (matched) {
                                  onSelectOrder(matched.id);
                                }
                              }
                              setShowNotifDropdown(false);
                            }}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                              item.read
                                ? 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05]'
                                : 'bg-indigo-950/40 border-indigo-500/30 text-slate-200 hover:bg-indigo-950/60'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold text-white mb-0.5">
                              <span>{item.title}</span>
                              <span className="text-[10px] text-slate-400 font-normal font-mono">{item.timestamp}</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px]">{item.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
