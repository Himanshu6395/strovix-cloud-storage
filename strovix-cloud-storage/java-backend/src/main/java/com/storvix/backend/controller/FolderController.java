package com.storvix.backend.controller;

import com.storvix.backend.dto.ApiResponse;
import com.storvix.backend.dto.CreateFolderRequest;
import com.storvix.backend.dto.FolderContentsResponse;
import com.storvix.backend.dto.FolderResponse;
import com.storvix.backend.entity.Folder;
import com.storvix.backend.security.CustomUserDetails;
import com.storvix.backend.service.FolderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @PostMapping
    public ResponseEntity<ApiResponse<FolderResponse>> createFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateFolderRequest request) {
        Folder folder = folderService.createFolder(userDetails.getUser().getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Folder created", FolderResponse.from(folder)));
    }

    @GetMapping({"", "/{id}/contents"})
    public ResponseEntity<ApiResponse<FolderContentsResponse>> getFolderContents(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable(required = false) String id) {
        String folderId = (id == null || id.isBlank() || "root".equalsIgnoreCase(id)) ? null : id;
        FolderContentsResponse contents = folderService.getFolderContents(userDetails.getUser().getId(), folderId);
        return ResponseEntity.ok(ApiResponse.success(contents));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<FolderResponse>> renameFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        FolderResponse folder = folderService.renameFolder(userDetails.getUser().getId(), id, body.get("name"));
        return ResponseEntity.ok(ApiResponse.success("Folder renamed", folder));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<FolderResponse>> softDeleteFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        FolderResponse folder = folderService.softDeleteFolder(userDetails.getUser().getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Folder moved to trash", folder));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<FolderResponse>> restoreFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        FolderResponse folder = folderService.restoreFolder(userDetails.getUser().getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Folder restored", folder));
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> permanentDeleteFolder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        Map<String, Boolean> result = folderService.permanentDeleteFolder(userDetails.getUser().getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Folder permanently deleted", result));
    }
}
