package com.bachhoanhanh.stockservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinishedStockItemResponse {
    private String productId;
    private String productName;
    private Long stockId;
    private Integer quantity;
    private Double price;
}
