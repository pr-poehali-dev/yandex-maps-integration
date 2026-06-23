import { useState, useMemo, useEffect } from 'react';
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
};

const IMG = {
  headphones: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/c196a767-77cc-4bcf-964a-d920c38734c4.jpg',
  watch: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/f41c5f8f-a9e7-41bb-99d2-01813b511c25.jpg',
  sneakers: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/653aa19f-5c27-4b40-8789-ca4f51a326c9.jpg',
  home: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/6797d70d-3499-4e5f-83d8-ec18a1d90669.jpg',
  snacks: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/3477e609-5df9-465a-bd9a-f809917117cf.jpg',
  drinks: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/6600e17a-0053-4943-8a5e-5ad0885d4457.jpg',
  stationery: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/8b6e7544-54d7-450d-8d5e-bac7533ffe7b.jpg',
  toys: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/0cccad38-cfed-4df1-a6d1-b3a257fe1031.jpg',
  cosmetics: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/f196c31f-7def-43c7-a4bc-a4b4eb012afc.jpg',
  atv: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/d74e3cbd-9798-44c8-adb0-2ef46a94d6b7.jpg',
  pitbike: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/4d30d897-0c9b-49b4-bc2a-04a13bdcfd29.jpg',
};

const PRODUCTS: Product[] = [
  { id: 7, name: 'Набор для дома «Уют»', category: 'Товары для дома', price: 2490, wholesale: 1890, brand: 'HomeLife', rating: 4.8, image: IMG.home, badge: 'Новинка' },
  { id: 8, name: 'Ароматическая свеча', category: 'Товары для дома', price: 890, wholesale: 670, brand: 'HomeLife', rating: 4.7, image: IMG.home },
  { id: 9, name: 'Снеки Chimi Mix', category: 'Снеки', price: 390, wholesale: 290, brand: 'Chimi', rating: 4.9, image: IMG.snacks, badge: 'Хит' },
  { id: 10, name: 'Рамен Tonkotsu', category: 'Снеки', price: 290, wholesale: 210, brand: 'Chimi', rating: 4.8, image: IMG.snacks },
  { id: 11, name: 'Bubble Tea Matcha', category: 'Напитки', price: 350, wholesale: 260, brand: 'Boba', rating: 4.9, image: IMG.drinks, badge: 'Хит' },
  { id: 12, name: 'Газировка Yuzu', category: 'Напитки', price: 220, wholesale: 160, brand: 'Boba', rating: 4.7, image: IMG.drinks },
  { id: 13, name: 'Набор ручек Kawaii', category: 'Канцелярия', price: 590, wholesale: 440, brand: 'Kansai', rating: 4.8, image: IMG.stationery, badge: 'Новинка' },
  { id: 14, name: 'Скетчбук A5', category: 'Канцелярия', price: 490, wholesale: 360, brand: 'Kansai', rating: 4.6, image: IMG.stationery },
  { id: 15, name: 'Плюшевый Куро', category: 'Игрушки', price: 1290, wholesale: 970, brand: 'ToyBox', rating: 4.9, image: IMG.toys, badge: 'Хит' },
  { id: 16, name: 'Мягкая игрушка Уточка', category: 'Игрушки', price: 890, wholesale: 670, brand: 'ToyBox', rating: 4.8, image: IMG.toys },
  { id: 17, name: 'Сыворотка Glow Essence', category: 'Косметика', price: 1990, wholesale: 1490, brand: 'K-Beauty', rating: 4.9, image: IMG.cosmetics, badge: 'Хит' },
  { id: 18, name: 'Маска для лица Jeju', category: 'Косметика', price: 390, wholesale: 290, brand: 'K-Beauty', rating: 4.8, image: IMG.cosmetics },
  { id: 19, name: 'Маска-плёнка Bamboo', category: 'Косметика', price: 490, wholesale: 360, brand: 'K-Beauty', rating: 4.7, image: IMG.cosmetics },
  { id: 20, name: 'Квадроцикл ATV 250cc', category: 'Тяжёлая техника', price: 189990, wholesale: 149990, brand: 'MotoForce', rating: 4.9, image: IMG.atv, badge: 'Новинка' },
  { id: 21, name: 'Квадроцикл ATV 110cc', category: 'Тяжёлая техника', price: 99990, wholesale: 79990, brand: 'MotoForce', rating: 4.7, image: IMG.atv },
  { id: 22, name: 'Питбайк MX 125', category: 'Тяжёлая техника', price: 79990, wholesale: 62990, brand: 'MotoForce', rating: 4.8, image: IMG.pitbike, badge: 'Хит' },
  { id: 23, name: 'Питбайк MX 150 Pro', category: 'Тяжёлая техника', price: 119990, wholesale: 94990, brand: 'MotoForce', rating: 4.9, image: IMG.pitbike },
];

