package com.bachhoanhanh.productservice.attribute.service;

import com.bachhoanhanh.productservice.attribute.model.AttributeDataType;
import com.bachhoanhanh.productservice.attribute.model.AttributeType;
import com.bachhoanhanh.productservice.attribute.repository.AttributeTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttributeTypeService {

    private final AttributeTypeRepository attributeTypeRepository;

    /** Lấy tất cả AttributeType — dùng cho Manager UI dropdown */
    @Transactional(readOnly = true)
    public List<AttributeType> getAll() {
        return attributeTypeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public AttributeType getByName(String name) {
        return attributeTypeRepository.findById(name)
                .orElseThrow(() -> new EntityNotFoundException("AttributeType not found: " + name));
    }

    @Transactional(readOnly = true)
    public boolean exists(String name) {
        return attributeTypeRepository.existsById(name);
    }

    /** Tạo mới — Manager dùng để định nghĩa loại attribute mới (vd: BRAND, EXPIRY_DATE) */
    @Transactional
    public AttributeType create(String name, AttributeDataType dataType) {
        if (attributeTypeRepository.existsById(name)) {
            throw new IllegalArgumentException("AttributeType already exists: " + name);
        }
        return attributeTypeRepository.save(new AttributeType(name, dataType));
    }

    /** Xóa — chỉ xóa được nếu không có Attribute nào đang dùng type này */
    @Transactional
    public void delete(String name) {
        if (!attributeTypeRepository.existsById(name)) {
            throw new EntityNotFoundException("AttributeType not found: " + name);
        }
        attributeTypeRepository.deleteById(name);
    }
}