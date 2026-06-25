import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const PORTFOLIO_URL = 'https://functions.poehali.dev/acfbb8b1-ffd6-45db-935f-f7591b6d5c04';
const MAX_URL = 'https://web.max.ru/89161433232';

type Photo = { id: number; service_type: string; title: string; description: string; image_url: string };
type ServiceTab = 'balloons' | 'cars' | 'korea';

const TABS: { key: ServiceTab; label: string; emoji: string }[] = [
  { key: 'balloons', label: 'Шары на заказ', emoji: '🎈' },
  { key: 'cars', label: 'Прокат электромобилей', emoji: '🚗' },
  { key: 'korea', label: 'Заказ из Кореи', emoji: '🇰🇷' },
];

const TAB_INFO: Record<ServiceTab, {
  title: string;
  desc: string;
  services: { title: string; desc: string; price: string; color: string; icon: string }[];
}> = {
  balloons: {
    title: 'Шары на заказ',
    desc: 'Делаем букеты, арки, гирлянды и оформление залов. Доставка и монтаж по городу.',
    services: [
      { icon: 'Smile', title: 'Букеты из шаров', desc: 'Под любой повод — день рождения, свадьба, выписка, юбилей', price: 'от 500 ₽', color: 'bg-pink-500/10 text-pink-500' },
      { icon: 'Sparkles', title: 'Арки и гирлянды', desc: 'Украсим зал аркой или органической гирляндой в любой гамме', price: 'от 2 500 ₽', color: 'bg-purple-500/10 text-purple-500' },
      { icon: 'Star', title: 'Цифры и буквы', desc: 'Фольгированные цифры и буквы, доставка и сборка', price: 'от 300 ₽/шт', color: 'bg-yellow-500/10 text-yellow-500' },
      { icon: 'Gift', title: 'Оформление зала', desc: 'Полное оформление — корпоративы, свадьбы, детские праздники', price: 'от 5 000 ₽', color: 'bg-blue-500/10 text-blue-500' },
    ],
  },
  cars: {
    title: 'Прокат детских электромобилей',
    desc: 'Аренда электромобилей на праздники, мероприятия и прогулки. Дети в восторге!',
    services: [
      { icon: 'Car', title: 'Прокат на праздник', desc: 'Электромобиль на день рождения или детское мероприятие', price: 'от 1 500 ₽/час', color: 'bg-blue-500/10 text-blue-500' },
      { icon: 'Clock', title: 'Почасовая аренда', desc: 'Берём в аренду на нужное количество часов', price: 'договорная', color: 'bg-green-500/10 text-green-500' },
      { icon: 'MapPin', title: 'Выезд к вам', desc: 'Привозим электромобиль на место проведения праздника', price: 'включено', color: 'bg-orange-500/10 text-orange-500' },
    ],
  },
  korea: {
    title: 'Заказ из Кореи',
    desc: 'Привозим всё из Кореи под заказ — косметику, одежду, снеки, аксессуары и многое другое.',
    services: [
      { icon: 'Sparkles', title: 'K-Beauty косметика', desc: 'Корейская косметика — уходовая, декоративная, для волос', price: 'от 500 ₽', color: 'bg-pink-500/10 text-pink-500' },
      { icon: 'ShoppingBag', title: 'Одежда и мода', desc: 'Трендовая корейская одежда и аксессуары', price: 'от 1 000 ₽', color: 'bg-purple-500/10 text-purple-500' },
      { icon: 'Cookie', title: 'Снеки и продукты', desc: 'Корейские снеки, напитки, сладости, рамен', price: 'от 300 ₽', color: 'bg-yellow-500/10 text-yellow-500' },
      { icon: 'Package', title: 'Любой товар под заказ', desc: 'Найдём и привезём всё, что найдёте на корейских сайтах', price: 'по запросу', color: 'bg-blue-500/10 text-blue-500' },
    ],
  },
};

export default function Services() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ServiceTab>('balloons');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    setPhotos([]);
    fetch(PORTFOLIO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', service_type: tab }),
    })
      .then(r => r.json())
      .then(d => { if (d.photos) setPhotos(d.photos); });
  }, [tab]);

  const info = TAB_INFO[tab];

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
            <a href={MAX_URL} target="_blank" rel="noopener noreferrer">
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
          Шары, прокат электромобилей и заказ из Кореи — всё в одном месте
        </p>
      </section>

      {/* Табы */}
      <section className="container pb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-2xl border font-medium transition-all text-left ${tab === t.key ? 'gradient-brand text-white border-transparent shadow-lg' : 'bg-card border-border hover:border-primary/40 text-foreground'}`}>
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-sm font-semibold leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Контент раздела */}
      <section className="container pb-16">
        <div className="mb-6">
          <h2 className="font-display font-black text-2xl mb-1">{info.title}</h2>
          <p className="text-muted-foreground">{info.desc}</p>
        </div>

        {/* Карточки услуг */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {info.services.map(s => (
            <div key={s.title} className="bg-card border border-border rounded-2xl p-5 flex gap-4 hover:border-primary/40 transition-colors">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <Icon name={s.icon} fallback="Star" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm">{s.title}</span>
                  <span className="text-xs font-bold text-primary whitespace-nowrap">{s.price}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

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
          <p className="text-white/80 mb-6">Напишите Максу — обсудим детали и рассчитаем стоимость</p>
          <a href={MAX_URL} target="_blank" rel="noopener noreferrer">
            <Button className="bg-white text-primary rounded-full px-10 h-12 text-base font-semibold hover:bg-white/90">
              <Icon name="MessageCircle" size={18} />
              Написать Максу
            </Button>
          </a>
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
              <a href={MAX_URL} target="_blank" rel="noopener noreferrer">
                <Button className="gradient-brand text-white rounded-full w-full mt-4 hover:opacity-90">
                  Заказать такое же у Макса
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}