CREATE TABLE IF NOT EXISTS portfolio_photos (
  id SERIAL PRIMARY KEY,
  service_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO portfolio_photos (service_type, title, description, image_url, sort_order) VALUES
('balloons', 'Букет из шаров', 'Яркие букеты из фольгированных и латексных шаров', 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/91998896-273a-4d63-b08b-0c6afcd194fd.jpg', 1),
('balloons', 'Свадебная арка', 'Роскошные арки из шаров в бело-золотой гамме', 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/ef1a3342-ef5e-4bd7-a3df-2ca0bfbc5a63.jpg', 2),
('balloons', 'Цифры и буквы', 'Фольгированные цифры и буквы на любой праздник', 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/ce713d17-254a-4cba-b938-84571d61820e.jpg', 3),
('balloons', 'Детский праздник', 'Яркие колонны и гирлянды из шаров', 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/648e1270-c23d-4510-b96f-21aa246155ee.jpg', 4),
('cars', 'Электромобиль на празднике', 'Прокат детских электромобилей на мероприятия', 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/7953629d-88dc-4618-ac69-da7e5b1b84b0.jpg', 1),
('cars', 'Электромобиль в парке', 'Аренда электромобилей для прогулок и праздников', 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/2c259ada-1512-429a-ae95-629fba1573a3.jpg', 2),
('korea', 'K-Beauty заказ', 'Корейская косметика и снеки под заказ', 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/54508baa-59f2-4ecc-9021-573e1d962012.jpg', 1),
('korea', 'Корейская мода', 'Одежда и аксессуары из Кореи', 'https://cdn.poehali.dev/projects/4a0f32a7-7749-40f9-9b07-447674c75bf3/files/1e4eef79-18dc-4340-952b-6cd7696039f3.jpg', 2);
