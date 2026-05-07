package com.bachhoanhanh.userservice.repository;

import com.bachhoanhanh.userservice.model.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, String> {

    // Cộng điểm tích lũy
    @Modifying
    @Transactional
    @Query("UPDATE CustomerProfile c SET c.loyaltyPoints = c.loyaltyPoints + :points WHERE c.keycloakId = :id")
    int addLoyaltyPoints(@Param("id") String keycloakId, @Param("points") int points);

    // Trừ điểm tích lũy (dùng khi đổi quà)
    @Modifying
    @Transactional
    @Query("UPDATE CustomerProfile c SET c.loyaltyPoints = c.loyaltyPoints - :points WHERE c.keycloakId = :id AND c.loyaltyPoints >= :points")
    int deductLoyaltyPoints(@Param("id") String keycloakId, @Param("points") int points);
}
