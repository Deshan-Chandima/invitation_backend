import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function upgrade() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [columns] = await connection.query('SHOW COLUMNS FROM events LIKE "loader_type"');
    if (columns.length === 0) {
      await connection.query('ALTER TABLE events ADD COLUMN loader_type VARCHAR(50) DEFAULT "envelope"');
      console.log('Column "loader_type" added successfully!');
    } else {
      console.log('Column "loader_type" already exists.');
    }
  } catch (error) {
    console.error('Error upgrading database:', error);
  } finally {
    await connection.end();
  }
}

upgrade();
