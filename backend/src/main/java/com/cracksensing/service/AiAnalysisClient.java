package com.cracksensing.service;

import com.cracksensing.dto.AiAnalysisRequest;
import com.cracksensing.dto.AiAnalysisResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class AiAnalysisClient {

    private static final Logger log = LoggerFactory.getLogger(AiAnalysisClient.class);

    private final RestTemplate restTemplate;
    private final String aiBaseUrl;
    private final String analyzePath;

    public AiAnalysisClient(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${ai.base-url:}") String aiBaseUrl,
            @Value("${ai.analyze-path:/api/analyze}") String analyzePath
    ) {
        this.restTemplate = restTemplateBuilder.build();
        this.aiBaseUrl = aiBaseUrl;
        this.analyzePath = analyzePath;
    }

    public AiAnalysisResponse analyze(String objectKey) {
        if (aiBaseUrl == null || aiBaseUrl.isBlank()) {
            log.warn("AI server is not configured. Skipping AI analysis request. objectKey={}", objectKey);
            return null;
        }

        try {
            ResponseEntity<AiAnalysisResponse> response = restTemplate.postForEntity(
                    aiBaseUrl + analyzePath,
                    new AiAnalysisRequest(objectKey),
                    AiAnalysisResponse.class
            );
            return response.getBody();
        } catch (RestClientException exception) {
            log.error("Failed to request AI analysis. objectKey={}, aiBaseUrl={}, analyzePath={}",
                    objectKey,
                    aiBaseUrl,
                    analyzePath,
                    exception);
            return null;
        }
    }
}
