package com.bachhoanhanh.voucherservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApplyVoucherResponse {
    private String code;
    private double originalTotal;
    private double discountAmount;
    private double finalTotal;
}