package com.bachhoanhanh.cartservice.controller;

import com.bachhoanhanh.cartservice.dto.CartItemRequest;
import com.bachhoanhanh.cartservice.dto.CartItemResponse;
import com.bachhoanhanh.cartservice.dto.UpdateQuantityRequest;
import com.bachhoanhanh.cartservice.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public List<CartItemResponse> getCart(@AuthenticationPrincipal Jwt jwt) {
        return cartService.getCart(userId(jwt));
    }

    @PostMapping("/items")
    public List<CartItemResponse> addItem(@AuthenticationPrincipal Jwt jwt, @RequestBody CartItemRequest request) {
        return cartService.addItem(userId(jwt), request);
    }

    @PutMapping("/items/{productId}")
    public List<CartItemResponse> updateQuantity(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long productId,
            @RequestBody UpdateQuantityRequest request
    ) {
        return cartService.updateQuantity(userId(jwt), productId, request.getQuantity());
    }

    @DeleteMapping("/items/{productId}")
    public List<CartItemResponse> removeItem(@AuthenticationPrincipal Jwt jwt, @PathVariable Long productId) {
        return cartService.removeItem(userId(jwt), productId);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal Jwt jwt) {
        cartService.clearCart(userId(jwt));
        return ResponseEntity.noContent().build();
    }

    private String userId(Jwt jwt) {
        return jwt.getSubject();
    }
}
