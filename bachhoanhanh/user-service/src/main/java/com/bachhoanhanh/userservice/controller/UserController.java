package com.bachhoanhanh.userservice.controller;

import com.bachhoanhanh.userservice.dto.*;
import com.bachhoanhanh.userservice.service.UserService;
import jakarta.validation.Valid; // Cần import cái này
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Thêm @Valid để các annotation trong DTO có hiệu lực
    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createStaff(@Valid @RequestBody CreateStaffRequest req) {
        return ResponseEntity.ok(userService.createStaff(req));
    }

    // Public - tự đăng ký
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterCustomerRequest req) {
        return ResponseEntity.ok(userService.registerCustomer(req));
    }

    @DeleteMapping("/{keycloakId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String keycloakId) {
        userService.deleteUser(keycloakId);
        return ResponseEntity.noContent().build();
    }
}