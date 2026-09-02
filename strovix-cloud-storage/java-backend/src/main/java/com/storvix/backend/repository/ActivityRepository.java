package com.storvix.backend.repository;

import com.storvix.backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, String> {
    List<Activity> findByUser_IdOrderByCreatedAtDesc(String userId);

    List<Activity> findTop10ByUser_IdOrderByCreatedAtDesc(String userId);
}
