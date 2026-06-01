package com.cracksensing.dto;

public record ImageUploadResponse(
        String objectKey,
        String objectUrl,
        String fileName,
        long fileSize
) {
}
