package com.cracksensing.dto;

import java.time.Instant;

public record AnalysisRecord(
        String objectKey,
        Instant savedAt,
        String objectUrl,
        String originalFileName,
        long fileSize
) {
}
