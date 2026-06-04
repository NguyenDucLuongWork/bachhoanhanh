package com.bachhoanhanh.userservice.controller;

import com.bachhoanhanh.userservice.dto.*;
import com.bachhoanhanh.userservice.service.UserService;
import jakarta.validation.Valid; // Cần import cái này
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Thêm @Valid để các annotation trong DTO có hiệu lực
    @PostMapping("/staff")
    public ResponseEntity<UserResponse> createStaff(@Valid @RequestBody CreateStaffRequest req) {
        return ResponseEntity.ok(userService.createStaff(req));
    }

    // Public - tự đăng ký
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterCustomerRequest req) {
        return ResponseEntity.ok(userService.registerCustomer(req));
    }

    @DeleteMapping("/{keycloakId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String keycloakId) {
        userService.deleteUser(keycloakId);
        return ResponseEntity.noContent().build();
    }

    // Any authenticated user fetches their own profile
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        return ResponseEntity.ok(userService.getUserById(keycloakId));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateCustomerRequest req) {
        String keycloakId = jwt.getSubject();
        return ResponseEntity.ok(userService.updateCurrentUser(keycloakId, req));
    }

    // Admin fetches any user by ID
    @GetMapping("/{keycloakId}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable String keycloakId) {
        return ResponseEntity.ok(userService.getUserById(keycloakId));
    }

    @GetMapping("/staff")
    public ResponseEntity<List<StaffProfileResponse>> getStaffs() {
        return ResponseEntity.ok(userService.getStaffs());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerProfileResponse>> getCustomers() {
        return ResponseEntity.ok(userService.getCustomers());
    }

    @GetMapping("/customers/search")
    public ResponseEntity<CustomerProfileResponse> getCustomerByPhone(
            @RequestParam String phone) {
        return ResponseEntity.ok(userService.getCustomerByPhone(phone));
    }
}
