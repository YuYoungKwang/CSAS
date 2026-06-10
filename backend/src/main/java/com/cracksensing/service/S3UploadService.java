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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cracksensing.dto.AnalysisRecord;
import com.cracksensing.dto.AiAnalysisResponse;
import com.cracksensing.exception.InvalidImageFileException;
import com.cracksensing.exception.S3UploadException;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
public class S3UploadService {

    private static final Logger log = LoggerFactory.getLogger(S3UploadService.class);
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");
    private static final Map<String, String> ALLOWED_CONTENT_TYPES_BY_EXTENSION = Map.of(
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "png", "image/png"
    );
    private static final DateTimeFormatter DATE_PATH_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private static final ZoneId SEOUL_ZONE = ZoneId.of("Asia/Seoul");

    private final S3Client s3Client;
    private final AiAnalysisClient aiAnalysisClient;
    private final WeaviateStorageService weaviateStorageService;
    private final S3PresignedUrlService s3PresignedUrlService;
    private final String bucketName;
    private final String awsRegion;

    public S3UploadService(
            S3Client s3Client,
            AiAnalysisClient aiAnalysisClient,
            WeaviateStorageService weaviateStorageService,
            S3PresignedUrlService s3PresignedUrlService,
            @Value("${s3.bucket-name}") String bucketName,
            @Value("${aws.region}") String awsRegion
    ) {
        this.s3Client = s3Client;
        this.aiAnalysisClient = aiAnalysisClient;
        this.weaviateStorageService = weaviateStorageService;
        this.s3PresignedUrlService = s3PresignedUrlService;
        this.bucketName = bucketName;
        this.awsRegion = awsRegion;
    }

    public AnalysisRecord uploadImage(MultipartFile file) {
        return uploadImage(file, "demo-user-001", null, null);
    }

    public AnalysisRecord uploadImage(MultipartFile file, String userId) {
        return uploadImage(file, userId, null, null);
    }

    public AnalysisRecord uploadImage(MultipartFile file, String userId, Double latitude, Double longitude) {
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
            log.error(
                    "Image upload failed while saving to S3. originalFileName={}, contentType={}, size={}, bucket={}, objectKey={}",
                    originalFileName,
                    file.getContentType(),
                    file.getSize(),
                    bucketName,
                    objectKey,
                    exception
            );
            throw new S3UploadException("Failed to upload image to S3.", exception);
        }

        String objectUrl = createObjectUrl(objectKey);
        AiAnalysisResponse aiAnalysis = aiAnalysisClient.analyze(file);
        AnalysisRecord analysisRecord = new AnalysisRecord(
                objectKey,
                Instant.now(),
                objectUrl,
                originalFileName,
                file.getSize(),
                userId,
                latitude,
                longitude,
                aiAnalysis
        );
        AnalysisRecord storedRecord = weaviateStorageService.save(analysisRecord);

        return withPresignedUrl(storedRecord);
    }

    public boolean deleteImage(String objectKey) {
        if (!StringUtils.hasText(objectKey)) {
            return false;
        }

        try {
            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .build()
            );
            return true;
        } catch (S3Exception exception) {
            log.error("Failed to delete image from S3. bucket={}, objectKey={}", bucketName, objectKey, exception);
            return false;
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            log.warn("Image upload rejected: file is missing or empty.");
            throw new InvalidImageFileException("Image file is required.");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            log.warn(
                    "Image upload rejected: unsupported file extension. originalFileName={}, extension={}, allowedExtensions={}",
                    file.getOriginalFilename(),
                    extension,
                    ALLOWED_EXTENSIONS
            );
            throw new InvalidImageFileException("Only jpg, jpeg, and png images are allowed.");
        }

        String contentType = file.getContentType();
        String allowedContentType = ALLOWED_CONTENT_TYPES_BY_EXTENSION.get(extension);
        if (!StringUtils.hasText(contentType) || !allowedContentType.equalsIgnoreCase(contentType)) {
            log.warn(
                    "Image upload rejected: extension and content type do not match. originalFileName={}, extension={}, contentType={}, expectedContentType={}",
                    file.getOriginalFilename(),
                    extension,
                    contentType,
                    allowedContentType
            );
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

    private AnalysisRecord withPresignedUrl(AnalysisRecord record) {
        String presignedUrl = s3PresignedUrlService.createReadUrl(record.objectKey());
        if (!StringUtils.hasText(presignedUrl)) {
            return record;
        }

        return new AnalysisRecord(
                record.objectKey(),
                record.savedAt(),
                presignedUrl,
                record.originalFileName(),
                record.fileSize(),
                record.userId(),
                record.latitude(),
                record.longitude(),
                record.aiAnalysis()
        );
    }

    private String getExtension(String fileName) {
        String extension = StringUtils.getFilenameExtension(fileName);
        if (!StringUtils.hasText(extension)) {
            throw new InvalidImageFileException("Image file extension is required.");
        }

        return extension.toLowerCase(Locale.ROOT);
    }
}
