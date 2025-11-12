import express from 'express';
import db from '../db.js';

const router = express.Router();

// Simple password protection
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

router.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    return res.json({ 
      success: true, 
      token: Buffer.from(ADMIN_PASSWORD).toString('base64') 
    });
  }
  
  return res.status(401).json({ message: 'Invalid password' });
});

router.get('/students', async (req, res) => {
  try {
    // Check authorization
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || token !== Buffer.from(ADMIN_PASSWORD).toString('base64')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const stmt = db.prepare(
      `SELECT s.id, s.full_name, s.batch_number, s.phone_number,
              s.department, s.society_affiliation, s.interests,
              s.emergency_contact, s.dietary_preferences,
              s.created_at, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC`
    );
    
    const submissions = await stmt.all();
    return res.json({ submissions, total: submissions.length });
  } catch (err) {
    console.error('Get admin data error:', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

export default router;
