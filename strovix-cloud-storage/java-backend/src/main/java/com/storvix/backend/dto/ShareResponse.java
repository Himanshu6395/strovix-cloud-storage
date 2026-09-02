package com.storvix.backend.dto;

import com.storvix.backend.entity.Share;
import com.storvix.backend.entity.ShareInvite;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
public class ShareResponse {
    private String id;
    private String _id;
    private String role;
    private Boolean pending;
    private String kind;
    private String email;
    private LocalDateTime createdAt;
    private Object sharedWith;
    private Object owner;
    private FileResponse file;
    private FolderResponse folder;

    public static ShareResponse from(Share share) {
        Map<String, Object> sharedWith = new HashMap<>();
        if (share.getSharedWith() != null) {
            sharedWith.put("name", share.getSharedWith().getName());
            sharedWith.put("email", share.getSharedWith().getEmail());
        }

        Map<String, Object> owner = new HashMap<>();
        if (share.getOwner() != null) {
            owner.put("name", share.getOwner().getName());
            owner.put("email", share.getOwner().getEmail());
        }

        return ShareResponse.builder()
                .pending(false)
                .kind("share")
                .id(share.getId())
                ._id(share.getId())
                .role(share.getRole())
                .createdAt(share.getCreatedAt())
                .sharedWith(sharedWith)
                .owner(owner)
                .file(share.getFile() != null ? FileResponse.from(share.getFile()) : null)
                .folder(share.getFolder() != null ? FolderResponse.from(share.getFolder()) : null)
                .build();
    }

    public static ShareResponse from(ShareInvite invite) {
        return ShareResponse.builder()
                .pending(true)
                .kind("invite")
                .id(invite.getId())
                ._id(invite.getId())
                .role(invite.getRole())
                .email(invite.getEmail())
                .createdAt(invite.getCreatedAt())
                .sharedWith(Map.of(
                        "name", invite.getEmail(),
                        "email", invite.getEmail()
                ))
                .file(invite.getFile() != null ? FileResponse.from(invite.getFile()) : null)
                .folder(invite.getFolder() != null ? FolderResponse.from(invite.getFolder()) : null)
                .build();
    }
}
