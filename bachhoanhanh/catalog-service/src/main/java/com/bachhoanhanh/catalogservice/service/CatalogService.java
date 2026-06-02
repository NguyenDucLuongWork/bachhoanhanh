package com.bachhoanhanh.catalogservice.service;

import com.bachhoanhanh.catalogservice.client.ProductClient;
import com.bachhoanhanh.catalogservice.client.dto.ProductSummary;
import com.bachhoanhanh.catalogservice.dto.CatalogTreeDto;
import com.bachhoanhanh.catalogservice.model.Catalog;
import com.bachhoanhanh.catalogservice.repository.CatalogRepository;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@CacheConfig(cacheNames = "catalogs")
public class CatalogService {

    private final CatalogRepository repository;
    private final ProductClient productClient;

    public CatalogService(CatalogRepository repository, ProductClient productClient) {
        this.repository = repository;
        this.productClient = productClient;
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
                    .ifPresent(parent -> catalog.setParentCatalogId(parent.getId()));
        }
        return catalog;
    }

    // CREATE
    @CacheEvict(allEntries = true)
    public Catalog createCatalog(Catalog catalog) {
        catalog.setId(resolveId(catalog.getId(), catalog));
        sanitizeParent(catalog);
        return repository.save(catalog);
    }

    // UPDATE
    @CacheEvict(allEntries = true)
    public Catalog updateCatalog(String id, Catalog newCatalog) {
        return repository.findById(id).map(catalog -> {
            catalog.setName(newCatalog.getName());
            catalog.setImage(newCatalog.getImage());

            if (newCatalog.getParentCatalogId() != null
                    && !newCatalog.getParentCatalogId().equals(id)
                    && repository.existsById(newCatalog.getParentCatalogId())) {
                catalog.setParentCatalogId(newCatalog.getParentCatalogId());
            } else {
                catalog.setParentCatalogId(null);
            }

            return repository.save(catalog);
        }).orElse(null);
    }

    // DELETE
    @CacheEvict(allEntries = true)
    public void deleteCatalog(String id) {
        try {
            List<ProductSummary> products = productClient.getProductsByCatalog(id);
            if (products != null && !products.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cannot delete catalog '" + id + "': it still has " + products.size() + " product(s) assigned."
                );
            }
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Cannot verify products for catalog '" + id + "': product service unavailable."
            );
        }

        repository.deleteById(id);
    }

    // ----------------------------------------------------------------
    // ID RESOLUTION
    // ----------------------------------------------------------------

    private String resolveId(String inputId, Catalog catalog) {
        if (inputId != null && !inputId.isBlank() && !repository.existsById(inputId)) {
            return inputId;
        }
        return generateUniqueId(catalog);
    }

    private String generateUniqueId(Catalog catalog) {
        String base = buildBaseId(catalog);
        String candidate = base + "-" + shortRandom();
        while (repository.existsById(candidate)) {
            candidate = base + "-" + shortRandom();
        }
        return candidate;
    }

    private String buildBaseId(Catalog catalog) {
        String namePart = slugify(catalog.getName());
        if (catalog.getParentCatalogId() != null && !catalog.getParentCatalogId().isBlank()) {
            return catalog.getParentCatalogId() + "-" + namePart;
        }
        return namePart.isBlank() ? "catalog" : namePart;
    }

    private String slugify(String input) {
        if (input == null || input.isBlank()) return "unnamed";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String ascii = Pattern.compile("\\p{InCombiningDiacriticalMarks}+")
                .matcher(normalized).replaceAll("");
        return ascii.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }

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

    // TREE
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