package com.bachhoanhanh.userservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerProfile {

    @Id
    @Column(name = "keycloak_id")
    private String keycloakId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "keycloak_id")
    private User user;

    @Column(nullable = false)
    private int loyaltyPoints = 0;  // Điểm tích lũy

    // Danh sách khuyến mãi đã nhận → tách bảng riêng
    // (tránh lưu JSON thô, khó query)
}

