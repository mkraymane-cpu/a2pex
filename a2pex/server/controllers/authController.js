const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await pool.query(
    'SELECT * FROM admins WHERE username = ? OR email = ? LIMIT 1',
    [username, username]
  );

  const admin = rows[0];
  if (!admin) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const token = generateToken({ id: admin.id, username: admin.username });

  res.json({
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      fullName: admin.full_name,
    },
  });
});

// GET /api/auth/me  (protected)
const me = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = { login, me };
