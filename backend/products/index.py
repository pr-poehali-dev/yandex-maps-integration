"""
Публичный список товаров из БД. v2
"""
import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute("SELECT id, name, category, brand, price, wholesale, rating, image, badge, description, wholesale_min_qty, composition, usage_instructions FROM products ORDER BY sort_order, id")
    rows = cur.fetchall()
    products = [
        {'id': r[0], 'name': r[1], 'category': r[2], 'brand': r[3],
         'price': r[4], 'wholesale': r[5], 'rating': float(r[6]),
         'image': r[7], 'badge': r[8], 'description': r[9] or '',
         'wholesale_min_qty': r[10] or 0, 'composition': r[11] or '',
         'usage_instructions': r[12] or ''}
        for r in rows
    ]

    cur.execute("SELECT key, value FROM site_settings")
    settings = {}
    for r in cur.fetchall():
        if r[0] == 'store_images':
            try:
                settings[r[0]] = json.loads(r[1])
            except Exception:
                settings[r[0]] = []
        else:
            settings[r[0]] = r[1]

    cur.execute("SELECT name FROM categories ORDER BY sort_order, id")
    categories = [r[0] for r in cur.fetchall()]

    cur.close(); conn.close()
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'products': products, 'settings': settings, 'categories': categories}, ensure_ascii=False)
    }