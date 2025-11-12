import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

export function createToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h', ...options });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

