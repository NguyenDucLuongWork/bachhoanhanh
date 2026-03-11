package com.bachhoanhanh.orderservice.model;

public class Order {

    private Long id;
    private Long productId;
    private int quantity;

    public Order() {}

    public Order(Long id, Long productId, int quantity) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public int getQuantity() {
        return quantity;
    }
}