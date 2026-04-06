-- Create the database
CREATE DATABASE IF NOT EXISTS syntechcraft_invites;
USE syntechcraft_invites;

-- Create the events table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    event_date DATETIME NOT NULL,
    location VARCHAR(255),
    message TEXT
);

-- Insert sample data
INSERT INTO events (slug, title, event_date, location, message) 
VALUES ('test-wedding', 'Kasun & Kavya Wedding', '2026-08-15 09:30:00', 'Galle Face Hotel', 'We cant wait to celebrate with you!');
