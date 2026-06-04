-- ═══════════════════════════════════════════════════════
-- DATABASE INITIALIZATION SCRIPT (UPDATED)
-- ═══════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS productdb;
CREATE DATABASE IF NOT EXISTS orderdb;
CREATE DATABASE IF NOT EXISTS branddb;
CREATE DATABASE IF NOT EXISTS catalogdb;
CREATE DATABASE IF NOT EXISTS paymentdb;
CREATE DATABASE IF NOT EXISTS userdb; -- Thêm dòng này
CREATE DATABASE IF NOT EXISTS cartdb;
CREATE DATABASE IF NOT EXISTS userdb;
CREATE DATABASE IF NOT EXISTS stockdb;



GRANT ALL PRIVILEGES ON productdb.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON orderdb.*   TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON branddb.*   TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON catalogdb.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON paymentdb.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON userdb.*    TO 'appuser'@'%'; -- Thêm dòng này
GRANT ALL PRIVILEGES ON cartdb.*    TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON userdb.*    TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON stockdb.* TO 'appuser'@'%';

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

-- Thêm 3 Staff mới
INSERT INTO users (keycloak_id, phone, first_name, last_name, email, role) VALUES
                                                                               ('staff-uuid-001', '0901234567', 'Hoa', 'Lê Thị', 'hoa.le@bachhoanhanh.vn', 'STAFF'),
                                                                               ('staff-uuid-002', '0901234568', 'Hoàng', 'Trần Minh', 'hoang.tran@bachhoanhanh.vn', 'STAFF'),
                                                                               ('staff-uuid-003', '0901234569', 'Lan', 'Phạm Ngọc', 'lan.pham@bachhoanhanh.vn', 'STAFF');

-- Thêm 10 Customer mới
INSERT INTO users (keycloak_id, phone, first_name, last_name, email, role) VALUES
                                                                               ('cust-uuid-001', '0381112221', 'Nam', 'Nguyễn Hoàng', 'nam.nguyen@gmail.com', 'CUSTOMER'),
                                                                               ('cust-uuid-002', '0381112222', 'Thảo', 'Đặng Thu', 'thao.dang@gmail.com', 'CUSTOMER'),
                                                                               ('cust-uuid-003', '0381112223', 'Tuấn', 'Bùi Anh', 'tuan.bui@gmail.com', 'CUSTOMER'),
                                                                               ('cust-uuid-004', '0381112224', 'Ngọc', 'Hoàng Bảo', 'ngoc.hoang@gmail.com', 'CUSTOMER'),
                                                                               ('cust-uuid-005', '0381112225', 'Quân', 'Võ Minh', 'quan.vo@gmail.com', 'CUSTOMER'),
                                                                               ('cust-uuid-006', '0381112226', 'Oanh', 'Trương Kiều', 'oanh.truong@gmail.com', 'CUSTOMER'),
                                                                               ('cust-uuid-007', '0381112227', 'Long', 'Lý Thanh', 'long.ly@gmail.com', 'CUSTOMER'),
                                                                               ('cust-uuid-008', '0381112228', 'Linh', 'Đoàn Thùy', 'linh.doan@gmail.com', 'CUSTOMER'),
                                                                               ('cust-uuid-009', '0381112229', 'Huy', 'Phan Gia', 'huy.phan@gmail.com', 'CUSTOMER'),
                                                                               ('cust-uuid-010', '0381112230', 'Yến', 'Vũ Hải', 'yen.vu@gmail.com', 'CUSTOMER');
-- Profile cho Staff
INSERT INTO staff_profiles (keycloak_id, is_female, address) VALUES
                                                                 ('staff-uuid-001', TRUE, 'Quận 7, TP. Hồ Chí Minh'),
                                                                 ('staff-uuid-002', FALSE, 'Quận Liên Chiểu, Đà Nẵng'),
                                                                 ('staff-uuid-003', TRUE, 'Quận Cầu Giấy, Hà Nội');

