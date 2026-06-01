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

        if (repository.findByNameIgnoreCase(brand.getName()).isPresent()) {
            throw new IllegalArgumentException(
                    "Brand name already exists"
            );
        }

        return repository.save(brand);
    }

    // UPDATE
    public Brand updateBrand(Long id, Brand newBrand) {

        Brand brand = repository.findById(id)
                .orElse(null);

        if (brand == null) {
            return null;
        }

        Brand existing = repository
                .findByNameIgnoreCase(newBrand.getName())
                .orElse(null);

        if (existing != null && !existing.getId().equals(id)) {
            throw new IllegalArgumentException(
                    "Brand name already exists"
            );
        }

        brand.setName(newBrand.getName());
        brand.setImage(newBrand.getImage());
        brand.setDescription(newBrand.getDescription());
        brand.setPhoneNumber(newBrand.getPhoneNumber());
        brand.setEmail(newBrand.getEmail());

        return repository.save(brand);
    }

    // DELETE
    public void deleteBrand(Long id) {
        repository.deleteById(id);
    }

    public Brand getByName(String name) {
        return repository.findByNameIgnoreCase(name)
                .orElse(null);
    }
}