package com.bachhoanhanh.productservice.api.dto.order;

import lombok.Data;

import java.util.List;

@Data
public class OrderToFinishRequest {

    private Long orderId;

    private List<OrderToFinishItem> items;
}