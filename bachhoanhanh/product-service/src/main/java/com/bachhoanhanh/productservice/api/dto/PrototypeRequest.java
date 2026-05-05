package com.bachhoanhanh.productservice.api.dto;

import lombok.Data;

@Data
public class PrototypeRequest {
    private String productId;
    private String name;
    private String catalogId;
    private String[] attributeTypeNames;
}