import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Product, Settings, Order, AdminReview, AdminUser, ORDERS_URL, REVIEWS_URL, api } from '@/components/admin/adminTypes';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminPortfolio from '@/components/admin/AdminPortfolio';

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState<'products' | 'socials' | 'users' | 'orders' | 'reviews' | 'portfolio'>('orders');
  const [adminReviews, setAdminReviews] = useState<AdminReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({ social_instagram: '', social_youtube: '', social_telegram: '', social_max: '', contact_max: '', contact_whatsapp: '', contact_phone: '', contact_email: '', contact_address: '', contact_hours: '' });
  const [wholesaleQtyDefault, setWholesaleQtyDefault] = useState('50');
  const [wholesaleQtyHeavy, setWholesaleQtyHeavy] = useState('5');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeImages, setStoreImages] = useState<string[]>([]);
  const [uploadingStore, setUploadingStore] = useState(false);
  const knownOrderIds = useRef<Set<number>>(new Set());
  const isFirstLoad = useRef(true);

  const isAuth = !!token;

  useEffect(() => {
    if (isAuth) { loadProducts(); loadSettings(); loadUsers(); loadOrders(); loadCategories(); }
  }, [isAuth]);

  const loadUsers = async () => {
    const data = await api('get_users', {}, token);
    if (data.users) setUsers(data.users);
  };

  const loadCategories = async () => {
    const data = await api('get_categories', {}, token);
    if (data.categories) setCategories(data.categories);
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    const data = await api('add_category', { name }, token);
    if (data.error) { showMsg(data.error); return; }
    setNewCategory('');
    loadCategories();
    loadProducts();
    showMsg('Категория добавлена!');
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    const data = await api('delete_category', { id }, token);
    if (data.error) { showMsg(data.error); return; }
    setCategories(c => c.filter(cat => cat.id !== id));
    showMsg(`«${name}» удалена`);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    if (isAuth) requestNotificationPermission();
  }, [isAuth]);

  const playNotification = () => {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    [880, 1100, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.2);
    });
  };

  const loadOrders = async (silent = false) => {
    const res = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ action: 'list' }),
    });
    const data = await res.json();
    if (data.orders) {
      setOrders(data.orders);
      if (isFirstLoad.current) {
        data.orders.forEach((o: Order) => knownOrderIds.current.add(o.id));
        isFirstLoad.current = false;
      } else if (!silent) {
        const newOnes = data.orders.filter((o: Order) => !knownOrderIds.current.has(o.id));
        if (newOnes.length > 0) {
          newOnes.forEach((o: Order) => knownOrderIds.current.add(o.id));
          playNotification();
          showMsg(`Новый заказ №${newOnes[0].id}!`);
          if ('Notification' in window && Notification.permission === 'granted') {
            const o = newOnes[0];
            new Notification('🛍️ Новый заказ!', {
              body: `№${o.id} — ${o.customer_name}, ${o.total} ₽`,
              icon: '/favicon.ico',
            });
          }
        }
      }
    }
  };

  useEffect(() => {
    if (!isAuth) return;
    const interval = setInterval(() => loadOrders(), 30000);
    return () => clearInterval(interval);
  }, [isAuth, token]);

  const loadProducts = async () => {
    const data = await api('list', {}, token);
    if (data.products) setProducts(data.products);
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    const res = await fetch(REVIEWS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token || '' }, body: JSON.stringify({ action: 'admin_list' }) });
    const data = await res.json();
    if (data.reviews) setAdminReviews(data.reviews);
    setReviewsLoading(false);
  };

  const loadSettings = async () => {
    const data = await api('get_settings', {}, token);
    if (data.settings) {
      setSettings(data.settings);
      if (data.settings.wholesale_qty_default) setWholesaleQtyDefault(data.settings.wholesale_qty_default);
      if (data.settings.wholesale_qty_heavy) setWholesaleQtyHeavy(data.settings.wholesale_qty_heavy);
      if (data.settings.store_images) {
        try { setStoreImages(JSON.parse(data.settings.store_images)); } catch { setStoreImages([]); }
      }
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
      composition: editing.composition || '',
      usage_instructions: editing.usage_instructions || '',
      wholesale_min_qty: Number(editing.wholesale_min_qty || 0),
    }, token);
    setSaving(false);
    showMsg('Сохранено!');
    loadProducts();
    closeEditor();
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
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-6 sm:mb-8">
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
          <button onClick={() => { setTab('reviews'); if (adminReviews.length === 0) loadReviews(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'reviews' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
            <Icon name="Star" size={14} />
            <span className="hidden sm:inline">Отзывы</span>
            {adminReviews.filter(r => !r.is_approved).length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {adminReviews.filter(r => !r.is_approved).length}
              </span>
            )}
          </button>
          <button onClick={() => setTab('portfolio')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'portfolio' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
            <Icon name="Images" size={14} /><span className="hidden sm:inline">Портфолио</span>
          </button>
        </div>
      </div>

      {tab === 'orders' && (
        <AdminOrders orders={orders} token={token} onRefresh={loadOrders} onMsg={showMsg} />
      )}

      {tab === 'products' && (
        <AdminProducts
          products={products}
          editing={editing}
          saving={saving}
          uploading={uploading}
          drawerOpen={drawerOpen}
          categories={categories}
          token={token}
          onSetProducts={setProducts}
          onOpenEditor={openEditor}
          onCloseEditor={closeEditor}
          onSetEditing={setEditing}
          onDelete={handleDelete}
          onSave={handleSave}
          onCreate={handleCreate}
          onMsg={showMsg}
          onSetUploading={setUploading}
        />
      )}

      {(tab === 'socials' || tab === 'users' || tab === 'reviews') && (
        <AdminSettings
          tab={tab}
          token={token}
          settings={settings}
          wholesaleQtyDefault={wholesaleQtyDefault}
          wholesaleQtyHeavy={wholesaleQtyHeavy}
          categories={categories}
          newCategory={newCategory}
          savingSettings={savingSettings}
          storeImages={storeImages}
          uploadingStore={uploadingStore}
          users={users}
          adminReviews={adminReviews}
          reviewsLoading={reviewsLoading}
          onSetSettings={setSettings}
          onSetWholesaleDefault={setWholesaleQtyDefault}
          onSetWholesaleHeavy={setWholesaleQtyHeavy}
          onSetNewCategory={setNewCategory}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onSaveSettings={handleSaveSettings}
          onSetStoreImages={setStoreImages}
          onSetUploadingStore={setUploadingStore}
          onLoadUsers={loadUsers}
          onLoadReviews={loadReviews}
          onSetAdminReviews={setAdminReviews}
          onMsg={showMsg}
        />
      )}

      {tab === 'portfolio' && (
        <AdminPortfolio token={token} onMsg={showMsg} />
      )}
    </div>
  );
}