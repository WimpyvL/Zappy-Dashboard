import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, c.first_name, c.last_name, c.email 
      FROM "order" o 
      JOIN client_record c ON o.client_record_id = c.id 
      ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT o.*, c.first_name, c.last_name, c.email 
      FROM "order" o 
      JOIN client_record c ON o.client_record_id = c.id 
      WHERE o.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { clientRecordId, status, totalAmount } = req.body;

    const result = await db.query(
      `INSERT INTO "order" (client_record_id, status, total_amount) 
      VALUES ($1, $2, $3) 
      RETURNING *`,
      [clientRecordId, status, totalAmount]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, totalAmount } = req.body;

    const result = await db.query(
      `UPDATE "order" 
      SET status = $1, total_amount = $2, updated_at = NOW() 
      WHERE id = $3 
      RETURNING *`,
      [status, totalAmount, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order exists
    const checkResult = await db.query('SELECT id FROM "order" WHERE id = $1', [
      id,
    ]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Delete order
    await db.query('DELETE FROM "order" WHERE id = $1', [id]);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get orders for a specific patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await db.query(
      `SELECT * FROM "order" 
      WHERE client_record_id = $1 
      ORDER BY created_at DESC`,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patient orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