-- Profile cho Customer (với số điểm tích lũy ngẫu nhiên)
INSERT INTO customer_profiles (keycloak_id, loyalty_points) VALUES
                                                                ('cust-uuid-001', 50), ('cust-uuid-002', 120), ('cust-uuid-003', 0),
                                                                ('cust-uuid-004', 250), ('cust-uuid-005', 10), ('cust-uuid-006', 85),
                                                                ('cust-uuid-007', 300), ('cust-uuid-008', 45), ('cust-uuid-009', 15),
                                                                ('cust-uuid-010', 500);
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
                                                                                                           ('893000111', 'Ba rọi heo VietXanh',
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


-- Thêm vào cuối file
-- ═══════════════════════════════════════════════════════
-- STOCK DB
-- ═══════════════════════════════════════════════════════
USE stockdb;

CREATE TABLE IF NOT EXISTS stock (
                                     id               BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     product_id       VARCHAR(100) NOT NULL,
    amount           INT          NOT NULL DEFAULT 0,
    import_date      DATE         NOT NULL,
    manufacture_date DATE         NOT NULL,
    expiry_date      DATE         NOT NULL,
    available        BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_dates CHECK (expiry_date > manufacture_date)
    );

-- Seed data
-- Note: rows 1 & 2 are already expired (expiry_date < 2026-06-02), so available = FALSE
INSERT INTO stock (product_id, amount, import_date, manufacture_date, expiry_date, available) VALUES
                                                                                                  ('893000111', 50,  '2026-05-01', '2026-04-28', '2026-05-10', FALSE),
                                                                                                  ('893000222', 120, '2026-05-01', '2026-05-01', '2026-05-09', FALSE),
                                                                                                  ('893000333', 80,  '2026-05-01', '2026-04-25', '2026-06-01', FALSE),
                                                                                                  ('893000444', 200, '2026-05-01', '2026-03-01', '2026-11-06', TRUE),
                                                                                                  ('893000555', 300, '2026-05-01', '2026-01-01', '2027-05-01', TRUE),                                                                                          ('893000555', 60,  '2026-05-01', '2025-12-01', '2027-12-01', TRUE),
                                                                                                  ('893000777', 90,  '2026-05-01', '2025-11-01', '2027-11-01', TRUE),
                                                                                                  ('893000888', 150, '2026-05-01', '2026-01-01', '2027-02-01', TRUE),
                                                                                                  ('893000999', 40,  '2026-05-01', '2025-10-01', '2027-10-01', TRUE),
                                                                                                  ('893001000', 75,  '2026-05-01', '2025-06-01', '2027-12-31', TRUE);

USE orderdb;

CREATE TABLE IF NOT EXISTS orders (
                                      id              BIGINT AUTO_INCREMENT PRIMARY KEY,
                                      keycloak_id     VARCHAR(255), -- ID người mua
    subtotal        DOUBLE NOT NULL,
    discount_amount DOUBLE DEFAULT 0,
    voucher_code    VARCHAR(50),
    total_price     DOUBLE NOT NULL,
    status          VARCHAR(20) NOT NULL, -- PENDING, PAID, FAILED, CANCELLED
    order_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stock_finished  BOOLEAN DEFAULT FALSE
    );

CREATE TABLE IF NOT EXISTS order_items (
                                           id               BIGINT AUTO_INCREMENT PRIMARY KEY,
                                           order_id         BIGINT NOT NULL,
                                           product_id       VARCHAR(100),
    stock_product_id VARCHAR(100), -- Barcode dùng để trừ kho
    name             VARCHAR(255),
    quantity         INT NOT NULL,
    price            DOUBLE NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

-- ───────────────────────────────────────────────────────
-- ORDER DATA
-- ───────────────────────────────────────────────────────

-- Đơn hàng 1: Khách hàng mua nhiều món, dùng voucher giảm giá 20k
INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (1, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 124000, 20000, 'FLAT20K', 104000, 'PAID', '2026-06-01 10:30:00', TRUE);

INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES
                                                                                            (1, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000), -- 70k
                                                                                            (1, '4', '893000444', 'Lay\'s Classic Potato Chips', 1, 22000), -- 22k
(1, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000); -- 32k
-- Tổng subtotal: 124k

-- Đơn hàng 2: Khách hàng mua bia và nước ngọt, đang chờ thanh toán
INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (2, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 86000, 0, NULL, 86000, 'PENDING', '2026-06-02 14:15:00', FALSE);

INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES
(2, '5', '893000555', 'Coca-Cola Original 320ml', 5, 10000), -- 50k
(2, '8', '893000888', 'Tiger Beer Crystal', 2, 18000); -- 36k

-- Đơn hàng 3: Đơn hàng giá trị cao, dùng voucher phần trăm (WELCOME10)
INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (3, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 290000, 29000, 'WELCOME10', 261000, 'PAID', '2026-06-03 08:00:00', TRUE);

INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES
(3, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);

-- Đơn hàng 4: Đơn hàng bị lỗi/thanh toán thất bại
INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (4, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 30000, 0, NULL, 30000, 'FAILED', '2026-06-03 09:45:00', FALSE);

INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES
(4, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);

-- Đơn hàng 5: Mua thịt và rau tươi
INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (5, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 145000, 0, NULL, 145000, 'PAID', '2026-06-03 15:00:00', TRUE);

INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES
(1, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000),
(1, '2', '893000222', 'Xà lách thủy canh', 1, 25000);

-- ───────────────────────────────────────────────────────
-- ORDER DATA 2
-- ───────────────────────────────────────────────────────

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (100, 'staff-uuid-001', 360000, 30000, 'BIGSALE30', 330000, 'PAID', '2025-12-15 12:58:58', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (100, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (101, 'staff-uuid-002', 209000, 0, NULL, 209000, 'PENDING', '2025-11-13 18:38:51', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (101, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (101, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (101, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (102, 'cust-uuid-004', 106000, 0, NULL, 106000, 'PAID', '2026-01-14 10:34:01', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (102, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (102, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (102, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (103, 'staff-uuid-002', 64000, 0, NULL, 64000, 'PAID', '2026-03-14 16:54:43', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (103, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (104, 'staff-uuid-002', 10000, 0, NULL, 10000, 'PAID', '2026-01-08 15:30:45', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (104, '5', '893000555', 'Coca-Cola Original 320ml', 1, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (105, 'cust-uuid-005', 216000, 0, NULL, 216000, 'PAID', '2026-01-07 18:14:51', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (105, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (105, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (105, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (106, 'cust-uuid-010', 154000, 0, NULL, 154000, 'PAID', '2026-04-07 16:38:11', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (106, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (106, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (106, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (107, 'staff-uuid-002', 140000, 0, NULL, 140000, 'PAID', '2026-03-13 16:39:19', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (107, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (107, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (107, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (107, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (108, 'cust-uuid-002', 187000, 0, NULL, 187000, 'PAID', '2026-04-01 19:06:21', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (108, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (108, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (108, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (108, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (109, 'cust-uuid-007', 314000, 30000, 'BIGSALE30', 284000, 'FAILED', '2025-11-10 13:20:27', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (109, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (109, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (109, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (110, 'cust-uuid-002', 235000, 0, NULL, 235000, 'PAID', '2025-11-23 19:43:38', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (110, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (110, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (110, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (111, 'staff-uuid-002', 675000, 30000, 'BIGSALE30', 645000, 'PAID', '2026-05-30 19:35:47', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (111, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (111, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (111, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (112, 'cust-uuid-006', 209000, 0, NULL, 209000, 'PENDING', '2026-01-08 15:58:53', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (112, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (112, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (112, '2', '893000222', 'Xà lách thủy canh', 2, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (113, 'cust-uuid-005', 312000, 30000, 'BIGSALE30', 282000, 'PAID', '2026-02-12 08:01:06', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (113, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (113, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (113, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (114, 'cust-uuid-004', 108000, 0, NULL, 108000, 'PAID', '2026-03-15 14:17:02', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (114, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (114, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (115, 'cust-uuid-003', 186000, 0, NULL, 186000, 'PAID', '2026-03-09 09:07:31', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (115, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (115, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (115, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (116, 'staff-uuid-002', 150000, 0, NULL, 150000, 'PAID', '2026-01-21 18:01:38', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (116, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (116, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (117, 'cust-uuid-007', 18000, 0, NULL, 18000, 'PENDING', '2026-04-25 15:44:58', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (117, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (118, 'cust-uuid-009', 60000, 0, NULL, 60000, 'PAID', '2026-02-19 15:49:10', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (118, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (119, 'cust-uuid-003', 656000, 30000, 'BIGSALE30', 626000, 'FAILED', '2026-04-02 13:33:57', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (119, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (119, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (119, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (119, '9', '893000999', 'Omo Matic Liquid Detergent', 3, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (120, 'cust-uuid-002', 145000, 0, NULL, 145000, 'PAID', '2025-10-25 11:17:27', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (120, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (121, 'cust-uuid-004', 80000, 0, NULL, 80000, 'PAID', '2026-03-02 11:46:24', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (121, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (122, 'staff-uuid-001', 212000, 0, NULL, 212000, 'PAID', '2025-12-31 10:53:54', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (122, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (122, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (122, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (123, 'cust-uuid-003', 180000, 0, NULL, 180000, 'PAID', '2025-10-18 17:08:09', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (123, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (123, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (124, 'cust-uuid-008', 18000, 0, NULL, 18000, 'PAID', '2025-10-23 08:32:42', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (124, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (125, 'staff-uuid-002', 190000, 0, NULL, 190000, 'PAID', '2026-04-12 14:54:54', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (125, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (125, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (125, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (126, 'cust-uuid-002', 465000, 30000, 'BIGSALE30', 435000, 'PAID', '2025-11-04 09:01:35', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (126, '9', '893000999', 'Omo Matic Liquid Detergent', 3, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (126, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (127, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 152000, 0, NULL, 152000, 'PAID', '2026-05-03 15:03:15', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (127, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (127, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (128, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 365000, 30000, 'BIGSALE30', 335000, 'FAILED', '2026-03-22 19:25:15', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (128, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (128, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (128, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (128, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (129, 'cust-uuid-002', 424000, 30000, 'BIGSALE30', 394000, 'FAILED', '2026-04-30 17:36:49', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (129, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (129, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (130, 'cust-uuid-008', 115000, 0, NULL, 115000, 'FAILED', '2025-11-24 11:13:22', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (130, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (130, '2', '893000222', 'Xà lách thủy canh', 1, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (131, 'staff-uuid-001', 146000, 0, NULL, 146000, 'PAID', '2025-12-13 12:12:34', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (131, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (131, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (131, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (132, 'cust-uuid-008', 440000, 30000, 'BIGSALE30', 410000, 'PAID', '2026-01-09 13:32:04', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (132, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (132, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (133, 'staff-uuid-002', 613000, 30000, 'BIGSALE30', 583000, 'PAID', '2025-12-09 18:03:14', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (133, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (133, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (133, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (133, '9', '893000999', 'Omo Matic Liquid Detergent', 3, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (134, 'cust-uuid-006', 530000, 30000, 'BIGSALE30', 500000, 'PAID', '2026-03-06 17:58:27', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (134, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (134, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (134, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (135, 'staff-uuid-001', 378000, 30000, 'BIGSALE30', 348000, 'FAILED', '2026-05-05 08:05:16', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (135, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (135, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (136, 'cust-uuid-008', 390000, 30000, 'BIGSALE30', 360000, 'PENDING', '2026-01-21 09:44:21', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (136, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (136, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (136, '5', '893000555', 'Coca-Cola Original 320ml', 1, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (137, 'cust-uuid-006', 190000, 0, NULL, 190000, 'PAID', '2026-05-30 13:41:42', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (137, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (137, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (137, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (137, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (138, 'cust-uuid-001', 344000, 30000, 'BIGSALE30', 314000, 'PAID', '2025-11-18 17:47:39', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (138, '5', '893000555', 'Coca-Cola Original 320ml', 1, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (138, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (138, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (138, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (139, 'staff-uuid-001', 386000, 30000, 'BIGSALE30', 356000, 'FAILED', '2026-05-26 13:46:54', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (139, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (139, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (139, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (140, 'cust-uuid-003', 66000, 0, NULL, 66000, 'PENDING', '2025-10-23 12:17:38', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (140, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (140, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (141, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 227000, 0, NULL, 227000, 'PAID', '2026-02-03 08:46:31', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (141, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (141, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (141, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (141, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (142, 'cust-uuid-008', 200000, 0, NULL, 200000, 'PAID', '2025-10-13 09:46:14', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (142, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (142, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (142, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (143, 'staff-uuid-001', 855000, 30000, 'BIGSALE30', 825000, 'PAID', '2026-03-03 17:36:40', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (143, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (143, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (143, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (143, '9', '893000999', 'Omo Matic Liquid Detergent', 3, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (144, 'staff-uuid-001', 74000, 0, NULL, 74000, 'PAID', '2026-02-21 14:36:24', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (144, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (144, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (145, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 72000, 0, NULL, 72000, 'PAID', '2026-01-08 19:46:33', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (145, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (145, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (146, 'cust-uuid-008', 125000, 0, NULL, 125000, 'PENDING', '2025-12-28 15:29:02', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (146, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (146, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (147, 'cust-uuid-006', 539000, 30000, 'BIGSALE30', 509000, 'FAILED', '2026-05-03 19:06:58', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (147, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (147, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (147, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (147, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (148, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 75000, 0, NULL, 75000, 'PENDING', '2025-12-15 10:56:41', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (148, '2', '893000222', 'Xà lách thủy canh', 3, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (149, 'cust-uuid-007', 210000, 0, NULL, 210000, 'PAID', '2026-02-11 17:19:34', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (149, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (149, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (150, 'staff-uuid-001', 415000, 30000, 'BIGSALE30', 385000, 'PAID', '2026-01-08 12:41:10', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (150, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (150, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (150, '2', '893000222', 'Xà lách thủy canh', 1, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (151, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 460000, 30000, 'BIGSALE30', 430000, 'PAID', '2026-01-15 15:07:09', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (151, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (151, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (151, '2', '893000222', 'Xà lách thủy canh', 3, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (152, 'staff-uuid-002', 644000, 30000, 'BIGSALE30', 614000, 'PAID', '2025-11-13 18:52:26', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (152, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (152, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (152, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (152, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (153, 'cust-uuid-003', 284000, 30000, 'BIGSALE30', 254000, 'PAID', '2026-01-12 18:54:24', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (153, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (153, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (154, 'cust-uuid-010', 198000, 0, NULL, 198000, 'PAID', '2025-11-25 18:09:43', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (154, '2', '893000222', 'Xà lách thủy canh', 3, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (154, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (154, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (155, 'cust-uuid-005', 360000, 30000, 'BIGSALE30', 330000, 'PAID', '2026-01-04 12:34:35', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (155, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (156, 'staff-uuid-002', 290000, 30000, 'BIGSALE30', 260000, 'PENDING', '2025-10-22 17:46:12', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (156, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (157, 'cust-uuid-002', 422000, 30000, 'BIGSALE30', 392000, 'PAID', '2026-01-22 16:35:48', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (157, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (157, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (157, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (157, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (158, 'cust-uuid-010', 65000, 0, NULL, 65000, 'PAID', '2025-11-05 14:36:52', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (158, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (158, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (159, 'cust-uuid-002', 130000, 0, NULL, 130000, 'PENDING', '2026-03-04 10:19:53', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (159, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (159, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (159, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (160, 'cust-uuid-006', 446000, 30000, 'BIGSALE30', 416000, 'PAID', '2026-03-11 15:33:53', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (160, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (160, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (160, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (161, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 222000, 0, NULL, 222000, 'PENDING', '2026-01-19 15:32:20', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (161, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (161, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (161, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (161, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (162, 'staff-uuid-002', 336000, 30000, 'BIGSALE30', 306000, 'PAID', '2026-01-24 13:56:36', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (162, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (162, '5', '893000555', 'Coca-Cola Original 320ml', 1, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (162, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (162, '2', '893000222', 'Xà lách thủy canh', 2, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (163, 'cust-uuid-001', 80000, 0, NULL, 80000, 'FAILED', '2025-11-16 12:23:53', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (163, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (164, 'staff-uuid-002', 174000, 0, NULL, 174000, 'FAILED', '2025-10-27 11:03:11', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (164, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (164, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (165, 'cust-uuid-009', 10000, 0, NULL, 10000, 'FAILED', '2026-03-21 14:25:02', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (165, '5', '893000555', 'Coca-Cola Original 320ml', 1, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (166, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 392000, 30000, 'BIGSALE30', 362000, 'FAILED', '2025-11-14 09:09:55', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (166, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (166, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (166, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (167, 'cust-uuid-008', 360000, 30000, 'BIGSALE30', 330000, 'FAILED', '2026-05-15 15:27:10', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (167, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (168, 'cust-uuid-009', 745000, 30000, 'BIGSALE30', 715000, 'PENDING', '2026-03-18 17:59:16', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (168, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (168, '2', '893000222', 'Xà lách thủy canh', 3, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (168, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (168, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (169, 'cust-uuid-007', 360000, 30000, 'BIGSALE30', 330000, 'PENDING', '2025-11-22 12:28:11', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (169, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (170, 'cust-uuid-010', 111000, 0, NULL, 111000, 'FAILED', '2026-04-25 09:27:38', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (170, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (170, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (170, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (171, 'staff-uuid-002', 109000, 0, NULL, 109000, 'FAILED', '2025-11-28 19:31:31', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (171, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (171, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (171, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (172, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 120000, 0, NULL, 120000, 'PAID', '2026-03-02 18:24:16', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (172, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (173, 'staff-uuid-001', 449000, 30000, 'BIGSALE30', 419000, 'PAID', '2025-10-19 12:56:08', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (173, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (173, '2', '893000222', 'Xà lách thủy canh', 3, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (173, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (173, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (174, 'cust-uuid-004', 154000, 0, NULL, 154000, 'FAILED', '2025-11-27 10:40:25', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (174, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (174, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (174, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (175, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 112000, 0, NULL, 112000, 'FAILED', '2026-02-15 16:53:56', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (175, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (175, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (176, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 110000, 0, NULL, 110000, 'PAID', '2026-01-06 10:58:20', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (176, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (176, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (176, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (176, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (177, 'cust-uuid-003', 285000, 30000, 'BIGSALE30', 255000, 'PAID', '2026-03-10 18:55:04', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (177, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (177, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (177, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (178, 'cust-uuid-008', 198000, 0, NULL, 198000, 'FAILED', '2025-11-04 12:20:36', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (178, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (178, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (178, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (179, 'cust-uuid-009', 205000, 0, NULL, 205000, 'PENDING', '2026-01-18 18:04:15', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (179, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (179, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (179, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (180, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 541000, 30000, 'BIGSALE30', 511000, 'PAID', '2026-05-27 08:15:30', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (180, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (180, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (180, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (180, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (181, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 139000, 0, NULL, 139000, 'PAID', '2026-03-12 15:06:59', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (181, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (181, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (181, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (182, 'cust-uuid-005', 32000, 0, NULL, 32000, 'FAILED', '2025-11-04 10:19:09', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (182, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (183, 'cust-uuid-005', 232000, 0, NULL, 232000, 'PENDING', '2026-03-14 15:40:38', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (183, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (183, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (183, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (184, 'cust-uuid-010', 54000, 0, NULL, 54000, 'FAILED', '2025-11-20 17:15:11', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (184, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (184, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (185, 'staff-uuid-002', 57000, 0, NULL, 57000, 'PAID', '2025-11-27 11:16:35', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (185, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (185, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (186, 'cust-uuid-009', 130000, 0, NULL, 130000, 'PAID', '2025-11-13 08:20:03', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (186, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (186, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (186, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (187, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 345000, 30000, 'BIGSALE30', 315000, 'PENDING', '2026-01-31 08:29:37', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (187, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (187, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (188, 'cust-uuid-002', 32000, 0, NULL, 32000, 'PAID', '2026-01-21 17:08:25', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (188, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (189, 'cust-uuid-001', 271000, 30000, 'BIGSALE30', 241000, 'PAID', '2025-11-11 19:22:53', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (189, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (189, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (189, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (189, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (190, 'cust-uuid-002', 271000, 30000, 'BIGSALE30', 241000, 'PAID', '2026-04-07 17:12:33', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (190, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (190, '2', '893000222', 'Xà lách thủy canh', 3, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (190, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (190, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (191, 'cust-uuid-010', 140000, 0, NULL, 140000, 'PAID', '2025-10-31 19:58:41', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (191, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (191, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (191, '5', '893000555', 'Coca-Cola Original 320ml', 1, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (191, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (192, 'cust-uuid-003', 315000, 30000, 'BIGSALE30', 285000, 'PENDING', '2026-03-08 15:48:09', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (192, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (192, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (192, '2', '893000222', 'Xà lách thủy canh', 3, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (193, 'cust-uuid-002', 505000, 30000, 'BIGSALE30', 475000, 'PAID', '2026-04-17 14:41:49', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (193, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (193, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (193, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (194, 'staff-uuid-002', 154000, 0, NULL, 154000, 'PAID', '2026-02-18 19:23:54', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (194, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (194, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (194, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (195, 'cust-uuid-008', 190000, 0, NULL, 190000, 'FAILED', '2026-01-12 16:29:59', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (195, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (195, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (195, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (195, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (196, 'cust-uuid-009', 80000, 0, NULL, 80000, 'PAID', '2026-04-26 15:02:39', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (196, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (197, 'cust-uuid-006', 296000, 30000, 'BIGSALE30', 266000, 'PENDING', '2026-02-20 17:07:05', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (197, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (197, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (197, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (197, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (198, 'cust-uuid-009', 32000, 0, NULL, 32000, 'PENDING', '2026-01-08 12:44:26', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (198, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (199, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 204000, 0, NULL, 204000, 'PAID', '2025-11-18 17:06:41', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (199, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (199, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (199, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (200, 'cust-uuid-009', 25000, 0, NULL, 25000, 'PAID', '2026-04-22 10:12:37', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (200, '2', '893000222', 'Xà lách thủy canh', 1, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (201, 'cust-uuid-005', 116000, 0, NULL, 116000, 'PAID', '2026-02-11 16:27:55', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (201, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (201, '2', '893000222', 'Xà lách thủy canh', 2, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (202, 'cust-uuid-007', 60000, 0, NULL, 60000, 'PAID', '2026-04-02 08:08:58', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (202, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (203, 'staff-uuid-002', 176000, 0, NULL, 176000, 'PAID', '2025-10-24 18:22:11', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (203, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (203, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (203, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (204, 'cust-uuid-002', 179000, 0, NULL, 179000, 'PENDING', '2025-10-09 08:15:31', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (204, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (204, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (204, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (204, '2', '893000222', 'Xà lách thủy canh', 3, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (205, 'cust-uuid-003', 360000, 30000, 'BIGSALE30', 330000, 'PAID', '2025-11-01 08:57:56', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (205, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (206, 'staff-uuid-001', 490000, 30000, 'BIGSALE30', 460000, 'PAID', '2026-05-06 10:20:03', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (206, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (206, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (206, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (207, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 36000, 0, NULL, 36000, 'FAILED', '2026-05-05 16:34:21', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (207, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (208, 'cust-uuid-009', 96000, 0, NULL, 96000, 'PAID', '2025-11-12 15:15:19', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (208, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (209, 'cust-uuid-007', 630000, 30000, 'BIGSALE30', 600000, 'PAID', '2025-10-22 13:50:18', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (209, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (209, '2', '893000222', 'Xà lách thủy canh', 3, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (209, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (209, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (210, 'cust-uuid-006', 145000, 0, NULL, 145000, 'PENDING', '2026-01-11 09:49:02', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (210, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (211, 'cust-uuid-006', 85000, 0, NULL, 85000, 'PENDING', '2025-12-30 19:16:42', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (211, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (211, '2', '893000222', 'Xà lách thủy canh', 1, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (212, 'cust-uuid-005', 36000, 0, NULL, 36000, 'PENDING', '2026-03-19 13:31:28', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (212, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (213, 'cust-uuid-010', 44000, 0, NULL, 44000, 'FAILED', '2025-10-10 16:50:35', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (213, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (214, 'cust-uuid-001', 99000, 0, NULL, 99000, 'FAILED', '2026-02-22 14:12:22', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (214, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (214, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (215, 'cust-uuid-004', 294000, 30000, 'BIGSALE30', 264000, 'FAILED', '2025-10-18 17:38:34', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (215, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (215, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (215, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (215, '2', '893000222', 'Xà lách thủy canh', 2, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (216, 'staff-uuid-002', 25000, 0, NULL, 25000, 'PAID', '2025-11-27 15:45:44', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (216, '2', '893000222', 'Xà lách thủy canh', 1, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (217, 'staff-uuid-001', 240000, 0, NULL, 240000, 'PAID', '2026-03-30 16:13:34', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (217, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (218, 'staff-uuid-001', 66000, 0, NULL, 66000, 'PAID', '2026-04-10 13:26:05', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (218, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (219, 'cust-uuid-004', 124000, 0, NULL, 124000, 'FAILED', '2025-12-03 14:23:28', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (219, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (219, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (220, 'cust-uuid-005', 127000, 0, NULL, 127000, 'FAILED', '2026-02-12 17:20:10', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (220, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (220, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (220, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (220, '2', '893000222', 'Xà lách thủy canh', 2, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (221, 'cust-uuid-004', 72000, 0, NULL, 72000, 'PAID', '2026-04-03 18:02:50', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (221, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (221, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (222, 'cust-uuid-003', 65000, 0, NULL, 65000, 'PAID', '2025-11-16 10:36:21', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (222, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (222, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (223, 'cust-uuid-001', 178000, 0, NULL, 178000, 'PAID', '2026-01-28 08:02:35', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (223, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (223, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (223, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (223, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (224, 'cust-uuid-007', 42000, 0, NULL, 42000, 'PAID', '2025-12-14 17:05:01', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (224, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (224, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (225, 'cust-uuid-005', 646000, 30000, 'BIGSALE30', 616000, 'FAILED', '2026-02-25 14:44:56', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (225, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (225, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (225, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (225, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (226, 'cust-uuid-004', 30000, 0, NULL, 30000, 'FAILED', '2026-03-10 18:42:15', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (226, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (227, 'cust-uuid-006', 22000, 0, NULL, 22000, 'PENDING', '2026-03-04 08:53:34', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (227, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (228, 'cust-uuid-004', 134000, 0, NULL, 134000, 'PAID', '2026-03-21 12:45:39', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (228, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (228, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (228, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (229, 'staff-uuid-001', 166000, 0, NULL, 166000, 'PENDING', '2026-01-09 17:34:15', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (229, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (229, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (229, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (230, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 18000, 0, NULL, 18000, 'PAID', '2026-04-25 13:30:59', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (230, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (231, 'cust-uuid-007', 573000, 30000, 'BIGSALE30', 543000, 'FAILED', '2026-05-23 15:18:17', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (231, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (231, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (231, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (231, '2', '893000222', 'Xà lách thủy canh', 1, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (232, 'cust-uuid-008', 80000, 0, NULL, 80000, 'PAID', '2025-11-12 12:37:33', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (232, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (233, 'cust-uuid-002', 240000, 0, NULL, 240000, 'PENDING', '2026-05-03 11:20:18', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (233, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (233, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (233, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (233, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (234, 'cust-uuid-009', 22000, 0, NULL, 22000, 'PENDING', '2025-11-27 10:20:07', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (234, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (235, 'staff-uuid-001', 540000, 30000, 'BIGSALE30', 510000, 'FAILED', '2025-10-24 13:53:18', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (235, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (235, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (235, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (236, 'cust-uuid-010', 80000, 0, NULL, 80000, 'PAID', '2025-10-22 18:12:48', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (236, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (237, 'staff-uuid-001', 290000, 30000, 'BIGSALE30', 260000, 'FAILED', '2025-12-20 12:47:11', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (237, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (238, 'cust-uuid-008', 601000, 30000, 'BIGSALE30', 571000, 'PAID', '2026-05-18 17:38:57', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (238, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (238, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (238, '9', '893000999', 'Omo Matic Liquid Detergent', 3, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (239, 'cust-uuid-010', 190000, 0, NULL, 190000, 'PAID', '2026-04-11 17:19:47', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (239, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (239, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (240, 'cust-uuid-002', 322000, 30000, 'BIGSALE30', 292000, 'FAILED', '2026-01-07 15:10:15', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (240, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (240, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (240, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (240, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (241, 'cust-uuid-007', 220000, 0, NULL, 220000, 'PENDING', '2025-12-16 09:47:06', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (241, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (241, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (241, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (241, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (242, 'cust-uuid-004', 120000, 0, NULL, 120000, 'FAILED', '2026-05-12 13:54:01', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (242, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (243, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 273000, 30000, 'BIGSALE30', 243000, 'PAID', '2026-05-26 08:27:59', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (243, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (243, '2', '893000222', 'Xà lách thủy canh', 3, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (243, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (243, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (244, 'cust-uuid-003', 240000, 0, NULL, 240000, 'FAILED', '2026-02-02 15:32:13', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (244, '2', '893000222', 'Xà lách thủy canh', 3, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (244, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (244, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (244, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (245, 'cust-uuid-002', 71000, 0, NULL, 71000, 'PAID', '2026-02-19 11:58:36', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (245, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (245, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (246, 'cust-uuid-003', 306000, 30000, 'BIGSALE30', 276000, 'PENDING', '2026-02-14 11:01:26', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (246, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (246, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (247, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 50000, 0, NULL, 50000, 'PAID', '2026-04-29 16:48:18', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (247, '2', '893000222', 'Xà lách thủy canh', 2, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (248, 'staff-uuid-002', 112000, 0, NULL, 112000, 'PAID', '2025-10-18 08:32:02', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (248, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (248, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (248, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (249, 'cust-uuid-008', 325000, 30000, 'BIGSALE30', 295000, 'FAILED', '2025-11-24 14:45:05', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (249, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (249, '5', '893000555', 'Coca-Cola Original 320ml', 1, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (249, '2', '893000222', 'Xà lách thủy canh', 3, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (250, 'cust-uuid-007', 636000, 30000, 'BIGSALE30', 606000, 'PENDING', '2025-10-20 15:22:11', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (250, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (250, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (250, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (250, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (251, 'cust-uuid-004', 410000, 30000, 'BIGSALE30', 380000, 'PAID', '2026-02-07 12:05:01', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (251, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (251, '2', '893000222', 'Xà lách thủy canh', 2, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (252, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 142000, 0, NULL, 142000, 'PAID', '2026-01-10 11:03:04', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (252, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (252, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (252, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (252, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (253, 'cust-uuid-009', 148000, 0, NULL, 148000, 'PAID', '2026-02-15 17:30:38', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (253, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (253, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (253, '2', '893000222', 'Xà lách thủy canh', 2, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (254, 'cust-uuid-006', 505000, 30000, 'BIGSALE30', 475000, 'FAILED', '2026-02-05 12:20:50', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (254, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (254, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (254, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (255, 'staff-uuid-002', 425000, 30000, 'BIGSALE30', 395000, 'PAID', '2026-01-21 08:44:06', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (255, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (255, '2', '893000222', 'Xà lách thủy canh', 1, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (255, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (256, 'staff-uuid-002', 265000, 30000, 'BIGSALE30', 235000, 'PAID', '2026-01-06 09:00:03', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (256, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (256, '2', '893000222', 'Xà lách thủy canh', 1, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (257, 'cust-uuid-008', 22000, 0, NULL, 22000, 'FAILED', '2026-03-08 08:32:42', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (257, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (258, 'cust-uuid-009', 435000, 30000, 'BIGSALE30', 405000, 'PAID', '2025-10-09 14:58:25', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (258, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (258, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (258, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (259, 'cust-uuid-005', 436000, 30000, 'BIGSALE30', 406000, 'PAID', '2026-02-22 13:08:43', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (259, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (259, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (259, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (260, 'cust-uuid-006', 312000, 30000, 'BIGSALE30', 282000, 'FAILED', '2026-04-20 19:42:09', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (260, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (260, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (260, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (260, '2', '893000222', 'Xà lách thủy canh', 3, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (261, 'cust-uuid-008', 18000, 0, NULL, 18000, 'PENDING', '2025-11-05 19:18:22', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (261, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (262, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 310000, 30000, 'BIGSALE30', 280000, 'PENDING', '2025-12-14 14:00:09', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (262, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (262, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (262, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (263, 'staff-uuid-001', 345000, 30000, 'BIGSALE30', 315000, 'PAID', '2025-12-21 15:21:22', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (263, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (263, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (264, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 526000, 30000, 'BIGSALE30', 496000, 'FAILED', '2026-04-21 10:47:06', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (264, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (264, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (264, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (265, 'cust-uuid-006', 160000, 0, NULL, 160000, 'PAID', '2025-10-30 18:47:32', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (265, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (265, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (265, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (266, 'cust-uuid-007', 546000, 30000, 'BIGSALE30', 516000, 'PAID', '2026-05-17 15:01:32', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (266, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (266, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (266, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (267, 'staff-uuid-001', 114000, 0, NULL, 114000, 'PAID', '2025-11-04 10:20:17', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (267, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (267, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (268, 'cust-uuid-007', 265000, 30000, 'BIGSALE30', 235000, 'PENDING', '2025-12-07 14:28:28', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (268, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (268, '2', '893000222', 'Xà lách thủy canh', 1, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (269, 'cust-uuid-007', 400000, 30000, 'BIGSALE30', 370000, 'PAID', '2025-10-23 16:52:47', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (269, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (269, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (270, 'cust-uuid-006', 177000, 0, NULL, 177000, 'FAILED', '2025-12-29 10:59:56', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (270, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (270, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (270, '5', '893000555', 'Coca-Cola Original 320ml', 1, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (270, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (271, 'staff-uuid-002', 591000, 30000, 'BIGSALE30', 561000, 'PAID', '2025-10-08 18:25:54', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (271, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (271, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (271, '9', '893000999', 'Omo Matic Liquid Detergent', 3, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (272, 'staff-uuid-001', 181000, 0, NULL, 181000, 'PAID', '2026-03-28 16:29:28', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (272, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (272, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (272, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (272, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (273, 'cust-uuid-001', 244000, 0, NULL, 244000, 'PAID', '2025-11-17 09:19:23', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (273, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (273, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (273, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (274, 'staff-uuid-002', 613000, 30000, 'BIGSALE30', 583000, 'PAID', '2026-01-26 13:00:33', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (274, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (274, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (274, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (274, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (275, 'cust-uuid-007', 94000, 0, NULL, 94000, 'FAILED', '2025-12-22 10:50:11', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (275, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (275, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (276, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 66000, 0, NULL, 66000, 'PAID', '2026-04-06 09:30:00', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (276, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (277, 'cust-uuid-009', 42000, 0, NULL, 42000, 'FAILED', '2026-05-11 16:46:15', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (277, '5', '893000555', 'Coca-Cola Original 320ml', 1, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (277, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (278, 'cust-uuid-003', 192000, 0, NULL, 192000, 'PAID', '2026-04-10 14:05:45', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (278, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (278, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (278, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (279, 'cust-uuid-007', 758000, 30000, 'BIGSALE30', 728000, 'PENDING', '2026-04-20 15:18:47', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (279, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (279, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (279, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (279, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (280, 'cust-uuid-003', 136000, 0, NULL, 136000, 'PAID', '2025-12-15 09:03:03', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (280, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (280, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (281, 'cust-uuid-010', 567000, 30000, 'BIGSALE30', 537000, 'FAILED', '2026-02-15 18:28:56', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (281, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (281, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (281, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (281, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (282, 'staff-uuid-002', 179000, 0, NULL, 179000, 'PAID', '2025-12-29 19:40:48', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (282, '10', '893001000', 'Chupa Chups Lollipops', 1, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (282, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (282, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (283, 'staff-uuid-002', 20000, 0, NULL, 20000, 'PAID', '2026-05-15 10:23:48', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (283, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (284, 'staff-uuid-002', 192000, 0, NULL, 192000, 'PENDING', '2025-12-27 12:04:53', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (284, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (284, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (284, '8', '893000888', 'Tiger Beer Crystal', 2, 18000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (285, 'cust-uuid-003', 480000, 30000, 'BIGSALE30', 450000, 'PAID', '2025-12-26 09:36:01', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (285, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (285, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (286, 'staff-uuid-001', 634000, 30000, 'BIGSALE30', 604000, 'FAILED', '2026-03-29 09:30:31', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (286, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (286, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (286, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (286, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (287, 'cust-uuid-004', 66000, 0, NULL, 66000, 'FAILED', '2026-04-19 16:09:25', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (287, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (288, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 190000, 0, NULL, 190000, 'PAID', '2026-03-30 13:34:15', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (288, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (288, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (289, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 482000, 30000, 'BIGSALE30', 452000, 'PAID', '2026-01-25 08:35:03', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (289, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (289, '5', '893000555', 'Coca-Cola Original 320ml', 3, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (289, '1', '893000111', 'Ba rọi heo VietXanh', 3, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (289, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (290, 'cust-uuid-003', 555000, 30000, 'BIGSALE30', 525000, 'PAID', '2025-10-28 16:15:48', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (290, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (290, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (290, '2', '893000222', 'Xà lách thủy canh', 1, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (291, 'cust-uuid-002', 385000, 30000, 'BIGSALE30', 355000, 'FAILED', '2025-11-24 12:42:06', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (291, '3', '893000333', 'Sữa tươi TH 1L', 2, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (291, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (291, '2', '893000222', 'Xà lách thủy canh', 3, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (292, 'cust-uuid-008', 398000, 30000, 'BIGSALE30', 368000, 'PAID', '2026-04-28 12:25:22', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (292, '4', '893000444', 'Lay''s Classic Potato Chips', 2, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (292, '6', '893000666', 'Sunlight Lemon Dishwash', 2, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (292, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (293, 'cust-uuid-006', 362000, 30000, 'BIGSALE30', 332000, 'PAID', '2025-10-11 10:34:21', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (293, '7', '893000777', 'Colgate Cavity Protection', 1, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (293, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (293, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (294, 'cust-uuid-001', 610000, 30000, 'BIGSALE30', 580000, 'PAID', '2025-12-31 11:08:38', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (294, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (294, '9', '893000999', 'Omo Matic Liquid Detergent', 2, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (294, '7', '893000777', 'Colgate Cavity Protection', 2, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (295, 'cust-uuid-004', 120000, 0, NULL, 120000, 'PAID', '2026-03-08 18:48:35', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (295, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (296, 'staff-uuid-002', 358000, 30000, 'BIGSALE30', 328000, 'PAID', '2025-11-14 16:39:42', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (296, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (296, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (296, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (297, 'cust-uuid-008', 275000, 30000, 'BIGSALE30', 245000, 'PAID', '2026-05-15 08:46:16', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (297, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (297, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (297, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (298, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 328000, 30000, 'BIGSALE30', 298000, 'FAILED', '2025-10-22 08:53:44', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (298, '4', '893000444', 'Lay''s Classic Potato Chips', 1, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (298, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (298, '10', '893001000', 'Chupa Chups Lollipops', 3, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (298, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (299, 'cust-uuid-007', 173000, 0, NULL, 173000, 'FAILED', '2026-05-16 16:46:17', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (299, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (299, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (299, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);

                                                                                            -- DATA GENERATED FROM 2026-06-01 TO 2026-06-04
-- Total Orders: 10

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (300, 'cust-uuid-008', 174000, 0, NULL, 174000, 'PENDING', '2026-06-03 11:02:21', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (300, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (300, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (301, 'cust-uuid-005', 246000, 0, NULL, 246000, 'PENDING', '2026-06-03 19:59:42', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (301, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (301, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (301, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (302, 'cust-uuid-007', 520000, 30000, 'BIGSALE30', 490000, 'PENDING', '2026-06-01 12:53:30', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (302, '2', '893000222', 'Xà lách thủy canh', 3, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (302, '9', '893000999', 'Omo Matic Liquid Detergent', 3, 145000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (302, '5', '893000555', 'Coca-Cola Original 320ml', 1, 10000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (303, 'cust-uuid-002', 80000, 0, NULL, 80000, 'PENDING', '2026-06-01 11:01:36', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (303, '5', '893000555', 'Coca-Cola Original 320ml', 2, 10000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (303, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (304, 'e3d7b2bf-943b-4f08-93ea-5189afc85172', 79000, 0, NULL, 79000, 'PAID', '2026-06-03 18:40:35', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (304, '8', '893000888', 'Tiger Beer Crystal', 3, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (304, '2', '893000222', 'Xà lách thủy canh', 1, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (305, 'staff-uuid-001', 307000, 30000, 'BIGSALE30', 277000, 'PENDING', '2026-06-02 09:22:08', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (305, '3', '893000333', 'Sữa tươi TH 1L', 3, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (305, '2', '893000222', 'Xà lách thủy canh', 2, 25000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (305, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (305, '6', '893000666', 'Sunlight Lemon Dishwash', 1, 32000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (306, 'cust-uuid-001', 241000, 0, NULL, 241000, 'PENDING', '2026-06-04 10:33:25', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (306, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (306, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (306, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (306, '2', '893000222', 'Xà lách thủy canh', 2, 25000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (307, 'cust-uuid-007', 403000, 30000, 'BIGSALE30', 373000, 'PENDING', '2026-06-02 15:04:04', false);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (307, '8', '893000888', 'Tiger Beer Crystal', 1, 18000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (307, '1', '893000111', 'Ba rọi heo VietXanh', 1, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (307, '7', '893000777', 'Colgate Cavity Protection', 3, 40000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (307, '9', '893000999', 'Omo Matic Liquid Detergent', 1, 145000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (308, 'cust-uuid-002', 462000, 30000, 'BIGSALE30', 432000, 'PENDING', '2026-06-02 12:26:10', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (308, '4', '893000444', 'Lay''s Classic Potato Chips', 3, 22000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (308, '1', '893000111', 'Ba rọi heo VietXanh', 2, 120000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (308, '6', '893000666', 'Sunlight Lemon Dishwash', 3, 32000);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (308, '10', '893001000', 'Chupa Chups Lollipops', 2, 30000);

INSERT INTO orders (id, keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished)
VALUES (309, 'staff-uuid-002', 35000, 0, NULL, 35000, 'PENDING', '2026-06-01 15:21:47', true);
INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) VALUES (309, '3', '893000333', 'Sữa tươi TH 1L', 1, 35000);

