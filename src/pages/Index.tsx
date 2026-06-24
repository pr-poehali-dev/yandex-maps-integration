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
  wholesale_min_qty?: number;
  description?: string;
  composition?: string;
  usage_instructions?: string;
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

type ProductDetails = {
  description: string;
  composition?: string;
  usage?: string;
  features: string[];
};

const PRODUCT_DETAILS: Record<number, ProductDetails> = {
  7: {
    description: 'Уютный набор для дома — всё необходимое для создания атмосферы тепла и комфорта. Включает аксессуары ручной работы из натуральных материалов.',
    composition: 'Натуральный хлопок, бамбуковое волокно, натуральный воск',
    usage: 'Расставьте элементы набора по комнате по вашему вкусу. Свечу зажигайте не более 3 часов подряд.',
    features: ['Натуральные материалы', 'Ручная работа', 'Безопасно для детей', 'Подходит как подарок'],
  },
  8: {
    description: 'Ароматическая свеча с нежным запахом лаванды и ванили. Создаёт уютную атмосферу, снимает стресс и помогает расслабиться после насыщенного дня.',
    composition: 'Соевый воск, эфирные масла лаванды и ванили, хлопковый фитиль',
    usage: 'Зажигайте первый раз на 2–3 часа, чтобы воск расплавился равномерно. Обрезайте фитиль до 5 мм перед каждым использованием.',
    features: ['Время горения 40+ часов', 'Натуральный соевый воск', 'Без парафина', 'Экологичная упаковка'],
  },
  9: {
    description: 'Микс хрустящих снеков в азиатском стиле: рисовые крекеры, водорослевые чипсы, сушёный горох в соусе терияки. Яркий вкус, который невозможно остановить!',
    composition: 'Рисовая мука, водоросли нори, соус терияки, соль, специи. Без ГМО, без консервантов.',
    usage: 'Готов к употреблению. Хранить в сухом прохладном месте.',
    features: ['Без ГМО', 'Без консервантов', 'Вес 150 г', 'Срок хранения 12 месяцев'],
  },
  10: {
    description: 'Классический японский рамен Tonkotsu — насыщенный свиной бульон, пшеничная лапша и ароматные приправы. Приготовление за 3 минуты.',
    composition: 'Пшеничная лапша, сухой бульон тонкоцу, соевый соус, кунжутное масло, сушёные водоросли.',
    usage: 'Залить кипятком 500 мл, накрыть на 3 минуты, добавить приправы, перемешать.',
    features: ['Приготовление 3 мин', 'Японский рецепт', 'Вес 120 г', 'Острота: средняя'],
  },
  11: {
    description: 'Bubble Tea Matcha — освежающий напиток с тайваньским чаем матча, молочной пеной и жемчужинами тапиоки. Модный хит азиатских кафе у вас дома.',
    composition: 'Чай матча, молоко, тапиока, сахарный сироп, вода.',
    usage: 'Взболтайте пакет, откройте широкую трубочку, наслаждайтесь холодным или тёплым.',
    features: ['Готов за 2 мин', 'Содержит антиоксиданты', 'Объём 250 мл', 'Без искусственных красителей'],
  },
  12: {
    description: 'Газировка Yuzu — игристый напиток с японским цитрусом юдзу. Кисло-сладкий вкус с цветочными нотками, натуральный сок 10%.',
    composition: 'Газированная вода, сок юдзу 10%, тростниковый сахар, лимонная кислота.',
    usage: 'Подавать охлаждённым. Встряхивать перед открытием не рекомендуется.',
    features: ['Натуральный сок 10%', 'Тростниковый сахар', 'Объём 330 мл', 'Без искусственных ароматизаторов'],
  },
  13: {
    description: 'Набор гелевых ручек в стиле Kawaii — яркие цвета, мягкое письмо, очаровательный дизайн. Идеально для учёбы, скетчинга и ведения дневника.',
    composition: 'Корпус из ABS-пластика, гелевые чернила на водной основе, металлический наконечник 0.5 мм.',
    usage: 'Писать на бумаге, не нажимая сильно. Хранить в горизонтальном положении.',
    features: ['12 цветов в наборе', 'Толщина линии 0.5 мм', 'Гипоаллергенные чернила', 'Дизайн Kawaii'],
  },
  14: {
    description: 'Скетчбук формата A5 с плотными листами для скетчинга, акварели и маркеров. Твёрдая обложка с тиснением, лежит ровно при раскрытии.',
    composition: '60 листов, 200 г/м², бескислотная бумага, переплёт на кольцах.',
    usage: 'Подходит для карандашей, маркеров, акварели и туши. Не для масляных красок.',
    features: ['60 листов 200 г/м²', 'Лежит ровно при раскрытии', 'Бескислотная бумага', 'Твёрдая обложка'],
  },
  15: {
    description: 'Плюшевый Куро — мягкая игрушка-котик в чёрном цвете с вышитой мордочкой. Суперприятный на ощупь, подходит для детей от 0+.',
    composition: 'Внешний материал: плюш (100% полиэстер). Наполнитель: гипоаллергенный синтепон.',
    usage: 'Стирать при 30°C в мешке для стирки. Не сушить в барабане.',
    features: ['Высота 30 см', 'Гипоаллергенный', 'Для детей от 0+', 'Сертификат качества CE'],
  },
  16: {
    description: 'Мягкая игрушка Уточка в жёлтом цвете с оранжевым клювиком. Невероятно милая и мягкая — любимица детей и взрослых.',
    composition: 'Плюш (100% полиэстер), гипоаллергенный наполнитель, пластиковые глазки.',
    usage: 'Стирать вручную в тёплой воде. Сушить естественным путём.',
    features: ['Высота 25 см', 'Гипоаллергенный', 'Для детей от 3+', 'Мягкий плюш'],
  },
  17: {
    description: 'Сыворотка Glow Essence с гиалуроновой кислотой и экстрактом центеллы — бестселлер корейской косметики. Увлажняет, выравнивает тон, придаёт сияние уже после первого применения.',
    composition: 'Aqua, Hyaluronic Acid, Centella Asiatica Extract, Niacinamide, Panthenol, Glycerin.',
    usage: 'Нанести 2–3 капли на очищенную кожу лица утром и вечером. Распределить лёгкими похлопываниями.',
    features: ['Гиалуроновая кислота', 'Экстракт центеллы', 'Подходит для чувствительной кожи', 'Дерматологически протестировано'],
  },
  18: {
    description: 'Тканевая маска для лица Jeju с вулканической водой с острова Чеджу — глубоко увлажняет, успокаивает раздражение и восстанавливает кожу.',
    composition: 'Jeju Volcanic Water, Hyaluronic Acid, Aloe Vera Extract, Allantoin.',
    usage: 'Нанести маску на чистое лицо на 15–20 минут. Снять маску, остатки эссенции вбить в кожу.',
    features: ['Вулканическая вода Чеджу', '1 применение', 'Эссенция 23 мл', 'Для всех типов кожи'],
  },
  19: {
    description: 'Маска-плёнка с бамбуковым углем — эффективно очищает поры, удаляет загрязнения и выравнивает текстуру кожи. Визуальный результат после первого применения.',
    composition: 'Bamboo Charcoal Powder, Polyvinyl Alcohol, Glycerin, Allantoin, Centella Extract.',
    usage: 'Нанести равномерным слоем на Т-зону, избегая глаз и губ. Подождать 15 мин до высыхания, снять плёнку движением снизу вверх.',
    features: ['Бамбуковый уголь', 'Очищает поры', 'Объём 60 мл', 'Для жирной кожи'],
  },
  20: {
    description: 'Квадроцикл ATV 250cc — мощный полноприводный квадроцикл для взрослых. Объём двигателя 250cc, независимая подвеска, гидравлические тормоза.',
    composition: 'Двигатель: 4-такт. 250cc. КПП: автомат + ручной режим. Топливо: АИ-92.',
    usage: 'Эксплуатировать согласно руководству. ТО каждые 1000 км. Только для лиц 16+.',
    features: ['Двигатель 250cc', 'Полный привод 4WD', 'Гидравлические тормоза', 'Гарантия 1 год'],
  },
  21: {
    description: 'Квадроцикл ATV 110cc — компактный и манёвренный квадроцикл для детей и подростков. Надёжная защита, электростартер, ограничитель скорости.',
    composition: 'Двигатель: 4-такт. 110cc. КПП: автомат. Топливо: АИ-92.',
    usage: 'Под наблюдением взрослых. Использовать защитную экипировку. Ограничитель скорости регулируется.',
    features: ['Двигатель 110cc', 'Электростартер', 'Ограничитель скорости', 'Для детей 8–14 лет'],
  },
  22: {
    description: 'Питбайк MX 125 — надёжный кроссовый мотоцикл с двигателем 125cc. Усиленная рама, регулируемая подвеска, масляный тормоз.',
    composition: 'Двигатель: 4-такт. 125cc. КПП: 4 передачи. Топливо: АИ-92.',
    usage: 'Обкатка 300 км при 50% мощности. ТО через 500 км. Использовать шлем и защиту.',
    features: ['Двигатель 125cc', '4-ступенчатая КПП', 'Масляный тормоз', 'Гарантия 1 год'],
  },
  23: {
    description: 'Питбайк MX 150 Pro — профессиональный кроссовый мотоцикл для трассы. Усиленная рама Pro-серии, перевёрнутая вилка, дисковые тормоза спереди и сзади.',
    composition: 'Двигатель: 4-такт. 150cc. КПП: 5 передач. Топливо: АИ-92.',
    usage: 'Только для опытных гонщиков. Обкатка 500 км. Обязательно использовать полную экипировку.',
    features: ['Двигатель 150cc', '5-ступенчатая КПП', 'Перевёрнутая вилка', 'Дисковые тормоза'],
  },
};

