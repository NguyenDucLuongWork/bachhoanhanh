package com.bachhoanhanh.userservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @Column(name = "keycloak_id", nullable = false, unique = true)
    private String keycloakId; // UUID từ Keycloak, dùng làm PK luôn

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Quan hệ 1-1 với profile tương ứng
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private StaffProfile staffProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CustomerProfile customerProfile;
}