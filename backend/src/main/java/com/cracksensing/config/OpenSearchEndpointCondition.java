package com.cracksensing.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.core.env.Environment;

public class OpenSearchEndpointCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment environment = context.getEnvironment();
        String endpoint = environment.getProperty("opensearch.endpoint");
        String region = environment.getProperty("opensearch.region");

        return hasText(endpoint) && hasText(region);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
