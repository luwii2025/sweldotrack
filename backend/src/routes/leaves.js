const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');

// File a leave request
router.post('/', authenticate, async (req, res) => {
  const { leave_type, start_date, end_date, reason } = req.body;
  if (!leave_type || !start_date || !end_date) {
    return res.status(400).json({ error: 'leave_type, start_date, and end_date are required' });
  }

  try {
    const start = new Date(start_date);
    const end = new Date(end_date);
    const timeDiff = end.getTime() - start.getTime();
    if (timeDiff < 0) {
      return res.status(400).json({ error: 'end_date cannot be before start_date' });
    }
    const daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    const result = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_count, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, leave_type, start_date, end_date, daysCount, reason]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my leave requests
router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM leave_requests WHERE employee_id = $1 ORDER BY filed_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all leave requests (Admin/Manager only)
router.get('/', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  const { status } = req.query;
  try {
    let query = `
      SELECT lr.*, e.full_name, e.department
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
    `;
    const params = [];
    if (status) {
      query += ' WHERE lr.status = $1';
      params.push(status);
    }
    query += ' ORDER BY lr.filed_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve or Reject a leave request (Admin/Manager only)
router.patch('/:id', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  try {
    const checkResult = await pool.query('SELECT * FROM leave_requests WHERE id = $1', [id]);
    const leaveRequest = checkResult.rows[0];
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request has already been decided' });
    }

    const result = await pool.query(
      `UPDATE leave_requests
       SET status = $1, approver_id = $2, decided_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, req.user.id, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
