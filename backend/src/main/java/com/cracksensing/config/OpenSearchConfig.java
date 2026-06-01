package com.cracksensing.config;

import java.net.URI;

import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.transport.aws.AwsSdk2Transport;
import org.opensearch.client.transport.aws.AwsSdk2TransportOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Conditional;

import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.http.SdkHttpClient;
import software.amazon.awssdk.regions.Region;

@Configuration
public class OpenSearchConfig {

    @Bean
    @Conditional(OpenSearchEndpointCondition.class)
    public SdkHttpClient openSearchHttpClient() {
        return ApacheHttpClient.builder().build();
    }

    @Bean
    @Conditional(OpenSearchEndpointCondition.class)
    public OpenSearchClient openSearchClient(
            SdkHttpClient openSearchHttpClient,
            @Value("${opensearch.endpoint}") String endpoint,
            @Value("${opensearch.region}") String region,
            @Value("${opensearch.service:es}") String service
    ) {
        String normalizedEndpoint = normalizeEndpoint(endpoint);

        return new OpenSearchClient(
                new AwsSdk2Transport(
                        openSearchHttpClient,
                        normalizedEndpoint,
                        service,
                        Region.of(region),
                        AwsSdk2TransportOptions.builder().build()
                )
        );
    }

    private String normalizeEndpoint(String endpoint) {
        URI uri = URI.create(endpoint);
        if (uri.getScheme() == null) {
            return endpoint;
        }

        return uri.getHost() != null ? uri.getHost() : endpoint.replaceFirst("^https?://", "");
    }
}
