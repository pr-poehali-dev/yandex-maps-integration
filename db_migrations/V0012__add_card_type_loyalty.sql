ALTER TABLE t_p42509991_yandex_maps_integrat.discount_cards
  ADD COLUMN IF NOT EXISTS card_type VARCHAR(20) NOT NULL DEFAULT 'silver';

UPDATE t_p42509991_yandex_maps_integrat.discount_cards
SET card_type = CASE
  WHEN total_purchases >= 100000 THEN 'diamond'
  WHEN total_purchases >= 50000 THEN 'gold'
  ELSE 'silver'
END,
discount_percent = CASE
  WHEN total_purchases >= 100000 THEN 12
  WHEN total_purchases >= 50000 THEN 10
  ELSE 5
END;