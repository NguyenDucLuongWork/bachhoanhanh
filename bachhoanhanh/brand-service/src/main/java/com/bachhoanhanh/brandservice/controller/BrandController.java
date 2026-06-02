package com.bachhoanhanh.brandservice.controller;

import com.bachhoanhanh.brandservice.model.Brand;
import com.bachhoanhanh.brandservice.service.BrandService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public Brand createBrand(@RequestBody Brand brand) {
        return service.createBrand(brand);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Brand createBrandWithImage(
            @RequestPart("brand") Brand brand,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        return service.createBrand(brand, imageFile);
    }

    // UPDATE
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Brand updateBrand(
            @PathVariable Long id,
            @RequestBody Brand brand) {

        return service.updateBrand(id, brand);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Brand updateBrandWithImage(
            @PathVariable Long id,
            @RequestPart("brand") Brand brand,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        return service.updateBrand(id, brand, imageFile);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteBrand(@PathVariable Long id) {
        service.deleteBrand(id);
    }

    // Giữ nguyên endpoint cũ - tìm chính xác
    @GetMapping(params = "name")
    public Brand getByName(@RequestParam String name) {
        return service.getByName(name);
    }

    // Thêm endpoint mới - tìm kiếm gần đúng
    @GetMapping(params = "search")
    public List<Brand> searchByName(@RequestParam String search) {
        return service.searchByName(search);
    }
}
