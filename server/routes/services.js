import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM services ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM services WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new service
router.post('/', async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const result = await db.query(
      `INSERT INTO services (name, description, price) 
      VALUES ($1, $2, $3) 
      RETURNING *`,
      [name, description, price]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update service
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    const result = await db.query(
      `UPDATE services 
      SET name = $1, description = $2, price = $3, updated_at = NOW() 
      WHERE id = $4 
      RETURNING *`,
      [name, description, price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service exists
    const checkResult = await db.query(
      'SELECT id FROM services WHERE id = $1',
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Delete service
    await db.query('DELETE FROM services WHERE id = $1', [id]);

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
