package com.bachhoanhanh.productservice.api;

import com.bachhoanhanh.productservice.api.dto.ProductDetailResponse;
import com.bachhoanhanh.productservice.api.dto.ProductRequest;
import com.bachhoanhanh.productservice.api.dto.ProductResponse;
import com.bachhoanhanh.productservice.attribute.service.AttributeService;
import com.bachhoanhanh.productservice.client.BrandClient;
import com.bachhoanhanh.productservice.client.StockClient;
import com.bachhoanhanh.productservice.client.dto.BrandResponse;
import com.bachhoanhanh.productservice.client.dto.StockDetail;
import com.bachhoanhanh.productservice.product.model.BaseProduct;
import com.bachhoanhanh.productservice.product.service.BaseProductService;
import com.bachhoanhanh.productservice.product.service.ProductImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final BaseProductService baseProductService;
    private final AttributeService attributeService;
    private final ProductImageStorageService productImageStorageService;
    private final BrandClient brandClient;
    private final StockClient stockClient;

    // ─── GET ──────────────────────────────────────────────────────────────────

    @GetMapping
    public List<ProductResponse> getAll() {
        Map<String, Integer> stockMap = fetchAllStocksAsMap();
        return baseProductService.getAll().stream()
                .map(p -> toResponse(p, stockMap.getOrDefault(p.getBarcode(), 0)))
                .toList();
    }

    @GetMapping("/{id}")
    public ProductDetailResponse getById(@PathVariable Long id) {
        return toDetailResponse(baseProductService.getById(id));
    }

    @GetMapping("/barcode/{barcode}")
    public ProductDetailResponse getByBarcode(@PathVariable String barcode) {
        return toDetailResponse(baseProductService.getByBarcode(barcode));
    }

    @GetMapping("/search")
    public List<ProductResponse> search(@RequestParam String name) {
        Map<String, Integer> stockMap = fetchAllStocksAsMap();
        return baseProductService.searchByName(name).stream()
                .map(p -> toResponse(p, stockMap.getOrDefault(p.getBarcode(), 0)))
                .toList();
    }

    @GetMapping("/by-prototype/{prototypeId}")
    public List<ProductResponse> getByPrototype(@PathVariable String prototypeId) {
        Map<String, Integer> stockMap = fetchAllStocksAsMap();
        return baseProductService.getByPrototype(prototypeId).stream()
                .map(p -> toResponse(p, stockMap.getOrDefault(p.getBarcode(), 0)))
                .toList();
    }

    @GetMapping("/by-catalog/{catalogId}")
    public List<ProductResponse> getByCatalog(@PathVariable String catalogId) {
        Map<String, Integer> stockMap = fetchAllStocksAsMap();
        return baseProductService.getByCatalog(catalogId).stream()
                .map(p -> toResponse(p, stockMap.getOrDefault(p.getBarcode(), 0)))
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
        if (imageUrl != null) request.setImage(imageUrl);

        BaseProduct product = toEntity(request);
        BaseProduct saved;
        if (request.getAttributes() != null && !request.getAttributes().isEmpty()) {
            saved = baseProductService.createWithAttributes(product, request.getAttributes());
        } else {
            saved = baseProductService.create(product);
        }
        // Newly created product won't have stock yet — 0 is correct
        return toResponse(saved, 0);
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
        if (imageUrl != null) request.setImage(imageUrl);

        BaseProduct updated = baseProductService.update(id, toEntity(request));
        if (request.getAttributes() != null && !request.getAttributes().isEmpty()) {
            attributeService.setAll(id, request.getAttributes());
        }
        // Fetch accurate stock for this single product after update
        int total = fetchAvailableStocks(updated.getBarcode()).stream()
                .mapToInt(StockDetail::getAmount).sum();
        return toResponse(updated, total);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        baseProductService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ─── MAPPERS ──────────────────────────────────────────────────────────────

    private ProductResponse toResponse(BaseProduct p, int totalAvailableAmount) {
        return ProductResponse.builder()
                .productId(p.getProductId())
                .barcode(p.getBarcode())
                .name(p.getName())
                .image(p.getImage())
                .description(p.getDescription())
                .catalogId(p.getCatalogId())
                .originalPrice(p.getOriginalPrice())
                .prototypeId(p.getPrototypeId())
                .totalAvailableAmount(totalAvailableAmount)
                .build();
    }

    private ProductDetailResponse toDetailResponse(BaseProduct p) {
        Map<String, String> attrs = attributeService.getProductAttributeMap(p.getProductId());
        List<StockDetail> stocks = fetchAvailableStocks(p.getBarcode());
        int total = stocks.stream().mapToInt(StockDetail::getAmount).sum();

        ProductDetailResponse.ProductDetailResponseBuilder builder = ProductDetailResponse.builder()
                .productId(p.getProductId())
                .barcode(p.getBarcode())
                .name(p.getName())
                .image(p.getImage())
                .description(p.getDescription())
                .catalogId(p.getCatalogId())
                .originalPrice(p.getOriginalPrice())
                .prototypeId(p.getPrototypeId())
                .attributes(attrs)
                .availableStocks(stocks)
                .totalAvailableAmount(total);

        String brandName = attrs.get("BRAND");
        if (brandName != null) {
            try {
                BrandResponse brand = brandClient.findByName(brandName);
                if (brand != null) {
                    builder.brandId(brand.getId())
                            .brandName(brand.getName())
                            .brandImage(brand.getImage())
                            .brandDescription(brand.getDescription())
                            .brandPhone(brand.getPhoneNumber())
                            .brandEmail(brand.getEmail());
                }
            } catch (Exception e) {
                log.warn("Could not fetch brand '{}': {}", brandName, e.getMessage());
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
        p.setCatalogId(r.getCatalogId());
        p.setOriginalPrice(r.getOriginalPrice());
        p.setPrototypeId(r.getPrototypeId());
        return p;
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    /**
     * One bulk fetch of all stocks, filtered to available=true, grouped by productId.
     * Used by all list endpoints to avoid N individual Feign calls.
     */
    private Map<String, Integer> fetchAllStocksAsMap() {
        try {
            List<StockDetail> all = stockClient.getAllStocks();
            if (all == null) return Collections.emptyMap();
            return all.stream()
                    .filter(s -> Boolean.TRUE.equals(s.getAvailable()))
                    .collect(Collectors.groupingBy(
                            StockDetail::getProductId,
                            Collectors.summingInt(StockDetail::getAmount)
                    ));
        } catch (Exception e) {
            log.warn("Could not fetch all stocks, defaulting to 0: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    /** Fetches available stock batches for a single product; used by detail endpoints. */
    private List<StockDetail> fetchAvailableStocks(String barcode) {
        try {
            List<StockDetail> result = stockClient.getAvailableStocks(barcode);
            return result != null ? result : Collections.emptyList();
        } catch (Exception e) {
            log.warn("Could not fetch stocks for product '{}': {}", barcode, e.getMessage());
            return Collections.emptyList();
        }
    }
}