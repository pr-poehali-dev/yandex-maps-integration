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
  sort_order?: number;
};

function SortableItem({ product, isActive, onClick, onDelete }: {
  product: Product;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}
      onClick={onClick}
    >
      <button {...attributes} {...listeners} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing flex-shrink-0" onClick={e => e.stopPropagation()}>
        <Icon name="GripVertical" size={16} />
      </button>
      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-muted" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.price.toLocaleString('ru-RU')} ₽</p>
      </div>
      <button onClick={e => { e.stopPropagation(); onDelete(); }}
        className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
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
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const isAuth = !!token;

  useEffect(() => {
    if (isAuth) loadProducts();
  }, [isAuth]);

  const loadProducts = async () => {
    const data = await api('list', {}, token);
    if (data.products) setProducts(data.products);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = products.findIndex(p => p.id === active.id);
    const newIndex = products.findIndex(p => p.id === over.id);
    const newOrder = arrayMove(products, oldIndex, newIndex);
    setProducts(newOrder);
    await api('reorder', { order: newOrder.map(p => p.id) }, token);
    setMsg('Порядок сохранён!');
    setTimeout(() => setMsg(''), 2000);
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
    }, token);
    setSaving(false);
    setMsg('Сохранено!');
    setTimeout(() => setMsg(''), 2000);
    loadProducts();
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
      if (data.image) setEditing({ ...editing, image: data.image });
      setUploading(false);
      setMsg('Фото обновлено!');
      setTimeout(() => setMsg(''), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    const data = await api('create', {
      name: 'Новый товар',
      category: 'Товары для дома',
      brand: '',
      price: 0,
      wholesale: 0,
      image: '',
    }, token);
    if (data.id) {
      await loadProducts();
      const fresh = products.find(p => p.id === data.id) || { id: data.id, name: 'Новый товар', category: 'Товары для дома', brand: '', price: 0, wholesale: 0, rating: 4.8, image: '', badge: null };
      setEditing(fresh as Product);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    await api('delete', { id }, token);
    if (editing?.id === id) setEditing(null);
    loadProducts();
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card border border-border rounded-3xl p-10 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="ShieldCheck" size={32} className="text-white" />
            </div>
            <h1 className="font-display font-black text-2xl">Админ-панель</h1>
            <p className="text-muted-foreground text-sm mt-1">Се-Се 谢谢</p>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="h-12 rounded-xl"
            />
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
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center">
              <Icon name="ShieldCheck" size={16} className="text-white" />
            </div>
            <span className="font-display font-black text-lg">Админ-панель</span>
          </div>
          <div className="flex items-center gap-3">
            {msg && <span className="text-sm text-emerald-600 font-medium">{msg}</span>}
            <Button variant="outline" className="rounded-full" onClick={() => { localStorage.removeItem('admin_token'); setToken(''); }}>
              <Icon name="LogOut" size={16} className="mr-2" /> Выйти
            </Button>
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← На сайт</a>
          </div>
        </div>
      </header>

      <div className="container py-8 grid lg:grid-cols-[320px_1fr] gap-8">
        {/* Список товаров */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl">Товары ({products.length})</h2>
            <Button size="sm" className="gradient-brand text-white rounded-full hover:opacity-90" onClick={handleCreate}>
              <Icon name="Plus" size={16} className="mr-1" /> Добавить
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Icon name="GripVertical" size={12} /> Перетащите для изменения порядка
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {products.map(p => (
                  <SortableItem
                    key={p.id}
                    product={p}
                    isActive={editing?.id === p.id}
                    onClick={() => setEditing({ ...p })}
                    onDelete={() => handleDelete(p.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Редактор */}
        {editing ? (
          <div className="bg-card border border-border rounded-3xl p-8">
            <h2 className="font-display font-bold text-2xl mb-6">Редактирование</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Фото */}
              <div>
                <p className="text-sm font-medium mb-3 text-muted-foreground">Фото товара</p>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border mb-3">
                  {editing.image
                    ? <img src={editing.image} alt={editing.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Icon name="ImageOff" size={48} /></div>
                  }
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-sm">Загружаю...</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Button variant="outline" className="w-full rounded-xl" onClick={() => fileRef.current?.click()}>
                  <Icon name="Upload" size={16} className="mr-2" /> Загрузить фото
                </Button>
              </div>

              {/* Поля */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Название</label>
                  <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="h-11 rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Бренд</label>
                  <Input value={editing.brand} onChange={e => setEditing({ ...editing, brand: e.target.value })} className="h-11 rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Категория</label>
                  <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1.5">Розничная цена ₽</label>
                    <Input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} className="h-11 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1.5">Оптовая цена ₽</label>
                    <Input type="number" value={editing.wholesale} onChange={e => setEditing({ ...editing, wholesale: Number(e.target.value) })} className="h-11 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Значок</label>
                  <div className="flex gap-2 flex-wrap">
                    {BADGES.map(b => (
                      <button key={b} onClick={() => setEditing({ ...editing, badge: b || null })}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${editing.badge === (b || null) ? 'gradient-brand text-white border-transparent' : 'border-border hover:border-primary'}`}>
                        {b || 'Нет'}
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full gradient-brand text-white rounded-full h-12 text-base hover:opacity-90 mt-2" onClick={handleSave} disabled={saving}>
                  {saving ? 'Сохраняю...' : 'Сохранить изменения'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-dashed border-border rounded-3xl flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Icon name="MousePointerClick" size={48} className="mx-auto mb-3" />
              <p>Выберите товар для редактирования</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}