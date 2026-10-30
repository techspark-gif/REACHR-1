import React, { useState } from 'react';
import {
  ShieldAlert,
  Scale,
  Building2,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  UserCheck,
  Lock,
  Unlock,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrderLink, MerchantAccount, PlatformLog } from '../types';
import { INITIAL_MERCHANTS, INITIAL_PLATFORM_LOGS } from '../data/initialData';
import { sounds } from '../utils/audio';

interface UniversalControlViewProps {
  orders: OrderLink[];
  onUpdateOrder: (id: string, updates: Partial<OrderLink>) => void;
  onSelectBuyerPortal: () => void;
  onSelectSellerPortal: () => void;
  showToast: (msg: string) => void;
  onSignOut?: () => void;
}

export const UniversalControlView: React.FC<UniversalControlViewProps> = ({
  orders,
  onUpdateOrder,
  onSelectBuyerPortal,
  onSelectSellerPortal,
  showToast,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'disputes' | 'merchants' | 'ledger'>('disputes');
  const [merchants, setMerchants] = useState<MerchantAccount[]>(INITIAL_MERCHANTS);
  const [logs, setLogs] = useState<PlatformLog[]>(INITIAL_PLATFORM_LOGS);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string>('l6');
  const [arbitrationNotes, setArbitrationNotes] = useState('');

  // Find disputes needing attention
  const stage3Orders = orders.filter((o) => o.dispute && o.dispute.currentStage === 3);
  const allDisputedOrders = orders.filter((o) => o.status === 'disputed' || o.dispute);

  const activeDisputeOrder = orders.find((o) => o.id === selectedDisputeId) || stage3Orders[0] || allDisputedOrders[0];

  // Platform Metrics
  const totalVolume = 842500;
  const escrowLockedAmount = orders
    .filter((o) => o.status === 'disputed' || (o.status === 'paid' && o.deliveryStage < 5))
    .reduce((sum, o) => sum + o.amount, 0) + 115000;

  // Handle Arbitration Decision
  const handleArbitrate = (decision: 'buyer_refund' | 'seller_payout' | 'split_50_50') => {
    if (!activeDisputeOrder || !activeDisputeOrder.dispute) return;

    sounds.playReward();
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#8B5CF6', '#EC4899', '#10B981'],
    });

    let resolutionText = '';
    let logTitle = '';
    let logDetails = '';

    if (decision === 'buyer_refund') {
      resolutionText = `Platform Owner ruled 100% in favor of Buyer (${activeDisputeOrder.customerName}). Escrow refund of ₹${activeDisputeOrder.amount.toLocaleString('en-IN')} initiated via original payment rail.`;
      logTitle = `Arbitration: Full Refund to Buyer (${activeDisputeOrder.customerName})`;
      logDetails = `Escrow of ₹${activeDisputeOrder.amount} for link ${activeDisputeOrder.linkCode} refunded. Claim upheld by Universal Control.`;
    } else if (decision === 'seller_payout') {
      resolutionText = `Platform Owner verified merchant dispatch proof. Escrow of ₹${activeDisputeOrder.amount.toLocaleString('en-IN')} released directly to ${activeDisputeOrder.businessName}.`;
      logTitle = `Arbitration: Escrow Released to Seller (${activeDisputeOrder.businessName})`;
      logDetails = `Dispatch proof verified for ${activeDisputeOrder.linkCode}. Escrow disbursed to ${activeDisputeOrder.businessVpa}.`;
    } else {
      const half = Math.round(activeDisputeOrder.amount / 2);
      resolutionText = `Platform Owner issued 50/50 Amicable Settlement. ₹${half.toLocaleString('en-IN')} refunded to Buyer and ₹${(activeDisputeOrder.amount - half).toLocaleString('en-IN')} released to Seller.`;
      logTitle = `Arbitration: 50/50 Settlement (${activeDisputeOrder.linkCode})`;
      logDetails = `Equitable split executed by Universal Control for dispute ${activeDisputeOrder.dispute.id}.`;
    }

    const updatedTimeline = [
      ...activeDisputeOrder.dispute.timeline,
      {
        stage: 4,
        title: 'Universal Control Final Ruling',
        description: resolutionText,
        timestamp: 'Just now',
        actor: 'reviewer' as const,
      },
    ];

    onUpdateOrder(activeDisputeOrder.id, {
      status: 'resolved',
      dispute: {
        ...activeDisputeOrder.dispute,
        currentStage: 4,
        resolutionSummary: resolutionText,
        timeline: updatedTimeline,
      },
      messages: [
        ...activeDisputeOrder.messages,
        {
          id: `msg-${Date.now()}`,
          sender: 'system',
          senderName: 'Universal Control Desk',
          text: resolutionText,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    });

    const newLog: PlatformLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      type: 'dispute_arbitrated',
      title: logTitle,
      details: logDetails,
      referenceCode: activeDisputeOrder.linkCode,
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(`Dispute ${activeDisputeOrder.linkCode} successfully arbitrated!`);
    setArbitrationNotes('');
  };

  const handleToggleMerchantVerification = (id: string) => {
    setMerchants((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const newStatus = m.status === 'verified' ? 'pending' : 'verified';
        sounds.playMessage();
        showToast(`Merchant ${m.businessName} status set to: ${newStatus.toUpperCase()}`);
        return { ...m, status: newStatus };
      })
    );
  };

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Universal Control Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0F1528]/95 backdrop-blur-2xl border border-violet-500/30 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/40">
              Universal Control Desk
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Platform Owner Console
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Reachr Universal Operating System
          </h1>
          <p className="text-xs text-slate-300">
            Dedicated administrative desk for neutral FairResolve™ dispute mediation, escrow safety custody, and merchant verification.
          </p>
        </div>

        {/* Portal Preview Launchers & Logout */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onSelectBuyerPortal}
            className="px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Buyer View</span>
          </button>
          <button
            onClick={onSelectSellerPortal}
            className="px-3.5 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Seller View</span>
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Log out of Universal Control"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D1424]/90 border border-white/10 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400">Total Gross Volume</span>
          <div className="text-xl sm:text-2xl font-black text-white">₹{totalVolume.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-emerald-400 font-medium">↑ 18.4% month-over-month</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1424]/90 border border-violet-500/30 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-violet-300">Active Escrow Custody</span>
          <div className="text-xl sm:text-2xl font-black text-violet-300">₹{escrowLockedAmount.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-400">Locked in RBI-compliant pool</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1424]/90 border border-amber-500/30 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-amber-300">Disputes Awaiting Ruling</span>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {stage3Orders.length} <span className="text-xs font-normal text-slate-400">escalated</span>
          </div>
          <span className="text-[10px] text-amber-400/90 font-medium">Stage 3 Platform Desk</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1424]/90 border border-white/10 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400">Verified Merchants</span>
          <div className="text-xl sm:text-2xl font-black text-white">
            {merchants.filter((m) => m.status === 'verified').length} / {merchants.length}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">100% KYC verified</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white/[0.04] border border-white/10 rounded-2xl max-w-fit">
        <button
          onClick={() => {
            setActiveTab('disputes');
            sounds.playMessage();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'disputes'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4 text-violet-300" />
          <span>FairResolve™ Arbitration Desk</span>
          {stage3Orders.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {stage3Orders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('merchants');
            sounds.playMessage();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'merchants'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-300" />
          <span>Merchant Registry & Passports</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ledger');
            sounds.playMessage();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-pink-300" />
          <span>Live Platform Event Ledger</span>
        </button>
      </div>

      {/* TAB 1: Neutral FairResolve™ Dispute Arbitration Desk */}
      {activeTab === 'disputes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dispute Cases List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Escalated Dispute Cases ({allDisputedOrders.length})
            </h3>
            <div className="space-y-2">
              {allDisputedOrders.map((order) => {
                const isSelected = order.id === activeDisputeOrder?.id;
                const stage = order.dispute?.currentStage || 1;
                return (
                  <button
                    key={order.id}
                    onClick={() => {
                      setSelectedDisputeId(order.id);
                      sounds.playMessage();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-950/40 border-violet-500/60 shadow-lg'
                        : 'bg-[#0E1529]/80 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-violet-300">{order.linkCode}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          stage === 3
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : stage === 4
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {stage === 3 ? 'Stage 3: Review Desk' : stage === 4 ? 'Resolved' : `Stage ${stage}`}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-white">{order.customerName}</div>
                    <div className="text-xs text-slate-300 line-clamp-1 mt-0.5">{order.note}</div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-white/[0.08]">
                      <span>Escrow: ₹{order.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-400">{order.businessName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Case Dossier & Arbitration Ruling Station */}
          <div className="lg:col-span-8">
            {activeDisputeOrder && activeDisputeOrder.dispute ? (
              <div className="p-6 rounded-3xl bg-[#0F162B]/90 border border-white/10 space-y-6 shadow-2xl">
                {/* Dossier Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/40">
                        Case #{activeDisputeOrder.dispute.id}
                      </span>
                      <span className="font-mono text-xs text-slate-400">Link: {activeDisputeOrder.linkCode}</span>
                    </div>
                    <h2 className="font-display font-bold text-xl text-white">
                      {activeDisputeOrder.dispute.reason}
                    </h2>
                  </div>

                  <div className="text-right sm:self-auto self-start">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Locked Escrow</span>
                    <span className="font-display font-extrabold text-2xl text-emerald-400">
                      ₹{activeDisputeOrder.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Evidence Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Side */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400">Customer Claim</span>
                      <span className="text-[10px] text-slate-400">{activeDisputeOrder.customerName}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                      "{activeDisputeOrder.dispute.details || 'Customer reported dissatisfaction with received item.'}"
                    </p>
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>Requested Resolution: <span className="text-slate-200 font-semibold">{activeDisputeOrder.dispute.proposedSolution || 'Full refund or replacement'}</span></div>
                      <div>Contact: <span className="font-mono text-slate-300">{activeDisputeOrder.customerPhone || 'Verified App User'}</span></div>
                    </div>
                  </div>

                  {/* Seller Side */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-400">Seller Dispatch & Proof</span>
                      <span className="text-[10px] text-slate-400">{activeDisputeOrder.businessName}</span>
                    </div>

                    {activeDisputeOrder.deliveryProof ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-white/10 h-28 bg-slate-900 group">
                          <img
                            src={activeDisputeOrder.deliveryProof.url}
                            alt="Dispatch Proof"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                            <span className="text-[10px] text-emerald-300 font-medium">
                              ProofVault™ Verified: {activeDisputeOrder.deliveryProof.name}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {activeDisputeOrder.deliveryProof.notes || 'Courier tracking documented.'}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                        No image uploaded to ProofVault™ by merchant yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Dispute Timeline Stage Tracker */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Transparent Protocol History
                  </h4>
                  <div className="space-y-2">
                    {activeDisputeOrder.dispute.timeline.map((event, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                          {event.stage}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{event.title}</span>
                            <span className="text-[10px] text-slate-400">{event.timestamp}</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Binding Universal Control Decision Buttons */}
                {activeDisputeOrder.dispute.currentStage === 3 ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-violet-950/40 to-[#0F162B] border border-violet-500/40 space-y-4">
                    <div className="flex items-center gap-2 text-violet-300">
                      <Scale className="w-5 h-5" />
                      <span className="font-display font-bold text-sm">
                        Issue Universal Control Binding Determination
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      As the platform owner, your decision immediately executes escrow release, notifies both parties, and logs the immutable event.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <button
                        onClick={() => handleArbitrate('buyer_refund')}
                        className="p-3.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold text-xs transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-5 h-5 text-rose-400" />
                        <span>Rule for Buyer</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          100% Refund (₹{activeDisputeOrder.amount.toLocaleString('en-IN')})
                        </span>
                      </button>

                      <button
                        onClick={() => handleArbitrate('split_50_50')}
                        className="p-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer"
                      >
                        <Scale className="w-5 h-5 text-amber-400" />
                        <span>50/50 Split Settlement</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ₹{Math.round(activeDisputeOrder.amount / 2).toLocaleString('en-IN')} Each
                        </span>
                      </button>

                      <button
                        onClick={() => handleArbitrate('seller_payout')}
                        className="p-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-bold text-xs transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>Rule for Seller</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Release Escrow (₹{activeDisputeOrder.amount.toLocaleString('en-IN')})
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold text-white block">Arbitration Completed</span>
                        <span className="text-slate-300">
                          {activeDisputeOrder.dispute.resolutionSummary || 'Case closed amicably.'}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                      Resolved
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-[#0F162B]/80 rounded-3xl border border-white/10">
                No active dispute selected.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Merchant Trust Registry & Passports */}
      {activeTab === 'merchants' && (
        <div className="p-6 rounded-3xl bg-[#0F162B]/90 border border-white/10 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-xl text-white">Merchant Trust Passport Registry</h2>
              <p className="text-xs text-slate-300">
                Configure verified badges, GSTIN validations, and escrow settlement holds for platform sellers.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Showing {merchants.length} registered businesses
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Merchant & Category</th>
                  <th className="py-3 px-4">GSTIN & Location</th>
                  <th className="py-3 px-4">Trust Score</th>
                  <th className="py-3 px-4">Total Volume</th>
                  <th className="py-3 px-4">Escrow Hold</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">{merchant.businessName}</div>
                      <div className="text-slate-400 text-[11px]">{merchant.category}</div>
                      <div className="font-mono text-[10px] text-pink-300">{merchant.vpa}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-mono text-slate-300">{merchant.gstin}</div>
                      <div className="text-slate-400 text-[11px]">{merchant.city}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-display font-bold text-emerald-400 text-sm">
                        {merchant.trustScore}/100
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-200">
                      ₹{merchant.totalVolume.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px]">
                        {merchant.escrowHoldHours} hrs hold
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          merchant.status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {merchant.status === 'verified' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {merchant.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggleMerchantVerification(merchant.id)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      >
                        {merchant.status === 'verified' ? 'Revoke Badge' : 'Grant Verified'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Immutable Event Ledger */}
      {activeTab === 'ledger' && (
        <div className="p-6 rounded-3xl bg-[#0F162B]/90 border border-white/10 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-white">Immutable Platform Event Ledger</h2>
              <p className="text-xs text-slate-300">
                Cryptographic audit trail of all payments captured, escrow locks, courier proofs, and platform rulings.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Sync
            </span>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-violet-300 font-mono text-[10px]">
                      {log.type.replace('_', ' ').toUpperCase()}
                    </span>
                    {log.referenceCode && (
                      <span className="font-mono text-[10px] text-pink-300">{log.referenceCode}</span>
                    )}
                  </div>
                  <div className="font-bold text-white text-sm">{log.title}</div>
                  <div className="text-slate-300 text-[11px]">{log.details}</div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    256-Bit Signed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
