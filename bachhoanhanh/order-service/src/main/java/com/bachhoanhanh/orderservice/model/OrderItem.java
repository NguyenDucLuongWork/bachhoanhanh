package com.bachhoanhanh.orderservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    private Long id;
    private Long orderId;
    private String productId;
    private String stockProductId;
    private String name;
    private Integer quantity;
    private Double price;
}