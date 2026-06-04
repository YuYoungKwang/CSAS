package com.cracksensing.service;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.cracksensing.dto.AiAnalysisResponse;

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

    public AiAnalysisResponse analyze(MultipartFile file) {
        if (aiBaseUrl == null || aiBaseUrl.isBlank()) {
            log.warn("AI server is not configured. Skipping AI analysis request. originalFileName={}", file != null ? file.getOriginalFilename() : null);
            return null;
        }

        try {
            ResponseEntity<AiAnalysisResponse> response = restTemplate.postForEntity(
                    aiBaseUrl + analyzePath,
                    createMultipartRequest(file),
                    AiAnalysisResponse.class
            );
            return response.getBody();
        } catch (RestClientException | IOException exception) {
            log.error("Failed to request AI analysis. originalFileName={}, aiBaseUrl={}, analyzePath={}",
                    file != null ? file.getOriginalFilename() : null,
                    aiBaseUrl,
                    analyzePath,
                    exception);
            return null;
        }
    }

    private HttpEntity<MultiValueMap<String, Object>> createMultipartRequest(MultipartFile file) throws IOException {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        HttpHeaders fileHeaders = new HttpHeaders();
        if (file.getContentType() != null) {
            fileHeaders.setContentType(MediaType.parseMediaType(file.getContentType()));
        }

        body.add("file", new HttpEntity<>(resource, fileHeaders));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        return new HttpEntity<>(body, headers);
    }
}
