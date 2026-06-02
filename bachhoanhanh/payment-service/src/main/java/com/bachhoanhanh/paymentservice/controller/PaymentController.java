package com.bachhoanhanh.paymentservice.controller;

import com.bachhoanhanh.paymentservice.dto.PaymentCheckoutRequest;
import com.bachhoanhanh.paymentservice.dto.PaymentCheckoutResponse;
import com.bachhoanhanh.paymentservice.model.Payment;
import com.bachhoanhanh.paymentservice.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private static final String ORDER_SERVICE_URL = "http://order-service:8081/orders/";

    private final RestTemplate restTemplate;
    private final PaymentService paymentService;

    public PaymentController(RestTemplate restTemplate, PaymentService paymentService) {
        this.restTemplate = restTemplate;
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> paymentPayload) {
        Object orderIdValue = paymentPayload.get("orderId");
        String orderId = orderIdValue == null ? null : String.valueOf(orderIdValue);
        String paymentMethod = (String) paymentPayload.get("paymentMethod"); // Ví dụ: VNPAY, MOMO, CASH

        if (orderId == null || orderId.isBlank()) {
            return ResponseEntity.badRequest().body("Mã đơn hàng (orderId) là bắt buộc!");
        }

        try {
            // 1. Kiểm tra đơn hàng có tồn tại thông qua kết nối nội bộ đến order-service
            String orderUrl = ORDER_SERVICE_URL + orderId;
            Map<?, ?> order = restTemplate.getForObject(orderUrl, Map.class);

            if (order == null) {
                return ResponseEntity.badRequest().body("Đơn hàng không tồn tại trên hệ thống!");
            }

            // 2. Mô phỏng xử lý thanh toán thành công
            String transactionId = UUID.randomUUID().toString();
            String finalStatus = "paid"; // mark order as paid after successful payment

            // 3. Gọi ngược lại order-service để cập nhật trạng thái đơn hàng
            String updateStatusUrl = ORDER_SERVICE_URL + orderId;
            Map<String, String> body = Map.of("status", finalStatus);
            restTemplate.put(updateStatusUrl, body);

            // 4. Phản hồi kết quả về phía Client (Frontend)
            Map<String, Object> response = new HashMap<>();
            response.put("transactionId", transactionId);
            response.put("orderId", orderId);
            response.put("paymentMethod", paymentMethod);
            response.put("status", "SUCCESS");
            response.put("message", "Thanh toán thành công và đã cập nhật trạng thái đơn hàng!");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Nếu có lỗi hệ thống, cập nhật đơn hàng thành failed (best-effort)
            try {
                String updateStatusUrl = ORDER_SERVICE_URL + orderId;
                Map<String, String> body = Map.of("status", "failed");
                restTemplate.put(updateStatusUrl, body);
            } catch (Exception ex) {
                // ignore
            }
            return ResponseEntity.internalServerError().body("Lỗi trong quá trình thanh toán: " + e.getLocalizedMessage());
        }
    }

    // Create checkout for an order (frontend calls this to get paymentUrl)
    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckout(@RequestBody PaymentCheckoutRequest request) {
        if (request.getOrderId() == null || request.getOrderId() <= 0 || request.getAmount() <= 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "BAD_REQUEST",
                    "message", "orderId and amount are required"
            ));
        }

        Payment payment = paymentService.createCheckout(request.getOrderId(), request.getAmount());
        PaymentCheckoutResponse response = PaymentCheckoutResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .orderCode(payment.getOrderCode())
                .amount(payment.getAmount())
                .paymentUrl(payment.getQrUrl())
                .status(payment.getStatus())
                .build();
        return ResponseEntity.ok(response);
    }

    // Mark payment as paid (simulate gateway callback or frontend confirmation)
    @PostMapping("/{id}/pay")
    public ResponseEntity<Map<String, String>> payPayment(@PathVariable Long id) {
        Payment payment = paymentService.markPaymentPaid(id);
        if (payment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", "NOT_FOUND",
                    "message", "Payment not found"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "status", payment.getStatus(),
                "message", "Payment marked as paid"
        ));
    }

    @GetMapping("/status/{orderId}")
    public ResponseEntity<Map<String, String>> getStatus(@PathVariable Long orderId) {
        Payment payment = paymentService.getPaymentByOrderId(orderId);
        if (payment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "orderId", String.valueOf(orderId),
                    "status", "NOT_FOUND",
                    "message", "No payment found for order"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "orderId", String.valueOf(orderId),
                "status", payment.getStatus(),
                "message", "Payment status found"
        ));
    }
}
