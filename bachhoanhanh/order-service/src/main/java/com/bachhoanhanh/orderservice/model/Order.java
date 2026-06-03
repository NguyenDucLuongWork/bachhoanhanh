package com.bachhoanhanh.orderservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    private Long id;
    private String keycloakId;
    private Double subtotal;
    private Double discountAmount;
    private String voucherCode;
    private Double totalPrice;
    private String status;
    private Date orderDate;
    @Builder.Default
    private Boolean stockFinished = false;
    private List<OrderItem> items;
    private List<FinishedOrderItem> finishedItems;

    // FE aliases
    public Date getCreatedAt() { return orderDate; }
    public Double getTotal()   { return totalPrice; }
}