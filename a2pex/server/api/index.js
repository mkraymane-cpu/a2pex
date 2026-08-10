// Vercel treats any exported (req, res) handler in /api as a serverless
// function. An Express app IS such a handler, so we export it directly —
// no adapter package needed. vercel.json rewrites every request here.
const app = require('../app');

module.exports = app;
