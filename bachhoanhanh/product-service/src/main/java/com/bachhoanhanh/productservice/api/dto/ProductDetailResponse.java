package com.bachhoanhanh.productservice.api.dto;

import com.bachhoanhanh.productservice.client.dto.StockDetail;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailResponse {
    private Long productId;
    private String barcode;
    private String name;
    private String image;
    private String description;
    private String catalogId;
    private double originalPrice;
    private String prototypeId;
    private Map<String, String> attributes;

    // Stock — full batch breakdown + total
    private Integer totalAvailableAmount;
    private List<StockDetail> availableStocks;

    // Brand info (nullable)
    private Long brandId;
    private String brandName;
    private String brandImage;
    private String brandDescription;
    private String brandPhone;
    private String brandEmail;
}