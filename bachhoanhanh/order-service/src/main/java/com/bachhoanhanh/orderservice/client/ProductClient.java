package com.bachhoanhanh.orderservice.client;

import com.bachhoanhanh.orderservice.client.dto.OrderToFinishRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "product-service")
public interface ProductClient {

    @PostMapping("/products/finish-order")
    void finishOrder(
            @RequestBody OrderToFinishRequest request
    );
}