"""
Заказы: создание, список для админа, обновление статуса, история покупок.
Скидки (оптовая и по карте) считаются на фронте. Оплата через Т-Банк T-Kassa.
"""
import json
import os
import hashlib
import urllib.request
import urllib.error
import psycopg2


TBANK_API = 'https://securepay.tinkoff.ru/v2'


def tbank_token(params: dict, password: str) -> str:
    filtered = {k: v for k, v in params.items() if k not in ('Token', 'DATA', 'Receipt', 'Items')}
    filtered['Password'] = password
    sorted_vals = ''.join(str(v) for k, v in sorted(filtered.items()))
    return hashlib.sha256(sorted_vals.encode()).hexdigest()


def tbank_request(method: str, params: dict) -> dict:
    terminal_key = os.environ.get('TBANK_TERMINAL_KEY', '')
    password = os.environ.get('TBANK_PASSWORD', '')
    params['TerminalKey'] = terminal_key
    params['Token'] = tbank_token(params, password)
    data = json.dumps(params).encode()
    req = urllib.request.Request(f'{TBANK_API}/{method}', data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {'Success': False, 'Message': str(e)}


STATUSES = {
    'new': '🆕 Новый',
    'confirmed': '✅ Подтверждён',
    'shipped': '🚚 Отправлен',
    'delivered': '📦 Доставлен',
    'cancelled': '❌ Отменён',
}

# Уровни карт лояльности (не применяется к оптовым заказам)
CARD_LEVELS = [
    {'type': 'diamond', 'min': 100000, 'discount': 12, 'label': 'Бриллиантовая'},
    {'type': 'gold',    'min': 50000,  'discount': 10, 'label': 'Золотая'},
    {'type': 'silver',  'min': 0,      'discount': 5,  'label': 'Серебряная'},
]


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data: dict):
    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False)}


