package com.storvix.backend.controller;

import com.storvix.backend.dto.ApiResponse;
import com.storvix.backend.dto.PublicLinkResponse;
import com.storvix.backend.security.CustomUserDetails;
import com.storvix.backend.service.PublicLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public-links")
@RequiredArgsConstructor
public class PublicLinkController {

    private final PublicLinkService publicLinkService;

    @PostMapping
    public ResponseEntity<ApiResponse<PublicLinkResponse>> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        PublicLinkResponse link = publicLinkService.create(userDetails.getUser().getId(), body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Public link created", link));
    }

    @GetMapping("/{token}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getByToken(
            @PathVariable String token,
            @RequestHeader(value = "X-Public-Link-Password", required = false) String password) {
        Map<String, Object> data = publicLinkService.getByToken(token, password);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PatchMapping("/manage/{id}")
    public ResponseEntity<ApiResponse<PublicLinkResponse>> update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        PublicLinkResponse link = publicLinkService.update(userDetails.getUser().getId(), id, body);
        return ResponseEntity.ok(ApiResponse.success("Public link updated", link));
    }

    @PostMapping("/manage/{id}/email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> emailLink(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        Map<String, Object> result = publicLinkService.emailLink(
                userDetails.getUser().getId(),
                id,
                body != null ? body.get("email") : null
        );
        return ResponseEntity.ok(ApiResponse.success("Email sent", result));
    }

    @DeleteMapping("/manage/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> delete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        Map<String, Boolean> result = publicLinkService.delete(userDetails.getUser().getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Public link deleted", result));
    }
}
