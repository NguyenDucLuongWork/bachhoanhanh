package com.bachhoanhanh.productservice.api.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ProductRequest {
    private String barcode;
    private String name;
    private String image;
    private String description;
    private String catalogId;
    private double originalPrice;
    private String prototypeId;
    private Map<String, String> attributes;
}