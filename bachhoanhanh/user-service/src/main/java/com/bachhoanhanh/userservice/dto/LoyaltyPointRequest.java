package com.bachhoanhanh.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoyaltyPointRequest {

    @NotNull
    @Min(value = 1, message = "Số điểm phải lớn hơn 0")
    private Integer points;
}