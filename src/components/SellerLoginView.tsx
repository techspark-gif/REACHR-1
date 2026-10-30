import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Store,
  UserPlus,
  Building2,
  User,
  Phone,
  Sparkles,
  MapPin,
  Tag,
  CreditCard,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { SellerCredentials } from '../types';

interface SellerLoginViewProps {
  onSuccessLogin: (sellerData?: SellerCredentials) => void;
  onBackToHub: () => void;
}

const CATEGORY_OPTIONS = [
  'Handloom & Textiles',
  'Handmade & Artisan Crafts',
  'Fashion & Apparel',
  'Jewelry & Accessories',
  'Gourmet Food & Baking',
  'Art & Home Decor',
  'Electronics & Gadgets',
  'General Retail & Services',
];

export const SellerLoginView: React.FC<SellerLoginViewProps> = ({
  onSuccessLogin,
  onBackToHub,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State (First Time Sellers)
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regVpa, setRegVpa] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [city, setCity] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to load registered merchants from localStorage
  const getRegisteredMerchants = (): SellerCredentials[] => {
    try {
      const stored = localStorage.getItem('reachr_registered_sellers_v4');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPassword = loginPassword.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please provide both your merchant email/phone and password.');
      sounds.playMessage();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Check pre-configured demo seller
      if (cleanEmail === 'meera@handloom.in' && cleanPassword === 'reachr2026') {
        const demoSeller: SellerCredentials = {
          email: 'meera@handloom.in',
          businessName: "Meera's Handloom",
          ownerName: "Meera R.",
          vpa: 'meera@upi',
          phone: '+91 98451 22390',
          isVerified: true,
          city: 'Bengaluru, Karnataka',
          category: 'Handloom & Textiles',
          trustScore: 99,
        };
        setIsLoading(false);
        sounds.playSuccess();
        onSuccessLogin(demoSeller);
        return;
      }

      // Check user-registered merchants in localStorage
      const registered = getRegisteredMerchants();
      const match = registered.find(
        (m) =>
          (m.email.toLowerCase() === cleanEmail || m.phone === cleanEmail) &&
          (m.password === cleanPassword || !m.password)
      );

      if (match) {
        setIsLoading(false);
        sounds.playSuccess();
        onSuccessLogin(match);
        return;
      }

      // If user typed wrong credentials
      const emailExists = registered.some(
        (m) => m.email.toLowerCase() === cleanEmail || m.phone === cleanEmail
      );

      setIsLoading(false);
      sounds.playMessage();

      if (emailExists) {
        setError('Incorrect password. Please verify your merchant password.');
      } else {
        setError(
          'Merchant account not found. If this is your first time, please click the "Register Store" tab above to create an account!'
        );
      }
    }, 450);
  };

  // Quick 1-click login for demo
  const handleQuickDemoLogin = () => {
    setLoginEmail('meera@handloom.in');
    setLoginPassword('reachr2026');
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      sounds.playSuccess();
      onSuccessLogin({
        email: 'meera@handloom.in',
        businessName: "Meera's Handloom",
        ownerName: "Meera R.",
        vpa: 'meera@upi',
        phone: '+91 98451 22390',
        isVerified: true,
        city: 'Bengaluru, Karnataka',
        category: 'Handloom & Textiles',
        trustScore: 99,
      });
    }, 300);
  };

  // Auto-fill sample store for first-time registration testing
  const handleAutoFillSampleStore = () => {
    setBusinessName("Arjun's Handcrafted Leather");
    setOwnerName('Arjun Sharma');
    setRegEmail('arjun@artisanstore.in');
    setRegPhone('+91 98765 43210');
    setRegVpa('arjun@upi');
    setCategory('Handmade & Artisan Crafts');
    setCity('Jaipur, Rajasthan');
    setRegPassword('seller123');
    setError(null);
    sounds.playMessage();
  };

  // Handle Register submission (First Time Sellers)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim()) {
      setError('Please provide your Store or Business Name.');
      sounds.playMessage();
      return;
    }

    if (!ownerName.trim()) {
      setError('Please provide the Merchant or Owner Name.');
      sounds.playMessage();
      return;
    }

    if (!regEmail.trim()) {
      setError('Please provide your Merchant Email address.');
      sounds.playMessage();
      return;
    }

    if (!regVpa.trim() || !regVpa.includes('@')) {
      setError('Please enter a valid Payout UPI ID (must contain "@", e.g. storename@upi or 9876543210@paytm).');
      sounds.playMessage();
      return;
    }

    if (!regPassword.trim() || regPassword.trim().length < 4) {
      setError('Please choose a password or PIN with at least 4 characters.');
      sounds.playMessage();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newMerchant: SellerCredentials = {
        id: `merchant-${Date.now()}`,
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim() || '+91 98000 00000',
        vpa: regVpa.trim().toLowerCase(),
        password: regPassword.trim(),
        category,
        city: city.trim() || 'India',
        isVerified: true,
        trustScore: 99,
      };

      // Save to localStorage registered merchants list
      try {
        const existing = getRegisteredMerchants();
        // remove existing with same email if re-registering
        const filtered = existing.filter((m) => m.email !== newMerchant.email);
        localStorage.setItem(
          'reachr_registered_sellers_v4',
          JSON.stringify([...filtered, newMerchant])
        );
      } catch {}

      setIsLoading(false);
      sounds.playSuccess();

      // Trigger celebratory confetti for first-time onboarding
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      onSuccessLogin(newMerchant);
    }, 550);
  };

  return (
    <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-8">
      {/* Return to home */}
      <button
        onClick={onBackToHub}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Return to Home</span>
      </button>

      {/* Main Container Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0F1528]/95 backdrop-blur-2xl border border-pink-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow pill */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl -z-10" />

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
            {activeTab === 'login' ? <Lock className="w-7 h-7" /> : <Store className="w-7 h-7" />}
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/15 text-pink-300 border border-pink-500/30">
              {activeTab === 'login' ? 'Merchant Access Guard' : 'First-Time Onboarding'}
            </span>
          </div>

          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
            {activeTab === 'login' ? 'Seller Studio Login' : 'Register Your Merchant Store'}
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            {activeTab === 'login'
              ? 'Sign in to generate SmartPay escrow links, manage orders, and track your settlements.'
              : 'Create your merchant account to start accepting direct UPI payments with escrow protection.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register (First Time) */}
        <div className="p-1 rounded-2xl bg-white/[0.04] border border-white/10 flex gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Store (First Time)</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              New
            </span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: LOGIN VIEW */}
        {activeTab === 'login' && (
          <div className="space-y-5">
            {/* Demo Fast Login Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/25 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-pink-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> Demo Merchant Profile
                </span>
                <span className="text-[10px] text-slate-400">Pre-configured</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                Quick testing credentials: <code className="text-pink-300 font-mono">meera@handloom.in</code> /{' '}
                <code className="text-pink-300 font-mono">reachr2026</code>
              </p>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-3 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/40 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>1-Click Demo Login as Meera's Handloom</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Merchant Email or Phone
                </label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. meera@handloom.in or your registered email"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <label className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Password or Merchant PIN
                  </label>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-sm shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <span>Sign In to Seller Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                }}
                className="text-xs text-pink-300 hover:text-pink-200 underline font-medium cursor-pointer"
              >
                First time selling on Reachr? Register your store here →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER STORE (FIRST TIME SELLERS) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Auto-fill sample button for quick testing */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20">
              <span className="text-xs text-pink-200 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Want to test quickly?
              </span>
              <button
                type="button"
                onClick={handleAutoFillSampleStore}
                className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/40 text-[11px] font-bold transition-all cursor-pointer"
              >
                Auto-fill Sample Store
              </button>
            </div>

            {/* Grid for Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Store Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-pink-400" /> Store / Brand Name *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Arjun's Handcrafted Leather"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {/* Owner Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Merchant / Owner Name *
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141C33] border border-white/10 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#141C33] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Business Email *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. arjun@artisanstore.in"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile / WhatsApp
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {/* Payout UPI ID (VPA) */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <label className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Direct Payout UPI ID (VPA) *
                  </label>
                  <span className="text-[10px] text-emerald-400 font-normal">Escrow Payout Destination</span>
                </div>
                <input
                  type="text"
                  value={regVpa}
                  onChange={(e) => setRegVpa(e.target.value)}
                  placeholder="e.g. yourstore@upi or 9876543210@paytm"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-emerald-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <p className="text-[10px] text-slate-400">
                  Buyer payments will be released directly to this UPI address after verified order delivery.
                </p>
              </div>

              {/* City / Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> City & State
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Jaipur, Rajasthan"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Create Password / PIN *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>
            </div>

            {/* Merchant Guarantee Pill */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-around text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero Onboarding Fee
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400" /> 100% Escrow Protected
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-sm shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Registering Merchant Store...</span>
              ) : (
                <>
                  <span>Complete Registration & Open Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-white underline font-medium cursor-pointer"
              >
                Already have a registered merchant account? Sign in here
              </button>
            </div>
          </form>
        )}

        {/* Security Guarantee Footer */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encrypted
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> Direct UPI Settlements
          </span>
        </div>
      </div>
    </div>
  );
};
