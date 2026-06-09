package com.cracksensing.service;

import com.cracksensing.dto.AiAnalysisResponse;
import com.cracksensing.dto.AiAnnotation;

public final class AnalysisRecordSupport {

    private AnalysisRecordSupport() {
    }

    public static boolean getDefectFound(AiAnalysisResponse aiAnalysis) {
        return aiAnalysis != null && Boolean.TRUE.equals(aiAnalysis.defectFound());
    }

    public static String getDefectType(AiAnalysisResponse aiAnalysis) {
        if (aiAnalysis == null || aiAnalysis.annotations() == null || aiAnalysis.annotations().isEmpty()) {
            return "SAFE";
        }

        AiAnnotation firstAnnotation = aiAnalysis.annotations().get(0);
        return firstAnnotation != null && firstAnnotation.className() != null ? firstAnnotation.className() : "SAFE";
    }

    public static int getAnnotationCount(AiAnalysisResponse aiAnalysis) {
        return aiAnalysis == null || aiAnalysis.annotations() == null ? 0 : aiAnalysis.annotations().size();
    }
}
