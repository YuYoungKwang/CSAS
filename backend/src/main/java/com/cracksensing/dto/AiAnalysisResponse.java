package com.cracksensing.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiAnalysisResponse(
        String status,
        String message,
        @JsonProperty("defect_found") Boolean defectFound,
        List<AiAnnotation> annotations
) {
}
