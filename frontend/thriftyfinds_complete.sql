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

-- Products table (updated with seller_id)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    seller_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
-- Add seller contact columns to users table
ALTER TABLE users 
ADD COLUMN phone VARCHAR(20) AFTER email,
ADD COLUMN address TEXT AFTER phone,
ADD COLUMN shop_name VARCHAR(255) AFTER address;

-- Update existing sellers with sample contact information
UPDATE users SET 
phone = '+977 9866311339',
address = 'Kathmandu, Nepal',
shop_name = 'Tech Haven'
WHERE email = 'seller@example.com';

UPDATE users SET 
phone = '+977 9806638907', 
address = 'Pokhara, Nepal',
shop_name = 'Mobile Bazaar'
WHERE email = 'sarah@seller.com';

-- Add more product details columns
ALTER TABLE products 
ADD COLUMN condition ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good' AFTER rating,
ADD COLUMN used_duration VARCHAR(100) AFTER condition,
ADD COLUMN original_price DECIMAL(10,2) AFTER used_duration,
ADD COLUMN warranty_remaining VARCHAR(100) AFTER original_price,
ADD COLUMN accessories_included TEXT AFTER warranty_remaining;

-- Order items table (for multiple products in one order)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    order_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY unique_order_review (order_id)
);


-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);
-- Ensure products table has proper structure
ALTER TABLE products 
MODIFY COLUMN seller_id INT NOT NULL,
MODIFY COLUMN status ENUM('active', 'inactive') DEFAULT 'active',
ADD COLUMN stock_quantity INT DEFAULT 1 AFTER price;

-- Update existing products to have seller_id (assign to existing sellers)
UPDATE products SET seller_id = 2 WHERE seller_id IS NULL AND brand IN ('samsung', 'oneplus');
UPDATE products SET seller_id = 5 WHERE seller_id IS NULL AND brand IN ('realme', 'apple', 'xiaomi');

-- Set all products as active
UPDATE products SET status = 'active' WHERE status IS NULL;


-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Seller stats table (for analytics)
CREATE TABLE IF NOT EXISTS seller_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    total_products INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    total_views INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seller (seller_id)
);

-- Product views table (for analytics)
CREATE TABLE IF NOT EXISTS product_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT DEFAULT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample users
INSERT INTO users (email, password, user_type, interests, budget_range) VALUES
('user@example.com', 'password123', 'user', '["samsung", "apple"]', '50-100'),
('seller@example.com', 'password123', 'seller', NULL, NULL),
('test@test.com', 'test123', 'user', '["samsung", "realme"]', '20-50'),
('john@email.com', 'john123', 'user', '["apple", "oneplus"]', '100+'),
('sarah@seller.com', 'sarah123', 'seller', NULL, NULL);

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Mobile Phones', 'mobile-phones', 'Smartphones and feature phones'),
('Tablets', 'tablets', 'iPad and Android tablets'),
('Accessories', 'accessories', 'Phone cases, chargers, and other accessories'),
('Smart Watches', 'smart-watches', 'Wearable technology'),
('Headphones', 'headphones', 'Wireless and wired headphones');

-- Insert sample products with seller IDs
INSERT INTO products (seller_id, title, description, price, brand, category, image_url, rating) VALUES
(2, 'Galaxy S25 Ultra (12/256GB)', 'Latest Samsung flagship with advanced features', 184999.00, 'samsung', 'mobile', 'images/samsung/Samsung-Galaxy-S25-Ultra-Titanium-Grey.jpg', 4.8),
(2, 'Galaxy Z Fold 6 (12/256GB)', 'Foldable smartphone with premium features', 214999.00, 'samsung', 'mobile', 'images/samsung/z-fold6.jpg', 4.7),
(2, 'Galaxy A35 5G (8/128GB)', 'Mid-range 5G smartphone', 46999.00, 'samsung', 'mobile', 'images/samsung/a35.jpg', 4.2),
(5, 'Realme GT 6T (12/512GB)', 'High-performance gaming phone', 65999.00, 'realme', 'mobile', 'images/realme/gt6t.jpg', 4.3),
(5, 'iPhone 15 Pro Max (256GB)', 'Apple flagship with premium features', 233499.00, 'apple', 'mobile', 'images/apple/15promax.jpg', 4.9),
(5, 'iPhone 14 (128GB)', 'Previous generation iPhone', 154999.00, 'apple', 'mobile', 'images/apple/iphone14.jpg', 4.5),
(2, 'OnePlus 12 (12/256GB)', 'Flagship killer with great performance', 89999.00, 'oneplus', 'mobile', 'images/oneplus/oneplus12.jpg', 4.6),
(5, 'Xiaomi 14 Ultra', 'Camera-focused flagship phone', 109999.00, 'xiaomi', 'mobile', 'images/xiaomi/mi14ultra.jpg', 4.4);

