const mysql = require('mysql2/promise');
require('dotenv').config();

// Node 18+ resolves DNS with IPv6 preferred by default; kept as a general
// safeguard for any other outbound calls this process makes (e.g. Cloudinary).
// It does NOT affect the DB connection below anymore, since that now
// connects by IP and skips DNS resolution entirely (see DB_HOST comment).
require('dns').setDefaultResultOrder('ipv4first');

// DB_HOST is the literal IP to open the TCP socket against — this avoids
// DNS resolution for the Aiven hostname altogether, which is what was
// failing specifically from Vercel's network even though the hostname
// resolves fine everywhere else (your machine, a browser, etc).
//
// Aiven's TLS layer uses SNI-based routing (the hostname sent during the
// TLS handshake, not the IP, decides which backend the connection reaches),
// so DB_SSL_SERVERNAME carries the real hostname through to the TLS
// handshake even though the TCP connection itself never resolves it.
//
// Local/Docker MySQL doesn't use TLS at all, so none of this applies when
// DB_HOST is localhost/127.0.0.1 — ssl stays fully disabled in that case,
// exactly as before.
const host = process.env.DB_HOST || 'localhost';
const isLocal = host === 'localhost' || host === '127.0.0.1';
const sslServername = process.env.DB_SSL_SERVERNAME || host;

const pool = mysql.createPool({
  host,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'a2pex',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  // rejectUnauthorized:false trusts the connection without pinning Aiven's
  // specific CA cert — encrypted in transit, simplest setup for a small
  // project. `servername` is the important part here: it's what makes SNI
  // routing (and, if rejectUnauthorized were ever turned on, certificate
  // hostname validation) work correctly when `host` is an IP instead of
  // the real hostname.
  ssl: isLocal
    ? undefined
    : { rejectUnauthorized: false, servername: sslServername },
});

// Verify the connection at boot so failures are obvious instead of
// surfacing as a cryptic error on the first request.
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log(`MySQL connected -> database "${process.env.DB_NAME || 'a2pex'}"`);
    conn.release();
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    console.error('The API will keep running, but every DB-backed route will fail until MySQL is reachable.');
    console.error('Check server/.env and confirm the schema was imported (see server/database/schema.sql).');
  }
}

module.exports = { pool, testConnection };
