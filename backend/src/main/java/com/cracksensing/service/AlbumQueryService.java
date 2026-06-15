package com.cracksensing.service;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.cracksensing.dto.AiAnalysisResponse;
import com.cracksensing.dto.AlbumDetailResponse;
import com.cracksensing.dto.AlbumSummaryResponse;
import com.cracksensing.dto.AnalysisRecord;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class AlbumQueryService {

    private static final Logger log = LoggerFactory.getLogger(AlbumQueryService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final S3PresignedUrlService s3PresignedUrlService;
    private final String weaviateUrl;
    private final String apiKey;
    private final String collectionName;

    public AlbumQueryService(
            RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper,
            S3PresignedUrlService s3PresignedUrlService,
            @Value("${weaviate.url:}") String weaviateUrl,
            @Value("${weaviate.api-key:}") String apiKey,
            @Value("${weaviate.collection:CrackAnalysis}") String collectionName
    ) {
        this.restTemplate = restTemplateBuilder.build();
        this.objectMapper = objectMapper;
        this.s3PresignedUrlService = s3PresignedUrlService;
        this.weaviateUrl = normalizeUrl(weaviateUrl);
        this.apiKey = apiKey;
        this.collectionName = collectionName;
    }

    public AlbumDetailResponse findByObjectKey(String objectKey) {
        if (!isConfigured()) {
            log.warn("Weaviate is not configured. Album detail lookup is unavailable. objectKey={}", objectKey);
            return null;
        }

        String query = """
                {
                  Get {
                    %s(
                      where: {path: ["objectKey"], operator: Equal, valueText: "%s"}
                      limit: 1
                    ) {
                      objectKey
                      savedAt
                      objectUrl
                      originalFileName
                      fileSize
                      userId
                      latitude
                      longitude
                      aiAnalysisJson
                      defectFound
                      defectType
                      annotationCount
                    }
                  }
                }
                """.formatted(collectionName, escapeGraphqlString(objectKey));

        List<AnalysisRecord> records = executeQuery(query);
        return records.isEmpty() ? null : toDetailResponse(records.get(0));
    }

    public List<AlbumSummaryResponse> findByUserId(String userId, int limit) {
        if (!isConfigured()) {
            log.warn("Weaviate is not configured. Album list lookup is unavailable. userId={}", userId);
            return List.of();
        }

        String query = """
                {
                  Get {
                    %s(
                      where: {path: ["userId"], operator: Equal, valueText: "%s"}
                      sort: [{path: ["savedAt"], order: desc}]
                      limit: %d
                    ) {
                      objectKey
                      savedAt
                      objectUrl
                      originalFileName
                      fileSize
                      userId
                      latitude
                      longitude
                      aiAnalysisJson
                      defectFound
                      defectType
                      annotationCount
                    }
                  }
                }
                """.formatted(collectionName, escapeGraphqlString(userId), limit);

        return executeQuery(query).stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    private List<AnalysisRecord> executeQuery(String query) {
        try {
            JsonNode response = restTemplate.postForObject(
                    weaviateUrl + "/v1/graphql",
                    new HttpEntity<>(Map.of("query", query), createHeaders()),
                    JsonNode.class
            );

            if (response == null) {
                return List.of();
            }

            JsonNode errors = response.path("errors");
            if (errors.isArray() && !errors.isEmpty()) {
                log.error("Weaviate GraphQL query failed. errors={}", errors);
                return List.of();
            }

            JsonNode items = response.path("data").path("Get").path(collectionName);
            if (!items.isArray()) {
                return List.of();
            }

            List<AnalysisRecord> records = new ArrayList<>();
            items.forEach(item -> records.add(toAnalysisRecord(item)));
            return records;
        } catch (RestClientException exception) {
            log.error("Failed to fetch album records from Weaviate. collectionName={}", collectionName, exception);
            return List.of();
        }
    }

    private AnalysisRecord toAnalysisRecord(JsonNode node) {
        String aiAnalysisJson = getText(node, "aiAnalysisJson");
        return new AnalysisRecord(
                getText(node, "objectKey"),
                parseInstant(getText(node, "savedAt")),
                getText(node, "objectUrl"),
                getText(node, "originalFileName"),
                node.path("fileSize").asLong(),
                getText(node, "userId"),
                getNullableDouble(node, "latitude"),
                getNullableDouble(node, "longitude"),
                parseAiAnalysis(aiAnalysisJson)
        );
    }

    private AlbumSummaryResponse toSummaryResponse(AnalysisRecord record) {
        AiAnalysisResponse aiAnalysis = record.aiAnalysis();

        return new AlbumSummaryResponse(
                record.objectKey(),
                record.savedAt(),
                createPresignedUrl(record),
                record.originalFileName(),
                record.userId(),
                record.latitude(),
                record.longitude(),
                aiAnalysis,
                AnalysisRecordSupport.getDefectFound(aiAnalysis),
                AnalysisRecordSupport.getDefectType(aiAnalysis),
                AnalysisRecordSupport.getAnnotationCount(aiAnalysis)
        );
    }

    private AlbumDetailResponse toDetailResponse(AnalysisRecord record) {
        AiAnalysisResponse aiAnalysis = record.aiAnalysis();

        return new AlbumDetailResponse(
                record.objectKey(),
                record.savedAt(),
                createPresignedUrl(record),
                record.originalFileName(),
                record.fileSize(),
                record.userId(),
                record.latitude(),
                record.longitude(),
                aiAnalysis,
                AnalysisRecordSupport.getDefectFound(aiAnalysis),
                AnalysisRecordSupport.getDefectType(aiAnalysis),
                AnalysisRecordSupport.getAnnotationCount(aiAnalysis)
        );
    }

    private AiAnalysisResponse parseAiAnalysis(String aiAnalysisJson) {
        if (!StringUtils.hasText(aiAnalysisJson)) {
            return null;
        }

        try {
            return objectMapper.readValue(aiAnalysisJson, AiAnalysisResponse.class);
        } catch (JsonProcessingException exception) {
            log.warn("Failed to parse AI analysis JSON from Weaviate. aiAnalysisJson={}", aiAnalysisJson, exception);
            return null;
        }
    }

    private Instant parseInstant(String value) {
        if (!StringUtils.hasText(value)) {
            return Instant.EPOCH;
        }

        try {
            return Instant.parse(value);
        } catch (DateTimeParseException exception) {
            log.warn("Invalid savedAt value from Weaviate. savedAt={}", value, exception);
            return Instant.EPOCH;
        }
    }

    private String getText(JsonNode node, String fieldName) {
        JsonNode value = node.path(fieldName);
        return value.isMissingNode() || value.isNull() ? "" : value.asText();
    }

    private Double getNullableDouble(JsonNode node, String fieldName) {
        JsonNode value = node.path(fieldName);
        return value.isMissingNode() || value.isNull() ? null : value.asDouble();
    }

    private String createPresignedUrl(AnalysisRecord record) {
        String presignedUrl = s3PresignedUrlService.createReadUrl(record.objectKey());
        return presignedUrl != null ? presignedUrl : record.objectUrl();
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (StringUtils.hasText(apiKey)) {
            headers.setBearerAuth(apiKey);
        }
        return headers;
    }

    private boolean isConfigured() {
        return StringUtils.hasText(weaviateUrl) && StringUtils.hasText(collectionName);
    }

    private String normalizeUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return "";
        }

        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private String escapeGraphqlString(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
