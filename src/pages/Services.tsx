import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const PORTFOLIO = [
  {
    id: 1,
    title: 'Букет из шаров',
    description: 'Яркие букеты из фольгированных и латексных шаров для любого праздника',
    image: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/91998896-273a-4d63-b08b-0c6afcd194fd.jpg',
    tag: 'Букеты',
  },
  {
    id: 2,
    title: 'Свадебная арка',
    description: 'Роскошные арки из шаров в бело-золотой гамме для свадебных церемоний',
    image: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/ef1a3342-ef5e-4bd7-a3df-2ca0bfbc5a63.jpg',
    tag: 'Свадьба',
  },
  {
    id: 3,
    title: 'Цифры и буквы',
    description: 'Фольгированные цифры и буквы — идеально для юбилея или дня рождения',
    image: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/ce713d17-254a-4cba-b938-84571d61820e.jpg',
    tag: 'Цифры',
  },
  {
    id: 4,
    title: 'Детский праздник',
    description: 'Яркие колонны и гирлянды из шаров для детских дней рождения',
    image: 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/648e1270-c23d-4510-b96f-21aa246155ee.jpg',
    tag: 'Дети',
  },
];

const SERVICES = [
  {
    icon: 'Balloon' as const,
    fallback: 'Smile' as const,
    title: 'Букеты из шаров',
    description: 'Составим уникальный букет под любой повод — день рождения, свадьба, выписка, юбилей',
    price: 'от 500 ₽',
    color: 'bg-pink-500/10 text-pink-500',
  },
  {
    icon: 'Sparkles' as const,
    fallback: 'Sparkles' as const,
    title: 'Арки и гирлянды',
    description: 'Украсим зал аркой или органической гирляндой из шаров в любой цветовой гамме',
    price: 'от 2 500 ₽',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    icon: 'Star' as const,
    fallback: 'Star' as const,
    title: 'Цифры и буквы',
    description: 'Фольгированные цифры и буквы на любой праздник, доставка и сборка',
    price: 'от 300 ₽/шт',
    color: 'bg-yellow-500/10 text-yellow-500',
  },
  {
    icon: 'Gift' as const,
    fallback: 'Gift' as const,
    title: 'Оформление зала',
    description: 'Полное оформление пространства шарами — корпоративы, свадьбы, детские праздники',
    price: 'от 5 000 ₽',
    color: 'bg-blue-500/10 text-blue-500',
  },
];

export default function Services() {
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<typeof PORTFOLIO[0] | null>(null);

  const openWhatsapp = () => {
    window.open('https://wa.me/', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Хедер */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="container flex items-center justify-between h-14 py-3">
          <button onClick={() => navigate('/')} className="font-display font-black text-2xl gradient-text tracking-tight">
            Се-Се 谢谢
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <Icon name="ShoppingBag" size={15} />
              Каталог
            </button>
            <Button className="gradient-brand text-white rounded-full px-5 hover:opacity-90" onClick={openWhatsapp}>
              Заказать
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container pt-12 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-5">
          <Icon name="Sparkles" size={14} />
          Шары на заказ
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl mb-4 leading-tight">
          Украсим твой<br />
          <span className="gradient-text">праздник шарами</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
          Делаем букеты, арки, гирлянды и оформление залов. Доставка и монтаж по городу.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button className="gradient-brand text-white rounded-full px-8 h-12 text-base hover:opacity-90" onClick={openWhatsapp}>
            <Icon name="MessageCircle" size={18} />
            Обсудить заказ
          </Button>
          <Button variant="outline" className="rounded-full px-8 h-12 text-base" onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}>
            Портфолио
          </Button>
        </div>
      </section>

      {/* Услуги */}
      <section className="container pb-12">
        <h2 className="font-display font-black text-2xl mb-6">Что мы делаем</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-card border border-border rounded-2xl p-5 flex gap-4 hover:border-primary/40 transition-colors">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <Icon name={s.icon} fallback={s.fallback} size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm">{s.title}</span>
                  <span className="text-xs font-bold text-primary whitespace-nowrap">{s.price}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Портфолио */}
      <section id="portfolio" className="container pb-16">
        <h2 className="font-display font-black text-2xl mb-2">Портфолио</h2>
        <p className="text-muted-foreground text-sm mb-6">Наши работы — шары на заказ</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PORTFOLIO.map((p) => (
            <button key={p.id} onClick={() => setSelectedPhoto(p)}
              className="group relative rounded-2xl overflow-hidden aspect-square bg-muted hover:ring-2 hover:ring-primary transition-all">
              <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <span className="text-white font-semibold text-sm">{p.title}</span>
                <span className="text-white/70 text-xs">{p.tag}</span>
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">{p.tag}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-16">
        <div className="gradient-brand rounded-3xl p-8 text-center text-white">
          <h2 className="font-display font-black text-2xl mb-2">Готовы украсить ваш праздник?</h2>
          <p className="text-white/80 mb-6">Напишите нам — рассчитаем стоимость и подберём оформление</p>
          <Button className="bg-white text-primary rounded-full px-10 h-12 text-base font-semibold hover:bg-white/90" onClick={openWhatsapp}>
            <Icon name="MessageCircle" size={18} />
            Написать в WhatsApp
          </Button>
        </div>
      </section>

      {/* Лайтбокс */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-lg w-full bg-card rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={selectedPhoto.image} alt={selectedPhoto.title} className="w-full aspect-square object-cover" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-lg">{selectedPhoto.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{selectedPhoto.description}</p>
                </div>
                <button onClick={() => setSelectedPhoto(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon name="X" size={14} />
                </button>
              </div>
              <Button className="gradient-brand text-white rounded-full w-full mt-4 hover:opacity-90" onClick={openWhatsapp}>
                Заказать такое же
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
