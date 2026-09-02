package com.storvix.backend.controller;

import com.storvix.backend.dto.ApiResponse;
import com.storvix.backend.dto.StarResponse;
import com.storvix.backend.security.CustomUserDetails;
import com.storvix.backend.service.StarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stars")
@RequiredArgsConstructor
public class StarController {

    private final StarService starService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StarResponse>>> listStars(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<StarResponse> stars = starService.listStars(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(stars));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StarResponse>> createStar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        StarResponse star = starService.createStar(userDetails.getUser().getId(), body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Starred", star));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> removeStar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        Map<String, Boolean> result = starService.removeStar(userDetails.getUser().getId(), body);
        return ResponseEntity.ok(ApiResponse.success("Unstarred", result));
    }
}
