require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection on startup
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully!');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed: ', err.message);
    });

// GET /api/events/:slug
app.get('/api/events/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const [rows] = await pool.query('SELECT * FROM events WHERE slug = ?', [slug]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/events (List all events)
app.get('/api/events', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/events (Create event)
app.post('/api/events', async (req, res) => {
    try {
        const { 
            host_message, ceremony_message, venue_name, time_text, footer_text, template_id, photo_url, invite_type, envelope_text, loader_type, show_map, google_maps_link
        } = req.body;
        
        // Basic validation
        if (!slug || !title || !event_date) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const [result] = await pool.query(
            `INSERT INTO events (
                slug, title, event_date, location, message,
                host_message, ceremony_message, venue_name, time_text, footer_text, template_id, photo_url, invite_type, envelope_text, loader_type, show_map, google_maps_link
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                slug, title, event_date, location, message,
                host_message || 'TOGETHER WITH THEIR FAMILIES',
                ceremony_message || 'REQUEST THE PLEASURE OF YOUR COMPANY AT THE CEREMONY OF THEIR WEDDING',
                venue_name || '',
                time_text || '',
                footer_text || 'reception to follow',
                template_id || 'template_1',
                photo_url || '',
                invite_type || 'card',
                envelope_text || 'Please join us',
                loader_type || 'envelope',
                show_map ? 1 : 0,
                google_maps_link || ''
            ]
        );
        
        res.status(201).json({ id: result.insertId, slug, title });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Slug already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/events/:id (Delete event)
app.delete('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/events/:id (Update event)
app.put('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            host_message, ceremony_message, venue_name, time_text, footer_text, template_id, photo_url, invite_type, envelope_text, loader_type, show_map, google_maps_link
        } = req.body;
        
        if (!slug || !title || !event_date) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const [result] = await pool.query(
            `UPDATE events SET 
                slug = ?, title = ?, event_date = ?, location = ?, message = ?,
                host_message = ?, ceremony_message = ?, venue_name = ?, time_text = ?, 
                footer_text = ?, template_id = ?, photo_url = ?, invite_type = ?, envelope_text = ?, loader_type = ?
            WHERE id = ?`,
            [
                slug, title, event_date, location, message,
                host_message, ceremony_message, venue_name, time_text,
                footer_text, template_id, photo_url, invite_type || 'card',
                envelope_text || 'Please join us',
                loader_type || 'envelope',
                show_map ? 1 : 0,
                google_maps_link || '',
                id
            ]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json({ message: 'Event updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Slug already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
