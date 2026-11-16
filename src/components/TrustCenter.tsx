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

  // Evidence Assistant State
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

  // Rewards State
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
        'Reachr funds remain protected until delivery confirmation OTP is recorded.',
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
        'Settlement clearance typically completes immediately upon mutual order closure.',
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
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
    showToast('150 Trust Points unlocked!');
  };

  const escrowAmount = currentOrder.status === 'paid' ? currentOrder.amount : 0;
  const unreadNotices = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8 text-stone-900">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs text-stone-600 font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Order verification & mutual dispute protocol</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-stone-900">
            Trust & Protection Hub
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Synchronized courier milestones, verified package proof, and transparent resolution terms.
          </p>
        </div>

        {/* Order Selector */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Order:</span>
          <select
            value={selectedOrderId || ''}
            onChange={(e) => {
              onSelectOrder(e.target.value);
              sounds.playMessage();
            }}
            className="bg-stone-50 text-stone-900 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-stone-400"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.linkCode} — {o.customerName} (₹{o.amount.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 9 INTEGRATED TRUST MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* MODULE 1: LIVE GPS TRACKING CENTER (Wide 12 cols) */}
        <section className="md:col-span-12 p-6 md:p-7 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
                01 / Live Logistics & Milestones
              </div>
              <h3 className="font-display font-bold text-xl text-stone-900 mt-0.5">Real-Time Delivery Route</h3>
              <p className="text-xs text-stone-500">
                Express courier simulation with road waypoints, pickup hub, and recipient destination.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                ● Courier Active: Delhivery Express
              </span>
              <span className="text-xs font-mono font-medium text-stone-500">ETA: ~24 min</span>
            </div>
          </div>

          {/* Clean Organic SVG Vector Road Map */}
          <div className="relative h-60 sm:h-64 w-full rounded-2xl overflow-hidden bg-[#FAF7F2] border border-stone-200 shadow-inner">
            <svg
              viewBox="0 0 900 320"
              preserveAspectRatio="xMidYMid slice"
              className="w-full h-full block"
              role="img"
              aria-label="Courier roadmap"
            >
              <rect width="900" height="320" fill="#FAF7F2" />

              {/* Grid block roads */}
              <path
                d="M-50 60 L240 90 L340 30 L550 95 L720 30 L950 80 M-50 240 L180 190 L340 260 L560 205 L950 270 M120 -30 L170 350 M400 -30 L430 350 M680 -30 L630 350"
                fill="none"
                stroke="#E7E2DA"
                strokeWidth="20"
              />
              <path
                d="M-50 60 L240 90 L340 30 L550 95 L720 30 L950 80 M-50 240 L180 190 L340 260 L560 205 L950 270 M120 -30 L170 350 M400 -30 L430 350 M680 -30 L630 350"
                fill="none"
                stroke="#DDD6CA"
                strokeWidth="10"
              />

              {/* Delivery Route Line */}
              <path
                d="M 140 240 C 240 220, 260 120, 380 135 S 520 220, 620 140 S 720 130, 780 75"
                fill="none"
                stroke="#EAB640"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="8 8"
              />

              {/* Pickup Hub Marker */}
              <circle cx="140" cy="240" r="12" fill="#2D4739" stroke="#FFFFFF" strokeWidth="3" />
              <text x="105" y="275" fill="#2D4739" fontSize="11" fontWeight="bold">
                PICKUP HUB
              </text>

              {/* Drop-off Destination Marker */}
              <circle cx="780" cy="75" r="12" fill="#C85A32" stroke="#FFFFFF" strokeWidth="3" />
              <text x="740" y="50" fill="#C85A32" fontSize="11" fontWeight="bold">
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
                    <circle r="18" fill="#EAB640" opacity="0.3" className="animate-ping" />
                    <circle r="14" fill="#1C1917" stroke="#FFFFFF" strokeWidth="2.5" />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      🚚
                    </text>
                  </g>
                );
              })()}
            </svg>

            {/* Map overlay pill */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-stone-200 text-xs font-semibold text-stone-900 flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>
                {currentOrder.linkCode} · {steps[currentStepIdx]}
              </span>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-stone-600">
              Simulate Fulfillment Stage for Order <b className="text-stone-900">{currentOrder.linkCode}</b>:
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStepChange(currentStepIdx - 1)}
                disabled={currentStepIdx === 0}
                className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-semibold text-stone-700 disabled:opacity-30 cursor-pointer"
              >
                ← Previous Stage
              </button>
              <button
                onClick={() => handleStepChange(currentStepIdx + 1)}
                disabled={currentStepIdx === 5}
                className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-white shadow-xs disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
              >
                <span>Advance Delivery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* MODULE 2: DELIVERY TIMELINE (Wide 12 cols) */}
        <section className="md:col-span-12 p-6 md:p-7 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
                02 / Fulfillment Pipeline
              </div>
              <h3 className="font-display font-bold text-lg text-stone-900">Chronological Progress</h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">Stage {currentStepIdx + 1} of 6</span>
          </div>

          {/* 6 Steps Graphic */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-1">
            {steps.map((st, i) => {
              const isDone = i < currentStepIdx;
              const isCur = i === currentStepIdx;
              return (
                <div
                  key={st}
                  className={`p-3.5 rounded-xl border text-center space-y-1.5 transition-all ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : isCur
                      ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}
                >
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCur
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <div className="text-xs font-semibold truncate">{st}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* MODULE 3: MERCHANT TRUST PASSPORT (6 cols) */}
        <section className="md:col-span-6 p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">03 / Trust Passport</div>
            <h3 className="font-display font-bold text-lg text-stone-900">Seller Credentials</h3>
            <p className="text-xs text-stone-500">Verified artisan registration details.</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center font-display font-bold text-lg text-white">
              MH
            </div>
            <div>
              <div className="font-display font-bold text-sm text-stone-900">{INITIAL_BUSINESS.name}</div>
              <div className="text-xs text-stone-500">GSTIN: {INITIAL_BUSINESS.gstin} · {INITIAL_BUSINESS.city}</div>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5">✓ Registered Handloom Co-op</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-stone-600">Identity & GSTIN Verification</span>
              <span className="font-bold text-emerald-700">Verified ✓</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-stone-600">On-Time Dispatch Rate</span>
              <span className="font-bold text-stone-900">98.4%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-stone-600">Dispute Resolution Velocity</span>
              <span className="font-bold text-stone-900">4.2 Hours</span>
            </div>
          </div>
        </section>

        {/* MODULE 4: PAYMENT STATUS VAULT / ESCROW (6 cols) */}
        <section className="md:col-span-6 p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
              04 / Payment Status
            </div>
            <h3 className="font-display font-bold text-lg text-stone-900">Holding & Release Terms</h3>
            <p className="text-xs text-stone-500">Transparent payment schedule.</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 space-y-1">
            <div className="text-xs text-stone-500 font-medium">Order Value ({currentOrder.linkCode})</div>
            <div className="font-display font-bold text-3xl text-stone-900">
              ₹{currentOrder.amount.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-stone-600 pt-1">
              {currentOrder.status === 'paid'
                ? 'Status: Verified payment received. Release scheduled upon doorstep confirmation.'
                : currentOrder.status === 'resolved'
                ? 'Status: Settlement finalized. Funds distributed.'
                : 'Status: Awaiting payment confirmation.'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <div className="text-stone-500 text-[10px]">Received</div>
              <div className="font-bold text-stone-900 font-mono mt-1">₹{escrowAmount.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <div className="text-stone-500 text-[10px]">Under Review</div>
              <div className="font-bold text-amber-700 font-mono mt-1">
                {currentOrder.status === 'disputed' ? `₹${currentOrder.amount.toLocaleString('en-IN')}` : '₹0'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <div className="text-stone-500 text-[10px]">Refunds</div>
              <div className="font-bold text-stone-900 font-mono mt-1">₹0</div>
            </div>
          </div>
        </section>

        {/* MODULE 5: EVIDENCE CHECKLIST & AI ASSISTANT (6 cols) */}
        <section className="md:col-span-6 p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
              05 / Evidence Checklist
            </div>
            <h3 className="font-display font-bold text-lg text-stone-900">Structured Resolution Helper</h3>
            <p className="text-xs text-stone-500">
              Get an evidence checklist before escalating into arbitration.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Issue Category</label>
              <select
                value={aiIssue}
                onChange={(e) => setAiIssue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:border-stone-400"
              >
                <option value="Item not as described">Item not as described</option>
                <option value="Item not received">Item not received</option>
                <option value="Item damaged">Item damaged in transit</option>
                <option value="Payment or refund issue">Payment or refund issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Case Notes (Optional)</label>
              <textarea
                rows={2}
                value={aiDetails}
                onChange={(e) => setAiDetails(e.target.value)}
                placeholder="Mention specifics: timestamps, package condition, photos taken..."
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-xs focus:outline-none focus:border-stone-400"
              />
            </div>

            <button
              onClick={handleGenerateAiChecklist}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Generate Evidence Checklist</span>
            </button>

            {aiChecklist && (
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-sans">
                {aiChecklist}
              </div>
            )}
          </div>
        </section>

        {/* MODULE 6: DELIVERY PROOF CENTER (6 cols) */}
        <section className="md:col-span-6 p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
              06 / Delivery Proof Center
            </div>
            <h3 className="font-display font-bold text-lg text-stone-900">ProofVault Verification</h3>
            <p className="text-xs text-stone-500">
              Upload doorstep receipt, signed slip, or unboxing photograph.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-dashed border-stone-200 hover:border-stone-300 bg-stone-50/50 text-center space-y-3 transition-colors">
            <UploadCloud className="w-8 h-8 mx-auto text-stone-500" />
            <div>
              <label
                htmlFor="proof-upload"
                className="inline-block px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors"
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
            <div className="text-[11px] text-stone-500">JPG, PNG, WebP · Local browser preview</div>

            {/* Proof Preview */}
            {uploadedProofUrl && (
              <div className="mt-3 p-3 rounded-xl bg-white border border-stone-200 space-y-2">
                <img
                  src={uploadedProofUrl}
                  alt="Delivery Proof"
                  className="max-h-36 mx-auto rounded-lg object-contain shadow-xs"
                />
                <div className="text-xs text-stone-900 font-semibold">{uploadedProofName}</div>
                <div className="text-[10px] text-stone-500">
                  Attached to order {currentOrder.linkCode}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* MODULE 7: GAMIFIED REWARDS DASHBOARD (4 cols) */}
        <section className="md:col-span-4 p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">07 / Trust Rewards</div>
            <h3 className="font-display font-bold text-lg text-stone-900">Trust Points</h3>
            <p className="text-xs text-stone-500">Points for prompt delivery and clean records.</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-stone-900 space-y-1">
            <div className="text-xs text-amber-800 font-semibold">Your Balance</div>
            <div className="font-display font-bold text-3xl text-stone-900">{points} pts</div>
            <div className="text-xs text-stone-600">Tier: Gold Ambassador</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="text-stone-500 text-[10px]">Next Milestone</div>
              <div className="font-bold text-stone-900 mt-0.5">750 pts</div>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="text-stone-500 text-[10px]">Clean Streak</div>
              <div className="font-bold text-emerald-700 mt-0.5">14 Orders</div>
            </div>
          </div>

          <button
            onClick={handleClaimPoints}
            disabled={pointsClaimed}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-40"
          >
            {pointsClaimed ? '✓ Points Claimed Today' : 'Claim +150 Daily Points'}
          </button>
        </section>

        {/* MODULE 8: ENHANCED BUSINESS ANALYTICS (4 cols) */}
        <section className="md:col-span-4 p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">08 / Merchant Health</div>
            <h3 className="font-display font-bold text-lg text-stone-900">Fulfillment Benchmarks</h3>
            <p className="text-xs text-stone-500">Performance across recent orders.</p>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-stone-600">Payment Clearance</span>
                <span className="text-stone-900 font-mono">92%</span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-emerald-600 w-[92%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-stone-600">Same-Day Dispatch</span>
                <span className="text-stone-900 font-mono">84%</span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-amber-500 w-[84%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-stone-600">Dispute Defense Win</span>
                <span className="text-stone-900 font-mono">96%</span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-stone-800 w-[96%]" />
              </div>
            </div>
          </div>
        </section>

        {/* MODULE 9: SMART NOTIFICATIONS HUB (4 cols) */}
        <section className="md:col-span-4 p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
                09 / Activity Feed
              </div>
              <h3 className="font-display font-bold text-lg text-stone-900">Audit Log</h3>
            </div>
            {unreadNotices > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {unreadNotices} new
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border text-xs space-y-0.5 ${
                  item.read ? 'bg-stone-50 border-stone-200 text-stone-500' : 'bg-amber-50/60 border-amber-200 text-stone-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-stone-900 text-[11px]">
                  <span>{item.title}</span>
                  <span className="text-[9px] text-stone-500 font-normal">{item.timestamp}</span>
                </div>
                <p className="text-stone-600 text-[11px] leading-tight">{item.text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              onMarkNotificationsRead();
              sounds.playMessage();
            }}
            className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
          >
            Mark All Read
          </button>
        </section>
      </div>
    </div>
  );
};