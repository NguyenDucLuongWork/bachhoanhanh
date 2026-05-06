package com.bachhoanhanh.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClaimPromotionRequest {

    @NotBlank(message = "Mã khuyến mãi không được để trống")
    private String promotionCode;
}