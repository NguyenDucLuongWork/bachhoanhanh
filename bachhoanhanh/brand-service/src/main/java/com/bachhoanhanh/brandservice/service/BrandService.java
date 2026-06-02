package com.bachhoanhanh.brandservice.service;

import com.bachhoanhanh.brandservice.model.Brand;
import com.bachhoanhanh.brandservice.repository.BrandRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class BrandService {

    private final BrandRepository repository;
    private final BrandImageStorageService imageStorageService;

    public BrandService(BrandRepository repository, BrandImageStorageService imageStorageService) {
        this.repository = repository;
        this.imageStorageService = imageStorageService;
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

    public Brand createBrand(Brand brand, MultipartFile imageFile) {
        String imageUrl = imageStorageService.upload(imageFile);
        if (imageUrl != null) {
            brand.setImage(imageUrl);
        }
        return createBrand(brand);
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

    public Brand updateBrand(Long id, Brand newBrand, MultipartFile imageFile) {
        Brand currentBrand = repository.findById(id).orElse(null);
        String oldImage = currentBrand != null ? currentBrand.getImage() : null;
        String imageUrl = imageStorageService.upload(imageFile);
        if (imageUrl != null) {
            newBrand.setImage(imageUrl);
        }

        Brand updated = updateBrand(id, newBrand);
        if (updated != null && imageUrl != null) {
            imageStorageService.deleteIfManaged(oldImage);
        }
        return updated;
    }

    // DELETE
    public void deleteBrand(Long id) {
        repository.deleteById(id);
    }

    public Brand getByName(String name) {
        return repository.findByNameIgnoreCase(name)
                .orElse(null);
    }


    // BrandService.java
    public List<Brand> searchByName(String keyword) {
        return repository.findByNameContainingIgnoreCase(keyword);
    }
}
