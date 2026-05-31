const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/clock-in', authenticate, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const existing = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
      [req.user.id, today]
    );
    if (existing.rows[0])
      return res.status(400).json({ error: 'Already clocked in today' });

    const result = await pool.query(
      `INSERT INTO attendance (employee_id, date, time_in, status)
       VALUES ($1, $2, NOW(), 'present')
       RETURNING *`,
      [req.user.id, today]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clock-out', authenticate, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const record = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
      [req.user.id, today]
    );
    if (!record.rows[0])
      return res.status(400).json({ error: 'No clock-in found for today' });
    if (record.rows[0].time_out)
      return res.status(400).json({ error: 'Already clocked out' });

    const timeIn = new Date(record.rows[0].time_in);
    const timeOut = new Date();
    const hoursWorked = (timeOut - timeIn) / 3600000;
    const overtime = Math.max(0, hoursWorked - 8);

    const result = await pool.query(
      `UPDATE attendance
       SET time_out = NOW(), overtime_hours = $1
       WHERE employee_id = $2 AND date = $3
       RETURNING *`,
      [overtime.toFixed(2), req.user.id, today]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authenticate, async (req, res) => {
  const { month, year } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM attendance
       WHERE employee_id = $1
         AND EXTRACT(MONTH FROM date) = $2
         AND EXTRACT(YEAR FROM date) = $3
       ORDER BY date DESC`,
      [req.user.id, month || new Date().getMonth() + 1, year || new Date().getFullYear()]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/team', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(
      `SELECT a.*, e.full_name, e.department
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE a.date = $1
       ORDER BY e.department, e.full_name`,
      [date || new Date().toISOString().split('T')[0]]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router