package com.bachhoanhanh.catalogservice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Catalog {

    @Id
    private String id;

    private String name;
    private String image;

    private String parentCatalogId;
}