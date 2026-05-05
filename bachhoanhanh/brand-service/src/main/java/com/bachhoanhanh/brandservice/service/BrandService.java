package com.bachhoanhanh.brandservice.service;

import com.bachhoanhanh.brandservice.model.Brand;
import com.bachhoanhanh.brandservice.repository.BrandRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BrandService {

    private final BrandRepository repository;

    public BrandService(BrandRepository repository) {
        this.repository = repository;
    }

    // GET ALL
    public List<Brand> getAllBrands() {
        return repository.findAll();
    }

    // GET BY ID
    public Brand getBrandById(Long id) {
        Optional<Brand> brand = repository.findById(id);
        return brand.orElse(null);
    }

    // CREATE
    public Brand createBrand(Brand brand) {
        return repository.save(brand);
    }

    // UPDATE
    public Brand updateBrand(Long id, Brand newBrand) {
        return repository.findById(id).map(brand -> {
            brand.setName(newBrand.getName());
            brand.setImage(newBrand.getImage());
            brand.setDescription(newBrand.getDescription());
            brand.setPhoneNumber(newBrand.getPhoneNumber());
            brand.setEmail(newBrand.getEmail());
            return repository.save(brand);
        }).orElse(null);
    }

    // DELETE
    public void deleteBrand(Long id) {
        repository.deleteById(id);
    }
}