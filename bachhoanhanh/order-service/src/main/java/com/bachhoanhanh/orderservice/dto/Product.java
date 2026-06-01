package com.bachhoanhanh.orderservice.dto;

public class Product {

    private Long id;
    private Long productId;
    private String name;
    private String catalogId;
    private double originalPrice;

    public Product(){}

    public Long getId() { return id; }

    public Long getProductId() { return productId; }

    public String getName() { return name; }

    public String getCatalogId() { return catalogId; }

    public double getOriginalPrice() { return originalPrice; }

    public double getPrice() { return originalPrice; }
}
