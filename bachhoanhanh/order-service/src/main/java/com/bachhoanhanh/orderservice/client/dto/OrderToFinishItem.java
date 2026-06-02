package com.bachhoanhanh.orderservice.client.dto;

import lombok.Data;

@Data
public class OrderToFinishItem {

    private String productId;

    private String productName;

    private Integer quantity;

    private Double price;
}