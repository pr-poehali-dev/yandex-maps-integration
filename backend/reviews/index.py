"""
Отзывы покупателей: добавление и публичный список одобренных. v3
"""
import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data):
    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return {'statusCode': status, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    """Публичное API для отзывов: create и list."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
            'Access-Control-Max-Age': '86400'
        }, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')
    headers = event.get('headers', {})

    conn = get_conn()
    cur = conn.cursor()

    # Публичный список одобренных отзывов
    if action == 'list':
        cur.execute("""
            SELECT id, author_name, city, rating, text, product, created_at
            FROM reviews WHERE is_approved = true
            ORDER BY created_at DESC LIMIT 50
        """)
        rows = cur.fetchall()
        cur.close(); conn.close()
        reviews = [{'id': r[0], 'author_name': r[1], 'city': r[2], 'rating': r[3],
                    'text': r[4], 'product': r[5], 'created_at': r[6].strftime('%d.%m.%Y')} for r in rows]
        return ok({'reviews': reviews})

    # Создать отзыв
    if action == 'create':
        author_name = (body.get('author_name') or '').strip()
        city = (body.get('city') or '').strip()
        rating = int(body.get('rating') or 0)
        text = (body.get('text') or '').strip()
        product = (body.get('product') or '').strip()

        if not author_name:
            cur.close(); conn.close()
            return err('Укажите ваше имя')
        if not text or len(text) < 10:
            cur.close(); conn.close()
            return err('Отзыв слишком короткий (минимум 10 символов)')
        if rating < 1 or rating > 5:
            cur.close(); conn.close()
            return err('Укажите оценку от 1 до 5')

        cur.execute("""
            INSERT INTO reviews (author_name, city, rating, text, product)
            VALUES (%s, %s, %s, %s, %s) RETURNING id
        """, (author_name, city, rating, text, product))
        new_id = cur.fetchone()[0]
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True, 'id': new_id})

    # Админ: список всех отзывов (включая неодобренные)
    if action == 'admin_list':
        if headers.get('X-Admin-Token') != os.environ.get('ADMIN_PASSWORD', ''):
            cur.close(); conn.close()
            return err('Не авторизован', 401)
        cur.execute("SELECT id, author_name, city, rating, text, product, is_approved, created_at FROM reviews ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close(); conn.close()
        reviews = [{'id': r[0], 'author_name': r[1], 'city': r[2], 'rating': r[3],
                    'text': r[4], 'product': r[5], 'is_approved': r[6],
                    'created_at': r[7].strftime('%d.%m.%Y %H:%M')} for r in rows]
        return ok({'reviews': reviews})

    # Админ: одобрить/отклонить отзыв
    if action == 'admin_approve':
        if headers.get('X-Admin-Token') != os.environ.get('ADMIN_PASSWORD', ''):
            cur.close(); conn.close()
            return err('Не авторизован', 401)
        review_id = body.get('id')
        approved = bool(body.get('approved'))
        cur.execute("UPDATE reviews SET is_approved = %s WHERE id = %s", (approved, review_id))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True})

    # Админ: удалить отзыв
    if action == 'admin_delete':
        if headers.get('X-Admin-Token') != os.environ.get('ADMIN_PASSWORD', ''):
            cur.close(); conn.close()
            return err('Не авторизован', 401)
        review_id = body.get('id')
        cur.execute("DELETE FROM reviews WHERE id = %s", (review_id,))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True})

    cur.close(); conn.close()
    return err('Неизвестное действие', 400)