-- ═══════════════════════════════════════════════════════
-- DATABASE INITIALIZATION SCRIPT (UPDATED)
-- ═══════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS productdb;
CREATE DATABASE IF NOT EXISTS orderdb;
CREATE DATABASE IF NOT EXISTS branddb;
CREATE DATABASE IF NOT EXISTS catalogdb;
CREATE DATABASE IF NOT EXISTS paymentdb;
CREATE DATABASE IF NOT EXISTS userdb; -- Thêm dòng này

GRANT ALL PRIVILEGES ON productdb.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON orderdb.*   TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON branddb.*   TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON catalogdb.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON paymentdb.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON userdb.*    TO 'appuser'@'%'; -- Thêm dòng này
FLUSH PRIVILEGES;

-- ═══════════════════════════════════════════════════════
-- USER DB
-- ═══════════════════════════════════════════════════════
USE userdb;

CREATE TABLE IF NOT EXISTS users (
                                     keycloak_id  VARCHAR(255) PRIMARY KEY,
    phone        VARCHAR(20)  NOT NULL UNIQUE,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(255) UNIQUE,
    role         VARCHAR(20)  NOT NULL
    );
-- 2. staff_profiles: shares PK with users via @MapsId
CREATE TABLE IF NOT EXISTS staff_profiles (
                                              keycloak_id    VARCHAR(255) PRIMARY KEY,
    date_of_birth  DATE,
    id_card_number VARCHAR(50) UNIQUE,
    avatar_url     VARCHAR(500),
    is_female      BOOLEAN DEFAULT FALSE,
    address        VARCHAR(500),
    FOREIGN KEY (keycloak_id) REFERENCES users(keycloak_id) ON DELETE CASCADE
    );

-- 3. customer_profiles: shares PK with users via @MapsId
CREATE TABLE IF NOT EXISTS customer_profiles (
                                                 keycloak_id    VARCHAR(255) PRIMARY KEY,
    loyalty_points INT NOT NULL DEFAULT 0,
    FOREIGN KEY (keycloak_id) REFERENCES users(keycloak_id) ON DELETE CASCADE
    );

-- 4. claimed_promotions: FK → customer_profiles.keycloak_id
CREATE TABLE IF NOT EXISTS claimed_promotions (
                                                  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                  keycloak_id     VARCHAR(255) NOT NULL,
    promotion_code  VARCHAR(100) NOT NULL,
    claimed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (keycloak_id) REFERENCES customer_profiles(keycloak_id) ON DELETE CASCADE
    );

-- ═══════════════════════════════════════════════════════
-- USER DB INITIALIZATION
-- ═══════════════════════════════════════════════════════
USE userdb;

-- 1. Main Users Table
INSERT INTO users (keycloak_id, phone, first_name, last_name, email, role) VALUES
                                                                               ('admin-uuid-123',                       '0901000001', 'System', 'Admin',     'admin@bachhoanhanh.vn', 'ADMIN'),
                                                                               ('a1234567-89ab-cdef-0123-456789abcdef', '0901000002', 'Anh',    'Developer', 'dev@bachhoanhanh.vn',   'STAFF'),
                                                                               ('e3d7b2bf-943b-4f08-93ea-5189afc85172', '0901000003', 'Van A',  'Nguyen',    'test@gmail.com',        'CUSTOMER');
-- 2. Staff Profiles (Linked to Admin and Staff)
INSERT INTO staff_profiles (keycloak_id, is_female, address) VALUES
                                                                 ('admin-uuid-123',                       FALSE, 'Ho Chi Minh City'),
                                                                 ('a1234567-89ab-cdef-0123-456789abcdef', FALSE, 'Ho Chi Minh City');

-- 3. Customer Profiles (Linked to Test Customer)
INSERT INTO customer_profiles (keycloak_id, loyalty_points) VALUES
    ('e3d7b2bf-943b-4f08-93ea-5189afc85172', 100);
