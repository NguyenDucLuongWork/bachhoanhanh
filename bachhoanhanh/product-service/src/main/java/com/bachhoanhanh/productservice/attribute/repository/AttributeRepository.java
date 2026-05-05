package com.bachhoanhanh.productservice.attribute.repository;

import com.bachhoanhanh.productservice.attribute.model.Attribute;
import com.bachhoanhanh.productservice.attribute.model.AttributeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttributeRepository extends JpaRepository<Attribute, AttributeId> {

    /**
     * Tìm tất cả các bản ghi Attribute dựa trên tên của loại thuộc tính.
     * Ví dụ: truyền vào "EXPIRY_DATE" để lấy tất cả các dòng chứa ngày hết hạn của mọi sản phẩm.
     */
    List<Attribute> findById_Type(String type);

    /**
     * Tìm tất cả Attribute của một sản phẩm cụ thể.
     */
    List<Attribute> findById_ProductId(String productId);

    /**
     * Tìm chính xác một giá trị attribute của một type cụ thể.
     * Hữu ích khi bạn muốn lọc nhanh các sản phẩm có cùng một giá trị (VD: cùng Brand "Vinamilk")
     */
    List<Attribute> findById_TypeAndValue(String type, String value);
}