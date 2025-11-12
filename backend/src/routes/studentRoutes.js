import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const {
      fullName,
      batchNumber,
      phoneNumber,
      department,
      societyAffiliation,
      interests,
      emergencyContact,
      dietaryPreferences,
    } = req.body;

    if (!fullName || !batchNumber || !phoneNumber) {
      return res.status(400).json({
        message: 'Full name, batch number, and phone number are required.',
      });
    }

    const stmt = db.prepare(`
      INSERT INTO students (
        user_id,
        full_name,
        batch_number,
        phone_number,
        department,
        society_affiliation,
        interests,
        emergency_contact,
        dietary_preferences
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.run(
      req.user.userId,
      fullName,
      batchNumber,
      phoneNumber,
      department ?? null,
      societyAffiliation ?? null,
      interests ?? null,
      emergencyContact ?? null,
      dietaryPreferences ?? null
    );

    return res.status(201).json({
      message: 'Thank you! Your Cultural Day registration is received.',
      submissionId: result.lastID,
    });
  } catch (err) {
    console.error('Student registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticate, async (_req, res) => {
  try {
    const stmt = db.prepare(
      `SELECT id, full_name AS fullName, batch_number AS batchNumber, phone_number AS phoneNumber,
              department, society_affiliation AS societyAffiliation, interests,
              emergency_contact AS emergencyContact, dietary_preferences AS dietaryPreferences,
              created_at AS createdAt
       FROM students
       ORDER BY created_at DESC`
    );
    
    const submissions = await stmt.all();

    return res.json({ submissions });
  } catch (err) {
    console.error('Get students error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

