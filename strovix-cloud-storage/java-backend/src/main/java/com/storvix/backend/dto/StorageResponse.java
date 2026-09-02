package com.storvix.backend.dto;

import com.storvix.backend.entity.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StorageResponse {
    private Long storageUsed;
    private Long storageQuota;

    public static StorageResponse from(User user) {
        return StorageResponse.builder()
                .storageUsed(user.getStorageUsed() != null ? user.getStorageUsed() : 0L)
                .storageQuota(user.getStorageQuota() != null ? user.getStorageQuota() : 0L)
                .build();
    }
}
