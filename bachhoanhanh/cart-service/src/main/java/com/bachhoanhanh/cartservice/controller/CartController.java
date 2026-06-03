package com.bachhoanhanh.cartservice.controller;

import com.bachhoanhanh.cartservice.dto.CartItemRequest;
import com.bachhoanhanh.cartservice.dto.CartItemResponse;
import com.bachhoanhanh.cartservice.dto.UpdateQuantityRequest;
import com.bachhoanhanh.cartservice.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public List<CartItemResponse> getCart(
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        return cartService.getCart(resolveUserId(userId));
    }

    @PostMapping("/items")
    public List<CartItemResponse> addItem(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody CartItemRequest request
    ) {
        return cartService.addItem(resolveUserId(userId), request);
    }

    @PutMapping("/items/{productId}")
    public List<CartItemResponse> updateQuantity(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @PathVariable Long productId,
            @RequestBody UpdateQuantityRequest request
    ) {
        return cartService.updateQuantity(resolveUserId(userId), productId, request.getQuantity());
    }

    @DeleteMapping("/items/{productId}")
    public List<CartItemResponse> removeItem(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @PathVariable Long productId
    ) {
        return cartService.removeItem(resolveUserId(userId), productId);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        cartService.clearCart(resolveUserId(userId));
        return ResponseEntity.noContent().build();
    }

    private String resolveUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated user");
        }
        return userId;
    }
}