-- ═══════════════════════════════════════════════════════
-- BRAND DB
-- ═══════════════════════════════════════════════════════
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
                                                                      ('Fresh Farm',  'freshfarm.png',  'Local farm supplying fresh vegetables and fruits daily.',           '+84-28-1234-5678', 'contact@freshfarm.vn'),
                                                                      ('Happy Eggs',  'happyeggs.png',  'Free-range egg producer with certified humane standards.',          '+84-28-2345-6789', 'hello@happyeggs.vn'),
                                                                      ('Meat Master', 'meatmaster.png', 'Premium pork, beef and poultry from trusted local suppliers.',      '+84-28-3456-7890', 'support@meatmaster.vn'),
                                                                      ('Ocean Catch', 'oceancatch.png', 'Sustainable seafood sourced fresh from Vietnamese coastal farms.',  '+84-28-4567-8901', 'info@oceancatch.vn'),
                                                                      ('Dairy Best',  'dairybest.png',  'Pasteurized milk, cheese and yogurt from highland cattle farms.',   '+84-28-5678-9012', 'care@dairybest.vn'),
                                                                      ('Grain House', 'grainhouse.png', 'Rice, flour, pasta and dry goods from certified grain mills.',      '+84-28-6789-0123', 'sales@grainhouse.vn'),
                                                                      ('Pantry Plus', 'pantryplus.png', 'Condiments, cooking oil, sauces and everyday pantry staples.',      '+84-28-7890-1234', 'hello@pantryplus.vn'),
                                                                      ('Snack Time',  'snacktime.png',  'Delicious snacks, potato chips, and savory treats.',                '+84-28-8901-2345', 'info@snacktime.vn'),
                                                                      ('Aqua Pure',   'aquapure.png',   'Purified and mineral water from natural springs.',                  '+84-28-9012-3456', 'sales@aquapure.vn'),
                                                                      ('Clean Home',  'cleanhome.png',  'Top-tier household cleaning and laundry products.',                 '+84-28-0123-4567', 'contact@cleanhome.vn');

-- ═══════════════════════════════════════════════════════
-- CATALOG DB
-- ═══════════════════════════════════════════════════════
USE catalogdb;

CREATE TABLE IF NOT EXISTS catalog (
                                       id                VARCHAR(255) PRIMARY KEY,
    name              VARCHAR(255),
    image             TEXT,
    parent_catalog_id VARCHAR(255),
    FOREIGN KEY (parent_catalog_id) REFERENCES catalog(id)
    );

-- Root categories
-- Note: fresh-food uses a clean public URL instead of base64
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('fresh-food',         'Fresh Food',           'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/1200px-Good_Food_Display_-_NCI_Visuals_Online.jpg', NULL),
                                                             ('dairy-eggs',         'Dairy & Eggs',          'cat_dairy_eggs.png',  NULL),
                                                             ('meat-seafood',       'Meat & Seafood',         'cat_meat.png',        NULL),
                                                             ('dry-goods',          'Dry Goods',              'cat_dry_goods.png',   NULL),
                                                             ('pantry',             'Pantry',                 'cat_pantry.png',      NULL),
                                                             ('snacks-sweets',      'Snacks & Sweets',        'cat_snacks.png',      NULL),
                                                             ('beverages',          'Beverages',              'cat_beverages.png',   NULL),
                                                             ('household-cleaning', 'Household & Cleaning',   'cat_household.png',   NULL),
                                                             ('personal-care',      'Personal Care',          'cat_personal.png',    NULL);

-- Sub-categories: Fresh Food
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('fresh-food-vegetables', 'Vegetables', 'cat_vegetables.png', 'fresh-food'),
                                                             ('fresh-food-fruits',     'Fruits',     'cat_fruits.png',     'fresh-food'),
                                                             ('fresh-food-herbs',      'Herbs',      'cat_herbs.png',      'fresh-food');

