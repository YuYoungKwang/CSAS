package com.cracksensing.dto;

import java.util.List;

public record AiAnalysisResponse(
        String status,
        String message,
        Boolean defectFound,
        List<AiAnnotation> annotations
) {
}
