package com.cracksensing.dto;

public record ImageUploadResponse(
        String objectKey,
        String fileName,
        long fileSize
) {
}
