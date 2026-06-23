"""
Админ-панель: вход по паролю, CRUD товаров, загрузка фото в S3.
"""
import json
import os
import base64
import uuid
import psycopg2
import boto3


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def s3_client():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )


def ok(data):
    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return {'statusCode': status, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def check_token(headers):
    token = headers.get('X-Admin-Token', '')
    return token == os.environ.get('ADMIN_PASSWORD', '')


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
            'Access-Control-Max-Age': '86400'
        }, 'body': ''}

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    headers = event.get('headers', {})
    action = body.get('action', '')

    # Вход — проверка пароля
    if action == 'login':
        password = body.get('password', '')
        if password == os.environ.get('ADMIN_PASSWORD', ''):
            return ok({'success': True, 'token': password})
        return err('Неверный пароль', 401)

    # Все остальные действия требуют токен
    if not check_token(headers):
        return err('Не авторизован', 401)

    conn = get_conn()
    cur = conn.cursor()

    # Получить все товары
    if action == 'list':
        cur.execute("SELECT id, name, category, brand, price, wholesale, rating, image, badge, sort_order, description, wholesale_min_qty FROM products ORDER BY sort_order, id")
        rows = cur.fetchall()
        cur.close(); conn.close()
        products = [{'id': r[0], 'name': r[1], 'category': r[2], 'brand': r[3], 'price': r[4], 'wholesale': r[5], 'rating': float(r[6]), 'image': r[7], 'badge': r[8], 'sort_order': r[9], 'description': r[10] or '', 'wholesale_min_qty': r[11] or 0} for r in rows]
        return ok({'products': products})

    # Сохранить порядок товаров
    if action == 'reorder':
        order = body.get('order', [])  # список id в нужном порядке
        for i, pid in enumerate(order):
            cur.execute("UPDATE products SET sort_order=%s WHERE id=%s", (i, pid))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True})

    # Обновить товар
    if action == 'update':
        pid = body.get('id')
        name = body.get('name')
        category = body.get('category')
        brand = body.get('brand')
        price = body.get('price')
        wholesale = body.get('wholesale')
        badge = body.get('badge') or None
        description = body.get('description', '')
        wholesale_min_qty = int(body.get('wholesale_min_qty', 0))

        cur.execute(
            "UPDATE products SET name=%s, category=%s, brand=%s, price=%s, wholesale=%s, badge=%s, description=%s, wholesale_min_qty=%s, updated_at=NOW() WHERE id=%s",
            (name, category, brand, price, wholesale, badge, description, wholesale_min_qty, pid)
        )
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True})

    # Загрузить фото
    if action == 'upload_image':
        pid = body.get('id')
        image_b64 = body.get('image')
        ext = body.get('ext', 'jpg')

        image_data = base64.b64decode(image_b64)
        key = f'products/{uuid.uuid4()}.{ext}'
        s3 = s3_client()
        s3.put_object(Bucket='files', Key=key, Body=image_data, ContentType=f'image/{ext}')
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

        cur.execute("UPDATE products SET image=%s, updated_at=NOW() WHERE id=%s", (cdn_url, pid))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True, 'image': cdn_url})

    # Добавить товар
    if action == 'create':
        name = body.get('name', 'Новый товар')
        category = body.get('category', 'Товары для дома')
        brand = body.get('brand', '')
        price = body.get('price', 0)
        wholesale = body.get('wholesale', 0)
        image = body.get('image', '')
        badge = body.get('badge') or None

        cur.execute(
            "INSERT INTO products (name, category, brand, price, wholesale, image, badge) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id",
            (name, category, brand, price, wholesale, image, badge)
        )
        new_id = cur.fetchone()[0]
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True, 'id': new_id})

    # Удалить товар
    if action == 'delete':
        pid = body.get('id')
        cur.execute("DELETE FROM products WHERE id=%s", (pid,))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True})

    # Получить настройки (соцсети)
    if action == 'get_settings':
        cur.execute("SELECT key, value FROM site_settings")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return ok({'settings': {r[0]: r[1] for r in rows}})

    # Сохранить настройки
    if action == 'save_settings':
        settings = body.get('settings', {})
        for key, value in settings.items():
            cur.execute("INSERT INTO site_settings (key, value) VALUES (%s, %s) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", (key, value))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True})

    # Список пользователей с картами лояльности
    if action == 'get_users':
        cur.execute("""
            SELECT u.id, u.name, u.email, u.phone, u.created_at,
                   dc.card_type, dc.discount_percent, dc.total_purchases
            FROM users u
            LEFT JOIN discount_cards dc ON dc.user_id = u.id
            ORDER BY u.created_at DESC
        """)
        rows = cur.fetchall()
        cur.close(); conn.close()
        users = []
        for r in rows:
            users.append({
                'id': r[0], 'name': r[1], 'email': r[2], 'phone': r[3] or '',
                'created_at': r[4].strftime('%d.%m.%Y %H:%M'),
                'card_type': r[5] or 'silver',
                'discount_percent': r[6] or 5,
                'total_purchases': r[7] or 0,
            })
        return ok({'users': users})

    cur.close(); conn.close()
    return err('Неизвестное действие', 400)