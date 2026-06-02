package com.bachhoanhanh.orderservice.model;

import java.util.Date;
import java.util.List;

public class Order {
    private Long id;
    private String productId;
    private String productName;
    private Integer quantity;
    private Double price;
    private Double totalPrice;
    private Double subtotal;
    private Double discountAmount;
    private String voucherCode;
    private String status; // pending, paid, failed
    private Date orderDate;
    private List<OrderItem> items;
    private List<FinishedOrderItem> finishedItems;
    private Boolean stockFinished = false;

    public Order() {}

    public Order(Long id, String productId, String productName, Integer quantity, Double price, Double totalPrice, String status, Date orderDate) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
        this.totalPrice = totalPrice;
        this.status = status;
        this.orderDate = orderDate;
    }

    // Getters và Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }
    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getOrderDate() { return orderDate; }
    public void setOrderDate(Date orderDate) { this.orderDate = orderDate; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public List<FinishedOrderItem> getFinishedItems() { return finishedItems; }
    public void setFinishedItems(List<FinishedOrderItem> finishedItems) { this.finishedItems = finishedItems; }
    public Boolean getStockFinished() { return stockFinished; }
    public void setStockFinished(Boolean stockFinished) { this.stockFinished = stockFinished; }

    // FE expects createdAt/total fields
    public Date getCreatedAt() { return orderDate; }
    public void setCreatedAt(Date createdAt) { this.orderDate = createdAt; }
    public Double getTotal() { return totalPrice; }
    public void setTotal(Double total) { this.totalPrice = total; }
}
