package com.bachhoanhanh.productservice.product.service;

import com.bachhoanhanh.productservice.attribute.service.AttributeService;
import com.bachhoanhanh.productservice.product.model.BaseProduct;
import com.bachhoanhanh.productservice.product.repository.BaseProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@CacheConfig(cacheNames = "products")
public class BaseProductService {

    private final BaseProductRepository baseProductRepository;
    private final AttributeService attributeService;

    // ─── READ ─────────────────────────────────────────────────────────────────

    @Cacheable(key = "'all'")
    @Transactional(readOnly = true)
    public List<BaseProduct> getAll() {
        return baseProductRepository.findAll();
    }

    @Cacheable(key = "#productId")
    @Transactional(readOnly = true)
    public BaseProduct getById(Long productId) {
        return baseProductRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + productId));
    }

    @Cacheable(key = "'barcode:' + #barcode")
    @Transactional(readOnly = true)
    public BaseProduct getByBarcode(String barcode) {
        return baseProductRepository.findByBarcode(barcode)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with barcode: " + barcode));
    }

    @Cacheable(key = "'search:' + #name")
    @Transactional(readOnly = true)
    public List<BaseProduct> searchByName(String name) {
        return baseProductRepository.findByNameContainingIgnoreCase(name);
    }

    @Cacheable(key = "'prototype:' + #prototypeId")
    @Transactional(readOnly = true)
    public List<BaseProduct> getByPrototype(String prototypeId) {
        return baseProductRepository.findByPrototypeId(prototypeId);
    }

    @Cacheable(key = "'catalog:' + #catalogId")
    @Transactional(readOnly = true)
    public List<BaseProduct> getByCatalog(String catalogId) {
        return baseProductRepository.findByCatalogId(catalogId);
    }

    // ─── WRITE ────────────────────────────────────────────────────────────────

    /**
     * Tạo product mới không kèm attribute.
     * Dùng khi nhập thủ công từng sản phẩm đơn giản.
     */
    @CacheEvict(allEntries = true)
    @Transactional
    public BaseProduct create(BaseProduct product) {
        if (baseProductRepository.existsByBarcode(product.getBarcode())) {
            throw new IllegalArgumentException("Barcode already exists: " + product.getBarcode());
        }
        return baseProductRepository.save(product);
    }

    /**
     * Tạo product kèm attributes cùng lúc — dùng khi tạo từ Prototype.
     * attributeMap: typeName -> value, vd: {"BRAND" -> "Vinamilk", "EXPIRY_DATE" -> "2025-12-01"}
     */
    @CacheEvict(allEntries = true)
    @Transactional
    public BaseProduct createWithAttributes(BaseProduct product, Map<String, String> attributeMap) {
        if (baseProductRepository.existsByBarcode(product.getBarcode())) {
            throw new IllegalArgumentException("Barcode already exists: " + product.getBarcode());
        }
        BaseProduct saved = baseProductRepository.save(product);

        if (attributeMap != null && !attributeMap.isEmpty()) {
            attributeService.setAll(saved.getProductId(), attributeMap);
        }
        return saved;
    }

    /**
     * Update thông tin cơ bản của product.
     * Không update barcode vì đó là định danh vật lý.
     * allEntries = true để clear toàn bộ cache products::*
     * (bao gồm all, search:*, catalog:*, prototype:*)
     */
    @CacheEvict(allEntries = true)
    @Transactional
    public BaseProduct update(Long productId, BaseProduct updated) {
        BaseProduct existing = getById(productId);
        existing.setName(updated.getName());
        existing.setImage(updated.getImage());
        existing.setDescription(updated.getDescription());
        existing.setCatalogId(updated.getCatalogId());
        existing.setOriginalPrice(updated.getOriginalPrice());
        existing.setPrototypeId(updated.getPrototypeId());
        return baseProductRepository.save(existing);
    }

    /**
     * Xóa product và toàn bộ attribute liên quan.
     * allEntries = true để clear toàn bộ cache products::*
     */
    @CacheEvict(allEntries = true)
    @Transactional
    public void delete(Long productId) {
        if (!baseProductRepository.existsById(productId)) {
            throw new EntityNotFoundException("Product not found: " + productId);
        }
        attributeService.removeAllByProduct(productId);
        baseProductRepository.deleteById(productId);
    }

}