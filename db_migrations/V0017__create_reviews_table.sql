CREATE TABLE t_p42509991_yandex_maps_integrat.reviews (
  id serial PRIMARY KEY,
  author_name varchar(100) NOT NULL,
  city varchar(100) NOT NULL DEFAULT '',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text text NOT NULL,
  product varchar(255) NOT NULL DEFAULT '',
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);