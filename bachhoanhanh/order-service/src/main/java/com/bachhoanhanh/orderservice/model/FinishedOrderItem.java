package com.bachhoanhanh.orderservice.model;

public class FinishedOrderItem {
    private String productId;
    private String productName;
    private Long stockId;
    private Integer quantity;
    private Double price;

    public FinishedOrderItem() {}

    public FinishedOrderItem(String productId, String productName, Long stockId, Integer quantity, Double price) {
        this.productId = productId;
        this.productName = productName;
        this.stockId = stockId;
        this.quantity = quantity;
        this.price = price;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Long getStockId() { return stockId; }
    public void setStockId(Long stockId) { this.stockId = stockId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
}
