/**
 * Creates (or updates the password of) an admin account.
 *
 * Usage:
 *   node scripts/createAdmin.js <username> <email> <password> ["Full Name"]
 *
 * Example:
 *   node scripts/createAdmin.js aymane admin@a2pex.com "S3cure-Pass!" "Aymane"
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function main() {
  const [username, email, password, fullName] = process.argv.slice(2);

  if (!username || !email || !password) {
    console.error('Usage: node scripts/createAdmin.js <username> <email> <password> ["Full Name"]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const [existing] = await pool.query(
      'SELECT id FROM admins WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      await pool.query('UPDATE admins SET password_hash = ?, email = ?, full_name = ? WHERE id = ?', [
        passwordHash,
        email,
        fullName || null,
        existing[0].id,
      ]);
      console.log(`Updated existing admin "${username}".`);
    } else {
      await pool.query(
        'INSERT INTO admins (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
        [username, email, passwordHash, fullName || null]
      );
      console.log(`Admin "${username}" created. You can now log in from /admin/login.`);
    }
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
