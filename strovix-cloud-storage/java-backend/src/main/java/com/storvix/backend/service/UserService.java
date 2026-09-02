package com.storvix.backend.service;

import com.storvix.backend.dto.DashboardResponse;
import com.storvix.backend.dto.FileResponse;
import com.storvix.backend.dto.FolderResponse;
import com.storvix.backend.dto.StorageResponse;
import com.storvix.backend.dto.UpdateProfileRequest;
import com.storvix.backend.dto.UserResponse;
import com.storvix.backend.entity.Activity;
import com.storvix.backend.entity.File;
import com.storvix.backend.entity.Star;
import com.storvix.backend.entity.User;
import com.storvix.backend.exception.AppException;
import com.storvix.backend.repository.ActivityRepository;
import com.storvix.backend.repository.FileRepository;
import com.storvix.backend.repository.FolderRepository;
import com.storvix.backend.repository.StarRepository;
import com.storvix.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;
    private final StarRepository starRepository;
    private final ActivityRepository activityRepository;

    public User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));
    }

    public StorageResponse getStorage(String userId) {
        return StorageResponse.from(getUser(userId));
    }

    @Transactional
    public UserResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = getUser(userId);
        user.setName(request.getName().trim());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String userId) {
        User user = getUser(userId);

        long fileCount = fileRepository.countByOwner_IdAndIsDeletedFalseAndUploadStatus(userId, "completed");
        long folderCount = folderRepository.countByOwner_IdAndIsDeletedFalse(userId);
        long starredCount = starRepository.countByUser_Id(userId);

        List<File> recent = fileRepository
                .findTop10ByOwner_IdAndIsDeletedFalseAndUploadStatusOrderByCreatedAtDesc(userId, "completed");

        List<Star> starred = starRepository.findTop10ByUser_IdOrderByCreatedAtDesc(userId);
        List<Activity> activities = activityRepository.findTop10ByUser_IdOrderByCreatedAtDesc(userId);

        return DashboardResponse.builder()
                .storage(DashboardResponse.StorageTotals.builder()
                        .used(user.getStorageUsed() != null ? user.getStorageUsed() : 0L)
                        .quota(user.getStorageQuota() != null ? user.getStorageQuota() : 0L)
                        .build())
                .totals(DashboardResponse.Totals.builder()
                        .files(fileCount)
                        .folders(folderCount)
                        .starred(starredCount)
                        .build())
                .recentFiles(recent.stream().map(FileResponse::from).collect(Collectors.toList()))
                .starred(starred.stream().map(this::toStarItem).collect(Collectors.toList()))
                .recentActivity(activities.stream().map(this::toActivityItem).collect(Collectors.toList()))
                .build();
    }

    private DashboardResponse.StarItemResponse toStarItem(Star star) {
        return DashboardResponse.StarItemResponse.builder()
                .id(star.getId())
                .file(star.getFile() != null ? FileResponse.from(star.getFile()) : null)
                .folder(star.getFolder() != null ? FolderResponse.from(star.getFolder()) : null)
                .build();
    }

    private DashboardResponse.ActivityItemResponse toActivityItem(Activity activity) {
        return DashboardResponse.ActivityItemResponse.builder()
                .id(activity.getId())
                .action(activity.getAction())
                .resourceType(activity.getResourceType())
                .resourceId(activity.getResourceId())
                .metadata(activity.getMetadata())
                .createdAt(activity.getCreatedAt())
                .build();
    }
}
