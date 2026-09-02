package com.storvix.backend.service;

import com.storvix.backend.dto.SearchItemResponse;
import com.storvix.backend.repository.FileRepository;
import com.storvix.backend.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;

    public Map<String, Object> search(String userId, String q, String type) {
        String query = q == null ? "" : q.trim();
        List<SearchItemResponse> items = new ArrayList<>();

        if (!query.isEmpty()) {
            boolean searchFiles = type == null || type.isBlank() || "file".equalsIgnoreCase(type) || "all".equalsIgnoreCase(type);
            boolean searchFolders = type == null || type.isBlank() || "folder".equalsIgnoreCase(type) || "all".equalsIgnoreCase(type);

            if (searchFiles) {
                fileRepository.findByOwner_IdAndIsDeletedFalseAndNameContainingIgnoreCase(userId, query).stream()
                        .filter(f -> "completed".equals(f.getUploadStatus()))
                        .map(SearchItemResponse::from)
                        .forEach(items::add);
            }

            if (searchFolders) {
                folderRepository.findByOwner_IdAndIsDeletedFalseAndNameContainingIgnoreCase(userId, query).stream()
                        .map(SearchItemResponse::from)
                        .forEach(items::add);
            }

            items.sort(Comparator.comparing(SearchItemResponse::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        return result;
    }
}
