import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Send,
  Lock,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  Building2,
  Wallet,
  Calendar,
  Banknote,
  Scale,
  Search,
  ShoppingBag,
  Store,
  Compass,
  Truck,
  FileText,
  Tag,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrderLink, PaymentRail, AppNotification, BusinessProduct } from '../types';
import { INITIAL_BUSINESS, INITIAL_MERCHANTS, EXPLORE_CATALOG } from '../data/initialData';
import { sounds } from '../utils/audio';
import { TrustCenter } from './TrustCenter';

interface BuyerPortalProps {
  orders: OrderLink[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string | null) => void;
  onUpdateOrder: (id: string, updates: Partial<OrderLink>) => void;
  onSendMessage: (orderId: string, text: string) => void;
  onCreateOrder?: (orderData: Partial<OrderLink>) => void;
  notifications?: AppNotification[];
  onMarkNotificationsRead?: () => void;
  onSwitchPortal?: () => void;
  showToast: (msg: string) => void;
  isBuyerIdentified?: boolean;
  onBuyerIdentified?: () => void;
}

export const BuyerPortal: React.FC<BuyerPortalProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  onUpdateOrder,
  onSendMessage,
  onCreateOrder,
  notifications = [],
  onMarkNotificationsRead = () => {},
  onSwitchPortal,
  showToast,
  isBuyerIdentified = false,
  onBuyerIdentified,
}) => {
  const currentOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Active view tab in Buyer Experience
  const [activeBuyerSubTab, setActiveBuyerSubTab] = useState<'checkout' | 'explore' | 'track' | 'trust'>('checkout');

  // Order Lookup State
  const [orderQuery, setOrderQuery] = useState('');
  const [lookupFeedback, setLookupFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Explore Businesses & Products Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Payment method selection
  const [activeRail, setActiveRail] = useState<PaymentRail>('upi');
  const [selectedApp, setSelectedApp] = useState<string>('Google Pay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Card Form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Chat message
  const [buyerMsg, setBuyerMsg] = useState('');

  // Dispute creation modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Item not as described');
  const [disputeNotes, setDisputeNotes] = useState('');

  // Delivery Stages
  const deliveryStepLabels = ['Order Placed', 'Confirmed', 'Packed', 'Dispatched', 'Out for Delivery', 'Delivered'];

  // Handle Order Lookup by Order Number or Email ID
  const handleOrderLookup = (overrideQuery?: string) => {
    const raw = (overrideQuery !== undefined ? overrideQuery : orderQuery).trim();
    if (!raw) {
      setLookupFeedback({
        type: 'error',
        message: 'Please enter your order number or email ID to get your details.',
      });
      showToast('Please enter an order number or email ID.');
      return;
    }

    const q = raw.toLowerCase();
    // Match against linkCode (e.g. RCH-4F2A), order ID, customer name, phone, or simulated email
    const match = orders.find((o) => {
      if (o.linkCode.toLowerCase().includes(q) || q.includes(o.linkCode.toLowerCase())) return true;
      if (o.id.toLowerCase() === q) return true;
      if (o.customerName.toLowerCase().includes(q)) return true;
      if (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) return true;

      // Email ID heuristic matches for our demo users:
      if (q.includes('ananya') && o.customerName.toLowerCase().includes('ananya')) return true;
      if (q.includes('rohit') && o.customerName.toLowerCase().includes('rohit')) return true;
      if (q.includes('priya') && o.customerName.toLowerCase().includes('priya')) return true;
      if (q.includes('vikram') && o.customerName.toLowerCase().includes('vikram')) return true;
      if (q.includes('sneha') && o.customerName.toLowerCase().includes('sneha')) return true;
      if (q.includes('aditya') && o.customerName.toLowerCase().includes('aditya')) return true;

      return false;
    });

    if (match) {
      onSelectOrder(match.id);
      onBuyerIdentified?.();
      setActiveBuyerSubTab('checkout');
      setLookupFeedback({
        type: 'success',
        message: `Order ${match.linkCode} located for ${match.customerName} (${match.status.toUpperCase()} · ₹${match.amount.toLocaleString('en-IN')}).`,
      });
      sounds.playSuccess();
      showToast(`Found Order ${match.linkCode}!`);
    } else {
      setLookupFeedback({
        type: 'error',
        message: `No order found matching "${raw}". You can click any demo order chip below or explore verified businesses without entering email.`,
      });
      sounds.playMessage();
      showToast('No matching order found.');
    }
  };

  // Payment rails options
  const railsConfig: Record<
    PaymentRail,
    { name: string; icon: React.ReactNode; apps: string[]; hint: string; cta: string }
  > = {
    upi: {
      name: 'UPI Apps',
      icon: <span className="text-base">⚡</span>,
      apps: ['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM', 'Cred'],
      hint: `Pay directly to ${currentOrder?.businessVpa || 'merchant@upi'} via authorized NPCI gateway.`,
      cta: `Pay ₹${currentOrder?.amount.toLocaleString('en-IN') || 0} with UPI`,
    },
    card: {
      name: 'Cards',
      icon: <CreditCard className="w-4 h-4 text-pink-400" />,
      apps: ['RuPay Debit', 'Visa', 'Mastercard', 'Amex'],
      hint: 'Supports all major Indian and international debit/credit cards with 3D Secure OTP.',
      cta: `Pay ₹${currentOrder?.amount.toLocaleString('en-IN') || 0} with Card`,
    },
    netbanking: {
      name: 'Netbanking',
      icon: <Building2 className="w-4 h-4 text-cyan-400" />,
      apps: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak'],
      hint: 'Direct instant bank authorization with zero gateway surcharges.',
      cta: `Pay ₹${currentOrder?.amount.toLocaleString('en-IN') || 0} via Netbanking`,
    },
    wallet: {
      name: 'Wallets',
      icon: <Wallet className="w-4 h-4 text-amber-400" />,
      apps: ['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet', 'Mobikwik'],
      hint: 'One-click checkout from your linked digital wallet balance.',
      cta: `Pay ₹${currentOrder?.amount.toLocaleString('en-IN') || 0} from Wallet`,
    },
    emi: {
      name: 'No-Cost EMI',
      icon: <Calendar className="w-4 h-4 text-purple-400" />,
      apps: [
        `3 Months (₹${Math.ceil((currentOrder?.amount || 3000) / 3)}/mo)`,
        `6 Months (₹${Math.ceil((currentOrder?.amount || 3000) / 6)}/mo)`,
        `9 Months (₹${Math.ceil((currentOrder?.amount || 3000) / 9)}/mo)`,
      ],
      hint: 'Zero processing fee and 0% interest with credit card pre-approval.',
      cta: 'Confirm No-Cost EMI Plan',
    },
    cod: {
      name: 'Cash on Delivery',
      icon: <Banknote className="w-4 h-4 text-emerald-400" />,
      apps: ['Pay courier on doorstep arrival'],
      hint: 'Pay the delivery partner via cash or UPI QR upon inspecting the parcel.',
      cta: 'Place Cash on Delivery Order',
    },
  };

  const handleSimulatePayment = () => {
    if (!currentOrder) return;
    if (currentOrder.status === 'paid') {
      showToast('This order has already been marked paid!');
      return;
    }

    if (currentOrder.expiresAt && new Date(currentOrder.expiresAt).getTime() < Date.now()) {
      showToast('This payment link has expired.');
      return;
    }

    setIsProcessingPayment(true);
    sounds.playMessage();

    setTimeout(() => {
      setIsProcessingPayment(false);
      const paidAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const ref = `${activeRail.toUpperCase()}${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      const paymentEvent = {
        id: `sys-${Date.now()}`,
        sender: 'system' as const,
        senderName: 'Reachr Guard',
        text: `Payment of ₹${currentOrder.amount.toLocaleString('en-IN')} verified via ${selectedApp}. Reference: ${ref}. Held securely in escrow.`,
        timestamp: paidAt,
      };

      onUpdateOrder(currentOrder.id, {
        status: 'paid',
        paymentMethod: {
          rail: activeRail,
          name: `${railsConfig[activeRail].name} (${selectedApp})`,
          ref,
          paidAt,
        },
        messages: [...currentOrder.messages, paymentEvent],
      });

      sounds.playSuccess();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
      showToast(`Payment of ₹${currentOrder.amount.toLocaleString('en-IN')} confirmed!`);
    }, 1600);
  };

  const handleSendBuyerMessage = () => {
    if (!currentOrder || !buyerMsg.trim()) return;
    const msgText = buyerMsg.trim();
    onSendMessage(currentOrder.id, msgText);
    setBuyerMsg('');
    sounds.playMessage();

    setTimeout(() => {
      const autoResponses = [
        'Thanks for the update! We are taking care of your order.',
        "Noted! We'll make sure this is packed securely.",
        'Your order is in good hands, dispatching shortly!',
      ];
      const randomReply = autoResponses[Math.floor(Math.random() * autoResponses.length)];
      onUpdateOrder(currentOrder.id, {
        messages: [
          ...currentOrder.messages,
          {
            id: `msg-${Date.now()}`,
            sender: 'seller',
            senderName: currentOrder.businessName,
            text: randomReply,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      });
      sounds.playMessage();
    }, 1600);
  };

  const handleRaiseDispute = () => {
    if (!currentOrder) return;
    if (!disputeNotes.trim()) {
      showToast('Please provide a brief explanation of the problem.');
      return;
    }

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newDispute = {
      id: `disp-${Date.now()}`,
      raisedAt: timestamp,
      reason: disputeReason,
      details: disputeNotes.trim(),
      currentStage: 1 as const,
      timeline: [
        {
          stage: 1,
          title: 'Dispute Raised by Buyer',
          description: `${disputeReason}: ${disputeNotes.trim()}`,
          timestamp,
          actor: 'customer' as const,
        },
      ],
    };

    const newMessages = [
      ...currentOrder.messages,
      {
        id: `sys-${Date.now()}`,
        sender: 'system' as const,
        senderName: 'Reachr Guard',
        text: `Dispute opened: ${disputeReason}. Seller has been granted a 48-hour response window.`,
        timestamp,
      },
    ];

    onUpdateOrder(currentOrder.id, {
      status: 'disputed',
      dispute: newDispute,
      messages: newMessages,
    });

    setShowDisputeModal(false);
    setDisputeNotes('');
    sounds.playDispute();
    showToast('Dispute opened. Seller notified to provide resolution.');
  };

  const handleAcceptProposal = () => {
    if (!currentOrder || !currentOrder.dispute) return;
    const d = currentOrder.dispute;
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const updatedTimeline = [
      ...d.timeline,
      {
        stage: 4,
        title: 'Proposal Accepted by Buyer',
        description: `Customer agreed to: ${d.proposedSolution}`,
        timestamp,
        actor: 'customer' as const,
      },
    ];

    const updatedMessages = [
      ...currentOrder.messages,
      {
        id: `sys-${Date.now()}`,
        sender: 'system' as const,
        senderName: 'Reachr Guard',
        text: `Dispute amicably settled. Buyer accepted proposal: "${d.proposedSolution}".`,
        timestamp,
      },
    ];

    onUpdateOrder(currentOrder.id, {
      status: 'resolved',
      dispute: {
        ...d,
        currentStage: 4,
        resolutionSummary: `Buyer accepted proposal: ${d.proposedSolution}`,
        timeline: updatedTimeline,
      },
      messages: updatedMessages,
    });

    sounds.playSuccess();
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    showToast('Resolution accepted and dispute closed!');
  };

  const handleEscalateToReview = () => {
    if (!currentOrder || !currentOrder.dispute) return;
    const d = currentOrder.dispute;
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const updatedTimeline = [
      ...d.timeline,
      {
        stage: 3,
        title: 'Escalated to Reachr Neutral Review',
        description: 'Both parties requested neutral inspection of order chat and fulfillment evidence.',
        timestamp,
        actor: 'customer' as const,
      },
    ];

    const updatedMessages = [
      ...currentOrder.messages,
      {
        id: `sys-${Date.now()}`,
        sender: 'system' as const,
        senderName: 'Reachr Review Board',
        text: 'Escalation accepted. Reachr neutral mediator assigned to inspect proof vault.',
        timestamp,
      },
    ];

    onUpdateOrder(currentOrder.id, {
      dispute: {
        ...d,
        currentStage: 3,
        timeline: updatedTimeline,
      },
      messages: updatedMessages,
    });

    sounds.playMessage();
    showToast('Escalated to Stage 3: Reachr Neutral Review.');
  };

  // Handle buying an explored catalog product without entering email
  const handleBuyExploredProduct = (product: BusinessProduct) => {
    sounds.playReward();
    onBuyerIdentified?.();
    if (product.orderLinkId) {
      const existing = orders.find((o) => o.id === product.orderLinkId);
      if (existing) {
        onSelectOrder(existing.id);
        setActiveBuyerSubTab('checkout');
        showToast(`Loaded ${product.title} (${existing.linkCode})!`);
        return;
      }
    }

    if (onCreateOrder) {
      onCreateOrder({
        customerName: 'Guest Buyer (No Email Required)',
        amount: product.price,
        note: product.title,
        quantity: 1,
        terms: `${product.craftDetails} 100% Escrow protected with 7-day exchange guarantee.`,
        businessName: product.businessName,
        businessVpa: product.businessVpa,
      });
      setActiveBuyerSubTab('checkout');
      showToast(`Created checkout link for ${product.title}! Select any payment rail below.`);
    } else {
      setActiveBuyerSubTab('checkout');
      showToast(`Checkout ready for ${product.title}!`);
    }
  };

  // Categories for explore catalog
  const categories = ['All', 'Textiles & Handloom', 'Silver & Jewelry', 'Organic & Teas', 'Tribal Castings'];

  const filteredProducts = EXPLORE_CATALOG.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      !catalogSearch.trim() ||
      item.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.businessName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const trustScore = 96;

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* 1. BUYER PORTAL WELCOME & PRIMARY DUAL-GATEWAY */}
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0B1528]/95 backdrop-blur-xl border border-teal-500/25 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Buyer Portal
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Zero Login Required
              </span>
            </div>
            <h1 className="font-display font-black text-xl sm:text-2xl text-white">
              Customer Trust & Discovery Portal
            </h1>
            <p className="text-xs text-slate-300">
              Track your orders with verified courier ProofVault™, or explore registered businesses and artisanal products without entering an email.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onSwitchPortal && (
              <button
                onClick={onSwitchPortal}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Back to Home
              </button>
            )}
          </div>
        </div>

        {/* 2. THE DUAL ENTRY GATEWAY: ORDER NUMBER/EMAIL LOOKUP & EXPLORE BUSINESSES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* GATEWAY A: ORDER DETAILS LOOKUP */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#111A34]/95 border border-teal-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-teal-400">
                    Track Existing Order
                  </div>
                  <h2 className="font-display font-bold text-lg text-white">
                    Please enter your order number or email ID to get your details
                  </h2>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your unique order link code (e.g. <b className="text-white">RCH-4F2A</b>) or registered email ID to immediately access payment receipts, courier tracking, and seller chat.
              </p>

              {/* Input & Search Button */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleOrderLookup();
                }}
                className="flex flex-col sm:flex-row gap-2 pt-1"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={orderQuery}
                    onChange={(e) => {
                      setOrderQuery(e.target.value);
                      if (lookupFeedback) setLookupFeedback(null);
                    }}
                    placeholder="Enter order number (e.g. RCH-4F2A) or email ID..."
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  {orderQuery && (
                    <button
                      type="button"
                      onClick={() => setOrderQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Get Details</span>
                </button>
              </form>

              {/* Feedback Alert */}
              {lookupFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    lookupFeedback.type === 'success'
                      ? 'bg-teal-500/15 border border-teal-500/30 text-teal-300'
                      : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                  }`}
                >
                  {lookupFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0 text-teal-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  )}
                  <span>{lookupFeedback.message}</span>
                </div>
              )}

              {/* Clickable Quick Demo Order Chips */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Quick demo orders (click to load instantly):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {orders.slice(0, 4).map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setOrderQuery(o.linkCode);
                        handleOrderLookup(o.linkCode);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentOrder && currentOrder.id === o.id
                          ? 'bg-teal-500/25 border border-teal-400 text-teal-200 shadow-sm'
                          : 'bg-white/[0.04] border border-white/10 text-slate-300 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <span className="font-mono">{o.linkCode}</span>
                      <span className="text-[10px] opacity-75">({o.customerName.split(' ')[0]})</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase font-bold ${
                          o.status === 'paid'
                            ? 'bg-teal-500/30 text-teal-300'
                            : o.status === 'disputed'
                            ? 'bg-pink-500/30 text-pink-300'
                            : 'bg-amber-500/30 text-amber-300'
                        }`}
                      >
                        {o.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* GATEWAY B: EXPLORE BUSINESSES & THEIR PRODUCTS WITHOUT ENTERING EMAIL */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-[#181335] via-[#1F1742] to-[#111936] border border-purple-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400">
                    No Email Required
                  </div>
                  <h2 className="font-display font-bold text-lg text-white">
                    Explore businesses and their products without entering email
                  </h2>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Don’t have an order yet? Freely browse verified Indian businesses, artisanal textiles, silver jewelry, organic teas, and tribal artifacts with transparent pricing and Trust Passports.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>GSTIN Verified Sellers</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Escrow-Protected Checkout</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setActiveBuyerSubTab('explore');
                  sounds.playMessage();
                  showToast('Opened verified businesses & products catalog (no email required)!');
                }}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Businesses & Products (No Email Needed)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION SUB-TABS */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/10 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 p-1.5 bg-white/[0.04] border border-white/10 rounded-2xl shrink-0">
          <button
            onClick={() => {
              setActiveBuyerSubTab('explore');
              sounds.playMessage();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeBuyerSubTab === 'explore'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore Businesses & Products</span>
          </button>

          <button
            onClick={() => {
              setActiveBuyerSubTab('checkout');
              sounds.playMessage();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeBuyerSubTab === 'checkout'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Order Details & Pay</span>
          </button>

          <button
            onClick={() => {
              setActiveBuyerSubTab('track');
              sounds.playMessage();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeBuyerSubTab === 'track'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Track Order & ProofVault™</span>
          </button>

          <button
            onClick={() => {
              setActiveBuyerSubTab('trust');
              sounds.playMessage();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeBuyerSubTab === 'trust'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Trust Center & Passport</span>
          </button>
        </div>

        {/* Selected Order Indicator */}
        {currentOrder && (
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-300 shrink-0">
            <span className="text-slate-500">Active Order:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 font-bold text-teal-300">
              {currentOrder.linkCode}
            </span>
          </div>
        )}
      </div>

      {/* 4. VIEW A: EXPLORE BUSINESSES AND THEIR PRODUCTS (WITHOUT ENTERING EMAIL) */}
      {activeBuyerSubTab === 'explore' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Hero Explore Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#171433] via-[#191942] to-[#10223A] border border-purple-500/30 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Open Catalog · No Email Required
                </span>
                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mt-2">
                  Explore Verified Businesses & Artisanal Products
                </h2>
                <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
                  Shop directly with indigenous weavers, silversmiths, organic tea growers, and tribal artisans. All orders are secured with Reachr 4-Stage Escrow Protection.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/[0.04] p-3 rounded-2xl border border-white/10 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold">
                  4
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">4 Verified Businesses</div>
                  <div className="text-slate-400">9 Handcrafted Items</div>
                </div>
              </div>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search products, crafts, or businesses (e.g. Saree, Kundan, Tea, Dhokra)..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/25'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verified Business Directory Cards */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-purple-400" />
              <span>Verified Merchant Directory</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {INITIAL_MERCHANTS.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-[#0F162F] border border-white/10 hover:border-purple-500/40 transition-all space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{m.businessName}</div>
                      <div className="text-[11px] text-slate-400">{m.city}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {m.trustScore}/100
                    </span>
                  </div>

                  <div className="text-xs text-purple-300 font-medium">{m.category}</div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>GSTIN: {m.gstin.slice(0, 8)}...</span>
                    <span className="text-emerald-400 font-semibold">● Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Catalog Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-pink-400" />
                <span>Featured Products ({filteredProducts.length})</span>
              </h3>
              <span className="text-xs text-slate-400">Click any product to buy with Reachr Escrow</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-3xl bg-[#0F162F] border border-white/10 hover:border-pink-500/40 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                          {product.category}
                        </span>
                        {product.tags.slice(0, 1).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-teal-500/80 backdrop-blur-md text-slate-950"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-black bg-pink-600 text-white shadow-md">
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-teal-400 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5" />
                          <span>{product.businessName}</span>
                        </div>
                        <h4 className="font-display font-bold text-base text-white mt-1 group-hover:text-pink-300 transition-colors">
                          {product.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400">
                        {product.craftDetails}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 space-y-2">
                    <button
                      onClick={() => handleBuyExploredProduct(product)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Buy with Escrow (No Email Needed)</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveBuyerSubTab('trust');
                        sounds.playMessage();
                      }}
                      className="w-full py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Inspect Trust Passport</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW B: ORDER DETAILS & MULTI-RAIL CHECKOUT */}
      {activeBuyerSubTab === 'checkout' && currentOrder && (
        <div className="space-y-8 animate-fadeIn">
          {/* Order Details Header */}
          <div
            className={`p-6 md:p-8 rounded-3xl border shadow-2xl relative overflow-hidden transition-all duration-300 ${
              currentOrder.status === 'paid'
                ? 'bg-gradient-to-r from-[#0C3029] via-[#0E2833] to-[#141C38] border-teal-500/30'
                : currentOrder.status === 'disputed'
                ? 'bg-gradient-to-r from-[#3C1126] via-[#2A1138] to-[#141A3B] border-pink-500/30'
                : currentOrder.status === 'resolved'
                ? 'bg-gradient-to-r from-[#21194A] via-[#1A2548] to-[#121936] border-purple-500/30'
                : 'bg-gradient-to-r from-[#312010] via-[#2A1728] to-[#121A38] border-amber-500/30'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  <span>{currentOrder.businessName}</span>
                  <span>·</span>
                  <span className="font-mono bg-white/10 px-2 py-0.5 rounded-md text-teal-300">
                    {currentOrder.linkCode}
                  </span>
                </div>
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white">
                  ₹{currentOrder.amount.toLocaleString('en-IN')}
                </h1>
                <p className="text-slate-300 text-sm">
                  {currentOrder.note} {currentOrder.quantity > 1 ? `(Qty: ${currentOrder.quantity})` : ''} · For{' '}
                  <b className="text-white">{currentOrder.customerName}</b>
                </p>
                <div className="text-xs text-slate-400 pt-1">
                  Terms: {currentOrder.terms}
                </div>
              </div>

              <div className="text-right space-y-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    currentOrder.status === 'paid'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : currentOrder.status === 'disputed'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30 animate-pulse'
                      : currentOrder.status === 'resolved'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  ● {currentOrder.status}
                </span>
                {currentOrder.paymentMethod && (
                  <div className="text-xs text-slate-300 font-mono">
                    {currentOrder.paymentMethod.name} · Ref: {currentOrder.paymentMethod.ref}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reachr Trust Score Badge */}
          <div className="p-5 rounded-2xl bg-[#121936] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center font-display font-extrabold text-2xl text-teal-300 font-mono">
                {trustScore}
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Reachr Verified Merchant Score</span>
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-xs text-slate-400">
                  Evaluated on 48 completed deliveries, 4.2h resolution speed, and verified GSTIN credentials.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>4-Stage Dispute Escrow Shield Active</span>
            </div>
          </div>

          {/* Multi-Rail Checkout Card (Visible if status is pending) */}
          {currentOrder.status === 'pending' && (
            <div className="p-6 md:p-8 rounded-3xl bg-[#121936] border border-white/10 shadow-2xl space-y-6">
              <div className="space-y-1">
                <h2 className="font-display font-extrabold text-2xl text-white">Choose Your Payment Rail</h2>
                <p className="text-xs text-slate-400">
                  Select any authorized Indian payment rail. Transactions are simulated in real-time.
                </p>
              </div>

              {/* Payment Rail Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {(Object.keys(railsConfig) as PaymentRail[]).map((rail) => {
                  const cfg = railsConfig[rail];
                  const isSelected = activeRail === rail;
                  return (
                    <button
                      key={rail}
                      onClick={() => {
                        setActiveRail(rail);
                        setSelectedApp(cfg.apps[0]);
                        sounds.playMessage();
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-violet-600 to-pink-600 text-white border-transparent shadow-lg shadow-pink-500/20'
                          : 'bg-white/[0.03] text-slate-300 border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                      }`}
                    >
                      {cfg.icon}
                      <span className="whitespace-nowrap">{cfg.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-App Selector for the Active Rail */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="text-xs text-slate-400 leading-relaxed">{railsConfig[activeRail].hint}</div>

                {/* If Cards, show simple mock card fields */}
                {activeRail === 'card' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• 8891 (RuPay / Visa)"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Expiry / CVV</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-2 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs font-mono text-center focus:outline-none focus:border-pink-500"
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-2 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs font-mono text-center focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {railsConfig[activeRail].apps.map((app) => (
                      <button
                        key={app}
                        onClick={() => {
                          setSelectedApp(app);
                          sounds.playMessage();
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedApp === app
                            ? 'bg-[#F6D365] text-[#12082B] shadow-md shadow-amber-400/20'
                            : 'bg-white/[0.05] text-slate-300 border border-white/10 hover:bg-white/[0.1]'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary Pay Button */}
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessingPayment}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:opacity-95 text-[#0A1728] font-extrabold text-base shadow-xl shadow-teal-500/25 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Simulating Secure {railsConfig[activeRail].name} Authorization...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {railsConfig[activeRail].cta} · {selectedApp}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Active Dispute Resolution Card (If active) */}
          {currentOrder.dispute && (
            <div className="p-6 md:p-8 rounded-3xl bg-pink-950/30 border border-pink-500/40 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                    Active 4-Stage Dispute Resolution
                  </div>
                  <h2 className="font-display font-extrabold text-2xl text-white mt-1">
                    Reason: {currentOrder.dispute.reason}
                  </h2>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-extrabold uppercase">
                  Stage {currentOrder.dispute.currentStage} of 4
                </span>
              </div>

              {/* 4 Steps visualizer */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                {['1. Raised', '2. Seller Replies', '3. Reachr Review', '4. Resolved'].map((step, idx) => {
                  const isPast =
                    idx + 1 < currentOrder.dispute!.currentStage || currentOrder.dispute!.currentStage === 4;
                  const isCurrent =
                    idx + 1 === currentOrder.dispute!.currentStage && currentOrder.dispute!.currentStage !== 4;
                  return (
                    <div
                      key={step}
                      className={`py-2.5 px-1 rounded-xl transition-all ${
                        isPast
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : isCurrent
                          ? 'bg-gradient-to-r from-pink-600 to-amber-600 text-white shadow-md'
                          : 'bg-white/[0.03] text-slate-500'
                      }`}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>

              {/* Timeline Events */}
              <div className="space-y-2 border-l-2 border-pink-500/40 pl-4 py-2">
                {currentOrder.dispute.timeline.map((evt, idx) => (
                  <div key={idx} className="space-y-0.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-pink-300">
                      <span>{evt.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{evt.timestamp}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{evt.description}</p>
                  </div>
                ))}
              </div>

              {/* Actions for Buyer based on dispute stage */}
              {currentOrder.dispute.currentStage === 2 && currentOrder.dispute.proposedSolution && (
                <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400 uppercase font-semibold">Seller’s Official Proposal:</div>
                    <div className="text-sm font-semibold text-white bg-white/[0.04] p-3 rounded-xl border border-white/10">
                      "{currentOrder.dispute.proposedSolution}"
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleAcceptProposal}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer hover:opacity-95"
                    >
                      Accept Proposal & Close Dispute
                    </button>
                    <button
                      onClick={handleEscalateToReview}
                      className="px-6 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Escalate to Reachr Neutral Review
                    </button>
                  </div>
                </div>
              )}

              {currentOrder.dispute.currentStage === 3 && (
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
                  Reachr neutral reviewer is inspecting the order thread, courier proof, and seller timeline. Both parties
                  retain full evidence visibility.
                </div>
              )}

              {currentOrder.dispute.currentStage === 4 && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed font-semibold">
                  ✓ Dispute settled. Mutual satisfaction recorded in ProofVault.
                </div>
              )}
            </div>
          )}

          {/* Action to Raise Dispute if order is paid and no dispute exists */}
          {currentOrder.status === 'paid' && !currentOrder.dispute && (
            <div className="p-6 rounded-3xl bg-[#121936] border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-white">Something not right with this order?</h3>
                <p className="text-xs text-slate-400">
                  You are protected by Reachr's 4-Stage FairResolve protocol. Settle issues without stressful arguments.
                </p>
              </div>
              <button
                onClick={() => setShowDisputeModal(true)}
                className="px-5 py-2.5 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-pink-200 font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Scale className="w-4 h-4" />
                <span>Raise a Dispute</span>
              </button>
            </div>
          )}

          {/* Order Communication Chat */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-pink-400" />
                  <span>Order Communication</span>
                </h3>
                <p className="text-xs text-slate-400">Talk directly with {currentOrder.businessName}.</p>
              </div>
              <span className="text-xs text-teal-400 font-semibold">Live in-context</span>
            </div>

            {/* Chat thread */}
            <div className="h-64 overflow-y-auto space-y-2.5 p-4 rounded-2xl bg-black/20 border border-white/5 scrollbar-none">
              {currentOrder.messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed space-y-1 ${
                    m.sender === 'customer'
                      ? 'ml-auto bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-xs'
                      : m.sender === 'seller'
                      ? 'mr-auto bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-bl-xs'
                      : 'mx-auto text-center bg-amber-500/15 text-amber-300 border border-amber-500/20'
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

            {/* Quick Message Suggestions */}
            <div className="flex flex-wrap gap-2 pt-1">
              {['Is this packed yet?', 'Can you share parcel tracking?', 'Thank you for the prompt dispatch!'].map(
                (snippet) => (
                  <button
                    key={snippet}
                    onClick={() => {
                      onSendMessage(currentOrder.id, snippet);
                      sounds.playMessage();
                    }}
                    className="text-[11px] px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-colors cursor-pointer"
                  >
                    + "{snippet}"
                  </button>
                )
              )}
            </div>

            {/* Message Input Box */}
            <div className="flex gap-2">
              <input
                type="text"
                value={buyerMsg}
                onChange={(e) => setBuyerMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendBuyerMessage()}
                placeholder={`Message ${currentOrder.businessName}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={handleSendBuyerMessage}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. VIEW C: TRACK ORDER & PROOFVAULT™ */}
      {activeBuyerSubTab === 'track' && currentOrder && (
        <div className="space-y-8 animate-fadeIn">
          {/* Tracking Header */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#111A34] border border-teal-500/30 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Live Courier Tracking
                </span>
                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mt-2">
                  Order {currentOrder.linkCode} · {currentOrder.businessName}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Recipient: <b className="text-white">{currentOrder.customerName}</b> ({currentOrder.customerPhone || '+91 98451 22390'})
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Current Status:</div>
                <div className="text-base font-extrabold text-emerald-400 font-mono">
                  {deliveryStepLabels[currentOrder.deliveryStage] || 'Order Placed'}
                </div>
              </div>
            </div>

            {/* 6-Stage Progress Bar */}
            <div className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {deliveryStepLabels.map((lbl, idx) => {
                  const isDone = idx <= currentOrder.deliveryStage;
                  const isCurrent = idx === currentOrder.deliveryStage;
                  return (
                    <div
                      key={lbl}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black border-transparent shadow-lg shadow-teal-500/25'
                          : isDone
                          ? 'bg-teal-500/15 border-teal-500/30 text-teal-300 font-semibold'
                          : 'bg-white/[0.02] border-white/10 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider font-bold">Step 0{idx + 1}</div>
                      <div className="text-xs mt-1 truncate">{lbl}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ProofVault™ Section */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#0F162F] border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-400" />
                  <span>ProofVault™ Geotagged Delivery Evidence</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Cryptographically secured fulfillment proof uploaded prior to escrow release.
                </p>
              </div>
              <span className="text-xs text-teal-300 bg-teal-500/15 px-3 py-1 rounded-full border border-teal-500/30 font-semibold">
                Verified Vault
              </span>
            </div>

            {currentOrder.deliveryProof ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="rounded-2xl overflow-hidden border border-white/10 max-h-64 bg-slate-900">
                  <img
                    src={currentOrder.deliveryProof.url}
                    alt={currentOrder.deliveryProof.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/5 space-y-2">
                    <div className="text-xs text-slate-400">Document Name:</div>
                    <div className="text-xs font-mono font-bold text-white break-all">
                      {currentOrder.deliveryProof.name}
                    </div>
                    <div className="text-xs text-slate-400 pt-1">Recorded At:</div>
                    <div className="text-xs text-emerald-400 font-semibold">
                      {currentOrder.deliveryProof.timestamp}
                    </div>
                    {currentOrder.deliveryProof.notes && (
                      <div className="text-xs text-slate-300 italic pt-1">
                        "{currentOrder.deliveryProof.notes}"
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-teal-300 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>OTP Verified Signature Captured</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 text-center space-y-2">
                <Truck className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-white">Parcel currently in transit</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  The delivery partner will upload geotagged doorstep inspection photo and OTP confirmation here upon delivery.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. VIEW D: TRUST CENTER & MERCHANT PASSPORT */}
      {activeBuyerSubTab === 'trust' && (
        <div className="pt-2">
          <TrustCenter
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={onSelectOrder}
            onUpdateOrder={onUpdateOrder}
            notifications={notifications}
            onMarkNotificationsRead={onMarkNotificationsRead}
            showToast={showToast}
          />
        </div>
      )}

      {/* DISPUTE CREATION MODAL */}
      {showDisputeModal && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0F1630] border border-pink-500/40 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-pink-400" />
                <span>Raise Order Dispute</span>
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Reachr dispute protection initiates a structured 48-hour response window for the merchant to address your
              issue with an exchange or refund proposal.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reason for Dispute</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs focus:outline-none focus:border-pink-500"
                >
                  <option value="Item not as described" className="bg-[#0F1630]">
                    Item not as described
                  </option>
                  <option value="Item not received" className="bg-[#0F1630]">
                    Item not received / Missing in transit
                  </option>
                  <option value="Item damaged" className="bg-[#0F1630]">
                    Item damaged or defective
                  </option>
                  <option value="Size or fit mismatch" className="bg-[#0F1630]">
                    Size or fit mismatch
                  </option>
                  <option value="Wrong quantity or parts" className="bg-[#0F1630]">
                    Wrong quantity or missing parts
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Describe what went wrong *
                </label>
                <textarea
                  rows={3}
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  placeholder="Provide concrete details: what arrived, when did you unpack it, and what resolution you expect..."
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs leading-relaxed focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseDispute}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-pink-500/25 transition-all cursor-pointer"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
