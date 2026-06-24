ALTER TABLE t_p42509991_yandex_maps_integrat.products
  ADD COLUMN IF NOT EXISTS composition text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS usage_instructions text NOT NULL DEFAULT '';