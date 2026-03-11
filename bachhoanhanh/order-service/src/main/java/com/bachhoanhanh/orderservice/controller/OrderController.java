package com.bachhoanhanh.orderservice.controller;

import com.bachhoanhanh.orderservice.dto.Product;
import com.bachhoanhanh.orderservice.service.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/{productId}")
    public Product getProduct(@PathVariable Long productId) {
        return orderService.getProduct(productId);
    }
}