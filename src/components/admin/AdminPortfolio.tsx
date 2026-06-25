import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const PORTFOLIO_URL = 'https://functions.poehali.dev/acfbb8b1-ffd6-45db-935f-f7591b6d5c04';

type Photo = { id: number; service_type: string; title: string; description: string; image_url: string };
type ServiceType = 'balloons' | 'cars' | 'korea';

const TABS: { key: ServiceType; label: string; emoji: string }[] = [
  { key: 'balloons', label: 'Шары', emoji: '🎈' },
  { key: 'cars', label: 'Электромобили', emoji: '🚗' },
  { key: 'korea', label: 'Корея', emoji: '🇰🇷' },
];

interface Props {
  token: string;
  onMsg: (msg: string) => void;
}

export default function AdminPortfolio({ token, onMsg }: Props) {
  const [tab, setTab] = useState<ServiceType>('balloons');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const loadPhotos = async (type: ServiceType) => {
    setLoading(true);
    const res = await fetch(PORTFOLIO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', service_type: type }),
    });
    const data = await res.json();
    if (data.photos) setPhotos(data.photos);
    setLoading(false);
  };

  useEffect(() => { loadPhotos(tab); }, [tab]);

  const handleUpload = async (file: File) => {
    if (!newTitle.trim()) { onMsg('Введите название фото'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = (e.target?.result as string);
      const res = await fetch(PORTFOLIO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ action: 'upload_photo', service_type: tab, title: newTitle.trim(), description: newDesc.trim(), image: b64 }),
      });
      const data = await res.json();
      setUploading(false);
      if (data.success) {
        onMsg('Фото добавлено!');
        setNewTitle('');
        setNewDesc('');
        loadPhotos(tab);
      } else {
        onMsg(data.error || 'Ошибка загрузки');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить фото?')) return;
    const res = await fetch(PORTFOLIO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ action: 'delete_photo', id }),
    });
    const data = await res.json();
    if (data.success) {
      onMsg('Фото удалено');
      setPhotos(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="px-4 py-4">
      <h2 className="font-display font-bold text-xl mb-4">Портфолио услуг</h2>

      {/* Табы */}
      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${tab === t.key ? 'gradient-brand text-white border-transparent' : 'bg-card border-border text-muted-foreground hover:border-primary'}`}>
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Форма добавления */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-5">
        <p className="text-sm font-semibold mb-3">Добавить фото</p>
        <div className="space-y-2 mb-3">
          <Input placeholder="Название *" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="h-10 rounded-xl" />
          <Input placeholder="Описание (необязательно)" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="h-10 rounded-xl" />
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); e.target.value = ''; }} />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="gradient-brand text-white rounded-full h-10 px-5 hover:opacity-90 w-full">
          {uploading ? <><Icon name="Loader2" size={15} className="animate-spin mr-2" />Загружаю...</> : <><Icon name="Upload" size={15} className="mr-2" />Выбрать и загрузить фото</>}
        </Button>
      </div>

      {/* Список фото */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground">
          <Icon name="Loader2" size={28} className="mx-auto animate-spin mb-2" />
          <p className="text-sm">Загружаю...</p>
        </div>
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
                <button onClick={() => handleDelete(p.id)}
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
    </div>
  );
}
