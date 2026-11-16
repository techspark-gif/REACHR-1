import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Package,
  BarChart3,
  Megaphone,
  Plus,
  Search,
  Filter,
  Copy,
  Share2,
  Clock,
  CheckCircle,
  Truck,
  MessageSquare,
  QrCode,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Send,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrderLink, OrderStatus, SellerCredentials, SubscriptionTier } from '../types';
import { SimpleSvgQr } from '../utils/qr';
import { sounds } from '../utils/audio';
import { SocialAdStudio } from './SocialAdStudio';

interface SellerDashboardProps {
  orders: OrderLink[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string | null) => void;
  onCreateOrder: (order: Partial<OrderLink>) => void;
  onUpdateOrder: (id: string, updates: Partial<OrderLink>) => void;
  onSendMessage: (orderId: string, text: string) => void;
  onSwitchToBuyer: (orderId: string) => void;
  onSignOut?: () => void;
  onSwitchPortal?: () => void;
  showToast: (msg: string) => void;
  currentSeller?: SellerCredentials;
  onOpenSubscription?: () => void;
  theme?: 'light' | 'purple';
  onToggleTheme?: (theme: 'light' | 'purple') => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  onCreateOrder,
  onUpdateOrder,
  onSendMessage,
  onSwitchToBuyer,
  onSignOut,
  onSwitchPortal,
  showToast,
  currentSeller,
  onOpenSubscription,
  theme = 'purple',
  onToggleTheme,
}) => {
  const tier: SubscriptionTier = currentSeller?.subscriptionTier || 'starter';

  // Taskbar Tabs: 'links' | 'orders' | 'analytics' | 'ads'
  const [activeTaskbarTab, setActiveTaskbarTab] = useState<'links' | 'orders' | 'analytics' | 'ads'>('links');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New Link Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [expiryHours, setExpiryHours] = useState('0');
  const [terms, setTerms] = useState('Standard courier dispatch in 2 business days. Exchange allowed within 7 days.');

  // QR Modal State
  const [activeQrOrder, setActiveQrOrder] = useState<OrderLink | null>(null);

  // Chat message input for selected order
  const [chatInput, setChatInput] = useState('');
  const [disputeProposal, setDisputeProposal] = useState('');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // Computed metrics
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'resolved');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const escrowPendingAmount = orders
    .filter((o) => o.status === 'pending' || (o.status === 'paid' && o.deliveryStage < 5))
    .reduce((sum, o) => sum + o.amount, 0);

  const customerMap: Record<string, number> = {};
  orders.forEach((o) => {
    customerMap[o.customerName] = (customerMap[o.customerName] || 0) + 1;
  });
  const uniqueCustomers = Object.keys(customerMap).length;
  const repeatCustomers = Object.values(customerMap).filter((c) => c > 1).length;
  const repeatRate = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0;

  // 7-Day Chart data
  const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const baseDayAmounts = [3200, 4800, 2400, 5600, 3900, 7200, totalRevenue > 0 ? totalRevenue : 4500];
  const maxDayAmount = Math.max(...baseDayAmounts, 1);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.linkCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !amount || Number(amount) <= 0 || !note.trim()) {
      showToast('Please fill in customer name, amount, and item details.');
      return;
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const linkCode = `RCH-${randomSuffix}`;
    const hours = Number(expiryHours);
    const expiresAt = hours > 0 ? new Date(Date.now() + hours * 3600000).toLocaleString('en-IN') : null;

    const newOrder: Partial<OrderLink> = {
      linkCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      amount: Number(amount),
      note: note.trim(),
      quantity: Math.max(1, quantity),
      terms: terms.trim(),
      createdAt: 'Just now',
      expiresAt,
      businessName: currentSeller?.businessName || "Meera's Handloom",
      businessVpa: currentSeller?.vpa || 'meera@upi',
      status: 'pending',
      deliveryStage: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'seller',
          senderName: currentSeller?.businessName || "Meera's Handloom",
          text: `Hi ${customerName.trim()}! Here is your custom payment link for ${note.trim()}.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    onCreateOrder(newOrder);

    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setAmount('');
    setNote('');
    setQuantity(1);

    sounds.playSuccess();
    showToast(`Payment link ${linkCode} created!`);
  };

  const handleCopyLink = (linkCode: string) => {
    const url = `${window.location.origin}${window.location.pathname}#pay=${linkCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast(`Link copied to clipboard!`);
      sounds.playReward();
    } else {
      showToast(`Share URL: ${url}`);
    }
  };

  const handleAdvanceDeliveryStage = (order: OrderLink) => {
    if (order.deliveryStage >= 5) return;
    const nextStage = order.deliveryStage + 1;
    const stageNames = ['Order Placed', 'Confirmed', 'Packed', 'Dispatched', 'Out for Delivery', 'Delivered'];

    const newMsg = {
      id: `sys-${Date.now()}`,
      sender: 'system' as const,
      senderName: 'Reachr Logistics',
      text: `Order status updated: ${stageNames[nextStage]}.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateOrder(order.id, {
      deliveryStage: nextStage,
      messages: [...order.messages, newMsg],
    });

    sounds.playMessage();
    showToast(`Stage advanced to: ${stageNames[nextStage]}`);
  };

  const handleMarkCashReceived = (order: OrderLink) => {
    const paidAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `sys-${Date.now()}`,
      sender: 'system' as const,
      senderName: 'Reachr Guard',
      text: `Cash payment of ₹${order.amount.toLocaleString('en-IN')} verified by seller.`,
      timestamp: paidAt,
    };

    onUpdateOrder(order.id, {
      status: 'paid',
      paymentMethod: {
        rail: 'cod',
        name: 'Cash on Delivery (Verified)',
        ref: `COD${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        paidAt,
      },
      messages: [...order.messages, newMsg],
    });

    sounds.playSuccess();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
    showToast('Payment verified! Order marked as paid.');
  };

  const handleSendSellerMessage = () => {
    if (!chatInput.trim() || !selectedOrder) return;
    onSendMessage(selectedOrder.id, chatInput.trim());
    setChatInput('');
    sounds.playMessage();
  };

  const handleProposeDisputeSolution = () => {
    if (!selectedOrder || !selectedOrder.dispute || !disputeProposal.trim()) {
      showToast('Please type a resolution proposal first.');
      return;
    }

    const d = selectedOrder.dispute;
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const updatedTimeline = [
      ...d.timeline,
      {
        stage: 2,
        title: 'Seller Proposed Solution',
        description: disputeProposal.trim(),
        timestamp,
        actor: 'seller' as const,
      },
    ];

    const updatedMessages = [
      ...selectedOrder.messages,
      {
        id: `prop-${Date.now()}`,
        sender: 'seller' as const,
        senderName: selectedOrder.businessName,
        text: `Official Proposal Submitted: ${disputeProposal.trim()}`,
        timestamp,
      },
    ];

    onUpdateOrder(selectedOrder.id, {
      dispute: {
        ...d,
        currentStage: 2,
        proposedSolution: disputeProposal.trim(),
        timeline: updatedTimeline,
      },
      messages: updatedMessages,
    });

    setDisputeProposal('');
    sounds.playSuccess();
    showToast('Proposal sent to customer! Awaiting their response.');
  };

  /* ── FOCUSED ORDER DETAIL MODAL / WORKSPACE ── */
  if (selectedOrder) {
    const shareUrl = `${window.location.origin}${window.location.pathname}#pay=${selectedOrder.linkCode}`;
    const waText = encodeURIComponent(
      `Hi ${selectedOrder.customerName}, here is your payment link for ₹${selectedOrder.amount.toLocaleString(
        'en-IN'
      )} (${selectedOrder.note}): ${shareUrl}`
    );
    const waLink = `https://wa.me/${(selectedOrder.customerPhone || '').replace(/\D/g, '')}?text=${waText}`;

    return (
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6 animate-fadeIn">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectOrder(null)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--card)] hover:bg-[var(--bg-warm)] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Seller Studio</span>
          </button>

          <button
            onClick={() => onSwitchToBuyer(selectedOrder.id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent)] hover:opacity-90 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>Open Buyer Checkout</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Order Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-warm)] text-[var(--mut)] text-xs font-mono font-semibold">
                <span>{selectedOrder.linkCode}</span>
                <span>·</span>
                <span>{selectedOrder.createdAt}</span>
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-[var(--ink)] mt-2">
                ₹{selectedOrder.amount.toLocaleString('en-IN')}
              </h2>
              <p className="text-sm text-[var(--mut)] mt-1">
                {selectedOrder.note} · For <b className="text-[var(--ink)]">{selectedOrder.customerName}</b>
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  selectedOrder.status === 'paid'
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : selectedOrder.status === 'disputed'
                    ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30 animate-pulse'
                    : selectedOrder.status === 'resolved'
                    ? 'bg-purple-500/15 text-purple-500 border border-purple-500/30'
                    : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                }`}
              >
                {selectedOrder.status === 'paid' ? 'Escrow Protected · Paid' : selectedOrder.status}
              </span>

              {selectedOrder.customerPhone && (
                <span className="text-xs text-[var(--mut)]">📱 {selectedOrder.customerPhone}</span>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Share Link & QR */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-sm space-y-4">
              <h3 className="font-display font-semibold text-base text-[var(--ink)]">1-Click Share</h3>

              {/* QR Box */}
              <div className="p-5 rounded-2xl bg-[var(--bg-warm)] border border-[var(--line)] flex flex-col items-center justify-center space-y-3">
                <SimpleSvgQr text={shareUrl} size={160} />
                <span className="text-[11px] text-[var(--mut)] text-center leading-relaxed">
                  Scan with any camera or UPI app to open checkout.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleCopyLink(selectedOrder.linkCode)}
                  className="py-3 px-3 rounded-2xl bg-[var(--bg-warm)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--ink)] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer text-center transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => handleMarkCashReceived(selectedOrder)}
                  className="w-full py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Mark Payment Received</span>
                </button>
              )}
            </div>

            {/* Terms Card */}
            <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-sm space-y-2">
              <span className="text-xs font-bold text-[var(--mut)] uppercase tracking-wider">Policy &amp; Terms</span>
              <p className="text-xs text-[var(--ink)] leading-relaxed bg-[var(--bg-warm)] p-3 rounded-xl border border-[var(--line)]">
                {selectedOrder.terms || 'Standard 7-day exchange window with doorstep inspection.'}
              </p>
            </div>
          </div>

          {/* Right Column: Fulfillment Tracker & Live Chat */}
          <div className="lg:col-span-7 space-y-5">
            {/* Fulfillment Tracker */}
            <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[var(--accent)]" />
                  <h3 className="font-display font-semibold text-base text-[var(--ink)]">Fulfillment Timeline</h3>
                </div>
                <span className="text-xs font-semibold text-[var(--accent)]">
                  Stage {selectedOrder.deliveryStage + 1} of 6
                </span>
              </div>

              {/* Steps Progress */}
              <div className="grid grid-cols-6 gap-1.5 py-2">
                {['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out', 'Delivered'].map((step, idx) => (
                  <div key={idx} className="text-center space-y-1">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        idx <= selectedOrder.deliveryStage ? 'bg-[var(--accent)] shadow-xs' : 'bg-[var(--line)]'
                      }`}
                    />
                    <div
                      className={`text-[10px] font-semibold truncate ${
                        idx === selectedOrder.deliveryStage ? 'text-[var(--accent)] font-bold' : 'text-[var(--mut)]'
                      }`}
                    >
                      {step}
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrder.deliveryStage < 5 && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleAdvanceDeliveryStage(selectedOrder)}
                    className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Advance to Next Stage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Contextual Order Conversation */}
            <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  <h3 className="font-display font-semibold text-base text-[var(--ink)]">Customer Messages</h3>
                </div>
                <span className="text-xs text-[var(--mut)]">{selectedOrder.customerName}</span>
              </div>

              {/* Chat Thread */}
              <div className="h-60 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-[var(--bg-warm)] border border-[var(--line)] scrollbar-none">
                {selectedOrder.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed space-y-1 ${
                      m.sender === 'seller'
                        ? 'ml-auto bg-[var(--accent)] text-white rounded-br-xs'
                        : m.sender === 'customer'
                        ? 'mr-auto bg-[var(--card)] text-[var(--ink)] border border-[var(--line)] rounded-bl-xs'
                        : 'mx-auto text-center bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}
                  >
                    <div>{m.text}</div>
                    <div className="text-[10px] opacity-75 flex items-center justify-between gap-3">
                      <span>{m.senderName}</span>
                      <span>{m.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendSellerMessage()}
                  placeholder="Type an update or reply..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-warm)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder-[var(--mut)] focus:outline-none focus:border-[var(--accent)]"
                />
                <button
                  onClick={handleSendSellerMessage}
                  className="px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN SELLER STUDIO WORKSPACE WITH MODERN FLOATING TASKBAR DOCK ── */
  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8 animate-fadeIn font-sans">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {currentSeller?.businessName?.charAt(0) || 'M'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl text-[var(--ink)]">
                {currentSeller?.businessName || "Meera's Handloom"}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Verified Merchant
              </span>
            </div>
            <p className="text-xs text-[var(--mut)] mt-0.5">
              UPI: <span className="font-mono text-[var(--ink)]">{currentSeller?.vpa || 'meera@upi'}</span> · Trust Score: <b className="text-emerald-500">99%</b>
            </p>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Theme switcher */}
          {onToggleTheme && (
            <button
              onClick={() => onToggleTheme(theme === 'purple' ? 'light' : 'purple')}
              className="p-2.5 rounded-2xl bg-[var(--bg-warm)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--ink)] cursor-pointer transition-colors"
              title={`Switch to ${theme === 'purple' ? 'Light' : 'Purple'} mode`}
            >
              {theme === 'purple' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </button>
          )}

          {/* Subscription Tier Badge */}
          <button
            onClick={onOpenSubscription}
            className="px-3.5 py-2 rounded-2xl bg-[var(--bg-warm)] hover:bg-[var(--line)] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{tier === 'elite' ? 'Elite Plan' : tier === 'pro' ? 'Pro Growth' : 'Starter Free'}</span>
          </button>

          {onSwitchPortal && (
            <button
              onClick={onSwitchPortal}
              className="px-3.5 py-2 rounded-2xl bg-[var(--bg-warm)] hover:bg-[var(--line)] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] transition-colors cursor-pointer"
            >
              Public Home
            </button>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* QUICK SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--mut)]">Total Volume</span>
          <div className="font-display font-bold text-2xl sm:text-3xl text-[var(--ink)] mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-0.5 block">100% Settled</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--mut)]">In Escrow</span>
          <div className="font-display font-bold text-2xl sm:text-3xl text-[var(--ink)] mt-1">
            ₹{escrowPendingAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[var(--accent)] font-semibold mt-0.5 block">Auto-releasing</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--mut)]">Active Orders</span>
          <div className="font-display font-bold text-2xl sm:text-3xl text-[var(--ink)] mt-1">
            {orders.length}
          </div>
          <span className="text-[11px] text-[var(--mut)] mt-0.5 block">Across India</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--mut)]">Repeat Buyers</span>
          <div className="font-display font-bold text-2xl sm:text-3xl text-[var(--ink)] mt-1">
            {repeatRate}%
          </div>
          <span className="text-[11px] text-purple-500 font-semibold mt-0.5 block">0% Disputes</span>
        </div>
      </div>

      {/* MODERN TASKBAR DOCK */}
      <div className="flex justify-center sticky top-4 z-30">
        <div className="p-1.5 rounded-full bg-[var(--card)] border border-[var(--line)] shadow-xl flex items-center gap-1.5 backdrop-blur-md max-w-full overflow-x-auto scrollbar-none transition-colors">
          <button
            onClick={() => {
              setActiveTaskbarTab('links');
              sounds.playMessage();
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTaskbarTab === 'links'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--bg-warm)]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Payment Links</span>
          </button>

          <button
            onClick={() => {
              setActiveTaskbarTab('orders');
              sounds.playMessage();
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTaskbarTab === 'orders'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--bg-warm)]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Orders Queue</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTaskbarTab === 'orders' ? 'bg-white/20 text-white' : 'bg-[var(--bg-warm)] text-[var(--ink)]'
              }`}
            >
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTaskbarTab('analytics');
              sounds.playMessage();
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTaskbarTab === 'analytics'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--bg-warm)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Revenue &amp; Velocity</span>
          </button>

          <button
            onClick={() => {
              setActiveTaskbarTab('ads');
              sounds.playMessage();
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTaskbarTab === 'ads'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--bg-warm)]'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Social Ad Studio</span>
          </button>
        </div>
      </div>

      {/* ── WORKSPACE 1: PAYMENT LINKS CREATOR & DIRECTORY ── */}
      {activeTaskbarTab === 'links' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          {/* Left Column: Link Creator */}
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-sm space-y-5 text-[var(--ink)] transition-colors">
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-[var(--ink)]">Create a Payment Link</h3>
              <p className="text-xs text-[var(--mut)]">
                Generate an escrow-protected UPI payment link to share with buyers.
              </p>
            </div>

            <form onSubmit={handleCreateLinkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--mut)] mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-warm)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder-[var(--mut)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--mut)] mb-1">WhatsApp / Phone (Optional)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-warm)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder-[var(--mut)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--mut)] mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 1250"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-warm)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder-[var(--mut)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                />

                {/* Preset Amount Chips */}
                <div className="flex gap-1.5 mt-2">
                  {[500, 1200, 2500, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-warm)] hover:bg-[var(--line)] text-[10px] font-semibold text-[var(--ink)] cursor-pointer transition-colors"
                    >
                      +₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--mut)] mb-1">Item Details &amp; Quantity *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Pure Cotton Handloom Saree"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-warm)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder-[var(--mut)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-16 px-3 py-2.5 rounded-xl bg-[var(--bg-warm)] border border-[var(--line)] text-xs text-[var(--ink)] text-center font-bold focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Protected Link</span>
              </button>
            </form>
          </div>

          {/* Right Column: Active Links Library */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-lg text-[var(--ink)]">Active Payment Links</h3>
                <p className="text-xs text-[var(--mut)]">{orders.length} links generated for your store</p>
              </div>
            </div>

            <div className="space-y-3">
              {orders.map((o) => {
                const shareUrl = `${window.location.origin}${window.location.pathname}#pay=${o.linkCode}`;
                const waLink = `https://wa.me/${(o.customerPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hi ${o.customerName}, here is your Reachr payment link for ₹${o.amount.toLocaleString('en-IN')}: ${shareUrl}`
                )}`;

                return (
                  <div
                    key={o.id}
                    className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-wrap items-center justify-between gap-4 hover:border-[var(--accent)] transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[var(--accent)]">{o.linkCode}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.status === 'paid'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : o.status === 'disputed'
                              ? 'bg-rose-500/15 text-rose-500'
                              : 'bg-amber-500/15 text-amber-500'
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-[var(--ink)]">{o.note}</div>
                      <div className="text-xs text-[var(--mut)]">
                        Customer: <b className="text-[var(--ink)]">{o.customerName}</b> · {o.createdAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-display font-bold text-lg text-[var(--ink)]">
                          ₹{o.amount.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(o.linkCode)}
                          className="p-2 rounded-xl bg-[var(--bg-warm)] hover:bg-[var(--line)] text-[var(--ink)] transition-colors cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 transition-colors cursor-pointer"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => setActiveQrOrder(o)}
                          className="p-2 rounded-xl bg-[var(--bg-warm)] hover:bg-[var(--line)] text-[var(--ink)] transition-colors cursor-pointer"
                          title="View QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectOrder(o.id)}
                          className="px-3 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-xs cursor-pointer transition-all shadow-xs"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── WORKSPACE 2: ORDERS & FULFILLMENT QUEUE ── */}
      {activeTaskbarTab === 'orders' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)]">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[var(--mut)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer, link code, or item..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-warm)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder-[var(--mut)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {['all', 'pending', 'paid', 'disputed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'bg-[var(--bg-warm)] text-[var(--mut)] hover:text-[var(--ink)]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="space-y-3">
            {filteredOrders.map((o) => (
              <div
                key={o.id}
                onClick={() => onSelectOrder(o.id)}
                className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs hover:border-[var(--accent)] transition-all cursor-pointer flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">{o.linkCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        o.status === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : o.status === 'disputed'
                          ? 'bg-rose-500/15 text-rose-500'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}
                    >
                      {o.status}
                    </span>
                    <span className="text-xs text-[var(--mut)]">Stage {o.deliveryStage + 1} of 6</span>
                  </div>
                  <h4 className="font-bold text-sm text-[var(--ink)]">{o.note}</h4>
                  <div className="text-xs text-[var(--mut)]">
                    Buyer: <b className="text-[var(--ink)]">{o.customerName}</b> · {o.createdAt}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-display font-bold text-xl text-[var(--ink)]">
                      ₹{o.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-[var(--mut)]">
                      {o.status === 'paid' ? 'Held in Escrow' : 'Awaiting UPI'}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-[var(--bg-warm)] text-[var(--ink)]">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WORKSPACE 3: REVENUE & VELOCITY ANALYTICS ── */}
      {activeTaskbarTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Velocity Bar Chart */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--ink)]">7-Day Revenue Velocity</h3>
                <p className="text-xs text-[var(--mut)]">Direct UPI sales volume across verified payment links</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[var(--mut)]">Weekly Volume</span>
                <div className="font-display font-bold text-xl text-emerald-500">₹32,600</div>
              </div>
            </div>

            {/* Custom SVG/CSS Bar Chart */}
            <div className="h-52 flex items-end justify-between gap-3 pt-6 border-b border-[var(--line)] pb-2">
              {chartDays.map((day, idx) => {
                const val = baseDayAmounts[idx];
                const heightPercent = Math.max(20, Math.round((val / maxDayAmount) * 100));

                return (
                  <div key={day} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5 group">
                    <span className="text-[10px] font-bold text-[var(--mut)] group-hover:text-[var(--ink)] transition-colors">
                      ₹{val.toLocaleString('en-IN')}
                    </span>
                    <div className="w-full flex-1 flex items-end px-1">
                      <div
                        className="w-full rounded-t-xl transition-all duration-500 ease-out group-hover:brightness-110 shadow-sm"
                        style={{
                          height: `${heightPercent}%`,
                          minHeight: '24px',
                          background:
                            idx === chartDays.length - 1
                              ? 'linear-gradient(to top, #a855f7, #ec4899)'
                              : 'linear-gradient(to top, #0a84ff, #2bc4b4)',
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--mut)]">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── WORKSPACE 4: SOCIAL AD STUDIO ── */}
      {activeTaskbarTab === 'ads' && (
        <div className="animate-fadeIn">
          <SocialAdStudio
            seller={currentSeller || {
              email: 'meera@handloom.in',
              businessName: "Meera's Handloom",
              ownerName: 'Meera R.',
              vpa: 'meera@upi',
              phone: '+91 98451 22390',
              isVerified: true,
              city: 'Bengaluru',
              category: 'Handloom',
              trustScore: 99,
              subscriptionTier: tier,
            }}
            onOpenSubscriptionModal={onOpenSubscription || (() => {})}
            showToast={showToast}
          />
        </div>
      )}

      {/* Scannable QR Code Popup Modal */}
      {activeQrOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--line)] shadow-2xl max-w-sm w-full text-center space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-[var(--ink)]">Scan to Pay</h4>
              <button
                onClick={() => setActiveQrOrder(null)}
                className="w-7 h-7 rounded-full bg-[var(--bg-warm)] flex items-center justify-center text-[var(--mut)] hover:text-[var(--ink)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-warm)] border border-[var(--line)] flex justify-center">
              <SimpleSvgQr
                text={`${window.location.origin}${window.location.pathname}#pay=${activeQrOrder.linkCode}`}
                size={180}
              />
            </div>

            <div className="space-y-1">
              <div className="font-bold text-base text-[var(--ink)]">
                ₹{activeQrOrder.amount.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-[var(--mut)]">{activeQrOrder.note}</div>
            </div>

            <button
              onClick={() => {
                handleCopyLink(activeQrOrder.linkCode);
                setActiveQrOrder(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Copy Payment URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
