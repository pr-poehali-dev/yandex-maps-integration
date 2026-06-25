import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Settings, AdminReview, AdminUser, REVIEWS_URL, api } from './adminTypes';

interface Props {
  tab: 'socials' | 'users' | 'reviews';
  token: string;
  settings: Settings;
  wholesaleQtyDefault: string;
  wholesaleQtyHeavy: string;
  categories: { id: number; name: string }[];
  newCategory: string;
  savingSettings: boolean;
  storeImages: string[];
  uploadingStore: boolean;
  users: AdminUser[];
  adminReviews: AdminReview[];
  reviewsLoading: boolean;
  onSetSettings: (s: Settings) => void;
  onSetWholesaleDefault: (v: string) => void;
  onSetWholesaleHeavy: (v: string) => void;
  onSetNewCategory: (v: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id: number, name: string) => void;
  onSaveSettings: () => void;
  onSetStoreImages: (imgs: string[]) => void;
  onSetUploadingStore: (v: boolean) => void;
  onLoadUsers: () => void;
  onLoadReviews: () => void;
  onSetAdminReviews: (reviews: AdminReview[]) => void;
  onMsg: (msg: string) => void;
}

export default function AdminSettings({
  tab, token, settings, wholesaleQtyDefault, wholesaleQtyHeavy,
  categories, newCategory, savingSettings, storeImages, uploadingStore,
  users, adminReviews, reviewsLoading,
  onSetSettings, onSetWholesaleDefault, onSetWholesaleHeavy,
  onSetNewCategory, onAddCategory, onDeleteCategory, onSaveSettings,
  onSetStoreImages, onSetUploadingStore,
  onLoadUsers, onLoadReviews, onSetAdminReviews, onMsg,
}: Props) {
  const storeFileRef = useRef<HTMLInputElement>(null);

  const handleUploadStoreImage = async (file: File) => {
    onSetUploadingStore(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      const ext = file.name.split('.').pop() || 'jpg';
      const data = await api('upload_store_image', { image: base64, ext }, token);
      if (data.images) onSetStoreImages(data.images);
      onSetUploadingStore(false);
      onMsg('Фото добавлено!');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteStoreImage = async (url: string) => {
    const data = await api('delete_store_image', { url }, token);
    if (data.images) onSetStoreImages(data.images);
    onMsg('Фото удалено');
  };

  const handleApproveReview = async (id: number, approved: boolean) => {
    await fetch(REVIEWS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token || '' }, body: JSON.stringify({ action: 'admin_approve', id, approved }) });
    onSetAdminReviews(adminReviews.map(rv => rv.id === id ? { ...rv, is_approved: approved } : rv));
    onMsg(approved ? 'Отзыв опубликован!' : 'Отзыв скрыт');
  };

  const handleDeleteReview = async (id: number) => {
    await fetch(REVIEWS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token || '' }, body: JSON.stringify({ action: 'admin_delete', id }) });
    onSetAdminReviews(adminReviews.filter(rv => rv.id !== id));
    onMsg('Отзыв удалён');
  };

  if (tab === 'socials') return (
    <div className="px-4 py-5 space-y-4">
      <h2 className="font-display font-bold text-xl">Настройки</h2>

      {/* Категории */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-3">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Icon name="Tag" size={16} className="text-primary" />Категории товаров
        </h3>
        <div className="flex gap-2">
          <Input value={newCategory} onChange={e => onSetNewCategory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onAddCategory()}
            placeholder="Название новой категории" className="h-10 rounded-xl text-sm flex-1" />
          <Button className="gradient-brand text-white rounded-xl h-10 px-4 hover:opacity-90 flex-shrink-0" onClick={onAddCategory}>
            <Icon name="Plus" size={16} />
          </Button>
        </div>
        <div className="space-y-1.5">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-xl">
              <span className="text-sm font-medium">{cat.name}</span>
              <button onClick={() => onDeleteCategory(cat.id, cat.name)}
                className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Загрузка...</p>}
        </div>
      </div>

      {/* Оптовые пороги */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Icon name="BadgePercent" size={16} className="text-primary" />Оптовые пороги (мин. кол-во)
        </h3>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Обычные товары (шт.)</label>
          <Input type="number" value={wholesaleQtyDefault} onChange={e => onSetWholesaleDefault(e.target.value)} className="h-11 rounded-xl" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Тяжёлая техника (шт.)</label>
          <Input type="number" value={wholesaleQtyHeavy} onChange={e => onSetWholesaleHeavy(e.target.value)} className="h-11 rounded-xl" />
        </div>
      </div>

      {/* Контакты для заказов */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Icon name="Phone" size={16} className="text-primary" />Номера для связи (страница Услуги)
        </h3>
        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
            <Icon name="MessageCircle" size={12} /> Номер MAX (только цифры)
          </label>
          <Input value={settings.contact_max} onChange={e => onSetSettings({ ...settings, contact_max: e.target.value })}
            placeholder="89161433232" className="h-11 rounded-xl text-sm" />
          <p className="text-xs text-muted-foreground mt-1">Ссылка будет: web.max.ru/[номер]</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
            <Icon name="Phone" size={12} /> Номер WhatsApp (только цифры, с кодом страны)
          </label>
          <Input value={settings.contact_whatsapp} onChange={e => onSetSettings({ ...settings, contact_whatsapp: e.target.value })}
            placeholder="79161433232" className="h-11 rounded-xl text-sm" />
          <p className="text-xs text-muted-foreground mt-1">Ссылка будет: wa.me/[номер]</p>
        </div>
      </div>

      {/* Соцсети */}
      <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Icon name="Share2" size={16} className="text-primary" />Соцсети и мессенджеры
        </h3>
        {([
          { key: 'social_instagram', label: 'Instagram', icon: 'Instagram', placeholder: 'https://instagram.com/...' },
          { key: 'social_youtube', label: 'YouTube', icon: 'Youtube', placeholder: 'https://youtube.com/...' },
          { key: 'social_telegram', label: 'Telegram', icon: 'Send', placeholder: 'https://t.me/...' },
          { key: 'social_max', label: 'Max (ссылка соцсети)', icon: 'Tv', placeholder: 'https://web.max.ru/...' },
        ] as { key: keyof Settings; label: string; icon: string; placeholder: string }[]).map(s => (
          <div key={s.key}>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Icon name={s.icon} size={12} /> {s.label}
            </label>
            <Input value={settings[s.key]} onChange={e => onSetSettings({ ...settings, [s.key]: e.target.value })}
              placeholder={s.placeholder} className="h-11 rounded-xl text-sm" />
          </div>
        ))}
      </div>

      <Button className="w-full gradient-brand text-white rounded-full h-12 hover:opacity-90" onClick={onSaveSettings} disabled={savingSettings}>
        {savingSettings ? 'Сохраняю...' : 'Сохранить всё'}
      </Button>

      {/* Фото магазина */}
      <div className="mt-6 bg-muted/40 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base">Фото магазина</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Показываются в слайдере на главной странице</p>
          </div>
          <button onClick={() => storeFileRef.current?.click()} disabled={uploadingStore}
            className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50">
            <Icon name="Plus" size={15} />
            {uploadingStore ? 'Загрузка...' : 'Добавить фото'}
          </button>
          <input ref={storeFileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadStoreImage(f); e.target.value = ''; }} />
        </div>
        {storeImages.length === 0 ? (
          <div onClick={() => storeFileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary transition-colors">
            <Icon name="ImagePlus" size={32} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Нажмите, чтобы добавить первое фото</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {storeImages.map((url, i) => (
              <div key={url} className="relative group rounded-2xl overflow-hidden aspect-video bg-muted">
                <img src={url} alt={`Фото ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDeleteStoreImage(url)}
                    className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
                {i === 0 && <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">Главное</span>}
              </div>
            ))}
            <div onClick={() => storeFileRef.current?.click()}
              className="aspect-video border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <Icon name="Plus" size={24} className="text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Добавить</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (tab === 'users') return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-xl">Клиенты <span className="text-muted-foreground font-normal text-base">({users.length})</span></h2>
        <button onClick={onLoadUsers} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
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
            const cardLabels: Record<string, string> = { silver: 'Серебро', gold: 'Золото', diamond: 'Бриллиант' };
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
  );

  // tab === 'reviews'
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-xl">
          Отзывы <span className="text-muted-foreground font-normal text-base">({adminReviews.length})</span>
        </h2>
        <button onClick={onLoadReviews} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="RefreshCw" size={14} className={reviewsLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      {reviewsLoading && adminReviews.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="Loader2" size={32} className="mx-auto mb-3 opacity-40 animate-spin" />
          <p className="text-sm">Загружаем отзывы...</p>
        </div>
      ) : adminReviews.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="MessageSquare" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Отзывов пока нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[false, true].map(approved =>
            adminReviews.filter(r => r.is_approved === approved).map(r => (
              <div key={r.id} className={`bg-card border rounded-2xl p-4 space-y-3 ${!r.is_approved ? 'border-amber-300 bg-amber-50/30' : 'border-border'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {r.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.author_name}</p>
                      <p className="text-xs text-muted-foreground">{[r.city, r.product].filter(Boolean).join(' · ')} · {r.created_at}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {Array.from({length: 5}).map((_, i) => (
                      <Icon key={i} name="Star" size={12} className={i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">«{r.text}»</p>
                <div className="flex items-center gap-2 pt-1">
                  {r.is_approved ? (
                    <button onClick={() => handleApproveReview(r.id, false)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-amber-100 hover:text-amber-700 transition-colors">
                      <Icon name="EyeOff" size={13} /> Скрыть
                    </button>
                  ) : (
                    <button onClick={() => handleApproveReview(r.id, true)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                      <Icon name="CheckCircle2" size={13} /> Опубликовать
                    </button>
                  )}
                  <button onClick={() => handleDeleteReview(r.id)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors">
                    <Icon name="Trash2" size={13} /> Удалить
                  </button>
                  {!r.is_approved && (
                    <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">На модерации</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}