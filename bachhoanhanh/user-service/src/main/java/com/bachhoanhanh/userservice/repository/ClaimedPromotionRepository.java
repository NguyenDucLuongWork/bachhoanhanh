package com.bachhoanhanh.userservice.repository;

import com.bachhoanhanh.userservice.model.ClaimedPromotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimedPromotionRepository extends JpaRepository<ClaimedPromotion, Long> {

    // Lấy tất cả khuyến mãi của 1 customer
    List<ClaimedPromotion> findByCustomerProfile_KeycloakId(String keycloakId);

    // Kiểm tra customer đã nhận khuyến mãi này chưa (tránh nhận 2 lần)
    boolean existsByCustomerProfile_KeycloakIdAndPromotionCode(String keycloakId, String promotionCode);
}
