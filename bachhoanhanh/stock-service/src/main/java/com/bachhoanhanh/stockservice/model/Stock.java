package com.bachhoanhanh.stockservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String productId;

    @Column(nullable = false)
    private Integer amount;

    @Column(nullable = false)
    private LocalDate importDate;       // ngày nhập

    @Column(nullable = false)
    private LocalDate manufactureDate;  // ngày bắt đầu hạn

    @Column(nullable = false)
    private LocalDate expiryDate;       // ngày hết hạn

    @Column(nullable = false)
    private Boolean available = true;
}