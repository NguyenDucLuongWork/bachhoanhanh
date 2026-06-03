package com.bachhoanhanh.orderservice.service;

import com.bachhoanhanh.orderservice.dto.CreateOrderRequest;
import com.bachhoanhanh.orderservice.dto.FinishStockOrderItemRequest;
import com.bachhoanhanh.orderservice.dto.FinishStockOrderRequest;
import com.bachhoanhanh.orderservice.dto.Product;
import com.bachhoanhanh.orderservice.model.FinishedOrderItem;
import com.bachhoanhanh.orderservice.model.Order;
import com.bachhoanhanh.orderservice.model.OrderItem;
import com.bachhoanhanh.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    private final RestTemplate restTemplate;
    private final OrderRepository orderRepository;

    public OrderService(RestTemplate restTemplate, OrderRepository orderRepository) {
        this.restTemplate = restTemplate;
        this.orderRepository = orderRepository;
    }

    // ─── Queries ─────────────────────────────────────────────────────────────

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByUser(String keycloakId) {
        return orderRepository.findByKeycloakId(keycloakId);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    // ─── Create ──────────────────────────────────────────────────────────────

    public Order createOrder(CreateOrderRequest request) {
        List<CreateOrderRequest.OrderLineRequest> requestItems = normalizeItems(request);
        List<OrderItem> orderItems = new ArrayList<>();
        List<Long> productIds = new ArrayList<>();
        List<String> catalogIds = new ArrayList<>();
        double subtotal = 0;

        for (CreateOrderRequest.OrderLineRequest line : requestItems) {
            Product product = getProduct(line.getProductId());
            subtotal += product.getPrice() * line.getQuantity();

            Long resolvedProductId = product.getProductId() != null
                    ? product.getProductId()
                    : Long.valueOf(line.getProductId());
            String stockProductId = product.getBarcode() != null && !product.getBarcode().isBlank()
                    ? product.getBarcode()
                    : String.valueOf(resolvedProductId);

            orderItems.add(OrderItem.builder()
                    .productId(String.valueOf(resolvedProductId))
                    .stockProductId(stockProductId)
                    .name(product.getName())
                    .quantity(line.getQuantity())
                    .price(product.getPrice())
                    .build());

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

        Order order = Order.builder()
                .keycloakId(request.getKeycloakId())
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .voucherCode(voucherCode)
                .totalPrice(totalPrice)
                .status("PENDING")
                .orderDate(new Date())
                .stockFinished(false)
                .items(orderItems)
                .build();

        return orderRepository.save(order);
    }

    // ─── Update ──────────────────────────────────────────────────────────────

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return null;

        String normalized = status == null ? null : status.toUpperCase();

        if (shouldFinishStock(normalized, order)) {
            finishStock(order);
            orderRepository.markStockFinished(orderId);
        }

        orderRepository.updateStatus(orderId, normalized != null ? normalized : "");
        order.setStatus(normalized);
        return order;
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private Product getProduct(String productId) {
        String url = "http://product-service:8080/products/" + productId;
        Product product = restTemplate.getForObject(url, Product.class);
        if (product == null) throw new RuntimeException("Product not found: " + productId);
        return product;
    }

    private List<CreateOrderRequest.OrderLineRequest> normalizeItems(CreateOrderRequest request) {
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            request.getItems().forEach(i -> validateItem(i.getProductId(), i.getQuantity()));
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

    private String normalizeVoucherCode(String code) {
        if (code == null || code.isBlank()) return null;
        return code.trim().toUpperCase();
    }

    private Map<?, ?> applyVoucher(String code, double subtotal,
                                   List<Long> productIds, List<String> catalogIds) {
        String url = "http://voucher-service:8087/vouchers/apply";
        Map<String, Object> body = Map.of(
                "code", code,
                "orderTotal", subtotal,
                "productIds", productIds,
                "catalogIds", catalogIds
        );
        return restTemplate.postForObject(url, body, Map.class);
    }

    private void confirmVoucherUsage(String code) {
        restTemplate.postForEntity(
                "http://voucher-service:8087/vouchers/confirm-usage/" + code,
                null, Void.class
        );
    }

    private boolean shouldFinishStock(String status, Order order) {
        if (status == null || Boolean.TRUE.equals(order.getStockFinished())) return false;
        return status.equals("ACCEPTED") || status.equals("PAID") || status.equals("DELIVERED") || status.equals("FINISHED");
    }

    private void finishStock(Order order) {
        List<OrderItem> items = order.getItems();
        if (items == null || items.isEmpty()) {
            throw new RuntimeException("Cannot finish order without items");
        }

        List<FinishStockOrderItemRequest> stockItems = items.stream()
                .map(item -> new FinishStockOrderItemRequest(
                        item.getStockProductId() != null && !item.getStockProductId().isBlank()
                                ? item.getStockProductId() : item.getProductId(),
                        item.getName(),
                        item.getQuantity(),
                        item.getPrice()
                ))
                .toList();

        FinishStockOrderRequest req = new FinishStockOrderRequest(order.getId(), stockItems);
        FinishedOrderItem[] finished = restTemplate.postForObject(
                "http://stock-service:8089/stocks/finish-order", req, FinishedOrderItem[].class
        );
        if (finished == null) throw new RuntimeException("Stock service did not return finished items");

        order.setFinishedItems(Arrays.asList(finished));
    }
}
