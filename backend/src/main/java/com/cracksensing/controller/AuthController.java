package com.cracksensing.controller;

import com.cracksensing.dto.GoogleLoginRequest;
import com.cracksensing.dto.GoogleLoginResponse;
import com.cracksensing.service.GoogleAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final GoogleAuthService googleAuthService;

    public AuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google")
    @ResponseStatus(HttpStatus.OK)
    public GoogleLoginResponse loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        return googleAuthService.verifyCredential(request.credential());
    }
}
