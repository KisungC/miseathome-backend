const pgPromise = require('pg-promise');
const pgp = pgPromise();
require('dotenv').config();

const db = pgp({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // <-- disables strict cert checking
  },
});

function onLostConnection(err, e) {
  console.error('🔥 Lost DB connection:', err.message);
  e.client.removeAllListeners();
}

async function connectDB() {
  let conn;
  try {
    conn = await db.connect({ direct: true, onLost: onLostConnection });
    await conn.any('SELECT 1'); // confirm query works
    console.log("✅ Connected to database");
  } catch (err) {
    console.error("❌ Failed to connect:", err.message);
  } finally {
    if (conn) {
      await conn.done();
    }
  }
}

connectDB();

