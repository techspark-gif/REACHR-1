import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../utils/audio';

interface LandingViewProps {
  onGoToSeller: () => void;
  onGoToBuyer: () => void;
  onGoToTrustCenter?: () => void;
  onGoToDiscover?: () => void;
  onOpenSubscriptionModal?: (tier?: 'starter' | 'pro' | 'elite') => void;
  theme?: 'light' | 'purple';
}

interface DiscoverItem {
  name: string;
  price: number;
  seller: string;
  sponsored: boolean;
  from: string;
  to: string;
}

const DISCOVER_DATA: Record<string, DiscoverItem[]> = {
  Sarees: [
    { name: 'Kalamkari silk saree', price: 3200, seller: "Asha’s Looms", sponsored: true, from: '#ffd6a8', to: '#ff9f8a' },
    { name: 'Handloom cotton saree', price: 1450, seller: 'Vani Weaves', sponsored: false, from: '#ffe3b3', to: '#f6b78a' },
    { name: 'Ikat dupatta', price: 980, seller: 'Rekha Textiles', sponsored: false, from: '#ffcfc0', to: '#f59f8f' },
  ],
  Handmade: [
    { name: 'Terracotta planter set', price: 650, seller: 'Clay & Co', sponsored: false, from: '#bfeadf', to: '#7fcfbd' },
    { name: 'Macramé wall hanging', price: 890, seller: 'Knot Studio', sponsored: true, from: '#e6f3d8', to: '#a9d6a0' },
    { name: 'Brass diya pair', price: 420, seller: 'Deepa Crafts', sponsored: false, from: '#ffe9b0', to: '#e8c26b' },
  ],
  Food: [
    { name: 'Homemade mango pickle', price: 320, seller: "Amma’s Kitchen", sponsored: false, from: '#fff3c4', to: '#ffc857' },
    { name: 'Millet cookie box', price: 280, seller: 'Grain Lab', sponsored: true, from: '#ffe0c2', to: '#f2a65a' },
    { name: 'Cold-pressed groundnut oil', price: 540, seller: 'Village Press', sponsored: false, from: '#f6efc2', to: '#d9c46a' },
  ],
  Jewellery: [
    { name: 'Oxidised silver jhumkas', price: 760, seller: 'Nila Silver', sponsored: false, from: '#dcecff', to: '#9ecbff' },
    { name: 'Beaded necklace', price: 540, seller: 'Bead Bazaar', sponsored: true, from: '#d3f0f5', to: '#8fd3e0' },
    { name: 'Temple bangles', price: 1150, seller: 'Sri Crafts', sponsored: false, from: '#e4ecff', to: '#9fc4f0' },
  ],
};

const CATEGORIES = Object.keys(DISCOVER_DATA);

const HERO_SHOWCASE_PRODUCTS = [
  {
    id: 'terra',
    brand: 'Terra Studio',
    subtitle: 'Ceramics & Stoneware · Bengaluru',
    item: 'Kyoto Speckled Ceramic Pour-Over & Tumbler',
    amount: 1850,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop',
    tag: 'Hand-Thrown Stoneware',
    delivery: 'Fragile Air Cushioned · Bluedart',
    protection: 'Breakage & transit escrow guarantee',
  },
  {
    id: 'vayu',
    brand: 'Vayu Leathercraft',
    subtitle: 'Full-Grain Leather · Jaipur',
    item: 'Horween Chromexcel Valet & Watch Roll',
    amount: 2950,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop',
    tag: 'Horween Leather · Hand-Stitched',
    delivery: 'Delhivery Express · 48h dispatch',
    protection: '100% genuine leather guarantee',
  },
  {
    id: 'johari',
    brand: 'Johari Guild',
    subtitle: 'Hallmarked Silver · Jaipur',
    item: '925 Sterling Silver Moissanite Open Cuff',
    amount: 3450,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop',
    tag: '925 Hallmarked Silver',
    delivery: 'Insured Tamper-Proof Seal Box',
    protection: 'Authenticity certificate enclosed',
  },
];

const STATEMENT_TEXT =
  "Selling online runs on trust. Reachr gives the person selling and the person buying a way across: pay in a tap, follow the order, and settle any problem fairly.";
const STATEMENT_WORDS: string[] = STATEMENT_TEXT.split(' ');

