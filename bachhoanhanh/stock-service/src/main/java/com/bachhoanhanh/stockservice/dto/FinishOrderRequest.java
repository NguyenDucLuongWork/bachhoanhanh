package com.bachhoanhanh.stockservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class FinishOrderRequest {
    private Long orderId;
    private List<FinishOrderItemRequest> items;
}
