require('dotenv').config();
const mysql = require('mysql2/promise');

async function check() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('Fetching all events...');
        const [rows] = await pool.query("SELECT * FROM events");
        console.log('Rows found:', rows.length);
        console.log('First row sample:', JSON.stringify(rows[0], null, 2));
        
        process.exit(0);
    } catch (e) {
        console.error('Check failed: ', e);
        process.exit(1);
    }
}

check();
