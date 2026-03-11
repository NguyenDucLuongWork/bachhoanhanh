package com.bachhoanhanh.productservice.service;

import com.bachhoanhanh.productservice.model.Product;
import com.bachhoanhanh.productservice.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    // GET ALL
    public List<Product> getAllProducts() {
        return repository.findAll();
    }

    // GET BY ID
    public Product getProductById(Long id) {
        Optional<Product> product = repository.findById(id);
        return product.orElse(null);
    }

    // CREATE
    public Product createProduct(Product product) {
        return repository.save(product);
    }

    // UPDATE
    public Product updateProduct(Long id, Product newProduct) {
        return repository.findById(id).map(product -> {
            product.setName(newProduct.getName());
            product.setPrice(newProduct.getPrice());
            return repository.save(product);
        }).orElse(null);
    }

    // DELETE
    public void deleteProduct(Long id) {
        repository.deleteById(id);
    }
}