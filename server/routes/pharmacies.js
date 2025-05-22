import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// Get all pharmacies
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM pharmacies ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pharmacy by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM pharmacies WHERE id = $1', [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching pharmacy:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new pharmacy
router.post('/', async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      zip,
      phone,
      contactEmail,
      supportedStates,
    } = req.body;

    const result = await db.query(
      `INSERT INTO pharmacies 
      (name, address, city, state, zip, phone, contact_email, supported_states) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [name, address, city, state, zip, phone, contactEmail, supportedStates]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating pharmacy:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update pharmacy
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      city,
      state,
      zip,
      phone,
      contactEmail,
      supportedStates,
    } = req.body;

    const result = await db.query(
      `UPDATE pharmacies 
      SET name = $1, address = $2, city = $3, state = $4, zip = $5, 
      phone = $6, contact_email = $7, supported_states = $8, updated_at = NOW() 
      WHERE id = $9 
      RETURNING *`,
      [
        name,
        address,
        city,
        state,
        zip,
        phone,
        contactEmail,
        supportedStates,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating pharmacy:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete pharmacy
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if pharmacy exists
    const checkResult = await db.query(
      'SELECT id FROM pharmacies WHERE id = $1',
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Delete pharmacy
    await db.query('DELETE FROM pharmacies WHERE id = $1', [id]);

    res.json({ message: 'Pharmacy deleted successfully' });
  } catch (error) {
    console.error('Error deleting pharmacy:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pharmacies by state
router.get('/state/:state', async (req, res) => {
  try {
    const { state } = req.params;

    const result = await db.query(
      `SELECT * FROM pharmacies 
      WHERE $1 = ANY(supported_states) 
      ORDER BY name`,
      [state]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pharmacies by state:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
