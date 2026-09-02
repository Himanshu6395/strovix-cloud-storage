package com.storvix.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.storvix.backend.entity.File;
import com.storvix.backend.entity.Folder;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SearchItemResponse {
    private String id;
    private String name;
    private String resourceType;
    private String mimeType;
    private LocalDateTime updatedAt;

    @JsonProperty("_id")
    public String get_id() {
        return id;
    }

    public static SearchItemResponse from(File file) {
        return SearchItemResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .resourceType("file")
                .mimeType(file.getMimeType())
                .updatedAt(file.getUpdatedAt())
                .build();
    }

    public static SearchItemResponse from(Folder folder) {
        return SearchItemResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .resourceType("folder")
                .mimeType(null)
                .updatedAt(folder.getUpdatedAt())
                .build();
    }
}
