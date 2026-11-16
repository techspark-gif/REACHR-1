import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Lock,
  Tag,
  Star,
  Zap,
  Truck,
  Heart,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EXPLORE_CATALOG } from '../data/initialData';
import { BusinessProduct, OrderLink } from '../types';
import { sounds } from '../utils/audio';

interface DiscoverPageProps {
  onBackToHome: () => void;
  onGoToBuyer: (orderId?: string) => void;
  onGoToSeller: () => void;
  onCreateOrder?: (orderData: Partial<OrderLink>) => void;
  showToast: (msg: string) => void;
  theme?: 'light' | 'purple';
}

const CATEGORIES = [
  'All',
  'Luxury Fashion & Leather',
  'High-End Audio & Tech',
  'Horology & Jewelry',
  'Design & Living',
  'Artisan & Heritage',
];

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  onBackToHome,
  onGoToBuyer,
  onGoToSeller,
  onCreateOrder,
  showToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<BusinessProduct | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'upi' | 'gateway'>('upi');
  const [buyerName, setBuyerName] = useState('Ananya Rao');
  const [buyerPhone, setBuyerPhone] = useState('+91 98451 22390');
  const [buyerAddress, setBuyerAddress] = useState('Indiranagar, Bengaluru, KA - 560038');
  const [selectedRail, setSelectedRail] = useState('Google Pay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let list = [...EXPLORE_CATALOG];

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.businessName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedProducts((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        sounds.playSuccess();
        showToast('Saved to your favorites wishlist');
      } else {
        sounds.playMessage();
      }
      return next;
    });
  };

  const handleConfirmOrder = () => {
    if (!selectedProduct) return;
    setIsOrdering(true);

    const randomCode = 'RCH-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newOrderId = `l-${Date.now()}`;

    if (paymentMode === 'upi') {
      // Direct UPI redirect to ts.mukesh007@oksbi through selected UPI app
      const upiUrl = `upi://pay?pa=ts.mukesh007@oksbi&pn=Reachr&am=${selectedProduct.price}&cu=INR&tn=${encodeURIComponent(
        selectedProduct.title.substring(0, 30)
      )}`;
      try {
        window.location.href = upiUrl;
      } catch {}
    }

    setTimeout(() => {
      if (onCreateOrder) {
        onCreateOrder({
          id: newOrderId,
          linkCode: randomCode,
          customerName: buyerName,
          customerPhone: buyerPhone,
          amount: selectedProduct.price,
          note: `${selectedProduct.title} - ${buyerAddress}`,
          quantity: 1,
          terms: selectedProduct.craftDetails || 'Reachr Verified 7-day Doorstep Delivery Protection.',
          createdAt: 'Just now',
          businessName: selectedProduct.businessName,
          businessVpa: 'ts.mukesh007@oksbi',
          status: 'paid',
          deliveryStage: 1, // Order Confirmed
          paymentMethod: {
            rail: paymentMode === 'upi' ? 'upi' : 'card',
            name: paymentMode === 'upi' ? `${selectedRail} · UPI` : `Reachr PG · ${selectedBank}`,
            ref: `${paymentMode === 'upi' ? 'UPI' : 'PG'}${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            paidAt: 'Just now',
          },
        });
      }

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2bc4b4', '#0071e3', '#ff9f0a'],
        });
      } catch {}

      sounds.playReward();
      showToast(`Order ${randomCode} placed with delivery escrow protection!`);
      setIsOrdering(false);
      setSelectedProduct(null);

      // Offer to track live in buyer hub
      setTimeout(() => {
        onGoToBuyer(newOrderId);
      }, 800);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-24 transition-colors duration-300">
      {/* ── Top Header Navigation ── */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur-xl border-b border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--mut)] hover:text-[var(--fg)] transition-colors px-3 py-1.5 rounded-full hover:bg-[var(--line)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Verified Makers
            </span>

            <button
              onClick={() => onGoToBuyer()}
              className="px-4 py-2 text-xs font-semibold rounded-full bg-[var(--bg2)] text-[var(--fg)] hover:bg-[var(--line)] border border-[var(--line)] transition-all"
            >
              Track Orders
            </button>
            <button
              onClick={onGoToSeller}
              className="px-4 py-2 text-xs font-semibold rounded-full bg-[var(--blue)] text-white hover:opacity-90 transition-all shadow-sm"
            >
              Seller Studio
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden pt-12 pb-10 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--line)] text-xs font-medium text-[var(--mut)] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Reachr Verified Discover Marketplace
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
          Discover Artisanal India.<br />
          <span className="grad">Protected by Reachr.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--mut)] leading-relaxed mb-8">
          Shop direct from verified creators on Instagram, WhatsApp &amp; YouTube. Pay securely via UPI — funds are held safely in escrow until you verify doorstep delivery.
        </p>

        {/* ── Search & Filter Bar ── */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mut)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search handloom, kundan jewelry, high-grown teas, brass artifacts..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--bg2)] border border-[var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] text-[var(--fg)] placeholder:text-[var(--mut)] shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[var(--mut)] hover:text-[var(--fg)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-2xl bg-[var(--bg2)] border border-[var(--line)] text-xs font-semibold text-[var(--fg)] focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* ── Category Chips ── */}
        <div className="flex items-center justify-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                sounds.playMessage();
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[var(--fg)] text-[var(--bg)] shadow-md'
                  : 'bg-[var(--bg2)] text-[var(--mut)] hover:text-[var(--fg)] hover:bg-[var(--line)] border border-[var(--line)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Aesthetic Products Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-[var(--mut)]">
            Showing <span className="text-[var(--fg)]">{filteredProducts.length}</span> authentic artisan products
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Escrow hold active on all purchases</span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg2)] rounded-3xl border border-[var(--line)] p-8">
            <ShoppingBag className="w-12 h-12 text-[var(--mut)] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold mb-2">No matching products found</h3>
            <p className="text-sm text-[var(--mut)] max-w-md mx-auto mb-6">
              Try searching for "handloom", "saree", "kundan", or clear your category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-5 py-2.5 rounded-full bg-[var(--blue)] text-white text-xs font-semibold shadow"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const isLiked = !!likedProducts[product.id];

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-[var(--card)] rounded-3xl border border-[var(--line)] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-900">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Like button */}
                    <button
                      onClick={(e) => toggleLike(product.id, e)}
                      aria-label="Save to favorites"
                      className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                        isLiked
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-white/80 dark:bg-black/60 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-black'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Tags */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
                      {product.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/65 backdrop-blur-md text-white border border-white/10"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Merchant Row */}
                      <div className="flex items-center justify-between text-xs text-[var(--mut)] mb-2">
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {product.businessName}
                        </span>
                        <span>{product.category}</span>
                      </div>

                      <h3 className="font-bold text-base sm:text-lg tracking-tight mb-2 line-clamp-1 group-hover:text-[var(--blue)] transition-colors">
                        {product.title}
                      </h3>

                      <p className="text-xs text-[var(--mut)] line-clamp-2 leading-relaxed mb-4">
                        {product.description}
                      </p>
                    </div>

                    <div>
                      {/* Craft detail micro-chip */}
                      {product.craftDetails && (
                        <div className="p-2.5 rounded-xl bg-[var(--bg2)] text-[11px] text-[var(--mut)] mb-4 border border-[var(--line)] flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-sky-500 flex-none" />
                          <span className="truncate">{product.craftDetails}</span>
                        </div>
                      )}

                      {/* Price & Action Row */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--line)]">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-[var(--mut)] block">
                            Direct UPI Price
                          </span>
                          <span className="text-xl font-bold tracking-tight">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            sounds.playSuccess();
                          }}
                          className="px-4 py-2.5 rounded-2xl bg-[var(--blue)] hover:opacity-90 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Order Protected</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Instant Checkout Modal with Escrow Guarantee ── */}
      {selectedProduct && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProduct(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-[var(--card)] text-[var(--fg)] rounded-3xl p-5 sm:p-7 border border-[var(--line)] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            {/* Top Bar with Back and Close */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--line)]">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg2)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--fg)] transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Discover</span>
              </button>

              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Escrow</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-7 h-7 rounded-xl bg-[var(--bg2)] hover:bg-[var(--line)] flex items-center justify-center text-[var(--mut)] hover:text-[var(--fg)] transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-3">Complete Your Order</h2>

            {/* Product Summary */}
            <div className="flex gap-3.5 p-3.5 rounded-2xl bg-[var(--bg2)] border border-[var(--line)] mb-4">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="w-16 h-16 rounded-xl object-cover flex-none"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate">{selectedProduct.title}</h4>
                <p className="text-xs text-[var(--mut)]">By {selectedProduct.businessName}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-base font-bold text-[var(--blue)]">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                    Escrow Protected
                  </span>
                </div>
              </div>
            </div>

            {/* Buyer Details Form */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--mut)] mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--blue)] text-[var(--fg)]"
                  placeholder="e.g. Ananya Rao"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--mut)] mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--blue)] text-[var(--fg)]"
                  placeholder="+91 98451 22390"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--mut)] mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--blue)] text-[var(--fg)]"
                  placeholder="Full street address and PIN code"
                />
              </div>

              {/* Payment Mode Selector: Direct UPI vs Payment Gateway */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-[var(--mut)] mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--bg2)] rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('upi')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      paymentMode === 'upi'
                        ? 'bg-[var(--card)] text-[var(--fg)] shadow-xs border border-[var(--line)]'
                        : 'text-[var(--mut)] hover:text-[var(--fg)]'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Direct UPI (0% Fee)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('gateway')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      paymentMode === 'gateway'
                        ? 'bg-[var(--card)] text-[var(--fg)] shadow-xs border border-[var(--line)]'
                        : 'text-[var(--mut)] hover:text-[var(--fg)]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                    <span>Gateway (Cards / NB)</span>
                  </button>
                </div>

                {paymentMode === 'upi' ? (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--mut)] mb-1">Select UPI App</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((rail) => (
                        <button
                          key={rail}
                          type="button"
                          onClick={() => setSelectedRail(rail)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between ${
                            selectedRail === rail
                              ? 'border-[var(--blue)] bg-[var(--blue)]/10 text-[var(--blue)]'
                              : 'border-[var(--line)] bg-[var(--bg)] text-[var(--fg)]'
                          }`}
                        >
                          <span>{rail}</span>
                          {selectedRail === rail && <CheckCircle className="w-3.5 h-3.5 text-[var(--blue)]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--mut)] mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 •••• •••• 4242"
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--line)] text-xs text-[var(--fg)] font-mono focus:outline-none focus:border-[var(--blue)]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--mut)] mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--line)] text-xs text-[var(--fg)] font-mono focus:outline-none focus:border-[var(--blue)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--mut)] mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--line)] text-xs text-[var(--fg)] font-mono focus:outline-none focus:border-[var(--blue)]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--mut)] mb-1">Or NetBanking Bank</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--line)] text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--blue)]"
                      >
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>State Bank of India</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Escrow Trust Box */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 mb-5 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-none mt-0.5" />
              <div className="space-y-0.5">
                <b className="block font-semibold">Protected Escrow Guarantee:</b>
                <span className="text-[11px] leading-tight block">
                  Reachr holds ₹{selectedProduct.price.toLocaleString('en-IN')} safely. The seller is only disbursed funds once verified courier delivers the parcel.
                </span>
                {paymentMode === 'upi' && (
                  <div className="pt-0.5 text-[10px] font-mono text-[var(--fg)] flex items-center gap-1">
                    <span>UPI Recipient:</span>
                    <span className="font-bold text-[var(--blue)]">ts.mukesh007@oksbi</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--bg2)] text-xs font-semibold text-[var(--fg)] hover:bg-[var(--line)] transition-all cursor-pointer"
              >
                Back / Cancel
              </button>
              <button
                type="button"
                disabled={isOrdering}
                onClick={handleConfirmOrder}
                className="flex-[2] py-2.5 rounded-xl bg-[var(--blue)] text-white text-xs font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isOrdering ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing {paymentMode === 'upi' ? 'UPI Escrow' : 'Gateway Auth'}...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Pay ₹{selectedProduct.price.toLocaleString('en-IN')} via {paymentMode === 'upi' ? selectedRail : 'Gateway'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
