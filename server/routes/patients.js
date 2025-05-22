import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM client_record ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM client_record WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new patient
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zip,
    } = req.body;

    const result = await db.query(
      `INSERT INTO client_record 
      (first_name, last_name, email, phone, date_of_birth, address, city, state, zip) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        address,
        city,
        state,
        zip,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zip,
    } = req.body;

    const result = await db.query(
      `UPDATE client_record 
      SET first_name = $1, last_name = $2, email = $3, phone = $4, 
      date_of_birth = $5, address = $6, city = $7, state = $8, zip = $9, 
      updated_at = NOW() 
      WHERE id = $10 
      RETURNING *`,
      [
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        address,
        city,
        state,
        zip,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if patient exists
    const checkResult = await db.query(
      'SELECT id FROM client_record WHERE id = $1',
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Delete patient
    await db.query('DELETE FROM client_record WHERE id = $1', [id]);

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient notes
router.get('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT n.*, u.first_name as created_by_name, u.last_name as created_by_last_name 
      FROM notes n 
      LEFT JOIN "user" u ON n.created_by = u.id 
      WHERE n.client_record_id = $1 
      ORDER BY n.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patient notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add note to patient
router.post('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, createdBy } = req.body;

    const result = await db.query(
      `INSERT INTO notes (client_record_id, content, created_by) 
      VALUES ($1, $2, $3) 
      RETURNING *`,
      [id, content, createdBy]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding patient note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
