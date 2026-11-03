import React, { useState } from 'react';
import {
  Heart,
  X,
  Zap,
  ShieldCheck,
  Sparkles,
  Flame,
  Check,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

export interface SwipeItem {
  id: string;
  sellerName: string;
  sellerVpa: string;
  sellerTier: 'starter' | 'pro' | 'elite';
  title: string;
  category: string;
  price: number;
  image: string;
  description: string;
  deliveryDays: string;
  rating: number;
  trustScore: number;
}

const SWIPE_CATALOG: SwipeItem[] = [
  {
    id: 'item-1',
    sellerName: "Meera's Handloom",
    sellerVpa: 'meera@upi',
    sellerTier: 'elite',
    title: 'Heritage Pure Kanjivaram Silk Saree',
    category: 'Handloom & Textiles',
    price: 6800,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    description: 'Authentic pure silk zari woven saree directly from master weavers. Protected with unboxing verification.',
    deliveryDays: '3-4 Days Dispatch',
    rating: 4.9,
    trustScore: 99,
  },
  {
    id: 'item-2',
    sellerName: 'Artisan Terracotta Works',
    sellerVpa: 'terracotta@upi',
    sellerTier: 'elite',
    title: 'Handcrafted Clay Cooking Pots Set',
    category: 'Home & Kitchen',
    price: 1850,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    description: 'Eco-friendly natural clay vessels with unglazed organic seasoning for healthy traditional cooking.',
    deliveryDays: '2 Days Dispatch',
    rating: 4.8,
    trustScore: 98,
  },
  {
    id: 'item-3',
    sellerName: 'Vedic Organic Spices',
    sellerVpa: 'vedic@upi',
    sellerTier: 'pro',
    title: 'Single-Origin Malabar Black Pepper & Cardamom',
    category: 'Gourmet Food',
    price: 940,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Handpicked shade-grown spices from Wayanad with high essential oil aroma sealed in tin cans.',
    deliveryDays: '2 Days Dispatch',
    rating: 4.7,
    trustScore: 96,
  },
  {
    id: 'item-4',
    sellerName: 'Studio Brass Artifacts',
    sellerVpa: 'brass@upi',
    sellerTier: 'pro',
    title: 'Antique Finish Brass Diya Lamp Pair',
    category: 'Art & Home Decor',
    price: 2450,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    description: 'Heavy solid brass handcrafted traditional peacock lamps with velvet gift packing.',
    deliveryDays: '3 Days Dispatch',
    rating: 4.9,
    trustScore: 97,
  },
];

interface ProductSwipeDeckProps {
  onQuickOrder: (item: SwipeItem) => void;
  showToast: (msg: string) => void;
  onExit?: () => void;
}

export const ProductSwipeDeck: React.FC<ProductSwipeDeckProps> = ({
  onQuickOrder,
  showToast,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<SwipeItem[]>([]);
  const [swipeAction, setSwipeAction] = useState<'like' | 'pass' | 'super' | null>(null);

  const currentItem = SWIPE_CATALOG[currentIndex];
  const isEnd = currentIndex >= SWIPE_CATALOG.length;

  const handlePass = () => {
    sounds.playClick();
    setSwipeAction('pass');
    setTimeout(() => {
      setSwipeAction(null);
      setCurrentIndex((prev) => prev + 1);
    }, 250);
  };

  const handleLike = () => {
    sounds.playReward();
    setSwipeAction('like');
    if (currentItem) {
      setLikedItems((prev) => [...prev, currentItem]);
      showToast(`Saved "${currentItem.title}" to your favorites!`);
    }
    setTimeout(() => {
      setSwipeAction(null);
      setCurrentIndex((prev) => prev + 1);
    }, 250);
  };

  const handleInstantBuy = () => {
    if (!currentItem) return;
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    } catch {}
    sounds.playReward();
    setSwipeAction('super');
    onQuickOrder(currentItem);
    setTimeout(() => {
      setSwipeAction(null);
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden p-4 sm:p-6">
      {/* Immersive Fullscreen Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-10 shrink-0">
        <button
          onClick={onExit}
          className="p-2.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-lg">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <span className="font-bold text-white text-sm sm:text-base tracking-wide">
            Reachr Match 🔥
          </span>
        </div>

        <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-rose-400">
          {likedItems.length} Saved ❤️
        </div>
      </div>

      {/* Main Fullscreen Card Area */}
      <div className="w-full max-w-md mx-auto flex-1 flex items-center justify-center py-2 relative">
        {isEnd ? (
          <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-8 text-center text-white shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">You're All Caught Up!</h3>
            <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
              You've explored all curated featured artisan products for today. Check your saved favorites or restart your feed.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition"
              >
                Restart Swipe Feed ↺
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Return to Store Hub
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Single Screen Viewport Card */
          <div
            className={`relative w-full h-[72vh] max-h-[640px] rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300 ${
              swipeAction === 'like'
                ? 'translate-x-28 rotate-8 opacity-0'
                : swipeAction === 'pass'
                ? '-translate-x-28 -rotate-8 opacity-0'
                : swipeAction === 'super'
                ? '-translate-y-28 scale-95 opacity-0'
                : ''
            }`}
          >
            {/* Background Image filling card with dark overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>

            {/* Top Badges */}
            <div className="relative z-10 p-4 flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {currentItem.sellerTier === 'elite' && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    <span>Featured Elite Seller</span>
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{currentItem.trustScore}% Trust Score</span>
                </span>
              </div>
            </div>

            {/* Bottom Content & Controls Overlay */}
            <div className="relative z-10 p-5 space-y-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-12">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-pink-300">{currentItem.sellerName}</span>
                  <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    {currentItem.deliveryDays}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {currentItem.title}
                </h3>
                <div className="text-2xl font-black text-amber-300 mt-1">
                  ₹{currentItem.price.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {currentItem.description}
                </p>
              </div>

              {/* Tinder-Style Action Buttons */}
              <div className="flex items-center justify-center gap-5 pt-2">
                {/* Reject / Pass */}
                <button
                  onClick={handlePass}
                  className="w-14 h-14 rounded-full bg-slate-900/90 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 flex items-center justify-center shadow-xl transition active:scale-90"
                  title="Pass"
                >
                  <X className="w-7 h-7" />
                </button>

                {/* Instant 1-Tap Order */}
                <button
                  onClick={handleInstantBuy}
                  className="px-6 h-14 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-rose-600/30 transition active:scale-95"
                  title="Instant Escrow Order"
                >
                  <Zap className="w-5 h-5 fill-white text-white" />
                  <span>1-Tap Order</span>
                </button>

                {/* Favorite / Like */}
                <button
                  onClick={handleLike}
                  className="w-14 h-14 rounded-full bg-slate-900/90 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/50 flex items-center justify-center shadow-xl transition active:scale-90"
                  title="Save to Favorites"
                >
                  <Heart className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
