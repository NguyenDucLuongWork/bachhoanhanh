package com.bachhoanhanh.productservice.product.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;
    @Column(unique = true, nullable = false, length = 50)
    private String barcode;
    private String name;
    private String image;
    private String description;
    private String catalogId;
    private double originalPrice;
    @Column(name = "prototype_id", nullable = true)
    private String prototypeId;
}
