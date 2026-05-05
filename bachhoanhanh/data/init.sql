CREATE DATABASE IF NOT EXISTS productdb;
CREATE DATABASE IF NOT EXISTS orderdb;
CREATE DATABASE IF NOT EXISTS branddb;
CREATE DATABASE IF NOT EXISTS catalogdb;
CREATE DATABASE IF NOT EXISTS paymentdb;

GRANT ALL PRIVILEGES ON orderdb.*   TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON branddb.*   TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON catalogdb.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON paymentdb.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

-- ─────────────────────────────────────────
-- PRODUCT DB
-- ─────────────────────────────────────────
USE productdb;

CREATE TABLE IF NOT EXISTS product (
                                       id    BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       name  VARCHAR(255),
    price DOUBLE
    );

INSERT INTO product (name, price) VALUES
                                      ('Pork Belly',        5.99),
                                      ('Chicken Breast',    4.49),
                                      ('Salmon Fillet',     8.99),
                                      ('Free-Range Eggs',   3.29),
                                      ('Whole Milk',        1.99),
                                      ('Cheddar Cheese',    4.79),
                                      ('White Rice (5kg)',  6.49),
                                      ('Spaghetti',         1.59),
                                      ('Carrot',            0.99),
                                      ('Broccoli',          1.49),
                                      ('Tomato',            1.29),
                                      ('Spinach',           1.89),
                                      ('Apple',             2.49),
                                      ('Banana',            1.19),
                                      ('Orange',            2.09),
                                      ('Cooking Oil (1L)',  3.99),
                                      ('Soy Sauce (500ml)', 2.29),
                                      ('Sugar (1kg)',       1.49),
                                      ('Salt (500g)',       0.79),
                                      ('Instant Noodles',   0.59);

-- ─────────────────────────────────────────
-- BRAND DB
-- ─────────────────────────────────────────
USE branddb;

CREATE TABLE IF NOT EXISTS brand (
                                     id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     name         VARCHAR(255),
    image        VARCHAR(255),
    description  TEXT,
    phone_number VARCHAR(50),
    email        VARCHAR(255)
    );

INSERT INTO brand (name, image, description, phone_number, email) VALUES
                                                                      ('Fresh Farm',   'freshfarm.png',   'Local farm supplying fresh vegetables and fruits daily.',           '+84-28-1234-5678', 'contact@freshfarm.vn'),
                                                                      ('Happy Eggs',   'happyeggs.png',   'Free-range egg producer with certified humane standards.',          '+84-28-2345-6789', 'hello@happyeggs.vn'),
                                                                      ('Meat Master',  'meatmaster.png',  'Premium pork, beef and poultry from trusted local suppliers.',     '+84-28-3456-7890', 'support@meatmaster.vn'),
                                                                      ('Ocean Catch',  'oceancatch.png',  'Sustainable seafood sourced fresh from Vietnamese coastal farms.',  '+84-28-4567-8901', 'info@oceancatch.vn'),
                                                                      ('Dairy Best',   'dairybest.png',   'Pasteurized milk, cheese and yogurt from highland cattle farms.',  '+84-28-5678-9012', 'care@dairybest.vn'),
                                                                      ('Grain House',  'grainhouse.png',  'Rice, flour, pasta and dry goods from certified grain mills.',     '+84-28-6789-0123', 'sales@grainhouse.vn'),
                                                                      ('Pantry Plus',  'pantryplus.png',  'Condiments, cooking oil, sauces and everyday pantry staples.',     '+84-28-7890-1234', 'hello@pantryplus.vn');

-- ─────────────────────────────────────────
-- CATALOG DB
-- ─────────────────────────────────────────
USE catalogdb;

CREATE TABLE IF NOT EXISTS catalog (
                                       id                VARCHAR(255) PRIMARY KEY,
    name              VARCHAR(255),
    image             VARCHAR(255),
    parent_catalog_id VARCHAR(255),
    FOREIGN KEY (parent_catalog_id) REFERENCES catalog(id)
    );

-- Root categories (no parent)
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('fresh-food',     'Fresh Food',     'cat_fresh_food.png', NULL),
                                                             ('dairy-eggs',     'Dairy & Eggs',   'cat_dairy_eggs.png', NULL),
                                                             ('meat-seafood',   'Meat & Seafood', 'cat_meat.png',       NULL),
                                                             ('dry-goods',      'Dry Goods',      'cat_dry_goods.png',  NULL),
                                                             ('pantry',         'Pantry',         'cat_pantry.png',     NULL);

-- Sub-categories of Fresh Food
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('fresh-food-vegetables', 'Vegetables', 'cat_vegetables.png', 'fresh-food'),
                                                             ('fresh-food-fruits',     'Fruits',     'cat_fruits.png',     'fresh-food');

-- Sub-categories of Dairy & Eggs
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('dairy-eggs-milk',   'Milk',   'cat_milk.png',   'dairy-eggs'),
                                                             ('dairy-eggs-cheese', 'Cheese', 'cat_cheese.png', 'dairy-eggs'),
                                                             ('dairy-eggs-eggs',   'Eggs',   'cat_eggs.png',   'dairy-eggs');

-- Sub-categories of Meat & Seafood
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('meat-seafood-pork',    'Pork',    'cat_pork.png',    'meat-seafood'),
                                                             ('meat-seafood-chicken', 'Chicken', 'cat_chicken.png', 'meat-seafood'),
                                                             ('meat-seafood-beef',    'Beef',    'cat_beef.png',    'meat-seafood'),
                                                             ('meat-seafood-seafood', 'Seafood', 'cat_seafood.png', 'meat-seafood');

-- Sub-categories of Dry Goods
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('dry-goods-rice-grains', 'Rice & Grains', 'cat_rice.png',   'dry-goods'),
                                                             ('dry-goods-noodles',     'Noodles',       'cat_noodle.png', 'dry-goods');

-- Sub-categories of Pantry
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('pantry-cooking-oil', 'Cooking Oil',  'cat_oil.png',   'pantry'),
                                                             ('pantry-sauces',      'Sauces',       'cat_sauce.png', 'pantry'),
                                                             ('pantry-sugar-salt',  'Sugar & Salt', 'cat_sugar.png', 'pantry');