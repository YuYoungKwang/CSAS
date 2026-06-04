package com.cracksensing.service;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

@Service
public class S3PresignedUrlService {

    private static final Logger log = LoggerFactory.getLogger(S3PresignedUrlService.class);
    private static final Duration DEFAULT_EXPIRATION = Duration.ofMinutes(10);

    private final S3Presigner s3Presigner;
    private final String bucketName;

    public S3PresignedUrlService(
            S3Presigner s3Presigner,
            @Value("${s3.bucket-name}") String bucketName
    ) {
        this.s3Presigner = s3Presigner;
        this.bucketName = bucketName;
    }

    public String createReadUrl(String objectKey) {
        if (!StringUtils.hasText(objectKey)) {
            return null;
        }

        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(DEFAULT_EXPIRATION)
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();
        } catch (Exception exception) {
            log.warn("Failed to create S3 presigned URL. objectKey={}, bucketName={}", objectKey, bucketName, exception);
            return null;
        }
    }
}
