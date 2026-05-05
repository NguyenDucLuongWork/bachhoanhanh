package com.bachhoanhanh.catalogservice.service;

import com.bachhoanhanh.catalogservice.dto.CatalogTreeDto;
import com.bachhoanhanh.catalogservice.model.Catalog;
import com.bachhoanhanh.catalogservice.repository.CatalogRepository;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@CacheConfig(cacheNames = "catalogs")
public class CatalogService {

    private final CatalogRepository repository;

    public CatalogService(CatalogRepository repository) {
        this.repository = repository;
    }

    // GET ALL
    @Cacheable(key = "'all'")
    public List<Catalog> getAllCatalogs() {
        return repository.findAll();
    }

    // GET BY ID
    @Cacheable(key = "#id")
    public Catalog getCatalogById(String id) {
        Catalog catalog = repository.findById(id).orElse(null);

        if (catalog != null && catalog.getParentCatalogId() != null) {
            repository.findById(catalog.getParentCatalogId())
                    .ifPresent(parent -> {
                        // attach parent as a shallow object
                        catalog.setParentCatalogId(parent.getId()); // keep id
                    });
        }

        return catalog;
    }

    // CREATE
    @CacheEvict(allEntries = true)  // clears all catalog cache entries on create
    public Catalog createCatalog(Catalog catalog) {
        String resolvedId = resolveId(catalog.getId(), catalog);
        catalog.setId(resolvedId);

        sanitizeParent(catalog);

        return repository.save(catalog);
    }

    // UPDATE
    @CacheEvict(allEntries = true)  // clears all on update
    public Catalog updateCatalog(String id, Catalog newCatalog) {
        return repository.findById(id).map(catalog -> {
            catalog.setName(newCatalog.getName());
            catalog.setImage(newCatalog.getImage());

            if (newCatalog.getParentCatalogId() != null
                    && !newCatalog.getParentCatalogId().equals(id)) {

                if (repository.existsById(newCatalog.getParentCatalogId())) {
                    catalog.setParentCatalogId(newCatalog.getParentCatalogId());
                }
            } else {
                catalog.setParentCatalogId(null);
            }

            return repository.save(catalog);
        }).orElse(null);
    }

    // DELETE
    @CacheEvict(allEntries = true)  // clears all on delete
    public void deleteCatalog(String id) {
        repository.deleteById(id);
    }

    // ----------------------------------------------------------------
    // ID RESOLUTION LOGIC
    // ----------------------------------------------------------------

    /**
     * Nếu người dùng truyền id vào và không trùng → dùng luôn.
     * Nếu trống → tự sinh: parentId + slug(name) + random suffix.
     * Nếu trùng → tái sinh với random mới cho đến khi unique.
     */
    private String resolveId(String inputId, Catalog catalog) {
        if (inputId != null && !inputId.isBlank()) {
            // Người dùng nhập vào — kiểm tra trùng
            if (!repository.existsById(inputId)) {
                return inputId;
            }
            // Trùng → fallthrough để sinh lại có suffix random
        }

        // Sinh id tự động
        return generateUniqueId(catalog);
    }

    private String generateUniqueId(Catalog catalog) {
        String base = buildBaseId(catalog);
        String candidate = base + "-" + shortRandom();

        // Thử lại cho đến khi unique (thực tế rất hiếm cần vòng 2+)
        while (repository.existsById(candidate)) {
            candidate = base + "-" + shortRandom();
        }

        return candidate;
    }

    /**
     * Cấu trúc: [parentId-]slug(name)
     * Ví dụ: "electronics-dien-thoai"
     *        "dien-thoai" (nếu không có parent)
     */
    private String buildBaseId(Catalog catalog) {
        String namePart = slugify(catalog.getName());

        if (catalog.getParentCatalogId() != null
                && !catalog.getParentCatalogId().isBlank()) {
            return catalog.getParentCatalogId() + "-" + namePart;
        }

        return namePart.isBlank() ? "catalog" : namePart;
    }

    /**
     * Chuyển tên thành slug an toàn cho id:
     *   "Điện Thoại" → "dien-thoai"
     *   "Hello World!" → "hello-world"
     */
    private String slugify(String input) {
        if (input == null || input.isBlank()) return "unnamed";

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String ascii = Pattern.compile("\\p{InCombiningDiacriticalMarks}+")
                .matcher(normalized)
                .replaceAll("");
        return ascii.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")   // ký tự đặc biệt → dấu -
                .replaceAll("^-|-$", "");          // bỏ dấu - đầu/cuối
    }

    /** 6 ký tự hex ngẫu nhiên, đủ ngắn và dễ đọc */
    private String shortRandom() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 6);
    }

    // ----------------------------------------------------------------
    // SANITIZE
    // ----------------------------------------------------------------

    private void sanitizeParent(Catalog catalog) {
        if (catalog.getParentCatalogId() != null
                && catalog.getId() != null
                && catalog.getParentCatalogId().equals(catalog.getId())) {
            catalog.setParentCatalogId(null);
        }
    }

    @Cacheable(key = "'tree'")
    public List<CatalogTreeDto> getAsTree() {
        List<Catalog> all = repository.findAll();

        Map<String, List<Catalog>> byParent = all.stream()
                .filter(c -> c.getParentCatalogId() != null)
                .collect(Collectors.groupingBy(Catalog::getParentCatalogId));

        return all.stream()
                .filter(c -> c.getParentCatalogId() == null)
                .map(root -> buildTree(root, byParent))
                .collect(Collectors.toList());
    }

    private CatalogTreeDto buildTree(Catalog node, Map<String, List<Catalog>> byParent) {
        List<CatalogTreeDto> children = byParent
                .getOrDefault(node.getId(), List.of())
                .stream()
                .map(child -> buildTree(child, byParent))
                .collect(Collectors.toList());

        return CatalogTreeDto.from(node, children);
    }
}