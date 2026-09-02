package com.storvix.backend.controller;

import com.storvix.backend.dto.ApiResponse;
import com.storvix.backend.dto.FileResponse;
import com.storvix.backend.dto.InitUploadRequest;
import com.storvix.backend.security.CustomUserDetails;
import com.storvix.backend.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/init-upload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initUpload(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody InitUploadRequest request) {
        Map<String, Object> data = fileService.initUpload(userDetails.getUser().getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Upload initialized", data));
    }

    @PostMapping("/complete-upload")
    public ResponseEntity<ApiResponse<FileResponse>> completeUpload(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String fileId = body.get("fileId");
        FileResponse file = fileService.completeUpload(userDetails.getUser().getId(), fileId);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", file));
    }

    @GetMapping({"/{id}", "/{id}/download"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDownloadUrl(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        Map<String, String> data = fileService.getDownloadUrl(userDetails.getUser().getId(), id);
        // Frontend expects downloadUrl; keep url for compatibility
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("downloadUrl", data.get("url"));
        body.put("url", data.get("url"));
        return ResponseEntity.ok(ApiResponse.success(body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<FileResponse>> softDeleteFile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        FileResponse file = fileService.softDeleteFile(userDetails.getUser().getId(), id);
        return ResponseEntity.ok(ApiResponse.success("File moved to trash", file));
    }
}
