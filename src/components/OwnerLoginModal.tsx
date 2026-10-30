import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, X, AlertCircle, KeyRound } from 'lucide-react';
import { sounds } from '../utils/audio';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [email, setEmail] = useState('madurimadu848@gmail.com');
  const [password, setPassword] = useState('reachr-owner-2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide owner email and master key.');
      sounds.playError();
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      sounds.playReward();
      onSuccessLogin();
      onClose();
    }, 450);
  };

  const handleQuickDemoOwner = () => {
    setEmail('madurimadu848@gmail.com');
    setPassword('reachr-owner-2026');
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      sounds.playReward();
      onSuccessLogin();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F162B] border border-violet-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/60 text-white space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close owner login"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 text-[11px] font-extrabold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Platform Owner Authentication</span>
          </div>
          <h2 className="font-display font-black text-2xl text-white">
            Universal Control Desk
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Restricted access for platform owner governance: Stage 3 FairResolve™ dispute mediation, escrow custody, and merchant verification.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Owner Email Account</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@reachr.in"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-violet-500 text-white text-sm outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Master Owner Passkey</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-violet-500 text-white text-sm outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating Owner...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Enter Universal Control</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Owner Auto-Fill Button */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="text-[11px] text-slate-400 text-center font-medium">Quick Authenticate for Demo</div>
          <button
            type="button"
            onClick={handleQuickDemoOwner}
            className="w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-violet-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Sign in as Owner ({'madurimadu848@gmail.com'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
