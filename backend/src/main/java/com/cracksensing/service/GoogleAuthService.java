package com.cracksensing.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.cracksensing.dto.GoogleLoginResponse;
import com.cracksensing.exception.GoogleAuthenticationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);
    private static final URI TOKEN_INFO_URI = URI.create("https://oauth2.googleapis.com/tokeninfo");

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String googleClientId;

    public GoogleAuthService(
            ObjectMapper objectMapper,
            @Value("${google.client-id:}") String googleClientId
    ) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
        this.googleClientId = googleClientId == null ? "" : googleClientId.trim();
    }

    public GoogleLoginResponse verifyCredential(String credential) {
        if (!StringUtils.hasText(credential)) {
            throw new GoogleAuthenticationException("Google credential is required.");
        }

        GoogleTokenInfo tokenInfo = fetchTokenInfo(credential);
        validateAudience(tokenInfo);

        if (!tokenInfo.emailVerified()) {
            throw new GoogleAuthenticationException("Google account email is not verified.");
        }

        return new GoogleLoginResponse(
                tokenInfo.sub(),
                tokenInfo.email(),
                tokenInfo.name(),
                tokenInfo.picture()
        );
    }

    private GoogleTokenInfo fetchTokenInfo(String credential) {
        try {
            String encodedCredential = URLEncoder.encode(credential, StandardCharsets.UTF_8);
            HttpRequest request = HttpRequest.newBuilder(
                    URI.create(TOKEN_INFO_URI + "?id_token=" + encodedCredential)
            ).GET().build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() != 200) {
                log.warn("Google token verification failed. statusCode={}, body={}", response.statusCode(), response.body());
                throw new GoogleAuthenticationException("Google login failed.");
            }

            return objectMapper.readValue(response.body(), GoogleTokenInfo.class);
        } catch (IOException exception) {
            throw new GoogleAuthenticationException("Failed to parse Google login response.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new GoogleAuthenticationException("Google login request was interrupted.", exception);
        }
    }

    private void validateAudience(GoogleTokenInfo tokenInfo) {
        if (!StringUtils.hasText(googleClientId)) {
            log.warn("GOOGLE_CLIENT_ID is not configured. Google token audience is not validated.");
            return;
        }

        if (!googleClientId.equals(tokenInfo.aud())) {
            throw new GoogleAuthenticationException("Google token audience does not match the configured client ID.");
        }
    }

    private record GoogleTokenInfo(
            String sub,
            String email,
            @JsonProperty("email_verified") boolean emailVerified,
            String name,
            String picture,
            String aud
    ) {
    }
}
