package com.bachhoanhanh.productservice.prototype.model;

import com.bachhoanhanh.productservice.attribute.model.AttributeType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Arrays;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prototype {

    @Id
    private String productId; // Ví dụ: "MEAT", "VEGETABLE", "OFFICE_SUPPLIES"
    private String catalogId;
    private String name; // Tên hiển thị: "Thịt tươi sống", "Rau củ quả"

    /**
     * Lưu danh sách các AttributeType name, cách nhau bằng dấu phẩy.
     * Ví dụ: "EXPIRY_DATE,WEIGHT,ORIGIN"
     */
    @Column(length = 1000)
    private String packedAttributes;

    /**
     * Không lưu xuống DB. Dùng để Factory đọc và tạo danh sách Attribute tương ứng.
     */
    @Transient
    private String[] attributeTypeNames;

    /**
     * Hàm tiện ích để giải nén chuỗi packedAttributes thành mảng để xử lý ở tầng logic.
     */
    public String[] getUnpackedAttributes() {
        if (packedAttributes == null || packedAttributes.isEmpty()) {
            return new String[0];
        }
        return packedAttributes.split(",");
    }

    /**
     * Ngược lại, nén mảng thành chuỗi để lưu vào DB.
     */
    public void packAttributes(String[] types) {
        if (types == null) {
            this.packedAttributes = "";
        } else {
            this.packedAttributes = String.join(",", types);
        }
    }
}