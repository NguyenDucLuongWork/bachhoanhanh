package com.bachhoanhanh.voucherservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class ApplyVoucherRequest {

    @NotBlank
    private String code;

    /** Total value of the order */
    @Positive
    private double orderTotal;

    /** Product IDs present in the order (to check targetProductId match) */
    @NotEmpty
    private List<Long> productIds;

    /** Catalog IDs of products in the order (to check targetCatalogId match) */
    @NotEmpty
    private List<String> catalogIds;
}