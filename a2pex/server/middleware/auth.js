const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Protects a route: requires a valid "Authorization: Bearer <token>" header
 * issued at admin login. Attaches the admin record (minus the password
 * hash) to req.admin.
 */
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      'SELECT id, username, email, full_name FROM admins WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Not authorized. Admin no longer exists.' });
    }

    req.admin = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized. Invalid or expired token.' });
  }
}

module.exports = { protect };
