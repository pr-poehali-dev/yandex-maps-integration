import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ADMIN_URL = 'https://functions.poehali.dev/d0783820-5c61-485a-8950-26c45aaa030c';
const ORDERS_URL = 'https://functions.poehali.dev/b3cf2e84-45d2-47ff-96ce-48cfa7aa5fbd';
const CATEGORIES = ['Товары для дома', 'Снеки', 'Напитки', 'Канцелярия', 'Игрушки', 'Косметика', 'Тяжёлая техника'];
const BADGES = ['', 'Хит', 'Новинка', 'Скидка'];

type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  wholesale: number;
  rating: number;
  image: string;
  badge: string | null;
  description?: string;
  sort_order?: number;
};

type Settings = { social_instagram: string; social_youtube: string; social_telegram: string; social_max: string };

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  city: string;
  street: string;
  apartment: string;
  entrance: string;
  floor: string;
  zip: string;
  comment: string;
  delivery_service: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: { name: string; price: number; qty: number }[];
};

const DELIVERY_LABELS: Record<string, string> = {
  yandex: '⚡ Яндекс Доставка',
  courier: '🚚 Курьер',
  post: '📮 Почта РФ',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:       { label: 'Новый',       color: 'bg-blue-100 text-blue-700' },
  confirmed: { label: 'Подтверждён', color: 'bg-emerald-100 text-emerald-700' },
  shipped:   { label: 'Отправлен',   color: 'bg-orange-100 text-orange-700' },
  delivered: { label: 'Доставлен',   color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Отменён',     color: 'bg-red-100 text-red-600' },
};

function SortableItem({ product, isActive, onClick, onDelete }: {
  product: Product; isActive: boolean; onClick: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}
      onClick={onClick}>
      <button {...attributes} {...listeners} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing flex-shrink-0 touch-none" onClick={e => e.stopPropagation()}>
        <Icon name="GripVertical" size={16} />
      </button>
      <img src={product.image || 'https://placehold.co/48x48/f4f4f5/a1a1aa?text=?'} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-muted" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.price.toLocaleString('ru-RU')} ₽</p>
      </div>
      {product.badge && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">{product.badge}</span>
      )}
      <button onClick={e => { e.stopPropagation(); onDelete(); }}
        className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 p-1">
        <Icon name="Trash2" size={16} />
      </button>
    </div>
  );
}

