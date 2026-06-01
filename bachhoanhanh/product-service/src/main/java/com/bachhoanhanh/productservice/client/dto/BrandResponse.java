package com.bachhoanhanh.productservice.client.dto;

import lombok.Data;

@Data
public class BrandResponse {
    private Long id;
    private String name;
    private String image;
    private String description;
    private String phoneNumber;
    private String email;
}