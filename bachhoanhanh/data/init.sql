CREATE DATABASE IF NOT EXISTS productdb;
CREATE DATABASE IF NOT EXISTS orderdb;
CREATE DATABASE IF NOT EXISTS branddb;

GRANT ALL PRIVILEGES ON orderdb.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON branddb.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

USE productdb;

CREATE TABLE IF NOT EXISTS product (
                                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       name VARCHAR(255),
    price DOUBLE
    );

INSERT INTO product (name, price) VALUES ('Laptop', 1000);
INSERT INTO product (name, price) VALUES ('Phone', 500);
INSERT INTO product (name, price) VALUES ('Tablet', 700);

USE branddb;

CREATE TABLE IF NOT EXISTS brand (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     name VARCHAR(255),
    image VARCHAR(255),
    description TEXT,
    phone_number VARCHAR(50),
    email VARCHAR(255)
    );

INSERT INTO brand (name, image, description, phone_number, email) VALUES
    ('Apple', 'apple.png', 'American multinational technology company.', '+1-800-275-2273', 'support@apple.com');

INSERT INTO brand (name, image, description, phone_number, email) VALUES
    ('Samsung', 'samsung.png', 'South Korean multinational electronics company.', '+1-800-726-7864', 'support@samsung.com');

INSERT INTO brand (name, image, description, phone_number, email) VALUES
    ('Dell', 'dell.png', 'American technology company known for PCs and laptops.', '+1-800-335-5095', 'support@dell.com');