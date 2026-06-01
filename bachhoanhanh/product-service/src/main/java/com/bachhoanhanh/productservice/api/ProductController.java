// api/ProductController.java
package com.bachhoanhanh.productservice.api;

import com.bachhoanhanh.productservice.api.dto.ProductRequest;
import com.bachhoanhanh.productservice.api.dto.ProductResponse;
import com.bachhoanhanh.productservice.attribute.service.AttributeService;
import com.bachhoanhanh.productservice.client.BrandClient;
import com.bachhoanhanh.productservice.client.dto.BrandResponse;
import com.bachhoanhanh.productservice.product.model.BaseProduct;
import com.bachhoanhanh.productservice.product.service.BaseProductService;
import com.bachhoanhanh.productservice.product.service.ProductImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final BaseProductService baseProductService;
    private final AttributeService attributeService;
    private final ProductImageStorageService productImageStorageService;
    private final BrandClient brandClient;

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
        return createProduct(request, null);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductResponse createWithImage(
            @RequestPart("product") ProductRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        return createProduct(request, imageFile);
    }

    private ProductResponse createProduct(ProductRequest request, MultipartFile imageFile) {
        String imageUrl = productImageStorageService.upload(imageFile);
        if (imageUrl != null) {
            request.setImage(imageUrl);
        }

        BaseProduct product = toEntity(request);
        if (request.getAttributes() != null && !request.getAttributes().isEmpty()) {
            BaseProduct saved = baseProductService.createWithAttributes(product, request.getAttributes());
            return toResponseWithAttributes(saved);
        }

        return toResponse(baseProductService.create(product));
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @RequestBody ProductRequest request) {
        return updateProduct(id, request, null);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductResponse updateWithImage(
            @PathVariable Long id,
            @RequestPart("product") ProductRequest request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        return updateProduct(id, request, imageFile);
    }

    private ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile imageFile) {
        String imageUrl = productImageStorageService.upload(imageFile);
        if (imageUrl != null) {
            request.setImage(imageUrl);
        }

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

    /** Không load attributes, không load brand — dùng cho list (tránh N+1) */
    private ProductResponse toResponse(BaseProduct p) {
        return ProductResponse.builder()
                .productId(p.getProductId())
                .barcode(p.getBarcode())
                .name(p.getName())
                .image(p.getImage())
                .description(p.getDescription())
                .catalogId(p.getCatalogId())
                .originalPrice(p.getOriginalPrice())
                .prototypeId(p.getPrototypeId())
                .build();
    }

    /** Load attributes + brand — dùng cho detail (GET by id / barcode) */
    private ProductResponse toResponseWithAttributes(BaseProduct p) {
        Map<String, String> attrs = attributeService.getProductAttributeMap(p.getProductId());

        ProductResponse.ProductResponseBuilder builder = ProductResponse.builder()
                .productId(p.getProductId())
                .barcode(p.getBarcode())
                .name(p.getName())
                .image(p.getImage())
                .description(p.getDescription())
                .catalogId(p.getCatalogId())
                .originalPrice(p.getOriginalPrice())
                .prototypeId(p.getPrototypeId())
                .attributes(attrs);

        // Nếu attribute BRAND tồn tại → gọi sang BrandService để lấy chi tiết
        String brandName = attrs.get("BRAND");

        if (brandName != null) {

            BrandResponse brand = brandClient.findByName(brandName);

            if (brand != null) {
                builder.brandId(brand.getId())
                        .brandName(brand.getName())
                        .brandImage(brand.getImage())
                        .brandDescription(brand.getDescription())
                        .brandPhone(brand.getPhoneNumber())
                        .brandEmail(brand.getEmail());
            }
        }

        return builder.build();
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
