import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_USER_PASSWORD,
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    } else {
    console.log('Connected to the database successfully');
  }
});

export default pool;

// CONTOH ISI .env
// DB_USER=postgres
// DB_HOST=localhost
// DB_NAME=perpustakaan_iot
// DB_USER_PASSWORD=postgres