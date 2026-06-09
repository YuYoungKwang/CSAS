package com.cracksensing.dto;

import java.time.Instant;

public record AlbumSummaryResponse(
        String objectKey,
        Instant savedAt,
        String objectUrl,
        String originalFileName,
        String userId,
        Double latitude,
        Double longitude,
        boolean defectFound,
        String defectType,
        int annotationCount
) {
}