-- Insert sample orders
INSERT INTO orders (user_id, seller_id, product_id, total_amount, status, customer_name, customer_email, customer_phone, shipping_address) VALUES
(1, 2, 1, 184999.00, 'delivered', 'John Doe', 'user@example.com', '+1234567890', '123 Main St, City, State 12345'),
(3, 5, 4, 65999.00, 'shipped', 'Test User', 'test@test.com', '+0987654321', '456 Oak Ave, Town, State 67890'),
(1, 5, 5, 233499.00, 'pending', 'John Doe', 'user@example.com', '+1234567890', '123 Main St, City, State 12345'),
(4, 2, 3, 46999.00, 'confirmed', 'Sarah Johnson', 'john@email.com', '+1122334455', '789 Pine Rd, Village, State 54321');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 184999.00, 184999.00),
(2, 4, 1, 65999.00, 65999.00),
(3, 5, 1, 233499.00, 233499.00),
(4, 3, 1, 46999.00, 46999.00);

-- Insert sample reviews
INSERT INTO reviews (user_id, product_id, order_id, rating, comment) VALUES
(1, 1, 1, 5, 'Excellent phone! The camera quality is amazing and battery lasts all day.'),
(3, 4, 2, 4, 'Great performance for the price. Fast delivery and good packaging.');


-- Insert sample cart items
INSERT INTO cart (user_id, product_id, quantity) VALUES
(1, 2, 1),
(3, 3, 2),
(4, 5, 1);

-- Insert sample seller stats
INSERT INTO seller_stats (seller_id, total_products, total_orders, total_revenue, total_views, average_rating) VALUES
(2, 3, 2, 231998.00, 150, 4.57),
(5, 4, 2, 299498.00, 200, 4.53);

-- Insert sample product views
INSERT INTO product_views (product_id, user_id, ip_address) VALUES
(1, 1, '192.168.1.1'),
(1, 3, '192.168.1.2'),
(1, NULL, '192.168.1.3'),
(2, 1, '192.168.1.1'),
(4, 3, '192.168.1.2'),
(5, 4, '192.168.1.4'),
(5, 1, '192.168.1.1');

-- Create indexes for better performance
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_product_views_product_id ON product_views(product_id);
CREATE INDEX idx_product_views_viewed_at ON product_views(viewed_at);

-- Create views for common queries
CREATE VIEW product_sales AS
SELECT 
    p.id as product_id,
    p.title,
    p.brand,
    p.price,
    COUNT(o.id) as total_orders,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.total_price) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
GROUP BY p.id, p.title, p.brand, p.price;

CREATE VIEW seller_performance AS
SELECT 
    u.id as seller_id,
    u.email as seller_email,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COALESCE(AVG(r.rating), 0) as average_rating
FROM users u
LEFT JOIN products p ON u.id = p.seller_id
LEFT JOIN orders o ON u.id = o.seller_id AND o.status != 'cancelled'
LEFT JOIN reviews r ON p.id = r.product_id
WHERE u.user_type = 'seller'
GROUP BY u.id, u.email;

-- Create stored procedure for updating seller stats
DELIMITER //
CREATE PROCEDURE UpdateSellerStats(IN seller_id_param INT)
BEGIN
    DECLARE total_products INT;
    DECLARE total_orders INT;
    DECLARE total_revenue DECIMAL(15,2);
    DECLARE total_views INT;
    DECLARE avg_rating DECIMAL(3,2);
    
    -- Get total products
    SELECT COUNT(*) INTO total_products FROM products WHERE seller_id = seller_id_param;
    
    -- Get total orders and revenue
    SELECT COUNT(*), COALESCE(SUM(total_amount), 0) INTO total_orders, total_revenue 
    FROM orders WHERE seller_id = seller_id_param AND status != 'cancelled';
    
    -- Get total views
    SELECT COUNT(*) INTO total_views FROM product_views pv
    JOIN products p ON pv.product_id = p.id WHERE p.seller_id = seller_id_param;
    
    -- Get average rating
    SELECT COALESCE(AVG(r.rating), 0) INTO avg_rating FROM reviews r
    JOIN products p ON r.product_id = p.id WHERE p.seller_id = seller_id_param;
    
    -- Update or insert stats
    INSERT INTO seller_stats (seller_id, total_products, total_orders, total_revenue, total_views, average_rating)
    VALUES (seller_id_param, total_products, total_orders, total_revenue, total_views, avg_rating)
    ON DUPLICATE KEY UPDATE
        total_products = VALUES(total_products),
        total_orders = VALUES(total_orders),
        total_revenue = VALUES(total_revenue),
        total_views = VALUES(total_views),
        average_rating = VALUES(average_rating),
        last_updated = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Create trigger to update seller stats when new order is placed
