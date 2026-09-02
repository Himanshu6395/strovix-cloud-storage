package com.storvix.backend.service;

import com.storvix.backend.dto.StarResponse;
import com.storvix.backend.entity.File;
import com.storvix.backend.entity.Folder;
import com.storvix.backend.entity.Star;
import com.storvix.backend.entity.User;
import com.storvix.backend.exception.AppException;
import com.storvix.backend.repository.FileRepository;
import com.storvix.backend.repository.FolderRepository;
import com.storvix.backend.repository.StarRepository;
import com.storvix.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StarService {

    private final StarRepository starRepository;
    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<StarResponse> listStars(String userId) {
        return starRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .filter(star -> {
                    if (star.getFile() != null) {
                        return !Boolean.TRUE.equals(star.getFile().getIsDeleted());
                    }
                    if (star.getFolder() != null) {
                        return !Boolean.TRUE.equals(star.getFolder().getIsDeleted());
                    }
                    return false;
                })
                .map(StarResponse::from)
                .toList();
    }

    @Transactional
    public StarResponse createStar(String userId, Map<String, String> body) {
        String fileId = body != null ? body.get("fileId") : null;
        String folderId = body != null ? body.get("folderId") : null;

        boolean hasFile = fileId != null && !fileId.isBlank();
        boolean hasFolder = folderId != null && !folderId.isBlank();

        if (hasFile == hasFolder) {
            throw new AppException("Provide exactly one of fileId or folderId", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));

        if (hasFile) {
            return starRepository.findByUser_IdAndFile_Id(userId, fileId)
                    .map(StarResponse::from)
                    .orElseGet(() -> {
                        File file = fileRepository.findById(fileId)
                                .orElseThrow(() -> new AppException("File not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));
                        if (Boolean.TRUE.equals(file.getIsDeleted())) {
                            throw new AppException("File not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
                        }
                        Star star = new Star();
                        star.setUser(user);
                        star.setFile(file);
                        return StarResponse.from(starRepository.save(star));
                    });
        }

        return starRepository.findByUser_IdAndFolder_Id(userId, folderId)
                .map(StarResponse::from)
                .orElseGet(() -> {
                    Folder folder = folderRepository.findById(folderId)
                            .orElseThrow(() -> new AppException("Folder not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));
                    if (Boolean.TRUE.equals(folder.getIsDeleted())) {
                        throw new AppException("Folder not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
                    }
                    Star star = new Star();
                    star.setUser(user);
                    star.setFolder(folder);
                    return StarResponse.from(starRepository.save(star));
                });
    }

    @Transactional
    public Map<String, Boolean> removeStar(String userId, Map<String, String> body) {
        String fileId = body != null ? body.get("fileId") : null;
        String folderId = body != null ? body.get("folderId") : null;

        boolean hasFile = fileId != null && !fileId.isBlank();
        boolean hasFolder = folderId != null && !folderId.isBlank();

        if (hasFile == hasFolder) {
            throw new AppException("Provide exactly one of fileId or folderId", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
        }

        if (hasFile) {
            starRepository.deleteByUser_IdAndFile_Id(userId, fileId);
        } else {
            starRepository.deleteByUser_IdAndFolder_Id(userId, folderId);
        }

        return Map.of("deleted", true);
    }
}
