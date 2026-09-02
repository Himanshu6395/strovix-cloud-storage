package com.storvix.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.storvix.backend.entity.Star;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StarResponse {
    private String id;
    private LocalDateTime createdAt;
    private FileResponse file;
    private FolderResponse folder;

    @JsonProperty("_id")
    public String get_id() {
        return id;
    }

    public static StarResponse from(Star star) {
        return StarResponse.builder()
                .id(star.getId())
                .createdAt(star.getCreatedAt())
                .file(star.getFile() != null ? FileResponse.from(star.getFile()) : null)
                .folder(star.getFolder() != null ? FolderResponse.from(star.getFolder()) : null)
                .build();
    }
}
