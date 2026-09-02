package com.storvix.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TrashItemResponse {
    private String id;
    private String name;
    private String type;
    private LocalDateTime deletedAt;
    private String originalLocation;
    private String parentFolder;
    private String mimeType;
    private Long size;

    @JsonProperty("_id")
    public String get_id() {
        return id;
    }
}
