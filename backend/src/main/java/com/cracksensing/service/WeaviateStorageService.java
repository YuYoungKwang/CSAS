package com.cracksensing.service;

import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.cracksensing.dto.AnalysisRecord;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class WeaviateStorageService {

    private static final Logger log = LoggerFactory.getLogger(WeaviateStorageService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String weaviateUrl;
    private final String apiKey;
    private final String collectionName;
    private boolean collectionChecked;

    public WeaviateStorageService(
            RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper,
            @Value("${weaviate.url:}") String weaviateUrl,
            @Value("${weaviate.api-key:}") String apiKey,
            @Value("${weaviate.collection:CrackAnalysis}") String collectionName
    ) {
        this.restTemplate = restTemplateBuilder.build();
        this.objectMapper = objectMapper;
        this.weaviateUrl = normalizeUrl(weaviateUrl);
        this.apiKey = apiKey;
        this.collectionName = collectionName;
    }

    public AnalysisRecord save(AnalysisRecord record) {
        if (!isConfigured()) {
            log.warn("Weaviate is not configured. Skipping analysis record storage. objectKey={}", record.objectKey());
            return record;
        }

        try {
            ensureCollection();
            restTemplate.postForEntity(
                    weaviateUrl + "/v1/objects",
                    new HttpEntity<>(createObjectBody(record), createHeaders()),
                    Map.class
            );
        } catch (RestClientException | JsonProcessingException exception) {
            log.error(
                    "Failed to save analysis record to Weaviate. objectKey={}, collectionName={}",
                    record.objectKey(),
                    collectionName,
                    exception
            );
        }

        return record;
    }

    public boolean deleteByObjectKey(String objectKey) {
        if (!isConfigured() || !StringUtils.hasText(objectKey)) {
            return false;
        }

        try {
            restTemplate.exchange(
                    weaviateUrl + "/v1/objects/" + collectionName + "/" + createObjectId(objectKey),
                    HttpMethod.DELETE,
                    new HttpEntity<>(createHeaders()),
                    Void.class
            );
            return true;
        } catch (RestClientException exception) {
            log.error("Failed to delete analysis record from Weaviate. objectKey={}, collectionName={}", objectKey, collectionName, exception);
            return false;
        }
    }

    private void ensureCollection() {
        if (collectionChecked) {
            return;
        }

        try {
            Map<?, ?> schema = restTemplate.exchange(
                    weaviateUrl + "/v1/schema/" + collectionName,
                    HttpMethod.GET,
                    new HttpEntity<>(createHeaders()),
                    Map.class
            ).getBody();
            ensureCollectionProperties(schema);
            collectionChecked = true;
        } catch (HttpClientErrorException exception) {
            if (exception.getStatusCode().value() != HttpStatus.NOT_FOUND.value()) {
                throw exception;
            }

            restTemplate.postForEntity(
                    weaviateUrl + "/v1/schema",
                    new HttpEntity<>(createCollectionBody(), createHeaders()),
                    Map.class
            );
            collectionChecked = true;
        }
    }

    private Map<String, Object> createCollectionBody() {
        return Map.of(
                "class", collectionName,
                "vectorizer", "none",
                "properties", List.of(
                        createTextProperty("objectKey", "field"),
                        createProperty("savedAt", "date"),
                        createProperty("objectUrl", "text"),
                        createProperty("originalFileName", "text"),
                        createProperty("fileSize", "int"),
                        createTextProperty("userId", "field"),
                        createProperty("latitude", "number"),
                        createProperty("longitude", "number"),
                        createProperty("aiAnalysisJson", "text"),
                        createProperty("defectFound", "boolean"),
                        createProperty("defectType", "text"),
                        createProperty("annotationCount", "int")
                )
        );
    }

    private void ensureCollectionProperties(Map<?, ?> schema) {
        if (schema == null) {
            return;
        }

        Set<String> existingProperties = new HashSet<>();
        Object properties = schema.get("properties");
        if (properties instanceof List<?> propertyList) {
            for (Object property : propertyList) {
                if (property instanceof Map<?, ?> propertyMap && propertyMap.get("name") instanceof String name) {
                    existingProperties.add(name);
                }
            }
        }

        addPropertyIfMissing(existingProperties, createProperty("latitude", "number"));
        addPropertyIfMissing(existingProperties, createProperty("longitude", "number"));
    }

    private void addPropertyIfMissing(Set<String> existingProperties, Map<String, Object> property) {
        String propertyName = (String) property.get("name");
        if (existingProperties.contains(propertyName)) {
            return;
        }

        restTemplate.postForEntity(
                weaviateUrl + "/v1/schema/" + collectionName + "/properties",
                new HttpEntity<>(property, createHeaders()),
                Map.class
        );
        existingProperties.add(propertyName);
    }

    private Map<String, Object> createProperty(String name, String dataType) {
        return Map.of(
                "name", name,
                "dataType", List.of(dataType)
        );
    }

    private Map<String, Object> createTextProperty(String name, String tokenization) {
        return Map.of(
                "name", name,
                "dataType", List.of("text"),
                "tokenization", tokenization
        );
    }

    private Map<String, Object> createObjectBody(AnalysisRecord record) throws JsonProcessingException {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("objectKey", record.objectKey());
        properties.put("savedAt", record.savedAt().toString());
        properties.put("objectUrl", record.objectUrl());
        properties.put("originalFileName", record.originalFileName());
        properties.put("fileSize", record.fileSize());
        properties.put("userId", record.userId());
        if (record.latitude() != null) {
            properties.put("latitude", record.latitude());
        }
        if (record.longitude() != null) {
            properties.put("longitude", record.longitude());
        }
        properties.put("aiAnalysisJson", record.aiAnalysis() == null ? "" : objectMapper.writeValueAsString(record.aiAnalysis()));
        properties.put("defectFound", AnalysisRecordSupport.getDefectFound(record.aiAnalysis()));
        properties.put("defectType", AnalysisRecordSupport.getDefectType(record.aiAnalysis()));
        properties.put("annotationCount", AnalysisRecordSupport.getAnnotationCount(record.aiAnalysis()));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("class", collectionName);
        body.put("id", createObjectId(record.objectKey()));
        body.put("properties", properties);
        return body;
    }

    private String createObjectId(String objectKey) {
        return UUID.nameUUIDFromBytes(objectKey.getBytes(StandardCharsets.UTF_8)).toString();
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
}
