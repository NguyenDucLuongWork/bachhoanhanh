package com.bachhoanhanh.userservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "staff_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StaffProfile {

    @Id
    @Column(name = "keycloak_id")
    private String keycloakId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "keycloak_id")
    private User user;

    private LocalDate dateOfBirth;

    @Column(unique = true)
    private String idCardNumber;   // Số CCCD/CMND

    private String avatarUrl;      // URL ảnh (lưu trên S3/MinIO)

    private boolean isFemale;

    private String address;
}