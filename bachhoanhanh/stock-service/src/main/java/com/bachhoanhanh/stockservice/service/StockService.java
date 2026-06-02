package com.bachhoanhanh.stockservice.service;

import com.bachhoanhanh.stockservice.dto.FinishOrderRequest;
import com.bachhoanhanh.stockservice.dto.FinishedStockItemResponse;
import com.bachhoanhanh.stockservice.model.Stock;
import com.bachhoanhanh.stockservice.repository.StockRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class StockService {

    private final StockRepository repository;

    public StockService(StockRepository repository) {
        this.repository = repository;
    }

    public List<Stock> getAllStocks() {
        return repository.findAll();
    }

    public Stock getStockById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<Stock> getStockByProductId(String productId) {
        return repository.findByProductId(productId);
    }

    public Stock createStock(Stock stock) {
        if (stock.getExpiryDate().isBefore(stock.getManufactureDate())) {
            throw new IllegalArgumentException("Expiry date must be after manufacture date");
        }
        // Auto-set available based on expiry at creation time
        stock.setAvailable(!stock.getExpiryDate().isBefore(LocalDate.now()));
        return repository.save(stock);
    }

    public Stock updateStock(Long id, Stock newStock) {
        Stock stock = repository.findById(id).orElse(null);
        if (stock == null) return null;

        if (newStock.getExpiryDate().isBefore(newStock.getManufactureDate())) {
            throw new IllegalArgumentException("Expiry date must be after manufacture date");
        }

        stock.setProductId(newStock.getProductId());
        stock.setAmount(newStock.getAmount());
        stock.setImportDate(newStock.getImportDate());
        stock.setManufactureDate(newStock.getManufactureDate());
        stock.setExpiryDate(newStock.getExpiryDate());
        stock.setAvailable(newStock.getAvailable());

        return repository.save(stock);
    }

    public Stock setAvailability(Long id, boolean available) {
        Stock stock = repository.findById(id).orElse(null);
        if (stock == null) return null;
        stock.setAvailable(available);
        return repository.save(stock);
    }

    public void deleteStock(Long id) {
        repository.deleteById(id);
    }

    public List<Stock> getExpiringSoon(LocalDate before) {
        return repository.findByExpiryDateBefore(before);
    }

    /**
     * Returns all available, non-expired stock for a given productId.
     *
     * Strategy (performance-first):
     * 1. Single UPDATE query marks any stale available=true+expired rows as false (bulk, in DB).
     * 2. Single SELECT query returns only the genuinely available rows.
     * No Java-side filtering loop needed.
     */
    @Transactional
    public List<Stock> getAvailableStockByProductId(String productId) {
        LocalDate today = LocalDate.now();
        // Step 1: bulk-expire stale rows entirely in MariaDB — one UPDATE, no fetching
        repository.markExpiredByProductId(productId, today);
        // Step 2: fetch only the clean available set
        return repository.findAvailableAndNotExpired(productId, today);
    }

    @Transactional
    public List<FinishedStockItemResponse> finishOrder(FinishOrderRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order items are required");
        }

        List<FinishedStockItemResponse> finishedItems = new ArrayList<>();
        LocalDate today = LocalDate.now();

        request.getItems().forEach(item -> {
            if (item.getProductId() == null || item.getProductId().isBlank()) {
                throw new IllegalArgumentException("productId is required");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("quantity must be greater than zero");
            }

            repository.markExpiredByProductId(item.getProductId(), today);
            List<Stock> stocks = repository.findConsumableStockForProduct(item.getProductId(), today);
            int remaining = item.getQuantity();

            for (Stock stock : stocks) {
                if (remaining <= 0) break;

                int availableAmount = stock.getAmount() == null ? 0 : stock.getAmount();
                if (availableAmount <= 0) continue;

                int consumed = Math.min(availableAmount, remaining);
                stock.setAmount(availableAmount - consumed);
                if (stock.getAmount() <= 0) {
                    stock.setAvailable(false);
                }
                repository.save(stock);

                finishedItems.add(new FinishedStockItemResponse(
                        item.getProductId(),
                        item.getProductName(),
                        stock.getId(),
                        consumed,
                        item.getPrice()
                ));

                remaining -= consumed;
            }

            if (remaining > 0) {
                throw new IllegalArgumentException(
                        "Not enough stock for product " + item.getProductId() + ". Missing quantity: " + remaining
                );
            }
        });

        return finishedItems;
    }
}
