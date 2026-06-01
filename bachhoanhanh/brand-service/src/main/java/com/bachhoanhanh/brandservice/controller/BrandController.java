package com.bachhoanhanh.brandservice.controller;

import com.bachhoanhanh.brandservice.model.Brand;
import com.bachhoanhanh.brandservice.service.BrandService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
public class BrandController {

    private final BrandService service;

    public BrandController(BrandService service) {
        this.service = service;
    }

    // GET ALL
    @GetMapping
    public List<Brand> getAllBrands() {
        return service.getAllBrands();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Brand getBrandById(@PathVariable Long id) {
        return service.getBrandById(id);
    }

    // CREATE
    @PostMapping
    public Brand createBrand(@RequestBody Brand brand) {
        return service.createBrand(brand);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Brand updateBrand(
            @PathVariable Long id,
            @RequestBody Brand brand) {

        return service.updateBrand(id, brand);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteBrand(@PathVariable Long id) {
        service.deleteBrand(id);
    }

    @GetMapping(params = "name")
    public Brand getByName(@RequestParam String name) {
        return service.getByName(name);
    }
}