-- ============================================================
-- A2PEX Kits — Football Kits E-Commerce — MySQL Schema
-- No sample data is inserted. The database starts empty.
-- ============================================================

CREATE DATABASE IF NOT EXISTS a2pex
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE a2pex;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- admins  (Admin Dashboard authentication)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- users  (optional — guest checkout is used by default;
-- this table exists for a future "customer accounts" feature)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(30)  DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- categories  (used for League / homepage category browsing)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL UNIQUE,   -- e.g. "Premier League", "La Liga"
  slug        VARCHAR(140) NOT NULL UNIQUE,
  image_url   VARCHAR(500) DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id        INT UNSIGNED DEFAULT NULL,
  club_name          VARCHAR(150) NOT NULL,
  league             VARCHAR(150) DEFAULT NULL,     -- denormalized copy for fast search/filtering
  season             VARCHAR(20)  NOT NULL,          -- e.g. "2025/2026"
  kit_type           ENUM('Home','Away','Third','Goalkeeper') NOT NULL DEFAULT 'Home',
  brand              VARCHAR(80)  NOT NULL,          -- e.g. "Nike", "Adidas", "Puma"
  slug               VARCHAR(220) NOT NULL UNIQUE,
  description        TEXT,
  price              DECIMAL(10,2) NOT NULL,
  discount_percent   DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  stock_quantity     INT UNSIGNED NOT NULL DEFAULT 0,
  is_featured        TINYINT(1) NOT NULL DEFAULT 0,
  is_active          TINYINT(1) NOT NULL DEFAULT 1,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_products_club (club_name),
  INDEX idx_products_league (league),
  INDEX idx_products_brand (brand),
  INDEX idx_products_season (season),
  INDEX idx_products_price (price),
  FULLTEXT INDEX ft_products_search (club_name, league, brand, description)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- product_images  (a product can have multiple images)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS product_images;
CREATE TABLE product_images (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  image_url   VARCHAR(500) NOT NULL,
  is_primary  TINYINT(1) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- product_sizes  (which sizes are available for a product)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS product_sizes;
CREATE TABLE product_sizes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  size        ENUM('XS','S','M','L','XL','XXL','XXXL') NOT NULL,
  CONSTRAINT fk_sizes_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uniq_product_size (product_id, size)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- orders  (created at checkout)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED DEFAULT NULL,
  customer_name   VARCHAR(150) NOT NULL,
  email           VARCHAR(150) NOT NULL,
  phone           VARCHAR(30)  NOT NULL,
  address         VARCHAR(255) NOT NULL,
  city            VARCHAR(100) DEFAULT NULL,
  status          ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  subtotal        DECIMAL(10,2) NOT NULL,
  total_amount    DECIMAL(10,2) NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- order_items
-- ------------------------------------------------------------
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED DEFAULT NULL,
  club_name   VARCHAR(150) NOT NULL,   -- snapshot at time of order
  size        VARCHAR(10)  NOT NULL,
  quantity    INT UNSIGNED NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,
  subtotal    DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
