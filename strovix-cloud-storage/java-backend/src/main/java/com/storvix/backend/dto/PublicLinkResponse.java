package com.storvix.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.storvix.backend.entity.PublicLink;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PublicLinkResponse {
    private String id;
    private String token;
    private String url;
    private Boolean isActive;
    private Boolean emailSent;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    @JsonProperty("_id")
    public String get_id() {
        return id;
    }

    public static PublicLinkResponse from(PublicLink link, boolean emailSent, String absoluteUrl) {
        return PublicLinkResponse.builder()
                .id(link.getId())
                .token(link.getToken())
                .url(absoluteUrl)
                .isActive(link.getIsActive())
                .emailSent(emailSent)
                .expiresAt(link.getExpiresAt())
                .createdAt(link.getCreatedAt())
                .build();
    }
}
