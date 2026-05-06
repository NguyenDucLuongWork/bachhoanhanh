package com.bachhoanhanh.productservice.attribute.repository;

import com.bachhoanhanh.productservice.attribute.model.Attribute;
import com.bachhoanhanh.productservice.attribute.model.AttributeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttributeRepository extends JpaRepository<Attribute, AttributeId> {

    // id.type → findById_Type ✅
    List<Attribute> findById_Type(String type);

    // id.productId → findById_ProductId ✅
    List<Attribute> findById_ProductId(Long productId);

    // id.type + value (value là field của Attribute, không phải AttributeId)
    // → findById_TypeAndValue ❌ (Spring hiểu là id.type và id.value — không tồn tại)
    // → đúng phải là:
    List<Attribute> findByIdTypeAndValue(String type, String value); // ✅
}