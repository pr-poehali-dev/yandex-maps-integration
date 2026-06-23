import { useState, useEffect } from 'react';

const AUTH_URL = 'https://functions.poehali.dev/9f335fe0-fb45-45a1-8a83-7e0c059ed17b';

export type Card = {
  number: string;
  discount_percent: number;
  total_purchases: number;
  card_type: 'silver' | 'gold' | 'diamond';
};

export type User = {
  id: number;
  name: string;
  email: string;
  is_wholesale: boolean;
  member_since: string;
  card: Card | null;
};

async function request(action: string, body: object = {}, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['X-Auth-Token'] = token;
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...body }),
  });
  return res.json();
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({ action: 'profile' }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.id) setUser(data);
        else { localStorage.removeItem('auth_token'); setToken(null); }
      });
  }, [token]);

  const register = async (name: string, email: string, password: string, phone: string) => {
    setLoading(true);
    const data = await request('register', { name, email, password, phone });
    setLoading(false);
    if (data.success) {
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser({ id: 0, name: data.name, email, is_wholesale: false, member_since: '', card: null });
      const profile = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': data.token },
        body: JSON.stringify({ action: 'profile' }),
      }).then((r) => r.json());
      if (profile.id) setUser(profile);
    }
    return data;
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    const data = await request('login', { email, password });
    setLoading(false);
    if (data.success) {
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      const profile = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': data.token },
        body: JSON.stringify({ action: 'profile' }),
      }).then((r) => r.json());
      if (profile.id) setUser(profile);
    }
    return data;
  };

  const logout = async () => {
    if (token) await request('logout', {}, token);
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return { user, token, loading, register, login, logout };
}