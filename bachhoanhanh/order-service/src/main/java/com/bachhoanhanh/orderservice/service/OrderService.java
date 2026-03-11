package com.bachhoanhanh.orderservice.service;

import com.bachhoanhanh.orderservice.dto.Product;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OrderService {

    private final RestTemplate restTemplate;

    public OrderService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Product getProduct(Long id) {

        String url = "http://product-service:8080/products/" + id;

        return restTemplate.getForObject(url, Product.class);
    }
}