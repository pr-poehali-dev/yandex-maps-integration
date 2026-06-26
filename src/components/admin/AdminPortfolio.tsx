import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const PORTFOLIO_URL = 'https://functions.poehali.dev/acfbb8b1-ffd6-45db-935f-f7591b6d5c04';

type Photo = { id: number; service_type: string; title: string; description: string; image_url: string };
type Tab = { id: number; key: string; label: string; emoji: string; description: string };
type ServiceItem = {
  id: number; tab_key: string; title: string; description: string;
  price: string; discount: string; duration: string;
  icon: string; color: string; image_url: string;
};

const EMPTY_ITEM = { title: '', description: '', price: '', discount: '', duration: '', icon: 'Star', color: 'bg-blue-500/10 text-blue-500', image_url: '' };

const COLOR_OPTIONS = [
  { label: 'Розовый', value: 'bg-pink-500/10 text-pink-500' },
  { label: 'Фиолетовый', value: 'bg-purple-500/10 text-purple-500' },
  { label: 'Жёлтый', value: 'bg-yellow-500/10 text-yellow-500' },
  { label: 'Синий', value: 'bg-blue-500/10 text-blue-500' },
  { label: 'Зелёный', value: 'bg-green-500/10 text-green-500' },
  { label: 'Оранжевый', value: 'bg-orange-500/10 text-orange-500' },
  { label: 'Красный', value: 'bg-red-500/10 text-red-500' },
  { label: 'Основной', value: 'bg-primary/10 text-primary' },
];

interface Props { token: string; onMsg: (msg: string) => void; }

