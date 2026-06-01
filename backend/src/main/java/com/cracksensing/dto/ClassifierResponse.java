package com.cracksensing.dto;

public record ClassifierResponse(
        String imageId,
        int cracked,
        int crackType,
        java.util.List<java.util.List<Integer>> crackPos
) {
}
