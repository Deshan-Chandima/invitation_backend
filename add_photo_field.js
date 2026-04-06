require('dotenv').config();
const mysql = require('mysql2/promise');

async function upgrade() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('Altering table events to add photo_url...');
        await pool.query("ALTER TABLE events ADD COLUMN photo_url VARCHAR(500)");
        
        console.log('Schema upgrade complete!');
        process.exit(0);
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
            process.exit(0);
        } else {
            console.error('Migration failed: ', e);
            process.exit(1);
        }
    }
}

upgrade();
