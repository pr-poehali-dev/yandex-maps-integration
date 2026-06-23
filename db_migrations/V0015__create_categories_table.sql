CREATE TABLE t_p42509991_yandex_maps_integrat.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p42509991_yandex_maps_integrat.categories (name, sort_order) VALUES
  ('Товары для дома', 0),
  ('Снеки', 1),
  ('Напитки', 2),
  ('Канцелярия', 3),
  ('Игрушки', 4),
  ('Косметика', 5),
  ('Тяжёлая техника', 6)
ON CONFLICT (name) DO NOTHING;