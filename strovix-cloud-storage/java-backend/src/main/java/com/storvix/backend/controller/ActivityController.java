package com.storvix.backend.controller;

import com.storvix.backend.dto.ApiResponse;
import com.storvix.backend.dto.DashboardResponse;
import com.storvix.backend.security.CustomUserDetails;
import com.storvix.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final UserService userService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> dashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DashboardResponse dashboard = userService.getDashboard(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
