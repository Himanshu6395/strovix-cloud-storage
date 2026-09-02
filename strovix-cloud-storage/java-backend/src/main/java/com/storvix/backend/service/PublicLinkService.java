package com.storvix.backend.service;

import com.storvix.backend.dto.FileResponse;
import com.storvix.backend.dto.FolderResponse;
import com.storvix.backend.dto.PublicLinkResponse;
import com.storvix.backend.entity.File;
import com.storvix.backend.entity.Folder;
import com.storvix.backend.entity.PublicLink;
import com.storvix.backend.entity.User;
import com.storvix.backend.exception.AppException;
import com.storvix.backend.repository.FileRepository;
import com.storvix.backend.repository.FolderRepository;
import com.storvix.backend.repository.PublicLinkRepository;
import com.storvix.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicLinkService {

    private final PublicLinkRepository publicLinkRepository;
    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final S3StorageService s3StorageService;

    @Transactional
    public PublicLinkResponse create(String userId, Map<String, Object> body) {
        String fileId = asString(body.get("fileId"));
        String folderId = asString(body.get("folderId"));
        boolean hasFile = fileId != null && !fileId.isBlank();
        boolean hasFolder = folderId != null && !folderId.isBlank();

        if (hasFile == hasFolder) {
            throw new AppException("Provide exactly one of fileId or folderId", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));

        File file = null;
        Folder folder = null;
        String resourceName;
        String resourceType;

        if (hasFile) {
            file = fileRepository.findById(fileId)
                    .orElseThrow(() -> new AppException("File not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));
            if (!file.getOwner().getId().equals(userId) || Boolean.TRUE.equals(file.getIsDeleted())) {
                throw new AppException("File not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
            }
            resourceName = file.getName();
            resourceType = "file";
        } else {
            folder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new AppException("Folder not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));
            if (!folder.getOwner().getId().equals(userId) || Boolean.TRUE.equals(folder.getIsDeleted())) {
                throw new AppException("Folder not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
            }
            resourceName = folder.getName();
            resourceType = "folder";
        }

        PublicLink link = new PublicLink();
        link.setFile(file);
        link.setFolder(folder);
        link.setToken(UUID.randomUUID().toString().replace("-", ""));
        link.setCreatedBy(user);
        link.setIsActive(true);
        link.setExpiresAt(parseExpiresAt(body.get("expiresAt")));

        String password = asString(body.get("password"));
        if (password != null && !password.isBlank()) {
            link.setPasswordHash(passwordEncoder.encode(password));
        }

        link = publicLinkRepository.save(link);

        boolean emailSent = false;
        String recipientEmail = asString(body.get("recipientEmail"));
        if (recipientEmail != null && !recipientEmail.isBlank()) {
            emailService.sendPublicLinkEmail(
                    recipientEmail.trim(),
                    null,
                    user.getName(),
                    resourceName,
                    resourceType,
                    link.getToken()
            );
            emailSent = true;
        }

        return PublicLinkResponse.from(link, emailSent);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getByToken(String token, String password) {
        PublicLink link = publicLinkRepository.findByToken(token)
                .orElseThrow(() -> new AppException("Public link not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));

        if (!Boolean.TRUE.equals(link.getIsActive())) {
            throw new AppException("This link has been disabled", HttpStatus.FORBIDDEN, "LINK_DISABLED");
        }
        if (link.isExpired()) {
            throw new AppException("This link has expired", HttpStatus.GONE, "LINK_EXPIRED");
        }

        if (link.getPasswordHash() != null && !link.getPasswordHash().isBlank()) {
            if (password == null || password.isBlank()) {
                throw new AppException("Password required", HttpStatus.UNAUTHORIZED, "PASSWORD_REQUIRED");
            }
            if (!passwordEncoder.matches(password, link.getPasswordHash())) {
                throw new AppException("Invalid password", HttpStatus.UNAUTHORIZED, "INVALID_PASSWORD");
            }
        }

        Map<String, Object> data = new HashMap<>();
        Map<String, Object> resource = new HashMap<>();

        if (link.getFile() != null) {
            File file = link.getFile();
            resource.put("type", "file");
            resource.put("name", file.getName());
            resource.put("mimeType", file.getMimeType());
            resource.put("size", file.getSize());
            resource.put("id", file.getId());
            resource.put("_id", file.getId());

            String contentDisposition = "attachment; filename=\"" + file.getOriginalName() + "\"";
            String downloadUrl = s3StorageService.generateDownloadUrl(file.getStorageKey(), file.getMimeType(), contentDisposition);
            data.put("downloadUrl", downloadUrl);
        } else {
            Folder folder = link.getFolder();
            resource.put("type", "folder");
            resource.put("name", folder.getName());
            resource.put("id", folder.getId());
            resource.put("_id", folder.getId());

            List<FolderResponse> folders = folderRepository
                    .findByParentFolderIdAndIsDeletedFalseOrderByName(folder.getId())
                    .stream()
                    .map(FolderResponse::from)
                    .collect(Collectors.toList());
            List<FileResponse> files = fileRepository
                    .findByFolderIdAndIsDeletedFalseAndUploadStatusOrderByName(folder.getId(), "completed")
                    .stream()
                    .map(FileResponse::from)
                    .collect(Collectors.toList());
            resource.put("folders", folders);
            resource.put("files", files);
        }

        data.put("resource", resource);
        data.put("token", link.getToken());
        data.put("isActive", link.getIsActive());
        data.put("expiresAt", link.getExpiresAt());
        return data;
    }

    @Transactional
    public PublicLinkResponse update(String userId, String id, Map<String, Object> body) {
        PublicLink link = getOwnedLink(userId, id);
        if (body != null && body.containsKey("isActive")) {
            Object value = body.get("isActive");
            if (value instanceof Boolean bool) {
                link.setIsActive(bool);
            } else if (value != null) {
                link.setIsActive(Boolean.parseBoolean(value.toString()));
            }
        }
        return PublicLinkResponse.from(publicLinkRepository.save(link), false);
    }

    @Transactional
    public Map<String, Object> emailLink(String userId, String id, String email) {
        if (email == null || email.isBlank()) {
            throw new AppException("Email is required", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
        }

        PublicLink link = getOwnedLink(userId, id);
        User user = link.getCreatedBy();

        String resourceName;
        String resourceType;
        if (link.getFile() != null) {
            resourceName = link.getFile().getName();
            resourceType = "file";
        } else {
            resourceName = link.getFolder().getName();
            resourceType = "folder";
        }

        emailService.sendPublicLinkEmail(
                email.trim(),
                null,
                user.getName(),
                resourceName,
                resourceType,
                link.getToken()
        );

        Map<String, Object> result = new HashMap<>();
        result.put("emailSent", true);
        result.put("id", link.getId());
        return result;
    }

    @Transactional
    public Map<String, Boolean> delete(String userId, String id) {
        PublicLink link = getOwnedLink(userId, id);
        publicLinkRepository.delete(link);
        return Map.of("deleted", true);
    }

    private PublicLink getOwnedLink(String userId, String id) {
        PublicLink link = publicLinkRepository.findById(id)
                .orElseThrow(() -> new AppException("Public link not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));
        if (!link.getCreatedBy().getId().equals(userId)) {
            throw new AppException("Forbidden", HttpStatus.FORBIDDEN, "FORBIDDEN");
        }
        return link;
    }

    private LocalDateTime parseExpiresAt(Object raw) {
        if (raw == null) return null;
        String value = raw.toString().trim();
        if (value.isEmpty()) return null;
        try {
            if (value.length() == 16) {
                // datetime-local: yyyy-MM-ddTHH:mm
                return LocalDateTime.parse(value);
            }
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException e) {
            try {
                return LocalDateTime.parse(value.replace(" ", "T"));
            } catch (DateTimeParseException ex) {
                throw new AppException("Invalid expiresAt value", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
            }
        }
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }
}
