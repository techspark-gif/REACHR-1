import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { INITIAL_ORDERS, INITIAL_NOTIFICATIONS } from './data/initialData';
import { OrderLink, AppNotification, AppPortal, SellerCredentials, SubscriptionTier } from './types';
import { sounds } from './utils/audio';

// Portals & modals loaded on demand
const SellerLoginView = lazy(() => import('./components/SellerLoginView').then((m) => ({ default: m.SellerLoginView })));
const SellerDashboard = lazy(() => import('./components/SellerDashboard').then((m) => ({ default: m.SellerDashboard })));
const BuyerPortal = lazy(() => import('./components/BuyerPortal').then((m) => ({ default: m.BuyerPortal })));
const DiscoverPage = lazy(() => import('./components/DiscoverPage').then((m) => ({ default: m.DiscoverPage })));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal').then((m) => ({ default: m.SubscriptionModal })));
const ProductSwipeDeck = lazy(() => import('./components/ProductSwipeDeck').then((m) => ({ default: m.ProductSwipeDeck })));
const SidebarDrawer = lazy(() => import('./components/SidebarDrawer').then((m) => ({ default: m.SidebarDrawer })));

const PortalFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
  </div>
);

export default function App() {
  // Theme state: purple is Reachr's signature dark violet mode, light is Apple clean mode
  const [theme, setTheme] = useState<'light' | 'purple'>(() => {
    try {
      const saved = localStorage.getItem('reachr-theme');
      if (saved === 'purple' || saved === 'light') return saved;
    } catch {}
    return 'purple';
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('reachr-theme', theme);
    } catch {}
  }, [theme]);

  // Orders state
  const [orders, setOrders] = useState<OrderLink[]>(() => {
    try {
      const saved = localStorage.getItem('reachr_orders_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ORDERS;
  });

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('reachr_notifications_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  // Seller Auth State
  const [isSellerAuthenticated, setIsSellerAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('reachr_seller_auth_v4') === 'true';
    } catch {
      return false;
    }
  });

  const [currentSeller, setCurrentSeller] = useState<SellerCredentials>(() => {
    try {
      const saved = localStorage.getItem('reachr_current_seller_v4');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      email: 'meera@handloom.in',
      businessName: "Meera's Handloom",
      ownerName: 'Meera R.',
      vpa: 'meera@upi',
      phone: '+91 98451 22390',
      isVerified: true,
      city: 'Bengaluru, Karnataka',
      category: 'Handloom & Textiles',
      trustScore: 99,
      subscriptionTier: 'starter',
    };
  });

  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [selectedSubscriptionTier, setSelectedSubscriptionTier] = useState<SubscriptionTier>('pro');
  const [showSidebarDrawer, setShowSidebarDrawer] = useState<boolean>(false);

  // When a seller logs in, selectedOrderId starts as NULL so they see the taskbar workspace!
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUpgradeSubscription = useCallback((newTier: SubscriptionTier) => {
    setCurrentSeller((prev) => {
      const updated: SellerCredentials = { ...prev, subscriptionTier: newTier };
      try {
        localStorage.setItem('reachr_current_seller_v4', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setToastMessage(`Upgraded to Reachr ${newTier === 'elite' ? 'Elite Brand' : newTier === 'pro' ? 'Pro Growth' : 'Starter'} plan`);
  }, []);

  // Buyer identification state
  const [isBuyerIdentified, setIsBuyerIdentified] = useState<boolean>(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('#pay=')) return true;
      return localStorage.getItem('reachr_buyer_identified_v4') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('reachr_buyer_identified_v4', isBuyerIdentified ? 'true' : 'false');
    } catch {}
  }, [isBuyerIdentified]);

  // Top-level Navigation Mode
  const [currentPortal, setCurrentPortal] = useState<AppPortal>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('#buyer') || hash.includes('#pay=')) return 'buyer';
    if (hash.includes('#seller')) return 'seller';
    if (hash.includes('#discover')) return 'discover';
    return 'landing';
  });

  const [buyerInitialTab, setBuyerInitialTab] = useState<'checkout' | 'explore' | 'swipe' | 'track' | 'trust'>('checkout');

  const handleOpenSwipeFeed = useCallback(() => setCurrentPortal('swipe'), []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reachr_orders_v4', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('reachr_notifications_v4', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('reachr_seller_auth_v4', isSellerAuthenticated ? 'true' : 'false');
    } catch {}
  }, [isSellerAuthenticated]);

  // Handle deep link hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/#pay=([^&]+)/);
      if (match && match[1]) {
        const code = decodeURIComponent(match[1]);
        const target = orders.find((o) => o.linkCode.toUpperCase() === code.toUpperCase());
        if (target) {
          setSelectedOrderId(target.id);
          setIsBuyerIdentified(true);
          setCurrentPortal('buyer');
          setToastMessage(`Loaded payment link for ${target.customerName}`);
          return;
        }
      }
      const lower = hash.toLowerCase();
      if (lower.startsWith('#buyer')) {
        setCurrentPortal('buyer');
      } else if (lower.startsWith('#seller')) {
        setCurrentPortal('seller');
      } else if (lower.startsWith('#discover')) {
        setCurrentPortal('discover');
      } else if (
        lower.startsWith('#home') ||
        lower.startsWith('#landing') ||
        lower.startsWith('#how') ||
        lower.startsWith('#features') ||
        lower.startsWith('#pricing') ||
        lower.startsWith('#join') ||
        lower.startsWith('#top') ||
        !lower
      ) {
        setCurrentPortal('landing');
        if (hash.startsWith('#') && hash.length > 1) {
          setTimeout(() => {
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 120);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [orders]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 2800);
  }, []);

  const handleSelectPortal = useCallback((portal: AppPortal) => {
    if (portal === 'universal-control') return;
    setCurrentPortal(portal);
    window.location.hash = portal === 'landing' ? '' : portal;
  }, []);

  // Seller Auth Handlers
  const handleSellerLoginSuccess = useCallback(
    (sellerData?: SellerCredentials) => {
      if (sellerData) {
        setCurrentSeller(sellerData);
        try {
          localStorage.setItem('reachr_current_seller_v4', JSON.stringify(sellerData));
        } catch {}
      }
      setIsSellerAuthenticated(true);
      // Ensure selectedOrderId is null so seller sees the taskbar dock
      setSelectedOrderId(null);
      showToast(`Welcome to Seller Studio, ${sellerData?.businessName || sellerData?.ownerName || 'Merchant'}`);
    },
    [showToast]
  );

  const handleSellerLogout = useCallback(() => {
    setIsSellerAuthenticated(false);
    setSelectedOrderId(null);
    showToast('Signed out of Seller Studio.');
  }, [showToast]);

  const handleCreateOrder = useCallback(
    (orderData: Partial<OrderLink>) => {
      const newId = `l-${Date.now()}`;
      const newOrder: OrderLink = {
        id: newId,
        linkCode: orderData.linkCode || `RCH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        customerName: orderData.customerName || 'Anonymous',
        customerPhone: orderData.customerPhone,
        amount: orderData.amount || 1000,
        note: orderData.note || 'Custom order',
        quantity: orderData.quantity || 1,
        terms: orderData.terms || 'Standard 7-day exchange window.',
        createdAt: 'Just now',
        expiresAt: orderData.expiresAt || null,
        businessName: orderData.businessName || currentSeller.businessName,
        businessVpa: orderData.businessVpa || currentSeller.vpa,
        status: 'pending',
        deliveryStage: 0,
        messages: orderData.messages || [],
      };
      setOrders((prev) => [newOrder, ...prev]);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'payment',
          title: `Link Created: ${newOrder.linkCode}`,
          text: `Payment link created for ${newOrder.customerName} (₹${newOrder.amount.toLocaleString('en-IN')}).`,
          timestamp: 'Just now',
          read: false,
          linkCode: newOrder.linkCode,
        },
        ...prev,
      ]);
      showToast(`Created payment link ${newOrder.linkCode}`);
    },
    [currentSeller.businessName, currentSeller.vpa, showToast]
  );

  const handleUpdateOrder = useCallback((id: string, updates: Partial<OrderLink>) => {
    setOrders((prev) => prev.map((o) => (o.id !== id ? o : { ...o, ...updates })));
  }, []);

  const handleSendMessage = useCallback(
    (orderId: string, text: string) => {
      const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const isSeller = currentPortal === 'seller';
          return {
            ...o,
            messages: [
              ...o.messages,
              {
                id: `msg-${Date.now()}`,
                sender: isSeller ? ('seller' as const) : ('customer' as const),
                senderName: isSeller ? o.businessName : o.customerName,
                text,
                timestamp,
              },
            ],
          };
        })
      );
    },
    [currentPortal]
  );

  const handleMarkNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  }, [showToast]);

  return (
    <div className="relative min-h-screen text-[var(--ink)] bg-[var(--bg)] flex flex-col justify-between selection:bg-purple-500/30 font-sans transition-colors duration-300">
      {/* Header with Navigation and Theme Switcher */}
      <Header
        currentPortal={currentPortal}
        onSelectPortal={handleSelectPortal}
        onOpenSwipeFeed={handleOpenSwipeFeed}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        orders={orders}
        selectedOrderId={selectedOrderId}
        onSelectOrder={setSelectedOrderId}
        isSellerAuthenticated={isSellerAuthenticated}
        onSellerLogout={handleSellerLogout}
        sellerBusinessName={currentSeller.businessName}
        isBuyerIdentified={isBuyerIdentified}
        theme={theme}
        onToggleTheme={setTheme}
        onOpenDrawer={() => setShowSidebarDrawer(true)}
      />

      {/* Main Experience Router */}
      <main className={`flex-1 ${currentPortal === 'landing' ? '' : 'pb-16'}`}>
        {currentPortal === 'landing' && (
          <LandingView
            onGoToSeller={() => handleSelectPortal('seller')}
            onGoToBuyer={() => handleSelectPortal('buyer')}
            onGoToTrustCenter={() => handleSelectPortal('buyer')}
            onGoToDiscover={() => handleSelectPortal('discover')}
            onOpenSubscriptionModal={(tier) => {
              if (tier) setSelectedSubscriptionTier(tier);
              setShowSubscriptionModal(true);
            }}
            theme={theme}
          />
        )}

        <Suspense fallback={<PortalFallback />}>
          {currentPortal === 'discover' && (
            <DiscoverPage
              onBackToHome={() => handleSelectPortal('landing')}
              onGoToBuyer={(id) => {
                if (id) setSelectedOrderId(id);
                handleSelectPortal('buyer');
              }}
              onGoToSeller={() => handleSelectPortal('seller')}
              onCreateOrder={handleCreateOrder}
              showToast={showToast}
              theme={theme}
            />
          )}

          {currentPortal === 'buyer' && (
            <BuyerPortal
              orders={orders}
              selectedOrderId={selectedOrderId}
              onSelectOrder={setSelectedOrderId}
              onUpdateOrder={handleUpdateOrder}
              onSendMessage={handleSendMessage}
              onCreateOrder={handleCreateOrder}
              notifications={notifications}
              onMarkNotificationsRead={handleMarkNotificationsRead}
              onSwitchPortal={() => handleSelectPortal('landing')}
              showToast={showToast}
              isBuyerIdentified={isBuyerIdentified}
              onBuyerIdentified={() => setIsBuyerIdentified(true)}
              initialTab={buyerInitialTab}
            />
          )}

          {currentPortal === 'swipe' && (
            <ProductSwipeDeck
              onExit={() => handleSelectPortal('landing')}
              onQuickOrder={(item) => {
                const randomCode = 'RCH-' + Math.random().toString(36).substring(2, 6).toUpperCase();
                handleCreateOrder({
                  linkCode: randomCode,
                  customerName: 'Guest Buyer',
                  amount: item.price,
                  note: item.title,
                  quantity: 1,
                  terms: 'Protected with Reachr unboxing guarantee.',
                  createdAt: 'Just now',
                  businessName: item.sellerName,
                  businessVpa: item.sellerVpa,
                  status: 'pending',
                  deliveryStage: 0,
                  messages: [
                    {
                      id: `msg-${Date.now()}`,
                      sender: 'system',
                      senderName: 'Reachr Instant',
                      text: `Order created for ${item.title}.`,
                      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    },
                  ],
                });
                setBuyerInitialTab('checkout');
                handleSelectPortal('buyer');
                showToast(`Created order for ${item.title}`);
              }}
              showToast={showToast}
            />
          )}

          {currentPortal === 'seller' && (
            <>
              {!isSellerAuthenticated ? (
                <SellerLoginView
                  onSuccessLogin={handleSellerLoginSuccess}
                  onBackToHub={() => handleSelectPortal('landing')}
                />
              ) : (
                <SellerDashboard
                  orders={orders}
                  selectedOrderId={selectedOrderId}
                  onSelectOrder={setSelectedOrderId}
                  onCreateOrder={handleCreateOrder}
                  onUpdateOrder={handleUpdateOrder}
                  onSendMessage={handleSendMessage}
                  onSwitchToBuyer={(orderId) => {
                    setSelectedOrderId(orderId);
                    handleSelectPortal('buyer');
                  }}
                  onSignOut={handleSellerLogout}
                  onSwitchPortal={() => handleSelectPortal('landing')}
                  showToast={showToast}
                  currentSeller={currentSeller}
                  onOpenSubscription={() => setShowSubscriptionModal(true)}
                  theme={theme}
                  onToggleTheme={setTheme}
                />
              )}
            </>
          )}
        </Suspense>
      </main>

      {/* Subscription Upgrade Modal */}
      <Suspense fallback={null}>
        {showSubscriptionModal && (
          <SubscriptionModal
            isOpen={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
            currentTier={currentSeller.subscriptionTier || 'starter'}
            initialSelectedTier={selectedSubscriptionTier}
            onUpgradeSuccess={handleUpgradeSubscription}
          />
        )}
      </Suspense>

      {/* Slide-out Features Sidebar Drawer */}
      <Suspense fallback={null}>
        {showSidebarDrawer && (
          <SidebarDrawer
            isOpen={showSidebarDrawer}
            onClose={() => setShowSidebarDrawer(false)}
            onNavigate={(portal) => handleSelectPortal(portal)}
            theme={theme}
          />
        )}
      </Suspense>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-[var(--card)] border border-[var(--line)] text-[var(--ink)] text-xs font-semibold shadow-2xl backdrop-blur-md animate-fadeIn">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
