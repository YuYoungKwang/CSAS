package com.cracksensing.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.cracksensing.dto.ImageUploadResponse;
import com.cracksensing.exception.InvalidImageFileException;
import com.cracksensing.exception.S3UploadException;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
public class S3UploadService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png");
    private static final DateTimeFormatter DATE_PATH_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private static final ZoneId SEOUL_ZONE = ZoneId.of("Asia/Seoul");

    private final S3Client s3Client;
    private final String bucketName;

    public S3UploadService(
            S3Client s3Client,
            @Value("${s3.bucket-name}") String bucketName
    ) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    public ImageUploadResponse uploadImage(MultipartFile file) {
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

        return new ImageUploadResponse(objectKey, originalFileName, file.getSize());
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
        if (!StringUtils.hasText(contentType) || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new InvalidImageFileException("Only image/jpeg and image/png content types are allowed.");
        }
    }

    private String createObjectKey(String extension) {
        String datePath = LocalDate.now(SEOUL_ZONE).format(DATE_PATH_FORMATTER);
        return "images/%s/%s.%s".formatted(datePath, UUID.randomUUID(), extension);
    }

    private String getExtension(String fileName) {
        String extension = StringUtils.getFilenameExtension(fileName);
        if (!StringUtils.hasText(extension)) {
            throw new InvalidImageFileException("Image file extension is required.");
        }

        return extension.toLowerCase(Locale.ROOT);
    }
}
