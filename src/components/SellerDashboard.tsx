import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Copy,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  MessageSquare,
  QrCode,
  DollarSign,
  TrendingUp,
  Users,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Send,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrderLink, OrderStatus, PaymentRail, SellerCredentials } from '../types';
import { SimpleSvgQr } from '../utils/qr';
import { sounds } from '../utils/audio';

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
}) => {
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

  // Chat message input for selected order
  const [chatInput, setChatInput] = useState('');

  // Dispute proposal input
  const [disputeProposal, setDisputeProposal] = useState('');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // Compute stats
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'resolved');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);

  const customerMap: Record<string, number> = {};
  orders.forEach((o) => {
    customerMap[o.customerName] = (customerMap[o.customerName] || 0) + 1;
  });
  const uniqueCustomers = Object.keys(customerMap).length;
  const repeatCustomers = Object.values(customerMap).filter((c) => c > 1).length;
  const repeatRate = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0;
  const openDisputes = orders.filter((o) => o.status === 'disputed').length;

  // 7-Day Chart data
  const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const baseDayAmounts = [3200, 4800, 2400, 5600, 3900, 7200, totalRevenue > 0 ? totalRevenue : 1200];
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
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast(`Payment Link ${linkCode} created successfully!`);
  };

  const handleCopyLink = (linkCode: string) => {
    const url = `${window.location.origin}${window.location.pathname}#pay=${linkCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast(`Link copied: ${url}`);
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
    showToast(`Fulfillment stage advanced to: ${stageNames[nextStage]}`);
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
    showToast('Cash marked received! Order completed.');
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
    showToast('Proposal sent to customer! Awaiting their acceptance.');
  };

  // If an order is selected, show its full detail drawer / workspace
  if (selectedOrder) {
    const shareUrl = `${window.location.origin}${window.location.pathname}#pay=${selectedOrder.linkCode}`;
    const waText = encodeURIComponent(
      `Hi ${selectedOrder.customerName}, here is your payment request for ₹${selectedOrder.amount.toLocaleString(
        'en-IN'
      )} (${selectedOrder.note}): ${shareUrl}`
    );
    const waLink = `https://wa.me/${(selectedOrder.customerPhone || '').replace(/\D/g, '')}?text=${waText}`;

    return (
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectOrder(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Links</span>
          </button>

          <button
            onClick={() => onSwitchToBuyer(selectedOrder.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-bold shadow-md shadow-violet-500/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <span>Open as Buyer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Order Hero Banner */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
            selectedOrder.status === 'paid'
              ? 'bg-gradient-to-r from-[#0E3A32] via-[#0D2D36] to-[#122046] border-teal-500/30'
              : selectedOrder.status === 'disputed'
              ? 'bg-gradient-to-r from-[#3C1126] via-[#2A1138] to-[#141A3B] border-pink-500/30'
              : selectedOrder.status === 'resolved'
              ? 'bg-gradient-to-r from-[#21194A] via-[#1A2548] to-[#121936] border-purple-500/30'
              : 'bg-gradient-to-r from-[#38260E] via-[#2D1B28] to-[#121A38] border-amber-500/30'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-300">
                {selectedOrder.businessName} · {selectedOrder.linkCode}
              </span>
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white mt-1">
                ₹{selectedOrder.amount.toLocaleString('en-IN')}
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                {selectedOrder.note} · For <span className="font-semibold text-white">{selectedOrder.customerName}</span>
              </p>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  selectedOrder.status === 'paid'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : selectedOrder.status === 'disputed'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30 animate-pulse'
                    : selectedOrder.status === 'resolved'
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                ● {selectedOrder.status}
              </span>
              {selectedOrder.paymentMethod && (
                <div className="text-xs text-slate-300 mt-2 font-mono">
                  {selectedOrder.paymentMethod.name} · Ref: {selectedOrder.paymentMethod.ref}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Sharing & QR Code (Left) + Fulfillment & Chat (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: QR Code & Sharing Options */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121936] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white">Instant Sharing & QR</h3>
                <span className="text-xs text-slate-400 font-mono">{selectedOrder.linkCode}</span>
              </div>

              {/* Scannable SVG QR Card */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <SimpleSvgQr text={shareUrl} size={170} />
                <span className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Scan with any camera or UPI scanner to launch checkout.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleCopyLink(selectedOrder.linkCode)}
                  className="py-3 px-3 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* COD Action if pending */}
              {selectedOrder.status === 'pending' && (
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleMarkCashReceived(selectedOrder)}
                    className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Mark Cash / Offline Payment Received</span>
                  </button>
                </div>
              )}
            </div>

            {/* Terms and conditions info */}
            <div className="p-6 rounded-3xl bg-[#121936] border border-white/10 space-y-3">
              <h4 className="font-display font-bold text-sm text-white">Terms & Return Policy</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                {selectedOrder.terms || 'Standard 7-day exchange window. Delivered via express surface courier.'}
              </p>
              {selectedOrder.expiresAt && (
                <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expires: {selectedOrder.expiresAt}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Fulfillment Tracker, Dispute Resolution, and Chat */}
          <div className="lg:col-span-7 space-y-6">
            {/* Fulfillment Tracker */}
            <div className="p-6 rounded-3xl bg-[#121936] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-teal-400" />
                  <span>Fulfillment Pipeline</span>
                </h3>
                <span className="text-xs text-teal-400 font-semibold">
                  Stage {selectedOrder.deliveryStage + 1} of 6
                </span>
              </div>

              {/* Step indicator */}
              <div className="grid grid-cols-6 gap-1.5 py-2">
                {['Placed', 'Confirmed', 'Packed', 'Dispatched', 'Out', 'Delivered'].map((step, idx) => (
                  <div key={idx} className="text-center space-y-1">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        idx <= selectedOrder.deliveryStage
                          ? 'bg-gradient-to-r from-teal-400 to-cyan-400 shadow-sm shadow-teal-500/30'
                          : 'bg-white/10'
                      }`}
                    />
                    <div
                      className={`text-[10px] font-semibold truncate ${
                        idx === selectedOrder.deliveryStage ? 'text-teal-300' : 'text-slate-500'
                      }`}
                    >
                      {step}
                    </div>
                  </div>
                ))}
              </div>

              {/* Advance Stage CTA */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Current:{' '}
                  <b className="text-white">
                    {
                      ['Order Placed', 'Confirmed', 'Packed', 'Dispatched', 'Out for Delivery', 'Delivered'][
                        selectedOrder.deliveryStage
                      ]
                    }
                  </b>
                </span>
                {selectedOrder.deliveryStage < 5 && (
                  <button
                    onClick={() => handleAdvanceDeliveryStage(selectedOrder)}
                    className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Advance Stage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Dispute Resolution Module (if active) */}
            {selectedOrder.dispute && (
              <div className="p-6 rounded-3xl bg-pink-950/30 border border-pink-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-pink-400" />
                    <h3 className="font-display font-bold text-lg text-white">
                      Dispute: {selectedOrder.dispute.reason}
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 font-bold uppercase">
                    Stage {selectedOrder.dispute.currentStage} of 4
                  </span>
                </div>

                {/* Dispute Timeline */}
                <div className="space-y-2 py-2">
                  {selectedOrder.dispute.timeline.map((event, i) => (
                    <div key={i} className="text-xs p-3 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                      <div className="flex items-center justify-between font-bold text-pink-300">
                        <span>{event.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{event.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{event.description}</p>
                    </div>
                  ))}
                </div>

                {/* Seller Proposal Box (If stage 1) */}
                {selectedOrder.dispute.currentStage === 1 && (
                  <div className="pt-2 space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-pink-300">
                      Submit Your Official Proposal
                    </label>
                    <input
                      type="text"
                      value={disputeProposal}
                      onChange={(e) => setDisputeProposal(e.target.value)}
                      placeholder="e.g. Free replacement in Size 10 UK, or 35% partial goodwill refund"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
                    />
                    <button
                      onClick={handleProposeDisputeSolution}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Send Proposal to Customer
                    </button>
                  </div>
                )}

                {selectedOrder.dispute.currentStage === 2 && (
                  <div className="text-xs text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    Awaiting customer review of your proposal: "{selectedOrder.dispute.proposedSolution}"
                  </div>
                )}

                {selectedOrder.dispute.currentStage === 4 && (
                  <div className="text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    Dispute resolved: {selectedOrder.dispute.resolutionSummary}
                  </div>
                )}
              </div>
            )}

            {/* Contextual Order Chat */}
            <div className="p-6 rounded-3xl bg-[#121936] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-pink-400" />
                  <span>Order Conversation</span>
                </h3>
                <span className="text-xs text-slate-400">Attached to order</span>
              </div>

              <div className="h-64 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-black/20 border border-white/5 scrollbar-none">
                {selectedOrder.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed space-y-1 ${
                      m.sender === 'seller'
                        ? 'ml-auto bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-br-xs'
                        : m.sender === 'customer'
                        ? 'mr-auto bg-[#1C2648] text-slate-200 border border-white/10 rounded-bl-xs'
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

              {/* Message Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendSellerMessage()}
                  placeholder="Send reply to customer..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
                />
                <button
                  onClick={handleSendSellerMessage}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Command Center with KPI stats, Revenue chart, Link Creator & Link Library
  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Merchant Profile & Authentication Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0F1528]/90 backdrop-blur-xl border border-pink-500/25 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-pink-500/25">
            {(currentSeller?.businessName || "M").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white">
                {currentSeller?.businessName || "Meera's Handloom"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Verified Merchant
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="font-mono text-pink-300">
                {currentSeller?.vpa || "meera@upi"}
              </span>
              <span>•</span>
              <span className="text-slate-400">
                {currentSeller?.city || (currentSeller?.ownerName ? `Owner: ${currentSeller.ownerName}` : "GSTIN: 29AABCU9603R1ZM")}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                {currentSeller?.trustScore ? `${currentSeller.trustScore}% Trust Score` : "99.2% Positive Trust"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onSwitchPortal && (
            <button
              onClick={onSwitchPortal}
              className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Switch Portal
            </button>
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. TOP STATS STRIP WITH ASYMMETRICAL ORGANIC RADII */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          className="p-5 text-white shadow-xl transition-transform hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, #7557ff, #a855f7)',
            borderRadius: '28px 28px 60px 28px',
          }}
        >
          <small className="opacity-90 font-bold text-xs uppercase tracking-wider block">Paying Customers</small>
          <div className="font-display font-extrabold text-4xl mt-1 font-mono">{uniqueCustomers}</div>
        </div>

        <div
          className="p-5 shadow-xl transition-transform hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, #00bfa6, #168be5)',
            borderRadius: '28px 60px 28px 28px',
            color: '#12082b',
          }}
        >
          <small className="opacity-90 font-bold text-xs uppercase tracking-wider block">Received</small>
          <div className="font-display font-extrabold text-4xl mt-1 font-mono">₹{totalRevenue.toLocaleString('en-IN')}</div>
        </div>

        <div
          className="p-5 shadow-xl transition-transform hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, #e8b94e, #ff8d43)',
            borderRadius: '60px 28px 28px 28px',
            color: '#12082b',
          }}
        >
          <small className="opacity-90 font-bold text-xs uppercase tracking-wider block">Repeat Customers</small>
          <div className="font-display font-extrabold text-4xl mt-1 font-mono">{repeatRate}%</div>
        </div>

        <div
          className="p-5 text-white shadow-xl transition-transform hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, #ff4f87, #ff8b65)',
            borderRadius: '28px 28px 28px 60px',
          }}
        >
          <small className="opacity-90 font-bold text-xs uppercase tracking-wider block">Open Disputes</small>
          <div className="font-display font-extrabold text-4xl mt-1 font-mono">{openDisputes}</div>
        </div>
      </div>

      {/* 2. REVENUE VELOCITY CHART */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-xl text-white">Money in, last 7 days</h3>
            <p className="text-xs text-slate-400">Earlier days are sample data. Today grows dynamically as buyers pay.</p>
          </div>
          <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20">
            Peak Day: ₹{Math.max(...baseDayAmounts).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Bar chart */}
        <div className="pt-6 flex items-end gap-3 h-44 sm:h-52 w-full">
          {baseDayAmounts.map((amt, idx) => {
            const heightPercent = Math.max(12, Math.round((amt / maxDayAmount) * 100));
            const isToday = idx === 6;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div
                  className="w-full rounded-t-xl transition-all duration-500 group-hover:scale-y-105 origin-bottom relative cursor-pointer"
                  style={{
                    height: `${heightPercent}%`,
                    background: isToday
                      ? 'linear-gradient(180deg, #ff4f87 0%, #8b5cf6 100%)'
                      : idx % 2 === 0
                      ? 'linear-gradient(180deg, #00bfa6 0%, #168be5 100%)'
                      : 'linear-gradient(180deg, #ff9f43 0%, #ff4f87 100%)',
                  }}
                  title={`₹${amt.toLocaleString('en-IN')}`}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                    ₹{amt.toLocaleString('en-IN')}
                  </div>
                </div>
                <span className={`text-xs font-semibold ${isToday ? 'text-pink-400 font-bold' : 'text-slate-400'}`}>
                  {chartDays[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURE TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1 hover:border-violet-500/40 transition-colors">
          <div className="text-2xl mb-1">🧾</div>
          <b className="text-white text-sm block">ProofVault</b>
          <p className="text-slate-400 text-xs">Keep order details, timestamps, messages and evidence together.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1 hover:border-teal-500/40 transition-colors">
          <div className="text-2xl mb-1">🛡️</div>
          <b className="text-white text-sm block">Trust Profile</b>
          <p className="text-slate-400 text-xs">Show clear trust signals without pretending unverified sellers are verified.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1 hover:border-pink-500/40 transition-colors">
          <div className="text-2xl mb-1">⚖️</div>
          <b className="text-white text-sm block">FairResolve</b>
          <p className="text-slate-400 text-xs">Disputes move through response and review; no automatic fund locks.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1 hover:border-amber-500/40 transition-colors">
          <div className="text-2xl mb-1">📊</div>
          <b className="text-white text-sm block">Seller Insights</b>
          <p className="text-slate-400 text-xs">Use order data to understand pending payments and repeat buyers.</p>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: SMARTPAY GENERATOR (LEFT) + LINK DIRECTORY (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: SmartPay Link Creator */}
        <div className="lg:col-span-5 p-6 md:p-8 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>SmartPay Link Generator</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl text-white">Create a Payment Request</h3>
            <p className="text-xs text-slate-400">
              Creates a unique, verifiable payment link with custom terms and an autonomous QR code.
            </p>
          </div>

          <form onSubmit={handleCreateLinkSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Customer Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Priya Nair"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount (₹ INR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1500"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">What is this for? *</label>
              <input
                type="text"
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Block-print linen cushion covers (Set of 4)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Customer Phone (Optional)</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98451 22390"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Link Expiry</label>
                <select
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs focus:outline-none focus:border-pink-500"
                >
                  <option value="0" className="bg-[#121936]">
                    No Expiry
                  </option>
                  <option value="24" className="bg-[#121936]">
                    24 Hours
                  </option>
                  <option value="72" className="bg-[#121936]">
                    3 Days
                  </option>
                  <option value="168" className="bg-[#121936]">
                    7 Days
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Delivery & Return Terms</label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="e.g. Dispatches in 2 days. 7-day exchange window."
                className="w-full px-4 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs leading-relaxed focus:outline-none focus:border-pink-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create SmartPay Link</span>
            </button>
          </form>
        </div>

        {/* Right Column: Searchable, Filterable Order Directory */}
        <div className="lg:col-span-7 p-6 md:p-8 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-extrabold text-2xl text-white">Your Orders & Links</h3>
              <p className="text-xs text-slate-400">Click any order to manage fulfillment, chat, or view QR.</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/[0.05] text-slate-300">
              {filteredOrders.length} links
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, item, or code..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Status Filter Segmented Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/10 rounded-xl overflow-x-auto scrollbar-none">
            {['all', 'pending', 'paid', 'disputed', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setStatusFilter(f);
                  sounds.playMessage();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === f
                    ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No orders match your search or filter criteria.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    onSelectOrder(order.id);
                    sounds.playMessage();
                  }}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group ${
                    order.status === 'paid'
                      ? 'bg-teal-950/20 border-teal-500/20 hover:border-teal-500/50 hover:bg-teal-950/30'
                      : order.status === 'disputed'
                      ? 'bg-pink-950/20 border-pink-500/30 hover:border-pink-500/60 hover:bg-pink-950/30'
                      : order.status === 'resolved'
                      ? 'bg-purple-950/20 border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-950/30'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-white group-hover:text-pink-400 transition-colors truncate">
                        {order.customerName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">({order.linkCode})</span>
                    </div>
                    <div className="text-xs text-slate-300 truncate max-w-sm">{order.note}</div>
                    <div className="text-[10px] text-slate-500">{order.createdAt}</div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="font-display font-extrabold text-base text-white font-mono">
                      ₹{order.amount.toLocaleString('en-IN')}
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        order.status === 'paid'
                          ? 'bg-teal-500/20 text-teal-300'
                          : order.status === 'disputed'
                          ? 'bg-pink-500/20 text-pink-300'
                          : order.status === 'resolved'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