function clamp(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export const LandingView: React.FC<LandingViewProps> = React.memo(({
  onGoToSeller,
  onGoToBuyer,
  onGoToDiscover,
  onOpenSubscriptionModal,
}) => {
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const heroProduct = HERO_SHOWCASE_PRODUCTS[selectedHeroIndex];

  /* ── 1. DOM REFS FOR SCROLL PERFORMANCE (NO REACT RE-RENDERING ON SCROLL) ── */
  const hpRef = useRef<HTMLDivElement>(null);
  const stElRef = useRef<HTMLElement>(null);
  const stmRef = useRef<HTMLParagraphElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const wordSpansRef = useRef<HTMLSpanElement[]>([]);
  const chapsRef = useRef<(HTMLDivElement | null)[]>([]);
  const panesRef = useRef<(HTMLDivElement | null)[]>([]);

  // 1. Reveal-on-scroll observer (.rv -> .rv.in)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.rv');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // 2. High-performance scroll animation loop
  useEffect(() => {
    let tick = false;
    let lastP = -1;
    let lastT = -1;
    let lastIdx = -1;

    const update = () => {
      tick = false;
      const vh = window.innerHeight;
      const y = window.scrollY;

      // Parallax on hero phone
      if (hpRef.current) {
        const t = clamp(y / (vh * 0.6));
        if (Math.abs(t - lastT) > 0.004) {
          lastT = t;
          hpRef.current.style.transform = `translate3d(0, ${((1 - t) * 30 - t * 20).toFixed(1)}px, 0) scale(${(0.94 + 0.06 * t).toFixed(3)})`;
        }
      }

      // Scroll-lit statement words direct opacity update
      if (stElRef.current && wordSpansRef.current.length > 0) {
        const r = stElRef.current.getBoundingClientRect();
        const p = clamp((vh * 0.85 - r.top) / (r.height * 0.9 + vh * 0.25));
        const pk = Math.round(p * 60);
        if (pk !== lastP) {
          lastP = pk;
          const n = wordSpansRef.current.length;
          for (let i = 0; i < n; i++) {
            const span = wordSpansRef.current[i];
            if (span) {
              span.style.opacity = (0.18 + 0.82 * clamp((p * (n + 4) - i) / 3)).toFixed(2);
            }
          }
        }
      }

      // Sticky scroll "Four steps. One link." chapter switching
      if (sceneRef.current) {
        const sr = sceneRef.current.getBoundingClientRect();
        const sp = clamp(-sr.top / (sr.height - vh));
        const idx = Math.min(3, Math.floor(sp * 4));

        if (idx !== lastIdx) {
          lastIdx = idx;
          chapsRef.current.forEach((chap, i) => {
            if (chap) chap.classList.toggle('on', i === idx);
          });
          panesRef.current.forEach((pane, i) => {
            if (pane) pane.classList.toggle('on', i === idx);
          });
        }
      }
    };

    const req = () => {
      if (!tick) {
        tick = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();

    return () => {
      window.removeEventListener('scroll', req);
      window.removeEventListener('resize', req);
    };
  }, []);

  const handleChapterClick = (stepIndex: number) => {
    sounds.playMessage();
    if (sceneRef.current) {
      const vh = window.innerHeight;
      const targetTop =
        sceneRef.current.offsetTop +
        (stepIndex / 4) * (sceneRef.current.offsetHeight - vh) +
        10;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  /* ── 2. DISCOVER SWIPE DECK STATE & GESTURES (MATCHING reachr.html) ── */
  const [curCategory, setCurCategory] = useState<string>(CATEGORIES[0]);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [orderSheetItem, setOrderSheetItem] = useState<DiscoverItem | null>(null);
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  const topCardRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragXRef = useRef<number>(0);
  const isBusyRef = useRef<boolean>(false);

  const items = DISCOVER_DATA[curCategory] || [];
  const remainingItems = items.slice(cardIndex);

  const flyCard = (dir: number) => {
    if (isBusyRef.current || remainingItems.length === 0) return;
    isBusyRef.current = true;
    const card = topCardRef.current;
    const currentItem = remainingItems[0];

    if (card) {
      card.classList.remove('drag');
      card.style.transform = `translateX(${dir * 400}px) rotate(${dir * 18}deg)`;
      card.style.opacity = '0';
    }

    setTimeout(() => {
      setCardIndex((prev) => prev + 1);
      isBusyRef.current = false;
      if (dir > 0) {
        setOrderSheetItem(currentItem);
        setOrderPlaced(false);
        sounds.playSuccess();
      } else {
        sounds.playMessage();
      }
    }, 320);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isBusyRef.current || remainingItems.length === 0) return;
    isPointerDownRef.current = true;
    dragStartXRef.current = e.clientX;
    dragXRef.current = 0;
    const card = e.currentTarget;
    card.classList.add('drag');
    try {
      card.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    dragXRef.current = dx;
    const card = e.currentTarget;
    card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;

    const orderStamp = card.querySelector<HTMLElement>('.stamp.o');
    const skipStamp = card.querySelector<HTMLElement>('.stamp.k');
    if (orderStamp) orderStamp.style.opacity = clamp(dx / 80).toString();
    if (skipStamp) skipStamp.style.opacity = clamp(-dx / 80).toString();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    const card = e.currentTarget;
    card.classList.remove('drag');
    try {
      card.releasePointerCapture(e.pointerId);
    } catch {}

    const dx = dragXRef.current;
    if (dx > 90) {
      flyCard(1);
    } else if (dx < -90) {
      flyCard(-1);
    } else {
      card.style.transform = '';
      const orderStamp = card.querySelector<HTMLElement>('.stamp.o');
      const skipStamp = card.querySelector<HTMLElement>('.stamp.k');
      if (orderStamp) orderStamp.style.opacity = '0';
      if (skipStamp) skipStamp.style.opacity = '0';
    }
  };

  const handleCategorySelect = (cat: string) => {
    setCurCategory(cat);
    setCardIndex(0);
    setOrderSheetItem(null);
    sounds.playMessage();
  };

  /* ── 3. NOTIFY FORM SUBMISSION ── */
  const [emailInput, setEmailInput] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setNotifyMsg("Thank you! You're subscribed for exclusive seller updates and feature drops.");
      setEmailInput('');
      sounds.playSuccess();
    }
  };

  return (
    <div>
      {/* ── 1. HERO SECTION ── */}
      <header className="hero" id="top">
        <p className="k">Reachr</p>
        <h1>
          Sell with<br />
          <span className="grad">confidence.</span>
        </h1>
        <p className="sub">
          Payment links, protected delivery and promotion for sellers on Instagram, WhatsApp and YouTube.
        </p>

        <div className="ctas">
          <a
            className="btn"
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              const el = document.querySelector('#pricing');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              sounds.playMessage();
            }}
          >
            Start free
          </a>
          <a
            className="lnk"
            href="#how"
            onClick={(e) => {
              e.preventDefault();
              const el = document.querySelector('#how');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              sounds.playMessage();
            }}
          >
            See how it works ›
          </a>
        </div>

        <div className="box">
          <i
            className="glow"
            id="g1"
            style={{
              width: 440,
              height: 440,
              left: 'calc(50% - 320px)',
              top: 20,
              background: 'radial-gradient(circle, #ff9f0a 0, rgba(255,159,10,0) 65%)',
              opacity: 0.7,
            }}
          />
          <i
            className="glow"
            id="g2"
            style={{
              width: 460,
              height: 460,
              left: 'calc(50% - 100px)',
              top: 0,
              background: 'radial-gradient(circle, #2bc4b4 0, rgba(43,196,180,0) 65%)',
              opacity: 0.65,
            }}
          />
          <i
            className="glow"
            id="g3"
            style={{
              width: 400,
              height: 400,
              left: 'calc(50% - 200px)',
              top: 150,
              background: 'radial-gradient(circle, #0a84ff 0, rgba(10,132,255,0) 65%)',
              opacity: 0.55,
            }}
          />

          {/* Hero Showcase Product Switcher */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {HERO_SHOWCASE_PRODUCTS.map((prod, idx) => (
              <button
                key={prod.id}
                type="button"
                onClick={() => {
                  setSelectedHeroIndex(idx);
                  sounds.playClick();
                }}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: selectedHeroIndex === idx ? 'var(--blue)' : 'var(--line)',
                  background: selectedHeroIndex === idx ? 'var(--blue)' : 'var(--card)',
                  color: selectedHeroIndex === idx ? '#fff' : 'var(--mut)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedHeroIndex === idx ? '0 2px 10px rgba(10,132,255,0.3)' : 'none',
                }}
              >
                {prod.brand}
              </button>
            ))}
          </div>

          {/* Hero Phone Mockup — Aesthetic Artisan Showcase */}
          <div className="phone" id="hp" ref={hpRef}>
            <div className="scr" id="hs">
              <div className="pane on">
                <div className="sb">
                  <span>9:41</span>
                  <span>●●●</span>
                </div>
                <div className="who">
                  <div
                    className="av"
                    style={{
                      backgroundImage: `url(${heroProduct.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <b>{heroProduct.brand}</b>
                      <span style={{ color: '#2bc4b4', fontSize: '3.4cqw', fontWeight: 'bold' }}>✓</span>
                    </div>
                    <small>{heroProduct.subtitle}</small>
                  </div>
                </div>
                <div
                  className="tile"
                  style={{
                    backgroundImage: `url(${heroProduct.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2.5cqw',
                      left: '3cqw',
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      fontSize: '2.8cqw',
                      padding: '0.8cqw 2.4cqw',
                      borderRadius: '99px',
                      fontWeight: 600,
                    }}
                  >
                    {heroProduct.tag}
                  </span>
                </div>
                <p className="it">{heroProduct.item}</p>
                <p className="am">₹{heroProduct.amount.toLocaleString('en-IN')}</p>
                <div className="rw">
                  <span>Payment</span>
                  <b>Direct UPI · Escrow Held</b>
                </div>
                <div className="rw">
                  <span>Delivery</span>
                  <b>{heroProduct.delivery}</b>
                </div>
                <div className="rw">
                  <span>Protection</span>
                  <b>{heroProduct.protection}</b>
                </div>
                <div
                  className="pay"
                  onClick={() => {
                    try {
                      window.location.href = `upi://pay?pa=ts.mukesh007@oksbi&pn=Reachr&am=${heroProduct.amount}&cu=INR&tn=${encodeURIComponent(
                        heroProduct.item.substring(0, 30)
                      )}`;
                    } catch {}
                    onGoToBuyer();
                  }}
                  title="Click to pay via UPI and test buyer link"
                >
                  Pay with UPI &amp; Protect
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. TRUST STATEMENT SECTION ── */}
      <section className="st" ref={stElRef}>
        <div className="wrap">
          <p id="stm" ref={stmRef}>
            {STATEMENT_WORDS.map((word, idx) => (
              <span
                key={idx}
                ref={(el) => {
                  if (el) wordSpansRef.current[idx] = el;
                }}
                style={{ opacity: 0.18 }}
              >
                {word}{' '}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* ── 3. FOUR STEPS. ONE LINK. (STICKY SCROLL SCENE) ── */}
      <section className="scene" id="how" ref={sceneRef}>
        <div className="stick">
          <div>
            <h2>
              Four steps.<br />
              <span className="grad">One link.</span>
            </h2>

            <div
              className="chap on"
              ref={(el) => { chapsRef.current[0] = el; }}
              onClick={() => handleChapterClick(0)}
            >
              <h3>Share a link.</h3>
              <p>Your buyer pays through UPI, and the money is held safely until the order arrives.</p>
            </div>

            <div
              className="chap"
              ref={(el) => { chapsRef.current[1] = el; }}
              onClick={() => handleChapterClick(1)}
            >
              <h3>Follow the order.</h3>
              <p>Courier updates reach buyer and seller, so nobody has to ask where it is.</p>
            </div>

            <div
              className="chap"
              ref={(el) => { chapsRef.current[2] = el; }}
              onClick={() => handleChapterClick(2)}
            >
              <h3>Settle it fairly.</h3>
              <p>Add photos or video, and four clear stages take over, with tracking as evidence.</p>
            </div>

            <div
              className="chap"
              ref={(el) => { chapsRef.current[3] = el; }}
              onClick={() => handleChapterClick(3)}
            >
              <h3>Reach more buyers.</h3>
              <p>Promote your shop on Instagram, Facebook and YouTube, and see which ad led to a real sale.</p>
            </div>
          </div>

          <div className="phw">
            <div className="phone">
              <div className="scr" id="ps">
                {/* Pane 0: Share a link */}
                <div className="pane on" ref={(el) => { panesRef.current[0] = el; }}>
                  <div className="sb">
                    <span>9:41</span>
                    <span>●●●</span>
                  </div>
                  <div className="who">
                    <div
                      className="av"
                      style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop)',
                        backgroundSize: 'cover',
                      }}
                    />
                    <div>
                      Terra Studio<small>Payment link</small>
                    </div>
                  </div>
                  <div
                    className="tile"
                    style={{
                      backgroundImage: 'url(https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <p className="it">Kyoto Speckled Ceramic Pour-Over</p>
                  <p className="am">₹1,850</p>
                  <div className="rw">
                    <span>Payment</span>
                    <b>Direct UPI · Escrow Held</b>
                  </div>
                  <div className="rw">
                    <span>Delivery</span>
                    <b>Bluedart Express</b>
                  </div>
                  <div className="rw">
                    <span>Protection</span>
                    <b>Held till delivery</b>
                  </div>
                  <div className="pay">Pay with UPI</div>
                </div>

                {/* Pane 1: Follow the order */}
                <div className="pane" ref={(el) => { panesRef.current[1] = el; }}>
                  <div className="sb">
                    <span>9:41</span>
                    <span>●●●</span>
                  </div>
                  <h4>Your order</h4>
                  <small>Kyoto Ceramic Pour-Over · Terra Studio</small>
                  <div className="tl">
                    <div className="dn">
                      <b>Packed</b>Seller confirmed
                    </div>
                    <div className="dn">
                      <b>Shipped</b>On its way
                    </div>
                    <div className="lv">
                      <b>Out for delivery</b>Nearly there
                    </div>
                    <div>
                      <b>Delivered</b>Buyer confirms
                    </div>
                  </div>
                  <span className="chip">Arriving today</span>
                </div>

                {/* Pane 2: Settle it fairly */}
                <div className="pane" ref={(el) => { panesRef.current[2] = el; }}>
                  <div className="sb">
                    <span>9:41</span>
                    <span>●●●</span>
                  </div>
                  <h4>Something wrong?</h4>
                  <small>Dispute in progress</small>
                  <div className="tl">
                    <div className="dn">
                      <b>Raise it</b>Problem flagged
                    </div>
                    <div className="dn">
                      <b>Respond</b>Seller replied
                    </div>
                    <div className="lv">
                      <b>Review</b>Evidence is checked
                    </div>
                    <div>
                      <b>Resolve</b>Outcome recorded
                    </div>
                  </div>
                  <div className="note">Your photos and the delivery tracking are attached as evidence.</div>
                </div>

                {/* Pane 3: Reach more buyers */}
                <div className="pane" ref={(el) => { panesRef.current[3] = el; }}>
                  <div className="sb">
                    <span>9:41</span>
                    <span>●●●</span>
                  </div>
                  <h4>Promote</h4>
                  <small>Handloom sarees</small>
                  <div className="plat">
                    <span>Instagram</span>
                    <span>Facebook</span>
                    <span>YouTube</span>
                  </div>
                  <div className="ad">
                    <div className="im" />
                    <div className="tx">
                      <b>Asha’s Crafts</b> <small>Sponsored</small>
                      <div className="cta2">Shop with protection</div>
                    </div>
                  </div>
                  <div className="rw">
                    <span>Ad spend</span>
                    <b>₹2,000</b>
                  </div>
                  <div className="rw">
                    <span>Protected sales</span>
                    <b>14</b>
                  </div>
                  <div className="rw">
                    <span>Delivered</span>
                    <b>11</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. BENTO FEATURE GRID ── */}
      <section className="feat" id="features">
        <div className="wrap">
          <h2 className="rv">Everything it takes to close a sale.</h2>
          <div className="bento">
            {/* Card 1 */}
            <article className="card c1 s2 rv">
              <div>
                <h3>Payments held until delivery.</h3>
                <p>Buyers pay by UPI. The money is held safely and released to you once the order arrives.</p>
              </div>
              <div className="vis">
                <div className="big">₹1,250</div>
                <div className="chipw" style={{ marginTop: 14 }}>
                  <span>UPI</span>
                  <span>Held till delivery</span>
                </div>
              </div>
            </article>

            {/* Card 2 */}
            <article className="card c2 rv">
              <div>
                <h3>Follow every order.</h3>
                <p>Courier updates, sent to WhatsApp.</p>
              </div>
              <div className="vis">
                <div className="steps">
                  <div className="f">
                    <i />Packed
                  </div>
                  <div className="f">
                    <i />Shipped
                  </div>
                  <div className="f">
                    <i />Nearby
                  </div>
                  <div>
                    <i />Delivered
                  </div>
                </div>
              </div>
            </article>

            {/* Card 3 */}
            <article className="card c3 rv">
              <div>
                <h3>Verified sellers.</h3>
                <p>Buyers see exactly who they’re paying.</p>
              </div>
              <div className="vis">
                <div className="vb">
                  <i>✓</i>
                  <div>
                    <b>Asha’s Crafts</b>
                    <small>Verified by Reachr</small>
                  </div>
                </div>
              </div>
            </article>

            {/* Card 4 */}
            <article className="card c4 s2 rv">
              <div>
                <h3>
                  Promote your shop. <em className="soon">Soon</em>
                </h3>
                <p>
                  Advertise a section on Instagram, Facebook and YouTube, and see which ad led to a real, delivered sale.
                </p>
              </div>
              <div className="vis">
                <div className="chipw">
                  <span>Instagram</span>
                  <span>Facebook</span>
                  <span>YouTube</span>
                </div>
                <div className="big" style={{ fontSize: '2.6rem', marginTop: 18 }}>
                  14 sales <span style={{ fontSize: '1rem', fontWeight: 600, color: '#4a4a4f', letterSpacing: 0 }}>from one ad</span>
                </div>
              </div>
            </article>

            {/* Card 5 */}
            <article className="card c5 rv">
              <div>
                <h3>Fair disputes.</h3>
                <p>Four stages, with photos as proof.</p>
              </div>
              <div className="vis">
                <div className="four">
                  <div>
                    <b>1</b>Raise
                  </div>
                  <div>
                    <b>2</b>Reply
                  </div>
                  <div>
                    <b>3</b>Review
                  </div>
                  <div>
                    <b>4</b>Resolve
                  </div>
                </div>
              </div>
            </article>

            {/* Card 6 */}
            <article className="card c6 s2 rv">
              <div>
                <h3>
                  Your sales, at a glance. <em className="soon">Soon</em>
                </h3>
                <p>A simple dashboard for links, payments and orders.</p>
              </div>
              <div className="vis">
                <div className="bars">
                  <i style={{ height: '35%' }} />
                  <i style={{ height: '55%' }} />
                  <i style={{ height: '42%' }} />
                  <i style={{ height: '70%' }} />
                  <i style={{ height: '60%' }} />
                  <i style={{ height: '88%' }} />
                  <i style={{ height: '76%' }} />
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── 5. DISCOVER (FIND IT. SWIPE. ORDER.) ── */}
      <section className="disc" id="discover">
        <div className="wrap dgrid">
          <div>
            <h2 className="rv">
              Find it.<br />
              <span className="grad">Swipe. Order.</span>
            </h2>
            <p className="l rv">
              Buyers browse sellers by category. Swipe right to order, swipe left to skip.
            </p>
            <ul className="dl rv">
              <li>Only verified sellers appear.</li>
              <li>Paid placements are always labelled Sponsored.</li>
              <li>Every order is protected from the first tap.</li>
            </ul>
            <p className="hint rv">Try it on the phone: drag a card, or use the buttons.</p>

            <div className="rv" style={{ marginTop: '28px' }}>
              <button
                type="button"
                onClick={() => {
                  if (onGoToDiscover) onGoToDiscover();
                  sounds.playSuccess();
                }}
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '0.98rem',
                }}
              >
                <span>Open Full Discover Page (9+ Artisans)</span>
                <span>›</span>
              </button>
            </div>
          </div>

          <div className="phw">
            <div
              className="phone"
              id="dp"
              style={{ ['--ph' as any]: 'min(70svh, 640px)' }}
            >
              <div className="scr">
                <div className="pane on col" id="dpane">
                  <div className="sb">
                    <span>9:41</span>
                    <span>●●●</span>
                  </div>
                  <h4>Discover</h4>

                  {/* Category Chips */}
                  <div className="dch">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={curCategory === cat ? 'on' : ''}
                        onClick={() => handleCategorySelect(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Card Deck matching HTML DOM stack */}
                  <div
                    className="deck"
                    id="deck"
                    tabIndex={0}
                    aria-label="Swipe deck. Right arrow orders, left arrow skips."
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight') flyCard(1);
                      if (e.key === 'ArrowLeft') flyCard(-1);
                    }}
                  >
                    {remainingItems.length === 0 ? (
                      <div className="empty">
                        <span>You’ve seen every {curCategory.toLowerCase()} seller for now.</span>
                        <button
                          className="pay"
                          type="button"
                          onClick={() => {
                            setCardIndex(0);
                            sounds.playSuccess();
                          }}
                        >
                          Start again
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Underneath card (if available) */}
                        {remainingItems.length > 1 && (
                          <div
                            key={remainingItems[1].name}
                            className="sc"
                            style={{
                              background: `linear-gradient(160deg, ${remainingItems[1].from}, ${remainingItems[1].to})`,
                              transform: 'scale(0.94) translateY(3cqw)',
                              zIndex: 1,
                            }}
                          >
                            {remainingItems[1].sponsored && <span className="sp">Sponsored</span>}
                            <span className="stamp o">ORDER</span>
                            <span className="stamp k">SKIP</span>
                            <div className="in">
                              <div className="nm">{remainingItems[1].name}</div>
                              <div className="pr">₹{remainingItems[1].price.toLocaleString('en-IN')}</div>
                              <div className="sl">
                                <i>✓</i>
                                {remainingItems[1].seller} · Verified
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Top draggable card */}
                        <div
                          key={remainingItems[0].name}
                          ref={topCardRef}
                          className="sc"
                          onPointerDown={handlePointerDown}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerCancel={handlePointerUp}
                          style={{
                            background: `linear-gradient(160deg, ${remainingItems[0].from}, ${remainingItems[0].to})`,
                            zIndex: 2,
                          }}
                        >
                          {remainingItems[0].sponsored && <span className="sp">Sponsored</span>}
                          <span className="stamp o">ORDER</span>
                          <span className="stamp k">SKIP</span>
                          <div className="in">
                            <div className="nm">{remainingItems[0].name}</div>
                            <div className="pr">₹{remainingItems[0].price.toLocaleString('en-IN')}</div>
                            <div className="sl">
                              <i>✓</i>
                              {remainingItems[0].seller} · Verified
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Yes / No Action Buttons */}
                  <div className="acts">
                    <button
                      className="no"
                      type="button"
                      aria-label="Skip"
                      onClick={() => flyCard(-1)}
                    >
                      ✕
                    </button>
                    <button
                      className="yes"
                      type="button"
                      aria-label="Order"
                      onClick={() => flyCard(1)}
                    >
                      ✓
                    </button>
                  </div>

                  {/* Slide-Up Order Sheet */}
                  <div className={`sheet ${orderSheetItem ? 'on' : ''}`}>
                    {orderSheetItem && !orderPlaced && (
                      <>
                        <h4 style={{ fontSize: '5.4cqw' }}>{orderSheetItem.name}</h4>
                        <small>{orderSheetItem.seller} · Verified</small>
                        <p className="am" style={{ margin: '3cqw 0 2cqw' }}>
                          ₹{orderSheetItem.price.toLocaleString('en-IN')}
                        </p>
                        <div className="rw">
                          <span>Payment</span>
                          <b>UPI</b>
                        </div>
                        <div className="rw">
                          <span>Money</span>
                          <b>Held till delivery</b>
                        </div>
                        <button
                          className="pay"
                          type="button"
                          onClick={() => {
                            try {
                              window.location.href = `upi://pay?pa=ts.mukesh007@oksbi&pn=Reachr&am=${orderSheetItem.price}&cu=INR&tn=${encodeURIComponent(
                                orderSheetItem.name.substring(0, 30)
                              )}`;
                            } catch {}
                            setOrderPlaced(true);
                            sounds.playReward();
                          }}
                        >
                          Pay with UPI (₹{orderSheetItem.price.toLocaleString('en-IN')})
                        </button>
                        <button
                          className="pay ghost"
                          type="button"
                          onClick={() => setOrderSheetItem(null)}
                        >
                          Not now
                        </button>
                      </>
                    )}

                    {orderSheetItem && orderPlaced && (
                      <>
                        <h4 style={{ fontSize: '5.4cqw' }}>Order placed</h4>
                        <small>Protected &amp; tracked to ts.mukesh007@oksbi. Funds held in escrow till verified doorstep unboxing.</small>
                        <button
                          className="pay"
                          type="button"
                          style={{ marginTop: '6cqw' }}
                          onClick={() => {
                            setOrderSheetItem(null);
                            setOrderPlaced(false);
                          }}
                        >
                          Keep browsing
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. PRICING ── */}
      <section className="price" id="pricing">
        <div className="wrap">
          <h2 className="rv">
            Start free.<br />
            Grow when you’re ready.
          </h2>
          <p className="sub2 rv">
            Protection is free for everyone. Paid plans add powerful tools to run, automate and scale your shop.
          </p>

          <div className="plans">
            <article className="plan rv">
              <h3>Free</h3>
              <div className="pr">
                ₹0 <small>/forever</small>
              </div>
              <ul>
                <li>Payment links (Direct UPI)</li>
                <li>Tracked delivery guarantee</li>
                <li>Four-stage dispute resolution</li>
                <li>Reachr verified seller badge</li>
              </ul>
              <a
                className="btn"
                href="#seller"
                onClick={(e) => {
                  e.preventDefault();
                  onGoToSeller();
                  sounds.playSuccess();
                }}
              >
                Get started free
              </a>
            </article>

            <article className="plan rv">
              <h3>Plus</h3>
              <div className="pr">
                ₹2,999 <small>/month</small>
              </div>
              <ul>
                <li>Everything in Free</li>
                <li>Seller dashboard &amp; analytics</li>
                <li>Automated receipts and invoices</li>
                <li>In-person QR payment codes</li>
                <li>WhatsApp buyer order updates</li>
              </ul>
              <a
                className="btn"
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenSubscriptionModal) {
                    onOpenSubscriptionModal('pro');
                  } else {
                    onGoToSeller();
                  }
                  sounds.playSuccess();
                }}
              >
                Choose Plus
              </a>
            </article>

            <article className="plan pro rv">
              <h3>
                Pro <em className="tg">For growing shops</em>
              </h3>
              <div className="pr">
                ₹5,999 <small>/month</small>
              </div>
              <ul>
                <li>Everything in Plus</li>
                <li>Promote on Instagram, Facebook and YouTube</li>
                <li>Featured placement in Discover</li>
                <li>Sales attribution reported per ad</li>
                <li>Priority 24/7 dispute review</li>
                <li>Multi-user team permissions</li>
              </ul>
              <a
                className="btn"
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenSubscriptionModal) {
                    onOpenSubscriptionModal('elite');
                  } else {
                    onGoToSeller();
                  }
                  sounds.playSuccess();
                }}
              >
                Choose Pro
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* ── 7. CTA NOTIFY BANNER ── */}
      <section className="cta" id="join">
        <div className="ctab rv">
          <h2>
            Stay ahead with <span className="grad">exclusive updates.</span>
          </h2>
          <p>Join our seller circle for exclusive updates, feature drops, and early platform access delivered to your inbox.</p>

          <form className="sign" onSubmit={handleNotifySubmit}>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email for exclusive updates"
              aria-label="Email address"
              required
            />
            <button className="btn" type="submit">
              Get exclusive updates
            </button>
          </form>

          {notifyMsg && (
            <div id="msg" role="status">
              {notifyMsg}
            </div>
          )}
        </div>
      </section>

      {/* ── 8. FOOTER WITH LICENSES & DONE BY TEAM REACHR ── */}
      <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--bg)', padding: '54px 0 36px' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px' }}>
            <div style={{ maxWidth: '360px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em', color: 'var(--ink)' }}>Reachr</span>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: 'rgba(43,196,180,0.15)', color: '#2bc4b4', border: '1px solid rgba(43,196,180,0.3)' }}>VERIFIED ESCROW</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--mut)', lineHeight: 1.6, margin: 0 }}>
                Smart payment links &amp; delivery protection for social sellers across Instagram, WhatsApp and YouTube. Direct instant UPI settlements with unboxing verification.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap', fontSize: '13px' }}>
              <div>
                <b style={{ display: 'block', color: 'var(--ink)', marginBottom: '10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portals</b>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', color: 'var(--mut)' }}>
                  <span style={{ cursor: 'pointer' }} onClick={() => onGoToDiscover?.()}>Artisan Marketplace</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => onGoToBuyer?.()}>Buyer Order Hub</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => onGoToSeller?.()}>Seller Studio</span>
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (onOpenSubscriptionModal) {
                        onOpenSubscriptionModal('pro');
                      } else {
                        const el = document.querySelector('#pricing');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    Membership Plans
                  </span>
                </div>
              </div>
              <div>
                <b style={{ display: 'block', color: 'var(--ink)', marginBottom: '10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Licenses &amp; Security</b>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', color: 'var(--mut)' }}>
                  <span>RBI UPI Mandate Guidelines 2024</span>
                  <span>ISO 27001 Certified Vault Architecture</span>
                  <span>256-Bit SSL Transit Encryption</span>
                  <span>NPCI Unified Payments Interoperability</span>
                </div>
              </div>
              <div>
                <b style={{ display: 'block', color: 'var(--ink)', marginBottom: '10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Legal &amp; Policy</b>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', color: 'var(--mut)' }}>
                  <span>Terms of Service</span>
                  <span>Privacy Policy</span>
                  <span>Dispute Resolution Protocol v2.4</span>
                  <span>Fair Refund &amp; Escrow Policy</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: 'var(--mut)' }}>
            <span>© 2024 Reachr Inc. All rights reserved. Registered Indian Electronic Commerce &amp; Direct UPI Link Provider.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--ink)', background: 'var(--card)', padding: '4px 12px', borderRadius: '999px', border: '1px solid var(--line)' }}>
                Done by Team Reachr
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
});

LandingView.displayName = 'LandingView';
