package com.cracksensing.dto;

public record GoogleLoginResponse(
        String userId,
        String email,
        String name,
        String picture
) {
}
