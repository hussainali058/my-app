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

    const userStatement = db.prepare(
      'SELECT id, email, password FROM users WHERE email = ?'
    );
    const insertStatement = db.prepare(
      'INSERT INTO users (email, password) VALUES (?, ?)'
    );
    const updatePasswordStatement = db.prepare(
      'UPDATE users SET password = ? WHERE id = ?'
    );

    let user = await userStatement.get(normalizedEmail);

    if (!user) {
      const result = await insertStatement.run(normalizedEmail, password);

      user = {
        id: result.lastID,
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
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