def err(msg: str, status: int = 400):
    return {'statusCode': status, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def get_card_level(total_purchases: int) -> dict:
    for level in CARD_LEVELS:
        if total_purchases >= level['min']:
            return level
    return CARD_LEVELS[-1]


def handler(event: dict, context) -> dict:
    """Создание заказа и управление заказами для админа."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token, X-Authorization',
            'Access-Control-Max-Age': '86400'
        }, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')
    admin_token = event.get('headers', {}).get('X-Admin-Token', '')
    admin_password = os.environ.get('ADMIN_PASSWORD', '')
    auth_token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')

    conn = get_conn()
    cur = conn.cursor()

    # Получить user_id по токену (если есть)
    user_id = None
    if auth_token:
        cur.execute("SELECT user_id FROM sessions WHERE token = %s AND expires_at > NOW()", (auth_token,))
        row = cur.fetchone()
        if row:
            user_id = row[0]

    # Создать заказ (публичный)
    if action == 'create':
        name = body.get('name', '').strip()
        phone = body.get('phone', '').strip()
        city = body.get('city', '').strip()
        street = body.get('street', '').strip()
        apartment = body.get('apartment', '').strip()
        entrance = body.get('entrance', '').strip()
        floor_ = body.get('floor', '').strip()
        zip_code = body.get('zip', '').strip()
        comment = body.get('comment', '').strip()
        delivery_service = body.get('delivery_service', 'courier').strip()
        items = body.get('items', [])
        total = int(body.get('total', 0))
        is_wholesale = body.get('is_wholesale', False)

        if not name or not phone or not city or not street or not items:
            cur.close(); conn.close()
            return err('Заполните все поля')

        # Скидка уже применена на фронте (оптовая или по карте лояльности)
        original_total = total

        cur.execute(
            "INSERT INTO orders (customer_name, customer_phone, address_city, address_street, address_apartment, address_entrance, address_floor, address_zip, comment, delivery_service, total, status, user_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'new',%s) RETURNING id",
            (name, phone, city, street, apartment, entrance, floor_, zip_code, comment, delivery_service, total, user_id)
        )
        order_id = cur.fetchone()[0]

        for item in items:
            cur.execute(
                "INSERT INTO order_items (order_id, product_id, product_name, price, qty) VALUES (%s,%s,%s,%s,%s)",
                (order_id, item.get('id', 0), item.get('name', ''), int(item.get('price', 0)), int(item.get('qty', 1)))
            )

        # Обновляем сумму покупок и уровень карты (только розница)
        if user_id and not is_wholesale:
            cur.execute("SELECT id, total_purchases FROM discount_cards WHERE user_id = %s", (user_id,))
            card_row = cur.fetchone()
            if card_row:
                new_total_purchases = card_row[1] + original_total
                new_level = get_card_level(new_total_purchases)
                cur.execute(
                    "UPDATE discount_cards SET total_purchases = %s, discount_percent = %s, card_type = %s WHERE id = %s",
                    (new_total_purchases, new_level['discount'], new_level['type'], card_row[0])
                )

        conn.commit()
        cur.close(); conn.close()
        return ok({'success': True, 'order_id': order_id, 'total': total})

    # История заказов пользователя
    if action == 'my_orders':
        if not user_id:
            cur.close(); conn.close()
            return err('Не авторизован', 401)

        cur.execute("SELECT id, total, status, payment_status, created_at, delivery_service, address_city, address_street FROM orders WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
        rows = cur.fetchall()

        orders = []
        for r in rows:
            cur.execute("SELECT product_name, price, qty FROM order_items WHERE order_id = %s", (r[0],))
            items = [{'name': i[0], 'price': i[1], 'qty': i[2]} for i in cur.fetchall()]
            orders.append({
                'id': r[0],
                'total': r[1],
                'status': r[2],
                'payment_status': r[3],
                'created_at': r[4].strftime('%d.%m.%Y %H:%M'),
                'delivery_service': r[5],
                'city': r[6],
                'street': r[7],
                'items': items,
            })

        cur.close(); conn.close()
        return ok({'orders': orders})

    # Список заказов (только для админа)
    if action == 'list':
        if admin_token != admin_password:
            cur.close(); conn.close()
            return err('Не авторизован', 401)

        cur.execute("SELECT id, customer_name, customer_phone, address_city, address_street, address_apartment, address_entrance, address_floor, address_zip, comment, delivery_service, total, status, created_at, payment_status FROM orders ORDER BY created_at DESC LIMIT 100")
        rows = cur.fetchall()

        orders = []
        for r in rows:
            cur.execute("SELECT product_name, price, qty FROM order_items WHERE order_id = %s", (r[0],))
            items = [{'name': i[0], 'price': i[1], 'qty': i[2]} for i in cur.fetchall()]
            orders.append({
                'id': r[0],
                'customer_name': r[1],
                'customer_phone': r[2],
                'city': r[3],
                'street': r[4],
                'apartment': r[5],
                'entrance': r[6],
                'floor': r[7],
                'zip': r[8],
                'comment': r[9],
                'delivery_service': r[10],
                'total': r[11],
                'status': r[12],
                'created_at': r[13].strftime('%d.%m.%Y %H:%M'),
                'items': items,
                'payment_status': r[14],
            })

        cur.close(); conn.close()
        return ok({'orders': orders})

    # Обновить статус (только для админа)
    if action == 'update_status':
        if admin_token != admin_password:
            cur.close(); conn.close()
            return err('Не авторизован', 401)

        order_id = body.get('id')
        status = body.get('status')
        if status not in STATUSES:
            cur.close(); conn.close()
            return err('Неверный статус')

        cur.execute("UPDATE orders SET status=%s WHERE id=%s", (status, order_id))
        conn.commit()
        cur.close(); conn.close()
        return ok({'success': True})

    # Обновить статус оплаты (только для админа)
    if action == 'update_payment_status':
        if admin_token != admin_password:
            cur.close(); conn.close()
            return err('Не авторизован', 401)

        order_id = body.get('id')
        payment_status = body.get('payment_status')
        if payment_status not in ('pending', 'paid'):
            cur.close(); conn.close()
            return err('Неверный статус оплаты')

        cur.execute("UPDATE orders SET payment_status=%s WHERE id=%s", (payment_status, order_id))
        conn.commit()
        cur.close(); conn.close()
        return ok({'success': True})

    # Инициализация платежа Т-Банк
    if action == 'pay_init':
        order_id = body.get('order_id')
        amount = int(body.get('amount', 0))
        origin = event.get('headers', {}).get('origin', 'https://yandex-maps-integration.poehali.dev')


        if not order_id or amount <= 0:
            cur.close(); conn.close()
            return err('Укажите order_id и сумму')

        params = {
            'Amount': amount * 100,
            'OrderId': str(order_id),
            'Description': f'Заказ №{order_id} в Се-Се',
            'SuccessURL': f'{origin}/?payment=success&order_id={order_id}',
            'FailURL': f'{origin}/?payment=fail&order_id={order_id}',
        }
        result = tbank_request('Init', params)
        print(f"[pay_init] order_id={order_id} amount={amount} result={result}")

        if result.get('Success'):
            payment_id = result.get('PaymentId')
            cur.execute("UPDATE orders SET payment_id = %s WHERE id = %s", (str(payment_id), order_id))
            conn.commit()
            cur.close(); conn.close()
            return ok({'success': True, 'payment_url': result.get('PaymentURL'), 'payment_id': payment_id})
        else:
            cur.close(); conn.close()
            return ok({'success': False, 'error': result.get('Message', 'Ошибка'), 'raw': result})

    # Проверка статуса платежа
    if action == 'pay_check':
        order_id = body.get('order_id')
        cur.execute("SELECT payment_status FROM orders WHERE id = %s", (order_id,))
        row = cur.fetchone()
        cur.close(); conn.close()
        if not row:
            return err('Заказ не найден', 404)
        return ok({'payment_status': row[0]})

    # Webhook от Т-Банк
    if action == 'tbank_webhook':
        terminal_key = os.environ.get('TBANK_TERMINAL_KEY', '')
        password = os.environ.get('TBANK_PASSWORD', '')
        if body.get('TerminalKey') != terminal_key:
            cur.close(); conn.close()
            return {'statusCode': 200, 'body': 'FAIL'}
        expected = tbank_token(body, password)
        if body.get('Token') != expected:
            cur.close(); conn.close()
            return {'statusCode': 200, 'body': 'FAIL'}
        status = body.get('Status')
        wb_order_id = body.get('OrderId')
        if status == 'CONFIRMED' and wb_order_id:
            cur.execute("UPDATE orders SET payment_status = 'paid' WHERE id = %s", (wb_order_id,))
            conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': 'OK'}

    cur.close(); conn.close()
    return err('Неизвестное действие', 400)