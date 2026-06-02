package com.cracksensing.service;

import com.cracksensing.dto.AnalysisRecord;

import org.opensearch.client.opensearch.OpenSearchClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OpenSearchStorageService {

    private static final Logger log = LoggerFactory.getLogger(OpenSearchStorageService.class);

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
            log.warn(
                    "OpenSearch is not configured. Skipping analysis record storage and returning S3 upload result only. objectKey={}",
                    record.objectKey()
            );
            return record;
        }

        try {
            openSearchClient.index(index -> index
                    .index(indexName)
                    .id(record.objectKey())
                    .document(record)
            );
            return record;
        } catch (Exception exception) {
            log.error(
                    "Failed to save analysis record to OpenSearch. objectKey={}, indexName={}",
                    record.objectKey(),
                    indexName,
                    exception
            );
            return record;
        }
    }
}
