package com.bachhoanhanh.productservice.prototype.repository;

import com.bachhoanhanh.productservice.prototype.model.Prototype;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrototypeRepository extends JpaRepository<Prototype, String> {

    /**
     * Tìm tất cả các khuôn mẫu (Prototype) thuộc về một danh mục cụ thể.
     * Ví dụ: Lấy tất cả Prototype thuộc catalog "THỰC_PHẨM_TƯƠI_SỐNG".
     */
    List<Prototype> findByCatalogId(String catalogId);

    /**
     * Tìm Prototype theo tên hiển thị.
     */
    Optional<Prototype> findByName(String name);

    /**
     * Kiểm tra sự tồn tại của productId (ID của khuôn mẫu).
     */
    boolean existsByProductId(String productId);
}