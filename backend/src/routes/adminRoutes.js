import express from 'express';
import db from '../db.js';

const router = express.Router();

// Admin endpoint - Get all submissions with admin credentials
router.get('/submissions', async (req, res) => {
  try {
    // Simple authentication - check for admin token
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const password = req.query.password || req.headers['x-admin-password'];
    
    if (password !== adminPassword) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const stmt = db.prepare(`
      SELECT 
        s.id,
        s.user_id,
        s.full_name,
        s.batch_number,
        s.phone_number,
        s.department,
        s.society_affiliation,
        s.interests,
        s.emergency_contact,
        s.dietary_preferences,
        s.created_at,
        u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    
    const submissions = await stmt.all();

    return res.json({ 
      total: submissions.length,
      submissions 
    });
  } catch (err) {
    console.error('Admin endpoint error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Export submissions as JSON
router.get('/export', async (req, res) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const password = req.query.password || req.headers['x-admin-password'];
    
    if (password !== adminPassword) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const stmt = db.prepare(`
      SELECT 
        s.id,
        s.user_id,
        s.full_name,
        s.batch_number,
        s.phone_number,
        s.department,
        s.society_affiliation,
        s.interests,
        s.emergency_contact,
        s.dietary_preferences,
        s.created_at,
        u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    
    const submissions = await stmt.all();

    // Set headers for download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.json"');
    
    return res.json(submissions);
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