DELIMITER //
CREATE TRIGGER after_order_insert
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    CALL UpdateSellerStats(NEW.seller_id);
END//
DELIMITER ;

-- Create trigger to update seller stats when order is updated
DELIMITER //
CREATE TRIGGER after_order_update
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    CALL UpdateSellerStats(NEW.seller_id);
    IF OLD.seller_id != NEW.seller_id THEN
        CALL UpdateSellerStats(OLD.seller_id);
    END IF;
END//
DELIMITER ;

-- Create trigger to update seller stats when product is added
DELIMITER //
CREATE TRIGGER after_product_insert
AFTER INSERT ON products
FOR EACH ROW
BEGIN
    CALL UpdateSellerStats(NEW.seller_id);
END//
DELIMITER ;

-- Create trigger to update seller stats when product is deleted
DELIMITER //
CREATE TRIGGER after_product_delete
AFTER DELETE ON products
FOR EACH ROW
BEGIN
    CALL UpdateSellerStats(OLD.seller_id);
END//
DELIMITER ;

-- Add order tracking system to existing database

-- Ensure orders table has all necessary columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id INT NOT NULL AFTER id,
ADD COLUMN IF NOT EXISTS product_id INT NOT NULL AFTER seller_id,
ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1 AFTER product_id,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL AFTER quantity,
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add foreign key constraints if not exists
ALTER TABLE orders 
ADD FOREIGN KEY IF NOT EXISTS (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD FOREIGN KEY IF NOT EXISTS (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Insert sample orders for users
INSERT IGNORE INTO orders (user_id, seller_id, product_id, quantity, total_amount, status, shipping_address, customer_name, customer_email, customer_phone) VALUES
(1, 2, 1, 1, 184999.00, 'delivered', '123 Main St, City, State 12345', 'John Doe', 'user@example.com', '+1234567890'),
(1, 5, 4, 1, 65999.00, 'shipped', '123 Main St, City, State 12345', 'John Doe', 'user@example.com', '+1234567890'),
(3, 2, 3, 2, 93998.00, 'confirmed', '456 Oak Ave, Town, State 67890', 'Test User', 'test@test.com', '+0987654321'),
(1, 5, 5, 1, 233499.00, 'pending', '123 Main St, City, State 12345', 'John Doe', 'user@example.com', '+1234567890');

-- Create order_items table if not exists
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert sample order items
INSERT IGNORE INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 184999.00, 184999.00),
(2, 4, 1, 65999.00, 65999.00),
(3, 3, 2, 46999.00, 93998.00),
(4, 5, 1, 233499.00, 233499.00);

-- Create user_addresses table for saved addresses
CREATE TABLE IF NOT EXISTS user_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_type ENUM('home', 'work', 'other') DEFAULT 'home',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample addresses
INSERT IGNORE INTO user_addresses (user_id, address_type, full_name, phone, address_line1, city, state, zip_code, is_default) VALUES
(1, 'home', 'John Doe', '+1234567890', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', TRUE),
(1, 'work', 'John Doe', '+1234567890', '456 Business Park', 'Mumbai', 'Maharashtra', '400020', FALSE),
(3, 'home', 'Test User', '+0987654321', '789 Oak Avenue', 'Delhi', 'Delhi', '110001', TRUE);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- Add new columns to users table for profile information
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) AFTER email,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER full_name;

-- Update existing users with sample data
UPDATE users SET 
full_name = 'John Doe',
phone = '+1234567890'
WHERE email = 'user@example.com';

UPDATE users SET 
full_name = 'Test User', 
phone = '+0987654321'
WHERE email = 'test@test.com';

UPDATE users SET 
full_name = 'Sarah Johnson',
phone = '+1122334455'
WHERE email = 'john@email.com';


-- Add status and updated_at columns to products table if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing products to have active status
UPDATE products SET status = 'active' WHERE status IS NULL;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    khalti_token VARCHAR(255),
    khalti_transaction_id VARCHAR(255),
    khalti_confirmation_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'khalti',
    payment_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Add payment_status to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending';

-- Add indexes for better performance
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_khalti_id ON payments(khalti_transaction_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Show confirmation
SELECT 'Database setup completed successfully!' as status;