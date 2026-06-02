package com.cracksensing.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cracksensing.dto.AnalysisRecord;
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
    public AnalysisRecord getAlbumDetail(@RequestParam String objectKey) {
        AnalysisRecord detail = albumQueryService.findByObjectKey(objectKey);
        if (detail == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Album detail not found.");
        }

        return detail;
    }
}
