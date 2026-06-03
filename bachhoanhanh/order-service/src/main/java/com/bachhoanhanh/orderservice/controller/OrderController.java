package com.bachhoanhanh.orderservice.controller;

import com.bachhoanhanh.orderservice.dto.CreateOrderRequest;
import com.bachhoanhanh.orderservice.model.Order;
import com.bachhoanhanh.orderservice.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** Customer: lấy đơn hàng của chính mình (keycloak_id từ header do gateway inject) */
    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(
            @RequestHeader(value = "X-User-Id", required = false) String keycloakId
    ) {
        if (keycloakId == null || keycloakId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(orderService.getOrdersByUser(keycloakId));
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String keycloakId
    ) {
        try {
            // Ưu tiên header từ gateway, fallback về field trong body nếu có
            if (keycloakId != null && !keycloakId.isBlank()) {
                request.setKeycloakId(keycloakId);
            }
            return ResponseEntity.ok(orderService.createOrder(request));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return order != null ? ResponseEntity.ok(order) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        Order updated = orderService.updateOrderStatus(id, status);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.updateOrderStatus(id, "CANCELLED");
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(
            @RequestParam(value = "userId", required = false) String userId
    ) {
        if (userId != null && !userId.isBlank()) {
            return ResponseEntity.ok(orderService.getOrdersByUser(userId));
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}