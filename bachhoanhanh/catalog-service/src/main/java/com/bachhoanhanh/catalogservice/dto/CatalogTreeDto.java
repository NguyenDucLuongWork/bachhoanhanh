package com.bachhoanhanh.catalogservice.dto;

import com.bachhoanhanh.catalogservice.model.Catalog;
import lombok.Data;

import java.util.List;

@Data
public class CatalogTreeDto {
    private String id;
    private String name;
    private String image;
    private List<CatalogTreeDto> children;

    public static CatalogTreeDto from(Catalog catalog, List<CatalogTreeDto> children) {
        CatalogTreeDto dto = new CatalogTreeDto();
        dto.setId(catalog.getId());
        dto.setName(catalog.getName());
        dto.setImage(catalog.getImage());
        dto.setChildren(children);
        return dto;
    }
}