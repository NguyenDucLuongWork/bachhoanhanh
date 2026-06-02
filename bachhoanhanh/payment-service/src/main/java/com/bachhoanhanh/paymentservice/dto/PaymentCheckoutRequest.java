package com.bachhoanhanh.paymentservice.dto;

import lombok.Data;

@Data
public class PaymentCheckoutRequest {

    private Long orderId;
    private double amount;
}

