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
        if (tree) {
            return ResponseEntity.ok(service.getAsTree());
        }
        return ResponseEntity.ok(service.getAllCatalogs());
    }

    @GetMapping("/{id}")
    public Catalog getCatalogById(@PathVariable String id) {
        return service.getCatalogById(id);
    }

    @PostMapping
    public Catalog createCatalog(@RequestBody Catalog catalog) {
        return service.createCatalog(catalog);
    }

    @PutMapping("/{id}")
    public Catalog updateCatalog(@PathVariable String id, @RequestBody Catalog newCatalog) {
        return service.updateCatalog(id, newCatalog);
    }

    @DeleteMapping("/{id}")
    public void deleteCatalog(@PathVariable String id) {
        service.deleteCatalog(id);
    }
}