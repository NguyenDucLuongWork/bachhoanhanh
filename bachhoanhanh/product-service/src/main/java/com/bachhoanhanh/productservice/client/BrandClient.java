package com.bachhoanhanh.productservice.client;

import com.bachhoanhanh.productservice.client.dto.BrandResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "brand-service")
public interface BrandClient {

    @GetMapping(value = "/brands", params = "name")
    BrandResponse findByName(
            @RequestParam String name
    );
}