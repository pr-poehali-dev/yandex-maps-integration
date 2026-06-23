INSERT INTO t_p42509991_yandex_maps_integrat.site_settings (key, value)
VALUES ('wholesale_qty_default', '50'), ('wholesale_qty_heavy', '5')
ON CONFLICT (key) DO NOTHING;