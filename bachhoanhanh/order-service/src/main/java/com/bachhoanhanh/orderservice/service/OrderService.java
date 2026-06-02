package com.bachhoanhanh.orderservice.service;

import com.bachhoanhanh.orderservice.dto.CreateOrderRequest;
import com.bachhoanhanh.orderservice.dto.FinishStockOrderItemRequest;
import com.bachhoanhanh.orderservice.dto.FinishStockOrderRequest;
import com.bachhoanhanh.orderservice.dto.Product;
import com.bachhoanhanh.orderservice.model.FinishedOrderItem;
import com.bachhoanhanh.orderservice.model.Order;
import com.bachhoanhanh.orderservice.model.OrderItem;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {

    private final RestTemplate restTemplate;
    private final Map<Long, Order> orderDatabase = new HashMap<>();
    private final AtomicLong orderSequence = new AtomicLong(1000);

    public OrderService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Order createOrder(String productId, Integer quantity) {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setProductId(productId);
        request.setQuantity(quantity);
        return createOrder(request);
    }

    public Order createOrder(CreateOrderRequest request) {
        List<CreateOrderRequest.OrderLineRequest> requestItems = normalizeItems(request);
        List<OrderItem> orderItems = new ArrayList<>();
        List<Long> productIds = new ArrayList<>();
        List<String> catalogIds = new ArrayList<>();
        double subtotal = 0;

        List<Product> products = new ArrayList<>();
        for (CreateOrderRequest.OrderLineRequest item : requestItems) {
            Product product = getProduct(item.getProductId());
            products.add(product);
            subtotal += product.getPrice() * item.getQuantity();

            Long resolvedProductId = product.getProductId() != null ? product.getProductId() : Long.valueOf(item.getProductId());
            String stockProductId = product.getBarcode() != null && !product.getBarcode().isBlank()
                    ? product.getBarcode()
                    : String.valueOf(resolvedProductId);
            orderItems.add(new OrderItem(
                    String.valueOf(resolvedProductId),
                    stockProductId,
                    product.getName(),
                    item.getQuantity(),
                    product.getPrice()
            ));
            productIds.add(resolvedProductId);
            if (product.getCatalogId() != null && !product.getCatalogId().isBlank()) {
                catalogIds.add(product.getCatalogId());
            }
        }

        double discountAmount = 0;
        String voucherCode = normalizeVoucherCode(request.getVoucherCode());
        if (voucherCode != null) {
            Map<?, ?> voucher = applyVoucher(voucherCode, subtotal, productIds, catalogIds);
            Object discount = voucher.get("discountAmount");
            if (discount instanceof Number number) {
                discountAmount = number.doubleValue();
            }
            confirmVoucherUsage(voucherCode);
        }

        double totalPrice = Math.max(0, subtotal - discountAmount);
        Long orderId = orderSequence.incrementAndGet();
        Product firstProduct = products.get(0);
        CreateOrderRequest.OrderLineRequest firstLine = requestItems.get(0);

        Order order = new Order(
                orderId,
                firstLine.getProductId(),
                firstProduct.getName(),
                firstLine.getQuantity(),
                firstProduct.getPrice(),
                totalPrice,
                "pending",
                new Date()
        );
        order.setItems(orderItems);
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setVoucherCode(voucherCode);

        orderDatabase.put(orderId, order);
        return order;
    }

    public Order getOrderById(Long orderId) {
        return orderDatabase.get(orderId);
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderDatabase.get(orderId);
        if (order != null) {
            String normalizedStatus = status == null ? null : status.toLowerCase();
            if (shouldFinishStock(normalizedStatus, order)) {
                finishStock(order);
            }
            order.setStatus(normalizedStatus);
            orderDatabase.put(orderId, order);
        }
        return order;
    }

    public List<Order> getAllOrders() {
        return new ArrayList<>(orderDatabase.values());
    }

    private Product getProduct(String productId) {
        String productServiceUrl = "http://product-service:8080/products/" + productId;
        Product product = restTemplate.getForObject(productServiceUrl, Product.class);
        if (product == null) {
            throw new RuntimeException("Product not found: " + productId);
        }
        return product;
    }

    private List<CreateOrderRequest.OrderLineRequest> normalizeItems(CreateOrderRequest request) {
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreateOrderRequest.OrderLineRequest item : request.getItems()) {
                validateItem(item.getProductId(), item.getQuantity());
            }
            return request.getItems();
        }

        validateItem(request.getProductId(), request.getQuantity());
        CreateOrderRequest.OrderLineRequest line = new CreateOrderRequest.OrderLineRequest();
        line.setProductId(request.getProductId());
        line.setQuantity(request.getQuantity());
        return List.of(line);
    }

    private void validateItem(String productId, Integer quantity) {
        if (productId == null || productId.isBlank() || quantity == null || quantity <= 0) {
            throw new RuntimeException("productId and quantity are required");
        }
    }

    private String normalizeVoucherCode(String voucherCode) {
        if (voucherCode == null || voucherCode.isBlank()) {
            return null;
        }
        return voucherCode.trim().toUpperCase();
    }

    private Map<?, ?> applyVoucher(String voucherCode, double subtotal, List<Long> productIds, List<String> catalogIds) {
        String url = "http://voucher-service:8087/vouchers/apply";
        Map<String, Object> body = Map.of(
                "code", voucherCode,
                "orderTotal", subtotal,
                "productIds", productIds,
                "catalogIds", catalogIds
        );
        return restTemplate.postForObject(url, body, Map.class);
    }

    private void confirmVoucherUsage(String voucherCode) {
        String url = "http://voucher-service:8087/vouchers/confirm-usage/" + voucherCode;
        restTemplate.postForEntity(url, null, Void.class);
    }

    private boolean shouldFinishStock(String status, Order order) {
        if (status == null || Boolean.TRUE.equals(order.getStockFinished())) {
            return false;
        }
        return status.equals("paid") || status.equals("delivered") || status.equals("finished");
    }

    private void finishStock(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new RuntimeException("Cannot finish order without items");
        }

        List<FinishStockOrderItemRequest> items = order.getItems().stream()
                .map(item -> new FinishStockOrderItemRequest(
                        item.getStockProductId() != null && !item.getStockProductId().isBlank()
                                ? item.getStockProductId()
                                : item.getProductId(),
                        item.getName(),
                        item.getQuantity(),
                        item.getPrice()
                ))
                .toList();

        FinishStockOrderRequest request = new FinishStockOrderRequest(order.getId(), items);
        String url = "http://stock-service:8089/stocks/finish-order";
        FinishedOrderItem[] finishedItems = restTemplate.postForObject(url, request, FinishedOrderItem[].class);
        if (finishedItems == null) {
            throw new RuntimeException("Stock service did not return finished items");
        }

        order.setFinishedItems(Arrays.asList(finishedItems));
        order.setStockFinished(true);
    }
}
