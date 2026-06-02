package com.cracksensing.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiAnnotation(
        @JsonProperty("class_id") int classId,
        @JsonProperty("class_name") String className,
        List<List<Integer>> points
) {
}
