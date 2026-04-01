import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db';
import { env } from '../config/env';

interface User {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  role: string;
}

interface UserPayload {
  id: string;
  username: string;
  full_name: string;
  role: string;
}

export async function register(username: string, password: string, full_name: string, role = 'viewer') {
  const existing = await db('users').where({ username }).first();
  if (existing) throw new Error('Username already exists');

  const id = crypto.randomUUID();
  const password_hash = await bcrypt.hash(password, 10);
  await db('users').insert({ id, username, password_hash, full_name, role });

  const user = { id, username, full_name, role };
  return { token: generateToken(user), user };
}

export async function login(username: string, password: string) {
  const user: User | undefined = await db('users').where({ username }).first();
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid credentials');

  const payload = { id: user.id, username: user.username, full_name: user.full_name, role: user.role };
  return { token: generateToken(payload), user: payload };
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): UserPayload {
  return jwt.verify(token, env.JWT_SECRET) as UserPayload;
}
