// database/index.js
const pgPromise = require('pg-promise');
const pgp = pgPromise();

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const db = pgp(connectionString);

// Test connection with a simple query
db.one('SELECT 1')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch(error => {
    console.error('Database connection failed:', error);
  });

module.exports = db;
