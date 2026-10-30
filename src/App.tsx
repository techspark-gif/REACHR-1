/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AmbientBackground } from './components/AmbientBackground';
import { LandingView } from './components/LandingView';
import { SellerLoginView } from './components/SellerLoginView';
import { SellerDashboard } from './components/SellerDashboard';
import { BuyerPortal } from './components/BuyerPortal';
import { UniversalControlView } from './components/UniversalControlView';
import { OwnerLoginModal } from './components/OwnerLoginModal';
import { INITIAL_ORDERS, INITIAL_NOTIFICATIONS } from './data/initialData';
import { OrderLink, AppNotification, AppPortal } from './types';
import { sounds } from './utils/audio';

export default function App() {
  // Persistence state
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

  // Seller Authentication State
  const [isSellerAuthenticated, setIsSellerAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('reachr_seller_auth_v4') === 'true';
    } catch {
      return false;
    }
  });

  // Owner Authentication State (Universal Control is locked until owner logs in)
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('reachr_owner_auth_v4') === 'true';
    } catch {
      return false;
    }
  });

  const [showOwnerLoginModal, setShowOwnerLoginModal] = useState<boolean>(false);

  // Buyer identification state (set when order details are looked up or deep link opened)
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

  // Top-level Navigation Mode (Public Landing by default)
  const [currentPortal, setCurrentPortal] = useState<AppPortal>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('#buyer') || hash.includes('#pay=')) return 'buyer';
    if (hash.includes('#seller')) return 'seller';
    if (hash.includes('#universal') || hash.includes('#admin') || hash.includes('#owner')) {
      const isOwner = localStorage.getItem('reachr_owner_auth_v4') === 'true';
      if (isOwner) return 'universal-control';
    }
    return 'landing';
  });

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || 'l1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reachr_orders_v4', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reachr_notifications_v4', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Sync seller auth
  useEffect(() => {
    try {
      localStorage.setItem('reachr_seller_auth_v4', isSellerAuthenticated ? 'true' : 'false');
    } catch {}
  }, [isSellerAuthenticated]);

  // Sync owner auth
  useEffect(() => {
    try {
      localStorage.setItem('reachr_owner_auth_v4', isOwnerAuthenticated ? 'true' : 'false');
    } catch {}
  }, [isOwnerAuthenticated]);

  // Handle deep link hash e.g. #pay=RCH-4F2A or #seller or #admin
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
          showToast(`Loaded payment link for ${target.customerName}`);
          return;
        }
      }

      const lower = hash.toLowerCase();
      if (lower.startsWith('#buyer')) {
        setCurrentPortal('buyer');
      } else if (lower.startsWith('#seller')) {
        setCurrentPortal('seller');
      } else if (lower.startsWith('#universal') || lower.startsWith('#admin') || lower.startsWith('#owner')) {
        if (isOwnerAuthenticated) {
          setCurrentPortal('universal-control');
        } else {
          setShowOwnerLoginModal(true);
        }
      } else if (lower.startsWith('#home') || lower.startsWith('#landing')) {
        setCurrentPortal('landing');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [orders, isOwnerAuthenticated]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleSelectPortal = (portal: AppPortal) => {
    if (portal === 'universal-control') {
      if (!isOwnerAuthenticated) {
        setShowOwnerLoginModal(true);
        return;
      }
    }
    setCurrentPortal(portal);
    window.location.hash = portal === 'landing' ? '' : portal;
  };

  // Seller Auth Handlers
  const handleSellerLoginSuccess = () => {
    setIsSellerAuthenticated(true);
    showToast("Welcome back, Meera's Handloom!");
  };

  const handleSellerLogout = () => {
    setIsSellerAuthenticated(false);
    showToast('Signed out of Seller Studio.');
  };

  // Owner Auth Handlers (Universal Control)
  const handleOwnerLoginSuccess = () => {
    setIsOwnerAuthenticated(true);
    setCurrentPortal('universal-control');
    window.location.hash = 'admin';
    showToast('Authenticated as Platform Owner. Welcome to Universal Control.');
  };

  const handleOwnerLogout = () => {
    setIsOwnerAuthenticated(false);
    setCurrentPortal('landing');
    window.location.hash = '';
    showToast('Signed out of Platform Owner Console.');
  };

  const handleCreateOrder = (orderData: Partial<OrderLink>) => {
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
      businessName: "Meera's Handloom",
      businessVpa: 'meera@upi',
      status: 'pending',
      deliveryStage: 0,
      messages: orderData.messages || [],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newId);

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'payment',
      title: `Link Created: ${newOrder.linkCode}`,
      text: `Payment link created for ${newOrder.customerName} (₹${newOrder.amount.toLocaleString('en-IN')}).`,
      timestamp: 'Just now',
      read: false,
      linkCode: newOrder.linkCode,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdateOrder = (id: string, updates: Partial<OrderLink>) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        return { ...o, ...updates };
      })
    );
  };

  const handleSendMessage = (orderId: string, text: string) => {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const isSeller = currentPortal === 'seller';
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: isSeller ? ('seller' as const) : ('customer' as const),
      senderName: isSeller ? targetOrder.businessName : targetOrder.customerName,
      text,
      timestamp,
    };

    handleUpdateOrder(orderId, {
      messages: [...targetOrder.messages, newMsg],
    });
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  return (
    <div className="relative min-h-screen text-[#F6F7FF] flex flex-col justify-between selection:bg-pink-500 selection:text-white">
      {/* Dynamic Ambient Background */}
      <AmbientBackground />

      {/* Clean Public Navigation Header */}
      <div className="pt-3">
        <Header
          currentPortal={currentPortal}
          onSelectPortal={handleSelectPortal}
          notifications={notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          orders={orders}
          selectedOrderId={selectedOrderId}
          onSelectOrder={setSelectedOrderId}
          isSellerAuthenticated={isSellerAuthenticated}
          onSellerLogout={handleSellerLogout}
          isOwnerAuthenticated={isOwnerAuthenticated}
          onOwnerLogout={handleOwnerLogout}
          isBuyerIdentified={isBuyerIdentified}
        />
      </div>

      {/* Main Experience Router */}
      <main className="flex-1 pb-16">
        {currentPortal === 'landing' && (
          <LandingView
            onGoToSeller={() => handleSelectPortal('seller')}
            onGoToBuyer={() => handleSelectPortal('buyer')}
            onGoToTrustCenter={() => handleSelectPortal('buyer')}
            onOpenOwnerLogin={() => setShowOwnerLoginModal(true)}
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
              />
            )}
          </>
        )}

        {currentPortal === 'universal-control' && isOwnerAuthenticated && (
          <UniversalControlView
            orders={orders}
            onUpdateOrder={handleUpdateOrder}
            onSelectBuyerPortal={() => handleSelectPortal('buyer')}
            onSelectSellerPortal={() => handleSelectPortal('seller')}
            onSignOut={handleOwnerLogout}
            showToast={showToast}
          />
        )}
      </main>

      {/* Platform Owner Login Modal (Restricted access for madurimadu848@gmail.com) */}
      <OwnerLoginModal
        isOpen={showOwnerLoginModal}
        onClose={() => setShowOwnerLoginModal(false)}
        onSuccessLogin={handleOwnerLoginSuccess}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-bold shadow-2xl shadow-purple-500/40 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
