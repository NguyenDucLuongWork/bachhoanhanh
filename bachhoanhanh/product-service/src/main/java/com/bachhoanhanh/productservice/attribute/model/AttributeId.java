package com.bachhoanhanh.productservice.attribute.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttributeId implements Serializable {
    private String productId; //Base Product Id
    private String type; //AttibuteType name
}
