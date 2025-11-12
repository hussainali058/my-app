import express from 'express';
import db from '../db.js';
import { NODE_ENV } from '../db.js';
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

    let submissionId;

    if (NODE_ENV === 'production') {
      // PostgreSQL
      const result = await db.query(
        `INSERT INTO students (
          user_id,
          full_name,
          batch_number,
          phone_number,
          department,
          society_affiliation,
          interests,
          emergency_contact,
          dietary_preferences
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          req.user.userId,
          fullName,
          batchNumber,
          phoneNumber,
          department || null,
          societyAffiliation || null,
          interests || null,
          emergencyContact || null,
          dietaryPreferences || null,
        ]
      );
      submissionId = result.rows[0].id;
    } else {
      // SQLite
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

      const result = stmt.run(
        req.user.userId,
        fullName,
        batchNumber,
        phoneNumber,
        department || null,
        societyAffiliation || null,
        interests || null,
        emergencyContact || null,
        dietaryPreferences || null
      );
      submissionId = result.lastInsertRowid;
    }

    return res.status(201).json({
      message: 'Thank you! Your Cultural Day registration is received.',
      submissionId,
    });
  } catch (error) {
    console.error('Error creating student submission:', error);
    return res.status(500).json({ message: 'An error occurred while saving your submission.' });
  }
});

router.get('/', authenticate, async (_req, res) => {
  try {
    let submissions;

    if (NODE_ENV === 'production') {
      // PostgreSQL
      const result = await db.query(
        `SELECT 
          id, 
          full_name AS "fullName", 
          batch_number AS "batchNumber", 
          phone_number AS "phoneNumber",
          department, 
          society_affiliation AS "societyAffiliation", 
          interests,
          emergency_contact AS "emergencyContact", 
          dietary_preferences AS "dietaryPreferences",
          created_at AS "createdAt"
         FROM students
         ORDER BY created_at DESC`
      );
      submissions = result.rows;
    } else {
      // SQLite
      submissions = db
        .prepare(
          `SELECT id, full_name AS fullName, batch_number AS batchNumber, phone_number AS phoneNumber,
                  department, society_affiliation AS societyAffiliation, interests,
                  emergency_contact AS emergencyContact, dietary_preferences AS dietaryPreferences,
                  created_at AS createdAt
           FROM students
           ORDER BY created_at DESC`
        )
        .all();
    }

    return res.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ message: 'An error occurred while fetching submissions.' });
  }
});

export default router;

