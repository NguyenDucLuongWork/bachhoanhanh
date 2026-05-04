CREATE DATABASE IF NOT EXISTS productdb;
CREATE DATABASE IF NOT EXISTS orderdb;

USE productdb;

CREATE TABLE IF NOT EXISTS product (
                                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       name VARCHAR(255),
    price DOUBLE
    );

INSERT INTO product (name, price) VALUES ('Laptop', 1000);
INSERT INTO product (name, price) VALUES ('Phone', 500);
INSERT INTO product (name, price) VALUES ('Tablet', 700);