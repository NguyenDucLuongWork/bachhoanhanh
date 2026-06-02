package com.bachhoanhanh.orderservice.model;

public class OrderItem {
    private String productId;
    private String stockProductId;
    private String name;
    private Integer quantity;
    private Double price;

    public OrderItem() {}

    public OrderItem(String name, Integer quantity, Double price) {
        this.name = name;
        this.quantity = quantity;
        this.price = price;
    }

    public OrderItem(String productId, String name, Integer quantity, Double price) {
        this.productId = productId;
        this.name = name;
        this.quantity = quantity;
        this.price = price;
    }

    public OrderItem(String productId, String stockProductId, String name, Integer quantity, Double price) {
        this.productId = productId;
        this.stockProductId = stockProductId;
        this.name = name;
        this.quantity = quantity;
        this.price = price;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getStockProductId() {
        return stockProductId;
    }

    public void setStockProductId(String stockProductId) {
        this.stockProductId = stockProductId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}

