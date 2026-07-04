import dotenv from 'dotenv';
import app from './app.js';
import pool from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Test DB Connection before starting server
const startServer = async () => {
  try {
    const client = await pool.connect();
    console.log('Database pool connection established successfully.');
    client.release();

    app.listen(PORT, () => {
      console.log(`HRMS Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('Failed to start server due to database connection issue:', error.message);
    process.exit(1);
  }
};

startServer();
