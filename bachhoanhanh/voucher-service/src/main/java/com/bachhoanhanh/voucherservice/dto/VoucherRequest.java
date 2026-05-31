package com.bachhoanhanh.voucherservice.dto;

import com.bachhoanhanh.voucherservice.model.DiscountType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VoucherRequest {

    @NotBlank
    private String code;

    private String description;

    @NotNull
    private DiscountType discountType;

    @Positive
    private double discountValue;

    @PositiveOrZero
    private double minOrderValue;

    @PositiveOrZero
    private double maxDiscountAmount;

    @PositiveOrZero
    private int usageLimit;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;

    private boolean active = true;

    /** Set this OR targetCatalogId — not both */
    private Long targetProductId;

    /** Set this OR targetProductId — not both */
    private String targetCatalogId;
}