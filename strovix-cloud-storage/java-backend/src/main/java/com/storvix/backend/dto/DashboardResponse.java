package com.storvix.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardResponse {
    private StorageTotals storage;
    private Totals totals;
    private List<FileResponse> recentFiles;
    private List<StarItemResponse> starred;
    private List<ActivityItemResponse> recentActivity;

    @Data
    @Builder
    public static class StorageTotals {
        private long used;
        private long quota;
    }

    @Data
    @Builder
    public static class Totals {
        private long files;
        private long folders;
        private long starred;
    }

    @Data
    @Builder
    public static class StarItemResponse {
        private String id;
        private FileResponse file;
        private FolderResponse folder;
    }

    @Data
    @Builder
    public static class ActivityItemResponse {
        private String id;
        private String action;
        private String resourceType;
        private String resourceId;
        private Map<String, Object> metadata;
        private java.time.LocalDateTime createdAt;
    }
}
