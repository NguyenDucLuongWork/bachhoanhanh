package com.bachhoanhanh.productservice.api.dto.order;

import lombok.Data;

@Data
public class OrderToFinishItem {

    private String productId;

    private String productName;

    private Integer quantity;

    private Double price;
}