-- Sub-categories: Dairy & Eggs
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('dairy-eggs-milk',   'Milk',   'cat_milk.png',   'dairy-eggs'),
                                                             ('dairy-eggs-cheese', 'Cheese', 'cat_cheese.png', 'dairy-eggs'),
                                                             ('dairy-eggs-eggs',   'Eggs',   'cat_eggs.png',   'dairy-eggs'),
                                                             ('dairy-eggs-yogurt', 'Yogurt', 'cat_yogurt.png', 'dairy-eggs');

-- Sub-categories: Meat & Seafood
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('meat-seafood-pork',    'Pork',    'cat_pork.png',    'meat-seafood'),
                                                             ('meat-seafood-chicken', 'Chicken', 'cat_chicken.png', 'meat-seafood'),
                                                             ('meat-seafood-beef',    'Beef',    'cat_beef.png',    'meat-seafood'),
                                                             ('meat-seafood-seafood', 'Seafood', 'cat_seafood.png', 'meat-seafood');

-- Sub-categories: Dry Goods & Pantry
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('dry-goods-rice-grains', 'Rice & Grains', 'cat_rice.png',   'dry-goods'),
                                                             ('dry-goods-noodles',     'Noodles',        'cat_noodle.png', 'dry-goods'),
                                                             ('pantry-cooking-oil',    'Cooking Oil',    'cat_oil.png',    'pantry'),
                                                             ('pantry-sauces',         'Sauces',         'cat_sauce.png',  'pantry'),
                                                             ('pantry-sugar-salt',     'Sugar & Salt',   'cat_sugar.png',  'pantry');

-- Sub-categories: Snacks, Beverages, Household, Personal Care
INSERT INTO catalog (id, name, image, parent_catalog_id) VALUES
                                                             ('snacks-chips',           'Chips & Crisps',    'cat_chips.png',    'snacks-sweets'),
                                                             ('snacks-candies',         'Candies & Choco',   'cat_candies.png',  'snacks-sweets'),
                                                             ('beverages-water',        'Mineral Water',     'cat_water.png',    'beverages'),
                                                             ('beverages-soft-drinks',  'Soft Drinks',       'cat_soda.png',     'beverages'),
                                                             ('beverages-beer',         'Beer & Cider',      'cat_beer.png',     'beverages'),
                                                             ('household-laundry',      'Laundry',           'cat_laundry.png',  'household-cleaning'),
                                                             ('household-dishwash',     'Dishwashing',       'cat_dishwash.png', 'household-cleaning'),
                                                             ('personal-care-hair',     'Hair Care',         'cat_hair.png',     'personal-care'),
                                                             ('personal-care-body',     'Body Wash & Soaps', 'cat_bodywash.png', 'personal-care'),
                                                             ('personal-care-oral',     'Oral Care',         'cat_oral.png',     'personal-care');

-- ═══════════════════════════════════════════════════════
-- PRODUCT DB
-- ═══════════════════════════════════════════════════════
USE productdb;

CREATE TABLE IF NOT EXISTS attribute_type (
                                              name      VARCHAR(100) PRIMARY KEY,
    data_type VARCHAR(50) NOT NULL
    );

CREATE TABLE IF NOT EXISTS prototype (
                                         product_id        VARCHAR(100) PRIMARY KEY,
    catalog_id        VARCHAR(255),
    name              VARCHAR(255),
    packed_attributes VARCHAR(1000)
    );

CREATE TABLE IF NOT EXISTS base_product (
                                            product_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
                                            barcode        VARCHAR(50) NOT NULL UNIQUE,
    name           VARCHAR(255),
    image          TEXT,
    description    TEXT,
    catalog_id     VARCHAR(255),
    original_price DOUBLE,
    prototype_id   VARCHAR(100),
    FOREIGN KEY (prototype_id) REFERENCES prototype(product_id)
    );

