package com.bachhoanhanh.orderservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    private String keycloakId;   // set từ JWT trong controller, FE không cần gửi
    private String productId;    // dùng khi order 1 sản phẩm đơn lẻ
    private Integer quantity;    // dùng khi order 1 sản phẩm đơn lẻ
    private List<OrderLineRequest> items; // dùng khi order nhiều sản phẩm
    private String voucherCode;

    @Data
    public static class OrderLineRequest {
        private String productId;
        private Integer quantity;
    }
}