const CATEGORIES = ['Все', 'Товары для дома', 'Снеки', 'Напитки', 'Канцелярия', 'Игрушки', 'Косметика', 'Тяжёлая техника'];
const STATIC_BRANDS = ['HomeLife', 'Chimi', 'Boba', 'Kansai', 'ToyBox', 'K-Beauty', 'MotoForce'];

const NAV = [
  { id: 'home', label: 'Главная' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'delivery', label: 'Оплата и доставка' },
  { id: 'about', label: 'О нас' },
  { id: 'contacts', label: 'Контакты' },
];

const PRODUCTS_URL = 'https://functions.poehali.dev/7eb75e0a-030c-4601-9b1f-145e1e775c6a';
const ORDERS_URL = 'https://functions.poehali.dev/b3cf2e84-45d2-47ff-96ce-48cfa7aa5fbd';
const fmt = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

export default function Index() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [brands, setBrands] = useState<string[]>([]);
  const [cart, setCart] = useState<{ id: number; qty: number }[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment'>('cart');
  const [address, setAddress] = useState({ city: '', street: '', apartment: '', entrance: '', floor: '', zip: '', name: '', phone: '', comment: '' });
  const [deliveryService, setDeliveryService] = useState<'yandex' | 'courier' | 'post'>('yandex');
  const [orderDone, setOrderDone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'sbp' | 'cash'>('sbp');
  const SBP_URL = 'https://b2b.cbrpay.ru/BS1C0060E74II4FJ8I9OS3LCKOFL877K';
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
  const [socials, setSocials] = useState({ social_instagram: '', social_youtube: '', social_telegram: 'https://t.me/Chineshop1688', social_max: 'https://web.max.ru/' });

  useEffect(() => {
    fetch(PRODUCTS_URL)
      .then(r => r.json())
      .then(data => {
        if (data.products?.length) setDbProducts(data.products);
        if (data.settings) setSocials(s => ({ ...s, ...data.settings }));
      });
  }, []);

  const allProducts = dbProducts.length > 0 ? dbProducts : PRODUCTS;
  const allBrands = useMemo(() => {
    const fromProducts = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
    return fromProducts.length > 0 ? fromProducts : STATIC_BRANDS;
  }, [allProducts]);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx((i) => (i + 1) % allProducts.length), 3000);
    return () => clearInterval(timer);
  }, [allProducts.length]);

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

  const addToCart = (id: number) => setCart((c) => {
    const ex = c.find((i) => i.id === id);
    return ex ? c.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i) : [...c, { id, qty: 1 }];
  });
  const changeQty = (id: number, d: number) => setCart((c) =>
    c.map((i) => i.id === id ? { ...i, qty: i.qty + d } : i).filter((i) => i.qty > 0));

  const WHOLESALE_QTY_DEFAULT = 20;
  const WHOLESALE_QTY_HEAVY = 5;

  const getEffectivePrice = (product: Product, qty: number): { price: number; isWholesale: boolean } => {
    const wholesaleQty = product.category === 'Тяжёлая техника' ? WHOLESALE_QTY_HEAVY : WHOLESALE_QTY_DEFAULT;
    const isWholesaleQty = qty >= wholesaleQty;
    if (isWholesaleQty) return { price: product.wholesale, isWholesale: true };
    // Применяем скидку по карте если не оптовое кол-во
    if (user && user.card) {
      const cardPrice = Math.round(product.price * (1 - user.card.discount_percent / 100));
      return { price: cardPrice, isWholesale: false };
    }
    return { price: product.price, isWholesale: false };
  };

  const cartItems = cart.map((i) => {
    const product = allProducts.find((p) => p.id === i.id)!;
    const { price, isWholesale } = getEffectivePrice(product, i.qty);
    return { ...product, qty: i.qty, effectivePrice: price, isWholesale };
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
            {NAV.map((n) => (
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
                <Button variant="ghost" size="icon" className="rounded-full sm:hidden" onClick={() => setAuthOpen(true)}>
                  <Icon name="UserCircle" size={22} />
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
                      <div className="flex-1 overflow-y-auto space-y-4 px-6 py-3">
                        {cartItems.map((i) => (
                          <div key={i.id} className="flex gap-3 items-center">
                            <img src={i.image} alt={i.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{i.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-primary font-bold">{fmt(i.effectivePrice)}</p>
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
                                className="w-12 text-center text-sm font-medium border border-input rounded-lg h-7 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                              />
                              <Button size="icon" variant="outline" className="w-7 h-7 rounded-full flex-shrink-0" onClick={() => changeQty(i.id, 1)}><Icon name="Plus" size={14} /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border px-6 pt-4 pb-6 space-y-3 flex-shrink-0">
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
                      <SheetTitle className="font-display text-2xl">Адрес доставки</SheetTitle>
                    </div>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

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

                    {/* Получатель */}
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Получатель</p>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Имя и фамилия <span className="text-red-400">*</span></label>
                        <Input value={address.name} onChange={e => setAddress({...address, name: e.target.value})} placeholder="Иван Иванов" className="h-12 rounded-xl" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Телефон <span className="text-red-400">*</span></label>
                        <Input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="+7 900 000-00-00" type="tel" className="h-12 rounded-xl" />
                      </div>
                    </div>

                    {/* Адрес */}
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
                  </div>
                  <div className="border-t border-border px-6 pt-4 pb-6 flex-shrink-0">
                    <Button
                      className="w-full gradient-brand text-white rounded-full h-12 text-base hover:opacity-90 disabled:opacity-50"
                      disabled={!address.name || !address.phone || !address.city || !address.street}
                      onClick={() => setCheckoutStep('payment')}>
                      Перейти к оплате <Icon name="ArrowRight" size={18} className="ml-2" />
                    </Button>
                    {(!address.name || !address.phone || !address.city || !address.street) && (
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
                    {/* Адрес — сводка */}
                    <div className="bg-muted/50 rounded-2xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Доставка</p>
                        <span className="text-xs font-medium text-primary">
                          {deliveryService === 'yandex' ? '⚡ Яндекс Доставка' : deliveryService === 'courier' ? '🚚 Курьер' : '📮 Почта РФ'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold">{address.name} · {address.phone}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.street}
                        {address.entrance ? `, подъезд ${address.entrance}` : ''}
                        {address.floor ? `, этаж ${address.floor}` : ''}
                        {address.apartment ? `, кв. ${address.apartment}` : ''}
                        {address.zip ? ` ${address.zip}` : ''}
                      </p>
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
                          { key: 'sbp', icon: 'Smartphone', label: 'СБП', sub: 'Оплата по QR-коду или ссылке' },
                          { key: 'cash', icon: 'Banknote', label: 'При получении', sub: 'Наличными или картой курьеру' },
                        ].map(m => (
                          <div key={m.key} onClick={() => setPaymentMethod(m.key as 'sbp' | 'cash')} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === m.key ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
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
                          await fetch(ORDERS_URL, {
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
                              total,
                              is_wholesale: cartItems.some(i => i.isWholesale),
                              items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.effectivePrice, qty: i.qty })),
                            }),
                          });
                        } finally {
                          setOrderLoading(false);
                          setOrderDone(true);
                          setCart([]);
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
                  <p className="text-sm text-muted-foreground">Доставка: {address.city}, {address.street}</p>
                  {paymentMethod === 'sbp' && (
                    <div className="w-full mt-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col gap-3">
                      <p className="text-sm font-medium text-emerald-800">Оплатите заказ через СБП</p>
                      <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between border border-emerald-100">
                        <span className="text-xs text-emerald-700">Сумма к оплате</span>
                        <span className="text-lg font-black text-emerald-800">{fmt(total)}</span>
                      </div>
                      <p className="text-xs text-emerald-700">Введите эту сумму при переводе. После оплаты вернитесь сюда.</p>
                      <a href={SBP_URL} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 gradient-brand text-white rounded-full h-11 text-sm font-medium">
                        <Icon name="Smartphone" size={16} />
                        Оплатить по СБП
                      </a>
                    </div>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </header>

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
            <div className="flex gap-4">
              <Button onClick={() => scrollTo('catalog')} className="gradient-brand text-white rounded-full h-13 px-8 text-base hover:opacity-90">
                В каталог <Icon name="ArrowRight" size={18} className="ml-1" />
              </Button>
              <Button onClick={() => scrollTo('about')} variant="outline" className="rounded-full h-13 px-8 text-base">О нас</Button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-72 md:w-80 animate-scale-in">
              <div className="absolute inset-0 gradient-brand blur-3xl opacity-30 rounded-full" />
              <div className="relative overflow-hidden rounded-3xl shadow-2xl aspect-square">
                {allProducts.map((p, i) => (
                  <img key={p.id} src={p.image} alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                    style={{ opacity: i === heroIdx ? 1 : 0 }} />
                ))}
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allProducts.map((_, i) => (
                  <button key={i} onClick={() => setHeroIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIdx ? 'w-6 gradient-brand' : 'w-1.5 bg-muted-foreground/40'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="container py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight">Каталог</h2>
            <p className="text-muted-foreground mt-2">Найдено товаров: {filtered.length}</p>
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
              <Slider value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0])} max={200000} min={200} step={500} />
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
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <Icon name="SearchX" size={48} className="mx-auto mb-3" />
                Ничего не найдено
              </div>
            )}
            {filtered.map((p, idx) => (
              <div key={p.id} className="group bg-card rounded-3xl border border-border overflow-hidden hover-scale animate-fade-in" style={{ animationDelay: `${idx * 60}ms`, opacity: 0 }}>
                <div className="relative aspect-square overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {p.badge && <Badge className="absolute top-4 left-4 gradient-brand text-white border-0 rounded-full">{p.badge}</Badge>}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <Icon name="Star" size={14} className="text-secondary fill-secondary" /> {p.rating}
                    <span className="mx-1">·</span>{p.category}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-3">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display font-black text-xl">{fmt(p.price)}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-muted-foreground">Опт:</span>
                        <span className="text-sm font-bold text-emerald-600">{fmt(p.wholesale)}</span>
                      </div>
                    </div>
                    <Button size="icon" onClick={() => addToCart(p.id)} className="gradient-brand text-white rounded-full w-11 h-11 hover:opacity-90">
                      <Icon name="Plus" size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="delivery" className="bg-muted/40 py-20">
        <div className="container">
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight text-center mb-12">Оплата и доставка</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'Truck', title: 'Доставка за 1 день', text: 'Курьером по городу и почтой по всей России' },
              { icon: 'CreditCard', title: 'Удобная оплата', text: 'Картой онлайн, при получении или в рассрочку' },
              { icon: 'ShieldCheck', title: 'Гарантия 2 года', text: 'Официальная гарантия на всю технику' },
            ].map((f) => (
              <div key={f.title} className="bg-card rounded-3xl p-8 border border-border hover-scale">
                <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mb-5">
                  <Icon name={f.icon} size={26} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="container py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-6">О нас</h2>
          <p className="text-lg text-muted-foreground mb-4">
            Се-Се 谢谢 — это больше чем магазин. Мы рядом, когда нужно порадовать себя или близких: от уютных мелочей для дома до мощной техники для настоящих приключений.
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Каждый товар мы выбираем с душой. С нами уже более 50 000 довольных покупателей по всей стране — и мы только начинаем.
          </p>
          <div className="grid grid-cols-3 gap-6">
            {[['50K+', 'Клиентов'], ['4.9', 'Рейтинг'], ['24/7', 'Поддержка']].map(([n, l]) => (
              <div key={l}>
                <div className="font-display font-black text-3xl gradient-text">{n}</div>
                <div className="text-sm text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 gradient-brand blur-3xl opacity-20 rounded-full" />
          <img src={allProducts[0]?.image} alt="О нас" className="relative rounded-3xl w-full shadow-xl" />
        </div>
      </section>

      <section id="contacts" className="bg-muted/40 py-20">
        <div className="container grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-8">Контакты</h2>
            <div className="space-y-5">
              {[
                { icon: 'Phone', label: '+7 (916) 143-32-32' },
                { icon: 'Mail', label: 'mag789-944@yandex.ru' },
                { icon: 'MapPin', label: 'г. Долгопрудный, ул. Парковая, 44 к1' },
                { icon: 'Clock', label: 'Ежедневно с 9:00 до 21:00' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center">
                    <Icon name={c.icon} size={20} className="text-primary" />
                  </div>
                  <span className="font-medium">{c.label}</span>
                </div>
              ))}
              <a href={socials.social_telegram || 'https://t.me/Chineshop1688'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#229ED9] flex items-center justify-center text-white group-hover:opacity-80 transition-opacity">
                  <Icon name="Send" size={20} />
                </div>
                <span className="font-medium group-hover:text-primary transition-colors">Написать в Telegram</span>
              </a>
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
              <a href={socials.social_max} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:gradient-brand hover:text-white transition-all">
                <Icon name="Tv" size={18} />
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* Модалка авторизации */}
      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setAuthOpen(false)}>
          <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
                    return (
                      <div key={o.id} className="border border-border rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">#{o.id}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                            {o.payment_status === 'paid' && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">✓ Оплачен</span>}
                          </div>
                          <span className="font-bold text-sm">{fmt(o.total)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{o.created_at} · {o.city}</p>
                        <div className="space-y-1">
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-muted-foreground truncate flex-1 mr-2">{item.name} × {item.qty}</span>
                              <span className="font-medium flex-shrink-0">{fmt(item.price * item.qty)}</span>
                            </div>
                          ))}
                        </div>
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