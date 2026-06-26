CREATE TABLE IF NOT EXISTS service_tabs (
  id SERIAL PRIMARY KEY,
  key VARCHAR(64) NOT NULL UNIQUE,
  label VARCHAR(128) NOT NULL,
  emoji VARCHAR(16) NOT NULL DEFAULT '⭐',
  description TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_items (
  id SERIAL PRIMARY KEY,
  tab_key VARCHAR(64) NOT NULL,
  title VARCHAR(128) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price VARCHAR(64) NOT NULL DEFAULT '',
  icon VARCHAR(64) NOT NULL DEFAULT 'Star',
  color VARCHAR(128) NOT NULL DEFAULT 'bg-primary/10 text-primary',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO service_tabs (key, label, emoji, description, sort_order) VALUES
  ('balloons', 'Шары на заказ', '🎈', 'Делаем букеты, арки, гирлянды и оформление залов. Доставка и монтаж по городу.', 0),
  ('cars', 'Прокат электромобилей', '🚗', 'Аренда электромобилей на праздники, мероприятия и прогулки. Дети в восторге!', 1),
  ('korea', 'Заказ из Кореи', '🇰🇷', 'Привозим всё из Кореи под заказ — косметику, одежду, снеки, аксессуары и многое другое.', 2)
ON CONFLICT (key) DO NOTHING;

INSERT INTO service_items (tab_key, title, description, price, icon, color, sort_order) VALUES
  ('balloons', 'Букеты из шаров', 'Под любой повод — день рождения, свадьба, выписка, юбилей', 'от 500 ₽', 'Smile', 'bg-pink-500/10 text-pink-500', 0),
  ('balloons', 'Арки и гирлянды', 'Украсим зал аркой или органической гирляндой в любой гамме', 'от 2 500 ₽', 'Sparkles', 'bg-purple-500/10 text-purple-500', 1),
  ('balloons', 'Цифры и буквы', 'Фольгированные цифры и буквы, доставка и сборка', 'от 300 ₽/шт', 'Star', 'bg-yellow-500/10 text-yellow-500', 2),
  ('balloons', 'Оформление зала', 'Полное оформление — корпоративы, свадьбы, детские праздники', 'от 5 000 ₽', 'Gift', 'bg-blue-500/10 text-blue-500', 3),
  ('cars', 'Прокат на праздник', 'Электромобиль на день рождения или детское мероприятие', 'от 1 500 ₽/час', 'Car', 'bg-blue-500/10 text-blue-500', 0),
  ('cars', 'Почасовая аренда', 'Берём в аренду на нужное количество часов', 'договорная', 'Clock', 'bg-green-500/10 text-green-500', 1),
  ('cars', 'Выезд к вам', 'Привозим электромобиль на место проведения праздника', 'включено', 'MapPin', 'bg-orange-500/10 text-orange-500', 2),
  ('korea', 'K-Beauty косметика', 'Корейская косметика — уходовая, декоративная, для волос', 'от 500 ₽', 'Sparkles', 'bg-pink-500/10 text-pink-500', 0),
  ('korea', 'Одежда и мода', 'Трендовая корейская одежда и аксессуары', 'от 1 000 ₽', 'ShoppingBag', 'bg-purple-500/10 text-purple-500', 1),
  ('korea', 'Снеки и продукты', 'Корейские снеки, напитки, сладости, рамен', 'от 300 ₽', 'Cookie', 'bg-yellow-500/10 text-yellow-500', 2),
  ('korea', 'Любой товар под заказ', 'Найдём и привезём всё, что найдёте на корейских сайтах', 'по запросу', 'Package', 'bg-blue-500/10 text-blue-500', 3);