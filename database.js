const { Pool } = require('pg');

// Create a new pool with PostgreSQL connection details
const pool = new Pool({
  user: 'postgres',        // Replace with your PostgreSQL username
  host: 'localhost',       // Replace with your host
  database: 'growthif_grow', // Replace with your database name
  password: 'root',            // Replace with your PostgreSQL password
  port: 5432,              // Default PostgreSQL port
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
  }
  release(); // Release the client back to the pool
});

module.exports = pool;


