package com.bachhoanhanh.orderservice.repository;

import com.bachhoanhanh.orderservice.model.Order;
import com.bachhoanhanh.orderservice.model.OrderItem;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class OrderRepository {

    private final JdbcTemplate jdbc;

    public OrderRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ─── Row Mappers ─────────────────────────────────────────────────────────

    private final RowMapper<Order> orderRowMapper = (rs, rowNum) -> {
        Order o = new Order();
        o.setId(rs.getLong("id"));
        o.setKeycloakId(rs.getString("keycloak_id"));
        o.setSubtotal(rs.getDouble("subtotal"));
        o.setDiscountAmount(rs.getDouble("discount_amount"));
        o.setVoucherCode(rs.getString("voucher_code"));
        o.setTotalPrice(rs.getDouble("total_price"));
        o.setStatus(rs.getString("status"));
        Timestamp ts = rs.getTimestamp("order_date");
        o.setOrderDate(ts != null ? new Date(ts.getTime()) : null);
        o.setStockFinished(rs.getBoolean("stock_finished"));
        return o;
    };

    private final RowMapper<OrderItem> itemRowMapper = (rs, rowNum) -> {
        OrderItem item = new OrderItem();
        item.setId(rs.getLong("id"));
        item.setOrderId(rs.getLong("order_id"));
        item.setProductId(rs.getString("product_id"));
        item.setStockProductId(rs.getString("stock_product_id"));
        item.setName(rs.getString("name"));
        item.setQuantity(rs.getInt("quantity"));
        item.setPrice(rs.getDouble("price"));
        return item;
    };

    // ─── Orders ──────────────────────────────────────────────────────────────

    public List<Order> findAll() {
        List<Order> orders = jdbc.query(
                "SELECT * FROM orders ORDER BY order_date DESC",
                orderRowMapper
        );
        populateItems(orders);
        return orders;
    }

    public List<Order> findByKeycloakId(String keycloakId) {
        List<Order> orders = jdbc.query(
                "SELECT * FROM orders WHERE keycloak_id = ? ORDER BY order_date DESC",
                orderRowMapper, keycloakId
        );
        populateItems(orders);
        return orders;
    }

    public Optional<Order> findById(Long id) {
        List<Order> orders = jdbc.query(
                "SELECT * FROM orders WHERE id = ?",
                orderRowMapper, id
        );
        if (orders.isEmpty()) return Optional.empty();
        populateItems(orders);
        return Optional.of(orders.get(0));
    }

    public Order save(Order order) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO orders (keycloak_id, subtotal, discount_amount, voucher_code, total_price, status, order_date, stock_finished) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, order.getKeycloakId());
            ps.setDouble(2, order.getSubtotal() != null ? order.getSubtotal() : 0);
            ps.setDouble(3, order.getDiscountAmount() != null ? order.getDiscountAmount() : 0);
            ps.setString(4, order.getVoucherCode());
            ps.setDouble(5, order.getTotalPrice() != null ? order.getTotalPrice() : 0);
            ps.setString(6, order.getStatus() != null ? order.getStatus().toUpperCase() : "PENDING");
            ps.setTimestamp(7, order.getOrderDate() != null
                    ? new Timestamp(order.getOrderDate().getTime())
                    : new Timestamp(System.currentTimeMillis()));
            ps.setBoolean(8, Boolean.TRUE.equals(order.getStockFinished()));
            return ps;
        }, keyHolder);

        long generatedId = keyHolder.getKey().longValue();
        order.setId(generatedId);

        // Persist items
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            saveItems(generatedId, order.getItems());
        }

        return findById(generatedId).orElse(order);
    }

    public void updateStatus(Long orderId, String status) {
        jdbc.update(
                "UPDATE orders SET status = ? WHERE id = ?",
                status.toUpperCase(), orderId
        );
    }

    public void markStockFinished(Long orderId) {
        jdbc.update(
                "UPDATE orders SET stock_finished = TRUE WHERE id = ?",
                orderId
        );
    }

    // ─── Order Items ─────────────────────────────────────────────────────────

    public void saveItems(Long orderId, List<OrderItem> items) {
        for (OrderItem item : items) {
            jdbc.update(
                    "INSERT INTO order_items (order_id, product_id, stock_product_id, name, quantity, price) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                    orderId,
                    item.getProductId(),
                    item.getStockProductId(),
                    item.getName(),
                    item.getQuantity(),
                    item.getPrice()
            );
        }
    }

    public List<OrderItem> findItemsByOrderId(Long orderId) {
        return jdbc.query(
                "SELECT * FROM order_items WHERE order_id = ?",
                itemRowMapper, orderId
        );
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void populateItems(List<Order> orders) {
        if (orders.isEmpty()) return;

        List<Long> ids = orders.stream().map(Order::getId).collect(Collectors.toList());
        String placeholders = ids.stream().map(i -> "?").collect(Collectors.joining(","));

        List<OrderItem> allItems = jdbc.query(
                "SELECT * FROM order_items WHERE order_id IN (" + placeholders + ")",
                itemRowMapper, ids.toArray()
        );

        Map<Long, List<OrderItem>> byOrderId = allItems.stream()
                .collect(Collectors.groupingBy(OrderItem::getOrderId));

        for (Order order : orders) {
            order.setItems(byOrderId.getOrDefault(order.getId(), new ArrayList<>()));
        }
    }
}