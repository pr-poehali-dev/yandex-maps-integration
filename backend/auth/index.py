"""
Авторизация: регистрация, вход, выход, профиль.
Действие передаётся в поле action тела запроса.
"""
import json
import os
import hashlib
import secrets
import random
import string
import psycopg2
from datetime import datetime, timedelta


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def generate_card_number() -> str:
    return ''.join(random.choices(string.digits, k=16))


def generate_token() -> str:
    return secrets.token_hex(32)


def ok(data: dict):
    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False)}


def err(msg: str, status: int = 400):
    return {'statusCode': status, 'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
            'Access-Control-Max-Age': '86400'
        }, 'body': ''}

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    query = event.get('queryStringParameters') or {}
    action = body.get('action') or query.get('action', '')
    token = event.get('headers', {}).get('X-Auth-Token', '')

    conn = get_conn()
    cur = conn.cursor()

    if action == 'register':
        name = body.get('name', '').strip()
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')
        phone = body.get('phone', '').strip()

        if not name or not email or not password:
            cur.close(); conn.close(); return err('Заполните все поля')
        if not phone:
            cur.close(); conn.close(); return err('Укажите номер телефона')
        if len(password) < 6:
            cur.close(); conn.close(); return err('Пароль должен быть не менее 6 символов')

        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            cur.close(); conn.close(); return err('Email уже зарегистрирован')

        cur.execute("INSERT INTO users (name, email, password_hash, phone) VALUES (%s, %s, %s, %s) RETURNING id", (name, email, hash_password(password), phone))
        user_id = cur.fetchone()[0]

        cur.execute("INSERT INTO discount_cards (user_id, card_number, discount_percent) VALUES (%s, %s, %s)", (user_id, generate_card_number(), 5))

        token_val = generate_token()
        cur.execute("INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)", (user_id, token_val, datetime.now() + timedelta(days=30)))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True, 'token': token_val, 'name': name})

    if action == 'login':
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')

        cur.execute("SELECT id, name, password_hash FROM users WHERE email = %s", (email,))
        row = cur.fetchone()
        if not row or row[2] != hash_password(password):
            cur.close(); conn.close(); return err('Неверный email или пароль')

        user_id, name = row[0], row[1]
        token_val = generate_token()
        cur.execute("INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)", (user_id, token_val, datetime.now() + timedelta(days=30)))
        conn.commit(); cur.close(); conn.close()
        return ok({'success': True, 'token': token_val, 'name': name})

    if action == 'profile':
        if not token:
            cur.close(); conn.close(); return err('Не авторизован', 401)

        cur.execute("SELECT u.id, u.name, u.email, u.is_wholesale, u.created_at, u.phone FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()", (token,))
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close(); return err('Сессия истекла', 401)

        user_id, name, email, is_wholesale, created_at, phone = row
        cur.execute("SELECT card_number, discount_percent, total_purchases, card_type FROM discount_cards WHERE user_id = %s", (user_id,))
        card = cur.fetchone()
        cur.close(); conn.close()
        return ok({'id': user_id, 'name': name, 'email': email, 'phone': phone or '', 'is_wholesale': is_wholesale, 'member_since': created_at.strftime('%d.%m.%Y'), 'card': {'number': card[0], 'discount_percent': card[1], 'total_purchases': card[2], 'card_type': card[3]} if card else None})

    if action == 'logout':
        if token:
            cur.execute("UPDATE sessions SET expires_at = NOW() WHERE token = %s", (token,))
            conn.commit()
        cur.close(); conn.close()
        return ok({'success': True})

    cur.close(); conn.close()
    return err('Неизвестное действие', 400)