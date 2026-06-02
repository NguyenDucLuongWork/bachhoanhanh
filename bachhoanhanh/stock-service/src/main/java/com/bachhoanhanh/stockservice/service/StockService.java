package com.bachhoanhanh.stockservice.service;

import com.bachhoanhanh.stockservice.model.Stock;
import com.bachhoanhanh.stockservice.repository.StockRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
}