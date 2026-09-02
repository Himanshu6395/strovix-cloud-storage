package com.storvix.backend.controller;

import com.storvix.backend.dto.ApiResponse;
import com.storvix.backend.dto.StorageResponse;
import com.storvix.backend.dto.UpdateProfileRequest;
import com.storvix.backend.dto.UserResponse;
import com.storvix.backend.security.CustomUserDetails;
import com.storvix.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me/storage")
    public ResponseEntity<ApiResponse<StorageResponse>> getStorage(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        StorageResponse storage = userService.getStorage(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(storage));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse updated = userService.updateProfile(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updated));
    }
}
