package com.bachhoanhanh.productservice.client.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class StockDetail {
    private Long id;
    private String productId;
    private Integer amount;
    private LocalDate importDate;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private Boolean available;
}