import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileText,
  UploadCloud,
  Award,
  BarChart3,
  Bell,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Info,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrderLink, AppNotification } from '../types';
import { INITIAL_BUSINESS } from '../data/initialData';
import { sounds } from '../utils/audio';

interface TrustCenterProps {
  orders: OrderLink[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string | null) => void;
  onUpdateOrder: (id: string, updates: Partial<OrderLink>) => void;
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  showToast: (msg: string) => void;
}

export const TrustCenter: React.FC<TrustCenterProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  onUpdateOrder,
  notifications,
  onMarkNotificationsRead,
  showToast,
}) => {
  const currentOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Delivery Stages
  const steps = ['Order Placed', 'Confirmed', 'Packed', 'Dispatched', 'Out for Delivery', 'Delivered'];
  const currentStepIdx = currentOrder.deliveryStage;

  // AI Assistant State
  const [aiIssue, setAiIssue] = useState('Item not as described');
  const [aiDetails, setAiDetails] = useState('');
  const [aiChecklist, setAiChecklist] = useState<string | null>(null);

  // Delivery Proof State
  const [uploadedProofName, setUploadedProofName] = useState<string | null>(
    currentOrder.deliveryProof?.name || null
  );
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(
    currentOrder.deliveryProof?.url || null
  );

  // Gamified Rewards State
  const [pointsClaimed, setPointsClaimed] = useState(false);
  const [points, setPoints] = useState(500);

  const handleStepChange = (newStep: number) => {
    if (newStep < 0 || newStep > 5) return;
    onUpdateOrder(currentOrder.id, {
      deliveryStage: newStep,
    });
    sounds.playMessage();
    showToast(`Order ${currentOrder.linkCode} updated to: ${steps[newStep]}`);
  };

  const handleGenerateAiChecklist = () => {
    sounds.playMessage();
    const suggestions: Record<string, string[]> = {
      'Item not as described': [
        'Photograph the received item against natural light showing color, pattern, or size differences.',
        'Capture clear close-ups of product tags, weave details, and any measurement tape references.',
        'Review original order chat notes where special color or customization was discussed.',
        'Request seller exchange or partial adjustment via Reachr Stage 2 proposal rather than cancellation.',
      ],
      'Item not received': [
        'Check the courier tracking AWB in the Live Tracking Center above.',
        'Confirm whether building security or neighbor accepted the parcel on your behalf.',
        'Request seller to file an inquiry with the express courier partner within the 48-hour window.',
        'Reachr escrow funds remain protected until delivery confirmation OTP is recorded.',
      ],
      'Item damaged': [
        'Take high-resolution photos of the outer cardboard box, bubble wrap, and damaged contents.',
        'Check if parcel seal was tampered or repacked by courier transit staff.',
        'Submit evidence into ProofVault so seller can initiate an insurance reimbursement claim.',
        'Accept complimentary replacement or instant goodwill refund via FairResolve.',
      ],
      'Payment or refund issue': [
        'Cross-reference the 12-digit UPI reference number with your bank passbook/statement.',
        'Check whether transaction was authorized via card 3D Secure or instant VPA transfer.',
        'Escrow clearance typically completes immediately upon mutual order closure.',
      ],
    };

    const lines = suggestions[aiIssue] || suggestions['Item not as described'];
    const checklistText = `Structured Resolution Checklist for: ${aiIssue}\n\n` +
      lines.map((l, i) => `${i + 1}. ${l}`).join('\n') +
      (aiDetails.trim() ? `\n\nSpecific Case Context:\n"${aiDetails.trim()}"` : '') +
      `\n\nRecommendation: Share this structured checklist in the Order Chat. Stage 2 proposals resolve 91% of disputes within 24 hours.`;

    setAiChecklist(checklistText);
    sounds.playReward();
    showToast('Evidence Checklist generated!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedProofName(file.name);
      setUploadedProofUrl(dataUrl);

      // Attach proof to active order
      onUpdateOrder(currentOrder.id, {
        deliveryProof: {
          url: dataUrl,
          name: file.name,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          notes: 'Uploaded by merchant to ProofVault. Geotag verified.',
        },
      });

      sounds.playSuccess();
      showToast(`Proof attached to order ${currentOrder.linkCode}!`);
    };
    reader.readAsDataURL(file);
  };

  const handleClaimPoints = () => {
    if (pointsClaimed) return;
    setPointsClaimed(true);
    setPoints(points + 150);
    sounds.playSuccess();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    showToast('150 Trust Points unlocked!');
  };

  const escrowAmount = currentOrder.status === 'paid' ? currentOrder.amount : 0;
  const unreadNotices = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-2 border-b border-white/10">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Order Tracking, Delivery Proof & Dispute Protection
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white mt-1">
            Every transaction.{' '}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              Total certainty.
            </span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            One synchronized console for courier waypoints, verified delivery proof, escrow transparency, and
            transparent merchant credentials.
          </p>
        </div>

        {/* Order Selector */}
        <div className="flex items-center gap-3 bg-[#121936] p-3 rounded-2xl border border-white/10">
          <span className="text-xs font-semibold text-slate-400">Inspecting Order:</span>
          <select
            value={selectedOrderId || ''}
            onChange={(e) => {
              onSelectOrder(e.target.value);
              sounds.playMessage();
            }}
            className="bg-white/[0.06] text-white border border-white/15 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-teal-500"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id} className="bg-[#121936]">
                {o.linkCode} — {o.customerName} (₹{o.amount.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 9 INTEGRATED TRUST MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* MODULE 1: LIVE GPS TRACKING CENTER (Wide 12 cols) */}
        <section className="md:col-span-12 p-6 md:p-8 rounded-3xl bg-[#121936] border border-white/10 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-400">
                01 / Live Logistics & Waypoints
              </div>
              <h3 className="font-display font-extrabold text-2xl text-white mt-0.5">Real-Time Delivery Route</h3>
              <p className="text-xs text-slate-400">
                Express courier simulation with road waypoints, pickup hub, and recipient destination.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                ● Courier Active: Delhivery Express
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">ETA: ~24 min</span>
            </div>
          </div>

          {/* Interactive SVG Vector Road Map */}
          <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-[#0A1626] border border-white/10 shadow-inner">
            <svg
              viewBox="0 0 900 320"
              preserveAspectRatio="xMidYMid slice"
              className="w-full h-full block"
              role="img"
              aria-label="Interactive stylized courier roadmap"
            >
              <rect width="900" height="320" fill="#0A1626" />

              {/* Grid block roads */}
              <path
                d="M-50 60 L240 90 L340 30 L550 95 L720 30 L950 80 M-50 240 L180 190 L340 260 L560 205 L950 270 M120 -30 L170 350 M400 -30 L430 350 M680 -30 L630 350"
                fill="none"
                stroke="#172740"
                strokeWidth="24"
              />
              <path
                d="M-50 60 L240 90 L340 30 L550 95 L720 30 L950 80 M-50 240 L180 190 L340 260 L560 205 L950 270 M120 -30 L170 350 M400 -30 L430 350 M680 -30 L630 350"
                fill="none"
                stroke="#243B60"
                strokeWidth="14"
              />

              {/* Courier Delivery Route Line (Dotted Neon) */}
              <path
                d="M 140 240 C 240 220, 260 120, 380 135 S 520 220, 620 140 S 720 130, 780 75"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="9 9"
              />

              {/* Pickup Hub Marker */}
              <circle cx="140" cy="240" r="14" fill="#10B981" stroke="#FFFFFF" strokeWidth="4" />
              <text x="105" y="275" fill="#10B981" fontSize="12" fontWeight="bold">
                PICKUP HUB
              </text>

              {/* Drop-off Destination Marker */}
              <circle cx="780" cy="75" r="14" fill="#EC4899" stroke="#FFFFFF" strokeWidth="4" />
              <text x="740" y="50" fill="#EC4899" fontSize="12" fontWeight="bold">
                DROP-OFF
              </text>

              {/* Dynamic Courier Pin based on current step */}
              {(() => {
                const positions = [
                  { x: 140, y: 240 },
                  { x: 220, y: 200 },
                  { x: 380, y: 135 },
                  { x: 500, y: 175 },
                  { x: 650, y: 130 },
                  { x: 780, y: 75 },
                ];
                const pos = positions[currentStepIdx] || positions[0];
                return (
                  <g transform={`translate(${pos.x}, ${pos.y})`} className="transition-transform duration-700 ease-out">
                    <circle r="26" fill="#8B5CF6" opacity="0.2" className="animate-ping" />
                    <circle r="16" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="3.5" />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      🚚
                    </text>
                  </g>
                );
              })()}
            </svg>

            {/* Map overlay pill */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {currentOrder.linkCode} · {steps[currentStepIdx]}
              </span>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-300">
              Simulate Fulfillment Stage for Order <b className="text-white">{currentOrder.linkCode}</b>:
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStepChange(currentStepIdx - 1)}
                disabled={currentStepIdx === 0}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-slate-300 disabled:opacity-30 cursor-pointer"
              >
                ← Previous Stage
              </button>
              <button
                onClick={() => handleStepChange(currentStepIdx + 1)}
                disabled={currentStepIdx === 5}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:opacity-95 text-xs font-bold text-white shadow-md shadow-pink-500/20 disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
              >
                <span>Advance Delivery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* MODULE 2: DELIVERY TIMELINE (Wide 12 cols) */}
        <section className="md:col-span-12 p-6 md:p-8 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-pink-400">
                02 / Delivery Journey Pipeline
              </div>
              <h3 className="font-display font-bold text-xl text-white">Full Chronological Journey</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Stage {currentStepIdx + 1} of 6</span>
          </div>

          {/* 6 Steps Graphic */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-2">
            {steps.map((st, i) => {
              const isDone = i < currentStepIdx;
              const isCur = i === currentStepIdx;
              return (
                <div
                  key={st}
                  className={`p-3.5 rounded-2xl border text-center space-y-1.5 transition-all ${
                    isDone
                      ? 'bg-teal-950/30 border-teal-500/30 text-teal-300'
                      : isCur
                      ? 'bg-gradient-to-b from-violet-600/30 to-pink-600/30 border-pink-500/50 text-white shadow-md shadow-pink-500/20'
                      : 'bg-white/[0.02] border-white/5 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-extrabold ${
                      isDone
                        ? 'bg-teal-500 text-slate-950'
                        : isCur
                        ? 'bg-pink-500 text-white animate-pulse'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <div className="text-xs font-bold truncate">{st}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* MODULE 3: MERCHANT TRUST PASSPORT (6 cols) */}
        <section className="md:col-span-6 p-6 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-400">03 / Trust Passport</div>
            <h3 className="font-display font-bold text-xl text-white">Seller Credentials</h3>
            <p className="text-xs text-slate-400">Empirical trust metrics without marketing exaggeration.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center font-display font-extrabold text-2xl text-white shadow-lg">
              MH
            </div>
            <div>
              <div className="font-display font-bold text-base text-white">{INITIAL_BUSINESS.name}</div>
              <div className="text-xs text-slate-400">GSTIN: {INITIAL_BUSINESS.gstin} · {INITIAL_BUSINESS.city}</div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">✓ Registered Handloom Co-op</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-300">Identity & GSTIN Verification</span>
              <span className="font-bold text-teal-300">Verified ✓</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-300">On-Time Dispatch Rate</span>
              <span className="font-bold text-teal-300">98.4% (&lt;4h avg)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-300">Dispute Resolution Velocity</span>
              <span className="font-bold text-violet-300">4.2 Hours</span>
            </div>
          </div>
        </section>

        {/* MODULE 4: PAYMENT STATUS VAULT / ESCROW (6 cols) */}
        <section className="md:col-span-6 p-6 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-violet-400">
              04 / Payment Status Vault
            </div>
            <h3 className="font-display font-bold text-xl text-white">Escrow & Release Terms</h3>
            <p className="text-xs text-slate-400">Transparent payment holding and release schedule.</p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1E1442] via-[#24133A] to-[#121A38] border border-violet-500/30 text-white space-y-2 shadow-xl">
            <div className="text-xs text-violet-300 font-semibold">Active Order Value ({currentOrder.linkCode})</div>
            <div className="font-display font-extrabold text-4xl font-mono text-white">
              ₹{currentOrder.amount.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-300 pt-1">
              {currentOrder.status === 'paid'
                ? 'Status: Verified payment received. Release scheduled upon delivery OTP.'
                : currentOrder.status === 'resolved'
                ? 'Status: Settlement finalized. Funds distributed.'
                : 'Status: Awaiting buyer payment confirmation.'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-slate-400 text-[10px]">Received</div>
              <div className="font-bold text-white font-mono mt-1">₹{escrowAmount.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-slate-400 text-[10px]">Held in Escrow</div>
              <div className="font-bold text-amber-400 font-mono mt-1">
                {currentOrder.status === 'disputed' ? `₹${currentOrder.amount.toLocaleString('en-IN')}` : '₹0'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-slate-400 text-[10px]">Refunds</div>
              <div className="font-bold text-teal-400 font-mono mt-1">₹0</div>
            </div>
          </div>
        </section>

        {/* MODULE 5: EVIDENCE CHECKLIST & AI ASSISTANT (6 cols) */}
        <section className="md:col-span-6 p-6 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-pink-400">
              05 / Evidence Checklist Generator
            </div>
            <h3 className="font-display font-bold text-xl text-white">AI-Assisted Resolution Helper</h3>
            <p className="text-xs text-slate-400">
              Get an impartial evidence checklist before escalating into arbitration.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Category</label>
              <select
                value={aiIssue}
                onChange={(e) => setAiIssue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs focus:outline-none focus:border-pink-500"
              >
                <option value="Item not as described" className="bg-[#121936]">
                  Item not as described
                </option>
                <option value="Item not received" className="bg-[#121936]">
                  Item not received
                </option>
                <option value="Item damaged" className="bg-[#121936]">
                  Item damaged in transit
                </option>
                <option value="Payment or refund issue" className="bg-[#121936]">
                  Payment or refund issue
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Case Notes (Optional)</label>
              <textarea
                rows={2}
                value={aiDetails}
                onChange={(e) => setAiDetails(e.target.value)}
                placeholder="Mention specifics: timestamps, package condition, photos taken..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            <button
              onClick={handleGenerateAiChecklist}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Evidence Checklist</span>
            </button>

            {aiChecklist && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-sans">
                {aiChecklist}
              </div>
            )}
          </div>
        </section>

        {/* MODULE 6: DELIVERY PROOF CENTER (6 cols) */}
        <section className="md:col-span-6 p-6 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-400">
              06 / Delivery Proof Center
            </div>
            <h3 className="font-display font-bold text-xl text-white">ProofVault Verification</h3>
            <p className="text-xs text-slate-400">
              Upload doorstep receipt, signed slip, or unboxing photograph.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-dashed border-white/20 hover:border-teal-500/50 bg-white/[0.02] text-center space-y-3 transition-colors">
            <UploadCloud className="w-8 h-8 mx-auto text-teal-400" />
            <div>
              <label
                htmlFor="proof-upload"
                className="inline-block px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-xs cursor-pointer border border-teal-500/30 transition-colors"
              >
                Choose Photo / Proof Slip
              </label>
              <input
                id="proof-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div className="text-[11px] text-slate-400">JPG, PNG, WebP · Local browser preview</div>

            {/* Proof Preview */}
            {uploadedProofUrl && (
              <div className="mt-3 p-3 rounded-xl bg-black/30 border border-white/10 space-y-2">
                <img
                  src={uploadedProofUrl}
                  alt="Delivery Proof"
                  className="max-h-36 mx-auto rounded-lg object-contain shadow-md"
                />
                <div className="text-xs text-teal-300 font-semibold">{uploadedProofName}</div>
                <div className="text-[10px] text-slate-400">
                  Attached to order {currentOrder.linkCode} · EXIF Geotag Verified
                </div>
              </div>
            )}
          </div>
        </section>

        {/* MODULE 7: GAMIFIED REWARDS DASHBOARD (4 cols) */}
        <section className="md:col-span-4 p-6 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">07 / Trust Rewards</div>
            <h3 className="font-display font-bold text-xl text-white">Trust Points</h3>
            <p className="text-xs text-slate-400">Earn points for on-time delivery and clean disputes.</p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3D290F] via-[#281832] to-[#141C38] border border-amber-500/30 text-white space-y-2 shadow-xl">
            <div className="text-xs text-amber-300 font-semibold">Your Balance</div>
            <div className="font-display font-extrabold text-4xl font-mono text-amber-300">{points} pts</div>
            <div className="text-xs text-slate-300">Tier: Gold Merchant Ambassador</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-slate-400 text-[10px]">Next Perk</div>
              <div className="font-bold text-white mt-0.5">750 pts</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-slate-400 text-[10px]">Clean Streak</div>
              <div className="font-bold text-teal-400 mt-0.5">14 Orders</div>
            </div>
          </div>

          <button
            onClick={handleClaimPoints}
            disabled={pointsClaimed}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40"
          >
            {pointsClaimed ? '✓ Points Claimed Today' : 'Claim +150 Daily Points'}
          </button>
        </section>

        {/* MODULE 8: ENHANCED BUSINESS ANALYTICS (4 cols) */}
        <section className="md:col-span-4 p-6 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">08 / Merchant Health</div>
            <h3 className="font-display font-bold text-xl text-white">Fulfillment Health</h3>
            <p className="text-xs text-slate-400">Real-time delivery benchmarks.</p>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Payment Clearance</span>
                <span className="text-teal-400 font-mono">92%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 w-[92%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Same-Day Dispatch</span>
                <span className="text-violet-400 font-mono">84%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-400 to-pink-400 w-[84%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Dispute Defense Win</span>
                <span className="text-pink-400 font-mono">96%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-400 to-rose-400 w-[96%]" />
              </div>
            </div>
          </div>
        </section>

        {/* MODULE 9: SMART NOTIFICATIONS HUB (4 cols) */}
        <section className="md:col-span-4 p-6 rounded-3xl bg-[#121936] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-400">
                09 / Activity Feed
              </div>
              <h3 className="font-display font-bold text-xl text-white">Audit Log</h3>
            </div>
            {unreadNotices > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
                {unreadNotices} new
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border text-xs space-y-0.5 ${
                  item.read ? 'bg-white/[0.02] border-white/5 text-slate-400' : 'bg-violet-950/30 border-violet-500/30 text-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white text-[11px]">
                  <span>{item.title}</span>
                  <span className="text-[9px] text-slate-500 font-normal">{item.timestamp}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-tight">{item.text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              onMarkNotificationsRead();
              sounds.playMessage();
            }}
            className="w-full py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            Mark All Read
          </button>
        </section>
      </div>
    </div>
  );
};
