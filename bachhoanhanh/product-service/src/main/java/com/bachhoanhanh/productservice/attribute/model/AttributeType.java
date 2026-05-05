package com.bachhoanhanh.productservice.attribute.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttributeType {
    @Id
    private String name;
    @Enumerated(EnumType.STRING)
    private AttributeDataType dataType;
}
