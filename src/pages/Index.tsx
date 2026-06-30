import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  wholesale: number;
  brand: string;
  rating: number;
  image: string;
  badge?: string;
  wholesale_min_qty?: number;
  description?: string;
  composition?: string;
  usage_instructions?: string;
  features?: string;
};







const NAV = [
  { id: 'home', label: 'Главная' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'delivery', label: 'Оплата и доставка' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'about', label: 'О нас' },
];

const PRODUCTS_URL = 'https://functions.poehali.dev/7eb75e0a-030c-4601-9b1f-145e1e775c6a';
const ORDERS_URL = 'https://functions.poehali.dev/b3cf2e84-45d2-47ff-96ce-48cfa7aa5fbd';
const REVIEWS_URL = 'https://functions.poehali.dev/75ddc432-88b5-419f-b6f5-ab2422e5f049';
const fmt = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все');
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [brands, setBrands] = useState<string[]>([]);
  const [cart, setCart] = useState<{ id: number; qty: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  });
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment'>('cart');
  const [address, setAddress] = useState({ city: '', street: '', apartment: '', entrance: '', floor: '', zip: '', name: '', phone: '', comment: '' });
  const [deliveryService, setDeliveryService] = useState<'yandex' | 'courier' | 'post'>('yandex');
  const [orderDone, setOrderDone] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'sbp' | 'card_store' | 'pickup'>('sbp');
  const SBP_URL = 'https://771385585715.tb.ru';
  const [orderLoading, setOrderLoading] = useState(false);
  const [myOrders, setMyOrders] = useState<{ id: number; total: number; status: string; payment_status: string; created_at: string; delivery_service: string; city: string; street: string; items: { name: string; price: number; qty: number }[] }[]>([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authOpen, setAuthOpen] = useState(false);
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const { user, token, loading, login, register, logout } = useAuth();
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [socials, setSocials] = useState({ social_instagram: '', social_youtube: '', social_telegram: 'https://t.me/Chineshop1688', social_max: 'https://web.max.ru/', contact_max: '89161433232', contact_whatsapp: '', contact_phone: '+7 (916) 143-32-32', contact_email: 'mag789-944@yandex.ru', contact_address: 'г. Долгопрудный, ул. Парковая, 44 к1', contact_hours: 'Ежедневно с 9:00 до 21:00' });
  const [wholesaleQtyDefault, setWholesaleQtyDefault] = useState(50);
  const [wholesaleQtyHeavy, setWholesaleQtyHeavy] = useState(5);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [storeImages, setStoreImages] = useState<string[]>([]);
  const [storeSlideIdx, setStoreSlideIdx] = useState(0);
  const [dbReviews, setDbReviews] = useState<{id:number;author_name:string;city:string;rating:number;text:string;product:string;created_at:string}[]>([]);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ author_name: '', city: '', rating: 5, text: '', product: '' });
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFail, setPaymentFail] = useState(false);
  const [now, setNow] = useState(new Date());
  const [expandedMyOrder, setExpandedMyOrder] = useState<number | null>(null);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setPaymentSuccess(true);
      window.history.replaceState({}, '', window.location.pathname);
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        setMyOrdersLoading(true);
        fetch(ORDERS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${savedToken}` },
          body: JSON.stringify({ action: 'my_orders' }),
        }).then(r => r.json()).then(data => {
          if (data.orders) setMyOrders(data.orders);
        }).finally(() => setMyOrdersLoading(false));
      }
    } else if (params.get('payment') === 'fail') {
      setPaymentFail(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const CACHE_KEY = 'shop_cache_v2';
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const c = JSON.parse(cached);
        if (c.products?.length) { setDbProducts(c.products); setProductsLoaded(true); }
        if (c.settings) {
          setSocials(s => ({ ...s, ...c.settings }));
          if (c.settings.wholesale_qty_default) setWholesaleQtyDefault(parseInt(c.settings.wholesale_qty_default));
          if (c.settings.wholesale_qty_heavy) setWholesaleQtyHeavy(parseInt(c.settings.wholesale_qty_heavy));
          if (Array.isArray(c.settings.store_images) && c.settings.store_images.length > 0) setStoreImages(c.settings.store_images);
        }
        if (c.categories?.length) setDbCategories(c.categories);
        if (c.reviews?.length) setDbReviews(c.reviews);
      } catch (e) { /* ignore */ }
    }
    fetch(PRODUCTS_URL)
      .then(r => r.json())
      .then(data => {
        if (data.products?.length) { setDbProducts(data.products); setProductsLoaded(true); }
        if (data.settings) {
          setSocials(s => ({ ...s, ...data.settings }));
          if (data.settings.wholesale_qty_default) setWholesaleQtyDefault(parseInt(data.settings.wholesale_qty_default));
          if (data.settings.wholesale_qty_heavy) setWholesaleQtyHeavy(parseInt(data.settings.wholesale_qty_heavy));
          if (Array.isArray(data.settings.store_images) && data.settings.store_images.length > 0) setStoreImages(data.settings.store_images);
        }
        if (data.categories?.length) setDbCategories(data.categories);
        fetch(REVIEWS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list' }) })
          .then(r => r.json())
          .then(rd => {
            const reviews = rd.reviews || [];
            if (reviews.length) setDbReviews(reviews);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ products: data.products, settings: data.settings, categories: data.categories, reviews }));
          });
      });
  }, []);

  const handleSubmitReview = async () => {
    setReviewError('');
    setReviewSending(true);
    const res = await fetch(REVIEWS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', ...reviewForm }) });
    const data = await res.json();
    setReviewSending(false);
    if (data.error) { setReviewError(data.error); return; }
    setReviewSent(true);
    setReviewForm({ author_name: '', city: '', rating: 5, text: '', product: '' });
  };

  const CATEGORIES = ['Все', ...dbCategories];

  const allProducts = dbProducts;
  const allBrands = useMemo(() => {
    return [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
  }, [allProducts]);

  const heroSlides = useMemo(() => {
    if (!allProducts.length) return [];
    const byCategory: Record<string, Product[]> = {};
    allProducts.forEach(p => {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      byCategory[p.category].push(p);
    });
    const result: Product[] = [];
    const cats = Object.keys(byCategory);
    let round = 0;
    while (result.length < 20) {
      let added = false;
      for (const cat of cats) {
        if (byCategory[cat][round]) { result.push(byCategory[cat][round]); added = true; }
        if (result.length >= 20) break;
      }
      if (!added) break;
      round++;
    }
    return result.slice(0, 20);
  }, [allProducts]);

  useEffect(() => {
    if (!heroSlides.length) return;
    const timer = setInterval(() => setHeroIdx((i) => (i + 1) % heroSlides.length), 3000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleAuth = async () => {
    setAuthError('');
    const res = authMode === 'login'
      ? await login(authEmail, authPassword)
      : await register(authName, authEmail, authPassword, authPhone);
    if (res.error) { setAuthError(res.error); return; }
    setAuthOpen(false);
    setAuthEmail(''); setAuthPassword(''); setAuthName(''); setAuthPhone('');
  };

  const filtered = useMemo(() => allProducts.filter((p) =>
    (category === 'Все' || p.category === category) &&
    p.price <= maxPrice &&
    (brands.length === 0 || brands.includes(p.brand)) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [allProducts, category, maxPrice, brands, search]);

  const [catalogLimit, setCatalogLimit] = useState(15);
  useEffect(() => { setCatalogLimit(15); }, [category, search, brands, maxPrice]);

  const addToCart = (id: number) => setCart((c) => {
    const ex = c.find((i) => i.id === id);
    return ex ? c.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i) : [...c, { id, qty: 1 }];
  });
  const changeQty = (id: number, d: number) => setCart((c) =>
    c.map((i) => i.id === id ? { ...i, qty: i.qty + d } : i).filter((i) => i.qty > 0));

  const WHOLESALE_QTY_DEFAULT = wholesaleQtyDefault;
  const WHOLESALE_QTY_HEAVY = wholesaleQtyHeavy;

  const getEffectivePrice = (product: Product, qty: number): { price: number; isWholesale: boolean } => {
    const defaultQty = product.category === 'Тяжёлая техника' ? WHOLESALE_QTY_HEAVY : WHOLESALE_QTY_DEFAULT;
    const wholesaleQty = (product.wholesale_min_qty && product.wholesale_min_qty > 0) ? product.wholesale_min_qty : defaultQty;
    const isWholesaleQty = qty >= wholesaleQty;
    if (isWholesaleQty) return { price: product.wholesale, isWholesale: true };
    // Применяем скидку по карте если не оптовое кол-во
    if (user && user.card) {
      const cardPrice = Math.round(product.price * (1 - user.card.discount_percent / 100));
      return { price: cardPrice, isWholesale: false };
    }
    return { price: product.price, isWholesale: false };
  };

  const cartItems = cart.flatMap((i) => {
    const product = allProducts.find((p) => p.id === i.id);
    if (!product) return [];
    const { price, isWholesale } = getEffectivePrice(product, i.qty);
    return [{ ...product, qty: i.qty, effectivePrice: price, isWholesale }];
  });

  const total = cartItems.reduce((s, i) => s + i.effectivePrice * i.qty, 0);
  const rawTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  // Для отображения скидки по карте (только на нeoптовые позиции)
  const cardDiscountAmount = cartItems.reduce((s, i) => {
    if (!i.isWholesale && user && user.card) return s + Math.round(i.price * user.card.discount_percent / 100) * i.qty;
    return s;
  }, 0);
  const wholesaleDiscountAmount = cartItems.reduce((s, i) => {
    if (i.isWholesale) return s + (i.price - i.wholesale) * i.qty;
    return s;
  }, 0);
  const discountPercent = (user && user.card) ? user.card.discount_percent : 0;
  const discountAmount = cardDiscountAmount;
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const toggleBrand = (b: string) => setBrands((bs) => bs.includes(b) ? bs.filter((x) => x !== b) : [...bs, b]);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="container flex items-center justify-between h-18 py-3">
          <button onClick={() => scrollTo('home')} className="font-display font-black text-2xl gradient-text tracking-tight">
            Се-Се 谢谢
          </button>
          <nav className="hidden lg:flex items-center gap-7">
            {NAV.slice(0, 2).map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {n.label}
              </button>
            ))}
            <button onClick={() => navigate('/services')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Услуги
            </button>
            {NAV.slice(2).map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="ghost" className="rounded-full px-3 gap-2" onClick={() => setCabinetOpen(true)}>
                <Icon name="UserCircle" size={20} />
                <span className="hidden sm:inline text-sm font-medium">{user.name.split(' ')[0]}</span>
              </Button>
            ) : (
              <>
                <Button variant="outline" className="rounded-full px-4 text-sm hidden sm:flex" onClick={() => setAuthOpen(true)}>
                  Войти
                </Button>
                <Button variant="ghost" className="rounded-full sm:hidden flex items-center gap-1 px-2 text-xs" onClick={() => setAuthOpen(true)}>
                  <Icon name="UserCircle" size={22} />
                  <span>Регистрация</span>
                </Button>
              </>
            )}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="gradient-brand text-white rounded-full px-5 relative hover:opacity-90">
                <Icon name="ShoppingBag" size={18} />
                <span className="hidden sm:inline ml-1">Корзина</span>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{count}</span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col p-0" onOpenChange={(open) => { if (!open) { setCheckoutStep('cart'); setOrderDone(false); } }}>
              {/* Шаги */}
              {!orderDone && cartItems.length > 0 && (
                <div className="flex items-center gap-1 px-6 pt-5 pb-3 border-b border-border flex-shrink-0">
                  {[{ key: 'cart', label: 'Корзина', icon: 'ShoppingCart' }, { key: 'address', label: 'Адрес', icon: 'MapPin' }, { key: 'payment', label: 'Оплата', icon: 'CreditCard' }].map((s, idx, arr) => {
                    const stepIdx = ['cart','address','payment'].indexOf(checkoutStep);
                    const sIdx = idx;
                    const done = stepIdx > sIdx;
                    const active = stepIdx === sIdx;
                    return (
                      <div key={s.key} className="flex items-center gap-1 flex-1">
                        <div className={`flex items-center gap-1.5 flex-shrink-0 ${active ? 'text-primary' : done ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${active ? 'border-primary bg-primary text-white' : done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/30'}`}>
                            {done ? <Icon name="Check" size={12} /> : idx + 1}
                          </div>
                          <span className={`text-xs font-medium hidden sm:inline ${active ? 'text-primary' : ''}`}>{s.label}</span>
                        </div>
                        {idx < arr.length - 1 && <div className={`flex-1 h-0.5 mx-1 rounded-full ${done ? 'bg-emerald-500' : 'bg-muted'}`} />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Шаг 1: Корзина */}
              {checkoutStep === 'cart' && (
                <>
                  <SheetHeader className="px-6 pt-4 pb-2 flex-shrink-0">
                    <SheetTitle className="font-display text-2xl">Корзина</SheetTitle>
                  </SheetHeader>
                  {cartItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <Icon name="ShoppingCart" size={48} />
                      <p>Корзина пуста</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-4 px-4 py-3">
                        {cartItems.map((i) => (
                          <div key={i.id} className="flex gap-2 items-center">
                            <img src={i.image} alt={i.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm leading-tight mb-0.5" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{i.name}</p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-primary font-bold text-sm">{fmt(i.effectivePrice)}</p>
                                {i.isWholesale && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">Опт</span>}
                                {!i.isWholesale && i.effectivePrice < i.price && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">−{discountPercent}%</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button size="icon" variant="outline" className="w-7 h-7 rounded-full flex-shrink-0" onClick={() => changeQty(i.id, -1)}><Icon name="Minus" size={14} /></Button>
                              <input
                                type="number"
                                min={1}
                                value={i.qty}
                                onChange={e => {
                                  const v = parseInt(e.target.value);
                                  if (!isNaN(v) && v >= 1) setCart(c => c.map(x => x.id === i.id ? { ...x, qty: v } : x));
                                  else if (e.target.value === '') setCart(c => c.map(x => x.id === i.id ? { ...x, qty: 1 } : x));
                                }}
                                className="w-9 text-center text-sm font-medium border border-input rounded-lg h-7 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                              />
                              <Button size="icon" variant="outline" className="w-7 h-7 rounded-full flex-shrink-0" onClick={() => changeQty(i.id, 1)}><Icon name="Plus" size={14} /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border px-4 pt-4 pb-6 space-y-3 flex-shrink-0">
                        {wholesaleDiscountAmount > 0 && (
                          <div className="bg-emerald-50 rounded-xl px-4 py-2.5 flex items-center justify-between">
                            <span className="text-sm text-emerald-700 font-medium">Оптовая цена</span>
                            <span className="text-sm font-bold text-emerald-700">−{fmt(wholesaleDiscountAmount)}</span>
                          </div>
                        )}
                        {discountAmount > 0 && (
                          <div className="bg-primary/10 rounded-xl px-4 py-2.5 flex items-center justify-between">
                            <span className="text-sm text-primary font-medium">Скидка по карте {discountPercent}%</span>
                            <span className="text-sm font-bold text-primary">−{fmt(discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-display font-bold text-lg">
                          <span>Итого</span><span className="gradient-text">{fmt(total)}</span>
                        </div>
                        <Button className="w-full gradient-brand text-white rounded-full h-12 text-base hover:opacity-90" onClick={() => setCheckoutStep('address')}>
                          Оформить доставку <Icon name="ArrowRight" size={18} className="ml-2" />
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Шаг 2: Адрес */}
              {checkoutStep === 'address' && (
                <>
                  <SheetHeader className="px-6 pt-4 pb-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCheckoutStep('cart')} className="text-muted-foreground hover:text-foreground">
                        <Icon name="ArrowLeft" size={18} />
                      </button>
                      <SheetTitle className="font-display text-2xl">
                        {paymentMethod === 'pickup' ? 'Самовывоз' : 'Адрес доставки'}
                      </SheetTitle>
                    </div>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                    {/* Способ получения */}
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setPaymentMethod('sbp')}
                        className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-center transition-all ${paymentMethod !== 'pickup' ? 'gradient-brand text-white border-transparent' : 'border-border bg-card hover:border-primary'}`}>
                        <Icon name="Truck" size={18} />
                        <span className="text-xs font-semibold">Доставка</span>
                      </button>
                      <button onClick={() => setPaymentMethod('pickup')}
                        className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-center transition-all ${paymentMethod === 'pickup' ? 'gradient-brand text-white border-transparent' : 'border-border bg-card hover:border-primary'}`}>
                        <Icon name="ShoppingBag" size={18} />
                        <span className="text-xs font-semibold">Самовывоз</span>
                      </button>
                    </div>

                    {/* Получатель — всегда */}
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Контактные данные</p>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Имя и фамилия <span className="text-red-400">*</span></label>
                        <Input value={address.name} onChange={e => setAddress({...address, name: e.target.value})} placeholder="Иван Иванов" className="h-12 rounded-xl" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Телефон <span className="text-red-400">*</span></label>
                        <Input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="+7 900 000-00-00" type="tel" className="h-12 rounded-xl" />
                      </div>
                    </div>

                    {/* Самовывоз — баннер */}
                    {paymentMethod === 'pickup' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                        <Icon name="Phone" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-800">Оператор свяжется с вами</p>
                          <p className="text-xs text-blue-700 mt-0.5">После оформления заказа мы позвоним, чтобы согласовать время и оплату картой на месте.</p>
                        </div>
                      </div>
                    )}

                    {/* Адрес — только для доставки */}
                    {paymentMethod !== 'pickup' && (
                      <>
                        {/* Служба доставки */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Служба доставки</p>
                          <div className="grid grid-cols-3 gap-2">
                            {([
                              { key: 'yandex', label: 'Яндекс', sub: '1–2 дня', icon: 'Zap' },
                              { key: 'courier', label: 'Курьер', sub: '1–3 дня', icon: 'Truck' },
                              { key: 'post', label: 'Почта РФ', sub: '3–7 дней', icon: 'Mail' },
                            ] as { key: 'yandex'|'courier'|'post'; label: string; sub: string; icon: string }[]).map(s => (
                              <button key={s.key} onClick={() => setDeliveryService(s.key)}
                                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-center transition-all ${deliveryService === s.key ? 'gradient-brand text-white border-transparent' : 'border-border bg-card hover:border-primary'}`}>
                                <Icon name={s.icon} size={18} />
                                <span className="text-xs font-semibold">{s.label}</span>
                                <span className={`text-xs ${deliveryService === s.key ? 'text-white/70' : 'text-muted-foreground'}`}>{s.sub}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Адрес</p>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Город <span className="text-red-400">*</span></label>
                            <Input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="Москва" className="h-12 rounded-xl" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Улица и дом <span className="text-red-400">*</span></label>
                            <Input value={address.street} onChange={e => setAddress({...address, street: e.target.value})} placeholder="ул. Ленина, д. 10" className="h-12 rounded-xl" />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Подъезд</label>
                              <Input value={address.entrance} onChange={e => setAddress({...address, entrance: e.target.value})} placeholder="1" inputMode="numeric" className="h-12 rounded-xl text-center" />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Этаж</label>
                              <Input value={address.floor} onChange={e => setAddress({...address, floor: e.target.value})} placeholder="5" inputMode="numeric" className="h-12 rounded-xl text-center" />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Квартира</label>
                              <Input value={address.apartment} onChange={e => setAddress({...address, apartment: e.target.value})} placeholder="12" inputMode="numeric" className="h-12 rounded-xl text-center" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Индекс</label>
                            <Input value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} placeholder="123456" inputMode="numeric" className="h-12 rounded-xl" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Комментарий курьеру</label>
                            <textarea value={address.comment} onChange={e => setAddress({...address, comment: e.target.value})}
                              placeholder="Код домофона, время доставки, особые пожелания..."
                              rows={2} className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="border-t border-border px-6 pt-4 pb-6 flex-shrink-0">
                    <Button
                      className="w-full gradient-brand text-white rounded-full h-12 text-base hover:opacity-90 disabled:opacity-50"
                      disabled={!address.name || !address.phone || (paymentMethod !== 'pickup' && (!address.city || !address.street))}
                      onClick={() => setCheckoutStep('payment')}>
                      {paymentMethod === 'pickup' ? 'Продолжить' : 'Перейти к оплате'} <Icon name="ArrowRight" size={18} className="ml-2" />
                    </Button>
                    {(!address.name || !address.phone || (paymentMethod !== 'pickup' && (!address.city || !address.street))) && (
                      <p className="text-xs text-muted-foreground text-center mt-2">Заполните обязательные поля <span className="text-red-400">*</span></p>
                    )}
                  </div>
                </>
              )}

              {/* Шаг 3: Оплата */}
              {checkoutStep === 'payment' && !orderDone && (
                <>
                  <SheetHeader className="px-6 pt-4 pb-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCheckoutStep('address')} className="text-muted-foreground hover:text-foreground">
                        <Icon name="ArrowLeft" size={18} />
                      </button>
                      <SheetTitle className="font-display text-2xl">Оплата</SheetTitle>
                    </div>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {/* Сводка */}
                    <div className="bg-muted/50 rounded-2xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                          {paymentMethod === 'pickup' ? 'Самовывоз' : 'Доставка'}
                        </p>
                        {paymentMethod !== 'pickup' && (
                          <span className="text-xs font-medium text-primary">
                            {deliveryService === 'yandex' ? '⚡ Яндекс Доставка' : deliveryService === 'courier' ? '🚚 Курьер' : '📮 Почта РФ'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold">{address.name} · {address.phone}</p>
                      {paymentMethod !== 'pickup' && (
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.street}
                          {address.entrance ? `, подъезд ${address.entrance}` : ''}
                          {address.floor ? `, этаж ${address.floor}` : ''}
                          {address.apartment ? `, кв. ${address.apartment}` : ''}
                          {address.zip ? ` ${address.zip}` : ''}
                        </p>
                      )}
                      {address.comment && <p className="text-xs text-muted-foreground italic">💬 {address.comment}</p>}
                    </div>
                    {/* Состав заказа */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Состав заказа</p>
                      {cartItems.map(i => (
                        <div key={i.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate flex-1 mr-2">
                            {i.name} × {i.qty}
                            {i.isWholesale && <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 px-1 rounded">опт</span>}
                          </span>
                          <span className="font-medium flex-shrink-0">{fmt(i.effectivePrice * i.qty)}</span>
                        </div>
                      ))}
                      {wholesaleDiscountAmount > 0 && (
                        <div className="flex justify-between text-sm pt-1">
                          <span className="text-emerald-700 font-medium">Оптовая цена</span>
                          <span className="text-emerald-700 font-bold">−{fmt(wholesaleDiscountAmount)}</span>
                        </div>
                      )}
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-primary font-medium">Скидка по карте {discountPercent}%</span>
                          <span className="text-primary font-bold">−{fmt(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-display font-bold text-base pt-2 border-t border-border">
                        <span>Итого</span><span className="gradient-text">{fmt(total)}</span>
                      </div>
                    </div>
                    {/* Способы оплаты */}
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">Способ оплаты</p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { key: 'sbp', icon: 'Smartphone', label: 'СБП', sub: 'Оплата через Т-Банк по QR-коду или ссылке' },
                          { key: 'card_store', icon: 'CreditCard', label: 'Банковская карта', sub: 'Онлайн-оплата картой — перейдёте на страницу ввода данных' },
                          { key: 'pickup', icon: 'ShoppingBag', label: 'Самовывоз', sub: 'Забираете сами — оплата при получении в магазине' },
                        ].map(m => (
                          <div key={m.key} onClick={() => setPaymentMethod(m.key as 'sbp' | 'card_store' | 'pickup')} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === m.key ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${paymentMethod === m.key ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                              <Icon name={m.icon} size={16} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{m.label}</p>
                              <p className="text-xs text-muted-foreground">{m.sub}</p>
                            </div>
                            {paymentMethod === m.key && <Icon name="CheckCircle2" size={18} className="text-primary flex-shrink-0" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border px-6 pt-4 pb-6 flex-shrink-0">
                    <Button
                      className="w-full gradient-brand text-white rounded-full h-12 text-base hover:opacity-90"
                      disabled={orderLoading}
                      onClick={async () => {
                        setOrderLoading(true);
                        try {
                          const res = await fetch(ORDERS_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                            body: JSON.stringify({
                              action: 'create',
                              name: address.name,
                              phone: address.phone,
                              city: address.city,
                              street: address.street,
                              entrance: address.entrance,
                              floor: address.floor,
                              apartment: address.apartment,
                              zip: address.zip,
                              comment: address.comment,
                              delivery_service: deliveryService,
                              payment_method: paymentMethod,
                              total,
                              is_wholesale: cartItems.some(i => i.isWholesale),
                              items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.effectivePrice, qty: i.qty })),
                            }),
                          });
                          const orderData = await res.json();
                          const savedTotal = total;
                          setOrderTotal(savedTotal);
                          setCart([]);
                          setOrderDone(true);
                          // Если СБП или карта — инициируем платёж Т-Банк
                          if ((paymentMethod === 'sbp' || paymentMethod === 'card_store') && orderData.order_id) {
                            setPaymentLoading(true);
                            try {
                              const payRes = await fetch(ORDERS_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'pay_init', order_id: orderData.order_id, amount: savedTotal }),
                              });
                              const payData = await payRes.json();
                              if (payData.payment_url) {
                                setPaymentUrl(payData.payment_url);
                                window.location.href = payData.payment_url;
                              }
                            } catch {
                              // fallback
                            } finally {
                              setPaymentLoading(false);
                            }
                          }
                        } finally {
                          setOrderLoading(false);
                        }
                      }}>
                      {orderLoading
                        ? <span className="flex items-center gap-2"><Icon name="Loader2" size={18} className="animate-spin" />Отправляю...</span>
                        : `Подтвердить заказ на ${fmt(total)}`}
                    </Button>
                  </div>
                </>
              )}

              {/* Успех */}
              {orderDone && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Icon name="CheckCircle2" size={48} className="text-emerald-500" />
                  </div>
                  <h2 className="font-display font-black text-2xl">Заказ принят!</h2>
                  <p className="text-muted-foreground text-sm">Мы свяжемся с вами по номеру <span className="font-medium text-foreground">{address.phone}</span> для подтверждения</p>

                  {(paymentMethod === 'sbp' || paymentMethod === 'card_store') && (
                    <div className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col gap-3">
                      <p className="text-sm font-bold text-emerald-800">
                        {paymentMethod === 'sbp' ? 'Оплата через СБП' : 'Оплата банковской картой'}
                      </p>
                      <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between border border-emerald-100">
                        <span className="text-xs text-emerald-700">Сумма</span>
                        <span className="text-lg font-black text-emerald-800">{fmt(orderTotal)}</span>
                      </div>
                      {paymentLoading ? (
                        <div className="flex items-center justify-center gap-2 py-2">
                          <Icon name="Loader2" size={18} className="text-emerald-600 animate-spin" />
                          <span className="text-sm text-emerald-700">Создаём ссылку на оплату...</span>
                        </div>
                      ) : (
                        <a href={paymentUrl || SBP_URL} className="w-full inline-flex items-center justify-center gap-2 gradient-brand text-white rounded-full h-11 text-sm font-medium hover:opacity-90">
                          <Icon name={paymentMethod === 'sbp' ? 'Smartphone' : 'CreditCard'} size={16} />
                          Перейти к оплате
                        </a>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'pickup' && (
                    <div className="w-full p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Icon name="ShoppingBag" size={18} className="text-blue-600" />
                        <p className="text-sm font-bold text-blue-800">Самовывоз подтверждён</p>
                      </div>
                      <p className="text-sm text-blue-700">Мы свяжемся с вами, чтобы согласовать время. Оплата картой на месте.</p>
                      <div className="bg-white rounded-xl px-3 py-2 flex items-center justify-between border border-blue-100">
                        <span className="text-xs text-blue-700">К оплате при получении</span>
                        <span className="text-base font-black text-blue-800">{fmt(orderTotal)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </header>

      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <Icon name="CheckCircle2" size={48} className="text-emerald-500" />
            </div>
            <h2 className="font-display font-black text-2xl">Оплата прошла!</h2>
            <p className="text-muted-foreground text-sm">Ваш заказ оплачен и принят в работу. Мы свяжемся с вами для подтверждения доставки.</p>
            <Button className="w-full gradient-brand text-white rounded-full" onClick={() => setPaymentSuccess(false)}>Отлично!</Button>
          </div>
        </div>
      )}

      {paymentFail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <Icon name="XCircle" size={48} className="text-red-500" />
            </div>
            <h2 className="font-display font-black text-2xl">Оплата не прошла</h2>
            <p className="text-muted-foreground text-sm">Что-то пошло не так. Попробуйте ещё раз или выберите другой способ оплаты.</p>
            <Button className="w-full gradient-brand text-white rounded-full" onClick={() => setPaymentFail(false)}>Понятно</Button>
          </div>
        </div>
      )}

      <section id="home" className="relative overflow-hidden gradient-mesh">
        <div className="container py-24 md:py-32 grid md:grid-cols-2 gap-12 items-start">
          <div className="animate-fade-in">
            <Badge className="gradient-brand text-white border-0 mb-6 rounded-full px-4 py-1.5">Новая коллекция 2026</Badge>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-[0.95] tracking-tight mb-6">
              Компания,<br /><span className="gradient-text">которая вдохновляет и всегда рядом</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Всё, что нужно для жизни, отдыха и радости — в одном месте. Выбираем лучшее, чтобы вы были довольны.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => scrollTo('catalog')} className="gradient-brand text-white rounded-full h-13 px-8 text-base hover:opacity-90">
                В каталог <Icon name="ArrowRight" size={18} className="ml-1" />
              </Button>
              <Button onClick={() => navigate('/services')} variant="outline" className="rounded-full h-13 px-8 text-base">Услуги</Button>
              <Button onClick={() => scrollTo('about')} variant="outline" className="rounded-full h-13 px-8 text-base">О нас</Button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full md:w-[480px] animate-scale-in">
              <div className="absolute inset-0 gradient-brand blur-3xl opacity-30 rounded-full" />
              <div className="relative overflow-hidden rounded-3xl shadow-2xl aspect-square">
                {heroSlides.map((p, i) => (
                  <div key={`${p.id}-${i}`} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: i === heroIdx ? 1 : 0 }}>
                    <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg opacity-60" />
                    <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-contain" />
                  </div>
                ))}
                {heroSlides[heroIdx] && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2">
                      <div className="text-white/60 text-[10px] uppercase tracking-wider">{heroSlides[heroIdx].category}</div>
                      <div className="text-white text-sm font-medium leading-tight line-clamp-1">{heroSlides[heroIdx].name}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 flex-wrap justify-center max-w-[200px]">
                {heroSlides.map((_, i) => (
                  <button key={i} onClick={() => setHeroIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIdx ? 'w-6 gradient-brand' : 'w-1.5 bg-muted-foreground/40'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Блок преимуществ */}
      <section className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'Zap', title: 'Доставка за 1 день', sub: 'По городу курьером', color: 'bg-amber-50 text-amber-600' },
            { icon: 'ShieldCheck', title: 'Гарантия качества', sub: 'Возврат 14 дней', color: 'bg-emerald-50 text-emerald-600' },
            { icon: 'BadgePercent', title: 'Оптовые цены', sub: 'Скидки от 20%', color: 'bg-blue-50 text-blue-600' },
            { icon: 'Headphones', title: 'Поддержка 24/7', sub: 'Всегда на связи', color: 'bg-purple-50 text-purple-600' },
          ].map((f) => (
            <div key={f.title} className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-3 hover-scale">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.color}`}>
                <Icon name={f.icon} size={22} />
              </div>
              <div>
                <p className="font-display font-bold text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Блок офлайн-магазина */}
      <section className="container py-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Фото / слайдер */}
            {(() => {
              const imgs = storeImages.length > 0 ? storeImages : ['https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/6f802402-56c8-4228-bd60-a676b940611d.jpg'];
              const idx = storeSlideIdx % imgs.length;
              return (
                <div className="relative min-h-[300px] md:min-h-[420px] overflow-hidden">
                  {imgs.map((src, i) => (
                    <div key={src} className={`absolute inset-0 transition-opacity duration-500 ${i === idx ? 'opacity-100' : 'opacity-0'}`}>
                      <img src={src} alt={`Магазин ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:bg-gradient-to-t md:from-black/30 md:to-transparent" />
                  <div className="absolute top-5 left-5">
                    {(() => {
                      const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
                      const pad = (n: number) => String(n).padStart(2, '0');
                      // Парсим часы из contact_hours ("Ежедневно с 9:00 до 21:00")
                      const hoursStr = socials.contact_hours || '';
                      const hoursMatch = hoursStr.match(/(\d{1,2})[:.](\d{2}).*?(\d{1,2})[:.](\d{2})/);
                      const openH = hoursMatch ? parseInt(hoursMatch[1]) : 9;
                      const closeH = hoursMatch ? parseInt(hoursMatch[3]) : 21;
                      const isOpen = h >= openH && h < closeH;
                      if (isOpen) {
                        const minsLeft = (closeH - h - 1) * 60 + (60 - m);
                        const showTimer = minsLeft < 60;
                        const mm = pad(59 - m), ss = pad(60 - s === 60 ? 0 : 60 - s);
                        return (
                          <span className={`font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 ${showTimer ? 'bg-orange-500 text-white' : 'bg-white text-foreground'}`}>
                            <span className={`w-2 h-2 rounded-full ${showTimer ? 'bg-white animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
                            {showTimer ? `Закрываемся через ${mm}:${ss}` : 'Открыто сейчас'}
                          </span>
                        );
                      } else {
                        const minsToOpen = h < openH
                          ? (openH - h - 1) * 60 + (60 - m)
                          : (24 - h + openH - 1) * 60 + (60 - m);
                        const hLeft = Math.floor(minsToOpen / 60);
                        const mLeft = minsToOpen % 60;
                        const ss = pad(60 - s === 60 ? 0 : 60 - s);
                        return (
                          <span className="bg-gray-800/80 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            {`Закрыто · откроемся через ${pad(hLeft)}:${pad(mLeft)}:${ss}`}
                          </span>
                        );
                      }
                    })()}
                  </div>
                  {imgs.length > 1 && (
                    <>
                      <button
                        onClick={() => setStoreSlideIdx(i => (i - 1 + imgs.length) % imgs.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
                      >
                        <Icon name="ChevronLeft" size={18} />
                      </button>
                      <button
                        onClick={() => setStoreSlideIdx(i => (i + 1) % imgs.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
                      >
                        <Icon name="ChevronRight" size={18} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {imgs.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setStoreSlideIdx(i)}
                            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Контент */}
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-bold px-4 py-2 rounded-full mb-5 w-fit">
                <Icon name="Store" size={16} />
                Офлайн-магазин
              </div>
              <h2 className="font-display font-black text-3xl md:text-4xl tracking-tight leading-tight mb-4">
                🏪 У нас есть<br />настоящий магазин
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Мы работаем не только онлайн — приходите к нам в магазин, где можно посмотреть товары вживую, получить консультацию и подобрать уход.
              </p>

              {/* Мини-доверие */}
              <div className="grid grid-cols-2 gap-3 mb-7">
                {[
                  { icon: 'Eye', text: 'Товары вживую' },
                  { icon: 'MessageCircle', text: 'Консультация' },
                  { icon: 'PackageCheck', text: 'Самовывоз' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 bg-muted rounded-xl px-2.5 py-2.5">
                    <Icon name={item.icon} size={14} className="text-primary flex-shrink-0" />
                    <span className="text-xs font-medium leading-tight">{item.text}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 bg-muted rounded-xl px-3 py-2.5 col-span-1">
                  <Icon name="Clock" size={16} className="text-primary flex-shrink-0" />
                  <span className="text-xs font-medium leading-tight">{socials.contact_hours || 'Ежедневно 9–21'}</span>
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => scrollTo('contacts')} className="gradient-brand text-white rounded-full px-6 h-12 font-medium hover:opacity-90 gap-2">
                  <Icon name="MapPin" size={16} />
                  Посмотреть адрес
                </Button>
                <a
                  href="https://yandex.ru/maps/-/CTQfNKix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-border rounded-full px-6 h-12 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Icon name="Navigation" size={16} />
                  Проложить маршрут
                </a>
              </div>
              <button onClick={() => scrollTo('delivery')} className="mt-3 text-sm text-primary font-medium hover:underline flex items-center gap-1.5 w-fit">
                <Icon name="ShoppingBag" size={14} />
                Самовывоз из магазина — бесплатно
              </button>
            </div>
          </div>
        </div>

        {/* Блок доверия — строка */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: 'BadgeCheck', label: 'Оригинальная продукция', color: 'text-emerald-600 bg-emerald-50' },
            { icon: 'MessageSquare', label: 'Консультация', color: 'text-blue-600 bg-blue-50' },
            { icon: 'Zap', label: 'Быстрая доставка', color: 'text-amber-600 bg-amber-50' },
            { icon: 'Store', label: 'Офлайн-магазин', color: 'text-purple-600 bg-purple-50' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <Icon name={item.icon} size={18} />
              </div>
              <span className="text-xs sm:text-sm font-medium leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="catalog" className="container py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-4 flex-wrap mb-1">
              <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight">Каталог</h2>
              <button onClick={() => navigate('/services')} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary border border-primary/30 bg-primary/5 rounded-full px-4 py-1.5 hover:bg-primary/10 transition-colors">
                <Icon name="Sparkles" size={14} />
                Услуги
              </button>
            </div>
            <p className="text-muted-foreground mt-1 max-w-lg">Всё, что нужно для жизни, отдыха и радости — в одном месте. Выбираем лучшее, чтобы вы были довольны.</p>
            <p className="text-muted-foreground text-sm mt-1">Найдено товаров: {filtered.length}</p>
          </div>
          <div className="relative w-full md:w-80">
            <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск товаров..." className="pl-11 h-12 rounded-full bg-card" />
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <aside className="space-y-8 lg:sticky lg:top-24 self-start h-fit bg-card rounded-3xl p-6 border border-border">
            <div>
              <h3 className="font-display font-bold mb-3">Категории</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === c ? 'gradient-brand text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display font-bold mb-3">Цена до</h3>
              <Slider value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0])} max={5000000} min={200} step={1000} />
              <p className="text-primary font-bold mt-3">{fmt(maxPrice)}</p>
            </div>
            <div>
              <h3 className="font-display font-bold mb-3">Бренд</h3>
              <div className="space-y-2">
                {allBrands.map((b) => (
                  <label key={b} className="flex items-center gap-3 cursor-pointer group">
                    <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${brands.includes(b) ? 'gradient-brand border-transparent' : 'border-border'}`}>
                      {brands.includes(b) && <Icon name="Check" size={14} className="text-white" />}
                    </span>
                    <input type="checkbox" checked={brands.includes(b)} onChange={() => toggleBrand(b)} className="sr-only" />
                    <span className="text-sm group-hover:text-primary transition-colors">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {!productsLoaded && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-3xl border border-border overflow-hidden flex flex-col animate-pulse">
                <div className="bg-muted" style={{ aspectRatio: '4/3' }} />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded-full w-3/4" />
                  <div className="h-3 bg-muted rounded-full w-1/2" />
                  <div className="h-3 bg-muted rounded-full w-full" />
                  <div className="h-10 bg-muted rounded-2xl w-full mt-2" />
                </div>
              </div>
            ))}
            {productsLoaded && filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <Icon name="SearchX" size={48} className="mx-auto mb-3" />
                Ничего не найдено
              </div>
            )}
            {filtered.slice(0, catalogLimit).map((p, idx) => {
              const inCart = cart.find(i => i.id === p.id);
              return (
                <div key={p.id} className="group bg-card rounded-3xl border border-border overflow-hidden flex flex-col hover-scale animate-fade-in" style={{ animationDelay: `${idx * 60}ms`, opacity: 0 }}>
                  <div className="relative overflow-hidden cursor-pointer" style={{ aspectRatio: '4/3' }} onClick={() => setModalProduct(p)}>
                    <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg opacity-60" />
                    <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                    {p.badge && <Badge className="absolute top-3 left-3 gradient-brand text-white border-0 rounded-full text-xs px-3">{p.badge}</Badge>}
                    <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md">
                      <Icon name="ZoomIn" size={16} className="text-muted-foreground" />
                    </div>
                    {inCart && (
                      <div className="absolute bottom-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        В корзине: {inCart.qty} шт.
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{p.category}</span>
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={13} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold">{p.rating}</span>
                        <span className="text-xs text-muted-foreground">(отзывы)</span>
                      </div>
                    </div>
                    <button className="text-left" onClick={() => setModalProduct(p)}>
                      <h3 className="font-display font-bold text-base leading-snug mb-1 hover:text-primary transition-colors">{p.name}</h3>
                    </button>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {p.description?.trim() || `${p.brand} · Оригинальное качество · Быстрая доставка`}
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <span className="font-display font-black text-2xl">{fmt(p.price)}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs text-muted-foreground">Опт от {(p.wholesale_min_qty && p.wholesale_min_qty > 0) ? p.wholesale_min_qty : (p.category === 'Тяжёлая техника' ? WHOLESALE_QTY_HEAVY : WHOLESALE_QTY_DEFAULT)} шт:</span>
                            <span className="text-xs font-bold text-emerald-600">{fmt(p.wholesale)}</span>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                          −{Math.round((1 - p.wholesale / p.price) * 100)}% опт
                        </span>
                      </div>
                      <Button onClick={() => addToCart(p.id)} className="w-full gradient-brand text-white rounded-full h-11 text-sm font-medium hover:opacity-90 gap-2">
                        <Icon name="ShoppingCart" size={16} />
                        В корзину
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length > catalogLimit && (
              <div className="col-span-full flex justify-center pt-4">
                <button
                  onClick={() => setCatalogLimit(c => c + 15)}
                  className="px-8 py-3 rounded-full border border-border bg-card hover:bg-muted transition-colors text-sm font-medium"
                >
                  Ещё {Math.min(15, filtered.length - catalogLimit)} товаров
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="delivery" className="bg-muted/40 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="gradient-brand text-white border-0 mb-4 rounded-full px-4 py-1.5">Доставка и оплата</Badge>
            <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl tracking-tight">Быстро, удобно, надёжно</h2>
            <p className="text-muted-foreground mt-3 text-sm sm:text-lg">Доставляем по всей России — от Калининграда до Владивостока</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: 'Zap', title: 'Доставка за 1 день', text: 'Курьером по Долгопрудному и Москве (до МКАД). По России — 2–5 дней Яндекс Доставкой, СДЭК или Почтой России', badge: 'Быстро' },
              { icon: 'CreditCard', title: 'Удобная оплата', text: 'СБП, банковской картой онлайн, наличными или картой курьеру при получении', badge: 'Без переплат' },
              { icon: 'ShieldCheck', title: 'Гарантия 2 года', text: 'Официальная гарантия на всю технику. Возврат и обмен в течение 14 дней без вопросов', badge: 'Надёжно' },
            ].map((f) => (
              <div key={f.title} className="bg-card rounded-3xl p-8 border border-border hover-scale flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center">
                    <Icon name={f.icon} size={26} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{f.badge}</span>
                </div>
                <h3 className="font-display font-bold text-xl">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
          {/* Зоны и стоимость доставки */}
          <div className="bg-card rounded-3xl border border-border p-6 md:p-8 mb-6">
            <h3 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
              <Icon name="MapPin" size={18} className="text-primary" />
              Стоимость доставки
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base">Долгопрудный</span>
                  <span className="text-emerald-600 font-black text-lg">Бесплатно</span>
                </div>
                <p className="text-sm text-muted-foreground">Доставка курьером по всему городу без ограничений по сумме заказа</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Icon name="Clock" size={14} className="text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">Доставка в день заказа</span>
                </div>
              </div>
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base">Москва (до МКАД)</span>
                  <span className="text-blue-600 font-black text-lg">от 5 000 ₽ — бесплатно</span>
                </div>
                <p className="text-sm text-muted-foreground">При заказе до 5 000 ₽ — доставка от 300 ₽. От 5 000 ₽ — бесплатно</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Icon name="Clock" size={14} className="text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">1–2 дня</span>
                </div>
              </div>
              <div className="rounded-2xl bg-muted border border-border p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base">Вся Россия</span>
                  <span className="text-foreground font-black text-lg">По тарифу</span>
                </div>
                <p className="text-sm text-muted-foreground">СДЭК, Яндекс Доставка, Почта России — стоимость по тарифу службы доставки</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Icon name="Clock" size={14} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">2–14 дней</span>
                </div>
              </div>
            </div>
          </div>

          {/* Способы доставки */}
          <div className="bg-card rounded-3xl border border-border p-6 md:p-8">
            <h3 className="font-display font-bold text-lg mb-5">Службы доставки</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Яндекс Доставка', time: '1–2 дня', icon: 'Car' },
                { name: 'СДЭК', time: '2–5 дней', icon: 'Package' },
                { name: 'Почта России', time: '5–14 дней', icon: 'Mail' },
                { name: 'Самовывоз', time: 'Бесплатно', icon: 'MapPin' },
              ].map((d) => (
                <div key={d.name} className="flex items-center gap-3 bg-muted rounded-2xl p-4">
                  <Icon name={d.icon} size={20} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Отзывы покупателей */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <Badge className="gradient-brand text-white border-0 mb-4 rounded-full px-4 py-1.5">Отзывы</Badge>
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight">Нам доверяют покупатели</h2>
          <p className="text-muted-foreground mt-3 text-lg">Реальные отзывы наших покупателей</p>
        </div>

        {/* Отзывы */}
        {(() => {
          const ALL_REVIEWS = [
            { name: 'Андрей В.', city: 'Долгопрудный', date: '1 апр 2025', rating: 5, src: 'yandex', text: 'Отличный магазин, очень уютно, чисто! Отличный товар и доброжелательный персонал! Очень много интересного и нового для себя нашел 👍' },
            { name: 'Марго Т.', city: 'Долгопрудный', date: '30 авг 2025', rating: 5, src: 'yandex', text: 'Недавно побывали с детьми — теперь мы там частые гости. Как заходишь, сразу приятный аромат встречает и хорошая музыка. Много разных необычных товаров!' },
            { name: 'Надежда П.', city: 'Долгопрудный', date: '21 сен 2024', rating: 5, src: 'yandex', text: 'Гуляя с дочкой решила зайти. Такой приятный глазу ремонт, вкусно пахнет, в общем уйти без улова не смогла 😍 Фотографировала подруге с рекомендациями!' },
            { name: 'mortyx122', city: 'Долгопрудный', date: '9 май 2025', rating: 5, src: 'yandex', text: 'Первый раз зашёл просто посмотреть — взял несколько азиатских сладостей и мороженное. Очень понравилась атмосфера, всё чисто и красиво оформлено!' },
            { name: 'Анастасия Б.', city: 'Долгопрудный', date: '16 сен 2024', rating: 5, src: 'yandex', text: 'Очень давно ждали открытия! Пришли сразу — были приятно удивлены не только ассортиментом, но и ценой. Взяли на пробу и ни о чём не пожалели, вернёмся ещё!' },
            { name: 'vurado ichi', city: 'Долгопрудный', date: '29 ноя 2025', rating: 5, src: 'yandex', text: 'Много интересных товаров, но больше всего захватили газированные напитки. Есть всё — Mountain Dew, Coca-Cola, Sprite. Захожу регулярно, рекомендую! 🔥' },
            { name: 'Кирилл З.', city: 'Долгопрудный', date: '3 фев 2025', rating: 5, src: 'site', text: 'Заказал онлайн с доставкой — привезли буквально за час! Упаковано аккуратно, всё целое. Взял корейскую косметику жене и азиатские снеки — всё понравилось 🙌' },
            { name: 'Ольга С.', city: 'Москва', date: '14 мар 2025', rating: 5, src: 'site', text: 'Доставка просто огонь — оформила заказ в обед, уже вечером всё было дома. Курьер вежливый, позвонил заранее. Bubble Tea Matcha — восторг, теперь беру регулярно!' },
            { name: 'Денис К.', city: 'Химки', date: '20 янв 2025', rating: 5, src: 'site', text: 'Давно искал нормальный магазин азиатских товаров — нашёл! Ассортимент огромный, цены адекватные. Заказал онлайн, доставили быстро и бесплатно. Снеки Chimi Mix — лучшие!' },
            { name: 'Светлана М.', city: 'Долгопрудный', date: '5 апр 2025', rating: 5, src: 'site', text: 'Брала маски для лица и сыворотку — качество отличное, как в корейских магазинах. Доставка пришла очень быстро. Девочки, советую всем кто следит за кожей ✨' },
            { name: 'Тимур И.', city: 'Лобня', date: '11 май 2025', rating: 5, src: 'site', text: 'Заказал игрушку Куро сыну на день рождения через сайт. Оформление простое, оплата удобная, доставили в нужный день. Сын счастлив! Качество отличное. Спасибо! 🎁' },
            { name: 'Алина П.', city: 'Долгопрудный', date: '28 июн 2025', rating: 5, src: 'site', text: 'Случайно нашла в интернете, решила попробовать заказать. Привезли быстро, всё как на фото. Набор ручек Kawaii — просто прелесть, дочка в восторге. Теперь только здесь!' },
            { name: 'Максим Б.', city: 'Мытищи', date: '7 июл 2025', rating: 5, src: 'site', text: 'Брал Рамен Tonkotsu и газировку Yuzu — необычно и вкусно. Удобно заказывать онлайн. Больше никаких поездок за азиатскими вкусняшками 😄' },
            { name: 'Юлия Ф.', city: 'Долгопрудный', date: '19 авг 2025', rating: 5, src: 'site', text: 'Пришли в магазин всей семьёй — дети уходить не хотели! Взяли игрушки, снеки и косметику. Персонал приветливый, всё объяснил. Вернёмся!' },
            { name: 'Роман К.', city: 'Долгопрудный', date: '2 сен 2025', rating: 5, src: 'site', text: 'Оформил заказ поздно вечером, утром позвонили и уточнили детали. К обеду всё было. Вот это сервис! Питбайк взял для дачи — доставили аккуратно, рекомендую!' },
            { name: 'Валерия Н.', city: 'Москва', date: '15 окт 2025', rating: 5, src: 'site', text: 'Впервые попробовала азиатскую косметику — маска Bamboo просто чудо, кожа после неё бархатная! Привезли быстро и в хорошей упаковке. Подруги завидуют 😊' },
            { name: 'Игорь С.', city: 'Долгопрудный', date: '30 окт 2025', rating: 5, src: 'site', text: 'Купил квадроцикл для сына — менеджер помог с выбором, ответил на все вопросы. Доставка бесплатная. Ребёнок счастлив, мы тоже! Доверяем магазину 💪' },
            { name: 'Екатерина Д.', city: 'Долгопрудный', date: '5 ноя 2025', rating: 5, src: 'site', text: 'Подарила подруге набор корейской косметики — она была в восторге! Всё упаковано с любовью. Буду брать подарки только здесь 🎀' },
            { name: 'Никита Л.', city: 'Мытищи', date: '12 ноя 2025', rating: 5, src: 'site', text: 'Заказал снеки и чай матча — всё пришло быстро, вкусно. Упаковка плотная, ничего не помялось. Буду брать ещё!' },
            { name: 'Ирина Д.', city: 'Долгопрудный', date: '18 ноя 2025', rating: 5, src: 'site', text: 'Сыворотка Glow Essence — просто чудо! Кожа стала заметно лучше уже через неделю. Цена адекватная, доставка быстрая. Рекомендую всем девочкам 💆‍♀️' },
            { name: 'Дмитрий Р.', city: 'Химки', date: '22 ноя 2025', rating: 5, src: 'site', text: 'Взял питбайк MX125 — доставили за день, собрали и проверили. Всё работает отлично. Менеджер на связи, ответил на все вопросы. Настоящий сервис!' },
            { name: 'Полина К.', city: 'Долгопрудный', date: '25 ноя 2025', rating: 5, src: 'site', text: 'Мороженое и бобы эдамаме просто бомба! Такого нигде в округе не найдёшь. Хожу почти каждую неделю, каждый раз что-то новое нахожу 😍' },
            { name: 'Артём В.', city: 'Москва', date: '1 дек 2025', rating: 5, src: 'site', text: 'Заказал подарочный набор на новый год — отличная идея! Всё красиво упаковано, привезли вовремя. Родственники были в восторге от необычных азиатских сладостей' },
            { name: 'Наталья О.', city: 'Долгопрудный', date: '3 дек 2025', rating: 5, src: 'site', text: 'Плюшевый Куро такой милый! Взяла дочке — она его не выпускает из рук уже неделю. Мягкий, большой, качественная вышивка. Однозначно буду брать ещё игрушки здесь' },
            { name: 'Виталий П.', city: 'Лобня', date: '7 дек 2025', rating: 5, src: 'site', text: 'Квадроцикл ATV 110cc для сына — лучший подарок! Доставили собранным и проверенным. Мальчик счастлив, гоняет каждый день. Магазину доверяю 🏍️' },
            { name: 'Марина Т.', city: 'Долгопрудный', date: '10 дек 2025', rating: 5, src: 'site', text: 'Ароматическая свеча из набора просто невероятная — горит ровно, запах нежный. Весь дом благоухает. Буду брать в подарок подругам на праздники' },
            { name: 'Антон Г.', city: 'Мытищи', date: '12 дек 2025', rating: 5, src: 'site', text: 'Заказал снеки Chimi Mix — пакет опустел за вечер, очень вкусно и необычно. Доставка быстрая, курьер пунктуальный. Уже оформил повторный заказ!' },
            { name: 'Вероника Ш.', city: 'Долгопрудный', date: '15 дек 2025', rating: 5, src: 'site', text: 'Набор ручек Kawaii подарила племяннице на день рождения — она визжала от восторга! Такие красивые, яркие. Отличное качество для такой цены' },
            { name: 'Сергей Б.', city: 'Химки', date: '17 дек 2025', rating: 5, src: 'site', text: 'Впервые попробовал Bubble Tea дома — взял матча и оригинальный. Вкусно, необычно, жемчужины тапиоки отличные. Теперь не нужно ехать в кафе' },
            { name: 'Анна К.', city: 'Долгопрудный', date: '19 дек 2025', rating: 5, src: 'site', text: 'Маска Jeju оставила кожу увлажнённой на весь день. Брала 5 штук — закончились быстро, уже дозаказала. Цена приятная, эффект отличный' },
            { name: 'Павел М.', city: 'Долгопрудный', date: '21 дек 2025', rating: 5, src: 'site', text: 'Отличный магазин для тех кто любит всё необычное. Ассортимент постоянно обновляется, каждый раз что-то новое. Персонал помогает с выбором' },
            { name: 'Диана Ю.', city: 'Москва', date: '23 дек 2025', rating: 5, src: 'site', text: 'Скетчбук A5 просто идеален — плотная бумага, лежит ровно, не скручивается. Взяла два сразу. Буду брать ещё канцелярию здесь, выбор хороший' },
            { name: 'Фёдор И.', city: 'Долгопрудный', date: '26 дек 2025', rating: 5, src: 'site', text: 'На новый год взял несколько наборов снеков — гости были в восторге, такого нигде не пробовали. Оригинально и вкусно. Спасибо магазину! 🎄' },
            { name: 'Кристина Р.', city: 'Лобня', date: '28 дек 2025', rating: 5, src: 'site', text: 'Заказала подарки на новый год через сайт — всё пришло за день, красиво упаковано. Дети были в восторге от игрушек и сладостей. Отличный сервис!' },
            { name: 'Михаил Е.', city: 'Долгопрудный', date: '30 дек 2025', rating: 5, src: 'site', text: 'Газировка Yuzu — это что-то невероятное! Такого вкуса нигде не встречал. Взял сразу ящик. Цена за баночку немного кусается, но оно того стоит 😄' },
            { name: 'Татьяна В.', city: 'Химки', date: '2 янв 2026', rating: 5, src: 'site', text: 'С праздниками брала наборы для дома «Уют» — качество на высоте, всё натуральное. Свеча горит ровно, аромат нежный. Теперь постоянный покупатель' },
            { name: 'Алексей Ж.', city: 'Долгопрудный', date: '5 янв 2026', rating: 5, src: 'site', text: 'Питбайк MX150 Pro — зверь! Взял для трассы, доставили без единой царапины. Менеджер проконсультировал по всем техническим вопросам. Реально крутой магазин 💪' },
            { name: 'Марьяна Б.', city: 'Долгопрудный', date: '8 янв 2026', rating: 5, src: 'site', text: 'Уточка мягкая игрушка — это просто прелесть! Взяла дочке 2 лет, она от неё не отходит. Мягкая, безопасная, красивая. Буду брать ещё подобные' },
            { name: 'Руслан Х.', city: 'Мытищи', date: '11 янв 2026', rating: 5, src: 'site', text: 'Рамен Tonkotsu готовится за 3 минуты и вкусовее чем в некоторых кафе. Взял сразу 10 пачек. Следующий заказ уже в корзине — добавлю ещё снеки' },
            { name: 'Елена Ф.', city: 'Долгопрудный', date: '14 янв 2026', rating: 5, src: 'site', text: 'Маска-плёнка Bamboo реально очищает поры — это было видно невооружённым взглядом! Буду брать регулярно. Доставка быстрая, всё дошло целым' },
            { name: 'Борис Н.', city: 'Москва', date: '17 янв 2026', rating: 5, src: 'site', text: 'ATV 250cc для охоты — выбор был правильный. Консультант помог подобрать модель под мои задачи. Доставка в срок, всё проверено. Рекомендую!' },
            { name: 'Ксения Д.', city: 'Долгопрудный', date: '20 янв 2026', rating: 5, src: 'site', text: 'Сыворотка корейская работает лучше дорогих брендов из ТЦ. Беру уже третий раз. Цена доступная, качество отличное. Теперь только здесь закупаюсь' },
            { name: 'Захар С.', city: 'Химки', date: '23 янв 2026', rating: 5, src: 'site', text: 'Снеки взял на офис — коллеги были в восторге! Каждый нашёл что-то своё. Оформление заказа простое, доставка чёткая. Уже скидываемся на следующий' },
            { name: 'Лариса В.', city: 'Долгопрудный', date: '26 янв 2026', rating: 5, src: 'site', text: 'Набор ручек Kawaii — лучший подарок для школьницы! Дочка была в восторге, все подруги завидуют. Качество отличное, чернила яркие' },
            { name: 'Антонина К.', city: 'Лобня', date: '29 янв 2026', rating: 5, src: 'site', text: 'Впервые заказала онлайн — всё прошло гладко. Сайт удобный, оплата простая, доставка быстрая. Набор для дома Уют понравился, буду брать ещё' },
            { name: 'Вадим О.', city: 'Долгопрудный', date: '1 фев 2026', rating: 5, src: 'site', text: 'Питбайк заказал для загородного дома — доставили за 2 дня, аккуратно упаковали. Завёлся с первого раза. Менеджер всё объяснил по обкатке. Спасибо!' },
            { name: 'Жанна М.', city: 'Долгопрудный', date: '4 фев 2026', rating: 5, src: 'site', text: 'Мороженое японское и матча-напитки — просто объедение! Теперь хожу в магазин как на прогулку. Каждый раз открываю что-то новое для себя 🍦' },
            { name: 'Степан А.', city: 'Мытищи', date: '7 фев 2026', rating: 5, src: 'site', text: 'Заказал квадроцикл ATV110 сыну на ДР — это был лучший подарок в его жизни! Доставка чёткая, всё целое. Магазин честный, рекомендую без сомнений' },
            { name: 'Регина П.', city: 'Долгопрудный', date: '10 фев 2026', rating: 5, src: 'site', text: 'Взяла маски Jeju пачку из 10 штук — хватит на месяц. Кожа стала заметно мягче и увлажнённее. Цена за качество просто отличная. Буду брать постоянно' },
            { name: 'Геннадий Т.', city: 'Химки', date: '13 фев 2026', rating: 5, src: 'site', text: 'Подарил жене набор корейской косметики на 14 февраля — она была в восторге! Красивая упаковка, всё натуральное. Магазин спас меня с подарком 😄' },
            { name: 'Нина Ш.', city: 'Долгопрудный', date: '16 фев 2026', rating: 5, src: 'site', text: 'Набор для дома «Уют» стоит каждого рубля. Свеча, аксессуары — всё высокого качества. Подарила маме, она в восторге. Буду брать ещё на подарки' },
            { name: 'Константин Р.', city: 'Москва', date: '19 фев 2026', rating: 5, src: 'site', text: 'Большой выбор азиатских снеков которых больше нигде нет. Пробую что-то новое каждый заказ. Доставка быстрая, упаковка надёжная. Отличный магазин!' },
            { name: 'Дарья К.', city: 'Долгопрудный', date: '22 фев 2026', rating: 5, src: 'site', text: 'Bubble Tea домой — это лучшая находка! Муж тоже оценил. Теперь устраиваем чайную церемонию по выходным с разными вкусами. Ассортимент радует 🍵' },
            { name: 'Леонид В.', city: 'Лобня', date: '25 фев 2026', rating: 5, src: 'site', text: 'Заказал питбайк MX125 — отличный выбор для начинающего. Всё пришло в идеальном состоянии, документы в порядке. Менеджер помог оформить. Спасибо!' },
            { name: 'Инна О.', city: 'Долгопрудный', date: '28 фев 2026', rating: 5, src: 'site', text: 'Сыворотка Glow Essence — это магия в бутылочке! Подруга заметила что кожа стала лучше. Беру уже 4-й раз. Дешевле и лучше многих брендов из сетей' },
            { name: 'Филипп Н.', city: 'Мытищи', date: '3 мар 2026', rating: 5, src: 'site', text: 'Снеки Chimi Mix и рамен — офисные перекусы уже никогда не будут прежними! Коллеги попробовали и тоже заказали. Доставка чёткая, всё свежее' },
            { name: 'Оксана Л.', city: 'Долгопрудный', date: '6 мар 2026', rating: 5, src: 'site', text: 'Подарок на 8 марта — набор косметики от К-Beauty. Муж выбрал с нашей помощью на сайте, всё пришло красиво упакованным. Очень довольна! 💐' },
            { name: 'Евгений Д.', city: 'Химки', date: '9 мар 2026', rating: 5, src: 'site', text: 'ATV250cc — мощный зверь! Брал для охоты, доставили в срок. Качество сборки отличное, заводится легко. Менеджер проконсультировал по всем вопросам' },
            { name: 'Людмила Г.', city: 'Долгопрудный', date: '12 мар 2026', rating: 5, src: 'site', text: 'Игрушка Куро — нежнейший плюш, вышивка аккуратная. Внук не расстаётся. Доставка быстрая, цена разумная. Ещё куплю игрушек на день рождения' },
            { name: 'Богдан С.', city: 'Лобня', date: '15 мар 2026', rating: 5, src: 'site', text: 'Первый заказ онлайн — всё прошло идеально. Удобный сайт, быстрая оплата, доставка в тот же день. Взял снеки и чай — очень доволен. Буду постоянным!' },
            { name: 'Тамара Р.', city: 'Долгопрудный', date: '18 мар 2026', rating: 5, src: 'site', text: 'Ароматическая свеча HomeLife горит уже 3 недели — ровно, без копоти. Запах ванили и лаванды наполняет всю квартиру. Куплю ещё несколько штук' },
            { name: 'Григорий П.', city: 'Мытищи', date: '21 мар 2026', rating: 5, src: 'site', text: 'Газировка Yuzu и Bubble Tea — попробовал всё разом. Необычные вкусы, очень понравилось. Теперь беру регулярно. Доставка быстрая, всё свежее' },
            { name: 'Виктория М.', city: 'Долгопрудный', date: '24 мар 2026', rating: 5, src: 'site', text: 'Маска-плёнка Bamboo лучшее что пробовала для пор! Эффект виден сразу. Упаковки хватает надолго. Буду брать ещё и расскажу подругам' },
            { name: 'Ярослав Б.', city: 'Химки', date: '27 мар 2026', rating: 5, src: 'site', text: 'Питбайк MX150 Pro доставили за 1 день. Всё собрано, проверено, завёлся с полукикстартера. Качество на уровне, цена честная. Однозначно рекомендую!' },
            { name: 'Жасмин В.', city: 'Долгопрудный', date: '30 мар 2026', rating: 5, src: 'site', text: 'Набор ручек Kawaii и скетчбук A5 — идеальная пара для творчества! Бумага плотная, ручки пишут мягко. Очень рада покупке. Буду брать ещё канцелярию' },
            { name: 'Николай Е.', city: 'Лобня', date: '2 апр 2026', rating: 5, src: 'site', text: 'Взял квадроцикл ATV110 для дачи — отличная машинка! Сборка надёжная, доставили аккуратно. Менеджер помог выбрать между моделями. Спасибо!' },
            { name: 'Алёна П.', city: 'Долгопрудный', date: '5 апр 2026', rating: 5, src: 'site', text: 'Снеки на вечеринку — всегда берём здесь! Гости всегда в восторге от необычных вкусов. Каждый раз заказываем что-то новое. Отличный ассортимент 🎉' },
            { name: 'Леся Н.', city: 'Москва', date: '8 апр 2026', rating: 5, src: 'site', text: 'Нашла этот магазин случайно — теперь постоянный покупатель. Сыворотка и маски корейские просто шикарные. Доставка быстрая, упаковка бережная' },
            { name: 'Иван К.', city: 'Долгопрудный', date: '11 апр 2026', rating: 5, src: 'site', text: 'Заказал рамен ассорти — каждый вкус попробовал. Tonkotsu лучший! Буду брать ящиками. Доставка в тот же день — невероятно быстро для интернет-магазина' },
            { name: 'Наргиза Х.', city: 'Химки', date: '14 апр 2026', rating: 5, src: 'site', text: 'Набор для дома «Уют» — лучший подарок для мамы. Всё натуральное, упаковка красивая. Мама была тронута. Буду брать подарки здесь на все праздники' },
            { name: 'Сёма Б.', city: 'Долгопрудный', date: '17 апр 2026', rating: 5, src: 'site', text: 'Взял питбайк для сына 14 лет — идеально подошёл. Не слишком мощный, управляемый. Сын доволен, уже освоился. Доставка и сервис на высоте!' },
            { name: 'Зинаида О.', city: 'Долгопрудный', date: '20 апр 2026', rating: 5, src: 'site', text: 'Первый раз зашла в магазин — сразу стало понятно что приду ещё. Уютная атмосфера, приятный запах, много всего интересного. Купила косметику и снеки' },
            { name: 'Платон Д.', city: 'Мытищи', date: '23 апр 2026', rating: 5, src: 'site', text: 'Заказал подарочный набор снеков другу — он был в шоке в хорошем смысле! Такого в обычных магазинах нет. Доставка быстрая, упаковка аккуратная' },
            { name: 'Эля С.', city: 'Долгопрудный', date: '26 апр 2026', rating: 5, src: 'site', text: 'Мягкая Уточка — это любовь с первого взгляда! Такая милая и мягкая. Взяла себе и подруге. Буду брать ещё игрушки — выбор хороший' },
            { name: 'Тарас Л.', city: 'Химки', date: '29 апр 2026', rating: 5, src: 'site', text: 'ATV250cc — серьёзная техника по адекватной цене. Доставка быстрая, всё пришло в сборе. Завёлся сразу. Буду рекомендовать знакомым охотникам 🏕️' },
            { name: 'Ульяна В.', city: 'Долгопрудный', date: '2 май 2026', rating: 5, src: 'site', text: 'Сыворотка и маски — беру каждый месяц. Кожа стала просто другой за полгода. Цены не поднимают, доставка стабильно быстрая. Любимый магазин!' },
            { name: 'Рустам Ж.', city: 'Лобня', date: '5 май 2026', rating: 5, src: 'site', text: 'Bubble Tea Matcha и Yuzu газировка — открытие года! Теперь всегда беру к пятничному вечеру. Доставляют быстро, всё свежее. Топ-магазин 👍' },
            { name: 'Элина Б.', city: 'Долгопрудный', date: '8 май 2026', rating: 5, src: 'site', text: 'Пришла за снеками — ушла с косметикой и игрушкой. Магазин-ловушка в хорошем смысле! Везде глаза разбегаются. Обязательно вернусь ещё 😄' },
            { name: 'Антон Р.', city: 'Мытищи', date: '11 май 2026', rating: 5, src: 'site', text: 'Питбайк MX125 для начинающего — самое то. Не страшно, управляется легко. Сын быстро освоился. Доставка в день заказа — это вообще огонь!' },
            { name: 'Вера П.', city: 'Долгопрудный', date: '14 май 2026', rating: 5, src: 'site', text: 'Маска Bamboo почистила поры лучше чем дорогущие процедуры в салоне. Взяла 5 штук сразу. Теперь делаю маску раз в неделю дома. Экономия и результат!' },
            { name: 'Клим Д.', city: 'Химки', date: '17 май 2026', rating: 5, src: 'site', text: 'Снеки Chimi Mix взял ради интереса — теперь это мой обязательный перекус. Вкусно, необычно, сытно. Беру по 3 пачки каждый заказ. Лучшие снеки!' },
            { name: 'Соня Ф.', city: 'Долгопрудный', date: '20 май 2026', rating: 5, src: 'site', text: 'Набор ручек Kawaii — ярче и мягче чем ожидала. Пишут отлично, цвета насыщенные. Взяла дочке в школу — все одноклассники завидуют 🎨' },
            { name: 'Борис В.', city: 'Лобня', date: '23 май 2026', rating: 5, src: 'site', text: 'Квадроцикл ATV250 — это мощь! Взял для дачного хозяйства, справляется с любой задачей. Доставка и сервис на уровне. Буду рекомендовать!' },
            { name: 'Нина Д.', city: 'Долгопрудный', date: '26 май 2026', rating: 5, src: 'site', text: 'Набор «Уют» подарила свекрови — она была в слезах от радости! Говорит таких подарков ей ещё не дарили. Буду брать здесь все подарки отныне 🎁' },
            { name: 'Юрий С.', city: 'Мытищи', date: '29 май 2026', rating: 5, src: 'site', text: 'Заказал ящик рамена разных видов — устроил дегустацию с друзьями. Tonkotsu победил! Доставка быстрая, всё свежее и хорошо упакованное. 10/10' },
            { name: 'Людмила П.', city: 'Долгопрудный', date: '1 июн 2026', rating: 5, src: 'site', text: 'Первый раз заказала онлайн — очень понравился процесс. Сайт простой, оплата быстрая, доставка в тот же день. Сыворотка и маски уже использую' },
            { name: 'Глеб Н.', city: 'Химки', date: '4 июн 2026', rating: 5, src: 'site', text: 'Питбайк MX150 Pro — профессиональная техника! Участвовал в первых соревнованиях — машина не подвела. Спасибо за качественный товар и быструю доставку' },
            { name: 'Майя В.', city: 'Долгопрудный', date: '7 июн 2026', rating: 5, src: 'site', text: 'Взяла Bubble Tea для вечеринки девичника — все были в восторге! Необычно, вкусно, красиво смотрится. Теперь это наша традиция на встречах 🧋' },
            { name: 'Иван С.', city: 'Долгопрудный', date: '10 июн 2026', rating: 5, src: 'site', text: 'Заказал снеки и напитки на офисный праздник — коллеги оценили! Необычные вкусы, всем понравилось. Доставка точно в срок. Обязательно повторим!' },
            { name: 'Полина Д.', city: 'Лобня', date: '13 июн 2026', rating: 5, src: 'site', text: 'Косметика К-Beauty действительно работает! За месяц кожа заметно улучшилась. Цены честные, качество хорошее. Теперь только корейская косметика' },
            { name: 'Степан К.', city: 'Мытищи', date: '16 июн 2026', rating: 5, src: 'site', text: 'ATV110 для сына — правильный выбор для старта. Не слишком быстрый, безопасный. Ограничитель скорости — огонь. Доставка в 2 дня, всё исправно' },
            { name: 'Карина Л.', city: 'Долгопрудный', date: '19 июн 2026', rating: 5, src: 'site', text: 'Игрушка Куро стала любимцем всей семьи! Сначала брала дочке, теперь обнимаю сама. Качество отличное, мягкий плюш. Куплю ещё разных персонажей' },
            { name: 'Денис П.', city: 'Химки', date: '22 июн 2026', rating: 5, src: 'site', text: 'Рамен, снеки, газировка — всё что нужно для уютного вечера. Заказываю каждые 2 недели. Доставка стабильно быстрая. Магазин уже в закладках 🏠' },
          ];
          const visible = reviewsExpanded ? ALL_REVIEWS : ALL_REVIEWS.slice(0, 6);
          return (
            <div className="mb-10">
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visible.map(r => (
                  <div key={r.name + r.date} className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover-scale">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {Array.from({length:5}).map((_,i)=><Icon key={i} name="Star" size={13} className={i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}/>)}
                      </div>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed flex-1">«{r.text}»</p>
                    <div className="pt-3 border-t border-border flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${r.src === 'yandex' ? 'bg-[#FC3F1D]/10 text-[#FC3F1D]' : 'gradient-brand text-white'}`}>
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.city}</p>
                      </div>
                      {r.src === 'yandex' ? (
                        <div className="ml-auto flex items-center gap-1 text-xs text-[#FC3F1D] bg-[#FC3F1D]/10 px-2 py-0.5 rounded-full font-medium">
                          <Icon name="MapPin" size={10}/> Яндекс Карты
                        </div>
                      ) : (
                        <div className="ml-auto flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          <Icon name="BadgeCheck" size={10}/> Сайт
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {!reviewsExpanded && (
                <div className="text-center mt-8">
                  <Button onClick={() => setReviewsExpanded(true)} variant="outline" className="rounded-full px-8 h-12 gap-2 border-border hover:border-primary hover:text-primary transition-colors">
                    <Icon name="ChevronDown" size={16} />
                    Показать все отзывы ({ALL_REVIEWS.length})
                  </Button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Форма отзыва */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 mb-10">
          <h3 className="font-display font-bold text-xl mb-5 flex items-center gap-2">
            <Icon name="PenLine" size={20} className="text-primary" />
            Оставить отзыв
          </h3>
          {reviewSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle2" size={32} className="text-emerald-600" />
              </div>
              <p className="font-bold text-lg mb-1">Спасибо за отзыв!</p>
              <p className="text-muted-foreground text-sm">Он появится на сайте после проверки модератором.</p>
              <button onClick={() => setReviewSent(false)} className="mt-4 text-sm text-primary hover:underline">Написать ещё один</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Input placeholder="Ваше имя *" value={reviewForm.author_name} onChange={e => setReviewForm(f => ({...f, author_name: e.target.value}))} className="h-12 rounded-xl" />
                <Input placeholder="Город" value={reviewForm.city} onChange={e => setReviewForm(f => ({...f, city: e.target.value}))} className="h-12 rounded-xl" />
                <Input placeholder="Товар (необязательно)" value={reviewForm.product} onChange={e => setReviewForm(f => ({...f, product: e.target.value}))} className="h-12 rounded-xl" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Оценка *</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setReviewForm(f => ({...f, rating: s}))} className="p-1">
                        <Icon name="Star" size={28} className={s <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <textarea
                  placeholder="Ваш отзыв * (минимум 10 символов)"
                  value={reviewForm.text}
                  onChange={e => setReviewForm(f => ({...f, text: e.target.value}))}
                  rows={6}
                  className="w-full flex-1 rounded-xl border border-input bg-background px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {reviewError && <p className="text-sm text-red-500">{reviewError}</p>}
                <Button onClick={handleSubmitReview} disabled={reviewSending} className="gradient-brand text-white rounded-full h-12 font-medium hover:opacity-90 gap-2">
                  <Icon name="Send" size={16} />
                  {reviewSending ? 'Отправляем...' : 'Отправить отзыв'}
                </Button>
                <p className="text-xs text-muted-foreground">Отзыв появится после проверки модератором</p>
              </div>
            </div>
          )}
        </div>

        {/* Список отзывов из БД */}
        {dbReviews.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {dbReviews.map(r => (
              <div key={r.id} className="bg-card rounded-3xl border border-border p-6 flex flex-col gap-4 hover-scale">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} name="Star" size={14} className={i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{r.created_at}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1">«{r.text}»</p>
                <div className="pt-3 border-t border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {r.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{r.author_name}</p>
                    <p className="text-xs text-muted-foreground">{[r.city, r.product].filter(Boolean).join(' · ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-3xl">
            <Icon name="MessageSquare" size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Пока нет отзывов</p>
            <p className="text-sm mt-1">Будьте первым — оставьте отзыв выше!</p>
          </div>
        )}
      </section>

      <section id="about" className="container py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <Badge className="gradient-brand text-white border-0 mb-5 rounded-full px-4 py-1.5">О компании</Badge>
          <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl tracking-tight mb-6">Магазин, которому доверяют</h2>
          <p className="text-lg text-muted-foreground mb-4">
            Се-Се 谢谢 — это больше чем магазин. Мы рядом, когда нужно порадовать себя или близких: от уютных мелочей для дома до мощной техники для настоящих приключений.
          </p>
          <p className="text-muted-foreground mb-6">
            Каждый товар мы выбираем с душой. С нами уже более 50 000 довольных покупателей по всей стране.
          </p>
          <div className="space-y-3 mb-8">
            {[
              'Только оригинальная сертифицированная продукция',
              'Оптовые цены от 5 единиц товара',
              'Персональный менеджер для оптовых клиентов',
              'Доставка по всей России от 1 дня',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                  <Icon name="Check" size={12} className="text-white" />
                </div>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[['50K+', 'Клиентов', 'Users'], ['4.9★', 'Рейтинг', 'Star'], ['24/7', 'Поддержка', 'Headphones']].map(([n, l, icon]) => (
              <div key={l} className="bg-card border border-border rounded-2xl p-4 text-center">
                <div className="font-display font-black text-2xl gradient-text">{n}</div>
                <div className="text-xs text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 gradient-brand blur-3xl opacity-20 rounded-full" />
          <img src={allProducts[0]?.image} alt="О нас" className="relative rounded-3xl w-full shadow-xl" />
          <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-2xl px-5 py-4 shadow-lg hidden md:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center">
                <Icon name="Award" size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">Лучший магазин 2025</p>
                <p className="text-xs text-muted-foreground">По версии покупателей</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contacts" className="bg-muted/40 py-20">
        <div className="container grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-8">Контакты</h2>
            <div className="space-y-5">
              {[
                { icon: 'Phone', label: socials.contact_phone },
                { icon: 'Mail', label: socials.contact_email },
                { icon: 'MapPin', label: socials.contact_address },
                { icon: 'Clock', label: socials.contact_hours },
              ].filter(c => c.label).map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center flex-shrink-0">
                    <Icon name={c.icon} size={20} className="text-primary" />
                  </div>
                  <span className="font-medium">{c.label}</span>
                </div>
              ))}
              <a href={socials.contact_max ? `https://web.max.ru/${socials.contact_max}` : 'https://web.max.ru/89161433232'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-border flex items-center justify-center group-hover:opacity-80 transition-opacity flex-shrink-0">
                  <img src="https://www.google.com/s2/favicons?domain=max.ru&sz=64" alt="MAX" className="w-8 h-8 object-contain" />
                </div>
                <span className="font-medium group-hover:text-primary transition-colors">Написать в MAX</span>
              </a>
              {socials.contact_whatsapp && (
                <a href={`https://wa.me/${socials.contact_whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center group-hover:opacity-80 transition-opacity flex-shrink-0">
                    <Icon name="Phone" size={20} className="text-green-600" />
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">WhatsApp</span>
                </a>
              )}
            </div>
          </div>
          <div className="bg-card rounded-3xl p-8 border border-border">
            <h3 className="font-display font-bold text-2xl mb-5">Напишите нам</h3>
            <div className="space-y-4">
              <Input placeholder="Ваше имя" className="h-12 rounded-xl" />
              <Input placeholder="Телефон или email" className="h-12 rounded-xl" />
              <textarea placeholder="Сообщение" rows={4} className="w-full rounded-xl border border-input bg-background p-3 text-sm resize-none" />
              <Button className="w-full gradient-brand text-white rounded-full h-12 text-base hover:opacity-90">Отправить</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Блок гарантий и доверия */}
      <section className="gradient-mesh py-20">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight">Покупайте с уверенностью</h2>
            <p className="text-muted-foreground mt-3 text-lg">Ваши права защищены на каждом этапе</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: 'RotateCcw', title: 'Возврат 14 дней', text: 'Если товар не подошёл — вернём деньги без лишних вопросов', color: 'text-blue-600 bg-blue-50' },
              { icon: 'ShieldCheck', title: 'Официальная гарантия', text: '2 года гарантии на технику. Сервисный центр в Москве', color: 'text-emerald-600 bg-emerald-50' },
              { icon: 'Lock', title: 'Защита платежей', text: 'Все транзакции защищены банковским шифрованием', color: 'text-purple-600 bg-purple-50' },
              { icon: 'PackageCheck', title: 'Оригинальный товар', text: 'Только сертифицированная продукция от официальных поставщиков', color: 'text-amber-600 bg-amber-50' },
            ].map((g) => (
              <div key={g.title} className="bg-card rounded-3xl border border-border p-6 text-center hover-scale">
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${g.color}`}>
                  <Icon name={g.icon} size={26} />
                </div>
                <h3 className="font-display font-bold text-base mb-2">{g.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{g.text}</p>
              </div>
            ))}
          </div>
          {/* CTA баннер */}
          <div className="mt-10 gradient-brand rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h3 className="font-display font-black text-xl sm:text-3xl md:text-4xl mb-2">Готовы сделать заказ?</h3>
              <p className="text-white/80 text-sm sm:text-lg">Более 50 000 клиентов уже выбрали нас. Присоединяйтесь!</p>
            </div>
            <Button onClick={() => scrollTo('catalog')} className="bg-white text-primary font-bold rounded-full px-10 h-14 text-base hover:bg-white/90 flex-shrink-0 shadow-lg">
              Перейти в каталог <Icon name="ArrowRight" size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display font-black text-xl gradient-text">Се-Се 谢谢</span>
          <p className="text-sm text-muted-foreground">© 2026 Се-Се 谢谢. Все права защищены.</p>
          <div className="flex gap-3">
            {socials.social_instagram && (
              <a href={socials.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:gradient-brand hover:text-white transition-all">
                <Icon name="Instagram" size={18} />
              </a>
            )}
            {socials.social_youtube && (
              <a href={socials.social_youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:gradient-brand hover:text-white transition-all">
                <Icon name="Youtube" size={18} />
              </a>
            )}
            {socials.social_telegram && (
              <a href={socials.social_telegram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:gradient-brand hover:text-white transition-all">
                <Icon name="Send" size={18} />
              </a>
            )}
            {socials.social_max && (
              <a href={socials.social_max} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center hover:opacity-80 transition-all overflow-hidden">
                <img src="https://www.google.com/s2/favicons?domain=max.ru&sz=64" alt="MAX" className="w-6 h-6 object-contain" />
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* Модалка товара */}
      {modalProduct && (() => {
        const p = modalProduct;
        const dbDescription = p.description?.trim() || null;
        const inCart = cart.find(i => i.id === p.id);
        const wholesaleQty = (p.wholesale_min_qty && p.wholesale_min_qty > 0) ? p.wholesale_min_qty : (p.category === 'Тяжёлая техника' ? WHOLESALE_QTY_HEAVY : WHOLESALE_QTY_DEFAULT);
        const discountPct = Math.round((1 - p.wholesale / p.price) * 100);
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={() => setModalProduct(null)}>
            <div className="bg-background rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Фото */}
              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-t-3xl sm:rounded-t-3xl" />
                {p.badge && <Badge className="absolute top-4 left-4 gradient-brand text-white border-0 rounded-full">{p.badge}</Badge>}
                <button onClick={() => setModalProduct(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors">
                  <Icon name="X" size={18} />
                </button>
              </div>
              {/* Контент */}
              <div className="p-6 space-y-5">
                {/* Заголовок */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{p.category}</span>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{p.brand}</span>
                    {inCart && <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">В корзине: {inCart.qty} шт.</span>}
                  </div>
                  <h2 className="font-display font-black text-2xl leading-tight">{p.name}</h2>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} name="Star" size={15} className={i < Math.round(p.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'} />
                    ))}
                    <span className="text-sm font-bold ml-1">{p.rating}</span>
                    <span className="text-sm text-muted-foreground ml-1">· Проверенный товар</span>
                  </div>
                </div>

                {/* Цена */}
                <div className="bg-muted/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="font-display font-black text-3xl">{fmt(p.price)}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">Опт от {wholesaleQty} шт.:</span>
                      <span className="text-base font-bold text-emerald-600">{fmt(p.wholesale)}</span>
                      <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">−{discountPct}%</span>
                    </div>
                  </div>
                  <Button onClick={() => { addToCart(p.id); }} className="gradient-brand text-white rounded-full px-8 h-12 text-base font-medium hover:opacity-90 gap-2 flex-shrink-0">
                    <Icon name="ShoppingCart" size={18} />
                    В корзину
                  </Button>
                </div>

                {/* Описание */}
                {dbDescription && (
                  <div>
                    <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2">
                      <Icon name="Info" size={16} className="text-primary" /> Описание
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{dbDescription}</p>
                  </div>
                )}

                {/* Преимущества */}
                {(() => {
                  const featureList = (p.features || '').split('\n').filter(f => f.trim());
                  if (featureList.length === 0) return null;
                  return (
                    <div>
                      <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
                        <Icon name="CheckCircle2" size={16} className="text-primary" /> Преимущества
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {featureList.map(f => (
                          <div key={f} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                            <div className="w-4 h-4 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                              <Icon name="Check" size={10} className="text-white" />
                            </div>
                            <span className="text-xs font-medium">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Состав */}
                {p.composition?.trim() && (
                  <div>
                    <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2">
                      <Icon name="FlaskConical" size={16} className="text-primary" /> Состав
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-muted rounded-xl p-3">{p.composition.trim()}</p>
                  </div>
                )}

                {/* Применение */}
                {p.usage_instructions?.trim() && (
                  <div>
                    <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2">
                      <Icon name="BookOpen" size={16} className="text-primary" /> Способ применения
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-muted rounded-xl p-3">{p.usage_instructions.trim()}</p>
                  </div>
                )}

                {/* Гарантия */}
                <div className="flex items-center gap-3 border border-border rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Icon name="ShieldCheck" size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Гарантия качества</p>
                    <p className="text-xs text-muted-foreground">Возврат в течение 14 дней. Официальная гарантия на технику 2 года.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Модалка авторизации */}
      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setAuthOpen(false)}>
          <div className="bg-card border border-border rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
            {/* Левая панель — витрина магазина */}
            <div className="gradient-brand p-8 md:w-5/12 flex flex-col justify-between text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <div className="relative">
                <div className="text-2xl font-black mb-1">Ce-Ce 谢谢</div>
                <div className="text-white/70 text-sm">Магазин товаров из Китая</div>
              </div>
              <div className="relative space-y-4 my-6">
                {[
                  { icon: 'ShoppingBag', text: 'Тысячи товаров для жизни, дома и отдыха' },
                  { icon: 'Truck', text: 'Доставка по всей России' },
                  { icon: 'Tag', text: 'Оптовые цены от производителя' },
                  { icon: 'Star', text: 'Личный кабинет и история заказов' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name={icon} size={15} className="text-white" />
                    </div>
                    <span className="text-sm text-white/90 leading-snug">{text}</span>
                  </div>
                ))}
              </div>
              <div className="relative text-xs text-white/50">Войдите, чтобы делать заказы и отслеживать доставку</div>
            </div>
            {/* Правая панель — форма */}
            <div className="p-8 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-black text-2xl">{authMode === 'login' ? 'Вход' : 'Регистрация'}</h2>
                <button onClick={() => setAuthOpen(false)} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
              </div>
              <div className="space-y-3">
                {authMode === 'register' && (
                  <>
                    <Input placeholder="Ваше имя" value={authName} onChange={(e) => setAuthName(e.target.value)} className="h-12 rounded-xl" />
                    <Input placeholder="Номер телефона" type="tel" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} className="h-12 rounded-xl" />
                  </>
                )}
                <Input placeholder="Email" type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="h-12 rounded-xl" />
                <Input placeholder="Пароль" type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="h-12 rounded-xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()} />
                {authError && <p className="text-sm text-red-500">{authError}</p>}
                <Button className="w-full gradient-brand text-white rounded-full h-12 text-base hover:opacity-90" onClick={handleAuth} disabled={loading}>
                  {loading ? 'Загрузка...' : authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                {authMode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
                <button className="text-primary font-medium hover:underline" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}>
                  {authMode === 'login' ? 'Зарегистрироваться' : 'Войти'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Личный кабинет */}
      {cabinetOpen && user && (() => {
        if (myOrders.length === 0 && !myOrdersLoading && token) {
          setMyOrdersLoading(true);
          fetch(ORDERS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ action: 'my_orders' }) })
            .then(r => r.json()).then(res => { if (res.orders) setMyOrders(res.orders); setMyOrdersLoading(false); });
        }
        return null;
      })()}
      {cabinetOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setCabinetOpen(false)}>
          <div className="bg-card border border-border rounded-3xl w-full max-w-md mx-4 shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Шапка */}
            <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
              <h2 className="font-display font-black text-2xl">Личный кабинет</h2>
              <button onClick={() => setCabinetOpen(false)} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-5">
              {/* Профиль */}
              <div>
                <p className="text-muted-foreground text-sm mb-1">Добро пожаловать,</p>
                <p className="font-display font-bold text-xl">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">С нами с {user.member_since}</p>
              </div>

              {/* Скидочная карта */}
              {user.card && (() => {
                const cardInfo: Record<string, { label: string; next?: string; nextMin?: number }> = {
                  silver:  { label: 'Серебряная', next: 'Золотая', nextMin: 50000 },
                  gold:    { label: 'Золотая', next: 'Бриллиантовая', nextMin: 100000 },
                  diamond: { label: 'Бриллиантовая' },
                };
                const style = cardInfo[user.card.card_type] || cardInfo.silver;
                const toNext = style.nextMin ? style.nextMin - user.card.total_purchases : 0;
                return (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl p-5 overflow-hidden" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)' }}>
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                      <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-white/80 text-xs font-medium tracking-widest uppercase">{style.label}</span>
                          <span className="font-display font-black text-white text-2xl">{user.card.discount_percent}%</span>
                        </div>
                        <p className="text-white font-mono text-base tracking-widest mb-3">{user.card.number.replace(/(.{4})/g, '$1 ').trim()}</p>
                        <div className="flex justify-between items-end">
                          <div><p className="text-white/60 text-xs">Владелец</p><p className="text-white font-semibold text-sm">{user.name}</p></div>
                          <div className="text-right"><p className="text-white/60 text-xs">Скидка на покупки</p><p className="text-white font-bold">{user.card.discount_percent}%</p></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/60 rounded-xl p-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Сумма покупок</span>
                        <span className="font-semibold">{fmt(user.card.total_purchases)}</span>
                      </div>
                      {style.next && toNext > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">До {style.next}</span>
                          <span className="font-semibold text-primary">{fmt(toNext)}</span>
                        </div>
                      )}
                      {!style.next && (
                        <p className="text-xs text-center text-primary font-medium">Максимальный уровень!</p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      {[
                        { type: 'silver', label: 'Серебро', sub: 'до 50 000₽', disc: '5%' },
                        { type: 'gold', label: 'Золото', sub: 'до 100 000₽', disc: '10%' },
                        { type: 'diamond', label: 'Бриллиант', sub: 'от 100 000₽', disc: '12%' },
                      ].map(l => (
                        <div key={l.type} className={`rounded-xl p-2 border text-xs ${user.card!.card_type === l.type ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'}`}>
                          <p className="font-bold">{l.label}</p>
                          <p className="text-muted-foreground">{l.sub}</p>
                          <p className={`font-black ${user.card!.card_type === l.type ? 'text-primary' : 'text-muted-foreground'}`}>{l.disc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* История заказов */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-base">История заказов</p>
                  <button onClick={async () => {
                    if (!token) return;
                    setMyOrdersLoading(true);
                    const res = await fetch(ORDERS_URL, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ action: 'my_orders' }),
                    }).then(r => r.json());
                    if (res.orders) setMyOrders(res.orders);
                    setMyOrdersLoading(false);
                  }} className="text-xs text-primary flex items-center gap-1 hover:opacity-70">
                    <Icon name="RefreshCw" size={12} className={myOrdersLoading ? 'animate-spin' : ''} /> Обновить
                  </button>
                </div>

                {myOrders.length === 0 && !myOrdersLoading && (
                  <button onClick={async () => {
                    if (!token) return;
                    setMyOrdersLoading(true);
                    const res = await fetch(ORDERS_URL, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ action: 'my_orders' }),
                    }).then(r => r.json());
                    if (res.orders) setMyOrders(res.orders);
                    setMyOrdersLoading(false);
                  }} className="w-full text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-2xl hover:border-primary/40 transition-colors">
                    {myOrdersLoading ? 'Загружаю...' : 'Нажмите, чтобы загрузить заказы'}
                  </button>
                )}

                {myOrdersLoading && myOrders.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground text-sm">Загружаю...</div>
                )}

                <div className="space-y-3">
                  {myOrders.map(o => {
                    const statusMap: Record<string, { label: string; color: string }> = {
                      new: { label: 'Новый', color: 'bg-blue-100 text-blue-700' },
                      confirmed: { label: 'Подтверждён', color: 'bg-emerald-100 text-emerald-700' },
                      shipped: { label: 'Отправлен', color: 'bg-orange-100 text-orange-700' },
                      delivered: { label: 'Доставлен', color: 'bg-green-100 text-green-700' },
                      cancelled: { label: 'Отменён', color: 'bg-red-100 text-red-600' },
                    };
                    const st = statusMap[o.status] || { label: o.status, color: 'bg-muted text-muted-foreground' };
                    const isExpanded = expandedMyOrder === o.id;
                    return (
                      <div key={o.id} className="border border-border rounded-2xl overflow-hidden">
                        <button className="w-full p-4 text-left" onClick={() => setExpandedMyOrder(isExpanded ? null : o.id)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm">#{o.id}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                              {o.payment_status === 'paid' && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">✓ Оплачен</span>}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="font-bold text-sm">{fmt(o.total)}</span>
                              <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{o.created_at} · {o.city}</p>
                          {!isExpanded && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{o.items.map(i => i.name).join(', ')}</p>
                          )}
                        </button>
                        {isExpanded && (
                          <div className="border-t border-border px-4 pb-4 pt-3 space-y-1">
                            {o.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex-1 mr-2">{item.name} × {item.qty}</span>
                                <span className="font-medium flex-shrink-0">{fmt(item.price * item.qty)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm font-bold pt-2 border-t border-border mt-2">
                              <span>Итого</span>
                              <span>{fmt(o.total)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button variant="outline" className="w-full rounded-full h-11" onClick={() => { logout(); setCabinetOpen(false); setMyOrders([]); }}>
                <Icon name="LogOut" size={16} className="mr-2" /> Выйти
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}