CREATE TABLE IF NOT EXISTS attribute (
                                         product_id BIGINT       NOT NULL,
                                         type       VARCHAR(100) NOT NULL,
    value      VARCHAR(255),
    PRIMARY KEY (product_id, type),
    FOREIGN KEY (type)       REFERENCES attribute_type(name),
    FOREIGN KEY (product_id) REFERENCES base_product(product_id)
    );

-- ───────────────────────────────────────────────────────
-- Attribute Types
-- ───────────────────────────────────────────────────────
INSERT INTO attribute_type (name, data_type) VALUES
                                                 ('EXPIRY_DATE',          'Date'),
                                                 ('IMPORT_DATE',          'Date'),
                                                 ('EXPORT_DATE',          'Date'),
                                                 ('WEIGHT',               'Weight'),
                                                 ('VOLUME',               'Unit'),
                                                 ('UNIT',                 'Unit'),
                                                 ('QUANTITY',             'Number'),
                                                 ('ORIGIN',               'String'),
                                                 ('BRAND',                'String'),
                                                 ('INGREDIENTS',          'String'),
                                                 ('ENERGY',               'String'),
                                                 ('USAGE_INSTRUCTIONS',   'String'),
                                                 ('STORAGE_INSTRUCTIONS', 'String'),
                                                 ('WARNINGS',             'String'),
                                                 ('BENEFITS',             'String'),
                                                 ('SUITABLE_FOR',         'String');

-- ───────────────────────────────────────────────────────
-- Prototypes
-- ───────────────────────────────────────────────────────
INSERT INTO prototype (product_id, catalog_id, name, packed_attributes) VALUES
                                                                            ('MEAT_FRESH',         'meat-seafood-pork',     'Fresh Meat',         'BRAND,EXPIRY_DATE,WEIGHT,ORIGIN,STORAGE_INSTRUCTIONS'),
                                                                            ('VEGGIE_PACK',        'fresh-food-vegetables', 'Packed Vegetables',  'BRAND,EXPIRY_DATE,WEIGHT,ORIGIN'),
                                                                            ('MILK_BOTTLE',        'dairy-eggs-milk',       'Milk Bottle',        'BRAND,EXPIRY_DATE,VOLUME,INGREDIENTS,STORAGE_INSTRUCTIONS'),
                                                                            ('SNACK_BAG',          'snacks-chips',          'Snack Bag',          'BRAND,EXPIRY_DATE,WEIGHT,INGREDIENTS,ENERGY,WARNINGS'),
                                                                            ('BEVERAGE_CAN',       'beverages-soft-drinks', 'Beverage Can',       'BRAND,EXPIRY_DATE,VOLUME,INGREDIENTS,ENERGY'),
                                                                            ('CLEANING_BOTTLE',    'household-dishwash',    'Cleaning Liquid',    'BRAND,VOLUME,USAGE_INSTRUCTIONS,WARNINGS'),
                                                                            ('PERSONAL_CARE_TUBE', 'personal-care-oral',    'Personal Care Tube', 'BRAND,WEIGHT,BENEFITS,USAGE_INSTRUCTIONS,SUITABLE_FOR');

