"""
Управление портфолио: получение и CRUD для фото по типам услуг (balloons, cars, korea).
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


def handler(event: dict, context) -> dict:
    """Портфолио услуг: получение, добавление и удаление фото."""
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

    # Публичный список портфолио
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

    # Проверка токена для остальных действий
    admin_token = event.get('headers', {}).get('X-Admin-Token', '')
    admin_password = os.environ.get('ADMIN_PASSWORD', '')
    if admin_token != admin_password:
        cur.close(); conn.close()
        return err('Не авторизован', 401)

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

        ext = 'jpg'
        key = f'portfolio/{uuid.uuid4()}.{ext}'
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
        s3.put_object(Bucket='files', Key=key, Body=image_data, ContentType='image/jpeg')
        image_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

        cur.execute("INSERT INTO portfolio_photos (service_type, title, description, image_url) VALUES (%s, %s, %s, %s) RETURNING id", (service_type, title, description, image_url))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close(); conn.close()
        return ok({'success': True, 'id': new_id, 'image_url': image_url})

    # Удаление фото
    if action == 'delete_photo':
        photo_id = body.get('id')
        cur.execute("DELETE FROM portfolio_photos WHERE id = %s", (photo_id,))
        conn.commit()
        cur.close(); conn.close()
        return ok({'success': True})

    cur.close(); conn.close()
    return err('Неизвестное действие')
