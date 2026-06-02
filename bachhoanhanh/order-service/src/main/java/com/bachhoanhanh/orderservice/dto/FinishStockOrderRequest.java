package com.bachhoanhanh.orderservice.dto;

import java.util.List;

public class FinishStockOrderRequest {
    private Long orderId;
    private List<FinishStockOrderItemRequest> items;

    public FinishStockOrderRequest() {}

    public FinishStockOrderRequest(Long orderId, List<FinishStockOrderItemRequest> items) {
        this.orderId = orderId;
        this.items = items;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public List<FinishStockOrderItemRequest> getItems() { return items; }
    public void setItems(List<FinishStockOrderItemRequest> items) { this.items = items; }
}
