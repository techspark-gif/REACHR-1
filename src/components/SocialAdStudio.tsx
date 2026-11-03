import React, { useState } from 'react';
import {
  Instagram,
  Facebook,
  Share2,
  Copy,
  Download,
  Sparkles,
  ShieldCheck,
  QrCode,
  Check,
  Smartphone,
  Layers,
  Wand2,
} from 'lucide-react';
import { SellerCredentials, SubscriptionTier } from '../types';
import { SimpleSvgQr } from '../utils/qr';
import { sounds } from '../utils/audio';

interface SocialAdStudioProps {
  seller: SellerCredentials;
  onOpenSubscriptionModal: () => void;
  showToast: (msg: string) => void;
}

export const SocialAdStudio: React.FC<SocialAdStudioProps> = ({
  seller,
  onOpenSubscriptionModal,
  showToast,
}) => {
  const isProOrElite = seller.subscriptionTier === 'pro' || seller.subscriptionTier === 'elite';

  const [platform, setPlatform] = useState<'instagram' | 'facebook'>('instagram');
  const [adFormat, setAdFormat] = useState<'story' | 'feed'>('story');
  const [headline, setHeadline] = useState('Protected Payments with Reachr Delivery Guarantee');
  const [discountTag, setDiscountTag] = useState('100% Escrow Protected');
  const [productTitle, setProductTitle] = useState('Authentic Handcrafted Sarees & Home Decor');
  const [priceText, setPriceText] = useState('₹1,499');
  const [bgStyle, setBgStyle] = useState<'indigo' | 'emerald' | 'amber' | 'rose'>('indigo');
  const [copiedCaption, setCopiedCaption] = useState(false);

  const bgStyles = {
    indigo: 'from-indigo-950 via-slate-900 to-indigo-900 border-indigo-500/40',
    emerald: 'from-emerald-950 via-slate-900 to-teal-900 border-emerald-500/40',
    amber: 'from-amber-950 via-slate-900 to-orange-900 border-amber-500/40',
    rose: 'from-rose-950 via-slate-900 to-purple-900 border-rose-500/40',
  };

  const generatedCaption = `✨ Shop securely with ${seller.businessName}!
🛡️ Every order is backed by Reachr Escrow & Delivery Protection:
• Your money is held safe until you verify delivery.
• Zero risk of delivery scam or unfulfilled orders.
• Tap link in bio or scan QR to order now: https://reachr.pay/${seller.vpa.split('@')[0]}
#ReachrProtected #ShopLocal #${seller.category?.replace(/[^a-zA-Z0-9]/g, '') || 'OnlineShopping'} #ShopSafe`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(generatedCaption);
    setCopiedCaption(true);
    sounds.playClick();
    showToast('Ad caption copied to clipboard!');
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleDownloadPreview = () => {
    sounds.playReward();
    showToast('Ad creative downloaded! Ready to post on Instagram/Facebook.');
  };

  if (!isProOrElite) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 p-8 text-white">
        <div className="absolute top-0 right-0 translate-x-10 -translate-y-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automate 75% Of Your Work • Pro & Elite Only</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Automated Instagram & Facebook Ad Studio
          </h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Reachr handles the heavy lifting: generate high-converting Instagram Stories, Feed Posts, and Meta Ads in seconds with embedded smart payment QR codes and escrow trust protection.
          </p>
          <button
            onClick={onOpenSubscriptionModal}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-xl flex items-center gap-2"
          >
            <span>Upgrade to Pro (₹2,999/mo)</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Social Ad Generator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Instagram & Facebook Custom Ad Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create high-converting social ads with verified Reachr delivery protection & QR checkout.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setPlatform('instagram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              platform === 'instagram'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </button>
          <button
            onClick={() => setPlatform('facebook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              platform === 'facebook'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Facebook className="w-3.5 h-3.5" />
            <span>Facebook</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setAdFormat('story')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                adFormat === 'story'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
              }`}
            >
              Story / Reel (9:16)
            </button>
            <button
              onClick={() => setAdFormat('feed')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                adFormat === 'feed'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
              }`}
            >
              Feed Post / Square (1:1)
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Headline Text</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Product Title</label>
            <input
              type="text"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Highlight Price</label>
              <input
                type="text"
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Trust Pill</label>
              <input
                type="text"
                value={discountTag}
                onChange={(e) => setDiscountTag(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Background Theme</label>
            <div className="flex gap-2">
              {(['indigo', 'emerald', 'amber', 'rose'] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => setBgStyle(color)}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    color === 'indigo'
                      ? 'bg-indigo-600'
                      : color === 'emerald'
                      ? 'bg-emerald-600'
                      : color === 'amber'
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
                  } ${bgStyle === color ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                />
              ))}
            </div>
          </div>

          {/* Social Caption Block */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-300">Auto-Generated Social Caption</span>
              <button
                onClick={handleCopyCaption}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? 'Copied' : 'Copy Caption'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={generatedCaption}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 font-mono resize-none"
            />
          </div>
        </div>

        {/* Live Ad Preview */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-[340px]">
            <div
              className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${
                bgStyles[bgStyle]
              } p-6 shadow-2xl transition-all ${
                adFormat === 'story' ? 'aspect-[9/16] flex flex-col justify-between' : 'aspect-square flex flex-col justify-between'
              }`}
            >
              {/* Header inside Ad */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-xs text-white">
                      {seller.businessName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight flex items-center gap-1">
                        <span>{seller.businessName}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-[10px] text-slate-300">Verified Seller • Reachr Escrow</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {discountTag}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold leading-snug mt-3">
                  {headline}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{productTitle}</p>
              </div>

              {/* Center Price Tag & Protection badge */}
              <div className="my-auto py-3 text-center">
                <div className="inline-block bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Special Direct Price</div>
                  <div className="text-3xl font-black text-amber-300">{priceText}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Funds held in escrow until arrival</span>
                  </div>
                </div>
              </div>

              {/* Bottom QR & CTA */}
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div className="w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center shrink-0">
                  <SimpleSvgQr text={`https://reachr.pay/${seller.vpa}`} size={52} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[11px] font-bold text-white">Scan or Click Link to Order</div>
                  <div className="text-[10px] text-slate-400">100% Delivery Protected</div>
                  <div className="text-[10px] text-indigo-400 font-semibold mt-0.5">UPI • Card • NetBanking</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleDownloadPreview}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Creative</span>
              </button>
              <button
                onClick={handleCopyCaption}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
