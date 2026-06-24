import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Order, ORDERS_URL, DELIVERY_LABELS, STATUS_LABELS } from './adminTypes';

interface Props {
  orders: Order[];
  token: string;
  onRefresh: () => void;
  onMsg: (msg: string) => void;
}

type PayFilter = 'all' | 'pending' | 'paid';

export default function AdminOrders({ orders, token, onRefresh, onMsg }: Props) {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [payFilter, setPayFilter] = useState<PayFilter>('all');

  const updateOrderStatus = async (id: number, status: string) => {
    setUpdatingStatus(id);
    await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ action: 'update_status', id, status }),
    });
    setUpdatingStatus(null);
    onMsg('Статус обновлён!');
    onRefresh();
  };

  const updatePaymentStatus = async (id: number, payment_status: string) => {
    await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ action: 'update_payment_status', id, payment_status }),
    });
    onMsg(payment_status === 'paid' ? 'Оплата подтверждена!' : 'Статус оплаты сброшен');
    onRefresh();
  };

  const unpaidCount = orders.filter(o => o.payment_status !== 'paid').length;
  const paidCount = orders.filter(o => o.payment_status === 'paid').length;
  const filtered = orders.filter(o =>
    payFilter === 'all' ||
    (payFilter === 'paid' && o.payment_status === 'paid') ||
    (payFilter === 'pending' && o.payment_status !== 'paid')
  );

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-xl">
          Заказы <span className="text-muted-foreground font-normal text-base">({orders.length})</span>
        </h2>
        <button onClick={onRefresh} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="RefreshCw" size={14} />
        </button>
      </div>

      {orders.length > 0 && (
        <div className="flex gap-2 mb-3">
          {([
            { key: 'all' as PayFilter, label: `Все (${orders.length})`, color: '' },
            { key: 'pending' as PayFilter, label: `⏳ Не оплачено (${unpaidCount})`, color: unpaidCount > 0 ? 'text-yellow-700' : '' },
            { key: 'paid' as PayFilter, label: `✓ Оплачено (${paidCount})`, color: 'text-emerald-700' },
          ]).map(f => (
            <button key={f.key} onClick={() => setPayFilter(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${payFilter === f.key ? 'bg-primary text-white border-primary' : `border-border bg-card ${f.color} hover:border-primary`}`}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="ClipboardList" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Заказов пока нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => {
            const st = STATUS_LABELS[o.status] || { label: o.status, color: 'bg-muted text-muted-foreground' };
            const isExpanded = expandedOrder === o.id;
            return (
              <div key={o.id} className={`bg-card border rounded-2xl overflow-hidden transition-all ${o.status === 'new' ? 'border-blue-300' : 'border-border'}`}>
                <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpandedOrder(isExpanded ? null : o.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm">#{o.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      {o.status === 'new' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {o.payment_status === 'paid' ? '✓ Оплачен' : '⏳ Не оплачен'}
                      </span>
                    </div>
                    <p className="font-medium text-sm truncate">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_phone} · {o.city}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm">{o.total.toLocaleString('ru-RU')} ₽</p>
                    <p className="text-xs text-muted-foreground">{o.created_at}</p>
                  </div>
                  <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground flex-shrink-0" />
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 space-y-4">
                    <div className="pt-3 space-y-1">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.name} × {item.qty}</span>
                          <span className="font-medium">{(item.price * item.qty).toLocaleString('ru-RU')} ₽</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold pt-1 border-t border-border mt-1">
                        <span>Итого</span><span>{o.total.toLocaleString('ru-RU')} ₽</span>
                      </div>
                    </div>

                    <div className="bg-muted/40 rounded-xl p-3 space-y-1 text-sm">
                      <p className="font-medium">{o.customer_name} · <a href={`tel:${o.customer_phone}`} className="text-primary">{o.customer_phone}</a></p>
                      <p className="text-muted-foreground">
                        {o.city}, {o.street}
                        {o.entrance ? `, подъезд ${o.entrance}` : ''}
                        {o.floor ? `, эт. ${o.floor}` : ''}
                        {o.apartment ? `, кв. ${o.apartment}` : ''}
                        {o.zip ? ` (${o.zip})` : ''}
                      </p>
                      {o.comment && <p className="text-muted-foreground italic">💬 {o.comment}</p>}
                      <p className="text-xs text-muted-foreground">{DELIVERY_LABELS[o.delivery_service] || o.delivery_service}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2">Оплата</p>
                      <button
                        onClick={() => updatePaymentStatus(o.id, o.payment_status === 'paid' ? 'pending' : 'paid')}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'border-border bg-card hover:border-emerald-400 hover:text-emerald-600'}`}>
                        {o.payment_status === 'paid' ? '✓ Оплачен — сбросить' : 'Отметить оплаченным'}
                      </button>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2">Статус заказа</p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(STATUS_LABELS).map(([key, val]) => (
                          <button key={key}
                            disabled={o.status === key || updatingStatus === o.id}
                            onClick={() => updateOrderStatus(o.id, key)}
                            className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${o.status === key ? `${val.color} border-transparent` : 'border-border bg-card hover:border-primary disabled:opacity-40'}`}>
                            {updatingStatus === o.id && o.status !== key ? '...' : val.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
