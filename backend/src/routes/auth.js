const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM employees WHERE email = $1 AND is_active = TRUE', [email]);
    const employee = result.rows[0];

    if (!employee) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, employee.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: employee.id, email: employee.email, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...employeeData } = employee;
    res.json({ token, employee: employeeData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
