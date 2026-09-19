CREATE DATABASE IF NOT EXISTS ecommerce_db;

USE ecommerce_db;
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500) DEFAULT '',
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM(
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    shipping_name VARCHAR(150) NOT NULL,
    shipping_email VARCHAR(150) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_order_items_order
      FOREIGN KEY (order_id)
      REFERENCES orders(id)
      ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
      FOREIGN KEY (product_id)
      REFERENCES products(id)
      ON DELETE RESTRICT
);
 INSERT INTO products
    (name, description, price, image, stock, category)
VALUES

('Headphones',
 'Premium wireless headphones with high-quality sound and comfortable design.',
 2499.00,
 'headphoneimg.jpg',
 20,
 'Electronics'),

('iPhone',
 'Latest iPhone with powerful performance, premium design and advanced camera.',
 69999.00,
 'iphoneimg.jpg',
 15,
 'Electronics'),

('Laptop',
 'Modern high-performance laptop suitable for work, study and entertainment.',
 59999.00,
 'laptopimg.jpg',
 10,
 'Electronics'),

('Premium Perfume',
 'Long-lasting premium fragrance suitable for everyday use and special occasions.',
 1999.00,
 'perfumeimg.jpg',
 25,
 'Beauty'),

('Formal Shirt',
 'Stylish formal shirt made with comfortable fabric for a clean modern look.',
 1299.00,
 'shirting.jpg',
 30,
 'Fashion'),

('Running Shoes',
 'Lightweight and comfortable running shoes designed for daily workouts.',
 1899.00,
 'shoeimg.jpg',
 20,
 'Fashion'),

('Sunglasses',
 'Stylish sunglasses with a modern design suitable for everyday wear.',
 999.00,
 'sunglassimg.jpg',
 25,
 'Fashion'),

('Classic Watch',
 'Elegant wristwatch with a premium design suitable for everyday and formal wear.',
 2499.00,
 'watchimg.jpg',
 18,
 'Accessories');