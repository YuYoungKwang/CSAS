package com.cracksensing.dto;

import java.time.Instant;

public record AlbumDetailResponse(
        String objectKey,
        Instant savedAt,
        String objectUrl,
        String originalFileName,
        long fileSize,
        String userId,
        AiAnalysisResponse aiAnalysis,
        boolean defectFound,
        String defectType,
        int annotationCount
) {
}
