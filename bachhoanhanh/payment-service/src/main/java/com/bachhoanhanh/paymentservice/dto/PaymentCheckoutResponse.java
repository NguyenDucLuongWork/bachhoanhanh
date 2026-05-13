package com.bachhoanhanh.paymentservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentCheckoutResponse {

    private Long paymentId;
    private Long orderId;
    private String orderCode;
    private double amount;
    private String paymentUrl;
    private String status;
}

