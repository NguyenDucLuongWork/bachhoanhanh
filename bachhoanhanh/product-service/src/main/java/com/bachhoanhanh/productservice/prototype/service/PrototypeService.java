package com.bachhoanhanh.productservice.prototype.service;

import com.bachhoanhanh.productservice.attribute.service.AttributeTypeService;
import com.bachhoanhanh.productservice.prototype.model.Prototype;
import com.bachhoanhanh.productservice.prototype.repository.PrototypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrototypeService {

    private final PrototypeRepository prototypeRepository;
    private final AttributeTypeService attributeTypeService;

    // ─── READ ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Prototype> getAll() {
        return prototypeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Prototype getById(String productId) {
        return prototypeRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Prototype not found: " + productId));
    }

    @Transactional(readOnly = true)
    public List<Prototype> getByCatalog(String catalogId) {
        return prototypeRepository.findByCatalogId(catalogId);
    }

    /**
     * Trả về danh sách tên AttributeType của prototype (đã unpack).
     * Dùng khi Factory cần biết prototype này yêu cầu những attribute nào.
     */
    @Transactional(readOnly = true)
    public String[] getRequiredAttributeTypes(String productId) {
        return getById(productId).getUnpackedAttributes();
    }

    // ─── WRITE ────────────────────────────────────────────────────────────────

    /**
     * Tạo prototype mới.
     * Validate tất cả attributeTypeNames phải tồn tại trước khi lưu.
     */
    @Transactional
    public Prototype create(String productId, String name, String catalogId, String[] attributeTypeNames) {
        if (prototypeRepository.existsByProductId(productId)) {
            throw new IllegalArgumentException("Prototype already exists: " + productId);
        }

        validateAttributeTypes(attributeTypeNames);

        Prototype prototype = new Prototype();
        prototype.setProductId(productId);
        prototype.setName(name);
        prototype.setCatalogId(catalogId);
        prototype.packAttributes(attributeTypeNames);

        return prototypeRepository.save(prototype);
    }

    /**
     * Cập nhật danh sách attribute types của prototype.
     * Thường dùng khi Manager muốn thêm/bớt trường cho một loại sản phẩm.
     *
     * Lưu ý: chỉ ảnh hưởng đến product tạo mới sau này,
     * các BaseProduct đã tạo từ prototype này không tự động thay đổi.
     */
    @Transactional
    public Prototype updateAttributes(String productId, String[] attributeTypeNames) {
        Prototype prototype = getById(productId);

        validateAttributeTypes(attributeTypeNames);
        prototype.packAttributes(attributeTypeNames);

        return prototypeRepository.save(prototype);
    }

    /**
     * Đổi tên hiển thị hoặc catalogId của prototype.
     */
    @Transactional
    public Prototype updateInfo(String productId, String name, String catalogId) {
        Prototype prototype = getById(productId);

        if (name != null && !name.isBlank()) prototype.setName(name);
        if (catalogId != null && !catalogId.isBlank()) prototype.setCatalogId(catalogId);

        return prototypeRepository.save(prototype);
    }

    /**
     * Thêm 1 attribute type vào prototype — không cần truyền lại toàn bộ list.
     */
    @Transactional
    public Prototype addAttributeType(String productId, String typeName) {
        if (!attributeTypeService.exists(typeName)) {
            throw new EntityNotFoundException("AttributeType not found: " + typeName);
        }

        Prototype prototype = getById(productId);
        String[] current = prototype.getUnpackedAttributes();

        boolean alreadyExists = Arrays.asList(current).contains(typeName);
        if (alreadyExists) return prototype; // idempotent — không throw error

        String[] updated = Arrays.copyOf(current, current.length + 1);
        updated[current.length] = typeName;
        prototype.packAttributes(updated);

        return prototypeRepository.save(prototype);
    }

    /**
     * Gỡ 1 attribute type khỏi prototype.
     */
    @Transactional
    public Prototype removeAttributeType(String productId, String typeName) {
        Prototype prototype = getById(productId);
        String[] updated = Arrays.stream(prototype.getUnpackedAttributes())
                .filter(t -> !t.equals(typeName))
                .toArray(String[]::new);

        prototype.packAttributes(updated);
        return prototypeRepository.save(prototype);
    }

    @Transactional
    public void delete(String productId) {
        if (!prototypeRepository.existsByProductId(productId)) {
            throw new EntityNotFoundException("Prototype not found: " + productId);
        }
        prototypeRepository.deleteById(productId);
    }

    // ─── PRIVATE ──────────────────────────────────────────────────────────────

    /**
     * Validate tất cả type name đều tồn tại trong AttributeType table.
     * Ném lỗi với danh sách đầy đủ các type không hợp lệ thay vì fail tại type đầu tiên.
     */
    private void validateAttributeTypes(String[] typeNames) {
        if (typeNames == null || typeNames.length == 0) return;

        List<String> invalid = Arrays.stream(typeNames)
                .filter(name -> !attributeTypeService.exists(name))
                .toList();

        if (!invalid.isEmpty()) {
            throw new EntityNotFoundException("AttributeType(s) not found: " + String.join(", ", invalid));
        }
    }
}