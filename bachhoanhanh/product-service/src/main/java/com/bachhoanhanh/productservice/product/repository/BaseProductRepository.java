package com.bachhoanhanh.productservice.product.repository;

import com.bachhoanhanh.productservice.product.model.BaseProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface BaseProductRepository extends JpaRepository<BaseProduct, Long> {

    /**
     * Tìm sản phẩm bằng mã vạch.
     * Phục vụ chức năng quét mã bán hàng hoặc kiểm tra kho nhanh.
     */
    Optional<BaseProduct> findByBarcode(String barcode);

    /**
     * Kiểm tra xem mã vạch đã tồn tại chưa.
     * Dùng để validate trước khi thêm mới sản phẩm, tránh lỗi trùng lặp.
     */
    boolean existsByBarcode(String barcode);

    /**
     * Lấy danh sách sản phẩm dựa trên khuôn mẫu (Prototype).
     * Hữu ích khi bạn muốn lọc tất cả sản phẩm thuộc loại "Thịt tươi" hoặc "Rau củ".
     */
    List<BaseProduct> findByPrototypeId(String prototypeId);

    /**
     * Tìm kiếm sản phẩm theo tên (hỗ trợ tìm kiếm gần đúng trên UI).
     */
    List<BaseProduct> findByNameContainingIgnoreCase(String name);
}