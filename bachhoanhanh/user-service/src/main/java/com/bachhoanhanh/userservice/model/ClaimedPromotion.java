package com.bachhoanhanh.userservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claimed_promotions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClaimedPromotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK về customer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keycloak_id", nullable = false)
    private CustomerProfile customerProfile;

    @Column(nullable = false)
    private String promotionCode;

    private LocalDateTime claimedAt;
}