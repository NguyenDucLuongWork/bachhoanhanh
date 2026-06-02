package com.bachhoanhanh.cartservice.dto;

import com.bachhoanhanh.cartservice.model.CartItem;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponse {
    private Long productId;
    private String barcode;
    private String name;
    private String image;
    private String description;
    private String catalogId;
    private String prototypeId;
    private double originalPrice;
    private int quantity;

    public static CartItemResponse from(CartItem item) {
        return CartItemResponse.builder()
                .productId(item.getProductId())
                .barcode(item.getBarcode())
                .name(item.getName())
                .image(item.getImage())
                .description(item.getDescription())
                .catalogId(item.getCatalogId())
                .prototypeId(item.getPrototypeId())
                .originalPrice(item.getOriginalPrice())
                .quantity(item.getQuantity())
                .build();
    }
}
