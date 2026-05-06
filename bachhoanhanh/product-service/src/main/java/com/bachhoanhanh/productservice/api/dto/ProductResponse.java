package com.bachhoanhanh.productservice.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long productId;
    private String barcode;
    private String name;
    private String image;
    private String description;
    private String catalogId;
    private double originalPrice;
    private String prototypeId;
    private Map<String, String> attributes;
}