-- Database schema for Todo Application

-- Create the database
CREATE DATABASE IF NOT EXISTS todo_app;
USE todo_app;

-- Create the users table (for future Version 2)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the todos table
CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample records
INSERT INTO todos (title, description, status, priority, due_date) VALUES
('Learn Python', 'Study Flask and MySQL fundamentals', 'pending', 'high', '2026-10-15'),
('Build Todo App', 'Create a complete Todo application', 'pending', 'medium', '2026-10-20'),
('Study CSS', 'Learn responsive design and styling', 'completed', 'low', '2026-10-08'),
('Practice SQL', 'Database queries and optimization', 'pending', 'high', '2026-10-25');

-- Show the table structure
DESCRIBE todos;