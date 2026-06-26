"""
Управление портфолио и услугами: CRUD фото, категорий услуг и карточек услуг.
"""
import json
import os
import psycopg2
import boto3
import base64
import uuid


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data):
    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return {'statusCode': status, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def s3_client():
    return boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])


def handler(event: dict, context) -> dict:
    """Портфолио и управление услугами: табы, карточки услуг, фото."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
            'Access-Control-Max-Age': '86400'
        }, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', 'list')

    conn = get_conn()
    cur = conn.cursor()

    # ── Публичные методы ──────────────────────────────────────────────────────

    # Список портфолио (фото)
    if action == 'list':
        service_type = body.get('service_type')
        if service_type:
            cur.execute("SELECT id, service_type, title, description, image_url, sort_order FROM portfolio_photos WHERE service_type = %s ORDER BY sort_order, id", (service_type,))
        else:
            cur.execute("SELECT id, service_type, title, description, image_url, sort_order FROM portfolio_photos ORDER BY service_type, sort_order, id")
        rows = cur.fetchall()
        photos = [{'id': r[0], 'service_type': r[1], 'title': r[2], 'description': r[3], 'image_url': r[4], 'sort_order': r[5]} for r in rows]
        cur.close(); conn.close()
        return ok({'photos': photos})

    # Список табов услуг (публично)
    if action == 'list_tabs':
        cur.execute("SELECT id, key, label, emoji, description, sort_order FROM service_tabs ORDER BY sort_order, id")
        tabs = [{'id': r[0], 'key': r[1], 'label': r[2], 'emoji': r[3], 'description': r[4], 'sort_order': r[5]} for r in cur.fetchall()]
        cur.close(); conn.close()
        return ok({'tabs': tabs})

    # Список карточек услуг по табу (публично)
    if action == 'list_items':
        tab_key = body.get('tab_key')
        if tab_key:
            cur.execute("SELECT id, tab_key, title, description, price, icon, color, sort_order FROM service_items WHERE tab_key = %s ORDER BY sort_order, id", (tab_key,))
        else:
            cur.execute("SELECT id, tab_key, title, description, price, icon, color, sort_order FROM service_items ORDER BY tab_key, sort_order, id")
        items = [{'id': r[0], 'tab_key': r[1], 'title': r[2], 'description': r[3], 'price': r[4], 'icon': r[5], 'color': r[6], 'sort_order': r[7]} for r in cur.fetchall()]
        cur.close(); conn.close()
        return ok({'items': items})

    # ── Админские методы ──────────────────────────────────────────────────────

    admin_token = event.get('headers', {}).get('X-Admin-Token', '')
    admin_password = os.environ.get('ADMIN_PASSWORD', '')
    if admin_token != admin_password:
        cur.close(); conn.close()
        return err('Не авторизован', 401)

    # ── Табы услуг ────────────────────────────────────────────────────────────

    # Создать таб
    if action == 'create_tab':
        key = body.get('key', '').strip().lower().replace(' ', '_')
        label = body.get('label', '').strip()
        emoji = body.get('emoji', '⭐').strip()
        description = body.get('description', '').strip()
        if not key or not label:
            cur.close(); conn.close()
            return err('Укажите key и label')
        cur.execute("SELECT id FROM service_tabs WHERE key = %s", (key,))
        if cur.fetchone():
            cur.close(); conn.close()
            return err('Таб с таким ключом уже существует')
        cur.execute("SELECT COALESCE(MAX(sort_order),0)+1 FROM service_tabs")
        sort = cur.fetchone()[0]
        cur.execute("INSERT INTO service_tabs (key, label, emoji, description, sort_order) VALUES (%s,%s,%s,%s,%s) RETURNING id", (key, label, emoji, description, sort))
        new_id = cur.fetchone()[0]
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True, 'id': new_id})

    # Обновить таб
    if action == 'update_tab':
        tab_id = body.get('id')
        label = body.get('label', '').strip()
        emoji = body.get('emoji', '⭐').strip()
        description = body.get('description', '').strip()
        cur.execute("UPDATE service_tabs SET label=%s, emoji=%s, description=%s WHERE id=%s", (label, emoji, description, tab_id))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True})

    # Удалить таб
    if action == 'delete_tab':
        tab_id = body.get('id')
        cur.execute("SELECT key FROM service_tabs WHERE id = %s", (tab_id,))
        row = cur.fetchone()
        if row:
            cur.execute("UPDATE service_items SET tab_key = 'deleted' WHERE tab_key = %s", (row[0],))
        cur.execute("UPDATE service_tabs SET key = CONCAT(key, '_deleted_', id) WHERE id = %s", (tab_id,))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True})

    # ── Карточки услуг ────────────────────────────────────────────────────────

    # Создать карточку
    if action == 'create_item':
        tab_key = body.get('tab_key', '').strip()
        title = body.get('title', '').strip()
        description = body.get('description', '').strip()
        price = body.get('price', '').strip()
        icon = body.get('icon', 'Star').strip()
        color = body.get('color', 'bg-primary/10 text-primary').strip()
        if not tab_key or not title:
            cur.close(); conn.close()
            return err('Укажите tab_key и title')
        cur.execute("SELECT COALESCE(MAX(sort_order),0)+1 FROM service_items WHERE tab_key = %s", (tab_key,))
        sort = cur.fetchone()[0]
        cur.execute("INSERT INTO service_items (tab_key, title, description, price, icon, color, sort_order) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id",
            (tab_key, title, description, price, icon, color, sort))
        new_id = cur.fetchone()[0]
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True, 'id': new_id})

    # Обновить карточку
    if action == 'update_item':
        item_id = body.get('id')
        title = body.get('title', '').strip()
        description = body.get('description', '').strip()
        price = body.get('price', '').strip()
        icon = body.get('icon', 'Star').strip()
        color = body.get('color', 'bg-primary/10 text-primary').strip()
        cur.execute("UPDATE service_items SET title=%s, description=%s, price=%s, icon=%s, color=%s WHERE id=%s",
            (title, description, price, icon, color, item_id))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True})

    # Удалить карточку
    if action == 'delete_item':
        item_id = body.get('id')
        cur.execute("UPDATE service_items SET tab_key = CONCAT(tab_key, '_deleted') WHERE id = %s", (item_id,))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True})

    # ── Фото портфолио ────────────────────────────────────────────────────────

    # Загрузка фото
    if action == 'upload_photo':
        service_type = body.get('service_type', 'balloons')
        title = body.get('title', 'Фото')
        description = body.get('description', '')
        image_b64 = body.get('image')
        if not image_b64:
            cur.close(); conn.close()
            return err('Нет изображения')
        if ',' in image_b64:
            image_b64 = image_b64.split(',', 1)[1]
        image_data = base64.b64decode(image_b64)
        key = f'portfolio/{uuid.uuid4()}.jpg'
        s3 = s3_client()
        s3.put_object(Bucket='files', Key=key, Body=image_data, ContentType='image/jpeg')
        image_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        cur.execute("INSERT INTO portfolio_photos (service_type, title, description, image_url) VALUES (%s, %s, %s, %s) RETURNING id", (service_type, title, description, image_url))
        new_id = cur.fetchone()[0]
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True, 'id': new_id, 'image_url': image_url})

    # Удаление фото
    if action == 'delete_photo':
        photo_id = body.get('id')
        cur.execute("UPDATE portfolio_photos SET service_type = CONCAT(service_type, '_deleted') WHERE id = %s", (photo_id,))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True})

    cur.close(); conn.close()
    return err('Неизвестное действие')
