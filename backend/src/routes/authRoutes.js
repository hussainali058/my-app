import express from 'express';
import db from '../db.js';
import { createToken } from '../utils/token.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide both email and password.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if user exists
    const userResult = await db.query(
      'SELECT id, email, password FROM users WHERE email = $1',
      [normalizedEmail]
    );

    let user;

    if (userResult.rows.length === 0) {
      // Create new user
      const insertResult = await db.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, password',
        [normalizedEmail, password]
      );
      user = insertResult.rows[0];
    } else {
      // Update password for existing user
      user = userResult.rows[0];
      await db.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [password, user.id]
      );
      user.password = password;
    }

    const token = createToken({ userId: user.id, email: user.email });

    return res.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An error occurred during login.' });
  }
});

export default router;

