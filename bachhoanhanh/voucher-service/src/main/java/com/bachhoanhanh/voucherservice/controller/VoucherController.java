package com.bachhoanhanh.voucherservice.controller;

import com.bachhoanhanh.voucherservice.dto.ApplyVoucherRequest;
import com.bachhoanhanh.voucherservice.dto.ApplyVoucherResponse;
import com.bachhoanhanh.voucherservice.dto.VoucherRequest;
import com.bachhoanhanh.voucherservice.model.Voucher;
import com.bachhoanhanh.voucherservice.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vouchers")
@RequiredArgsConstructor
@Tag(name = "Voucher", description = "Voucher management and application")
public class VoucherController {

    private final VoucherService voucherService;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "List all vouchers")
    public List<Voucher> getAll() {
        return voucherService.getAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get voucher by ID")
    public Voucher getById(@PathVariable Long id) {
        return voucherService.getById(id);
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get voucher by code")
    public Voucher getByCode(@PathVariable String code) {
        return voucherService.getByCode(code);
    }

    @PostMapping
    @Operation(summary = "Create a new voucher")
    public ResponseEntity<Voucher> create(@Valid @RequestBody VoucherRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(voucherService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a voucher")
    public Voucher update(@PathVariable Long id, @Valid @RequestBody VoucherRequest request) {
        return voucherService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a voucher")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        voucherService.delete(id);
    }

    // ── Apply / Confirm ───────────────────────────────────────────────────────

    @PostMapping("/apply")
    @Operation(summary = "Validate & calculate discount for a voucher code",
            description = "Call this to preview the discount. Does not consume usage count.")
    public ApplyVoucherResponse apply(@Valid @RequestBody ApplyVoucherRequest request) {
        return voucherService.apply(request);
    }

    @PostMapping("/confirm-usage/{code}")
    @Operation(summary = "Increment usage count after a successful order",
            description = "Called by order-service once the order is confirmed.")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirmUsage(@PathVariable String code) {
        voucherService.confirmUsage(code);
    }
}