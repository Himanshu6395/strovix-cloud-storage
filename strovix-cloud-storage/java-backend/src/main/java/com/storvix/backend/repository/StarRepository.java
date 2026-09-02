package com.storvix.backend.repository;

import com.storvix.backend.entity.Star;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StarRepository extends JpaRepository<Star, String> {
    long countByUser_Id(String userId);

    List<Star> findTop10ByUser_IdOrderByCreatedAtDesc(String userId);

    List<Star> findByUser_IdOrderByCreatedAtDesc(String userId);

    Optional<Star> findByUser_IdAndFile_Id(String userId, String fileId);

    Optional<Star> findByUser_IdAndFolder_Id(String userId, String folderId);

    void deleteByUser_IdAndFile_Id(String userId, String fileId);

    void deleteByUser_IdAndFolder_Id(String userId, String folderId);
}
