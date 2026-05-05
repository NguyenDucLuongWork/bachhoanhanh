package com.bachhoanhanh.brandservice.repository;

import com.bachhoanhanh.brandservice.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {
}
