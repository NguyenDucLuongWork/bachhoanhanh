package com.bachhoanhanh.stockservice.controller;

import com.bachhoanhanh.stockservice.model.Stock;
import com.bachhoanhanh.stockservice.service.StockService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/stocks")
public class StockController {

    private final StockService service;

    public StockController(StockService service) {
        this.service = service;
    }

    @GetMapping
    public List<Stock> getAllStocks() {
        return service.getAllStocks();
    }

    @GetMapping("/{id}")
    public Stock getStockById(@PathVariable Long id) {
        return service.getStockById(id);
    }

    // GET /stocks?productId=ABC123
    @GetMapping(params = "productId")
    public List<Stock> getByProductId(@RequestParam String productId) {
        return service.getStockByProductId(productId);
    }

    // GET /stocks?expiresBefore=2025-12-31
    @GetMapping(params = "expiresBefore")
    public List<Stock> getExpiringSoon(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiresBefore) {
        return service.getExpiringSoon(expiresBefore);
    }

    @PostMapping
    public Stock createStock(@RequestBody Stock stock) {
        return service.createStock(stock);
    }

    @PutMapping("/{id}")
    public Stock updateStock(@PathVariable Long id, @RequestBody Stock stock) {
        return service.updateStock(id, stock);
    }

    @DeleteMapping("/{id}")
    public void deleteStock(@PathVariable Long id) {
        service.deleteStock(id);
    }

    // PATCH /stocks/{id}/availability?available=false
    @PatchMapping("/{id}/availability")
    public Stock setAvailability(@PathVariable Long id,
                                 @RequestParam boolean available) {
        return service.setAvailability(id, available);
    }

    // GET /stocks/available?productId=ABC123
    @GetMapping(value = "/available", params = "productId")
    public List<Stock> getAvailableByProductId(@RequestParam String productId) {
        return service.getAvailableStockByProductId(productId);
    }


}