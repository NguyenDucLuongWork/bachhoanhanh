package com.bachhoanhanh.paymentservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    // API check nhanh để xem container có sống không
    @GetMapping("/test")
    public String test() {
        return "Payment Service is UP and RUNNING!";
    }

    // API tra cứu trạng thái thanh toán giả lập
    @GetMapping("/status/{orderId}")
    public Map<String, String> getStatus(@org.springframework.web.bind.annotation.PathVariable String orderId) {
        return Map.of(
                "orderId", orderId,
                "status", "PENDING",
                "message", "Waiting for customer to pay"
        );
    }
}