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

        console.log('Altering table events...');
        
        await pool.query("ALTER TABLE events ADD COLUMN host_message VARCHAR(255) DEFAULT 'TOGETHER WITH THEIR FAMILIES'");
        await pool.query("ALTER TABLE events ADD COLUMN ceremony_message VARCHAR(255) DEFAULT 'REQUEST THE PLEASURE OF YOUR COMPANY AT THE CEREMONY OF THEIR WEDDING'");
        await pool.query("ALTER TABLE events ADD COLUMN venue_name VARCHAR(255)");
        await pool.query("ALTER TABLE events ADD COLUMN time_text VARCHAR(255)");
        await pool.query("ALTER TABLE events ADD COLUMN footer_text VARCHAR(255) DEFAULT 'reception to follow'");
        
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
