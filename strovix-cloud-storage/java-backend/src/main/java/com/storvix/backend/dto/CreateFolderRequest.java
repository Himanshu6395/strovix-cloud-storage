package com.storvix.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateFolderRequest {
    @NotBlank(message = "Folder name is required")
    private String name;

    @JsonAlias("parentFolder")
    private String parentFolderId;
}
