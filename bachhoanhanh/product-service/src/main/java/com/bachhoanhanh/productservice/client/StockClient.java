package com.bachhoanhanh.productservice.client;

import com.bachhoanhanh.productservice.client.dto.StockDetail;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "stock-service")
public interface StockClient {

    // Returns all available stocks for a product (triggers expiry auto-update on stock side)
    @GetMapping(value = "/stocks/available", params = "productId")
    List<StockDetail> getAvailableStocks(@RequestParam String productId);

    // Add to StockClient
    @GetMapping("/stocks")
    List<StockDetail> getAllStocks();
}