const STATIC_CATEGORIES = ['Все', 'Товары для дома', 'Снеки', 'Напитки', 'Канцелярия', 'Игрушки', 'Косметика', 'Тяжёлая техника'];
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
  const [maxPrice, setMaxPrice] = useState(5000000);
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
  const [wholesaleQtyDefault, setWholesaleQtyDefault] = useState(50);
  const [wholesaleQtyHeavy, setWholesaleQtyHeavy] = useState(5);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(PRODUCTS_URL)
      .then(r => r.json())
      .then(data => {
        if (data.products?.length) setDbProducts(data.products);
        if (data.settings) {
          setSocials(s => ({ ...s, ...data.settings }));
          if (data.settings.wholesale_qty_default) setWholesaleQtyDefault(parseInt(data.settings.wholesale_qty_default));
          if (data.settings.wholesale_qty_heavy) setWholesaleQtyHeavy(parseInt(data.settings.wholesale_qty_heavy));
        }
        if (data.categories?.length) setDbCategories(data.categories);
      });
  }, []);

  const CATEGORIES = ['Все', ...(dbCategories.length > 0 ? dbCategories : STATIC_CATEGORIES.slice(1))];

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
            <div className="relative w-full md:w-[480px] animate-scale-in">
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
            {/* Фото */}
            <div className="relative min-h-[300px] md:min-h-[420px] overflow-hidden">
              <img
                src="https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/6f802402-56c8-4228-bd60-a676b940611d.jpg"
                alt="Наш магазин"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:bg-gradient-to-t md:from-black/30 md:to-transparent" />
              <div className="absolute top-5 left-5">
                <span className="bg-white text-foreground font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Открыто сейчас
                </span>
              </div>
            </div>

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
                  { icon: 'Clock', text: 'Ежедневно 9–21' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2.5 bg-muted rounded-xl px-3 py-2.5">
                    <Icon name={item.icon} size={16} className="text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
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
              <span className="text-sm font-medium leading-tight">{item.label}</span>
            </div>
          ))}
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
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <Icon name="SearchX" size={48} className="mx-auto mb-3" />
                Ничего не найдено
              </div>
            )}
            {filtered.map((p, idx) => {
              const inCart = cart.find(i => i.id === p.id);
              return (
                <div key={p.id} className="group bg-card rounded-3xl border border-border overflow-hidden flex flex-col hover-scale animate-fade-in" style={{ animationDelay: `${idx * 60}ms`, opacity: 0 }}>
                  <div className="relative overflow-hidden cursor-pointer" style={{ aspectRatio: '4/3' }} onClick={() => setModalProduct(p)}>
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
                      {(p.description && p.description.trim()) ? p.description : (PRODUCT_DETAILS[p.id]?.description ?? `${p.brand} · Оригинальное качество · Быстрая доставка`)}
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
          </div>
        </div>
      </section>

      <section id="delivery" className="bg-muted/40 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="gradient-brand text-white border-0 mb-4 rounded-full px-4 py-1.5">Доставка и оплата</Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight">Быстро, удобно, надёжно</h2>
            <p className="text-muted-foreground mt-3 text-lg">Доставляем по всей России — от Калининграда до Владивостока</p>
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
          <p className="text-muted-foreground mt-3 text-lg">Более 50 000 довольных клиентов по всей России</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Анна К.', city: 'Москва', rating: 5, text: 'Заказала набор для дома — всё пришло быстро, упаковано аккуратно. Качество выше ожиданий! Обязательно закажу ещё.', product: 'Набор для дома «Уют»', avatar: '👩' },
            { name: 'Дмитрий Р.', city: 'Санкт-Петербург', rating: 5, text: 'Взял квадроцикл ATV 250cc — доставили за 2 дня, помогли с документами. Менеджер на связи 24/7. Рекомендую!', product: 'Квадроцикл ATV 250cc', avatar: '👨' },
            { name: 'Мария С.', city: 'Екатеринбург', rating: 5, text: 'Сыворотка Glow Essence — просто чудо! Кожа сияет. Брала оптом для небольшого магазина — цены отличные.', product: 'Сыворотка Glow Essence', avatar: '👩‍🦱' },
            { name: 'Алексей В.', city: 'Казань', rating: 5, text: 'Bubble Tea Matcha понравился всей семье. Очень вкусно и необычно. Курьер приехал вовремя, вежливый.', product: 'Bubble Tea Matcha', avatar: '👨‍🦲' },
            { name: 'Ольга П.', city: 'Новосибирск', rating: 5, text: 'Плюшевый Куро — подарок сыну на день рождения. Он в восторге! Мягкий, большой. Спасибо за быструю доставку.', product: 'Плюшевый Куро', avatar: '🧑‍🦰' },
            { name: 'Игорь М.', city: 'Ростов-на-Дону', rating: 5, text: 'Питбайк MX 125 — отличная техника за свои деньги. Всё по описанию, доставили в срок. Магазин честный.', product: 'Питбайк MX 125', avatar: '👴' },
          ].map((r) => (
            <div key={r.name} className="bg-card rounded-3xl border border-border p-6 flex flex-col gap-4 hover-scale">
              <div className="flex items-center gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Icon key={i} name="Star" size={15} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed flex-1">«{r.text}»</p>
              <div className="pt-3 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">{r.avatar}</div>
                  <div>
                    <p className="font-bold text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.city} · {r.product}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Рейтинги платформ */}
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {[
            { label: 'Яндекс Маркет', rating: '4.9', reviews: '1 240 отзывов' },
            { label: 'Wildberries', rating: '4.8', reviews: '3 120 отзывов' },
            { label: 'Ozon', rating: '4.9', reviews: '870 отзывов' },
          ].map((pl) => (
            <div key={pl.label} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-3">
              <div className="flex items-center gap-1">
                <Icon name="Star" size={16} className="text-amber-400 fill-amber-400" />
                <span className="font-display font-black text-lg">{pl.rating}</span>
              </div>
              <div>
                <p className="text-sm font-medium">{pl.label}</p>
                <p className="text-xs text-muted-foreground">{pl.reviews}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="container py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <Badge className="gradient-brand text-white border-0 mb-5 rounded-full px-4 py-1.5">О компании</Badge>
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-6">Магазин, которому доверяют</h2>
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
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-border flex items-center justify-center group-hover:opacity-80 transition-opacity flex-shrink-0">
                  <img src="https://www.google.com/s2/favicons?domain=max.ru&sz=64" alt="MAX" className="w-8 h-8 object-contain" />
                </div>
                <span className="font-medium group-hover:text-primary transition-colors">Написать в MAX</span>
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
              <h3 className="font-display font-black text-3xl md:text-4xl mb-2">Готовы сделать заказ?</h3>
              <p className="text-white/80 text-lg">Более 50 000 клиентов уже выбрали нас. Присоединяйтесь!</p>
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
        const details = PRODUCT_DETAILS[p.id];
        const dbDescription = p.description && p.description.trim() ? p.description : null;
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

                {/* Описание — из БД (приоритет) или из статики */}
                {(dbDescription || details?.description) && (
                  <div>
                    <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2">
                      <Icon name="Info" size={16} className="text-primary" /> Описание
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{dbDescription ?? details?.description}</p>
                  </div>
                )}

                {/* Преимущества */}
                {details?.features && (
                  <div>
                    <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-primary" /> Преимущества
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {details.features.map(f => (
                        <div key={f} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                          <div className="w-4 h-4 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                            <Icon name="Check" size={10} className="text-white" />
                          </div>
                          <span className="text-xs font-medium">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Состав — из БД или статики */}
                {(p.composition?.trim() || details?.composition) && (
                  <div>
                    <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2">
                      <Icon name="FlaskConical" size={16} className="text-primary" /> Состав
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-muted rounded-xl p-3">{p.composition?.trim() || details?.composition}</p>
                  </div>
                )}

                {/* Применение — из БД или статики */}
                {(p.usage_instructions?.trim() || details?.usage) && (
                  <div>
                    <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2">
                      <Icon name="BookOpen" size={16} className="text-primary" /> Способ применения
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-muted rounded-xl p-3">{p.usage_instructions?.trim() || details?.usage}</p>
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