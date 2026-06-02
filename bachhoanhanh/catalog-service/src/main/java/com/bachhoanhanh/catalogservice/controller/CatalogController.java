package com.bachhoanhanh.catalogservice.controller;

import com.bachhoanhanh.catalogservice.dto.CatalogTreeDto;
import com.bachhoanhanh.catalogservice.model.Catalog;
import com.bachhoanhanh.catalogservice.service.CatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalogs")
public class CatalogController {

    private final CatalogService service;

    public CatalogController(CatalogService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> getAllCatalogs(@RequestParam(defaultValue = "false") boolean tree) {
        if (tree) return ResponseEntity.ok(service.getAsTree());
        return ResponseEntity.ok(service.getAllCatalogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Catalog> getCatalogById(@PathVariable String id) {
        Catalog catalog = service.getCatalogById(id);
        return catalog != null ? ResponseEntity.ok(catalog) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Catalog> createCatalog(@RequestBody Catalog catalog) {
        return ResponseEntity.ok(service.createCatalog(catalog));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Catalog> updateCatalog(@PathVariable String id, @RequestBody Catalog newCatalog) {
        Catalog updated = service.updateCatalog(id, newCatalog);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCatalog(@PathVariable String id) {
        service.deleteCatalog(id); // throws ResponseStatusException on conflict or unavailable
        return ResponseEntity.noContent().build();
    }
}