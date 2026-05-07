package com.bachhoanhanh.orderservice.service;

import com.bachhoanhanh.orderservice.dto.Product;
import com.bachhoanhanh.orderservice.model.Order;
import com.bachhoanhanh.orderservice.model.OrderItem;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {

    private final RestTemplate restTemplate;
    // Map đóng vai trò giả lập cơ sở dữ liệu tạm thời
    private final Map<Long, Order> orderDatabase = new HashMap<>();
    private final AtomicLong orderSequence = new AtomicLong(1000);

    public OrderService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Order createOrder(String productId, Integer quantity) {
        // Khách hàng gọi API Gateway, Gateway chuyển tiếp sang product-service
        String productServiceUrl = "http://product-service:8080/products/" + productId;
        Product product = restTemplate.getForObject(productServiceUrl, Product.class);

        if (product == null) {
            throw new RuntimeException("Sản phẩm không tồn tại!");
        }

        Long orderId = orderSequence.incrementAndGet();
        Double totalPrice = product.getPrice() * quantity;

        Order order = new Order(
                orderId,
                productId,
                product.getName(),
                quantity,
                product.getPrice(),
                totalPrice,
                "pending", // Mặc định đơn hàng tạo mới ở trạng thái chờ thanh toán
                new Date()
        );

        order.setItems(List.of(new OrderItem(product.getName(), quantity, product.getPrice())));

        orderDatabase.put(orderId, order);
        return order;
    }

    public Order getOrderById(Long orderId) {
        return orderDatabase.get(orderId);
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderDatabase.get(orderId);
        if (order != null) {
            order.setStatus(status == null ? null : status.toLowerCase());
            orderDatabase.put(orderId, order);
        }
        return order;
    }

    public List<Order> getAllOrders() {
        return new ArrayList<>(orderDatabase.values());
    }
}