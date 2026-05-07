package com.bachhoanhanh.userservice.repository;

import com.bachhoanhanh.userservice.model.StaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffProfileRepository extends JpaRepository<StaffProfile, String> {

    Optional<StaffProfile> findByIdCardNumber(String idCardNumber);

    boolean existsByIdCardNumber(String idCardNumber);
}