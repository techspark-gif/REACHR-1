import React, { useState } from 'react';
import { Check, ShieldCheck, Sparkles, Zap, ArrowRight, X, Copy, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionTier } from '../types';
import { sounds } from '../utils/audio';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: SubscriptionTier;
  onUpgradeSuccess: (tier: SubscriptionTier) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentTier = 'starter',
  onUpgradeSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('pro');
  const [step, setStep] = useState<'plans' | 'pay'>('plans');
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const UPI_ID = 'ts.mukesh007@okaxis';
  const RECIPIENT_NAME = 'Mukesh';

  const plans = [
    {
      id: 'starter' as SubscriptionTier,
      name: 'Starter',
      price: '₹0',
      period: 'Forever free',
      desc: 'Standard manual payment links and basic escrow protection.',
      features: [
        'Standard Payment Links',
        '3.5% Reachr Escrow Fee',
        'Basic Dispute Protection',
        'Standard Email Alerts',
      ],
      popular: false,
      color: 'border-slate-700 bg-slate-900/40',
      badge: 'Manual Plan',
    },
    {
      id: 'pro' as SubscriptionTier,
      name: 'Pro Growth (75% Automated)',
      price: '₹2,999',
      period: 'per month',
      desc: 'Does 75% of your work: Automated Meta Ad generation, WhatsApp payment follow-ups & auto-dispatch updates.',
      features: [
        'Everything in Starter',
        '1.2% Escrow Fee (Save 65%)',
        '⚡ 75% Automated Business Workflows',
        'AI Meta Ad Studio (Insta & FB Ready Creatives)',
        'Custom Instagram Story & Post Templates with QR',
        'Automated WhatsApp 1-Click Payment Reminders',
        'Verified Merchant Blue Shield Badge',
      ],
      popular: true,
      color: 'border-indigo-500/80 bg-gradient-to-b from-indigo-950/40 to-slate-900/60 shadow-indigo-500/20 shadow-xl',
      badge: 'High ROI • Most Popular 🔥',
    },
    {
      id: 'elite' as SubscriptionTier,
      name: 'Elite Brand (Full Autopilot)',
      price: '₹5,999',
      period: 'per month',
      desc: 'Complete autopilot: Top Spotlight on Tinder-style buyer swipe feed, VIP settlement, and priority dispute defense.',
      features: [
        'Everything in Pro Growth',
        '0.5% Escrow Fee (Lowest Industry Rate)',
        '⭐ #1 Priority Spotlight in Reachr Match Swipe Feed',
        'VIP Same-Day (12-24h) Escrow Bank Settlement',
        'Unlimited AI Social Creatives & Video Scripts',
        'Dedicated Human Dispute Concierge & Chargeback Shield',
        'Custom Domain & Branded Payment Portal',
      ],
      popular: false,
      color: 'border-amber-500/80 bg-gradient-to-b from-amber-950/30 to-slate-900/60 shadow-amber-500/20 shadow-xl',
      badge: 'Maximum Sales 🚀',
    },
  ];

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = () => {
    if (!utrNumber.trim()) {
      sounds.playError();
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      sounds.playReward();
      onUpgradeSuccess(selectedPlan);
      onClose();
      setStep('plans');
      setUtrNumber('');
    }, 1200);
  };

  const activePlanDetails = plans.find((p) => p.id === selectedPlan) || plans[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'plans' ? (
          <div>
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reachr Does 75% Of Your Sales & Fulfillment Work</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Unlock High-Velocity Merchant Subscriptions
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Automate your Instagram ads, put your products in the Tinder-style buyer swipe feed, and stop wasting hours chasing payments.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {plans.map((plan) => {
                const isCurrent = currentTier === plan.id;
                const isSelected = selectedPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      if (!isCurrent) {
                        setSelectedPlan(plan.id);
                        sounds.playClick();
                      }
                    }}
                    className={`relative flex flex-col justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? `${plan.color} ring-2 ring-indigo-400/50 scale-[1.02]`
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-indigo-600 text-white shadow-md">
                        {plan.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">{plan.name}</h3>
                        {isSelected && <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />}
                      </div>
                      <div className="flex items-baseline gap-1 my-3">
                        <span className="text-3xl font-extrabold">{plan.price}</span>
                        <span className="text-xs text-slate-400">{plan.period}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-5 leading-relaxed">{plan.desc}</p>

                      <ul className="space-y-2.5 text-xs text-slate-300">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/80">
                      {isCurrent ? (
                        <div className="text-center py-2 text-xs font-semibold text-slate-400 bg-slate-800/60 rounded-xl">
                          Current Plan
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(plan.id);
                            if (plan.id === 'starter') {
                              onUpgradeSuccess('starter');
                              onClose();
                            } else {
                              setStep('pay');
                            }
                          }}
                          className={`w-full py-2.5 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 ${
                            plan.popular
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          <span>{plan.id === 'starter' ? 'Downgrade' : 'Select ' + plan.name}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedPlan !== 'starter' && (
              <div className="flex justify-end">
                <button
                  onClick={() => setStep('pay')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-xl flex items-center gap-2"
                >
                  <span>Proceed to Upgrade ({activePlanDetails.name} - {activePlanDetails.price})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Payment Step with the User's uploaded QR */
          <div className="max-w-xl mx-auto py-2">
            <button
              onClick={() => setStep('plans')}
              className="text-xs text-slate-400 hover:text-white mb-4 flex items-center gap-1"
            >
              ← Back to plans
            </button>

            <div className="text-center mb-6">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                UPI Direct Subscription Activation
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-2">
                Upgrade to {activePlanDetails.name} ({activePlanDetails.price}/mo)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Scan using Google Pay, PhonePe, Paytm, or any UPI app to activate immediately.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl flex flex-col items-center">
              {/* Dynamic Animated QR Code Card with holographic pulse and scanner beam */}
              <div className="relative group my-2">
                {/* Ambient glowing aura */}
                <div className="absolute -inset-2 bg-gradient-to-r from-teal-500 via-indigo-500 to-pink-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />

                {/* Main QR Card */}
                <div className="relative p-3 bg-white rounded-3xl shadow-2xl max-w-[270px] overflow-hidden border border-slate-200/50">
                  {/* Laser Scanning Line Animation */}
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] z-20 pointer-events-none"
                    style={{
                      animation: 'scanLine 2.4s ease-in-out infinite alternate',
                    }}
                  />

                  {/* Corner Target Accents */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-600 rounded-tl z-10" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-600 rounded-tr z-10" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-600 rounded-bl z-10" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-600 rounded-br z-10" />

                  <img
                    src="/subscription-qr.jpg"
                    alt="Subscription UPI QR Code"
                    className="w-full h-auto rounded-2xl object-contain transform transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Pulsing Live Scanner Pill */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-slate-950/90 backdrop-blur-md rounded-full border border-emerald-500/50 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Live UPI Scanner Active
                    </span>
                  </div>
                </div>
              </div>

              {/* UPI ID Details */}
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl w-full max-w-sm justify-between mb-4">
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Official UPI ID ({RECIPIENT_NAME})
                  </div>
                  <div className="text-sm font-mono text-emerald-400 font-semibold">{UPI_ID}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Copy UPI ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Deep link for mobile app */}
              <a
                href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
                  RECIPIENT_NAME
                )}&am=${activePlanDetails.price.replace('₹', '').replace(',', '')}&cu=INR&tn=${encodeURIComponent(
                  'Reachr ' + activePlanDetails.name + ' Subscription'
                )}`}
                className="w-full max-w-sm py-2.5 px-4 mb-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-center text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                Tap to Pay via Mobile UPI App
              </a>

              {/* UTR Verification Input */}
              <div className="w-full max-w-sm space-y-2">
                <label className="block text-xs font-medium text-slate-300 text-left">
                  Enter UPI Transaction Reference / UTR (12 digits):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 439281902911"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isVerifying || !utrNumber.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    {isVerifying ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 text-left">
                  Instant activation upon entering payment confirmation UTR.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
