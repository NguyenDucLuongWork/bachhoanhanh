package com.bachhoanhanh.productservice.api.dto;

import com.bachhoanhanh.productservice.attribute.model.AttributeDataType;
import lombok.Data;

@Data
public class AttributeTypeRequest {
    private String name;
    private AttributeDataType dataType;
}
