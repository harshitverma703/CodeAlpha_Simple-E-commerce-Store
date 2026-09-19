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
    ('Wireless Headphones',
     'Comfortable wireless headphones with clear sound.',
     1499.00,
     '',
     25,
     'Electronics'),

    ('Smart Watch',
     'Fitness and notification smartwatch for everyday use.',
     2499.00,
     '',
     18,
     'Electronics'),

    ('Classic Backpack',
     'Durable everyday backpack with multiple compartments.',
     999.00,
     '',
     30,
     'Accessories'),

    ('Running Shoes',
     'Lightweight shoes for running and daily workouts.',
     1899.00,
     '',
     20,
     'Fashion'),

    ('Mechanical Keyboard',
     'Compact mechanical keyboard for work and gaming.',
     2999.00,
     '',
     12,
     'Electronics'),

    ('Desk Lamp',
     'Minimal LED desk lamp with adjustable brightness.',
     799.00,
     '',
     35,
     'Home');
