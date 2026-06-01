package com.cracksensing.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cracksensing.dto.AnalysisRecord;
import com.cracksensing.service.S3UploadService;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:5173")
public class ImageUploadController {

    private final S3UploadService s3UploadService;

    public ImageUploadController(S3UploadService s3UploadService) {
        this.s3UploadService = s3UploadService;
    }

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public AnalysisRecord uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId
    ) {
        return s3UploadService.uploadImage(file, userId);
    }
}
