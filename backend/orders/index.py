"""
Заказы: создание, список для админа, обновление статуса.
"""
import json
import os
import psycopg2


STATUSES = {
    'new': '🆕 Новый',
    'confirmed': '✅ Подтверждён',
    'shipped': '🚚 Отправлен',
    'delivered': '📦 Доставлен',
    'cancelled': '❌ Отменён',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data: dict):
    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False)}


def err(msg: str, status: int = 400):
    return {'statusCode': status, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}



def handler(event: dict, context) -> dict:
    """Создание заказа и управление заказами для админа."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
            'Access-Control-Max-Age': '86400'
        }, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')
    admin_token = event.get('headers', {}).get('X-Admin-Token', '')
    admin_password = os.environ.get('ADMIN_PASSWORD', '')

    conn = get_conn()
    cur = conn.cursor()

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
        total = body.get('total', 0)

        if not name or not phone or not city or not street or not items:
            cur.close(); conn.close()
            return err('Заполните все поля')

        cur.execute(
            "INSERT INTO orders (customer_name, customer_phone, address_city, address_street, address_apartment, address_entrance, address_floor, address_zip, comment, delivery_service, total, status) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'new') RETURNING id",
            (name, phone, city, street, apartment, entrance, floor_, zip_code, comment, delivery_service, int(total))
        )
        order_id = cur.fetchone()[0]

        for item in items:
            cur.execute(
                "INSERT INTO order_items (order_id, product_id, product_name, price, qty) VALUES (%s,%s,%s,%s,%s)",
                (order_id, item.get('id', 0), item.get('name', ''), int(item.get('price', 0)), int(item.get('qty', 1)))
            )

        conn.commit()

        cur.close(); conn.close()
        return ok({'success': True, 'order_id': order_id})

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

        cur.execute("UPDATE orders SET status=%s WHERE id=%s RETURNING customer_name, customer_phone, address_city, total", (status, order_id))
        row = cur.fetchone()
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

    cur.close(); conn.close()
    return err('Неизвестное действие', 400)