-- ───────────────────────────────────────────────────────
-- Base Products
-- ───────────────────────────────────────────────────────
INSERT INTO base_product (barcode, name, image, description, catalog_id, original_price, prototype_id) VALUES
                                                                                                           ('893000111', 'Ba rọi heo VietGAP',
                                                                                                            'https://www.vissan.com.vn/images/2024/ba_roi_heo_3.jpg',
                                                                                                            'Clean, high-quality pork belly.',
                                                                                                            'meat-seafood-pork', 120000, 'MEAT_FRESH'),

                                                                                                           ('893000222', 'Xà lách thủy canh',
                                                                                                            'https://cdnv2.tgdd.vn/bhx-static/bhx/Products/Images/8820/303824/bhx/cdntgddvnproductsimages8820303824bhxxa-lach-thuy-tinh-thuy-canh-cay-tu-230g-202303170840082958_202408301739034659.jpg',
                                                                                                            'Fresh hydroponic lettuce.',
                                                                                                            'fresh-food-vegetables', 25000, 'VEGGIE_PACK'),

                                                                                                           ('893000333', 'Sữa tươi TH 1L',
                                                                                                            'https://cdn.tgdd.vn/Products/Images/2386/79294/bhx/sua-tuoi-tiet-trung-nguyen-chat-khong-duong-th-true-milk-hop-1-lit-202104132312338829.jpg',
                                                                                                            '100% pure fresh milk.',
                                                                                                            'dairy-eggs-milk', 35000, 'MILK_BOTTLE'),

                                                                                                           ('893000444', 'Lay\'s Classic Potato Chips',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSA6V-Q1rVRmNaCPEab-knDMXoDswMvFIYqQ&s',
        'Crispy and salty potato chips.',
        'snacks-chips', 22000, 'SNACK_BAG'),

    ('893000555', 'Coca-Cola Original 320ml',
        'https://cdnv2.tgdd.vn/webmwg/comment/ef/4a/ef4a44fb0c806a130d74efca2ee6ce87.jpg',
        'Refreshing carbonated soft drink.',
        'beverages-soft-drinks', 10000, 'BEVERAGE_CAN'),

    ('893000666', 'Sunlight Lemon Dishwash',
        'https://horeco.vn/cdn/shop/files/nuoc-rua-chen-sunlight-1-1.jpg?v=1763612936',
        'Powerful grease-cutting dishwashing liquid.',
        'household-dishwash', 32000, 'CLEANING_BOTTLE'),

    ('893000777', 'Colgate Cavity Protection',
        'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lzoptp6lgxjd4c',
        'Fluoride toothpaste for cavity protection.',
        'personal-care-oral', 40000, 'PERSONAL_CARE_TUBE'),

    ('893000888', 'Tiger Beer Crystal',
        'https://product.hstatic.net/200000077081/product/t3_bb708872cf3f41639f05ed14afbcc857_grande.jpg',
        'Cold-filtered crisp beer.',
        'beverages-beer', 18000, 'BEVERAGE_CAN'),

    ('893000999', 'Omo Matic Liquid Detergent',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfj-i1q46t1P3GCWGmtv9XovEcuCajJTEwKg&s',
        'Liquid detergent for front load washing machines.',
        'household-laundry', 145000, 'CLEANING_BOTTLE'),

    ('893001000', 'Chupa Chups Lollipops',
        'https://stuartalexander.com.au/cdn/shop/files/strawb_5ad96108-8d6c-4cf0-9728-991f80fefed8.jpg?v=1710902846&width=3550',
        'Mixed fruit flavor lollipops bag.',
        'snacks-candies', 30000, 'SNACK_BAG');

-- ───────────────────────────────────────────────────────
-- Attributes
-- ───────────────────────────────────────────────────────

-- Product 1: Ba rọi heo VietGAP
INSERT INTO attribute (product_id, type, value) VALUES
    (1, 'BRAND',                'Meat Master'),
    (1, 'EXPIRY_DATE',          '2026-05-10'),
    (1, 'WEIGHT',               '500g'),
    (1, 'ORIGIN',               'Long An, Vietnam'),
    (1, 'STORAGE_INSTRUCTIONS', 'Keep refrigerated at 0-4 degrees Celsius');

-- Product 2: Xà lách thủy canh
INSERT INTO attribute (product_id, type, value) VALUES
    (2, 'BRAND',       'Fresh Farm'),
    (2, 'EXPIRY_DATE', '2026-05-09'),
    (2, 'WEIGHT',      '200g'),
    (2, 'ORIGIN',      'Da Lat, Vietnam');

-- Product 3: Sữa tươi TH 1L
INSERT INTO attribute (product_id, type, value) VALUES
    (3, 'BRAND',                'Dairy Best'),
    (3, 'EXPIRY_DATE',          '2026-06-01'),
    (3, 'VOLUME',               '1 Lit'),
    (3, 'INGREDIENTS',          '100% Fresh Cow Milk'),
    (3, 'STORAGE_INSTRUCTIONS', 'Refrigerate after opening and consume within 3 days');

