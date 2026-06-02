package com.cracksensing.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import com.cracksensing.dto.ErrorResponse;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(InvalidImageFileException.class)
    public ResponseEntity<ErrorResponse> handleInvalidImageFile(
            InvalidImageFileException exception,
            HttpServletRequest request
    ) {
        log.warn("Invalid image upload request. path={}, message={}", request.getRequestURI(), exception.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    @ExceptionHandler(S3UploadException.class)
    public ResponseEntity<ErrorResponse> handleUploadFailure(
            S3UploadException exception,
            HttpServletRequest request
    ) {
        log.error("S3 upload failed. path={}, message={}", request.getRequestURI(), exception.getMessage(), exception);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Image upload failed while saving the file to S3.",
                request
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException exception,
            HttpServletRequest request
    ) {
        log.warn("Multipart upload rejected because file size exceeded limit. path={}, message={}", request.getRequestURI(), exception.getMessage());
        return buildErrorResponse(HttpStatus.PAYLOAD_TOO_LARGE, exception.getMessage(), request);
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameter(
            MissingServletRequestPartException exception,
            HttpServletRequest request
    ) {
        log.warn("Multipart upload rejected because file part is missing. path={}, message={}", request.getRequestURI(), exception.getMessage());
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Request must include a file part named 'file'.",
                request
        );
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ErrorResponse> handleMultipartException(
            MultipartException exception,
            HttpServletRequest request
    ) {
        log.warn("Multipart upload rejected because request format is invalid. path={}, message={}", request.getRequestURI(), exception.getMessage());
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Request must be sent as multipart/form-data.",
                request
        );
    }

    @ExceptionHandler(GoogleAuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleGoogleAuthenticationException(
            GoogleAuthenticationException exception,
            HttpServletRequest request
    ) {
        log.warn("Google authentication failed. path={}, message={}", request.getRequestURI(), exception.getMessage());
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, exception.getMessage(), request);
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request
    ) {
        ErrorResponse errorResponse = new ErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()
        );

        return ResponseEntity.status(status).body(errorResponse);
    }
}
