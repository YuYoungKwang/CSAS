package com.cracksensing.dto;

import java.util.List;

public record AiAnnotation(
        int classId,
        String className,
        List<List<Integer>> points
) {
}
