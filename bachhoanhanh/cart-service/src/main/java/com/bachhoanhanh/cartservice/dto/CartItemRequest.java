package com.bachhoanhanh.cartservice.dto;

import lombok.Data;

@Data
public class CartItemRequest {
    private Long productId;
    private String barcode;
    private String name;
    private String image;
    private String description;
    private String catalogId;
    private String prototypeId;
    private double originalPrice;
    private int quantity = 1;
}
