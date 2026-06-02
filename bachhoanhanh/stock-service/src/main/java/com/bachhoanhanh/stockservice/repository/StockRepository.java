package com.bachhoanhanh.stockservice.repository;

import com.bachhoanhanh.stockservice.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface StockRepository extends JpaRepository<Stock, Long> {

    List<Stock> findByProductId(String productId);

    List<Stock> findByExpiryDateBefore(LocalDate date);

    List<Stock> findByExpiryDateBetween(LocalDate from, LocalDate to);

    // Fetch only available + non-expired records for a product in one SQL hit
    @Query("""
        SELECT s FROM Stock s
        WHERE s.productId = :productId
          AND s.available = true
          AND s.expiryDate >= :today
        """)
    List<Stock> findAvailableAndNotExpired(@Param("productId") String productId,
                                           @Param("today") LocalDate today);

    // Bulk-expire: mark available=false for all expired rows of a product
    // Runs as a single UPDATE — no Java loop needed
    @Modifying
    @Query("""
        UPDATE Stock s
        SET s.available = false
        WHERE s.productId = :productId
          AND s.available = true
          AND s.expiryDate < :today
        """)
    int markExpiredByProductId(@Param("productId") String productId,
                               @Param("today") LocalDate today);
}