package com.bachhoanhanh.paymentservice.service;

import com.bachhoanhanh.paymentservice.repository.PaymentRepository;
import com.bachhoanhanh.paymentservice.model.Payment;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class PaymentService {

    private final PaymentRepository repository;
    public PaymentService(PaymentRepository repository) {
        this.repository = repository;
    }

    public List<Payment> getAllPayments() {
        return repository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Payment getPaymentByOrderId(Long orderId) {
        return repository.findByOrderId(orderId).orElse(null);
    }

    public Payment getPaymentByOrderCode(String orderCode) {
        return repository.findByOrderCode(orderCode).orElse(null);
    }

    public Payment createPayment(Payment payment) {
        if (payment.getStatus() == null || payment.getStatus().isBlank()) {
            payment.setStatus("PENDING");
        }
        return repository.save(payment);
    }

    public Payment updatePayment(Long id, Payment newPayment) {
        return repository.findById(id).map(payment -> {
            payment.setOrderId(newPayment.getOrderId());
            payment.setOrderCode(newPayment.getOrderCode());
            payment.setAmount(newPayment.getAmount());
            if (newPayment.getStatus() != null && !newPayment.getStatus().isBlank()) {
                payment.setStatus(newPayment.getStatus());
            }
            return repository.save(payment);
        }).orElse(null);
    }

    public Payment updateStatusByPaymentId(Long paymentId, String status) {
        return repository.findById(paymentId).map(payment -> {
            payment.setStatus(status);
            return repository.save(payment);
        }).orElse(null);
    }

    public Payment updateStatusByOrderId(Long orderId, String status) {
        return repository.findByOrderId(orderId).map(payment -> {
            payment.setStatus(status);
            return repository.save(payment);
        }).orElse(null);
    }

    public Payment updateStatusByOrderCode(String orderCode, String status) {
        return repository.findByOrderCode(orderCode).map(payment -> {
            payment.setStatus(status);
            return repository.save(payment);
        }).orElse(null);
    }

    public Payment createCheckout(Long orderId, double amount) {
        String orderCode = buildOrderCode(orderId);
        Payment payment = repository.findByOrderId(orderId).orElse(Payment.builder().orderId(orderId).build());
        payment.setOrderCode(orderCode);
        payment.setAmount(amount);
        if (payment.getStatus() == null || payment.getStatus().isBlank()) {
            payment.setStatus("pending");
        }

        // Save initially to generate ID (if new) so we can construct a payment URL
        payment = repository.save(payment);

        // Simple generic payment URL (frontend will open this and then call POST /payments/{id}/pay)
        String paymentUrl = "/payments/" + payment.getId() + "/pay";
        payment.setQrUrl(paymentUrl); // reuse qrUrl field to store the URL
        return repository.save(payment);
    }

    public Payment markPaymentPaid(Long paymentId) {
        Optional<Payment> existing = repository.findById(paymentId);
        if (existing.isEmpty()) {
            return null;
        }

        Payment payment = existing.get();
        payment.setStatus("paid");
        payment = repository.save(payment);

        // Notify Order Service to update order status (service-to-service call)
        try {
            RestTemplate rest = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, String> body = Map.of("status", "paid");
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
            String url = "http://order-service:8081/orders/" + payment.getOrderId();
            rest.exchange(url, HttpMethod.PUT, entity, Void.class);
        } catch (Exception ex) {
            // best-effort notify; ignore failures for now
            ex.printStackTrace();
        }

        return payment;
    }

    private String buildOrderCode(Long orderId) {
        String prefix = "ORD";
        return prefix + orderId;
    }
}
