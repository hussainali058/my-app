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

    // PostgreSQL uses $1, $2 instead of ?
    const userStatement = db.prepare(
      'SELECT id, email, password FROM users WHERE email = $1'
    );
    const insertStatement = db.prepare(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id'
    );
    const updatePasswordStatement = db.prepare(
      'UPDATE users SET password = $1 WHERE id = $2'
    );

    let user = await userStatement.get(normalizedEmail);

    if (!user) {
      const result = await insertStatement.run(normalizedEmail, password);

      user = {
        id: result.lastID || result.rows?.[0]?.id,
        email: normalizedEmail,
        password: password,
      };
    } else {
      await updatePasswordStatement.run(password, user.id);
      user.password = password;
    }

    const token = createToken({ userId: user.id, email: user.email });

    return res.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

export default router;

