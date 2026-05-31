const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');

// Get all employees (Admin/Manager only)
router.get('/', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, full_name, email, role, department, basic_salary, date_hired, employment_type, sss_no, philhealth_no, pagibig_no, tin, is_active, created_at FROM employees ORDER BY full_name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single employee details
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const result = await pool.query('SELECT id, full_name, email, role, department, basic_salary, date_hired, employment_type, sss_no, philhealth_no, pagibig_no, tin, is_active, created_at FROM employees WHERE id = $1', [id]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new employee (Admin only)
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const {
    full_name,
    email,
    password,
    role,
    department,
    basic_salary,
    date_hired,
    employment_type,
    sss_no,
    philhealth_no,
    pagibig_no,
    tin
  } = req.body;

  if (!full_name || !email || !password || basic_salary === undefined || !date_hired) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO employees (
        full_name, email, password_hash, role, department, basic_salary,
        date_hired, employment_type, sss_no, philhealth_no, pagibig_no, tin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, full_name, email, role, department, basic_salary, date_hired, employment_type, sss_no, philhealth_no, pagibig_no, tin`,
      [
        full_name,
        email,
        passwordHash,
        role || 'employee',
        department,
        basic_salary,
        date_hired,
        employment_type || 'regular',
        sss_no,
        philhealth_no,
        pagibig_no,
        tin
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update employee (Admin only)
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const {
    full_name,
    email,
    role,
    department,
    basic_salary,
    date_hired,
    employment_type,
    sss_no,
    philhealth_no,
    pagibig_no,
    tin,
    is_active
  } = req.body;

  try {
    const checkResult = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
    if (!checkResult.rows[0]) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const result = await pool.query(
      `UPDATE employees
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           department = COALESCE($4, department),
           basic_salary = COALESCE($5, basic_salary),
           date_hired = COALESCE($6, date_hired),
           employment_type = COALESCE($7, employment_type),
           sss_no = COALESCE($8, sss_no),
           philhealth_no = COALESCE($9, philhealth_no),
           pagibig_no = COALESCE($10, pagibig_no),
           tin = COALESCE($11, tin),
           is_active = COALESCE($12, is_active)
       WHERE id = $13
       RETURNING id, full_name, email, role, department, basic_salary, date_hired, employment_type, sss_no, philhealth_no, pagibig_no, tin, is_active`,
      [
        full_name,
        email,
        role,
        department,
        basic_salary,
        date_hired,
        employment_type,
        sss_no,
        philhealth_no,
        pagibig_no,
        tin,
        is_active,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
