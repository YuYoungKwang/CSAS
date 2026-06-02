package com.cracksensing.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cracksensing.dto.AlbumDetailResponse;
import com.cracksensing.dto.AlbumSummaryResponse;
import com.cracksensing.service.AlbumQueryService;

@RestController
@RequestMapping("/api/albums")
@CrossOrigin(origins = "http://localhost:5173")
public class AlbumController {

    private final AlbumQueryService albumQueryService;

    public AlbumController(AlbumQueryService albumQueryService) {
        this.albumQueryService = albumQueryService;
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
}
