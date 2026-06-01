package com.cracksensing.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.cracksensing.dto.AnalysisRecord;
import com.cracksensing.exception.InvalidImageFileException;
import com.cracksensing.exception.S3UploadException;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
public class S3UploadService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");
    private static final Map<String, String> ALLOWED_CONTENT_TYPES_BY_EXTENSION = Map.of(
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "png", "image/png"
    );
    private static final DateTimeFormatter DATE_PATH_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private static final ZoneId SEOUL_ZONE = ZoneId.of("Asia/Seoul");

    private final S3Client s3Client;
    private final OpenSearchStorageService openSearchStorageService;
    private final String bucketName;
    private final String awsRegion;

    public S3UploadService(
            S3Client s3Client,
            OpenSearchStorageService openSearchStorageService,
            @Value("${s3.bucket-name}") String bucketName,
            @Value("${aws.region}") String awsRegion
    ) {
        this.s3Client = s3Client;
        this.openSearchStorageService = openSearchStorageService;
        this.bucketName = bucketName;
        this.awsRegion = awsRegion;
    }

    public AnalysisRecord uploadImage(MultipartFile file) {
        validateFile(file);

        String originalFileName = file.getOriginalFilename();
        String extension = getExtension(originalFileName);
        String objectKey = createObjectKey(extension);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

        try {
            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (S3Exception | IOException exception) {
            throw new S3UploadException("Failed to upload image to S3.", exception);
        }

        String objectUrl = createObjectUrl(objectKey);
        AnalysisRecord analysisRecord = new AnalysisRecord(
                objectKey,
                Instant.now(),
                objectUrl,
                originalFileName,
                file.getSize()
        );
        return openSearchStorageService.save(analysisRecord);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidImageFileException("Image file is required.");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new InvalidImageFileException("Only jpg, jpeg, and png images are allowed.");
        }

        String contentType = file.getContentType();
        String allowedContentType = ALLOWED_CONTENT_TYPES_BY_EXTENSION.get(extension);
        if (!StringUtils.hasText(contentType) || !allowedContentType.equalsIgnoreCase(contentType)) {
            throw new InvalidImageFileException("File extension and content type do not match.");
        }
    }

    private String createObjectKey(String extension) {
        String datePath = LocalDate.now(SEOUL_ZONE).format(DATE_PATH_FORMATTER);
        return "images/%s/%s.%s".formatted(datePath, UUID.randomUUID(), extension);
    }

    private String createObjectUrl(String objectKey) {
        if ("us-east-1".equalsIgnoreCase(awsRegion)) {
            return "https://%s.s3.amazonaws.com/%s".formatted(bucketName, objectKey);
        }

        return "https://%s.s3.%s.amazonaws.com/%s".formatted(bucketName, awsRegion, objectKey);
    }

    private String getExtension(String fileName) {
        String extension = StringUtils.getFilenameExtension(fileName);
        if (!StringUtils.hasText(extension)) {
            throw new InvalidImageFileException("Image file extension is required.");
        }

        return extension.toLowerCase(Locale.ROOT);
    }
}
