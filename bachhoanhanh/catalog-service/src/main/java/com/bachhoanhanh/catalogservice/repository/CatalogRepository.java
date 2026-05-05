package com.bachhoanhanh.catalogservice.repository;

import com.bachhoanhanh.catalogservice.model.Catalog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogRepository extends JpaRepository<Catalog, String> {
    boolean existsById(String id);
}