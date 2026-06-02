package com.bachhoanhanh.productservice.api;

import com.bachhoanhanh.productservice.api.dto.AttributeTypeRequest;
import com.bachhoanhanh.productservice.attribute.model.AttributeType;
import com.bachhoanhanh.productservice.attribute.service.AttributeTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attribute-types")
@RequiredArgsConstructor
public class AttributeTypeController {

    private final AttributeTypeService attributeTypeService;

    @GetMapping
    public List<AttributeType> getAll() {
        return attributeTypeService.getAll();
    }

    @GetMapping("/{name}")
    public AttributeType getByName(@PathVariable String name) {
        return attributeTypeService.getByName(name);
    }

    @PostMapping
    public AttributeType create(@RequestBody AttributeTypeRequest request) {
        return attributeTypeService.create(request.getName(), request.getDataType());
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<Void> delete(@PathVariable String name) {
        attributeTypeService.delete(name);
        return ResponseEntity.noContent().build();
    }
}