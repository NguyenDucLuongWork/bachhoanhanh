package com.bachhoanhanh.productservice.product.service;

import com.bachhoanhanh.productservice.attribute.service.AttributeService;
import com.bachhoanhanh.productservice.product.model.BaseProduct;
import com.bachhoanhanh.productservice.product.repository.BaseProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BaseProductService {

    private final BaseProductRepository baseProductRepository;
    private final AttributeService attributeService;

    // ─── READ ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BaseProduct> getAll() {
        return baseProductRepository.findAll();
    }

    @Transactional(readOnly = true)
    public BaseProduct getById(Long productId) {
        return baseProductRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + productId));
    }

    @Transactional(readOnly = true)
    public BaseProduct getByBarcode(String barcode) {
        return baseProductRepository.findByBarcode(barcode)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with barcode: " + barcode));
    }

    @Transactional(readOnly = true)
    public List<BaseProduct> searchByName(String name) {
        return baseProductRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional(readOnly = true)
    public List<BaseProduct> getByPrototype(String prototypeId) {
        return baseProductRepository.findByPrototypeId(prototypeId);
    }

    // ─── WRITE ────────────────────────────────────────────────────────────────

    /**
     * Tạo product mới không kèm attribute.
     * Dùng khi nhập thủ công từng sản phẩm đơn giản.
     */
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
    @Transactional
    public BaseProduct createWithAttributes(BaseProduct product, Map<String, String> attributeMap) {
        if (baseProductRepository.existsByBarcode(product.getBarcode())) {
            throw new IllegalArgumentException("Barcode already exists: " + product.getBarcode());
        }
        BaseProduct saved = baseProductRepository.save(product);

        if (attributeMap != null && !attributeMap.isEmpty()) {
            attributeService.setAll(String.valueOf(saved.getProductId()), attributeMap);
        }
        return saved;
    }

    /**
     * Update thông tin cơ bản của product.
     * Không update barcode vì đó là định danh vật lý.
     */
    @Transactional
    public BaseProduct update(Long productId, BaseProduct updated) {
        BaseProduct existing = getById(productId);
        existing.setName(updated.getName());
        existing.setImage(updated.getImage());
        existing.setDescription(updated.getDescription());
        existing.setOriginalPrice(updated.getOriginalPrice());
        existing.setPrototypeId(updated.getPrototypeId());
        return baseProductRepository.save(existing);
    }

    /**
     * Xóa product và toàn bộ attribute liên quan.
     */
    @Transactional
    public void delete(Long productId) {
        if (!baseProductRepository.existsById(productId)) {
            throw new EntityNotFoundException("Product not found: " + productId);
        }
        attributeService.removeAllByProduct(String.valueOf(productId));
        baseProductRepository.deleteById(productId);
    }
}