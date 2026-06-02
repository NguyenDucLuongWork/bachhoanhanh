package com.bachhoanhanh.stockservice.dto;

import lombok.Data;

@Data
public class FinishOrderItemRequest {
    private String productId;
    private String productName;
    private Integer quantity;
    private Double price;
}
