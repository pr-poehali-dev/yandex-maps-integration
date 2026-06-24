export const ADMIN_URL = 'https://functions.poehali.dev/d0783820-5c61-485a-8950-26c45aaa030c';
export const ORDERS_URL = 'https://functions.poehali.dev/b3cf2e84-45d2-47ff-96ce-48cfa7aa5fbd';
export const REVIEWS_URL = 'https://functions.poehali.dev/75ddc432-88b5-419f-b6f5-ab2422e5f049';
export const STATIC_CATEGORIES = ['Товары для дома', 'Снеки', 'Напитки', 'Канцелярия', 'Игрушки', 'Косметика', 'Тяжёлая техника'];
export const BADGES = ['', 'Хит', 'Новинка', 'Скидка'];

export type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  wholesale: number;
  rating: number;
  image: string;
  badge: string | null;
  description?: string;
  composition?: string;
  usage_instructions?: string;
  sort_order?: number;
  wholesale_min_qty?: number;
};

export type Settings = { social_instagram: string; social_youtube: string; social_telegram: string; social_max: string };

export type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  city: string;
  street: string;
  apartment: string;
  entrance: string;
  floor: string;
  zip: string;
  comment: string;
  delivery_service: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: { name: string; price: number; qty: number }[];
};

export type AdminReview = {
  id: number;
  author_name: string;
  city: string;
  rating: number;
  text: string;
  product: string;
  is_approved: boolean;
  created_at: string;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  card_type: string;
  discount_percent: number;
  total_purchases: number;
};

export const DELIVERY_LABELS: Record<string, string> = {
  yandex: '⚡ Яндекс Доставка',
  courier: '🚚 Курьер',
  post: '📮 Почта РФ',
};

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:       { label: 'Новый',       color: 'bg-blue-100 text-blue-700' },
  confirmed: { label: 'Подтверждён', color: 'bg-emerald-100 text-emerald-700' },
  shipped:   { label: 'Отправлен',   color: 'bg-orange-100 text-orange-700' },
  delivered: { label: 'Доставлен',   color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Отменён',     color: 'bg-red-100 text-red-600' },
};

export async function api(action: string, body: object = {}, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['X-Admin-Token'] = token;
  const res = await fetch(ADMIN_URL, { method: 'POST', headers, body: JSON.stringify({ action, ...body }) });
  return res.json();
}
