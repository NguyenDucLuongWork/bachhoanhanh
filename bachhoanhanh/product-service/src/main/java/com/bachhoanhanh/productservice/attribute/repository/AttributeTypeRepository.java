package com.bachhoanhanh.productservice.attribute.repository;

import com.bachhoanhanh.productservice.attribute.model.AttributeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttributeTypeRepository extends JpaRepository<AttributeType, String> {
    // Bạn có thể thêm method tìm theo DataType nếu cần filter cho Manager UI
    // List<AttributeType> findByDataType(AttributeDataType dataType);
    Optional<AttributeType> findByName(String name);
}