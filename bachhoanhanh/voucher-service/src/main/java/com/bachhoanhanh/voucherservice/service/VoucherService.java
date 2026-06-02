package com.bachhoanhanh.voucherservice.service;

import com.bachhoanhanh.voucherservice.dto.ApplyVoucherRequest;
import com.bachhoanhanh.voucherservice.dto.ApplyVoucherResponse;
import com.bachhoanhanh.voucherservice.dto.VoucherRequest;
import com.bachhoanhanh.voucherservice.model.DiscountType;
import com.bachhoanhanh.voucherservice.model.Voucher;
import com.bachhoanhanh.voucherservice.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public List<Voucher> getAll() {
        return voucherRepository.findAll();
    }

    public Voucher getById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher not found"));
    }

    public Voucher getByCode(String code) {
        return voucherRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher not found"));
    }

    public Voucher create(VoucherRequest req) {
        validateTarget(req.getTargetProductId(), req.getTargetCatalogId());
        if (voucherRepository.existsByCode(req.getCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Voucher code already exists");
        }
        Voucher v = mapToEntity(new Voucher(), req);
        v.setUsedCount(0);
        return voucherRepository.save(v);
    }

    public Voucher update(Long id, VoucherRequest req) {
        validateTarget(req.getTargetProductId(), req.getTargetCatalogId());
        Voucher existing = getById(id);
        // Allow code change only if new code doesn't belong to another voucher
        if (!existing.getCode().equals(req.getCode()) && voucherRepository.existsByCode(req.getCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Voucher code already exists");
        }
        mapToEntity(existing, req);
        return voucherRepository.save(existing);
    }

    public void delete(Long id) {
        if (!voucherRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher not found");
        }
        voucherRepository.deleteById(id);
    }

    // ── Apply ─────────────────────────────────────────────────────────────────

    /**
     * Validates and calculates the discount for a given voucher code.
     * Does NOT persist the usage increment — call confirmUsage() after the order is placed.
     */
    public ApplyVoucherResponse apply(ApplyVoucherRequest req) {
        Voucher v = voucherRepository.findByCode(req.getCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher not found"));

        validateUsable(v, req);

        double discount = calculateDiscount(v, req.getOrderTotal());
        double finalTotal = Math.max(0, req.getOrderTotal() - discount);

        return new ApplyVoucherResponse(v.getCode(), req.getOrderTotal(), discount, finalTotal);
    }

    /**
     * Increments the usage counter after the order is successfully placed.
     */
    public void confirmUsage(String code) {
        Voucher v = voucherRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher not found"));
        v.setUsedCount(v.getUsedCount() + 1);
        voucherRepository.save(v);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void validateTarget(Long productId, String catalogId) {
        if (productId != null && catalogId != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A voucher can only target a product OR a catalog, not both");
        }
    }

    private void validateUsable(Voucher v, ApplyVoucherRequest req) {
        LocalDateTime now = LocalDateTime.now();

        if (!v.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher is inactive");
        }
        if (now.isBefore(v.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher has not started yet");
        }
        if (now.isAfter(v.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher has expired");
        }
        if (v.getUsageLimit() > 0 && v.getUsedCount() >= v.getUsageLimit()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher usage limit reached");
        }
        if (req.getOrderTotal() < v.getMinOrderValue()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Order total does not meet minimum required value of " + v.getMinOrderValue());
        }

        // Target check
        if (v.getTargetProductId() != null) {
            boolean matched = req.getProductIds() != null
                    && req.getProductIds().contains(v.getTargetProductId());
            if (!matched) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Voucher is only valid for product ID " + v.getTargetProductId());
            }
        } else if (v.getTargetCatalogId() != null) {
            boolean matched = req.getCatalogIds() != null
                    && req.getCatalogIds().contains(v.getTargetCatalogId());
            if (!matched) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Voucher is only valid for catalog '" + v.getTargetCatalogId() + "'");
            }
        }
        // null target = applies to all
    }

    private double calculateDiscount(Voucher v, double orderTotal) {
        if (v.getDiscountType() == DiscountType.FIXED) {
            return Math.min(v.getDiscountValue(), orderTotal);
        }
        // PERCENT
        double discount = orderTotal * v.getDiscountValue() / 100.0;
        if (v.getMaxDiscountAmount() > 0) {
            discount = Math.min(discount, v.getMaxDiscountAmount());
        }
        return discount;
    }

    private Voucher mapToEntity(Voucher v, VoucherRequest req) {
        v.setCode(req.getCode());
        v.setDescription(req.getDescription());
        v.setDiscountType(req.getDiscountType());
        v.setDiscountValue(req.getDiscountValue());
        v.setMinOrderValue(req.getMinOrderValue());
        v.setMaxDiscountAmount(req.getMaxDiscountAmount());
        v.setUsageLimit(req.getUsageLimit());
        v.setStartDate(req.getStartDate());
        v.setEndDate(req.getEndDate());
        v.setActive(req.isActive());
        v.setTargetProductId(req.getTargetProductId());
        v.setTargetCatalogId(req.getTargetCatalogId());
        return v;
    }
}