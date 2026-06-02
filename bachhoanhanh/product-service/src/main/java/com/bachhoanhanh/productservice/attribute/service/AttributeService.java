package com.bachhoanhanh.productservice.attribute.service;

import com.bachhoanhanh.productservice.attribute.model.Attribute;
import com.bachhoanhanh.productservice.attribute.model.AttributeId;
import com.bachhoanhanh.productservice.attribute.repository.AttributeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@CacheConfig(cacheNames = "attributes")
public class AttributeService {

    private final AttributeRepository attributeRepository;
    private final AttributeTypeService attributeTypeService;

    // ─── READ ─────────────────────────────────────────────────────────────────

    /** Lấy tất cả attribute của 1 product — dùng khi hiển thị detail */
    @Cacheable(key = "#productId")
    @Transactional(readOnly = true)
    public List<Attribute> getByProduct(Long productId) {
        return attributeRepository.findById_ProductId(productId);
    }
    /**
     * Lấy attributes của 1 product dưới dạng Map<typeName, value>
     * Tiện cho UI hiển thị bảng key-value
     */
    @Cacheable(key = "'map:' + #productId")
    @Transactional(readOnly = true)
    public Map<String, String> getProductAttributeMap(Long productId) {
        return attributeRepository.findById_ProductId(productId).stream()
                .collect(Collectors.toMap(Attribute::getTypeName, Attribute::getValue));
    }

    /** Lấy tất cả product có cùng giá trị của 1 type — vd: tìm tất cả sản phẩm Brand=Vinamilk */
    @Transactional(readOnly = true)
    public List<Attribute> getByTypeAndValue(String typeName, String value) {
        return attributeRepository.findByIdTypeAndValue(typeName, value); // ← đổi tên method
    }

    /** Lấy tất cả records của 1 type — vd: lấy EXPIRY_DATE của mọi sản phẩm */
    @Cacheable(key = "'type:' + #typeName")
    @Transactional(readOnly = true)
    public List<Attribute> getByType(String typeName) {
        return attributeRepository.findById_Type(typeName);
    }

    // ─── WRITE ────────────────────────────────────────────────────────────────

    /**
     * Set (upsert) 1 attribute cho product.
     * Nếu đã tồn tại thì update value, chưa có thì tạo mới.
     */
    @CacheEvict(allEntries = true)
    @Transactional
    public Attribute set(Long productId, String typeName, String value) {
        if (!attributeTypeService.exists(typeName)) {
            throw new EntityNotFoundException("AttributeType not found: " + typeName);
        }
        AttributeId id = new AttributeId(productId, typeName);
        Attribute attribute = attributeRepository.findById(id)
                .orElse(new Attribute(id, null, null));
        attribute.setValue(value);
        return attributeRepository.save(attribute);
    }

    /**
     * Batch upsert — dùng khi tạo product từ prototype.
     * map: typeName -> value
     */
    @CacheEvict(allEntries = true)
    @Transactional
    public List<Attribute> setAll(Long productId, Map<String, String> attributeMap) {
        List<Attribute> toSave = attributeMap.entrySet().stream()
                .map(entry -> {
                    if (!attributeTypeService.exists(entry.getKey())) {
                        throw new EntityNotFoundException("AttributeType not found: " + entry.getKey());
                    }
                    return new Attribute(new AttributeId(productId, entry.getKey()), entry.getValue(), null);
                })
                .toList();
        return attributeRepository.saveAll(toSave);
    }

    /** Xóa 1 attribute cụ thể của product */
    @CacheEvict(allEntries = true)
    @Transactional
    public void remove(Long productId, String typeName) {
        AttributeId id = new AttributeId(productId, typeName);
        if (!attributeRepository.existsById(id)) {
            throw new EntityNotFoundException(
                    "Attribute not found for product=%s type=%s".formatted(productId, typeName));
        }
        attributeRepository.deleteById(id);
    }


    /** Xóa toàn bộ attribute của 1 product — dùng khi xóa product */
    @CacheEvict(allEntries = true)
    @Transactional
    public void removeAllByProduct(Long productId) {
        attributeRepository.deleteAll(attributeRepository.findById_ProductId(productId));
    }
}