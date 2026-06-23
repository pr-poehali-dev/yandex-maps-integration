CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

INSERT INTO site_settings (key, value) VALUES
  ('social_instagram', ''),
  ('social_youtube', ''),
  ('social_telegram', 'https://t.me/Chineshop1688'),
  ('social_max', 'https://web.max.ru/')
ON CONFLICT (key) DO NOTHING;