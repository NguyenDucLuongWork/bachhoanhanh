package com.bachhoanhanh.userservice.service;

import com.bachhoanhanh.userservice.dto.*;
import com.bachhoanhanh.userservice.model.*;
import com.bachhoanhanh.userservice.model.Role;
import com.bachhoanhanh.userservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final KeycloakAdminService keycloakAdminService;

    // ADMIN tạo STAFF
    @Transactional
    public UserResponse createStaff(CreateStaffRequest req) {
        String keycloakId = null;
        try {
            keycloakId = keycloakAdminService.createUser(
                    req.getUsername(), req.getFirstName(), req.getLastName(),
                    req.getEmail(), req.getPassword(), Role.STAFF
            );

            User user = User.builder()
                    .keycloakId(keycloakId)
                    .phone(req.getPhone())
                    .firstName(req.getFirstName())
                    .lastName(req.getLastName())
                    .email(req.getEmail())
                    .role(Role.STAFF)
                    .build();

            user = userRepository.saveAndFlush(user); // ← only this, remove the plain save()

            StaffProfile profile = StaffProfile.builder()
                    .user(user)
                    .dateOfBirth(req.getDateOfBirth())
                    .idCardNumber(req.getIdCardNumber())
                    .isFemale(req.isFemale())
                    .address(req.getAddress())
                    .build();
            staffProfileRepository.save(profile);

            return UserResponse.from(user);
        } catch (Exception e) {
            if (keycloakId != null) {
                keycloakAdminService.deleteUser(keycloakId);
            }
            throw new RuntimeException("Lỗi khi tạo nhân viên: " + e.getMessage());
        }
    }

    @Transactional
    public UserResponse registerCustomer(RegisterCustomerRequest req) {
        String keycloakId = keycloakAdminService.createUser(
                req.getPhone(), req.getFirstName(), req.getLastName(),
                req.getEmail(), req.getPassword(), Role.CUSTOMER
        );

        User user = User.builder()
                .keycloakId(keycloakId)
                .phone(req.getPhone())
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .role(Role.CUSTOMER)
                .build();

        // Use saveAndFlush so Hibernate fully registers the entity in the session
        user = userRepository.saveAndFlush(user);

        CustomerProfile profile = CustomerProfile.builder()
                .user(user)
                .loyaltyPoints(0)
                .build();
        customerProfileRepository.save(profile);

        return UserResponse.from(user);
    }

    // ADMIN xóa user (staff hoặc customer)
    @Transactional
    public void deleteUser(String keycloakId) {
        keycloakAdminService.deleteUser(keycloakId);
        userRepository.deleteById(keycloakId);
    }

    public UserResponse getUserById(String keycloakId) {
        User user = userRepository.findById(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found: " + keycloakId));
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateCurrentUser(String keycloakId, UpdateCustomerRequest req) {
        User user = userRepository.findById(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found: " + keycloakId));

        if (req.getFirstName() != null && !req.getFirstName().isBlank()) {
            user.setFirstName(req.getFirstName());
        }
        if (req.getLastName() != null && !req.getLastName().isBlank()) {
            user.setLastName(req.getLastName());
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            user.setEmail(req.getEmail());
        }

        User saved = userRepository.saveAndFlush(user);
        keycloakAdminService.updateUserInfo(
                saved.getKeycloakId(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getEmail()
        );
        return UserResponse.from(saved);
    }

    public List<StaffProfileResponse> getStaffs() {
        return userRepository.findAllByRole(Role.STAFF).stream()
                .map(user -> {
                    StaffProfile profile = staffProfileRepository.findById(user.getKeycloakId())
                            .orElseThrow(() -> new RuntimeException("Staff profile not found: " + user.getKeycloakId()));
                    return StaffProfileResponse.from(user, profile);
                })
                .toList();
    }

    public List<CustomerProfileResponse> getCustomers() {
        return userRepository.findAllByRole(Role.CUSTOMER).stream()
                .map(user -> {
                    CustomerProfile profile = customerProfileRepository.findById(user.getKeycloakId())
                            .orElseThrow(() -> new RuntimeException("Customer profile not found: " + user.getKeycloakId()));
                    return CustomerProfileResponse.from(user, profile, List.of());
                })
                .toList();
    }

    public CustomerProfileResponse getCustomerByPhone(String phone) {
        User user = userRepository.findByPhone(phone)
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Customer not found with phone: " + phone));
        CustomerProfile profile = customerProfileRepository.findById(user.getKeycloakId())
                .orElseThrow(() -> new RuntimeException("Customer profile not found: " + user.getKeycloakId()));
        return CustomerProfileResponse.from(user, profile, List.of());
    }
}