async function api(action: string, body: object = {}, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['X-Admin-Token'] = token;
  const res = await fetch(ADMIN_URL, { method: 'POST', headers, body: JSON.stringify({ action, ...body }) });
  return res.json();
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState<'products' | 'socials' | 'users' | 'orders'>('orders');
  const [settings, setSettings] = useState<Settings>({ social_instagram: '', social_youtube: '', social_telegram: '', social_max: '' });
  const [wholesaleQtyDefault, setWholesaleQtyDefault] = useState('50');
  const [wholesaleQtyHeavy, setWholesaleQtyHeavy] = useState('5');
  const [savingSettings, setSavingSettings] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [users, setUsers] = useState<{ id: number; name: string; email: string; phone: string; created_at: string; card_type: string; discount_percent: number; total_purchases: number }[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [payFilter, setPayFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const isAuth = !!token;

  useEffect(() => {
    if (isAuth) { loadProducts(); loadSettings(); loadUsers(); loadOrders(); }
  }, [isAuth]);

  const loadUsers = async () => {
    const data = await api('get_users', {}, token);
    if (data.users) setUsers(data.users);
  };

  const loadOrders = async () => {
    const res = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ action: 'list' }),
    });
    const data = await res.json();
    if (data.orders) setOrders(data.orders);
  };

  const updateOrderStatus = async (id: number, status: string) => {
    setUpdatingStatus(id);
    await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ action: 'update_status', id, status }),
    });
    setUpdatingStatus(null);
    showMsg('Статус обновлён!');
    loadOrders();
  };

  const updatePaymentStatus = async (id: number, payment_status: string) => {
    await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ action: 'update_payment_status', id, payment_status }),
    });
    showMsg(payment_status === 'paid' ? 'Оплата подтверждена!' : 'Статус оплаты сброшен');
    loadOrders();
  };

  const loadProducts = async () => {
    const data = await api('list', {}, token);
    if (data.products) setProducts(data.products);
  };

  const loadSettings = async () => {
    const data = await api('get_settings', {}, token);
    if (data.settings) {
      setSettings(data.settings);
      if (data.settings.wholesale_qty_default) setWholesaleQtyDefault(data.settings.wholesale_qty_default);
      if (data.settings.wholesale_qty_heavy) setWholesaleQtyHeavy(data.settings.wholesale_qty_heavy);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    await api('save_settings', { settings: { ...settings, wholesale_qty_default: wholesaleQtyDefault, wholesale_qty_heavy: wholesaleQtyHeavy } }, token);
    setSavingSettings(false);
    showMsg('Настройки сохранены!');
  };

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 2500);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = products.findIndex(p => p.id === active.id);
    const newIndex = products.findIndex(p => p.id === over.id);
    const newOrder = arrayMove(products, oldIndex, newIndex);
    setProducts(newOrder);
    await api('reorder', { order: newOrder.map(p => p.id) }, token);
    showMsg('Порядок сохранён!');
  };

  const handleLogin = async () => {
    setLoginError('');
    const data = await api('login', { password });
    if (data.success) {
      localStorage.setItem('admin_token', password);
      setToken(password);
    } else {
      setLoginError('Неверный пароль');
    }
  };

  const openEditor = (product: Product) => {
    setEditing({ ...product });
    setDrawerOpen(true);
  };

  const closeEditor = () => {
    setDrawerOpen(false);
    setTimeout(() => setEditing(null), 300);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await api('update', {
      id: editing.id,
      name: editing.name,
      category: editing.category,
      brand: editing.brand,
      price: Number(editing.price),
      wholesale: Number(editing.wholesale),
      badge: editing.badge || null,
      description: editing.description || '',
    }, token);
    setSaving(false);
    showMsg('Сохранено!');
    loadProducts();
    closeEditor();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop() || 'jpg';
    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      const base64 = (reader.result as string).split(',')[1];
      const data = await api('upload_image', { id: editing.id, image: base64, ext }, token);
      if (data.image) setEditing(prev => prev ? { ...prev, image: data.image } : prev);
      setUploading(false);
      showMsg('Фото обновлено!');
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    const data = await api('create', { name: 'Новый товар', category: 'Товары для дома', brand: '', price: 0, wholesale: 0, image: '' }, token);
    if (data.id) {
      await loadProducts();
      const fresh: Product = { id: data.id, name: 'Новый товар', category: 'Товары для дома', brand: '', price: 0, wholesale: 0, rating: 4.8, image: '', badge: null, description: '' };
      openEditor(fresh);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    await api('delete', { id }, token);
    if (editing?.id === id) closeEditor();
    loadProducts();
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="ShieldCheck" size={32} className="text-white" />
            </div>
            <h1 className="font-display font-black text-2xl">Админ-панель</h1>
            <p className="text-muted-foreground text-sm mt-1">Се-Се 谢谢</p>
          </div>
          <div className="space-y-3">
            <Input type="password" placeholder="Пароль" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="h-12 rounded-xl" />
            {loginError && <p className="text-sm text-red-500 text-center">{loginError}</p>}
            <Button className="w-full gradient-brand text-white rounded-full h-12 text-base hover:opacity-90" onClick={handleLogin}>
              Войти
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Шапка */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 gradient-brand rounded-lg flex items-center justify-center">
              <Icon name="ShieldCheck" size={14} className="text-white" />
            </div>
            <span className="font-display font-black text-base">Админ</span>
          </div>
          <div className="flex items-center gap-2">
            {msg && <span className="text-xs text-emerald-600 font-medium">{msg}</span>}
            <a href="/" className="text-xs text-muted-foreground hover:text-foreground px-2 py-1">← Сайт</a>
            <Button variant="outline" size="sm" className="rounded-full h-8 px-3 text-xs" onClick={() => { localStorage.removeItem('admin_token'); setToken(''); }}>
              <Icon name="LogOut" size={13} className="mr-1" />Выйти
            </Button>
          </div>
        </div>
      </header>

      {/* Вкладки */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 bg-muted/60 rounded-2xl p-1">
          <button onClick={() => setTab('orders')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'orders' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
            <Icon name="ClipboardList" size={14} />
            <span className="hidden sm:inline">Заказы</span>
            {orders.filter(o => o.status === 'new').length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {orders.filter(o => o.status === 'new').length}
              </span>
            )}
          </button>
          <button onClick={() => setTab('products')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'products' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
            <Icon name="Package" size={14} /><span className="hidden sm:inline">Товары</span>
          </button>
          <button onClick={() => setTab('users')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'users' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
            <Icon name="Users" size={14} /><span className="hidden sm:inline">Клиенты</span>
          </button>
          <button onClick={() => setTab('socials')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'socials' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
            <Icon name="Link" size={14} /><span className="hidden sm:inline">Соцсети</span>
          </button>
        </div>
      </div>

      {/* Соцсети */}
      {tab === 'socials' && (
        <div className="px-4 py-5 space-y-4">
          <h2 className="font-display font-bold text-xl">Настройки</h2>

          {/* Оптовые пороги */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Icon name="Package" size={16} className="text-primary" />Оптовые пороги
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Все товары, от шт.</label>
                <Input type="number" min={1} value={wholesaleQtyDefault}
                  onChange={e => setWholesaleQtyDefault(e.target.value)}
                  className="h-11 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Тяжёлая техника, от шт.</label>
                <Input type="number" min={1} value={wholesaleQtyHeavy}
                  onChange={e => setWholesaleQtyHeavy(e.target.value)}
                  className="h-11 rounded-xl text-sm" />
              </div>
            </div>
          </div>

          {/* Соцсети */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Icon name="Link" size={16} className="text-primary" />Ссылки на соцсети
            </h3>
            {([
              { key: 'social_instagram', label: 'Instagram', icon: 'Instagram', placeholder: 'https://instagram.com/...' },
              { key: 'social_youtube', label: 'YouTube', icon: 'Youtube', placeholder: 'https://youtube.com/...' },
              { key: 'social_telegram', label: 'Telegram', icon: 'Send', placeholder: 'https://t.me/...' },
              { key: 'social_max', label: 'Max', icon: 'Tv', placeholder: 'https://web.max.ru/...' },
            ] as { key: keyof Settings; label: string; icon: string; placeholder: string }[]).map(s => (
              <div key={s.key}>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Icon name={s.icon} size={12} /> {s.label}
                </label>
                <Input value={settings[s.key]} onChange={e => setSettings({ ...settings, [s.key]: e.target.value })}
                  placeholder={s.placeholder} className="h-11 rounded-xl text-sm" />
              </div>
            ))}
          </div>

          <Button className="w-full gradient-brand text-white rounded-full h-12 hover:opacity-90" onClick={handleSaveSettings} disabled={savingSettings}>
            {savingSettings ? 'Сохраняю...' : 'Сохранить всё'}
          </Button>
        </div>
      )}

      {/* Заказы */}
      {tab === 'orders' && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-xl">
              Заказы <span className="text-muted-foreground font-normal text-base">({orders.length})</span>
            </h2>
            <button onClick={loadOrders} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="RefreshCw" size={14} />
            </button>
          </div>
          {/* Фильтр по оплате */}
          {orders.length > 0 && (() => {
            const unpaidCount = orders.filter(o => o.payment_status !== 'paid').length;
            const paidCount = orders.filter(o => o.payment_status === 'paid').length;
            return (
              <div className="flex gap-2 mb-3">
                {[
                  { key: 'all', label: `Все (${orders.length})` },
                  { key: 'pending', label: `⏳ Не оплачено (${unpaidCount})`, color: unpaidCount > 0 ? 'text-yellow-700' : '' },
                  { key: 'paid', label: `✓ Оплачено (${paidCount})`, color: 'text-emerald-700' },
                ].map(f => (
                  <button key={f.key} onClick={() => setPayFilter(f.key as 'all' | 'pending' | 'paid')}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${payFilter === f.key ? 'bg-primary text-white border-primary' : `border-border bg-card ${f.color || ''} hover:border-primary`}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            );
          })()}
          {orders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Icon name="ClipboardList" size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Заказов пока нет</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.filter(o => payFilter === 'all' || o.payment_status === payFilter || (payFilter === 'pending' && o.payment_status !== 'paid')).map(o => {
                const st = STATUS_LABELS[o.status] || { label: o.status, color: 'bg-muted text-muted-foreground' };
                const isExpanded = expandedOrder === o.id;
                return (
                  <div key={o.id} className={`bg-card border rounded-2xl overflow-hidden transition-all ${o.status === 'new' ? 'border-blue-300' : 'border-border'}`}>
                    {/* Шапка заказа */}
                    <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpandedOrder(isExpanded ? null : o.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-sm">#{o.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                          {o.status === 'new' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {o.payment_status === 'paid' ? '✓ Оплачен' : '⏳ Не оплачен'}
                          </span>
                        </div>
                        <p className="font-medium text-sm truncate">{o.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{o.customer_phone} · {o.city}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm">{o.total.toLocaleString('ru-RU')} ₽</p>
                        <p className="text-xs text-muted-foreground">{o.created_at}</p>
                      </div>
                      <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground flex-shrink-0" />
                    </button>

                    {/* Детали */}
                    {isExpanded && (
                      <div className="border-t border-border px-4 pb-4 space-y-4">
                        {/* Состав */}
                        <div className="pt-3 space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Состав заказа</p>
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground truncate flex-1 mr-2">{item.name} × {item.qty}</span>
                              <span className="font-medium flex-shrink-0">{(item.price * item.qty).toLocaleString('ru-RU')} ₽</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold text-sm pt-1 border-t border-border mt-2">
                            <span>Итого</span><span>{o.total.toLocaleString('ru-RU')} ₽</span>
                          </div>
                        </div>

                        {/* Адрес */}
                        <div className="bg-muted/50 rounded-xl p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">Адрес доставки</p>
                            <span className="text-xs text-primary font-medium">{DELIVERY_LABELS[o.delivery_service] || o.delivery_service}</span>
                          </div>
                          <p className="text-sm">{o.city}, {o.street}</p>
                          {(o.entrance || o.floor || o.apartment) && (
                            <p className="text-sm text-muted-foreground">
                              {o.entrance ? `подъезд ${o.entrance}` : ''}
                              {o.floor ? `${o.entrance ? ', ' : ''}этаж ${o.floor}` : ''}
                              {o.apartment ? `${(o.entrance || o.floor) ? ', ' : ''}кв. ${o.apartment}` : ''}
                            </p>
                          )}
                          {o.zip && <p className="text-xs text-muted-foreground">Индекс: {o.zip}</p>}
                          {o.comment && <p className="text-xs text-muted-foreground italic">💬 {o.comment}</p>}
                          <a href={`tel:${o.customer_phone}`} className="text-sm text-primary flex items-center gap-1 mt-1">
                            <Icon name="Phone" size={12} />{o.customer_phone}
                          </a>
                        </div>

                        {/* Статус оплаты */}
                        <div className={`rounded-xl p-3 flex items-center justify-between ${o.payment_status === 'paid' ? 'bg-emerald-50 border border-emerald-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Оплата</p>
                            <p className={`text-sm font-bold ${o.payment_status === 'paid' ? 'text-emerald-700' : 'text-yellow-700'}`}>
                              {o.payment_status === 'paid' ? '✓ Оплачен' : '⏳ Ожидает оплаты'}
                            </p>
                          </div>
                          <button
                            onClick={() => updatePaymentStatus(o.id, o.payment_status === 'paid' ? 'pending' : 'paid')}
                            className={`text-xs font-medium px-3 py-2 rounded-xl border transition-all ${o.payment_status === 'paid' ? 'border-red-200 bg-white text-red-600 hover:bg-red-50' : 'border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                            {o.payment_status === 'paid' ? 'Сбросить' : 'Отметить оплаченным'}
                          </button>
                        </div>

                        {/* Смена статуса */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Изменить статус</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(STATUS_LABELS).map(([key, val]) => (
                              <button
                                key={key}
                                disabled={o.status === key || updatingStatus === o.id}
                                onClick={() => updateOrderStatus(o.id, key)}
                                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${o.status === key ? `${val.color} border-transparent` : 'border-border bg-card hover:border-primary disabled:opacity-40'}`}>
                                {updatingStatus === o.id && o.status !== key ? '...' : val.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Пользователи */}
      {tab === 'users' && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-xl">Клиенты <span className="text-muted-foreground font-normal text-base">({users.length})</span></h2>
            <button onClick={loadUsers} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="RefreshCw" size={14} />
            </button>
          </div>
          {users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Icon name="Users" size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Пока никто не зарегистрировался</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map(u => {
                const cardColors: Record<string, string> = {
                  silver: 'bg-gray-100 text-gray-600 border-gray-200',
                  gold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                  diamond: 'bg-blue-100 text-blue-700 border-blue-200',
                };
                const cardLabels: Record<string, string> = {
                  silver: 'Серебро', gold: 'Золото', diamond: 'Бриллиант',
                };
                const cardType = u.card_type || 'silver';
                return (
                  <div key={u.id} className="p-3 bg-card border border-border rounded-2xl space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        {u.phone && (
                          <a href={`tel:${u.phone}`} className="text-xs text-primary truncate flex items-center gap-1 mt-0.5">
                            <Icon name="Phone" size={10} />{u.phone}
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex-shrink-0 text-right">{u.created_at}</p>
                    </div>
                    <div className={`flex items-center justify-between rounded-xl px-3 py-2 border text-xs font-medium ${cardColors[cardType]}`}>
                      <span>{cardLabels[cardType]} · {u.discount_percent}% скидка</span>
                      <span>{u.total_purchases.toLocaleString('ru-RU')} ₽ покупок</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Товары */}
      {tab === 'products' && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-xl">Товары <span className="text-muted-foreground font-normal text-base">({products.length})</span></h2>
            <Button size="sm" className="gradient-brand text-white rounded-full h-9 px-4 hover:opacity-90" onClick={handleCreate}>
              <Icon name="Plus" size={15} className="mr-1" />Добавить
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <Icon name="GripVertical" size={11} />Перетащите для изменения порядка
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {products.map(p => (
                  <SortableItem key={p.id} product={p}
                    isActive={editing?.id === p.id}
                    onClick={() => openEditor(p)}
                    onDelete={() => handleDelete(p.id)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {products.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Icon name="Package" size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Товаров пока нет</p>
              <Button className="gradient-brand text-white rounded-full mt-4 hover:opacity-90" onClick={handleCreate}>
                Добавить первый товар
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Drawer-редактор (снизу, на весь экран) */}
      {editing && (
        <>
          {/* Оверлей */}
          <div
            className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={closeEditor}
          />

          {/* Панель */}
          <div className={`fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl shadow-2xl transition-transform duration-300 flex flex-col ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ maxHeight: '92dvh' }}>

            {/* Ручка + шапка */}
            <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-border">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl leading-tight">{editing.name || 'Новый товар'}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{editing.category}</p>
                </div>
                <button onClick={closeEditor} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>

            {/* Скролл-контент */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

              {/* Фото */}
              <div className="flex gap-4 items-start">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-muted border border-border flex-shrink-0">
                  {editing.image
                    ? <img src={editing.image} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Icon name="ImageOff" size={24} /></div>
                  }
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Icon name="Loader2" size={20} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">Фото товара</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button variant="outline" className="w-full rounded-xl h-10 text-sm" onClick={() => fileRef.current?.click()}>
                    <Icon name="Camera" size={15} className="mr-2" />Загрузить фото
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1.5">Можно сфотографировать с телефона</p>
                </div>
              </div>

              {/* Название */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Название товара</label>
                <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })}
                  className="h-12 rounded-xl text-base" placeholder="Введите название" />
              </div>

              {/* Описание */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Описание</label>
                <textarea value={editing.description || ''}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Опишите товар — состав, особенности, применение..."
                  rows={4}
                  className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              {/* Бренд */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Бренд / производитель</label>
                <Input value={editing.brand} onChange={e => setEditing({ ...editing, brand: e.target.value })}
                  className="h-12 rounded-xl" placeholder="Например: Xiaomi" />
              </div>

              {/* Категория */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Категория</label>
                <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
                  className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Цены */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Розничная цена ₽</label>
                  <Input type="number" inputMode="numeric" value={editing.price}
                    onChange={e => setEditing({ ...editing, price: Number(e.target.value) })}
                    className="h-12 rounded-xl text-base font-semibold" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Оптовая цена ₽</label>
                  <Input type="number" inputMode="numeric" value={editing.wholesale}
                    onChange={e => setEditing({ ...editing, wholesale: Number(e.target.value) })}
                    className="h-12 rounded-xl text-base" />
                </div>
              </div>

              {/* Значок */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">Значок</label>
                <div className="grid grid-cols-4 gap-2">
                  {BADGES.map(b => (
                    <button key={b} onClick={() => setEditing({ ...editing, badge: b || null })}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${editing.badge === (b || null) ? 'gradient-brand text-white border-transparent' : 'border-border bg-card hover:border-primary'}`}>
                      {b || 'Нет'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Опасная зона */}
              <div className="border border-red-200 rounded-2xl p-4">
                <p className="text-xs text-muted-foreground mb-2">Удаление товара</p>
                <Button variant="outline" className="w-full rounded-xl text-red-500 border-red-200 hover:bg-red-50 h-10 text-sm"
                  onClick={() => handleDelete(editing.id)}>
                  <Icon name="Trash2" size={14} className="mr-2" />Удалить товар
                </Button>
              </div>

              <div className="h-4" />
            </div>

            {/* Кнопка сохранить — прилипает к низу */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-border bg-background">
              <Button className="w-full gradient-brand text-white rounded-full h-14 text-base font-semibold hover:opacity-90" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2"><Icon name="Loader2" size={18} className="animate-spin" />Сохраняю...</span>
                ) : 'Сохранить изменения'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}