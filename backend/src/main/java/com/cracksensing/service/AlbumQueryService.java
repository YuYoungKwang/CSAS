package com.cracksensing.service;

import java.util.List;

import com.cracksensing.dto.AnalysisRecord;

import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch.core.GetResponse;
import org.opensearch.client.opensearch._types.FieldValue;
import org.opensearch.client.opensearch._types.SortOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AlbumQueryService {

    private static final Logger log = LoggerFactory.getLogger(AlbumQueryService.class);

    private final OpenSearchClient openSearchClient;
    private final String indexName;

    public AlbumQueryService(
            ObjectProvider<OpenSearchClient> openSearchClientProvider,
            @Value("${opensearch.index-name:crack-analysis-results}") String indexName
    ) {
        this.openSearchClient = openSearchClientProvider.getIfAvailable();
        this.indexName = indexName;
    }

    public AnalysisRecord findByObjectKey(String objectKey) {
        if (openSearchClient == null) {
            log.warn("OpenSearch is not configured. Album detail lookup is unavailable. objectKey={}", objectKey);
            return null;
        }

        try {
            GetResponse<AnalysisRecord> response = openSearchClient.get(
                    getRequest -> getRequest.index(indexName).id(objectKey),
                    AnalysisRecord.class
            );

            return response.found() ? response.source() : null;
        } catch (Exception exception) {
            log.error("Failed to fetch album detail from OpenSearch. objectKey={}, indexName={}", objectKey, indexName, exception);
            return null;
        }
    }

    public List<AnalysisRecord> findByUserId(String userId, int limit) {
        if (openSearchClient == null) {
            log.warn("OpenSearch is not configured. Album list lookup is unavailable. userId={}", userId);
            return List.of();
        }

        try {
            return openSearchClient.search(search -> search
                            .index(indexName)
                            .size(limit)
                            .query(query -> query.term(term -> term
                                    .field("userId")
                                    .value(FieldValue.of(userId))
                            ))
                            .sort(sort -> sort.field(field -> field
                                    .field("savedAt")
                                    .order(SortOrder.Desc)
                            )),
                    AnalysisRecord.class
            ).hits().hits().stream()
                    .map(hit -> hit.source())
                    .filter(record -> record != null)
                    .toList();
        } catch (Exception exception) {
            log.error("Failed to fetch album list from OpenSearch. userId={}, indexName={}", userId, indexName, exception);
            return List.of();
        }
    }
}
