import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const PORTFOLIO_URL = 'https://functions.poehali.dev/acfbb8b1-ffd6-45db-935f-f7591b6d5c04';
const ADMIN_URL = 'https://functions.poehali.dev/d0783820-5c61-485a-8950-26c45aaa030c';

type Photo = { id: number; service_type: string; title: string; description: string; image_url: string };
type Tab = { id: number; key: string; label: string; emoji: string; description: string };
type ServiceItem = { id: number; tab_key: string; title: string; description: string; price: string; discount: string; duration: string; icon: string; color: string; image_url: string };

export default function Services() {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [maxUrl, setMaxUrl] = useState('https://web.max.ru/89161433232');
  const [waUrl, setWaUrl] = useState('');

  // Загрузка настроек
  useEffect(() => {
    fetch(ADMIN_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get_settings' }) })
      .then(r => r.json())
      .then(d => {
        if (d.settings?.contact_max) setMaxUrl(`https://web.max.ru/${d.settings.contact_max}`);
        if (d.settings?.contact_whatsapp) setWaUrl(`https://wa.me/${d.settings.contact_whatsapp}`);
      });
  }, []);

  // Загрузка табов
  useEffect(() => {
    fetch(PORTFOLIO_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list_tabs' }) })
      .then(r => r.json())
      .then(d => {
        if (d.tabs?.length) {
          setTabs(d.tabs);
          setActiveTab(d.tabs[0].key);
        }
      });
  }, []);

  // Загрузка карточек и фото при смене таба
  useEffect(() => {
    if (!activeTab) return;
    fetch(PORTFOLIO_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list_items', tab_key: activeTab }) })
      .then(r => r.json()).then(d => { if (d.items) setItems(d.items); });
    setPhotos([]);
    fetch(PORTFOLIO_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list', service_type: activeTab }) })
      .then(r => r.json()).then(d => { if (d.photos) setPhotos(d.photos); });
  }, [activeTab]);

  const currentTab = tabs.find(t => t.key === activeTab);

  return (
    <div className="min-h-screen bg-background">
      {/* Хедер */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <button onClick={() => navigate('/')} className="font-display font-black text-2xl gradient-text tracking-tight">
            Се-Се 谢谢
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:flex items-center gap-1.5">
              <Icon name="ShoppingBag" size={15} />
              Каталог
            </button>
            <a href={maxUrl} target="_blank" rel="noopener noreferrer">
              <Button className="gradient-brand text-white rounded-full px-5 hover:opacity-90">
                Написать Максу
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container pt-10 pb-6 text-center">
        <h1 className="font-display font-black text-4xl md:text-5xl mb-3 leading-tight">
          Наши <span className="gradient-text">услуги</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {tabs.length > 0 ? tabs.map(t => t.label).join(', ') : 'Загружаю...'}
        </p>
      </section>

      {/* Табы */}
      {tabs.length > 0 && (
        <section className="container pb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-2xl border font-medium transition-all text-left ${activeTab === t.key ? 'gradient-brand text-white border-transparent shadow-lg' : 'bg-card border-border hover:border-primary/40 text-foreground'}`}>
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-sm font-semibold leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Контент */}
      <section className="container pb-16">
        {currentTab && (
          <div className="mb-6">
            <h2 className="font-display font-black text-2xl mb-1">{currentTab.label}</h2>
            {currentTab.description && <p className="text-muted-foreground">{currentTab.description}</p>}
          </div>
        )}

        {/* Карточки услуг */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {items.map(s => (
              <div key={s.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-colors">
                {s.image_url && (
                  <div className="w-full h-40 overflow-hidden">
                    <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 flex gap-3">
                  {!s.image_url && (
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                      <Icon name={s.icon} fallback="Star" size={22} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm">{s.title}</span>
                      {s.price && <span className="text-xs font-bold text-primary whitespace-nowrap">{s.price}</span>}
                    </div>
                    {s.description && <p className="text-xs text-muted-foreground leading-relaxed mb-2">{s.description}</p>}
                    <div className="flex flex-wrap gap-2">
                      {s.discount && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                          <Icon name="Tag" size={10} />{s.discount}
                        </span>
                      )}
                      {s.duration && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                          <Icon name="Clock" size={10} />{s.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Портфолио */}
        {photos.length > 0 && (
          <div className="mb-10">
            <h3 className="font-display font-bold text-xl mb-4">Портфолио</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.map(p => (
                <button key={p.id} onClick={() => setSelectedPhoto(p)}
                  className="group relative rounded-2xl overflow-hidden aspect-square bg-muted hover:ring-2 hover:ring-primary transition-all">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <span className="text-white font-semibold text-sm">{p.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="gradient-brand rounded-3xl p-8 text-center text-white">
          <h2 className="font-display font-black text-2xl mb-2">Готовы помочь!</h2>
          <p className="text-white/80 mb-6">Напишите нам — обсудим детали и рассчитаем стоимость</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={maxUrl} target="_blank" rel="noopener noreferrer">
              <Button className="bg-white text-primary rounded-full px-8 h-12 text-base font-semibold hover:bg-white/90 w-full sm:w-auto">
                <Icon name="MessageCircle" size={18} />
                Написать в MAX
              </Button>
            </a>
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-white/20 text-white border border-white/40 rounded-full px-8 h-12 text-base font-semibold hover:bg-white/30 w-full sm:w-auto">
                  <Icon name="Phone" size={18} />
                  WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Лайтбокс */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-lg w-full bg-card rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={selectedPhoto.image_url} alt={selectedPhoto.title} className="w-full aspect-square object-cover" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-lg">{selectedPhoto.title}</h3>
                  {selectedPhoto.description && <p className="text-muted-foreground text-sm mt-1">{selectedPhoto.description}</p>}
                </div>
                <button onClick={() => setSelectedPhoto(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon name="X" size={14} />
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <a href={maxUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="gradient-brand text-white rounded-full w-full hover:opacity-90">
                    Заказать в MAX
                  </Button>
                </a>
                {waUrl && (
                  <a href={waUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="rounded-full px-4 h-10">
                      <Icon name="Phone" size={16} />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}