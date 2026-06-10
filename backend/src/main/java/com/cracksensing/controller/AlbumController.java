package com.cracksensing.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cracksensing.dto.AlbumDetailResponse;
import com.cracksensing.dto.AlbumSummaryResponse;
import com.cracksensing.service.AlbumQueryService;
import com.cracksensing.service.S3UploadService;
import com.cracksensing.service.WeaviateStorageService;

@RestController
@RequestMapping("/api/albums")
@CrossOrigin(origins = "http://localhost:5173")
public class AlbumController {

    private final AlbumQueryService albumQueryService;
    private final WeaviateStorageService weaviateStorageService;
    private final S3UploadService s3UploadService;

    public AlbumController(
            AlbumQueryService albumQueryService,
            WeaviateStorageService weaviateStorageService,
            S3UploadService s3UploadService
    ) {
        this.albumQueryService = albumQueryService;
        this.weaviateStorageService = weaviateStorageService;
        this.s3UploadService = s3UploadService;
    }

    @GetMapping("/detail")
    @ResponseStatus(HttpStatus.OK)
    public AlbumDetailResponse getAlbumDetail(@RequestParam String objectKey) {
        AlbumDetailResponse detail = albumQueryService.findByObjectKey(objectKey);
        if (detail == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Album detail not found.");
        }

        return detail;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<AlbumSummaryResponse> getAlbumList(
            @RequestParam(defaultValue = "demo-user-001") String userId,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return albumQueryService.findByUserId(userId, limit);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAlbum(
            @RequestParam String objectKey,
            @RequestParam(required = false) String userId
    ) {
        AlbumDetailResponse detail = albumQueryService.findByObjectKey(objectKey);
        if (detail == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Album detail not found.");
        }

        if (userId != null && !userId.equals(detail.userId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Album record does not belong to the user.");
        }

        boolean weaviateDeleted = weaviateStorageService.deleteByObjectKey(objectKey);
        boolean imageDeleted = s3UploadService.deleteImage(objectKey);

        if (!weaviateDeleted || !imageDeleted) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete album record.");
        }
    }
}
