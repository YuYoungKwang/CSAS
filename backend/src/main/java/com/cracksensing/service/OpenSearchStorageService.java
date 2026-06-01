package com.cracksensing.service;

import com.cracksensing.dto.AnalysisRecord;
import com.cracksensing.exception.OpenSearchStorageException;

import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch.core.IndexResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OpenSearchStorageService {

    private final OpenSearchClient openSearchClient;
    private final String indexName;

    public OpenSearchStorageService(
            ObjectProvider<OpenSearchClient> openSearchClientProvider,
            @Value("${opensearch.index-name:crack-analysis-results}") String indexName
    ) {
        this.openSearchClient = openSearchClientProvider.getIfAvailable();
        this.indexName = indexName;
    }

    public AnalysisRecord save(AnalysisRecord record) {
        if (openSearchClient == null) {
            throw new OpenSearchStorageException("OpenSearch is not configured.");
        }

        try {
            openSearchClient.index(index -> index
                    .index(indexName)
                    .id(record.imageId())
                    .document(record)
            );
            return record;
        } catch (Exception exception) {
            throw new OpenSearchStorageException("Failed to save analysis record to OpenSearch.", exception);
        }
    }
}
