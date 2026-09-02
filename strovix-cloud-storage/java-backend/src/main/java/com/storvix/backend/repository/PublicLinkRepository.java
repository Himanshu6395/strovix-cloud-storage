package com.storvix.backend.repository;

import com.storvix.backend.entity.PublicLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PublicLinkRepository extends JpaRepository<PublicLink, String> {
    Optional<PublicLink> findByToken(String token);
}
