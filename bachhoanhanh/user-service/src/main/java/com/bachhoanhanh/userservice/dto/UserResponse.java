package com.bachhoanhanh.userservice.dto;

import com.bachhoanhanh.userservice.model.User;
import com.bachhoanhanh.userservice.model.Role;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {

    private String keycloakId;
    private String fullName;
    private String phone;
    private String email;
    private Role role;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .keycloakId(user.getKeycloakId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}