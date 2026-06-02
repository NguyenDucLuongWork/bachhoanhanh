package com.bachhoanhanh.voucherservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    private String description;

    /**
     * PERCENT  → discountValue is a percentage (e.g. 10 = 10%)
     * FIXED    → discountValue is an absolute amount (VND)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private double discountValue;

    /** Minimum order total required to use this voucher */
    private double minOrderValue;

    /** Cap for PERCENT vouchers (0 = no cap) */
    private double maxDiscountAmount;

    /** How many times this voucher can be used in total (0 = unlimited) */
    private int usageLimit;

    /** How many times it has been used so far */
    private int usedCount;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    private boolean active;

    // ── Target: exactly one of the two below must be non-null ──────────────

    /**
     * When set, this voucher applies only to orders containing this product.
     * Matches BaseProduct.productId (Long).
     */
    private Long targetProductId;

    /**
     * When set, this voucher applies only to orders containing products
     * from this catalog (id is a String slug, e.g. "fresh-food-vegetables").
     */
    private String targetCatalogId;
}