export default function AdminPortfolio({ token, onMsg }: Props) {
  const [section, setSection] = useState<'services' | 'portfolio'>('services');

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [newTabLabel, setNewTabLabel] = useState('');
  const [newTabEmoji, setNewTabEmoji] = useState('⭐');
  const [newTabDesc, setNewTabDesc] = useState('');
  const [savingTab, setSavingTab] = useState(false);
  const [editTab, setEditTab] = useState<Tab | null>(null);

  const [newItem, setNewItem] = useState({ ...EMPTY_ITEM });
  const [savingItem, setSavingItem] = useState(false);
  const [editItem, setEditItem] = useState<ServiceItem | null>(null);
  const [uploadingItemImg, setUploadingItemImg] = useState<number | null>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoTab, setPhotoTab] = useState('');
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const authHeader = { 'Content-Type': 'application/json', 'X-Admin-Token': token };

  const loadTabs = async () => {
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list_tabs' }) });
    const data = await res.json();
    if (data.tabs) {
      setTabs(data.tabs);
      if (!activeTab && data.tabs.length) setActiveTab(data.tabs[0].key);
      if (!photoTab && data.tabs.length) setPhotoTab(data.tabs[0].key);
    }
  };

  const loadItems = async (tabKey: string) => {
    if (!tabKey) return;
    setLoadingItems(true);
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list_items', tab_key: tabKey }) });
    const data = await res.json();
    if (data.items) setItems(data.items);
    setLoadingItems(false);
  };

  const loadPhotos = async (tabKey: string) => {
    if (!tabKey) return;
    setLoadingPhotos(true);
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list', service_type: tabKey }) });
    const data = await res.json();
    if (data.photos) setPhotos(data.photos);
    setLoadingPhotos(false);
  };

  useEffect(() => { loadTabs(); }, []);
  useEffect(() => { if (activeTab) loadItems(activeTab); }, [activeTab]);
  useEffect(() => { if (photoTab) loadPhotos(photoTab); }, [photoTab]);

  const handleCreateTab = async () => {
    if (!newTabLabel.trim()) { onMsg('Введите название'); return; }
    setSavingTab(true);
    const key = newTabLabel.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'create_tab', key, label: newTabLabel.trim(), emoji: newTabEmoji || '⭐', description: newTabDesc.trim() }) });
    const data = await res.json();
    setSavingTab(false);
    if (data.success) { onMsg('Категория добавлена!'); setNewTabLabel(''); setNewTabEmoji('⭐'); setNewTabDesc(''); loadTabs(); }
    else onMsg(data.error || 'Ошибка');
  };

  const handleUpdateTab = async () => {
    if (!editTab) return;
    await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'update_tab', id: editTab.id, label: editTab.label, emoji: editTab.emoji, description: editTab.description }) });
    onMsg('Категория обновлена!'); setEditTab(null); loadTabs();
  };

  const handleDeleteTab = async (tab: Tab) => {
    if (!confirm(`Удалить категорию "${tab.label}"?`)) return;
    await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'delete_tab', id: tab.id }) });
    onMsg('Категория удалена'); loadTabs(); if (activeTab === tab.key) setActiveTab('');
  };

  const handleCreateItem = async () => {
    if (!newItem.title.trim()) { onMsg('Введите название услуги'); return; }
    setSavingItem(true);
    const payload = { ...newItem, image_url: newItem.image_url.startsWith('data:') ? '' : newItem.image_url };
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'create_item', tab_key: activeTab, ...payload }) });
    const data = await res.json();
    if (data.success && newItem.image_url.startsWith('data:')) {
      // Заливаем фото для только что созданной карточки
      const imgRes = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'upload_item_image', id: data.id, image: newItem.image_url }) });
      await imgRes.json();
    }
    setSavingItem(false);
    if (data.success) { onMsg('Услуга добавлена!'); setNewItem({ ...EMPTY_ITEM }); loadItems(activeTab); }
    else onMsg(data.error || 'Ошибка');
  };

  const handleUpdateItem = async () => {
    if (!editItem) return;
    await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'update_item', id: editItem.id, title: editItem.title, description: editItem.description, price: editItem.price, discount: editItem.discount, duration: editItem.duration, icon: editItem.icon, color: editItem.color, image_url: editItem.image_url }) });
    onMsg('Услуга обновлена!'); setEditItem(null); loadItems(activeTab);
  };

  const handleDeleteItem = async (item: ServiceItem) => {
    if (!confirm(`Удалить услугу "${item.title}"?`)) return;
    await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'delete_item', id: item.id }) });
    onMsg('Услуга удалена'); loadItems(activeTab);
  };

  const handleUploadItemImage = async (file: File, itemId: number) => {
    setUploadingItemImg(itemId);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = e.target?.result as string;
      const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'upload_item_image', id: itemId, image: b64 }) });
      const data = await res.json();
      setUploadingItemImg(null);
      if (data.success) {
        onMsg('Фото загружено!');
        if (editItem?.id === itemId) setEditItem(prev => prev ? { ...prev, image_url: data.image_url } : prev);
        loadItems(activeTab);
      } else onMsg(data.error || 'Ошибка');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async (file: File) => {
    if (!newPhotoTitle.trim()) { onMsg('Введите название фото'); return; }
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = e.target?.result as string;
      const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'upload_photo', service_type: photoTab, title: newPhotoTitle.trim(), description: newPhotoDesc.trim(), image: b64 }) });
      const data = await res.json();
      setUploadingPhoto(false);
      if (data.success) { onMsg('Фото добавлено!'); setNewPhotoTitle(''); setNewPhotoDesc(''); loadPhotos(photoTab); }
      else onMsg(data.error || 'Ошибка');
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async (id: number) => {
    if (!confirm('Удалить фото?')) return;
    await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'delete_photo', id }) });
    onMsg('Фото удалено'); setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Форма карточки услуги
  const ItemForm = ({ values, onChange, onSave, onCancel, saving, itemId }: {
    values: typeof EMPTY_ITEM;
    onChange: (v: typeof EMPTY_ITEM) => void;
    onSave: () => void;
    onCancel?: () => void;
    saving?: boolean;
    itemId?: number;
  }) => {
    const imgInputRef = useRef<HTMLInputElement>(null);
    return (
      <div className="space-y-2.5">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Название *</label>
          <Input value={values.title} onChange={e => onChange({ ...values, title: e.target.value })} placeholder="Название услуги" className="h-10 rounded-xl" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Описание</label>
          <textarea value={values.description} onChange={e => onChange({ ...values, description: e.target.value })}
            placeholder="Подробное описание..." rows={3}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Цена</label>
            <Input value={values.price} onChange={e => onChange({ ...values, price: e.target.value })} placeholder="от 500 ₽" className="h-10 rounded-xl" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Скидка / акция</label>
            <Input value={values.discount} onChange={e => onChange({ ...values, discount: e.target.value })} placeholder="-10% до 01.08" className="h-10 rounded-xl" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Срок выполнения</label>
          <Input value={values.duration} onChange={e => onChange({ ...values, duration: e.target.value })} placeholder="1-2 дня, от 2 часов..." className="h-10 rounded-xl" />
        </div>

        {/* Фото */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Фото услуги</label>
          {values.image_url ? (
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-muted">
              <img src={values.image_url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => onChange({ ...values, image_url: '' })}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                <Icon name="X" size={12} />
              </button>
            </div>
          ) : (
            <>
              <input ref={imgInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  e.target.value = '';
                  if (itemId) {
                    handleUploadItemImage(file, itemId);
                  } else {
                    const reader = new FileReader();
                    reader.onload = ev => onChange({ ...values, image_url: ev.target?.result as string });
                    reader.readAsDataURL(file);
                  }
                }} />
              <button onClick={() => imgInputRef.current?.click()}
                className="w-full h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors text-muted-foreground hover:text-primary">
                {uploadingItemImg === itemId ? <Icon name="Loader2" size={20} className="animate-spin" /> : <Icon name="ImagePlus" size={20} />}
                <span className="text-xs">{uploadingItemImg === itemId ? 'Загружаю...' : 'Добавить фото'}</span>
              </button>
            </>
          )}
        </div>

        {/* Цвет */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Цвет иконки</label>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_OPTIONS.map(c => (
              <button key={c.value} onClick={() => onChange({ ...values, color: c.value })}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${values.color === c.value ? 'border-primary ring-2 ring-primary/30' : 'border-border'} ${c.value}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button onClick={onSave} disabled={saving} className="gradient-brand text-white rounded-full h-10 px-5 hover:opacity-90 flex-1">
            {saving ? <><Icon name="Loader2" size={14} className="animate-spin mr-1" />Сохраняю...</> : 'Сохранить'}
          </Button>
          {onCancel && <Button onClick={onCancel} variant="outline" className="rounded-full h-10 px-4">Отмена</Button>}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="font-display font-bold text-xl">Управление услугами</h2>

      <div className="flex gap-2 bg-muted rounded-2xl p-1">
        <button onClick={() => setSection('services')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${section === 'services' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
          Категории и услуги
        </button>
        <button onClick={() => setSection('portfolio')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${section === 'portfolio' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
          Фото портфолио
        </button>
      </div>

      {/* ─── Категории и услуги ─────────────────────── */}
      {section === 'services' && (
        <>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <p className="text-sm font-semibold">Новая категория</p>
            <div className="flex gap-2">
              <Input value={newTabEmoji} onChange={e => setNewTabEmoji(e.target.value)} placeholder="⭐" className="h-10 rounded-xl w-16 text-center text-lg" />
              <Input value={newTabLabel} onChange={e => setNewTabLabel(e.target.value)} placeholder="Название *" className="h-10 rounded-xl flex-1"
                onKeyDown={e => e.key === 'Enter' && handleCreateTab()} />
            </div>
            <Input value={newTabDesc} onChange={e => setNewTabDesc(e.target.value)} placeholder="Описание категории" className="h-10 rounded-xl" />
            <Button onClick={handleCreateTab} disabled={savingTab} className="gradient-brand text-white rounded-full h-10 w-full hover:opacity-90">
              {savingTab ? <><Icon name="Loader2" size={14} className="animate-spin mr-1" />Сохраняю...</> : <><Icon name="Plus" size={14} className="mr-1" />Добавить категорию</>}
            </Button>
          </div>

          {tabs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeTab === t.key ? 'gradient-brand text-white border-transparent' : 'bg-card border-border text-muted-foreground hover:border-primary'}`}>
                  <span>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          )}

          {activeTab && (() => {
            const tab = tabs.find(t => t.key === activeTab);
            if (!tab) return null;
            return editTab?.id === tab.id ? (
              <div className="bg-card border border-primary/40 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Редактирование категории</p>
                <div className="flex gap-2">
                  <Input value={editTab.emoji} onChange={e => setEditTab({ ...editTab, emoji: e.target.value })} className="h-10 rounded-xl w-16 text-center text-lg" />
                  <Input value={editTab.label} onChange={e => setEditTab({ ...editTab, label: e.target.value })} className="h-10 rounded-xl flex-1" />
                </div>
                <Input value={editTab.description} onChange={e => setEditTab({ ...editTab, description: e.target.value })} placeholder="Описание" className="h-10 rounded-xl" />
                <div className="flex gap-2">
                  <Button onClick={handleUpdateTab} className="gradient-brand text-white rounded-full h-9 flex-1 hover:opacity-90">Сохранить</Button>
                  <Button onClick={() => setEditTab(null)} variant="outline" className="rounded-full h-9 flex-1">Отмена</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-2.5">
                <div>
                  <span className="font-semibold text-sm">{tab.emoji} {tab.label}</span>
                  {tab.description && <p className="text-xs text-muted-foreground mt-0.5">{tab.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditTab(tab)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary">
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button onClick={() => handleDeleteTab(tab)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:border-red-400 hover:text-red-500">
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
            );
          })()}

          {activeTab && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-sm font-semibold mb-3">Добавить услугу в «{tabs.find(t => t.key === activeTab)?.label}»</p>
              <ItemForm values={newItem} onChange={setNewItem} onSave={handleCreateItem} saving={savingItem} />
            </div>
          )}

          {loadingItems ? (
            <div className="text-center py-6"><Icon name="Loader2" size={24} className="mx-auto animate-spin text-muted-foreground" /></div>
          ) : items.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Услуги в категории</p>
              {items.map(item => (
                editItem?.id === item.id ? (
                  <div key={item.id} className="bg-card border border-primary/40 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">Редактирование</p>
                    <ItemForm
                      values={{ title: editItem.title, description: editItem.description, price: editItem.price, discount: editItem.discount, duration: editItem.duration, icon: editItem.icon, color: editItem.color, image_url: editItem.image_url }}
                      onChange={v => setEditItem({ ...editItem, ...v })}
                      onSave={handleUpdateItem}
                      onCancel={() => setEditItem(null)}
                      itemId={item.id}
                    />
                  </div>
                ) : (
                  <div key={item.id} className="bg-muted/50 rounded-xl overflow-hidden">
                    <div className="flex items-start gap-3 p-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                          <Icon name={item.icon} fallback="Star" size={18} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          {item.price && <span className="text-xs font-bold text-primary">{item.price}</span>}
                          {item.discount && <span className="text-xs text-green-600 font-semibold">{item.discount}</span>}
                          {item.duration && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Icon name="Clock" size={10} />{item.duration}</span>}
                        </div>
                        {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setEditItem(item)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary">
                          <Icon name="Pencil" size={13} />
                        </button>
                        <button onClick={() => handleDeleteItem(item)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:border-red-400 hover:text-red-500">
                          <Icon name="Trash2" size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Фото портфолио ─────────────────────────── */}
      {section === 'portfolio' && (
        <>
          <div className="flex flex-wrap gap-2">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setPhotoTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${photoTab === t.key ? 'gradient-brand text-white border-transparent' : 'bg-card border-border text-muted-foreground hover:border-primary'}`}>
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <p className="text-sm font-semibold">Добавить фото</p>
            <Input value={newPhotoTitle} onChange={e => setNewPhotoTitle(e.target.value)} placeholder="Название *" className="h-10 rounded-xl" />
            <Input value={newPhotoDesc} onChange={e => setNewPhotoDesc(e.target.value)} placeholder="Описание (необязательно)" className="h-10 rounded-xl" />
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleUploadPhoto(e.target.files[0]); e.target.value = ''; }} />
            <Button onClick={() => fileRef.current?.click()} disabled={uploadingPhoto} className="gradient-brand text-white rounded-full h-10 w-full hover:opacity-90">
              {uploadingPhoto ? <><Icon name="Loader2" size={15} className="animate-spin mr-2" />Загружаю...</> : <><Icon name="Upload" size={15} className="mr-2" />Выбрать и загрузить фото</>}
            </Button>
          </div>

          {loadingPhotos ? (
            <div className="text-center py-10"><Icon name="Loader2" size={28} className="mx-auto animate-spin text-muted-foreground" /></div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Images" size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Фото ещё нет</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map(p => (
                <div key={p.id} className="relative group rounded-2xl overflow-hidden aspect-square bg-muted">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <button onClick={() => handleDeletePhoto(p.id)} className="self-end w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                      <Icon name="Trash2" size={14} />
                    </button>
                    <p className="text-white font-semibold text-xs">{p.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
