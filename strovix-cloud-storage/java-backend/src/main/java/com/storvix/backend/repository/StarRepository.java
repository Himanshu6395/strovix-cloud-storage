package com.storvix.backend.repository;

import com.storvix.backend.entity.Star;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StarRepository extends JpaRepository<Star, String> {
    long countByUser_Id(String userId);

    List<Star> findTop10ByUser_IdOrderByCreatedAtDesc(String userId);
}
