package com.bachhoanhanh.productservice.attribute.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attribute {

    @EmbeddedId
    private AttributeId id;

    private String value;

    @ManyToOne(fetch = FetchType.LAZY)  // thêm LAZY — không cần load AttributeType mọi lúc
    @JoinColumn(name = "type", referencedColumnName = "name", insertable = false, updatable = false)
    private AttributeType attributeType;

    // Convenience getters
    public Long getProductId() { return id.getProductId(); }
    public String getTypeName() { return id.getType(); }

    // Không để Lombok generate equals/hashCode từ @Data
    // vì nó sẽ include attributeType → gây lazy load ngoài ý muốn
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Attribute a)) return false;
        return id != null && id.equals(a.id);
    }

    @Override
    public int hashCode() { return id != null ? id.hashCode() : 0; }
}