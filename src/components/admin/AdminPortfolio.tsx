import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const PORTFOLIO_URL = 'https://functions.poehali.dev/acfbb8b1-ffd6-45db-935f-f7591b6d5c04';

type Photo = { id: number; service_type: string; title: string; description: string; image_url: string };
type Tab = { id: number; key: string; label: string; emoji: string; description: string };
type ServiceItem = { id: number; tab_key: string; title: string; description: string; price: string; icon: string; color: string };

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

interface Props {
  token: string;
  onMsg: (msg: string) => void;
}

export default function AdminPortfolio({ token, onMsg }: Props) {
  const [section, setSection] = useState<'services' | 'portfolio'>('services');

  // Табы и услуги
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Форма нового таба
  const [newTabLabel, setNewTabLabel] = useState('');
  const [newTabEmoji, setNewTabEmoji] = useState('⭐');
  const [newTabDesc, setNewTabDesc] = useState('');
  const [savingTab, setSavingTab] = useState(false);

  // Форма новой карточки
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemColor, setNewItemColor] = useState('bg-blue-500/10 text-blue-500');
  const [savingItem, setSavingItem] = useState(false);

  // Редактирование карточки
  const [editItem, setEditItem] = useState<ServiceItem | null>(null);

  // Редактирование таба
  const [editTab, setEditTab] = useState<Tab | null>(null);

  // Портфолио
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoTab, setPhotoTab] = useState('');
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const authHeader = { 'Content-Type': 'application/json', 'X-Admin-Token': token };

  // Загрузка табов
  const loadTabs = async () => {
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list_tabs' }) });
    const data = await res.json();
    if (data.tabs) {
      setTabs(data.tabs);
      if (!activeTab && data.tabs.length) setActiveTab(data.tabs[0].key);
      if (!photoTab && data.tabs.length) setPhotoTab(data.tabs[0].key);
    }
  };

  // Загрузка карточек услуг
  const loadItems = async (tabKey: string) => {
    if (!tabKey) return;
    setLoadingItems(true);
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list_items', tab_key: tabKey }) });
    const data = await res.json();
    if (data.items) setItems(data.items);
    setLoadingItems(false);
  };

  // Загрузка фото
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

  // Создать таб
  const handleCreateTab = async () => {
    if (!newTabLabel.trim()) { onMsg('Введите название категории'); return; }
    setSavingTab(true);
    const key = newTabLabel.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'create_tab', key, label: newTabLabel.trim(), emoji: newTabEmoji.trim() || '⭐', description: newTabDesc.trim() }) });
    const data = await res.json();
    setSavingTab(false);
    if (data.success) { onMsg('Категория добавлена!'); setNewTabLabel(''); setNewTabEmoji('⭐'); setNewTabDesc(''); loadTabs(); }
    else onMsg(data.error || 'Ошибка');
  };

  // Обновить таб
  const handleUpdateTab = async () => {
    if (!editTab) return;
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'update_tab', id: editTab.id, label: editTab.label, emoji: editTab.emoji, description: editTab.description }) });
    const data = await res.json();
    if (data.success) { onMsg('Категория обновлена!'); setEditTab(null); loadTabs(); }
    else onMsg(data.error || 'Ошибка');
  };

  // Удалить таб
  const handleDeleteTab = async (tab: Tab) => {
    if (!confirm(`Удалить категорию "${tab.label}"? Все карточки услуг в ней тоже будут скрыты.`)) return;
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'delete_tab', id: tab.id }) });
    const data = await res.json();
    if (data.success) { onMsg('Категория удалена'); loadTabs(); if (activeTab === tab.key) setActiveTab(''); }
    else onMsg(data.error || 'Ошибка');
  };

  // Создать карточку
  const handleCreateItem = async () => {
    if (!newItemTitle.trim()) { onMsg('Введите название услуги'); return; }
    setSavingItem(true);
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'create_item', tab_key: activeTab, title: newItemTitle.trim(), description: newItemDesc.trim(), price: newItemPrice.trim(), color: newItemColor }) });
    const data = await res.json();
    setSavingItem(false);
    if (data.success) { onMsg('Услуга добавлена!'); setNewItemTitle(''); setNewItemDesc(''); setNewItemPrice(''); loadItems(activeTab); }
    else onMsg(data.error || 'Ошибка');
  };

  // Обновить карточку
  const handleUpdateItem = async () => {
    if (!editItem) return;
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'update_item', id: editItem.id, title: editItem.title, description: editItem.description, price: editItem.price, icon: editItem.icon, color: editItem.color }) });
    const data = await res.json();
    if (data.success) { onMsg('Услуга обновлена!'); setEditItem(null); loadItems(activeTab); }
    else onMsg(data.error || 'Ошибка');
  };

  // Удалить карточку
  const handleDeleteItem = async (item: ServiceItem) => {
    if (!confirm(`Удалить услугу "${item.title}"?`)) return;
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'delete_item', id: item.id }) });
    const data = await res.json();
    if (data.success) { onMsg('Услуга удалена'); loadItems(activeTab); }
    else onMsg(data.error || 'Ошибка');
  };

  // Загрузить фото
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
      else onMsg(data.error || 'Ошибка загрузки');
    };
    reader.readAsDataURL(file);
  };

  // Удалить фото
  const handleDeletePhoto = async (id: number) => {
    if (!confirm('Удалить фото?')) return;
    const res = await fetch(PORTFOLIO_URL, { method: 'POST', headers: authHeader, body: JSON.stringify({ action: 'delete_photo', id }) });
    const data = await res.json();
    if (data.success) { onMsg('Фото удалено'); setPhotos(prev => prev.filter(p => p.id !== id)); }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="font-display font-bold text-xl">Управление услугами</h2>

      {/* Переключатель секций */}
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

      {/* ─── СЕКЦИЯ: Категории и услуги ─────────────────────────────────── */}
      {section === 'services' && (
        <>
          {/* Форма добавления категории */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold">Новая категория услуг</p>
            <div className="flex gap-2">
              <Input value={newTabEmoji} onChange={e => setNewTabEmoji(e.target.value)} placeholder="Эмодзи" className="h-10 rounded-xl w-20 text-center text-lg" />
              <Input value={newTabLabel} onChange={e => setNewTabLabel(e.target.value)} placeholder="Название категории *" className="h-10 rounded-xl flex-1"
                onKeyDown={e => e.key === 'Enter' && handleCreateTab()} />
            </div>
            <Input value={newTabDesc} onChange={e => setNewTabDesc(e.target.value)} placeholder="Описание категории" className="h-10 rounded-xl" />
            <Button onClick={handleCreateTab} disabled={savingTab} className="gradient-brand text-white rounded-full h-10 px-5 hover:opacity-90 w-full">
              {savingTab ? <><Icon name="Loader2" size={14} className="animate-spin mr-1" />Сохраняю...</> : <><Icon name="Plus" size={14} className="mr-1" />Добавить категорию</>}
            </Button>
          </div>

          {/* Список категорий */}
          {tabs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Категорий пока нет</p>
          ) : (
            <div className="space-y-3">
              {/* Табы выбора */}
              <div className="flex flex-wrap gap-2">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeTab === t.key ? 'gradient-brand text-white border-transparent' : 'bg-card border-border text-muted-foreground hover:border-primary'}`}>
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>

              {/* Редактирование выбранной категории */}
              {activeTab && (() => {
                const tab = tabs.find(t => t.key === activeTab);
                if (!tab) return null;
                return editTab?.id === tab.id ? (
                  <div className="bg-card border border-primary/40 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Редактирование категории</p>
                    <div className="flex gap-2">
                      <Input value={editTab.emoji} onChange={e => setEditTab({ ...editTab, emoji: e.target.value })} className="h-10 rounded-xl w-20 text-center text-lg" />
                      <Input value={editTab.label} onChange={e => setEditTab({ ...editTab, label: e.target.value })} className="h-10 rounded-xl flex-1" />
                    </div>
                    <Input value={editTab.description} onChange={e => setEditTab({ ...editTab, description: e.target.value })} placeholder="Описание" className="h-10 rounded-xl" />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateTab} className="gradient-brand text-white rounded-full h-9 px-4 hover:opacity-90 flex-1">Сохранить</Button>
                      <Button onClick={() => setEditTab(null)} variant="outline" className="rounded-full h-9 px-4 flex-1">Отмена</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-2.5">
                    <div>
                      <span className="font-semibold text-sm">{tab.emoji} {tab.label}</span>
                      {tab.description && <p className="text-xs text-muted-foreground mt-0.5">{tab.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditTab(tab)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors">
                        <Icon name="Pencil" size={13} />
                      </button>
                      <button onClick={() => handleDeleteTab(tab)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors">
                        <Icon name="Trash2" size={13} />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Форма добавления карточки */}
              {activeTab && (
                <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                  <p className="text-sm font-semibold">Добавить услугу в «{tabs.find(t => t.key === activeTab)?.label}»</p>
                  <Input value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} placeholder="Название услуги *" className="h-10 rounded-xl" />
                  <Input value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} placeholder="Описание" className="h-10 rounded-xl" />
                  <Input value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="Цена (например: от 500 ₽)" className="h-10 rounded-xl" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Цвет карточки</p>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button key={c.value} onClick={() => setNewItemColor(c.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${newItemColor === c.value ? 'border-primary ring-2 ring-primary/30' : 'border-border'} ${c.value}`}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleCreateItem} disabled={savingItem} className="gradient-brand text-white rounded-full h-10 px-5 hover:opacity-90 w-full">
                    {savingItem ? <><Icon name="Loader2" size={14} className="animate-spin mr-1" />Сохраняю...</> : <><Icon name="Plus" size={14} className="mr-1" />Добавить услугу</>}
                  </Button>
                </div>
              )}

              {/* Список карточек */}
              {loadingItems ? (
                <div className="text-center py-6"><Icon name="Loader2" size={24} className="mx-auto animate-spin text-muted-foreground" /></div>
              ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">В этой категории нет услуг</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Услуги в категории</p>
                  {items.map(item => (
                    editItem?.id === item.id ? (
                      <div key={item.id} className="bg-card border border-primary/40 rounded-2xl p-4 space-y-2">
                        <Input value={editItem.title} onChange={e => setEditItem({ ...editItem, title: e.target.value })} placeholder="Название *" className="h-10 rounded-xl" />
                        <Input value={editItem.description} onChange={e => setEditItem({ ...editItem, description: e.target.value })} placeholder="Описание" className="h-10 rounded-xl" />
                        <Input value={editItem.price} onChange={e => setEditItem({ ...editItem, price: e.target.value })} placeholder="Цена" className="h-10 rounded-xl" />
                        <div className="flex flex-wrap gap-2">
                          {COLOR_OPTIONS.map(c => (
                            <button key={c.value} onClick={() => setEditItem({ ...editItem, color: c.value })}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${editItem.color === c.value ? 'border-primary ring-2 ring-primary/30' : 'border-border'} ${c.value}`}>
                              {c.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateItem} className="gradient-brand text-white rounded-full h-9 px-4 hover:opacity-90 flex-1">Сохранить</Button>
                          <Button onClick={() => setEditItem(null)} variant="outline" className="rounded-full h-9 px-4 flex-1">Отмена</Button>
                        </div>
                      </div>
                    ) : (
                      <div key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-xl px-3 py-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                          <Icon name={item.icon} fallback="Star" size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.title}</p>
                          <p className="text-xs text-primary font-bold">{item.price}</p>
                          {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => setEditItem(item)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors">
                            <Icon name="Pencil" size={13} />
                          </button>
                          <button onClick={() => handleDeleteItem(item)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors">
                            <Icon name="Trash2" size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ─── СЕКЦИЯ: Фото портфолио ─────────────────────────────────────── */}
      {section === 'portfolio' && (
        <>
          {/* Выбор категории для фото */}
          <div className="flex flex-wrap gap-2">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setPhotoTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${photoTab === t.key ? 'gradient-brand text-white border-transparent' : 'bg-card border-border text-muted-foreground hover:border-primary'}`}>
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          {/* Форма добавления фото */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <p className="text-sm font-semibold">Добавить фото</p>
            <Input value={newPhotoTitle} onChange={e => setNewPhotoTitle(e.target.value)} placeholder="Название *" className="h-10 rounded-xl" />
            <Input value={newPhotoDesc} onChange={e => setNewPhotoDesc(e.target.value)} placeholder="Описание (необязательно)" className="h-10 rounded-xl" />
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleUploadPhoto(e.target.files[0]); e.target.value = ''; }} />
            <Button onClick={() => fileRef.current?.click()} disabled={uploadingPhoto}
              className="gradient-brand text-white rounded-full h-10 px-5 hover:opacity-90 w-full">
              {uploadingPhoto ? <><Icon name="Loader2" size={15} className="animate-spin mr-2" />Загружаю...</> : <><Icon name="Upload" size={15} className="mr-2" />Выбрать и загрузить фото</>}
            </Button>
          </div>

          {/* Фото-сетка */}
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
                    <button onClick={() => handleDeletePhoto(p.id)}
                      className="self-end w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                      <Icon name="Trash2" size={14} />
                    </button>
                    <div>
                      <p className="text-white font-semibold text-xs">{p.title}</p>
                      {p.description && <p className="text-white/70 text-xs mt-0.5 line-clamp-2">{p.description}</p>}
                    </div>
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
