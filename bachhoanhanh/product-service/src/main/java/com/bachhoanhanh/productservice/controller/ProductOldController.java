package com.bachhoanhanh.productservice.controller;

import com.bachhoanhanh.productservice.model.Product;
import com.bachhoanhanh.productservice.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products-old")
public class ProductOldController {

    private final ProductService service;

    public ProductOldController(ProductService service) {
        this.service = service;
    }

    // GET ALL
    @GetMapping
    public List<Product> getAllProducts() {
        return service.getAllProducts();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return service.getProductById(id);
    }

    // CREATE
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return service.createProduct(product);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {

        return service.updateProduct(id, product);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
    }
}