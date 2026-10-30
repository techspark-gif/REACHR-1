import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  QrCode,
  MessageSquare,
  Scale,
  TrendingUp,
  Repeat,
  ArrowRight,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Calculator,
  Lock,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface LandingViewProps {
  onGoToSeller: () => void;
  onGoToBuyer: () => void;
  onGoToTrustCenter: () => void;
  onOpenOwnerLogin?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onGoToSeller,
  onGoToBuyer,
  onGoToTrustCenter,
  onOpenOwnerLogin,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [monthlyVolume, setMonthlyVolume] = useState<number>(85000);

  // ROI Calculator math
  const estimatedHoursSaved = Math.round(monthlyVolume / 5000);
  const disputeReduction = 82; // 82% reduction
  const savings = Math.round(monthlyVolume * 0.045);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
    sounds.playMessage();
  };

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-24">
      {/* 1. HERO SECTION */}
      <section className="text-center pt-8 md:pt-14 pb-6 space-y-8 max-w-4xl mx-auto">
        {/* Subtle pill kicker */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs md:text-sm font-semibold text-pink-300 shadow-lg shadow-pink-500/10">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Zero-Commission UPI Payment Links & Delivery Protection</span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.98] text-white">
          Get paid instantly.{' '}
          <span className="block mt-2 bg-gradient-to-r from-[#FF4F87] via-[#FF9F43] via-[#F6D365] via-[#21D4B4] to-[#43B9FF] bg-clip-text text-transparent">
            Stay unmistakably fair.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Create branded payment links in ten seconds, keep order conversations in context, and settle disputes through a
          structured 4-stage transparent protocol.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => {
              onGoToSeller();
              sounds.playSuccess();
            }}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7657FF] via-[#A855F7] to-[#EC4899] text-white font-bold text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <span>Launch Seller Console</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              onGoToBuyer();
              sounds.playMessage();
            }}
            className="px-8 py-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white font-bold text-base backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Track Order & Explore Businesses
          </button>
          <button
            onClick={() => {
              onGoToTrustCenter();
              sounds.playReward();
            }}
            className="px-6 py-4 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-bold text-base backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span>Open Trust Hub</span>
          </button>
        </div>

        {/* 4-Stage Dispute Shield Highlight */}
        <div className="pt-4 flex justify-center">
          <div className="inline-flex items-center gap-4 px-5 py-3 rounded-2xl bg-[#141C38]/90 border border-violet-500/30 shadow-xl backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center">
              <Scale className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white uppercase tracking-wider">4-Stage FairResolve™ Protocol</div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-emerald-400 font-semibold">1. Raised</span>
                <span>→</span>
                <span className="text-amber-400 font-semibold">2. Seller Proposal</span>
                <span>→</span>
                <span className="text-cyan-400 font-semibold">3. Neutral Review</span>
                <span>→</span>
                <span className="text-purple-400 font-semibold">4. Resolved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DUAL MARQUEE TICKERS (Calm, parallel horizontal ticker ribbons) */}
      <div className="relative -mx-4 md:-mx-8 overflow-hidden py-3 space-y-2 select-none pointer-events-none">
        <div className="overflow-hidden bg-gradient-to-r from-[#7657FF] via-[#C052FF] via-[#FF4F87] to-[#FF9F43] text-white font-extrabold py-2.5 text-xs md:text-sm tracking-wide uppercase shadow-sm">
          <div className="animate-marquee whitespace-nowrap flex gap-8 items-center font-display">
            {Array.from({ length: 8 }).map((_, i) => (
              <React.Fragment key={i}>
                <span>Instant UPI ⚡</span>
                <span>✦</span>
                <span>RuPay & Visa 💳</span>
                <span>✦</span>
                <span>Netbanking 🏦</span>
                <span>✦</span>
                <span>Smart Wallets 👛</span>
                <span>✦</span>
                <span>Zero-Cost EMI 📆</span>
                <span>✦</span>
                <span>Verified COD 💵</span>
                <span>✦</span>
                <span>Scannable Order QR ▦</span>
                <span>✦</span>
                <span>In-Context Chat 💬</span>
                <span>✦</span>
                <span>Fair Disputes ⚖️</span>
                <span>✦</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="overflow-hidden bg-[#101730] text-slate-300 font-semibold py-2 text-xs md:text-sm tracking-wider uppercase border-y border-white/10 shadow-sm">
          <div className="animate-marquee-reverse whitespace-nowrap flex gap-8 items-center font-display">
            {Array.from({ length: 8 }).map((_, i) => (
              <React.Fragment key={i}>
                <span className="text-teal-400">fair disputes 🔥</span>
                <span>✦</span>
                <span className="text-pink-400">no cap ✨</span>
                <span>✦</span>
                <span className="text-amber-400">pay your way 💸</span>
                <span>✦</span>
                <span className="text-sky-400">trust the process ⚡</span>
                <span>✦</span>
                <span className="text-violet-400">Zero Arbitrary Freezes 🛡️</span>
                <span>✦</span>
                <span className="text-emerald-400">Geotagged Delivery Proof 📍</span>
                <span>✦</span>
                <span className="text-yellow-400">100% Indian Commerce Native 🇮🇳</span>
                <span>✦</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CORE CAPABILITIES (Rich, vibrant glassmorphism) */}
      <section className="space-y-6" id="features">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
            Everything your brand needs to get paid with dignity
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            No convoluted developer APIs or hidden percentage take rates. Designed for modern boutique shops, creators,
            and artisanal merchants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161F42] to-[#101732] border border-violet-500/20 hover:border-violet-500/50 shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white mb-5 shadow-lg shadow-violet-600/30">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Instant SmartPay Links</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Generate customizable payment links with quantity, order notes, optional 24h/72h expiry, and transparent
              exchange terms in 10 seconds flat.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161F42] to-[#101732] border border-teal-500/20 hover:border-teal-500/50 shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white mb-5 shadow-lg shadow-teal-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Autonomous QR Matrix</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every link generates its own high-res, autonomous scannable QR code. Print it on shipping slips or display
              it at your counter without external service downtime.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161F42] to-[#101732] border border-pink-500/20 hover:border-pink-500/50 shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-500 flex items-center justify-center text-white mb-5 shadow-lg shadow-pink-600/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">In-Context Order Chat</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Questions regarding sizing, embroidery, or customized packaging remain permanently bound to the payment
              record. Zero confusion across WhatsApp screenshots.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161F42] to-[#101732] border border-amber-500/20 hover:border-amber-500/50 shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mb-5 shadow-lg shadow-amber-500/30">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">4-Stage FairResolve</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Say goodbye to unilateral chargebacks. Buyers and sellers follow a clear escalation roadmap with mutual
              proposals before Reachr neutral mediation kicks in.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161F42] to-[#101732] border border-cyan-500/20 hover:border-cyan-500/50 shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white mb-5 shadow-lg shadow-cyan-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Live Cashflow Velocity</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Track 7-day revenue velocity with tabular numerals. Monitor what arrived today, pending receivables, and
              average payment turnaround times.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161F42] to-[#101732] border border-lime-500/20 hover:border-lime-500/50 shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center text-white mb-5 shadow-lg shadow-lime-500/30">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Loyalty & Repeat Recognition</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Identify your repeat patrons instantly. Award trust points and offer fast-track dispatch to your most
              valuable long-term buyers.
            </p>
          </div>
        </div>
      </section>

      {/* 4. MARKETPLACE PAIN POINTS vs REACHR GUARANTEE */}
      <section className="p-8 md:p-12 rounded-3xl bg-[#0E152E]/90 border border-white/10 space-y-8 backdrop-blur-xl">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-pink-400">Why Legacy Systems Fail</div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
            Common e-commerce nightmares eliminated
          </h2>
          <p className="text-slate-400 text-sm">
            Based on empirical complaint logs from major marketplaces and independent Indian direct-to-consumer stores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              issue: 'Marked delivered, but never arrived',
              reachr: 'Integrated live delivery timeline with verified courier proof and recipient geotag log.',
              color: 'text-violet-400',
            },
            {
              issue: 'Wrong, defective or damaged item',
              reachr: 'AI-assisted evidence checklist with clear mutual return/exchange settlement options.',
              color: 'text-pink-400',
            },
            {
              issue: 'Refund requests that loop in circles',
              reachr: 'Structured 48h resolution clock with clear next actions visible to both parties.',
              color: 'text-amber-400',
            },
            {
              issue: 'Passing blame between courier & seller',
              reachr: 'Single chronological audit trail holding chat, fulfillment stages, and payments together.',
              color: 'text-teal-400',
            },
            {
              issue: 'Arbitrary merchant balance freezing',
              reachr: 'Payment status vault with transparent release rules. No unilateral platform lockouts.',
              color: 'text-cyan-400',
            },
            {
              issue: 'Unreachable customer support bots',
              reachr: 'Direct in-thread human escalation whenever Stage 2 negotiations hit an impasse.',
              color: 'text-emerald-400',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-colors space-y-2.5"
            >
              <div className="text-sm font-bold text-rose-300 flex items-start gap-2">
                <span className="text-rose-400">✕</span>
                <span>{item.issue}</span>
              </div>
              <div className="text-xs text-slate-300 flex items-start gap-2 pl-4 border-l-2 border-emerald-500/40">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="leading-relaxed">{item.reachr}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE ROI & SAVINGS CALCULATOR */}
      <section className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#15123A] via-[#101732] to-[#0A1A2E] border border-violet-500/30 space-y-8 backdrop-blur-xl" id="calculator">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Merchant Savings Simulator</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
              Calculate your time and dispute savings
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Direct-to-consumer sellers lose an average of 14 hours per month manually verifying screenshot payments,
              tracking lost packages, and mediating angry WhatsApp voice notes.
            </p>

            <div className="pt-4 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-300">Your Monthly GMV</span>
                <span className="text-pink-400 font-mono font-bold text-base">
                  ₹{monthlyVolume.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="500000"
                step="5000"
                value={monthlyVolume}
                onChange={(e) => {
                  setMonthlyVolume(Number(e.target.value));
                  sounds.playMessage();
                }}
                className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>₹10k</span>
                <span>₹250k</span>
                <span>₹500k+</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-1">
              <div className="text-xs text-slate-400 uppercase font-semibold">Hours Saved / Mo</div>
              <div className="text-3xl font-display font-extrabold text-amber-400 font-mono">
                ~{estimatedHoursSaved}h
              </div>
              <div className="text-[11px] text-slate-500">No screenshot chasing</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-1">
              <div className="text-xs text-slate-400 uppercase font-semibold">Dispute Drop</div>
              <div className="text-3xl font-display font-extrabold text-teal-400 font-mono">-{disputeReduction}%</div>
              <div className="text-[11px] text-slate-500">Clear 4-step agreement</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-1">
              <div className="text-xs text-slate-400 uppercase font-semibold">Recovered Capital</div>
              <div className="text-3xl font-display font-extrabold text-pink-400 font-mono">
                ₹{savings.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500">In prevented chargebacks</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING WITH SUBSTANTIAL DISCOUNT & REAL GATEWAY MATH */}
      <section className="space-y-8" id="pricing">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <span>Honest Merchant Economics</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white tracking-tight">
            Predictable flat pricing. <span className="text-pink-400">0% take rate.</span>
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Unlike legacy payment gateways that siphon 2% to 3% off every single rupee you make, Reachr keeps your sales 100% yours.
          </p>

          {/* High-Impact Billing Mode Selector */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-[#0F1630] border border-white/15 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setBillingCycle('monthly');
                  sounds.playMessage();
                }}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white/[0.12] text-white shadow-md border border-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pay Monthly
              </button>
              <button
                type="button"
                onClick={() => {
                  setBillingCycle('annual');
                  sounds.playSuccess();
                }}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-pink-500/30'
                    : 'text-pink-300 hover:text-white'
                }`}
              >
                <span>Annual Pass</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-tight shadow">
                  4 Months Free (Save 44%)
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Starter Plan */}
          <div className="p-7 rounded-3xl bg-[#121936] border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-white">Starter Free</h3>
                <span className="text-[11px] font-semibold text-slate-400">Zero Card Required</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-4xl text-white font-mono">₹0</span>
                  <span className="text-slate-400 text-xs">/ forever free</span>
                </div>
                <div className="text-[11px] text-teal-400 font-semibold">0% Commission · Instant Setup</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ideal for home bakers, solo artisans, and new creators selling on Instagram or WhatsApp.
              </p>
              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Up to 25 SmartPay links / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Instant UPI QR code generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Integrated order chat thread</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Standard 4-stage dispute shield</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Direct-to-bank VPA settlement</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onGoToSeller();
                sounds.playSuccess();
              }}
              className="w-full py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Start Free (No Credit Card)
            </button>
          </div>

          {/* Growth Plan (Featured with huge discount math) */}
          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#2B1B54] via-[#1A1844] to-[#121936] border-2 border-violet-500/60 shadow-2xl shadow-violet-600/30 space-y-6 flex flex-col justify-between relative transform lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{billingCycle === 'annual' ? 'Best Value · 44% Savings' : 'Most Popular Plan'}</span>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-2xl text-white">Growth Pro</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                  Unlimited Links
                </span>
              </div>

              {/* Dynamic Price Display */}
              <div className="space-y-1">
                {billingCycle === 'annual' ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg line-through text-slate-500 font-mono">₹299</span>
                      <span className="font-display font-extrabold text-4xl text-white font-mono">₹166</span>
                      <span className="text-slate-300 text-xs">/ month</span>
                    </div>
                    <div className="text-xs text-amber-300 font-bold mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Billed ₹1,999/yr
                      </span>
                      <span>You save ₹1,589 every year!</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-extrabold text-4xl text-white font-mono">₹299</span>
                      <span className="text-slate-400 text-xs">/ month (billed monthly)</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Switch to Annual Pass anytime to save 44%</div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                For established handloom weavers, boutique designers, and e-commerce stores who need fast turnaround and priority resolution.
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                  <span className="font-semibold text-white">Unlimited SmartPay payment requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Priority Reachr Neutral Review (&lt;6h resolution)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>ProofVault image archive with EXIF geotagging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Live 7-Day cashflow velocity dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Automated WhatsApp customer share templates</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onGoToSeller();
                sounds.playSuccess();
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-pink-500/25 transition-all cursor-pointer"
            >
              {billingCycle === 'annual' ? 'Get Annual Growth at ₹1,999/yr' : 'Start Growth Plan at ₹299/mo'}
            </button>
          </div>

          {/* Studio Plan */}
          <div className="p-7 rounded-3xl bg-[#121936] border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-white">Studio Elite</h3>
                <span className="text-[11px] font-semibold text-slate-400">Teams & Co-ops</span>
              </div>

              {/* Dynamic Studio Price */}
              <div className="space-y-1">
                {billingCycle === 'annual' ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg line-through text-slate-500 font-mono">₹999</span>
                      <span className="font-display font-extrabold text-4xl text-white font-mono">₹583</span>
                      <span className="text-slate-300 text-xs">/ month</span>
                    </div>
                    <div className="text-xs text-amber-300 font-bold mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Billed ₹6,999/yr
                      </span>
                      <span>Save ₹4,989 / year!</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-extrabold text-4xl text-white font-mono">₹999</span>
                      <span className="text-slate-400 text-xs">/ month (billed monthly)</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Switch to Annual Pass for 41% savings</div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-staff artisan cooperatives, retail chains, and luxury apparel houses managing high volume.
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Everything in Growth Pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Multiple staff seats & order assignment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Custom branded checkout domain</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Dedicated compliance & arbitration concierge</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Raw CSV export & accounting integration</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onGoToSeller();
                sounds.playSuccess();
              }}
              className="w-full py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {billingCycle === 'annual' ? 'Get Studio Pass at ₹6,999/yr' : 'Start Studio at ₹999/mo'}
            </button>
          </div>
        </div>

        {/* Flat Fee vs 2% Gateway Commission Reality Check */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171D3A] via-[#152342] to-[#121936] border border-cyan-500/20 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
            <span>💡 Why Flat Pricing Beats Percentage Cut Gateways</span>
          </div>
          <p className="text-slate-300">
            Standard payment gateways (like Razorpay, Stripe, or Cashfree) charge <b className="text-white">2% + 18% GST</b> on every single sale. If your shop does ₹1,50,000 in monthly sales, you pay <span className="text-rose-400 font-bold font-mono">₹3,540 every month</span> in gateway fees. With Reachr’s flat annual plan, you pay just <span className="text-emerald-400 font-bold font-mono">₹166/month</span> and keep the remaining ₹3,374 in your bank account every month!
          </p>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <section className="max-w-3xl mx-auto space-y-4" id="faq">
        <div className="text-center space-y-2 mb-6">
          <h2 className="font-display font-extrabold text-3xl text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">Everything you need to know about the Reachr platform.</p>
        </div>

        {[
          {
            q: 'How do customers pay through a Reachr link?',
            a: 'Customers click the link or scan your order QR code. They can pay via any UPI app (Google Pay, PhonePe, Paytm, BHIM, Cred), credit/debit cards (RuPay, Visa, Mastercard), netbanking across all Indian banks, wallets, or Cash on Delivery. In this interactive suite, every transaction flow is live-simulated.',
          },
          {
            q: 'How does the 4-Stage FairResolve protocol work?',
            a: 'Stage 1: The buyer raises a dispute specifying the issue and evidence. Stage 2: The seller has 48 hours to propose a solution (exchange, partial refund, or store credit). Stage 3: If either party disagrees, Reachr neutral mediators evaluate the timeline and delivery proof. Stage 4: Resolution is formally recorded in the audit log.',
          },
          {
            q: 'Do customers need to download an application?',
            a: 'No app is required! Reachr payment links, order chat, and the Trust Center render smoothly in any mobile or desktop web browser.',
          },
          {
            q: 'Can I set an expiration time on custom quotes?',
            a: 'Yes. Sellers can choose from No Expiry, 24 Hours, 3 Days, or 7 Days to protect limited artisan inventory or special promotional pricing.',
          },
          {
            q: 'How does the Trust Center protect me as a seller?',
            a: 'Reachr timestamps order fulfillment, tracks courier milestones, and preserves parcel photos in ProofVault. If a buyer claims non-delivery, your verified evidence is right there to prevent fraudulent chargebacks.',
          },
        ].map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#121936] border border-white/10 overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggleFaq(i)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-white hover:text-pink-300 transition-colors cursor-pointer"
            >
              <span className="text-sm md:text-base">{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openFaq === i ? 'rotate-180 text-pink-400' : ''
                }`}
              />
            </button>
            {openFaq === i && (
              <div className="px-5 pb-5 text-slate-300 text-xs md:text-sm leading-relaxed border-t border-white/5 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* 8. FOOTER */}
      <footer className="pt-12 border-t border-white/10 text-slate-400 text-xs space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-xs">
                R
              </div>
              <span className="font-display font-bold text-lg text-white">Reachr</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Empowering independent Indian commerce with trust, fair dispute settlement, and instant payments.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">Payment Rails</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Instant UPI VPA Links</li>
              <li>Scannable Order QR Codes</li>
              <li>RuPay, Visa & Mastercard</li>
              <li>Netbanking & Verified COD</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">Trust & Safety</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>4-Stage FairResolve Protocol</li>
              <li>Merchant Trust Passport</li>
              <li>ProofVault Delivery Archive</li>
              <li>Arbitration Guidelines</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">Company</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>About Reachr India</li>
              <li>Seller Code of Ethics</li>
              <li>Privacy Policy</li>
              <li>Security Disclosures</li>
              {onOpenOwnerLogin && (
                <li className="pt-1">
                  <button
                    onClick={() => {
                      sounds.playMessage();
                      onOpenOwnerLogin();
                    }}
                    className="hover:text-violet-300 text-slate-500 transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
                    title="Platform administrator console for owner"
                  >
                    <Lock className="w-3 h-3 text-violet-400" />
                    <span>Platform Owner Console</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5 text-[11px]">
          <div>© 2026 Reachr Technologies Ltd. Released under the MIT License.</div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Serverless Simulation</span>
            <span>·</span>
            <span>100% Client-Side Persistence</span>
            <span>·</span>
            <span>WCAG AA Contrast Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
