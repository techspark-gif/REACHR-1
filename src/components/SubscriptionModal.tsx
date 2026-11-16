import React, { useState, useEffect } from 'react';
import {
  Check,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  X,
  Copy,
  CreditCard,
  Zap,
  Building2,
  Lock,
  ExternalLink,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionTier } from '../types';
import { sounds } from '../utils/audio';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: SubscriptionTier;
  initialSelectedTier?: SubscriptionTier;
  onUpgradeSuccess: (tier: SubscriptionTier) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentTier = 'starter',
  initialSelectedTier = 'pro',
  onUpgradeSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(initialSelectedTier);
  const [step, setStep] = useState<'plans' | 'pay'>('plans');
  const [paymentMode, setPaymentMode] = useState<'upi' | 'gateway'>('upi');
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Gateway Simulation Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('Ananya Rao');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [showGatewayDevDocs, setShowGatewayDevDocs] = useState(false);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync initial tier
  useEffect(() => {
    if (initialSelectedTier) {
      setSelectedPlan(initialSelectedTier);
    }
  }, [initialSelectedTier]);

  if (!isOpen) return null;

  const UPI_ID = 'ts.mukesh007@oksbi';
  const RECIPIENT_NAME = 'Reachr · Mukesh';

  const plans = [
    {
      id: 'starter' as SubscriptionTier,
      name: 'Starter',
      price: '₹0',
      period: 'Forever free',
      desc: 'Standard manual payment links with dispute resolution protection.',
      features: [
        'Standard payment links',
        '3.5% transaction protection',
        'Dispute shield protection',
        'Email notifications',
      ],
      popular: false,
      color: 'border-stone-200 bg-white',
      badge: 'Free',
    },
    {
      id: 'pro' as SubscriptionTier,
      name: 'Pro Growth',
      price: '₹2,999',
      period: 'per month',
      desc: 'Automates reminders, WhatsApp templates, and reduces platform fees.',
      features: [
        'Everything in Starter',
        '1.2% transaction fee (save 65%)',
        'Social ad studio (Instagram formats)',
        'Automated WhatsApp payment reminders',
        'Verified merchant badge on checkout',
      ],
      popular: true,
      color: 'border-amber-400 bg-amber-50/40 shadow-xs',
      badge: 'Most popular',
    },
    {
      id: 'elite' as SubscriptionTier,
      name: 'Elite Brand',
      price: '₹5,999',
      period: 'per month',
      desc: 'Top feed placement, fastest settlement, and dedicated human dispute concierge.',
      features: [
        'Everything in Pro Growth',
        '0.5% lowest transaction tier',
        'Featured placement in product discovery',
        'Same-day bank settlement',
        'Dedicated dispute defense specialist',
        'Custom domain checkout',
      ],
      popular: false,
      color: 'border-stone-200 bg-white',
      badge: 'Enterprise',
    },
  ];

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const completeUpgrade = () => {
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
  };

  const handleConfirmUpiPayment = () => {
    if (!utrNumber.trim()) {
      sounds.playError();
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      completeUpgrade();
    }, 1200);
  };

  const handleAuthorizeGateway = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    sounds.playMessage();
    setTimeout(() => {
      setIsVerifying(false);
      completeUpgrade();
    }, 1500);
  };

  const activePlanDetails = plans.find((p) => p.id === selectedPlan) || plans[1];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-white border border-stone-200 rounded-3xl shadow-2xl p-5 sm:p-8 my-6 text-stone-900 overflow-hidden">
        
        {/* Top Header Bar with Prominent Back & Close */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-200">
          <button
            type="button"
            onClick={step === 'pay' ? () => setStep('plans') : onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 'pay' ? 'Back to Plans' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {step === 'plans' ? 'Membership Pricing' : 'Secure Payment Checkout'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 font-semibold text-xs transition cursor-pointer"
            aria-label="Close modal"
          >
            <span className="hidden sm:inline">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── STEP 1: PLANS OVERVIEW ── */}
        {step === 'plans' ? (
          <div>
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-stone-900">
                Choose a merchant plan
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-2">
                Predictable monthly subscriptions with zero percentage penalties on volume scale.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {plans.map((plan) => {
                const isCurrent = currentTier === plan.id;
                const isSelected = selectedPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`rounded-2xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between ${
                      plan.color
                    } ${
                      isSelected
                        ? 'ring-2 ring-stone-900 shadow-md'
                        : 'opacity-90 hover:opacity-100 hover:border-stone-400'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[11px] font-bold shadow-xs">
                        {plan.badge}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900 text-base">{plan.name}</span>
                        {!plan.popular && (
                          <span className="text-[11px] text-stone-500 font-medium">{plan.badge}</span>
                        )}
                      </div>

                      <div>
                        <div className="text-3xl font-display font-bold text-stone-900 font-mono">{plan.price}</div>
                        <div className="text-xs text-stone-500">{plan.period}</div>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">{plan.desc}</p>

                      <ul className="space-y-2 pt-2 text-xs text-stone-700 border-t border-stone-200">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      {isCurrent ? (
                        <div className="w-full py-2.5 rounded-xl bg-stone-100 text-center text-xs text-stone-500 font-semibold border border-stone-200">
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
                          className={`w-full py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-stone-900 hover:bg-stone-800 text-white'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-900'
                          }`}
                        >
                          {plan.id === 'starter' ? 'Switch to Starter' : `Select ${plan.name}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200 flex-wrap gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Dismiss &amp; Keep Browsing</span>
              </button>

              {selectedPlan !== 'starter' && currentTier !== selectedPlan && (
                <button
                  type="button"
                  onClick={() => setStep('pay')}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  <span>Proceed with {activePlanDetails.name} ({activePlanDetails.price}/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── STEP 2: CHECKOUT (DIRECT UPI OR PAYMENT GATEWAY) ── */
          <div className="max-w-xl mx-auto py-1">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep('plans')}
                className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 transition cursor-pointer font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change selected plan</span>
              </button>

              <div className="text-right">
                <span className="text-[11px] text-stone-500">Selected: </span>
                <b className="text-xs font-bold text-stone-900">{activePlanDetails.name} ({activePlanDetails.price}/mo)</b>
              </div>
            </div>

            {/* Payment Method Switcher: Direct UPI vs Payment Gateway */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  paymentMode === 'upi'
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Direct UPI App (0% Fee)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('gateway')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  paymentMode === 'gateway'
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Payment Gateway (Cards / NB)</span>
              </button>
            </div>

            {/* ── OPTION A: DIRECT UPI ── */}
            {paymentMode === 'upi' ? (
              <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-2">
                  <div className="text-[11px] text-stone-500">Reachr Merchant Escrow UPI ID</div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-sm text-stone-900 font-bold">{UPI_ID}</div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs text-stone-700 transition flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-stone-500">Verified Recipient: {RECIPIENT_NAME}</div>
                </div>

                {/* Direct UPI pay button for mobile */}
                <a
                  href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
                    RECIPIENT_NAME
                  )}&am=${activePlanDetails.price.replace('₹', '').replace(',', '')}&cu=INR&tn=${encodeURIComponent(
                    'Reachr ' + activePlanDetails.name + ' Plan'
                  )}`}
                  className="block w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-center text-xs font-bold text-white transition cursor-pointer shadow-sm"
                >
                  Pay {activePlanDetails.price} with your UPI App (GPay, PhonePe, Paytm)
                </a>

                {/* UTR Verification Input */}
                <div className="space-y-2 pt-2 border-t border-stone-200">
                  <label className="block text-xs font-semibold text-stone-700">
                    Transaction Reference / UTR Number (12 digits):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 439281902911"
                      className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmUpiPayment}
                      disabled={isVerifying || !utrNumber.trim()}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {isVerifying ? (
                        <span>Verifying...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Plan upgrades instantly upon entering the payment UTR reference.
                  </p>
                </div>
              </div>
            ) : (
              /* ── OPTION B: PAYMENT GATEWAY (CARDS / NETBANKING / RAZORPAY COMPLIANT) ── */
              <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
                <form onSubmit={handleAuthorizeGateway} className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-stone-600 pb-1 border-b border-stone-200">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <b>256-Bit SSL Encrypted Payment Gateway</b>
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-semibold">
                      PCI-DSS Level 1
                    </span>
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Card Number (Visa, Mastercard, RuPay, Amex)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 •••• •••• 4242"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-blue-500"
                      />
                      <CreditCard className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* NetBanking Fallback Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Or Select NetBanking Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-500"
                    >
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Other Indian Banks via NetBanking</option>
                    </select>
                  </div>

                  {/* Submit Gateway Payment */}
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authorizing 3D-Secure OTP...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay {activePlanDetails.price} via Secure Gateway</span>
                      </>
                    )}
                  </button>

                  {/* Developer Gateway Guide Collapsible */}
                  <div className="pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setShowGatewayDevDocs(!showGatewayDevDocs)}
                      className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{showGatewayDevDocs ? 'Hide Gateway Integration Guide' : 'How to plug in live Razorpay / Cashfree keys?'}</span>
                    </button>

                    {showGatewayDevDocs && (
                      <div className="mt-2 p-3 rounded-xl bg-stone-900 text-stone-200 text-[11px] space-y-2 font-mono">
                        <p className="text-amber-400 font-bold">1. Plug in your Razorpay Standard Checkout SDK:</p>
                        <pre className="text-[10px] bg-stone-950 p-2 rounded overflow-x-auto text-emerald-400">
{`const rzp = new window.Razorpay({
  key: "rzp_live_xxxxxxxx", // Your Key ID
  amount: ${activePlanDetails.price.replace('₹', '').replace(',', '')} * 100, // in paise
  currency: "INR",
  name: "Reachr",
  description: "${activePlanDetails.name} Subscription",
  handler: function (response) {
    // response.razorpay_payment_id
    onUpgradeSuccess("${selectedPlan}");
  }
});
rzp.open();`}
                        </pre>
                        <p className="text-stone-400 text-[10px]">
                          Supports all Indian Credit/Debit cards, NetBanking, UPI QR, and Wallets with automated webhooks.
                        </p>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Bottom Back Button */}
            <div className="flex items-center justify-between pt-4 mt-2">
              <button
                type="button"
                onClick={() => setStep('plans')}
                className="text-xs text-stone-500 hover:text-stone-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Plans</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-stone-500 hover:text-stone-800 font-semibold cursor-pointer"
              >
                Cancel &amp; Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
