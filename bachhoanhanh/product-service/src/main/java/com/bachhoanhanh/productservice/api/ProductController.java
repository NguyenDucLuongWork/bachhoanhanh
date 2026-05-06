// api/ProductController.java
package com.bachhoanhanh.productservice.api;

import com.bachhoanhanh.productservice.api.dto.ProductRequest;
import com.bachhoanhanh.productservice.api.dto.ProductResponse;
import com.bachhoanhanh.productservice.attribute.service.AttributeService;
import com.bachhoanhanh.productservice.product.model.BaseProduct;
import com.bachhoanhanh.productservice.product.service.BaseProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final BaseProductService baseProductService;
    private final AttributeService attributeService;

    // ─── GET ──────────────────────────────────────────────────────────────────

    @GetMapping
    public List<ProductResponse> getAll() {
        return baseProductService.getAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id) {
        return toResponseWithAttributes(baseProductService.getById(id));
    }

    @GetMapping("/barcode/{barcode}")
    public ProductResponse getByBarcode(@PathVariable String barcode) {
        return toResponseWithAttributes(baseProductService.getByBarcode(barcode));
    }

    @GetMapping("/search")
    public List<ProductResponse> search(@RequestParam String name) {
        return baseProductService.searchByName(name).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/by-prototype/{prototypeId}")
    public List<ProductResponse> getByPrototype(@PathVariable String prototypeId) {
        return baseProductService.getByPrototype(prototypeId).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/by-catalog/{catalogId}")
    public List<ProductResponse> getByCatalog(@PathVariable String catalogId) {
        return baseProductService.getByCatalog(catalogId).stream()
                .map(this::toResponse)
                .toList();
    }


    // ─── POST / PUT / DELETE ──────────────────────────────────────────────────

    @PostMapping
    public ProductResponse create(@RequestBody ProductRequest request) {
        BaseProduct product = toEntity(request);

        if (request.getAttributes() != null && !request.getAttributes().isEmpty()) {
            BaseProduct saved = baseProductService.createWithAttributes(product, request.getAttributes());
            return toResponseWithAttributes(saved);
        }

        return toResponse(baseProductService.create(product));
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @RequestBody ProductRequest request) {
        BaseProduct updated = baseProductService.update(id, toEntity(request));

        if (request.getAttributes() != null && !request.getAttributes().isEmpty()) {
            attributeService.setAll(id, request.getAttributes());
        }

        return toResponseWithAttributes(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        baseProductService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ─── MAPPER ───────────────────────────────────────────────────────────────

    /** Không load attributes — dùng cho list response để tránh N+1 */
    private ProductResponse toResponse(BaseProduct p) {
        return ProductResponse.builder()
                .productId(p.getProductId())
                .barcode(p.getBarcode())
                .name(p.getName())
                .image(p.getImage())
                .description(p.getDescription())
                .catalogId(p.getCatalogId())       // ← thêm
                .originalPrice(p.getOriginalPrice())
                .prototypeId(p.getPrototypeId())
                .build();
    }

    /** Load attributes — dùng cho detail (GET by id, barcode) */
    private ProductResponse toResponseWithAttributes(BaseProduct p) {
        Map<String, String> attrs = attributeService.getProductAttributeMap(
                p.getProductId()
        );
        return ProductResponse.builder()
                .productId(p.getProductId())
                .barcode(p.getBarcode())
                .name(p.getName())
                .image(p.getImage())
                .description(p.getDescription())
                .catalogId(p.getCatalogId())       // ← thêm
                .originalPrice(p.getOriginalPrice())
                .prototypeId(p.getPrototypeId())
                .attributes(attrs)
                .build();
    }

    private BaseProduct toEntity(ProductRequest r) {
        BaseProduct p = new BaseProduct();
        p.setBarcode(r.getBarcode());
        p.setName(r.getName());
        p.setImage(r.getImage());
        p.setDescription(r.getDescription());
        p.setCatalogId(r.getCatalogId());          // ← thêm
        p.setOriginalPrice(r.getOriginalPrice());
        p.setPrototypeId(r.getPrototypeId());
        return p;
    }
}