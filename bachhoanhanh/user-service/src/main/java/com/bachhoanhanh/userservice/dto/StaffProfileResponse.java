package com.bachhoanhanh.userservice.dto;

import com.bachhoanhanh.userservice.model.StaffProfile;
import com.bachhoanhanh.userservice.model.User;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StaffProfileResponse {

    // Thông tin User
    private String keycloakId;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;

    // Thông tin Staff
    private LocalDate dateOfBirth;
    private String idCardNumber;
    private String avatarUrl;
    private boolean isFemale;
    private String address;

    public static StaffProfileResponse from(User user, StaffProfile profile) {
        return StaffProfileResponse.builder()
                .keycloakId(user.getKeycloakId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .dateOfBirth(profile.getDateOfBirth())
                .idCardNumber(profile.getIdCardNumber())
                .avatarUrl(profile.getAvatarUrl())
                .isFemale(profile.isFemale())
                .address(profile.getAddress())
                .build();
    }
}
