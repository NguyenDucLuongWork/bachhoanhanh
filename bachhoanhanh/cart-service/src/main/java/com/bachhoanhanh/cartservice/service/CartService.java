package com.bachhoanhanh.cartservice.service;

import com.bachhoanhanh.cartservice.dto.CartItemRequest;
import com.bachhoanhanh.cartservice.dto.CartItemResponse;
import com.bachhoanhanh.cartservice.model.CartItem;
import com.bachhoanhanh.cartservice.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;

    @Transactional(readOnly = true)
    public List<CartItemResponse> getCart(String userId) {
        return cartItemRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(CartItemResponse::from)
                .toList();
    }

    @Transactional
    public List<CartItemResponse> addItem(String userId, CartItemRequest request) {
        validateProduct(request);

        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId())
                .orElseGet(CartItem::new);

        if (item.getId() == null) {
            item.setUserId(userId);
            item.setProductId(request.getProductId());
            item.setQuantity(0);
        }

        item.setBarcode(request.getBarcode());
        item.setName(request.getName());
        item.setImage(request.getImage());
        item.setDescription(request.getDescription());
        item.setCatalogId(request.getCatalogId());
        item.setPrototypeId(request.getPrototypeId());
        item.setOriginalPrice(request.getOriginalPrice());
        item.setQuantity(item.getQuantity() + Math.max(1, request.getQuantity()));
        item.setUpdatedAt(LocalDateTime.now());

        cartItemRepository.save(item);
        return getCart(userId);
    }

    @Transactional
    public List<CartItemResponse> updateQuantity(String userId, Long productId, int quantity) {
        if (quantity <= 0) {
            cartItemRepository.deleteByUserIdAndProductId(userId, productId);
            return getCart(userId);
        }

        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        item.setQuantity(quantity);
        item.setUpdatedAt(LocalDateTime.now());
        cartItemRepository.save(item);
        return getCart(userId);
    }

    @Transactional
    public List<CartItemResponse> removeItem(String userId, Long productId) {
        cartItemRepository.deleteByUserIdAndProductId(userId, productId);
        return getCart(userId);
    }

    @Transactional
    public void clearCart(String userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private void validateProduct(CartItemRequest request) {
        if (request.getProductId() == null) {
            throw new IllegalArgumentException("productId is required");
        }
        if (!StringUtils.hasText(request.getName())) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (request.getOriginalPrice() < 0) {
            throw new IllegalArgumentException("Product price cannot be negative");
        }
    }
}
