const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`A2PEX Kits API running on http://localhost:${PORT}`);
  testConnection();
});
