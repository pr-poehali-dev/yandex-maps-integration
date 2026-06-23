"""
Публичный список товаров из БД.
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
    cur.execute("SELECT id, name, category, brand, price, wholesale, rating, image, badge FROM products ORDER BY id")
    rows = cur.fetchall()
    cur.close(); conn.close()

    products = [
        {'id': r[0], 'name': r[1], 'category': r[2], 'brand': r[3],
         'price': r[4], 'wholesale': r[5], 'rating': float(r[6]),
         'image': r[7], 'badge': r[8]}
        for r in rows
    ]
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'products': products}, ensure_ascii=False)
    }
