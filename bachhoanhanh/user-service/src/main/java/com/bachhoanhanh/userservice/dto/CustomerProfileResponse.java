package com.bachhoanhanh.userservice.dto;

import com.bachhoanhanh.userservice.model.CustomerProfile;
import com.bachhoanhanh.userservice.model.User;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerProfileResponse {

    // Thông tin User
    private String keycloakId;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;

    // Thông tin Customer
    private int loyaltyPoints;
    private List<ClaimedPromotionResponse> claimedPromotions;

    public static CustomerProfileResponse from(User user, CustomerProfile profile,
                                               List<ClaimedPromotionResponse> promotions) {
        return CustomerProfileResponse.builder()
                .keycloakId(user.getKeycloakId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .loyaltyPoints(profile.getLoyaltyPoints())
                .claimedPromotions(promotions)
                .build();
    }
}