package com.cracksensing.dto;

import java.time.Instant;
import java.util.List;

public record AnalysisRecord(
        String imageId,
        String userId,
        Instant savedAt,
        String objectUrl,
        int cracked,
        int crackType,
        List<List<Integer>> crackPos
) {
}
