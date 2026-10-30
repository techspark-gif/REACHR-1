import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ArrowRight, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { sounds } from '../utils/audio';

interface SellerLoginViewProps {
  onSuccessLogin: () => void;
  onBackToHub: () => void;
}

export const SellerLoginView: React.FC<SellerLoginViewProps> = ({
  onSuccessLogin,
  onBackToHub,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your merchant email/phone and password.');
      sounds.playMessage();
      return;
    }

    setIsLoading(true);
    // Simulate swift secure auth check
    setTimeout(() => {
      setIsLoading(false);
      sounds.playSuccess();
      onSuccessLogin();
    }, 450);
  };

  const handleQuickDemoLogin = () => {
    setEmail('meera@handloom.in');
    setPassword('reachr2026');
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      sounds.playSuccess();
      onSuccessLogin();
    }, 300);
  };

  return (
    <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-12">
      {/* Return to home */}
      <button
        onClick={onBackToHub}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Return to Home</span>
      </button>

      {/* Login Card */}
      <div className="rounded-3xl p-8 bg-[#0F1528]/90 backdrop-blur-2xl border border-pink-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow pill */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
            <Lock className="w-7 h-7" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/15 text-pink-300 border border-pink-500/30">
            Merchant Access Guard
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">Seller Studio Login</h2>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Authorized merchant credentials required to issue SmartPay links, manage orders, and access payout balances.
          </p>
        </div>

        {/* Demo Fast Login Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/25 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-pink-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> Demo Merchant Profile
            </span>
            <span className="text-[10px] text-slate-400">Pre-configured</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            Testing credentials: <code className="text-pink-300 font-mono">meera@handloom.in</code> / <code className="text-pink-300 font-mono">reachr2026</code>
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

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Merchant Email or Phone
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. meera@handloom.in or +91 98451..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <label className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Password or Merchant PIN
              </label>
              <span className="text-[10px] text-slate-400">reachr2026</span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {/* Security Guarantee */}
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