-- Product 4: Lay's Classic Potato Chips
INSERT INTO attribute (product_id, type, value) VALUES
    (4, 'BRAND',       'Snack Time'),
                                                                                                            (4, 'EXPIRY_DATE', '2026-11-06'),
                                                                                                            (4, 'WEIGHT',      '150g'),
                                                                                                            (4, 'INGREDIENTS', 'Potatoes, Vegetable Oil, Salt'),
                                                                                                            (4, 'ENERGY',      '160 kcal / 30g'),
                                                                                                            (4, 'WARNINGS',    'Contains traces of soy and milk');

-- Product 5: Coca-Cola Original 320ml
INSERT INTO attribute (product_id, type, value) VALUES
                                                    (5, 'BRAND',       'Aqua Pure'),
                                                    (5, 'EXPIRY_DATE', '2027-05-01'),
                                                    (5, 'VOLUME',      '320ml'),
                                                    (5, 'INGREDIENTS', 'Carbonated Water, High Fructose Corn Syrup, Caramel Color, Phosphoric Acid, Natural Flavors, Caffeine'),
                                                    (5, 'ENERGY',      '140 kcal');

-- Product 6: Sunlight Lemon Dishwash
INSERT INTO attribute (product_id, type, value) VALUES
                                                    (6, 'BRAND',               'Clean Home'),
                                                    (6, 'VOLUME',              '750ml'),
                                                    (6, 'USAGE_INSTRUCTIONS',  'Apply a few drops to a wet sponge, squeeze to lather, wash dishes, and rinse thoroughly.'),
                                                    (6, 'WARNINGS',            'Keep out of reach of children. If in eyes, rinse cautiously with water.');

-- Product 7: Colgate Cavity Protection
INSERT INTO attribute (product_id, type, value) VALUES
                                                    (7, 'BRAND',              'Clean Home'),
                                                    (7, 'WEIGHT',             '250g'),
                                                    (7, 'BENEFITS',           'Fights cavities, strengthens enamel, freshens breath'),
                                                    (7, 'USAGE_INSTRUCTIONS', 'Brush teeth thoroughly, preferably after each meal or at least twice a day.'),
                                                    (7, 'SUITABLE_FOR',       'Adults and children 2 years and older');

-- Product 8: Tiger Beer Crystal
INSERT INTO attribute (product_id, type, value) VALUES
                                                    (8, 'BRAND',       'Aqua Pure'),
                                                    (8, 'EXPIRY_DATE', '2027-02-01'),
                                                    (8, 'VOLUME',      '330ml'),
                                                    (8, 'INGREDIENTS', 'Water, Malted Barley, Hops, Yeast'),
                                                    (8, 'ENERGY',      '130 kcal');

-- Product 9: Omo Matic Liquid Detergent
INSERT INTO attribute (product_id, type, value) VALUES
                                                    (9, 'BRAND',              'Clean Home'),
                                                    (9, 'VOLUME',             '2.8 Kg'),
                                                    (9, 'USAGE_INSTRUCTIONS', 'Use 1 cap for a normal load. Apply directly to tough stains before washing.'),
                                                    (9, 'WARNINGS',           'Do not swallow. Wash hands after use.');

-- Product 10: Chupa Chups Lollipops
INSERT INTO attribute (product_id, type, value) VALUES
                                                    (10, 'BRAND',       'Snack Time'),
                                                    (10, 'EXPIRY_DATE', '2027-12-31'),
                                                    (10, 'WEIGHT',      '120g'),
                                                    (10, 'INGREDIENTS', 'Sugar, Glucose Syrup, Fruit Puree, Lactic Acid, Malic Acid, Citric Acid, Flavorings, Colors'),
                                                    (10, 'ENERGY',      '45 kcal / pop'),
                                                    (10, 'WARNINGS',    'Not suitable for children under 3 years due to choking hazard');

