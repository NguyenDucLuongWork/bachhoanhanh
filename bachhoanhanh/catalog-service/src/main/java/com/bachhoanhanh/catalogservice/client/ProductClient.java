package com.bachhoanhanh.catalogservice.client;

import com.bachhoanhanh.catalogservice.client.dto.ProductSummary;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "product-service")
public interface ProductClient {

    @GetMapping("/products/by-catalog/{catalogId}")
    List<ProductSummary> getProductsByCatalog(@PathVariable("catalogId") String catalogId);
}