package com.bachhoanhanh.cartservice.repository;

import com.bachhoanhanh.cartservice.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUserIdOrderByUpdatedAtDesc(String userId);

    Optional<CartItem> findByUserIdAndProductId(String userId, Long productId);

    void deleteByUserIdAndProductId(String userId, Long productId);

    void deleteByUserId(String userId);
}