-- ═══════════════════════════════════════════════════════
-- VOUCHER DB  (append to init.sql)
-- Requires MariaDB 10.2+ for CHECK constraint enforcement
-- ═══════════════════════════════════════════════════════

-- Add to the top CREATE DATABASE block:
CREATE DATABASE IF NOT EXISTS voucherdb;
GRANT ALL PRIVILEGES ON voucherdb.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

-- ───────────────────────────────────────────────────────
-- Schema
-- ───────────────────────────────────────────────────────
USE voucherdb;

CREATE TABLE IF NOT EXISTS voucher (
                                       id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       code                VARCHAR(50)  NOT NULL UNIQUE,
    description         TEXT,
    discount_type       VARCHAR(10)  NOT NULL COMMENT 'PERCENT | FIXED',
    discount_value      DOUBLE       NOT NULL,
    min_order_value     DOUBLE       NOT NULL DEFAULT 0,
    max_discount_amount DOUBLE       NOT NULL DEFAULT 0,
    usage_limit         INT          NOT NULL DEFAULT 0 COMMENT '0 = unlimited',
    used_count          INT          NOT NULL DEFAULT 0,
    start_date          DATETIME     NOT NULL,
    end_date            DATETIME     NOT NULL,
    active              BOOLEAN      NOT NULL DEFAULT TRUE,

    -- Exactly one of the two target columns should be non-null
    target_product_id   BIGINT       NULL COMMENT 'FK to productdb.base_product.product_id',
    target_catalog_id   VARCHAR(255) NULL COMMENT 'FK to catalogdb.catalog.id (slug)',

    CONSTRAINT chk_single_target CHECK (
                                           target_product_id IS NULL OR target_catalog_id IS NULL
                                       )
    );

-- ───────────────────────────────────────────────────────
-- Seed data
-- ───────────────────────────────────────────────────────

-- Global voucher (no target restriction)
INSERT INTO voucher (code, description, discount_type, discount_value, min_order_value,
                     max_discount_amount, usage_limit, start_date, end_date, active,
                     target_product_id, target_catalog_id)
VALUES
    (
        'WELCOME10',
        '10% off for all new customers',
        'PERCENT', 10, 0, 50000, 100,
        '2025-01-01 00:00:00', '2099-12-31 23:59:59', TRUE,
        NULL, NULL
    ),
    (
        'FLAT20K',
        'Flat 20,000 VND off orders over 100,000 VND',
        'FIXED', 20000, 100000, 0, 200,
        '2025-01-01 00:00:00', '2099-12-31 23:59:59', TRUE,
        NULL, NULL
    ),

-- Voucher tied to a specific product (Ba rọi heo VietGAP = product_id 1)
    (
        'PORK500',
        '15% off on Ba roi heo VietGAP',
        'PERCENT', 15, 50000, 30000, 50,
        '2025-01-01 00:00:00', '2099-12-31 23:59:59', TRUE,
        1, NULL
    ),

-- Voucher tied to a catalog (fresh vegetables)
    (
        'VEGGIE5K',
        '5,000 VND off fresh vegetables',
        'FIXED', 5000, 20000, 0, 0,
        '2025-01-01 00:00:00', '2099-12-31 23:59:59', TRUE,
        NULL, 'fresh-food-vegetables'
    ),

-- Voucher tied to beverages catalog
    (
        'DRINK20',
        '20% off beverages (max 15,000 VND)',
        'PERCENT', 20, 30000, 15000, 0,
        '2025-01-01 00:00:00', '2099-12-31 23:59:59', TRUE,
        NULL, 'beverages'
    ),

-- Expired voucher (for testing)
    (
        'EXPIRED',
        'Expired test voucher',
        'FIXED', 10000, 0, 0, 0,
        '2020-01-01 00:00:00', '2020-12-31 23:59:59', FALSE,
        NULL, NULL
    );