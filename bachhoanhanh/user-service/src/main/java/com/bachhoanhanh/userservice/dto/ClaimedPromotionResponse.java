package com.bachhoanhanh.userservice.dto;

import com.bachhoanhanh.userservice.model.ClaimedPromotion;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClaimedPromotionResponse {

    private Long id;
    private String promotionCode;
    private LocalDateTime claimedAt;

    public static ClaimedPromotionResponse from(ClaimedPromotion cp) {
        return ClaimedPromotionResponse.builder()
                .id(cp.getId())
                .promotionCode(cp.getPromotionCode())
                .claimedAt(cp.getClaimedAt())
                .build();
    }
}