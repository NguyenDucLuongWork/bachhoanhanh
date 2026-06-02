package com.bachhoanhanh.productservice.api;

import com.bachhoanhanh.productservice.api.dto.PrototypeRequest;
import com.bachhoanhanh.productservice.prototype.model.Prototype;
import com.bachhoanhanh.productservice.prototype.service.PrototypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prototypes")
@RequiredArgsConstructor
public class PrototypeController {

    private final PrototypeService prototypeService;

    @GetMapping
    public List<Prototype> getAll() {
        return prototypeService.getAll();
    }

    @GetMapping("/{id}")
    public Prototype getById(@PathVariable String id) {
        return prototypeService.getById(id);
    }

    @GetMapping("/by-catalog/{catalogId}")
    public List<Prototype> getByCatalog(@PathVariable String catalogId) {
        return prototypeService.getByCatalog(catalogId);
    }

    @PostMapping
    public Prototype create(@RequestBody PrototypeRequest request) {
        return prototypeService.create(
                request.getProductId(),
                request.getName(),
                request.getCatalogId(),
                request.getAttributeTypeNames()
        );
    }

    @PatchMapping("/{id}/info")
    public Prototype updateInfo(@PathVariable String id, @RequestBody PrototypeRequest request) {
        return prototypeService.updateInfo(id, request.getName(), request.getCatalogId());
    }

    @PatchMapping("/{id}/attributes")
    public Prototype updateAttributes(@PathVariable String id, @RequestBody PrototypeRequest request) {
        return prototypeService.updateAttributes(id, request.getAttributeTypeNames());
    }

    @PatchMapping("/{id}/attributes/add")
    public Prototype addAttribute(@PathVariable String id, @RequestParam String typeName) {
        return prototypeService.addAttributeType(id, typeName);
    }

    @PatchMapping("/{id}/attributes/remove")
    public Prototype removeAttribute(@PathVariable String id, @RequestParam String typeName) {
        return prototypeService.removeAttributeType(id, typeName);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        prototypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}