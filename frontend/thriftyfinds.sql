-- Create database
CREATE DATABASE IF NOT EXISTS thriftyfinds;
USE thriftyfinds;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('user', 'seller') DEFAULT 'user',
    interests JSON,
    budget_range VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing data
DELETE FROM users;
DELETE FROM products;

-- Insert sample users with EXACT passwords
INSERT INTO users (email, password, user_type, interests, budget_range) VALUES
('user@example.com', 'password123', 'user', '["samsung", "apple"]', '50-100'),
('seller@example.com', 'password123', 'seller', NULL, NULL),
('test@test.com', 'test123', 'user', '["samsung", "realme"]', '20-50');

-- Insert sample products
INSERT INTO products (title, description, price, brand, category, image_url, rating) VALUES
('Galaxy S25 Ultra (12/256GB)', 'Latest Samsung flagship with advanced features', 184999.00, 'samsung', 'mobile', 'images/samsung/Samsung-Galaxy-S25-Ultra-Titanium-Grey.jpg', 4.8),
('Galaxy Z Fold 6 (12/256GB)', 'Foldable smartphone with premium features', 214999.00, 'samsung', 'mobile', 'images/samsung/z-fold6.jpg', 4.7),
('Galaxy A35 5G (8/128GB)', 'Mid-range 5G smartphone', 46999.00, 'samsung', 'mobile', 'images/samsung/a35.jpg', 4.2),
('Realme GT 6T (12/512GB)', 'High-performance gaming phone', 65999.00, 'realme', 'mobile', 'images/realme/gt6t.jpg', 4.3),
('iPhone 15 Pro Max (256GB)', 'Apple flagship with premium features', 233499.00, 'apple', 'mobile', 'images/apple/15promax.jpg', 4.9);