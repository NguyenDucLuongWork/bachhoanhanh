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

    // 1. Khớp với loadOrders(): GET /api/orders
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // 1b. Tạo đơn hàng: POST /api/orders
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        if (request.getProductId() == null || request.getProductId().isBlank() || request.getQuantity() == null || request.getQuantity() <= 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "productId and quantity are required"
            ));
        }

        try {
            Order order = orderService.createOrder(request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(order);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // 2. Khớp với getOrderDetails(id): GET /api/orders/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return order != null ? ResponseEntity.ok(order) : ResponseEntity.notFound().build();
    }

    // 3. Khớp với updateOrderStatus(id, status): PUT /api/orders/{id}
    // Dữ liệu nhận vào là @RequestBody Map để lấy trường "status"
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        Order updatedOrder = orderService.updateOrderStatus(id, status);
        return updatedOrder != null ? ResponseEntity.ok(updatedOrder) : ResponseEntity.notFound().build();
    }

    // 4. Khớp với cancelOrder(id): DELETE /api/orders/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.updateOrderStatus(id, "cancelled");
        return ResponseEntity.ok().build();
    }
}